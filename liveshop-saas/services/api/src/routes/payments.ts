import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import Stripe from 'stripe';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function paymentRoutes(app: FastifyInstance) {
  // Create payment intent for order
  app.post('/create-intent', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
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

    // Get or create Stripe customer
    let stripeCustomerId = order.customer.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: order.customer.email,
        metadata: { userId: order.customerId },
      });
      stripeCustomerId = customer.id;
      await app.prisma.user.update({
        where: { id: order.customerId },
        data: { stripeCustomerId },
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: order.currency.toLowerCase(),
      customer: stripeCustomerId,
      automatic_payment_methods: { enabled: true },
      capture_method: 'manual', // Hold for escrow
      metadata: { orderId: order.id },
    });

    // Create payment record
    await app.prisma.payment.create({
      data: {
        orderId: order.id,
        stripePaymentIntentId: paymentIntent.id,
        amount: order.totalAmount,
        currency: order.currency,
        status: 'requires_confirmation',
      },
    });

    reply.send({
      success: true,
      data: { clientSecret: paymentIntent.client_secret },
    });
  });

  // Capture payment (when driver picks up)
  app.post('/capture', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const schema = z.object({ orderId: z.string().uuid() });
    const { orderId } = schema.parse(request.body);

    const order = await app.prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true },
    });

    if (!order) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Order not found' },
      });
    }

    // Check authorization (store staff or admin)
    const membership = await app.prisma.storeMember.findFirst({
      where: { storeId: order.storeId, userId: request.user.id },
    });

    if (!membership && !['admin', 'super_admin'].includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized' },
      });
    }

    // Find payment intent
    const payment = await app.prisma.payment.findFirst({
      where: { orderId, status: 'requires_confirmation' },
    });

    if (!payment?.stripePaymentIntentId) {
      return reply.status(400).send({
        success: false,
        error: { code: 'PAYMENT_NOT_FOUND', message: 'No pending payment found' },
      });
    }

    // Capture payment
    const capturedIntent = await stripe.paymentIntents.capture(payment.stripePaymentIntentId);

    // Update payment record
    await app.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'succeeded',
        stripeChargeId: capturedIntent.latest_charge as string,
        capturedAt: new Date(),
      },
    });

    // Update order
    await app.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'captured' },
    });

    reply.send({
      success: true,
      data: { message: 'Payment captured' },
    });
  });

  // Refund payment
  app.post('/refund', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const schema = z.object({ 
      orderId: z.string().uuid(),
      amount: z.number().optional(),
      reason: z.string().optional(),
    });
    const { orderId, amount, reason } = schema.parse(request.body);

    const order = await app.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Order not found' },
      });
    }

    // Only admin or store can refund
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

    if (!payment?.stripeChargeId) {
      return reply.status(400).send({
        success: false,
        error: { code: 'PAYMENT_NOT_FOUND', message: 'No captured payment found' },
      });
    }

    // Create refund
    const refund = await stripe.refunds.create({
      charge: payment.stripeChargeId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: 'requested_by_customer',
    });

    // Create refund record
    await app.prisma.refund.create({
      data: {
        paymentId: payment.id,
        orderId,
        stripeRefundId: refund.id,
        amount: amount || payment.amount,
        reason,
        status: 'succeeded',
        processedBy: request.user.id,
        processedAt: new Date(),
      },
    });

    // Update order
    await app.prisma.order.update({
      where: { id: orderId },
      data: { 
        paymentStatus: amount && amount < payment.amount ? 'partially_refunded' : 'refunded',
        status: 'refunded',
      },
    });

    reply.send({
      success: true,
      data: { refundId: refund.id },
    });
  });

  // Stripe webhook
  app.post('/webhook', async (request: FastifyRequest, reply: FastifyReply) => {
    const sig = request.headers['stripe-signature'] as string;
    const payload = request.body as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      return reply.status(400).send({ error: `Webhook Error: ${err.message}` });
    }

    // Handle events
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedIntent);
        break;

      case 'account.updated':
        // Handle Connect account updates
        break;
    }

    reply.send({ received: true });
  });

  async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) return;

    await app.prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { status: 'succeeded', stripeChargeId: paymentIntent.latest_charge as string },
    });

    await app.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'captured' },
    });
  }

  async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    await app.prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { 
        status: 'failed',
        failureMessage: paymentIntent.last_payment_error?.message,
      },
    });
  }
}
