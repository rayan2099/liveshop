# LiveShop SaaS - Complete Technical Architecture

## Executive Summary

A multi-tenant live retail platform with three native-feeling apps (Customer, Store, Driver), real-time streaming, instant checkout, and on-demand delivery.

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────┬─────────────────┬─────────────────┬───────────────────────┤
│  Customer App   │   Store App     │  Driver App     │   Admin Dashboard     │
│  (Next.js PWA)  │  (Next.js PWA)  │  (Next.js PWA)  │   (Next.js Web)       │
└────────┬────────┴────────┬────────┴────────┬────────┴───────────┬───────────┘
         │                 │                 │                    │
         └─────────────────┴────────┬────────┴────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────────┐
│                           API GATEWAY (Kong/AWS API GW)                      │
│  - Rate Limiting  - Authentication  - Request Routing  - SSL Termination    │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────────┐
│                         MICROSERVICES LAYER                                  │
├──────────────┬──────────────┬──────────────┬──────────────┬─────────────────┤
│  Auth        │  Live        │  Commerce    │  Delivery    │  Notification   │
│  Service     │  Service     │  Service     │  Service     │  Service        │
├──────────────┼──────────────┼──────────────┼──────────────┼─────────────────┤
│  User        │  Stream      │  Product     │  Order       │  Push           │
│  Profile     │  Management  │  Catalog     │  Management  │  Email          │
│  KYC         │  WebRTC      │  Inventory   │  Tracking    │  SMS            │
│  Permission  │  Signaling   │  Payment     │  Driver      │  WebSocket      │
└──────────────┴──────────────┴──────────────┴──────────────┴─────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────────┐
│                         DATA LAYER                                           │
├──────────────┬──────────────┬──────────────┬──────────────┬─────────────────┤
│  PostgreSQL  │  Redis       │  S3/MinIO    │  ClickHouse  │  Elasticsearch  │
│  (Primary)   │  (Cache/     │  (Media)     │  (Analytics) │  (Search)       │
│              │   Sessions)  │              │              │                 │
└──────────────┴──────────────┴──────────────┴──────────────┴─────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────────┐
│                      EXTERNAL INTEGRATIONS                                   │
├──────────────┬──────────────┬──────────────┬──────────────┬─────────────────┤
│  Stripe      │  Twilio      │  Firebase    │  Google      │  SendGrid       │
│  (Payments)  │  (Video)     │  (FCM)       │  (Maps)      │  (Email)        │
└──────────────┴──────────────┴──────────────┴──────────────┴─────────────────┘
```

---

## 2. Tech Stack Recommendations

### Frontend ("Antigravity" - Lightweight & Fast)
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | **Next.js 14+** (App Router) | RSC, streaming, edge-ready |
| Language | **TypeScript** | Type safety |
| Styling | **Tailwind CSS** + shadcn/ui | Utility-first, fast iterations |
| State | **Zustand** + **TanStack Query** | Lightweight, server state sync |
| Forms | **React Hook Form** + Zod | Performance, validation |
| Maps | **Mapbox GL JS** | Custom styling, performance |
| Charts | **Recharts** | Lightweight, React-native |

### Backend
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Runtime | **Node.js 20+** | Async I/O, ecosystem |
| Framework | **Fastify** | 2x faster than Express, schema validation |
| API | **tRPC** or **GraphQL** | Type-safe APIs |
| Real-time | **Socket.io** + **Mediasoup** | WebRTC SFU for streaming |
| Queue | **Bull MQ** (Redis) | Job processing |

### Database & Storage
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Primary | **PostgreSQL 15** | ACID, JSON support, extensions |
| ORM | **Prisma** | Type-safe migrations |
| Cache | **Redis 7** | Sessions, real-time data |
| Search | **Meilisearch** | Fast product search |
| Analytics | **ClickHouse** | Time-series, aggregations |
| Media | **S3/Cloudflare R2** | CDN-ready storage |

### Infrastructure
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Container | **Docker** + **Docker Compose** | Local dev, consistency |
| Orchestration | **Kubernetes** (prod) | Scale, resilience |
| CI/CD | **GitHub Actions** | Automation |
| Hosting | **Vercel** (frontend) + **AWS/GCP** (backend) | Edge + compute |
| Monitoring | **Datadog** or **Grafana** | Observability |

---

## 3. Database Schema Design

### Core Entities

```sql
-- Tenants (Multi-tenancy support)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  plan VARCHAR(50) DEFAULT 'free', -- free, pro, enterprise
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (Unified auth for all roles)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255),
  role VARCHAR(50) NOT NULL, -- customer, store_owner, store_staff, driver, admin
  status VARCHAR(50) DEFAULT 'active', -- active, suspended, pending_verification
  profile JSONB DEFAULT '{}', -- name, avatar, preferences
  kyc_status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected
  kyc_data JSONB DEFAULT '{}', -- id documents, verification details
  wallet_balance DECIMAL(12,2) DEFAULT 0, -- For drivers and store payouts
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stores
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  owner_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  category VARCHAR(100),
  address JSONB NOT NULL, -- { street, city, state, zip, country, coordinates }
  settings JSONB DEFAULT '{}', -- working_hours, delivery_radius, minimum_order
  verification_status VARCHAR(50) DEFAULT 'pending',
  rating DECIMAL(2,1) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  inventory_quantity INTEGER DEFAULT 0,
  inventory_policy VARCHAR(50) DEFAULT 'deny', -- deny, continue
  weight DECIMAL(8,2),
  images TEXT[],
  variants JSONB DEFAULT '[]', -- [{ id, name, options, price, quantity }]
  attributes JSONB DEFAULT '{}', -- custom product attributes
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Live Streams
CREATE TABLE live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id),
  host_id UUID REFERENCES users(id),
  title VARCHAR(255),
  description TEXT,
  type VARCHAR(50) DEFAULT 'public', -- public, private
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, live, ended, cancelled
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  room_id VARCHAR(100) UNIQUE, -- WebRTC room identifier
  stream_key VARCHAR(255),
  playback_url TEXT,
  thumbnail_url TEXT,
  viewer_count INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  total_watch_time INTEGER DEFAULT 0, -- seconds
  products_pinned UUID[], -- Array of product IDs
  settings JSONB DEFAULT '{}', -- chat_enabled, reactions_enabled, etc.
  analytics JSONB DEFAULT '{}', -- aggregated metrics
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stream Participants (Viewers)
CREATE TABLE stream_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES live_streams(id),
  user_id UUID REFERENCES users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  watch_duration INTEGER DEFAULT 0, -- seconds
  messages_count INTEGER DEFAULT 0,
  reactions_count INTEGER DEFAULT 0,
  UNIQUE(stream_id, user_id, joined_at)
);

