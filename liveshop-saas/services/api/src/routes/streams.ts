import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createStreamSchema, updateStreamSchema, streamMessageSchema, paginationSchema, generateStreamKey } from '@liveshop/shared';
import { z } from 'zod';
import { liveKitService } from '../services/livekit';

const idParamSchema = z.object({ id: z.string().uuid() });

export async function streamRoutes(app: FastifyInstance) {
  // List active streams (public)
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { page, limit } = paginationSchema.parse(request.query);
    const skip = (page - 1) * limit;

    const streams = await app.prisma.liveStream.findMany({
      where: { status: 'live' },
      skip,
      take: limit,
      include: {
        store: {
          select: { id: true, name: true, slug: true, logoUrl: true },
        },
        host: {
          select: { id: true, profile: true },
        },
        _count: {
          select: { views: true },
        },
      },
      orderBy: { viewerCount: 'desc' },
    });

    reply.send({
      success: true,
      data: { streams },
    });
  });

  // Get stream by ID
  app.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);

    const stream = await app.prisma.liveStream.findUnique({
      where: { id },
      include: {
        store: {
          select: { id: true, name: true, slug: true, logoUrl: true, rating: true },
        },
        host: {
          select: { id: true, profile: true },
        },
        pinnedProducts: {
          include: {
            product: {
              select: { id: true, name: true, price: true, images: true },
            },
          },
          where: { unpinnedAt: null },
        },
        _count: {
          select: { views: true, messages: true },
        },
      },
    });

    if (!stream) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Stream not found' },
      });
    }

    reply.send({
      success: true,
      data: { stream },
    });
  });

  // Get LiveKit token for a stream
  app.get('/:id/token', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);
    const stream = await app.prisma.liveStream.findUnique({ where: { id } });

    if (!stream) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Stream not found' },
      });
    }

    // Determine if user is host or viewer
    const isHost = stream.hostId === request.user.id;
    const participantName = (request.user as any).profile?.firstName || 'User';

    // Generate token
    const token = await liveKitService.generateToken(id, participantName, isHost);

    reply.send({
      success: true,
      data: {
        token,
        liveKitUrl: process.env.LIVEKIT_URL || 'ws://localhost:7880'
      },
    });
  });

  // Create stream
  app.post('/', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = createStreamSchema.parse(request.body);
      const { storeId } = request.body as any;

      // Check authorization
      const membership = await app.prisma.storeMember.findFirst({
        where: {
          storeId,
          userId: request.user.id,
          OR: [
            { role: 'owner' },
            { permissions: { array_contains: 'streams' } },
          ],
        },
      });

      const userRole = (request.user as any).role;
      if (!membership && !['admin', 'super_admin'].includes(userRole)) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Not authorized to create streams for this store' },
        });
      }

      const streamKey = generateStreamKey();
      const roomId = `room_${Date.now()}`;

      const stream = await app.prisma.liveStream.create({
        data: {
          store: { connect: { id: storeId } },
          host: { connect: { id: (request.user as any).id } },
          title: data.title,
          description: data.description,
          type: data.type,
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
          streamKey,
          roomId,
          status: data.type === 'scheduled' ? 'scheduled' : 'live',
        },
      });

      reply.status(201).send({
        success: true,
        data: { stream },
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

  // Start stream (go live)
  app.post('/:id/start', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);

    const stream = await app.prisma.liveStream.findUnique({
      where: { id },
    });

    if (!stream) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Stream not found' },
      });
    }

    if (stream.hostId !== request.user.id && !['admin', 'super_admin'].includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to start this stream' },
      });
    }

    const updatedStream = await app.prisma.liveStream.update({
      where: { id },
      data: {
        status: 'live',
        startedAt: new Date(),
      },
    });

    // Notify followers (TODO: implement)
    app.io?.emit('stream-started', { streamId: id, storeId: stream.storeId });

    reply.send({
      success: true,
      data: { stream: updatedStream },
    });
  });

  // End stream
  app.post('/:id/end', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);

    const stream = await app.prisma.liveStream.findUnique({
      where: { id },
    });

    if (!stream) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Stream not found' },
      });
    }

    if (stream.hostId !== request.user.id && !['admin', 'super_admin'].includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to end this stream' },
      });
    }

    const duration = stream.startedAt
      ? Math.floor((Date.now() - stream.startedAt.getTime()) / 1000)
      : 0;

    const updatedStream = await app.prisma.liveStream.update({
      where: { id },
      data: {
        status: 'ended',
        endedAt: new Date(),
        duration,
      },
    });

    // Notify viewers
    app.io?.to(`stream:${id}`).emit('stream-ended', { streamId: id });

    reply.send({
      success: true,
      data: { stream: updatedStream },
    });
  });

  // Pin product to stream
  app.post('/:id/pin', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);
    const { productId, discountPercent, flashSale, flashSaleEndsAt } = request.body as any;

    const stream = await app.prisma.liveStream.findUnique({
      where: { id },
    });

    if (!stream) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Stream not found' },
      });
    }

    if (stream.hostId !== request.user.id && !['admin', 'super_admin'].includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized' },
      });
    }

    // Unpin any currently pinned product
    await app.prisma.streamPinnedProduct.updateMany({
      where: { streamId: id, unpinnedAt: null },
      data: { unpinnedAt: new Date() },
    });

    const pinnedProduct = await app.prisma.streamPinnedProduct.create({
      data: {
        streamId: id,
        productId,
        pinnedBy: request.user.id,
        discountPercent,
        flashSale: flashSale || false,
        flashSaleEndsAt: flashSaleEndsAt ? new Date(flashSaleEndsAt) : null,
      },
      include: {
        product: {
          select: { id: true, name: true, price: true, images: true },
        },
      },
    });

    // Notify viewers
    app.io?.to(`stream:${id}`).emit('product-pinned', pinnedProduct);

    reply.send({
      success: true,
      data: { pinnedProduct },
    });
  });

  // Get stream chat history
  app.get('/:id/chat', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);
    const { page, limit } = paginationSchema.parse(request.query);
    const skip = (page - 1) * limit;

    const messages = await app.prisma.streamMessage.findMany({
      where: { streamId: id, isDeleted: false },
      skip,
      take: limit,
      include: {
        user: {
          select: { id: true, profile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    reply.send({
      success: true,
      data: { messages: messages.reverse() },
    });
  });

  // Send chat message
  app.post('/:id/chat', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = idParamSchema.parse(request.params);
      const data = streamMessageSchema.parse(request.body);

      const stream = await app.prisma.liveStream.findUnique({
        where: { id },
      });

      if (!stream) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Stream not found' },
        });
      }

      if (stream.status !== 'live') {
        return reply.status(400).send({
          success: false,
          error: { code: 'STREAM_NOT_LIVE', message: 'Stream is not live' },
        });
      }

      const message = await app.prisma.streamMessage.create({
        data: {
          streamId: id,
          userId: request.user.id,
          type: data.type,
          content: data.content,
          metadata: data.metadata as any,
        },
        include: {
          user: {
            select: { id: true, profile: true },
          },
        },
      });

      // Broadcast to all viewers
      app.io?.to(`stream:${id}`).emit('new-message', message);

      reply.status(201).send({
        success: true,
        data: { message },
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
}
