import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

export async function notificationRoutes(app: FastifyInstance) {
  // Register push subscription
  app.post('/subscribe', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const schema = z.object({
      endpoint: z.string(),
      p256dh: z.string(),
      auth: z.string(),
      deviceType: z.string().optional(),
      deviceId: z.string().optional(),
    });

    try {
      const data = schema.parse(request.body);

      // Check if subscription already exists
      const existing = await app.prisma.pushSubscription.findUnique({
        where: { endpoint: data.endpoint },
      });

      if (existing) {
        // Update existing
        await app.prisma.pushSubscription.update({
          where: { id: existing.id },
          data: {
            userId: request.user.id,
            lastUsedAt: new Date(),
            isActive: true,
          },
        });
      } else {
        // Create new
        await app.prisma.pushSubscription.create({
          data: {
            userId: request.user.id,
            ...data,
          },
        });
      }

      reply.send({
        success: true,
        data: { message: 'Subscribed successfully' },
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

  // Unsubscribe from push notifications
  app.post('/unsubscribe', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const schema = z.object({ endpoint: z.string() });
    const { endpoint } = schema.parse(request.body);

    await app.prisma.pushSubscription.updateMany({
      where: { endpoint, userId: request.user.id },
      data: { isActive: false },
    });

    reply.send({
      success: true,
      data: { message: 'Unsubscribed successfully' },
    });
  });

  // Send test notification (admin only)
  app.post('/test', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    if (!['admin', 'super_admin'].includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Admin access required' },
      });
    }

    const schema = z.object({
      userId: z.string().uuid(),
      title: z.string(),
      body: z.string(),
    });

    const { userId, title, body } = schema.parse(request.body);

    // Create notification record
    const notification = await app.prisma.notification.create({
      data: {
        userId,
        type: 'test',
        title,
        body,
        channels: ['push', 'in_app'],
      },
    });

    // Send via socket
    app.emitToUser?.(userId, 'notification', notification);

    reply.send({
      success: true,
      data: { notification },
    });
  });
}