-- Stream Chat Messages
CREATE TABLE stream_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES live_streams(id),
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) DEFAULT 'text', -- text, product_request, order_notification, system
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}', -- product_id, order_id, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  tenant_id UUID REFERENCES tenants(id),
  customer_id UUID REFERENCES users(id),
  store_id UUID REFERENCES stores(id),
  stream_id UUID REFERENCES live_streams(id), -- Optional: if ordered during live
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, preparing, ready, picked_up, in_transit, delivered, cancelled, refunded
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, authorized, captured, failed, refunded
  fulfillment_status VARCHAR(50) DEFAULT 'unfulfilled', -- unfulfilled, fulfilled, partial
  subtotal DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  shipping_amount DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  items JSONB NOT NULL, -- [{ product_id, variant_id, name, quantity, price, total }]
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  payment_method JSONB,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Timeline (Audit trail)
CREATE TABLE order_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  status VARCHAR(50) NOT NULL,
  note TEXT,
  actor_id UUID REFERENCES users(id),
  actor_type VARCHAR(50), -- customer, store_staff, driver, system
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deliveries
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  driver_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, at_pickup, picked_up, in_transit, at_dropoff, delivered, failed, cancelled
  pickup_address JSONB NOT NULL,
  dropoff_address JSONB NOT NULL,
  estimated_pickup_at TIMESTAMPTZ,
  estimated_delivery_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  distance_km DECIMAL(8,2),
  delivery_fee DECIMAL(10,2),
  driver_earnings DECIMAL(10,2),
  tracking_data JSONB DEFAULT '[]', -- [{ lat, lng, timestamp }]
  proof_of_delivery JSONB DEFAULT '{}', -- photo_url, signature_url, notes
  rating INTEGER, -- 1-5
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver Location (Real-time tracking)
CREATE TABLE driver_locations (
  driver_id UUID PRIMARY KEY REFERENCES users(id),
  location GEOGRAPHY(POINT) NOT NULL,
  accuracy DECIMAL(8,2),
  heading DECIMAL(5,2),
  speed DECIMAL(6,2),
  is_available BOOLEAN DEFAULT false,
  current_delivery_id UUID REFERENCES deliveries(id),
  last_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments (Stripe integration)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL, -- requires_confirmation, processing, succeeded, failed, refunded
  payment_method_type VARCHAR(50),
  payment_method_details JSONB,
  receipt_url TEXT,
  failure_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payouts (To stores and drivers)
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES users(id),
  recipient_type VARCHAR(50), -- store, driver
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  stripe_transfer_id VARCHAR(255),
  stripe_payout_id VARCHAR(255),
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  orders_included UUID[],
  deliveries_included UUID[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(100) NOT NULL, -- order_update, delivery_update, stream_start, etc.
  title VARCHAR(255) NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}', -- payload for deep linking
  is_read BOOLEAN DEFAULT false,
  sent_via VARCHAR(50)[], -- push, email, sms
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_stores_tenant ON stores(tenant_id);
CREATE INDEX idx_stores_owner ON stores(owner_id);
CREATE INDEX idx_products_store ON products(store_id);
CREATE INDEX idx_live_streams_store ON live_streams(store_id);
CREATE INDEX idx_live_streams_status ON live_streams(status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_store ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_deliveries_driver ON deliveries(driver_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_stream_messages_stream ON stream_messages(stream_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- Full-text search indexes
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_stores_search ON stores USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
```

---

## 4. API Structure

### Authentication Endpoints
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/verify-email
POST   /api/v1/auth/verify-phone
```

### User Management
```
GET    /api/v1/me
PUT    /api/v1/me
PUT    /api/v1/me/avatar
GET    /api/v1/me/addresses
POST   /api/v1/me/addresses
PUT    /api/v1/me/addresses/:id
DELETE /api/v1/me/addresses/:id
GET    /api/v1/me/payment-methods
POST   /api/v1/me/payment-methods
DELETE /api/v1/me/payment-methods/:id
GET    /api/v1/me/orders
GET    /api/v1/me/notifications
PUT    /api/v1/me/notifications/:id/read
```

### Store Management
```
GET    /api/v1/stores
POST   /api/v1/stores
GET    /api/v1/stores/:id
PUT    /api/v1/stores/:id
DELETE /api/v1/stores/:id
GET    /api/v1/stores/:id/products
POST   /api/v1/stores/:id/products
GET    /api/v1/stores/:id/analytics
GET    /api/v1/stores/:id/orders
PUT    /api/v1/stores/:id/orders/:orderId/status
```

### Live Streaming
```
POST   /api/v1/streams              # Create stream
GET    /api/v1/streams              # List active streams
GET    /api/v1/streams/:id          # Get stream details
PUT    /api/v1/streams/:id          # Update stream
POST   /api/v1/streams/:id/start    # Go live
POST   /api/v1/streams/:id/end      # End stream
POST   /api/v1/streams/:id/join     # Join as viewer
POST   /api/v1/streams/:id/leave    # Leave stream
POST   /api/v1/streams/:id/pin      # Pin product
DELETE /api/v1/streams/:id/pin/:productId  # Unpin product
GET    /api/v1/streams/:id/chat     # Get chat history
POST   /api/v1/streams/:id/chat     # Send message
```

### Commerce
```
GET    /api/v1/products             # Search products
GET    /api/v1/products/:id         # Get product
POST   /api/v1/cart                 # Add to cart
GET    /api/v1/cart                 # Get cart
PUT    /api/v1/cart/:itemId         # Update cart item
DELETE /api/v1/cart/:itemId         # Remove from cart
POST   /api/v1/orders               # Create order
GET    /api/v1/orders/:id           # Get order
POST   /api/v1/orders/:id/cancel    # Cancel order
POST   /api/v1/checkout             # Process checkout
```

### Delivery
```
GET    /api/v1/deliveries           # List deliveries (driver)
POST   /api/v1/deliveries/:id/accept
POST   /api/v1/deliveries/:id/pickup
POST   /api/v1/deliveries/:id/complete
PUT    /api/v1/deliveries/:id/location  # Update location (driver)
GET    /api/v1/deliveries/:id/tracking   # Get tracking (customer)
```

---

## 5. Real-Time Architecture

### WebRTC Streaming Flow
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Store     │────▶│  Signaling  │◀────│  Customer   │
│  (Sender)   │     │  Server     │     │  (Receiver) │
└──────┬──────┘     └─────────────┘     └──────┬──────┘
       │                                        │
       └──────────────┬─────────────────────────┘
                      │
              ┌───────▼────────┐
              │  Media Server  │
              │  (Mediasoup)   │
              │  - SFU/Router  │
              │  - Recording   │
              └────────────────┘
```

### Socket Events
```javascript
// Store events
'stream:start'        // Store goes live
'stream:product:pin'  // Pin product to stream
'stream:product:unpin'
'stream:order'        // New order notification

// Customer events
'stream:join'         // Join stream
'stream:leave'
'stream:message'      // Send chat message
'stream:reaction'     // Send reaction
'stream:product:request'  // Request to see product

// Driver events
'driver:location'     // Update location
'driver:available'    // Toggle availability
'delivery:accept'
'delivery:pickup'
'delivery:complete'

// System events
'order:update'
'delivery:update'
'notification:new'
```

---

## 6. Payment & Escrow Flow

```
1. Customer places order
   └─▶ Payment authorized (Stripe hold)
   
2. Store confirms & prepares
   
3. Driver picks up
   └─▶ Payment captured
   └─▶ Platform fee deducted
   
4. Delivery completed
   └─▶ Store receives: order_amount - platform_fee
   └─▶ Driver receives: delivery_fee
   
5. Payout scheduled (daily/weekly)
   └─▶ Stripe Connect transfer
```

### Commission Structure
| Entity | Fee |
|--------|-----|
| Platform | 5-15% of order value |
| Payment Processing | 2.9% + $0.30 (Stripe) |
| Delivery | Variable by distance |

---

## 7. Directory Structure

```
liveshop-saas/
├── apps/
│   ├── web/                    # Next.js 14 (all apps in one)
│   │   ├── app/
│   │   │   ├── (customer)/     # Customer routes
│   │   │   ├── (store)/        # Store owner routes
│   │   │   ├── (driver)/       # Driver routes
│   │   │   └── api/            # API routes
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   └── admin/                  # Admin dashboard (optional separate)
├── packages/
│   ├── shared/                 # Shared types, utils
│   ├── ui/                     # Shared UI components
│   └── config/                 # Shared configs (eslint, tsconfig)
├── services/
│   ├── api/                    # Fastify API server
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── plugins/
│   ├── streaming/              # WebRTC/Mediasoup server
│   └── worker/                 # Background job processor
├── infrastructure/
│   ├── docker/
│   ├── k8s/
│   └── terraform/
└── docs/
```

---

## 8. Implementation Phases

### Phase 1: MVP (Weeks 1-4)
- [ ] Auth system (register, login, JWT)
- [ ] Basic store & product CRUD
- [ ] Simple live streaming (WebRTC P2P)
- [ ] Order creation & payment
- [ ] Basic driver assignment

### Phase 2: Core Features (Weeks 5-8)
- [ ] Product pinning during streams
- [ ] Real-time chat
- [ ] Driver location tracking
- [ ] Order management dashboard
- [ ] Push notifications

### Phase 3: Scale & Polish (Weeks 9-12)
- [ ] SFU for streaming (Mediasoup)
- [ ] Advanced analytics
- [ ] Search & recommendations
- [ ] Automated payouts
- [ ] Mobile app wrappers (Capacitor)

---

## 9. Getting Started Commands

```bash
# 1. Clone and setup
mkdir liveshop-saas && cd liveshop-saas
npx create-turbo@latest . --use-npm

# 2. Install dependencies
npm install

# 3. Setup database
docker-compose up -d postgres redis
npx prisma migrate dev

# 4. Run development
npm run dev

# 5. Setup environment
cp .env.example .env
# Edit: DATABASE_URL, REDIS_URL, STRIPE_KEY, etc.
```

---

## 10. Key Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Monorepo | Turborepo | Shared code, caching |
| Single Next.js app | Route groups | Faster dev, shared layout |
| Fastify over Express | Performance | 2x throughput |
| Mediasoup over Twilio | Cost | Self-hosted = cheaper |
| PostgreSQL over Mongo | ACID | Financial data needs consistency |
| Prisma over TypeORM | DX | Better migrations, types |
