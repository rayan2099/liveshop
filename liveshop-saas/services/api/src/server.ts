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
import { randomUUID } from 'crypto';
import client from 'prom-client';

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
    emitToUser: (userId: string, event: string, data: any) => void;
    emitToStream: (streamId: string, event: string, data: any) => void;
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
    // Prometheus metrics setup
    const register = new client.Registry();
    client.collectDefaultMetrics({ register });

    const httpRequests = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code', 'tenant_id', 'user_id'],
      registers: [register],
    });

    const httpDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'tenant_id', 'user_id'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.3, 0.5, 1, 2.5, 5, 10],
      registers: [register],
    });

    // Expose /metrics
    app.get('/metrics', async (_request, reply) => {
      try {
        reply.header('Content-Type', register.contentType);
        const metrics = await register.metrics();
        return reply.send(metrics);
      } catch (err) {
        app.log.error({ err }, 'Failed to collect metrics');
        return reply.status(500).send('error');
      }
    });

    // Request id + structured logging + metrics hooks
    app.addHook('onRequest', async (request, _reply) => {
      const reqId = (request.headers['x-request-id'] as string) || randomUUID();
      // Attach request id header for downstream
      (request.headers as any)['x-request-id'] = reqId;

      // Pull user/tenant info if available from auth decoration
      const userId = (request.user && (request.user as any).id) || 'anonymous';
      const tenantId = (request.user && (request.user as any).tenantId) || 'unknown';

      // Attach structured context to request logger
      try {
        request.log = request.log.child({ requestId: reqId, userId, tenantId });
      } catch (e) {
        // if child logger isn't supported, ignore
      }
      // start timer for duration
      (request as any)._startAt = process.hrtime();
    });

    app.addHook('onResponse', async (request, reply) => {
      const route = (request.routerPath || request.url) as string;
      const method = request.method;
      const status = String(reply.statusCode || 0);

      // Observe duration
      const startAt = (request as any)._startAt as [number, number] | undefined;
      if (startAt) {
        const diff = process.hrtime(startAt);
        const durationSeconds = diff[0] + diff[1] / 1e9;
        httpDuration.labels(method, route, (request.user && (request.user as any).tenantId) || 'unknown', (request.user && (request.user as any).id) || 'anonymous').observe(durationSeconds);
      }

      httpRequests.labels(method, route, status, (request.user && (request.user as any).tenantId) || 'unknown', (request.user && (request.user as any).id) || 'anonymous').inc();
    });

    // Security headers
    app.addHook('onSend', async (_request, reply) => {
      reply.header('X-Content-Type-Options', 'nosniff');
      reply.header('X-Frame-Options', 'DENY');
      reply.header('X-XSS-Protection', '1; mode=block');
      reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
      if (process.env.NODE_ENV === 'production') {
        reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      }
    });

    // Security: Refuse to start in production with default secrets
    const jwtSecret = process.env.JWT_SECRET;
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      if (!jwtSecret || jwtSecret === 'your-super-secret-jwt-key-change-in-production') {
        throw new Error('CRITICAL: JWT_SECRET must be set to a secure value in production.');
      }
      if (!process.env.MOYASAR_SECRET_KEY) {
        throw new Error('CRITICAL: MOYASAR_SECRET_KEY must be set in production.');
      }
    } else {
      if (!jwtSecret || jwtSecret === 'your-super-secret-jwt-key-change-in-production') {
        app.log.warn('⚠️ Using default JWT_SECRET. NOT SECURE for production.');
      }
    }

    // Register plugins
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    await app.register(cors, {
      origin: isProduction
        ? [appUrl, /\.liveshop\.io$/]
        : [appUrl, 'http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
    });

    await app.register(jwt, {
      secret: jwtSecret || 'supersecret',
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
      app.log.error({ err: error }, 'Request error');

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

      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : error.message,
        },
      });
      return;
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
    const port = parseInt(process.env.PORT || process.env.API_PORT || '3001');
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
