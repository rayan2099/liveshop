# LiveShop - Live Retail & Delivery Platform

A full-featured SaaS platform where physical stores can go live, showcase products in real-time, and get instant payment with on-demand delivery.

## 🚀 Features

### For Customers
- Browse live streams from nearby stores
- Watch live product demonstrations
- Chat with hosts and request products
- Buy in 1-2 taps without leaving the stream
- Track delivery in real-time

### For Store Owners
- Go live from mobile or desktop
- Pin products during streams
- See real-time orders and viewer analytics
- Manage inventory and orders
- Automated payouts

### For Drivers
- Accept nearby delivery jobs
- Real-time navigation and tracking
- In-app earnings and payouts
- Proof of delivery with photos

## 🏗 Architecture

```
liveshop-saas/
├── apps/
│   ├── web/                    # Next.js 14 (Customer, Store, Driver apps)
│   └── admin/                  # Admin dashboard (optional)
├── services/
│   ├── api/                    # Fastify API server
│   ├── streaming/              # WebRTC/Mediasoup streaming server
│   └── worker/                 # Background job processor
├── packages/
│   ├── shared/                 # Shared types, utils, Prisma schema
│   ├── ui/                     # Shared UI components
│   └── config/                 # Shared configs
└── infrastructure/
    └── docker/                 # Docker Compose setup
```

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| Backend | Fastify, Node.js, TypeScript |
| Database | PostgreSQL (with PostGIS), Prisma ORM |
| Cache | Redis |
| Real-time | Socket.io, WebRTC (Mediasoup) |
| Payments | Stripe (Connect for marketplace) |
| Search | Meilisearch |
| Storage | S3/MinIO |

## 📋 Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Stripe account (test mode)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repo>
cd liveshop-saas
npm install
```

### 2. Setup Environment

```bash
# Copy the template and populate secrets (DO NOT commit real values)
cp .env.template .env
# Edit .env with your credentials
```

### 3. Start Infrastructure

```bash
cd infrastructure/docker
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- MinIO (port 9000/9001)
- Mailpit (port 1025/8025)

### 4. Setup Database

```bash
# Generate Prisma client
cd packages/shared
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed
```

### 5. Start Development

```bash
# From root directory
npm run dev
```

This starts all services in parallel:
- Web app: http://localhost:3000
- API server: http://localhost:3001
- Streaming server: http://localhost:3002

### 6. Test Accounts

After seeding, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@liveshop.io | admin123 |
| Customer | customer@example.com | customer123 |
| Store Owner | store@example.com | store123 |
| Driver | driver@example.com | driver123 |

## 📁 Project Structure

### Apps

#### Web (`apps/web/`)
- **Customer Routes** (`app/(customer)/`): Browse streams, stores, orders
- **Store Routes** (`app/(store)/`): Dashboard, products, streams, orders
- **Driver Routes** (`app/(driver)/`): Deliveries, earnings, tracking

### Services

#### API (`services/api/`)
- Authentication (JWT + refresh tokens)
- User management
- Store & product management
- Order processing
- Delivery tracking
- Payment handling (Stripe)
- Real-time notifications (Socket.io)

#### Streaming (`services/streaming/`)
- WebRTC SFU with Mediasoup
- Stream management
- Recording (optional)

### Packages

#### Shared (`packages/shared/`)
- Prisma schema
- TypeScript types
- Validation schemas (Zod)
- Utility functions
- Constants

## 🔑 Key Features

### Real-time Streaming
- WebRTC-based live streaming
- Low latency (< 100ms)
- Product pinning during streams
- Live chat and reactions

### Payment Flow
1. Customer places order → Payment authorized (hold)
2. Store prepares order
3. Driver picks up → Payment captured
4. Platform fee deducted
5. Store & driver receive payouts

### Delivery Tracking
- Real-time driver location
- GPS tracking updates
- Proof of delivery (photo/signature)
- Customer notifications

## 🧪 Testing

```bash
# Run API tests
cd services/api
npm test

# Run web tests
cd apps/web
npm test
```

## 🚀 Deployment

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables

Required for production:
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`

## 📚 API Documentation

API documentation is available at `/docs` when running the API server locally.

### Key Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /auth/register` | Register new user |
| `POST /auth/login` | Login |
| `GET /auth/me` | Get current user |
| `GET /stores` | List stores |
| `GET /streams` | List live streams |
| `POST /orders` | Create order |
| `GET /deliveries/available` | Get available deliveries (driver) |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For support, email support@liveshop.io or join our Discord community.

---

Built with ❤️ by the LiveShop Team
