import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

/**
 * Moyasar Payments Route
 *
 * Integration model:
 *  1. Frontend embeds the Moyasar JS Payment Form using NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY
 *  2. On success, Moyasar redirects to GET /payments/callback?id=<paymentId>&status=<status>
 *  3. This route server-side verifies the payment using the secret key and updates the order
 *
 * Currency: all amounts stored in SAR (Riyals), Moyasar API uses Halalas (SAR × 100)
 */

const MOYASAR_API = 'https://api.moyasar.com/v1';

function moyasarAuth() {
  const secretKey = process.env.MOYASAR_SECRET_KEY;
  if (!secretKey) {
    throw new Error('MOYASAR_SECRET_KEY is not configured');
  }
  return 'Basic ' + Buffer.from(`${secretKey}:`).toString('base64');
}

async function fetchMoyasarPayment(paymentId: string) {
  const res = await fetch(`${MOYASAR_API}/payments/${paymentId}`, {
    headers: { Authorization: moyasarAuth() },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Moyasar fetch payment failed: ${res.status} — ${err}`);
  }
  return res.json() as Promise<MoyasarPayment>;
}

interface MoyasarPayment {
  id: string;
  status: string; // initiated, paid, failed, authorized
  amount: number; // in Halalas
  currency: string;
  description: string;
  metadata: Record<string, string>;
  source: {
    type: string;
    company: string;
    name: string;
    number: string; // last 4 digits masked
    message?: string;
  };
  invoice_id?: string;
  created_at: string;
}

export async function paymentRoutes(app: FastifyInstance) {
  /**
   * GET /payments/config
   * Returns the publishable key for the frontend Moyasar form.
   * Called by the checkout page to initialize the form client-side.
   */
  app.get('/config', async (_request: FastifyRequest, reply: FastifyReply) => {
    const publishableKey = process.env.MOYASAR_PUBLISHABLE_KEY;
    if (!publishableKey) {
      return reply.status(503).send({
        success: false,
        error: { code: 'PAYMENT_NOT_CONFIGURED', message: 'Payment gateway not configured' },
      });
    }
    reply.send({
      success: true,
      data: {
        publishableKey,
        currency: 'SAR',
        gateway: 'moyasar',
      },
    });
  });

  /**
   * POST /payments/prepare
   * Creates a payment record tied to an order and returns the amount in Halalas
   * so the frontend can initialize the Moyasar form with the correct amount.
   */
  app.post(
    '/prepare',
    { onRequest: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const schema = z.object({ orderId: z.string().uuid() });
      const { orderId } = schema.parse(request.body);

      const order = await app.prisma.order.findUnique({
        where: { id: orderId },
        include: { customer: true },
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Order not found' },
        });
      }

      if (order.customerId !== request.user.id) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Not authorized' },
        });
      }

      if (order.paymentStatus !== 'pending') {
        return reply.status(400).send({
          success: false,
          error: { code: 'ALREADY_PAID', message: 'Order is already paid or being processed' },
        });
      }

      // Amount in Halalas (SAR × 100)
      const amountHalalas = Math.round(Number(order.totalAmount) * 100);

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const callbackUrl = `${appUrl}/checkout/confirm?orderId=${orderId}`;

      // Create a pending payment record in our DB
      const existingPayment = await app.prisma.payment.findFirst({
        where: { orderId, status: { in: ['pending', 'requires_confirmation'] } },
      });

      if (!existingPayment) {
        await app.prisma.payment.create({
          data: {
            orderId,
            amount: order.totalAmount,
            currency: 'SAR',
            status: 'pending',
          },
        });
      }

      reply.send({
        success: true,
        data: {
          amountHalalas,
          currency: 'SAR',
          description: `LiveShop Order ${order.orderNumber}`,
          callbackUrl,
          metadata: {
            orderId,
            orderNumber: order.orderNumber,
          },
        },
      });
    }
  );

  /**
   * POST /payments/callback
   * Called by our frontend after Moyasar redirects back (customer-triggered).
   * We ALWAYS server-side verify with Moyasar secret key before confirming.
   */
  app.post(
    '/callback',
    { onRequest: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const schema = z.object({
        moyasarPaymentId: z.string(),
        orderId: z.string().uuid(),
      });

      const { moyasarPaymentId, orderId } = schema.parse(request.body);

      // Server-side verify with Moyasar
      let moyasarPayment: MoyasarPayment;
      try {
        moyasarPayment = await fetchMoyasarPayment(moyasarPaymentId);
      } catch (err: any) {
        return reply.status(502).send({
          success: false,
          error: { code: 'PAYMENT_VERIFICATION_FAILED', message: err.message },
        });
      }

      // Verify the order matches
      const order = await app.prisma.order.findUnique({
        where: { id: orderId },
        include: { customer: { select: { id: true, email: true, profile: true } } },
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Order not found' },
        });
      }

      if (order.customerId !== request.user.id) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Not authorized' },
        });
      }

      // Verify amount matches (Halalas)
      const expectedHalalas = Math.round(Number(order.totalAmount) * 100);
      if (
        moyasarPayment.status !== 'paid' ||
        moyasarPayment.amount !== expectedHalalas ||
        moyasarPayment.currency.toUpperCase() !== 'SAR'
      ) {
        // Payment invalid — update records and return failure
        await app.prisma.payment.updateMany({
          where: { orderId },
          data: {
            status: 'failed',
            moyasarPaymentId: moyasarPayment.id,
            failureMessage: `Moyasar status: ${moyasarPayment.status}`,
          },
        });

        return reply.status(400).send({
          success: false,
          error: {
            code: 'PAYMENT_FAILED',
            message: moyasarPayment.source?.message || 'Payment was not successful',
          },
        });
      }

      // Payment verified — update our records
      await app.prisma.payment.updateMany({
        where: { orderId, status: { in: ['pending', 'requires_confirmation'] } },
        data: {
          status: 'succeeded',
          moyasarPaymentId: moyasarPayment.id,
          moyasarInvoiceKey: moyasarPayment.invoice_id,
          paymentMethodType: moyasarPayment.source?.type || 'card',
          paymentMethodDetails: {
            company: moyasarPayment.source?.company,
            number: moyasarPayment.source?.number,
            name: moyasarPayment.source?.name,
          } as any,
          capturedAt: new Date(),
        },
      });

      // Update order payment status
      const updatedOrder = await app.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'captured' },
      });

      // Notify store via socket
      app.io?.emit('order-paid', { orderId, storeId: order.storeId });

      // Send confirmation email (non-blocking)
      try {
        const { sendOrderConfirmationEmail } = await import('../services/email');
        const firstName = (order.customer.profile as any)?.firstName || '';
        const items = (order as any).items || [];
        await sendOrderConfirmationEmail(order.customer.email, firstName, {
          orderNumber: order.orderNumber,
          totalAmount: Number(order.totalAmount),
          currency: 'SAR',
          items: items.map((i: any) => ({
            name: i.name,
            quantity: i.quantity,
            total: i.total,
          })),
        });
      } catch (emailErr) {
        app.log.warn({ err: emailErr }, 'Failed to send order confirmation email');
      }

      reply.send({
        success: true,
        data: { order: updatedOrder, paymentId: moyasarPayment.id },
      });
    }
  );

  /**
   * POST /payments/refund
   * Store owner or admin can refund a captured payment.
   */
  app.post(
    '/refund',
    { onRequest: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const schema = z.object({
        orderId: z.string().uuid(),
        amount: z.number().positive().optional(),
        reason: z.string().optional(),
      });
      const { orderId, amount, reason } = schema.parse(request.body);

      const order = await app.prisma.order.findUnique({ where: { id: orderId } });
      if (!order) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Order not found' },
        });
      }

      // Only admin or store member can refund
      const membership = await app.prisma.storeMember.findFirst({
        where: { storeId: order.storeId, userId: request.user.id },
      });

      if (!membership && !['admin', 'super_admin'].includes(request.user.role)) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Not authorized' },
        });
      }

      const payment = await app.prisma.payment.findFirst({
        where: { orderId, status: 'succeeded' },
      });

      if (!payment?.moyasarPaymentId) {
        return reply.status(400).send({
          success: false,
          error: { code: 'PAYMENT_NOT_FOUND', message: 'No captured Moyasar payment found' },
        });
      }

      // Issue refund via Moyasar
      const refundAmountHalalas = amount
        ? Math.round(amount * 100)
        : Math.round(Number(payment.amount) * 100);

      const refundRes = await fetch(
        `${MOYASAR_API}/payments/${payment.moyasarPaymentId}/refund`,
        {
          method: 'POST',
          headers: {
            Authorization: moyasarAuth(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount: refundAmountHalalas }),
        }
      );

      if (!refundRes.ok) {
        const errText = await refundRes.text();
        return reply.status(502).send({
          success: false,
          error: { code: 'REFUND_FAILED', message: `Moyasar refund failed: ${errText}` },
        });
      }

      const refundData = (await refundRes.json()) as any;

      // Save refund record
      const refundRecord = await app.prisma.refund.create({
        data: {
          paymentId: payment.id,
          orderId,
          moyasarRefundId: refundData.id || payment.moyasarPaymentId,
          amount: amount ?? payment.amount,
          reason,
          status: 'succeeded',
          processedBy: request.user.id,
          processedAt: new Date(),
        },
      });

      const isFullRefund = !amount || amount >= Number(payment.amount);
      await app.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: isFullRefund ? 'refunded' : 'partially_refunded',
          status: isFullRefund ? 'refunded' : order.status,
        },
      });

      reply.send({
        success: true,
        data: { refundId: refundRecord.id },
      });
    }
  );

  /**
   * GET /payments/order/:orderId
   * Get payment status for an order (customer-facing).
   */
  app.get(
    '/order/:orderId',
    { onRequest: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { orderId } = request.params as { orderId: string };

      const order = await app.prisma.order.findUnique({ where: { id: orderId } });
      if (!order) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Order not found' },
        });
      }

      // Only the customer, store member, or admin
      const isAuthorized =
        order.customerId === request.user.id ||
        (await app.prisma.storeMember.findFirst({
          where: { storeId: order.storeId, userId: request.user.id },
        })) ||
        ['admin', 'super_admin'].includes(request.user.role);

      if (!isAuthorized) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Not authorized' },
        });
      }

      const payment = await app.prisma.payment.findFirst({
        where: { orderId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          amount: true,
          currency: true,
          moyasarPaymentId: true,
          paymentMethodType: true,
          capturedAt: true,
          createdAt: true,
        },
      });

      reply.send({
        success: true,
        data: { payment },
      });
    }
  );
}
