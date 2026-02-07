import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { driverLocationSchema, DELIVERY_STATUS, DELIVERY_STATUS_FLOW } from '@liveshop/shared';
import { z } from 'zod';

const idParamSchema = z.object({ id: z.string().uuid() });

export async function deliveryRoutes(app: FastifyInstance) {
  // Get available deliveries (for drivers)
  app.get('/available', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.user.role !== 'driver') {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Driver access required' },
      });
    }

    const { lat, lng, radius = 10 } = request.query as any;

    // Get pending deliveries near driver
    const deliveries = await app.prisma.delivery.findMany({
      where: {
        status: 'pending',
        driverId: null,
      },
      include: {
        order: {
          include: {
            store: { select: { id: true, name: true, address: true } },
            items: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    reply.send({
      success: true,
      data: { deliveries },
    });
  });

  // Get my deliveries (driver)
  app.get('/my', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.user.role !== 'driver') {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Driver access required' },
      });
    }

    const { status } = request.query as any;

    const where: any = { driverId: request.user.id };
    if (status) where.status = status;

    const deliveries = await app.prisma.delivery.findMany({
      where,
      include: {
        order: {
          include: {
            store: { select: { id: true, name: true, address: true } },
            customer: { select: { id: true, profile: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    reply.send({
      success: true,
      data: { deliveries },
    });
  });

  // Get delivery by ID
  app.get('/:id', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);

    const delivery = await app.prisma.delivery.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            store: { select: { id: true, name: true, address: true } },
            customer: { select: { id: true, profile: true, phone: true } },
            items: true,
          },
        },
        driver: { select: { id: true, profile: true, phone: true } },
      },
    });

    if (!delivery) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Delivery not found' },
      });
    }

    // Check authorization
    const isAuthorized = 
      delivery.order.customerId === request.user.id ||
      delivery.driverId === request.user.id ||
      (await app.prisma.storeMember.findFirst({ where: { storeId: delivery.order.storeId, userId: request.user.id } })) ||
      ['admin', 'super_admin'].includes(request.user.role);

    if (!isAuthorized) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized' },
      });
    }

    reply.send({
      success: true,
      data: { delivery },
    });
  });

  // Accept delivery (driver)
  app.post('/:id/accept', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);

    if (request.user.role !== 'driver') {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Driver access required' },
      });
    }

    const delivery = await app.prisma.delivery.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!delivery) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Delivery not found' },
      });
    }

    if (delivery.status !== 'pending' && delivery.status !== 'searching_driver') {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Delivery not available for acceptance' },
      });
    }

    const updatedDelivery = await app.prisma.delivery.update({
      where: { id },
      data: {
        driverId: request.user.id,
        status: 'driver_accepted',
        acceptedAt: new Date(),
      },
    });

    // Update order status
    await app.prisma.order.update({
      where: { id: delivery.orderId },
      data: { status: 'picked_up' },
    });

    // Notify customer
    app.emitToUser?.(delivery.order.customerId, 'delivery-assigned', { deliveryId: id });

    reply.send({
      success: true,
      data: { delivery: updatedDelivery },
    });
  });

  // Update delivery status
  app.put('/:id/status', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);
    const { status, location } = request.body as any;

    const delivery = await app.prisma.delivery.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!delivery) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Delivery not found' },
      });
    }

    // Only assigned driver or admin can update
    if (delivery.driverId !== request.user.id && !['admin', 'super_admin'].includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized' },
      });
    }

    // Validate status transition
    const allowedTransitions = DELIVERY_STATUS_FLOW[delivery.status as keyof typeof DELIVERY_STATUS_FLOW] || [];
    if (!allowedTransitions.includes(status)) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_STATUS_TRANSITION', message: `Cannot transition from ${delivery.status} to ${status}` },
      });
    }

    // Update delivery
    const updateData: any = { status };
    if (status === 'at_pickup') updateData.atPickupAt = new Date();
    if (status === 'picked_up') updateData.pickedUpAt = new Date();
    if (status === 'delivered') updateData.deliveredAt = new Date();

    if (location) {
      const trackingData = (delivery.trackingData as any[]) || [];
      trackingData.push({ ...location, timestamp: new Date().toISOString() });
      updateData.trackingData = trackingData;
    }

    const updatedDelivery = await app.prisma.delivery.update({
      where: { id },
      data: updateData,
    });

    // Update order status if delivered
    if (status === 'delivered') {
      await app.prisma.order.update({
        where: { id: delivery.orderId },
        data: { status: 'delivered', deliveredAt: new Date() },
      });
    }

    // Notify customer
    app.emitToUser?.(delivery.order.customerId, 'delivery-update', { deliveryId: id, status, location });

    reply.send({
      success: true,
      data: { delivery: updatedDelivery },
    });
  });

  // Update driver location
  app.put('/location', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (request.user.role !== 'driver') {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Driver access required' },
        });
      }

      const data = driverLocationSchema.parse(request.body);

      // Update driver profile location
      await app.prisma.driverProfile.update({
        where: { userId: request.user.id },
        data: {
          currentLocation: { lat: data.lat, lng: data.lng },
          isOnline: true,
        },
      });

      // Find active delivery and update tracking
      const delivery = await app.prisma.delivery.findFirst({
        where: {
          driverId: request.user.id,
          status: { in: ['picked_up', 'in_transit'] },
        },
      });

      if (delivery) {
        const trackingData = (delivery.trackingData as any[]) || [];
        trackingData.push({
          lat: data.lat,
          lng: data.lng,
          heading: data.heading,
          speed: data.speed,
          accuracy: data.accuracy,
          timestamp: new Date().toISOString(),
        });

        await app.prisma.delivery.update({
          where: { id: delivery.id },
          data: { trackingData },
        });

        // Notify customer of location update
        app.io?.to(`delivery:${delivery.id}`).emit('location-update', {
          lat: data.lat,
          lng: data.lng,
          heading: data.heading,
        });
      }

      reply.send({
        success: true,
        data: { message: 'Location updated' },
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

  // Toggle driver availability
  app.post('/toggle-availability', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.user.role !== 'driver') {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Driver access required' },
      });
    }

    const profile = await app.prisma.driverProfile.findUnique({
      where: { userId: request.user.id },
    });

    if (!profile) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Driver profile not found' },
      });
    }

    const updatedProfile = await app.prisma.driverProfile.update({
      where: { userId: request.user.id },
      data: {
        isOnline: !profile.isOnline,
        lastOnlineAt: new Date(),
      },
    });

    reply.send({
      success: true,
      data: { isOnline: updatedProfile.isOnline },
    });
  });
}
