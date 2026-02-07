import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { updateProfileSchema, addressSchema, paginationSchema } from '@liveshop/shared';
import { z } from 'zod';

const idParamSchema = z.object({ id: z.string().uuid() });

export async function userRoutes(app: FastifyInstance) {
  // Get all users (admin only)
  app.get('/', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    // Only admins can list all users
    if (!['admin', 'super_admin'].includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Admin access required' },
      });
    }

    const { page, limit } = paginationSchema.parse(request.query);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      app.prisma.user.findMany({
        where: { tenantId: request.user.tenantId },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          profile: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      app.prisma.user.count({ where: { tenantId: request.user.tenantId } }),
    ]);

    reply.send({
      success: true,
      data: {
        items: users,
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

  // Get user by ID
  app.get('/:id', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);

    // Users can only view their own profile, or admins can view any
    if (id !== request.user.id && !['admin', 'super_admin'].includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      });
    }

    const user = await app.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        profile: true,
        kycStatus: true,
        walletBalance: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }

    reply.send({
      success: true,
      data: { user },
    });
  });

  // Update profile
  app.put('/me', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = updateProfileSchema.parse(request.body);

      const user = await app.prisma.user.update({
        where: { id: request.user.id },
        data: {
          profile: {
            ...(await app.prisma.user.findUnique({
              where: { id: request.user.id },
              select: { profile: true },
            }))?.profile,
            ...data,
          },
        },
        select: {
          id: true,
          email: true,
          phone: true,
          role: true,
          profile: true,
          updatedAt: true,
        },
      });

      reply.send({
        success: true,
        data: { user },
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

  // Upload avatar
  app.post('/me/avatar', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await request.file();
    
    if (!data) {
      return reply.status(400).send({
        success: false,
        error: { code: 'NO_FILE', message: 'No file uploaded' },
      });
    }

    // TODO: Upload to S3/MinIO
    const avatarUrl = `https://placeholder.com/avatar/${request.user.id}`;

    await app.prisma.user.update({
      where: { id: request.user.id },
      data: {
        profile: {
          ...(await app.prisma.user.findUnique({
            where: { id: request.user.id },
            select: { profile: true },
          }))?.profile,
          avatar: avatarUrl,
        },
      },
    });

    reply.send({
      success: true,
      data: { avatarUrl },
    });
  });

  // ========== ADDRESSES ==========

  // Get addresses
  app.get('/me/addresses', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const addresses = await app.prisma.address.findMany({
      where: { userId: request.user.id },
      orderBy: { isDefault: 'desc' },
    });

    reply.send({
      success: true,
      data: { addresses },
    });
  });

  // Add address
  app.post('/me/addresses', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = addressSchema.parse(request.body);

      // If setting as default, unset other defaults
      if (data.isDefault) {
        await app.prisma.address.updateMany({
          where: { userId: request.user.id },
          data: { isDefault: false },
        });
      }

      const address = await app.prisma.address.create({
        data: {
          userId: request.user.id,
          ...data,
        },
      });

      reply.status(201).send({
        success: true,
        data: { address },
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

  // Update address
  app.put('/me/addresses/:id', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = idParamSchema.parse(request.params);
      const data = addressSchema.partial().parse(request.body);

      // Verify address belongs to user
      const existingAddress = await app.prisma.address.findFirst({
        where: { id, userId: request.user.id },
      });

      if (!existingAddress) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Address not found' },
        });
      }

      // If setting as default, unset other defaults
      if (data.isDefault) {
        await app.prisma.address.updateMany({
          where: { userId: request.user.id },
          data: { isDefault: false },
        });
      }

      const address = await app.prisma.address.update({
        where: { id },
        data,
      });

      reply.send({
        success: true,
        data: { address },
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

  // Delete address
  app.delete('/me/addresses/:id', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);

    // Verify address belongs to user
    const existingAddress = await app.prisma.address.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!existingAddress) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Address not found' },
      });
    }

    await app.prisma.address.delete({ where: { id } });

    reply.send({
      success: true,
      data: { message: 'Address deleted' },
    });
  });

  // ========== PAYMENT METHODS ==========

  // Get payment methods
  app.get('/me/payment-methods', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const methods = await app.prisma.paymentMethod.findMany({
      where: { userId: request.user.id },
      orderBy: { isDefault: 'desc' },
    });

    reply.send({
      success: true,
      data: { methods },
    });
  });

  // Add payment method (Stripe)
  app.post('/me/payment-methods', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const schema = z.object({
      paymentMethodId: z.string(),
    });

    try {
      const { paymentMethodId } = schema.parse(request.body);

      // TODO: Integrate with Stripe to attach payment method
      // For now, create a placeholder
      const method = await app.prisma.paymentMethod.create({
        data: {
          userId: request.user.id,
          stripeId: paymentMethodId,
          type: 'card',
          last4: '4242',
          brand: 'visa',
          expMonth: 12,
          expYear: 2025,
        },
      });

      reply.status(201).send({
        success: true,
        data: { method },
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

  // Delete payment method
  app.delete('/me/payment-methods/:id', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);

    const method = await app.prisma.paymentMethod.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!method) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Payment method not found' },
      });
    }

    await app.prisma.paymentMethod.delete({ where: { id } });

    reply.send({
      success: true,
      data: { message: 'Payment method deleted' },
    });
  });

  // ========== NOTIFICATIONS ==========

  // Get notifications
  app.get('/me/notifications', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { page, limit } = paginationSchema.parse(request.query);
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      app.prisma.notification.findMany({
        where: { userId: request.user.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      app.prisma.notification.count({ where: { userId: request.user.id } }),
    ]);

    const unreadCount = await app.prisma.notification.count({
      where: { userId: request.user.id, isRead: false },
    });

    reply.send({
      success: true,
      data: {
        items: notifications,
        unreadCount,
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

  // Mark notification as read
  app.put('/me/notifications/:id/read', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);

    const notification = await app.prisma.notification.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!notification) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Notification not found' },
      });
    }

    await app.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });

    reply.send({
      success: true,
      data: { message: 'Notification marked as read' },
    });
  });

  // Mark all notifications as read
  app.put('/me/notifications/read-all', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    await app.prisma.notification.updateMany({
      where: { userId: request.user.id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    reply.send({
      success: true,
      data: { message: 'All notifications marked as read' },
    });
  });
}
