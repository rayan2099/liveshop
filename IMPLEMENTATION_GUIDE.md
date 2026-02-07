# LiveShop SaaS - Implementation Guide

## Quick Start (30 minutes to running locally)

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Stripe account (test mode)
- Twilio account (optional, for SMS)

### Step 1: Project Bootstrap

```bash
# Create project directory
mkdir liveshop-saas && cd liveshop-saas

# Initialize with Turborepo
npx create-turbo@latest . --use-npm --example basic

# Install additional tools
npm install -g @prisma/client turbo
```

### Step 2: Setup Workspace Structure

```bash
# Create directories
mkdir -p apps/web apps/admin services/api services/streaming packages/shared packages/ui

# Root package.json
```

### Step 3: Database Setup

```bash
# Create docker-compose.yml for local dev
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: liveshop
      POSTGRES_PASSWORD: liveshop
      POSTGRES_DB: liveshop
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minio
      MINIO_ROOT_PASSWORD: minio123
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  minio_data:
EOF

docker-compose up -d
```

### Step 4: Initialize Prisma

```bash
cd packages/shared
npm init -y
npm install prisma @prisma/client
npx prisma init

# Create schema.prisma with our full schema
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// [Paste full schema from SAAS_ARCHITECTURE.md]
EOF

npx prisma migrate dev --name init
npx prisma generate
```

### Step 5: API Service (Fastify)

```bash
cd services/api
npm init -y
npm install fastify @fastify/cors @fastify/jwt @fastify/websocket prisma @prisma/client zod stripe bullmq ioredis
npm install -D typescript @types/node ts-node nodemon

# tsconfig.json
npx tsc --init
```

**services/api/src/server.ts:**
```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import { PrismaClient } from '@prisma/client';
import { authRoutes } from './routes/auth';
import { storeRoutes } from './routes/stores';
import { streamRoutes } from './routes/streams';
import { orderRoutes } from './routes/orders';
import { deliveryRoutes } from './routes/deliveries';

const prisma = new PrismaClient();
const app = Fastify({ logger: true });

// Plugins
app.register(cors, { origin: true, credentials: true });
app.register(jwt, { secret: process.env.JWT_SECRET! });
app.register(websocket);

// Decorate with prisma
app.decorate('prisma', prisma);

// Auth hook
app.addHook('onRequest', async (request, reply) => {
  const publicRoutes = ['/auth/login', '/auth/register', '/health'];
  if (publicRoutes.some(r => request.url.startsWith(r))) return;
  
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// Routes
app.register(authRoutes, { prefix: '/auth' });
app.register(storeRoutes, { prefix: '/stores' });
app.register(streamRoutes, { prefix: '/streams' });
app.register(orderRoutes, { prefix: '/orders' });
app.register(deliveryRoutes, { prefix: '/deliveries' });

// WebSocket for real-time
app.register(async function (app) {
  app.get('/ws', { websocket: true }, (socket, req) => {
    socket.on('message', (message) => {
      // Handle real-time events
      app.log.info('WS message:', message.toString());
    });
  });
});

// Health check
app.get('/health', async () => ({ status: 'ok' }));

// Start
const start = async () => {
  try {
    await app.listen({ port: 3001, host: '0.0.0.0' });
    app.log.info('Server running on http://localhost:3001');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
```

### Step 6: Next.js Web App

```bash
cd apps/web
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Install additional packages
npm install @tanstack/react-query zustand axios socket.io-client date-fns react-hook-form @hookform/resolvers zod
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-toast
```

**apps/web/src/lib/api.ts:**
```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**apps/web/src/app/(store)/dashboard/page.tsx:**
```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { StreamCard } from '@/components/streams/StreamCard';
import { OrderList } from '@/components/orders/OrderList';
import { AnalyticsWidget } from '@/components/analytics/AnalyticsWidget';

