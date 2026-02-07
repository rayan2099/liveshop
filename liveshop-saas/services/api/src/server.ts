import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import websocket from '@fastify/websocket';
import { PrismaClient } from '@liveshop/shared';
import { setupSocketIO } from './plugins/socketio';
import { authPlugin } from './plugins/auth';

// Import routes
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { storeRoutes } from './routes/stores';
import { productRoutes } from './routes/products';
import { streamRoutes } from './routes/streams';
import { orderRoutes } from './routes/orders';
import { deliveryRoutes } from './routes/deliveries';
import { paymentRoutes } from './routes/payments';
import { notificationRoutes } from './routes/notifications';

// Extend Fastify types
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    io: any;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    user: {
      id: string;
      email: string;
      role: string;
      tenantId: string;
    };
  }
}

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

async function start() {
  try {
    // Register plugins
    await app.register(cors, {
      origin: process.env.NODE_ENV === 'production'
        ? [/\.liveshop\.io$/]
        : ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
    });

    await app.register(jwt, {
      secret: process.env.JWT_SECRET || 'supersecret',
      decode: { complete: true },
    });

    await app.register(multipart, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 5,
      },
    });

    await app.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute',
    });

    await app.register(websocket);

    // Setup Socket.IO
    await setupSocketIO(app);

    // Decorate with prisma
    app.decorate('prisma', prisma);

    // Register auth plugin
    await app.register(authPlugin);

    // Register routes
    await app.register(authRoutes, { prefix: '/auth' });
    await app.register(userRoutes, { prefix: '/users' });
    await app.register(storeRoutes, { prefix: '/stores' });
    await app.register(productRoutes, { prefix: '/products' });
    await app.register(streamRoutes, { prefix: '/streams' });
    await app.register(orderRoutes, { prefix: '/orders' });
    await app.register(deliveryRoutes, { prefix: '/deliveries' });
    await app.register(paymentRoutes, { prefix: '/payments' });
    await app.register(notificationRoutes, { prefix: '/notifications' });

    // Health check
    app.get('/health', async () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '0.0.1',
      };
    });

    // Error handler
    app.setErrorHandler((error, request, reply) => {
      app.log.error(error);

      if (error.validation) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.validation,
          },
        });
      }

      if (error.statusCode === 401) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
      }

      if (error.statusCode === 403) {
        return reply.status(403).send({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied',
          },
        });
      }

      if (error.statusCode === 404) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Resource not found',
          },
        });
      }

      reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : error.message,
        },
      });
    });

    // Not found handler
    app.setNotFoundHandler((request, reply) => {
      reply.status(404).send({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Route ${request.method} ${request.url} not found`,
        },
      });
    });

    // Start server
    const port = parseInt(process.env.API_PORT || '3001');
    await app.listen({ port, host: '0.0.0.0' });

    app.log.info(`🚀 API server running on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  app.log.info('SIGTERM received, closing server...');
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  app.log.info('SIGINT received, closing server...');
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
});

start();
