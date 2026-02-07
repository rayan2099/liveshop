import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createOrderSchema, paginationSchema, ORDER_STATUS, ORDER_STATUS_FLOW } from '@liveshop/shared';
import { z } from 'zod';

const idParamSchema = z.object({ id: z.string().uuid() });

export async function orderRoutes(app: FastifyInstance) {
  // Get my orders (customer)
  app.get('/my', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { page, limit, status } = paginationSchema.parse(request.query);
    const skip = (page - 1) * limit;

    const where: any = { customerId: request.user.id };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      app.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          store: { select: { id: true, name: true, logoUrl: true } },
          items: true,
          delivery: {
            select: { id: true, status: true, estimatedDeliveryAt: true, trackingData: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      app.prisma.order.count({ where }),
    ]);

    reply.send({
      success: true,
      data: {
        items: orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });
  });

  // Get store orders (store owner/staff)
  app.get('/store/:storeId', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { storeId } = request.params as { storeId: string };
    const { page, limit, status } = paginationSchema.parse(request.query);
    const skip = (page - 1) * limit;

    // Check authorization
    const membership = await app.prisma.storeMember.findFirst({
      where: { storeId, userId: request.user.id },
    });

    if (!membership && !['admin', 'super_admin'].includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized' },
      });
    }

    const where: any = { storeId };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      app.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: { select: { id: true, profile: true, phone: true } },
          items: true,
          delivery: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      app.prisma.order.count({ where }),
    ]);

    reply.send({
      success: true,
      data: {
        items: orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });
  });

  // Get order by ID
  app.get('/:id', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);

    const order = await app.prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, profile: true, phone: true } },
        store: { select: { id: true, name: true, logoUrl: true, address: true } },
        items: { include: { product: { select: { id: true, images: true } } } },
        delivery: true,
        timeline: { orderBy: { createdAt: 'asc' } },
        payments: true,
      },
    });

    if (!order) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Order not found' },
      });
    }

    // Check authorization
    const isAuthorized = 
      order.customerId === request.user.id ||
      (await app.prisma.storeMember.findFirst({ where: { storeId: order.storeId, userId: request.user.id } })) ||
      ['admin', 'super_admin'].includes(request.user.role);

    if (!isAuthorized) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized' },
      });
    }

    reply.send({
      success: true,
      data: { order },
    });
  });

  // Create order
  app.post('/', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = createOrderSchema.parse(request.body);

      // Validate items and calculate totals
      let subtotal = 0;
      const orderItems = [];

      for (const item of data.items) {
        const product = await app.prisma.product.findUnique({
          where: { id: item.productId },
          include: { store: true },
        });

        if (!product || !product.isActive) {
          return reply.status(400).send({
            success: false,
            error: { code: 'PRODUCT_NOT_FOUND', message: `Product ${item.productId} not found` },
          });
        }

        // Check inventory
        if (product.inventoryTracking && product.inventoryQuantity < item.quantity) {
          return reply.status(400).send({
            success: false,
            error: { code: 'INSUFFICIENT_INVENTORY', message: `Insufficient inventory for ${product.name}` },
          });
        }

        const variant = item.variantId 
          ? (product.variants as any[]).find((v: any) => v.id === item.variantId)
          : null;

        const price = variant ? variant.price : product.price;
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          productId: product.id,
          variantId: item.variantId,
          name: product.name,
          sku: variant?.sku || product.sku,
          image: variant?.image || product.images[0],
          quantity: item.quantity,
          unitPrice: price,
          total: itemTotal,
        });
      }

      // All items must be from the same store
      const storeIds = new Set(orderItems.map(item => 
        data.items.find(i => i.productId === item.productId)?.storeId
      ));
      
      // Get store from first product
      const firstProduct = await app.prisma.product.findUnique({
        where: { id: data.items[0].productId },
      });

      const taxRate = 0.08; // 8% tax
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + taxAmount;

      // Create order
      const order = await app.prisma.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}`,
          tenantId: request.user.tenantId,
          customerId: request.user.id,
          storeId: firstProduct!.storeId,
          subtotal,
          taxAmount,
          taxRate,
          totalAmount,
          items: orderItems as any,
          shippingAddress: data.shippingAddress as any,
          customerNote: data.customerNote,
        },
      });

      // Create timeline entry
      await app.prisma.orderTimeline.create({
        data: {
          orderId: order.id,
          status: ORDER_STATUS.PENDING,
          note: 'Order placed',
          actorId: request.user.id,
          actorType: 'customer',
        },
      });

      reply.status(201).send({
        success: true,
        data: { order },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors },
        });
      }
      throw error;
    }
  });

  // Update order status
  app.put('/:id/status', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);
    const { status, note } = request.body as any;

    const order = await app.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Order not found' },
      });
    }

    // Validate status transition
    const allowedTransitions = ORDER_STATUS_FLOW[order.status as keyof typeof ORDER_STATUS_FLOW] || [];
    if (!allowedTransitions.includes(status)) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_STATUS_TRANSITION', message: `Cannot transition from ${order.status} to ${status}` },
      });
    }

    // Check authorization based on new status
    let isAuthorized = false;
    if (['confirmed', 'preparing', 'ready_for_pickup'].includes(status)) {
      // Store actions
      const membership = await app.prisma.storeMember.findFirst({
        where: { storeId: order.storeId, userId: request.user.id },
      });
      isAuthorized = !!membership || ['admin', 'super_admin'].includes(request.user.role);
    } else if (['cancelled'].includes(status)) {
      // Customer or store can cancel
      isAuthorized = order.customerId === request.user.id || 
        !!(await app.prisma.storeMember.findFirst({ where: { storeId: order.storeId, userId: request.user.id } })) ||
        ['admin', 'super_admin'].includes(request.user.role);
    } else {
      isAuthorized = ['admin', 'super_admin'].includes(request.user.role);
    }

    if (!isAuthorized) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to update this order' },
      });
    }

    // Update order
    const updateData: any = { status };
    if (status === ORDER_STATUS.CONFIRMED) updateData.confirmedAt = new Date();
    if (status === ORDER_STATUS.PREPARING) updateData.preparingAt = new Date();
    if (status === ORDER_STATUS.READY_FOR_PICKUP) updateData.readyForPickupAt = new Date();
    if (status === ORDER_STATUS.CANCELLED) updateData.cancelledAt = new Date();

    const updatedOrder = await app.prisma.order.update({
      where: { id },
      data: updateData,
    });

    // Create timeline entry
    await app.prisma.orderTimeline.create({
      data: {
        orderId: id,
        status,
        note,
        actorId: request.user.id,
        actorType: request.user.role === 'customer' ? 'customer' : 'store_staff',
      },
    });

    // Notify customer
    app.emitToUser?.(order.customerId, 'order-update', { orderId: id, status });

    reply.send({
      success: true,
      data: { order: updatedOrder },
    });
  });
}