export default function StoreDashboard() {
  const { data: streams } = useQuery({
    queryKey: ['streams'],
    queryFn: () => api.get('/stores/my-streams').then(r => r.data),
  });

  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get('/stores/my-orders').then(r => r.data),
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Store Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnalyticsWidget 
          title="Today's Revenue" 
          value="$2,450" 
          change="+12%" 
        />
        <AnalyticsWidget 
          title="Active Orders" 
          value="23" 
          change="+5" 
        />
        <AnalyticsWidget 
          title="Live Viewers" 
          value="1,234" 
          change="+89" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Your Streams</h2>
          <div className="space-y-4">
            {streams?.map((stream: any) => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          <OrderList orders={orders || []} />
        </div>
      </div>
    </div>
  );
}
```

### Step 7: WebRTC Streaming Service

```bash
cd services/streaming
npm init -y
npm install mediasoup socket.io express
```

**services/streaming/src/server.ts:**
```typescript
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import * as mediasoup from 'mediasoup';

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Mediasoup workers
const workers: mediasoup.types.Worker[] = [];
let workerIdx = 0;

const createWorkers = async () => {
  const numWorkers = require('os').cpus().length;
  for (let i = 0; i < numWorkers; i++) {
    const worker = await mediasoup.createWorker({
      logLevel: 'warn',
      rtcMinPort: 10000,
      rtcMaxPort: 10100,
    });
    workers.push(worker);
  }
};

const getWorker = () => {
  const worker = workers[workerIdx];
  workerIdx = (workerIdx + 1) % workers.length;
  return worker;
};

// Rooms map
const rooms = new Map<string, {
  router: mediasoup.types.Router;
  producers: Map<string, mediasoup.types.Producer>;
  consumers: Map<string, mediasoup.types.Consumer>;
}>();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', async ({ roomId }, callback) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      const worker = getWorker();
      const router = await worker.createRouter({
        mediaCodecs: [
          {
            kind: 'audio',
            mimeType: 'audio/opus',
            clockRate: 48000,
            channels: 2,
          },
          {
            kind: 'video',
            mimeType: 'video/VP8',
            clockRate: 90000,
          },
        ],
      });
      rooms.set(roomId, { router, producers: new Map(), consumers: new Map() });
    }

    const room = rooms.get(roomId)!;
    const rtpCapabilities = room.router.rtpCapabilities;
    
    callback({ rtpCapabilities });
  });

  socket.on('create-transport', async ({ roomId, direction }, callback) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const transport = await room.router.createWebRtcTransport({
      listenIps: [{ ip: '0.0.0.0', announcedIp: process.env.PUBLIC_IP }],
      enableUdp: true,
      enableTcp: true,
    });

    callback({
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start
const PORT = process.env.PORT || 3002;
createWorkers().then(() => {
  server.listen(PORT, () => {
    console.log(`Streaming server on port ${PORT}`);
  });
});
```

---

## Key Implementation Patterns

### 1. Authentication Middleware
```typescript
// services/api/src/plugins/auth.ts
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export default fp(async (app: FastifyInstance) => {
  app.decorate('authenticate', async (request: any, reply: any) => {
    try {
      const decoded = await request.jwtVerify();
      const user = await app.prisma.user.findUnique({
        where: { id: decoded.userId },
      });
      if (!user) throw new Error('User not found');
      request.user = user;
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });
});
```

### 2. Order Creation with Payment
```typescript
// services/api/src/routes/orders.ts
import { FastifyInstance } from 'fastify';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function orderRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const { items, shippingAddress, paymentMethodId } = request.body as any;
    const userId = request.user.id;

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );
    const total = subtotal * 1.08; // 8% tax

    // Create order
    const order = await app.prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        customerId: userId,
        storeId: items[0].storeId,
        subtotal,
        taxAmount: subtotal * 0.08,
        totalAmount: total,
        items: JSON.stringify(items),
        shippingAddress: JSON.stringify(shippingAddress),
        status: 'pending',
        paymentStatus: 'pending',
      },
    });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'usd',
      customer: request.user.stripeCustomerId,
      payment_method: paymentMethodId,
      confirm: true,
      capture_method: 'manual', // Hold for escrow
      metadata: { orderId: order.id },
    });

    // Update order
    await app.prisma.order.update({
      where: { id: order.id },
      data: { 
        paymentStatus: paymentIntent.status === 'requires_capture' ? 'authorized' : 'failed',
      },
    });

    return { order, clientSecret: paymentIntent.client_secret };
  });

  // Capture payment when driver picks up
  app.post('/:id/capture', async (request, reply) => {
    const { id } = request.params as any;
    
    const order = await app.prisma.order.findUnique({ where: { id } });
    if (!order) return reply.status(404).send({ error: 'Order not found' });

    // Get payment intent
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 1,
      metadata: { orderId: id },
    });

    if (paymentIntents.data.length > 0) {
      await stripe.paymentIntents.capture(paymentIntents.data[0].id);
    }

    await app.prisma.order.update({
      where: { id },
      data: { paymentStatus: 'captured', status: 'preparing' },
    });

    return { success: true };
  });
}
```

### 3. Real-time Driver Tracking
```typescript
// services/api/src/routes/deliveries.ts
import { FastifyInstance } from 'fastify';

