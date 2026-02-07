import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { Server as SocketIOServer } from 'socket.io';

export async function setupSocketIO(app: FastifyInstance) {
  const io = new SocketIOServer(app.server, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? [/\.liveshop\.io$/]
        : ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
    },
    path: '/socket.io',
  });

  // Decorate app with io
  app.decorate('io', io);

  // Connection handling
  io.on('connection', (socket) => {
    app.log.info(`Socket connected: ${socket.id}`);

    // Join user room for personal notifications
    socket.on('join-user', (userId: string) => {
      socket.join(`user:${userId}`);
      app.log.info(`User ${userId} joined their room`);
    });

    // Join stream room
    socket.on('join-stream', (streamId: string) => {
      socket.join(`stream:${streamId}`);
      app.log.info(`Socket joined stream: ${streamId}`);
      
      // Broadcast viewer count update
      const room = io.sockets.adapter.rooms.get(`stream:${streamId}`);
      const viewerCount = room ? room.size : 0;
      io.to(`stream:${streamId}`).emit('viewer-count', viewerCount);
    });

    // Leave stream room
    socket.on('leave-stream', (streamId: string) => {
      socket.leave(`stream:${streamId}`);
      app.log.info(`Socket left stream: ${streamId}`);
      
      // Broadcast viewer count update
      const room = io.sockets.adapter.rooms.get(`stream:${streamId}`);
      const viewerCount = room ? room.size : 0;
      io.to(`stream:${streamId}`).emit('viewer-count', viewerCount);
    });

    // Stream chat message
    socket.on('stream-message', async (data: { streamId: string; message: any }) => {
      const { streamId, message } = data;
      
      // Save message to database
      try {
        await app.prisma.streamMessage.create({
          data: {
            streamId,
            userId: message.userId,
            type: message.type,
            content: message.content,
            metadata: message.metadata || {},
          },
        });
      } catch (err) {
        app.log.error('Failed to save stream message:', err);
      }

      // Broadcast to all viewers
      io.to(`stream:${streamId}`).emit('new-message', message);
    });

    // Stream reactions
    socket.on('stream-reaction', (data: { streamId: string; reaction: string }) => {
      const { streamId, reaction } = data;
      io.to(`stream:${streamId}`).emit('new-reaction', { reaction, socketId: socket.id });
    });

    // Driver location updates
    socket.on('driver-location', (data: { deliveryId: string; location: { lat: number; lng: number } }) => {
      const { deliveryId, location } = data;
      
      // Broadcast to customers tracking this delivery
      io.to(`delivery:${deliveryId}`).emit('location-update', location);
    });

    // Join delivery tracking room
    socket.on('track-delivery', (deliveryId: string) => {
      socket.join(`delivery:${deliveryId}`);
      app.log.info(`Socket joined delivery tracking: ${deliveryId}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      app.log.info(`Socket disconnected: ${socket.id}`);
    });
  });

  // Helper function to emit to specific users
  app.decorate('emitToUser', (userId: string, event: string, data: any) => {
    io.to(`user:${userId}`).emit(event, data);
  });

  // Helper function to emit to stream viewers
  app.decorate('emitToStream', (streamId: string, event: string, data: any) => {
    io.to(`stream:${streamId}`).emit(event, data);
  });

  app.log.info('Socket.IO initialized');
}
