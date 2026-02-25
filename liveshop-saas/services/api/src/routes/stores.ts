import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createStoreSchema, updateStoreSchema, paginationSchema, generateSlug } from '@liveshop/shared';
import { z } from 'zod';

const idParamSchema = z.object({ id: z.string().uuid() });

export async function storeRoutes(app: FastifyInstance) {
  // List stores (public)
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { page, limit } = paginationSchema.parse(request.query);
    const { category, search, lat, lng, radius } = request.query as any;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // TODO: Add geospatial filtering if lat/lng provided

    const [stores, total] = await Promise.all([
      app.prisma.store.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          logoUrl: true,
          coverUrl: true,
          category: true,
          address: true,
          rating: true,
          reviewCount: true,
          settings: true,
        },
        orderBy: { rating: 'desc' },
      }),
      app.prisma.store.count({ where }),
    ]);

    reply.send({
      success: true,
      data: {
        items: stores,
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

  // Get current user's stores
  app.get('/my-stores', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request.user as any).id;
    console.log(`[GET /my-stores] Fetching stores for userId: ${userId}`);

    const stores = await app.prisma.store.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId: userId } } }
        ],
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        category: true,
        rating: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`[GET /my-stores] Found ${stores.length} stores for userId: ${userId}`);

    reply.send({
      success: true,
      data: { items: stores },
    });
  });

  // Get store by ID or slug
  app.get('/:idOrSlug', async (request: FastifyRequest, reply: FastifyReply) => {
    const { idOrSlug } = request.params as { idOrSlug: string };

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const store = await app.prisma.store.findFirst({
      where: isUuid
        ? { id: idOrSlug, isActive: true }
        : { slug: idOrSlug, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        coverUrl: true,
        website: true,
        category: true,
        subcategory: true,
        address: true,
        settings: true,
        rating: true,
        reviewCount: true,
        orderCount: true,
        createdAt: true,
      },
    });

    if (!store) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Store not found' },
      });
    }

    reply.send({
      success: true,
      data: { store },
    });
  });

  // Create store
  app.post('/', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Only customers and store_owners can create stores
      if (!['customer', 'store_owner'].includes((request.user as any).role)) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Cannot create store with current role' },
        });
      }

      const data = createStoreSchema.parse(request.body);
      const slug = generateSlug(data.name);

      // Check if slug exists
      const existing = await app.prisma.store.findUnique({
        where: { slug },
      });

      if (existing) {
        return reply.status(409).send({
          success: false,
          error: { code: 'SLUG_EXISTS', message: 'Store name already taken' },
        });
      }

      const store = await app.prisma.store.create({
        data: {
          tenantId: (request.user as any).tenantId,
          ownerId: (request.user as any).id,
          name: data.name,
          slug,
          description: data.description,
          category: data.category,
          address: data.address as any,
          verificationStatus: 'verified',
          verifiedAt: new Date(),
          members: {
            create: {
              userId: (request.user as any).id,
              role: 'owner',
            }
          }
        },
      });

      // Update user role to store_owner if they were a customer
      if ((request.user as any).role === 'customer') {
        await app.prisma.user.update({
          where: { id: (request.user as any).id },
          data: { role: 'store_owner' },
        });
      }

      reply.status(201).send({
        success: true,
        data: { store },
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

  // Update store
  app.put('/:id', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = idParamSchema.parse(request.params);
      const data = updateStoreSchema.parse(request.body);

      // Check ownership
      const store = await app.prisma.store.findUnique({
        where: { id },
        select: { ownerId: true },
      });

      if (!store) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Store not found' },
        });
      }

      if (store.ownerId !== (request.user as any).id && !['admin', 'super_admin'].includes((request.user as any).role)) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Not authorized to update this store' },
        });
      }

      const updatedStore = await app.prisma.store.update({
        where: { id },
        data: {
          ...data,
          address: data.address as any,
          settings: data.settings as any,
        },
      });

      reply.send({
        success: true,
        data: { store: updatedStore },
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

  // Get store products
  app.get('/:id/products', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);
    const { page, limit } = paginationSchema.parse(request.query);
    const { category, search, minPrice, maxPrice, sort } = request.query as any;
    const skip = (page - 1) * limit;

    // Verify store exists
    const store = await app.prisma.store.findUnique({
      where: { id, isActive: true },
    });

    if (!store) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Store not found' },
      });
    }

    const where: any = {
      storeId: id,
      isActive: true,
    };

    if (category) {
      where.tags = { has: category };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const orderBy: any = {};
    switch (sort) {
      case 'price_asc':
        orderBy.price = 'asc';
        break;
      case 'price_desc':
        orderBy.price = 'desc';
        break;
      case 'newest':
        orderBy.createdAt = 'desc';
        break;
      default:
        orderBy.createdAt = 'desc';
    }

    const [products, total] = await Promise.all([
      app.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          compareAtPrice: true,
          images: true,
          inventoryQuantity: true,
          variants: true,
          tags: true,
          createdAt: true,
        },
      }),
      app.prisma.product.count({ where }),
    ]);

    reply.send({
      success: true,
      data: {
        items: products,
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

  // Get store streams
  app.get('/:id/streams', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);
    const { page, limit, status } = paginationSchema.parse(request.query);
    const skip = (page - 1) * limit;

    const where: any = {
      storeId: id,
    };

    if (status) {
      where.status = status;
    }

    const [streams, total] = await Promise.all([
      app.prisma.liveStream.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          thumbnailUrl: true,
          type: true,
          status: true,
          scheduledAt: true,
          startedAt: true,
          endedAt: true,
          viewerCount: true,
          peakViewers: true,
        },
      }),
      app.prisma.liveStream.count({ where }),
    ]);

    reply.send({
      success: true,
      data: {
        items: streams,
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

  // Get store analytics (owner only)
  app.get('/:id/analytics', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);
    const { period = '30d' } = request.query as any;

    // Check ownership
    const store = await app.prisma.store.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!store) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Store not found' },
      });
    }

    if (store.ownerId !== (request.user as any).id && !['admin', 'super_admin'].includes((request.user as any).role)) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized' },
      });
    }

    // Calculate date range
    const days = parseInt(period.replace('d', ''));
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get analytics
    const [
      totalOrders,
      totalRevenue,
      totalStreams,
      streamViews,
      recentOrders,
    ] = await Promise.all([
      app.prisma.order.count({
        where: { storeId: id, createdAt: { gte: startDate } },
      }),
      app.prisma.order.aggregate({
        where: { storeId: id, createdAt: { gte: startDate }, paymentStatus: 'captured' },
        _sum: { totalAmount: true },
      }),
      app.prisma.liveStream.count({
        where: { storeId: id, createdAt: { gte: startDate } },
      }),
      app.prisma.liveStream.aggregate({
        where: { storeId: id, createdAt: { gte: startDate } },
        _sum: { totalViews: true, totalWatchTime: true },
      }),
      app.prisma.order.findMany({
        where: { storeId: id, createdAt: { gte: startDate } },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    reply.send({
      success: true,
      data: {
        period,
        orders: {
          total: totalOrders,
          revenue: totalRevenue._sum.totalAmount || 0,
        },
        streams: {
          total: totalStreams,
          totalViews: streamViews._sum.totalViews || 0,
          totalWatchTime: streamViews._sum.totalWatchTime || 0,
        },
        recentOrders,
      },
    });
  });
}