export async function deliveryRoutes(app: FastifyInstance) {
  // Update driver location
  app.put('/location', async (request, reply) => {
    const { lat, lng, heading, speed } = request.body as any;
    const driverId = request.user.id;

    await app.prisma.driverLocation.upsert({
      where: { driverId },
      update: {
        location: { type: 'Point', coordinates: [lng, lat] },
        heading,
        speed,
        lastUpdatedAt: new Date(),
      },
      create: {
        driverId,
        location: { type: 'Point', coordinates: [lng, lat] },
        heading,
        speed,
        isAvailable: true,
      },
    });

    // Broadcast to customers watching this driver's delivery
    const delivery = await app.prisma.delivery.findFirst({
      where: { driverId, status: { in: ['picked_up', 'in_transit'] } },
    });

    if (delivery) {
      app.io?.emit(`delivery:${delivery.id}:location`, { lat, lng, heading });
    }

    return { success: true };
  });

  // Find nearby drivers
  app.get('/nearby', async (request, reply) => {
    const { lat, lng, radius = 5000 } = request.query as any;

    const drivers = await app.prisma.$queryRaw`
      SELECT 
        d.driver_id,
        ST_X(d.location::geometry) as lng,
        ST_Y(d.location::geometry) as lat,
        d.is_available,
        ST_Distance(
          d.location::geography,
          ST_SetSRID(ST_MakePoint(${lng}::float, ${lat}::float), 4326)::geography
        ) as distance
      FROM driver_locations d
      WHERE d.is_available = true
      AND ST_DWithin(
        d.location::geography,
        ST_SetSRID(ST_MakePoint(${lng}::float, ${lat}::float), 4326)::geography,
        ${radius}
      )
      ORDER BY distance
      LIMIT 10
    `;

    return drivers;
  });
}
```

---

## Environment Variables

```bash
# .env (root)
DATABASE_URL="postgresql://liveshop:liveshop@localhost:5432/liveshop"
REDIS_URL="redis://localhost:6379"

# API Service
JWT_SECRET="your-super-secret-jwt-key"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_CONNECT_CLIENT_ID="ca_..."

# Streaming Service
PUBLIC_IP="your-server-ip"
MEDIASOUP_LISTEN_IP="0.0.0.0"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_STREAMING_URL="http://localhost:3002"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

---

## Deployment

### Docker Compose (Production)
```yaml
version: '3.8'
services:
  web:
    build: ./apps/web
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://api.liveshop.io

  api:
    build: ./services/api
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  streaming:
    build: ./services/streaming
    ports:
      - "3002:3002"
      - "10000-10100:10000-10100/udp"

  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

volumes:
  postgres_data:
```

### Deploy to Railway/Render
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

---

## Next Steps

1. **Set up the project structure** (follow Quick Start)
2. **Implement authentication** (register/login with JWT)
3. **Build store management** (CRUD for stores/products)
4. **Add WebRTC streaming** (integrate mediasoup)
5. **Create order flow** (cart → checkout → payment)
6. **Build driver app** (location tracking, job acceptance)
7. **Add notifications** (push, email, SMS)
8. **Deploy and test** (staging → production)

Need help with any specific part? Let me know which component you'd like to dive deeper into!
