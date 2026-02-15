import { z } from 'zod';

// User validations
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  role: z.enum(['customer', 'store_owner', 'driver']).default('customer'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  dateOfBirth: z.string().datetime().optional(),
});

// Store validations
export const createStoreSchema = z.object({
  name: z.string().min(2, 'Store name must be at least 2 characters'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().default('US'),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
  }),
});

export const updateStoreSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
  }).optional(),
  settings: z.record(z.unknown()).optional(),
});

// Product validations
export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().optional(),
  sku: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  compareAtPrice: z.number().positive().optional(),
  inventoryQuantity: z.number().int().min(0).default(0),
  inventoryPolicy: z.enum(['deny', 'continue']).default('deny'),
  weight: z.number().positive().optional(),
  images: z.array(z.string().url()).default([]),
  variants: z.array(z.object({
    id: z.string(),
    name: z.string(),
    options: z.record(z.string()),
    price: z.number(),
    sku: z.string().optional(),
    quantity: z.number().int(),
    image: z.string().url().optional(),
  })).default([]),
  attributes: z.record(z.string()).default({}),
  tags: z.array(z.string()).default([]),
});

export const updateProductSchema = createProductSchema.partial();

// Order validations
export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().optional(),
    quantity: z.number().int().positive(),
  })).min(1, 'At least one item is required'),
  shippingAddress: z.object({
    recipient: z.string().min(1, 'Recipient name is required'),
    phone: z.string().min(1, 'Phone number is required'),
    street1: z.string().min(1, 'Street address is required'),
    street2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().default('US'),
  }),
  paymentMethodId: z.string().min(1, 'Payment method is required'),
  couponCode: z.string().optional(),
  customerNote: z.string().optional(),
});

// Stream validations
export const createStreamSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['public', 'private', 'scheduled']).default('public'),
  scheduledAt: z.string().datetime().optional(),
});

export const updateStreamSchema = createStreamSchema.partial();

export const streamMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(500, 'Message too long'),
  type: z.enum(['text', 'reaction', 'product_request']).default('text'),
  metadata: z.record(z.unknown()).optional(),
});

// Address validation
export const addressSchema = z.object({
  label: z.string().optional(),
  recipient: z.string().min(1, 'Recipient name is required'),
  phone: z.string().min(1, 'Phone is required'),
  street1: z.string().min(1, 'Street address is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().default('US'),
  isDefault: z.boolean().default(false),
});

// Pagination validation
export const paginationSchema = z.object({
  page: z.string().or(z.number()).transform((v) => parseInt(String(v), 10)).default('1'),
  limit: z.string().or(z.number()).transform((v) => parseInt(String(v), 10)).default('20'),
  q: z.string().optional(),
  status: z.string().optional(),
});

// ID parameter validation
export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

// Search validation
export const searchSchema = z.object({
  q: z.string().min(2, 'Search query too short').max(100, 'Search query too long'),
  category: z.string().optional(),
  minPrice: z.string().or(z.number()).transform((v) => v ? parseFloat(String(v)) : undefined).optional(),
  maxPrice: z.string().or(z.number()).transform((v) => v ? parseFloat(String(v)) : undefined).optional(),
  sort: z.enum(['relevance', 'price_asc', 'price_desc', 'newest']).default('relevance'),
});

// Driver location update
export const driverLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  heading: z.number().min(0).max(360).optional(),
  speed: z.number().min(0).optional(),
  accuracy: z.number().optional(),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateStreamInput = z.infer<typeof createStreamSchema>;
export type UpdateStreamInput = z.infer<typeof updateStreamSchema>;
export type StreamMessageInput = z.infer<typeof streamMessageSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type IdParamInput = z.infer<typeof idParamSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type DriverLocationInput = z.infer<typeof driverLocationSchema>;
