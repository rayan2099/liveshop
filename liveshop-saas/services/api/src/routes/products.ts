import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createProductSchema, updateProductSchema, paginationSchema } from '@liveshop/shared';
import { z } from 'zod';

const idParamSchema = z.object({ id: z.string().uuid() });

export async function productRoutes(app: FastifyInstance) {
  // Search products (public)
  app.get('/search', async (request: FastifyRequest, reply: FastifyReply) => {
    const { q, page, limit } = paginationSchema.parse(request.query);
    const { category, storeId, minPrice, maxPrice, sort } = request.query as any;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    if (q && q.length >= 2) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
      ];
    }

    if (storeId) where.storeId = storeId;
    if (category) where.tags = { has: category };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const orderBy: any = sort === 'price_asc' ? { price: 'asc' } :
      sort === 'price_desc' ? { price: 'desc' } :
        { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      app.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          store: {
            select: { id: true, name: true, slug: true, logoUrl: true },
          },
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

  // Get product by ID
  app.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);

    const product = await app.prisma.product.findUnique({
      where: { id, isActive: true },
      include: {
        store: {
          select: { id: true, name: true, slug: true, logoUrl: true, rating: true },
        },
      },
    });

    if (!product) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' },
      });
    }

    reply.send({
      success: true,
      data: { product },
    });
  });

  // Create product (store owner/staff only)
  app.post('/', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = createProductSchema.parse(request.body);
      const { storeId } = request.body as any;

      // Check if user can add products to this store
      const membership = await app.prisma.storeMember.findFirst({
        where: {
          storeId,
          userId: request.user.id,
          OR: [
            { role: 'owner' },
            { permissions: { array_contains: 'products' } },
          ],
        },
      });

      if (!membership && !['admin', 'super_admin'].includes(request.user.role)) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Not authorized to add products to this store' },
        });
      }

      const product = await app.prisma.product.create({
        data: {
          store: { connect: { id: storeId } },
          name: data.name,
          description: data.description,
          sku: data.sku,
          price: data.price,
          compareAtPrice: data.compareAtPrice,
          inventoryQuantity: data.inventoryQuantity,
          inventoryPolicy: data.inventoryPolicy,
          weight: data.weight,
          images: data.images,
          variants: data.variants as any,
          attributes: data.attributes as any,
          tags: data.tags,
        },
      });

      reply.status(201).send({
        success: true,
        data: { product },
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

  // Update product
  app.put('/:id', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = idParamSchema.parse(request.params);
      const data = updateProductSchema.parse(request.body);

      const product = await app.prisma.product.findUnique({
        where: { id },
        include: { store: true },
      });

      if (!product) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Product not found' },
        });
      }

      // Check authorization
      const membership = await app.prisma.storeMember.findFirst({
        where: {
          storeId: product.storeId,
          userId: request.user.id,
          OR: [
            { role: 'owner' },
            { permissions: { array_contains: 'products' } },
          ],
        },
      });

      if (!membership && !['admin', 'super_admin'].includes(request.user.role)) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Not authorized to update this product' },
        });
      }

      const updatedProduct = await app.prisma.product.update({
        where: { id },
        data,
      });

      reply.send({
        success: true,
        data: { product: updatedProduct },
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

  // Delete product (soft delete)
  app.delete('/:id', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);

    const product = await app.prisma.product.findUnique({
      where: { id },
      include: { store: true },
    });

    if (!product) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' },
      });
    }

    // Check authorization
    const membership = await app.prisma.storeMember.findFirst({
      where: {
        storeId: product.storeId,
        userId: request.user.id,
        OR: [
          { role: 'owner' },
          { permissions: { array_contains: 'products' } },
        ],
      },
    });

    if (!membership && !['admin', 'super_admin'].includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to delete this product' },
      });
    }

    await app.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    reply.send({
      success: true,
      data: { message: 'Product deleted' },
    });
  });
}
