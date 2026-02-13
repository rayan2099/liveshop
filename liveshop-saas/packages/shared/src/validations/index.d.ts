import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    role: z.ZodDefault<z.ZodEnum<["customer", "store_owner", "driver"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: "customer" | "store_owner" | "driver";
    phone?: string | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string | undefined;
    role?: "customer" | "store_owner" | "driver" | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    avatar?: string | undefined;
    dateOfBirth?: string | undefined;
}, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    avatar?: string | undefined;
    dateOfBirth?: string | undefined;
}>;
export declare const createStoreSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodString;
    address: z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodDefault<z.ZodString>;
        coordinates: z.ZodOptional<z.ZodObject<{
            lat: z.ZodNumber;
            lng: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            lat: number;
            lng: number;
        }, {
            lat: number;
            lng: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        coordinates?: {
            lat: number;
            lng: number;
        } | undefined;
    }, {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country?: string | undefined;
        coordinates?: {
            lat: number;
            lng: number;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    name: string;
    category: string;
    address: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        coordinates?: {
            lat: number;
            lng: number;
        } | undefined;
    };
    description?: string | undefined;
}, {
    name: string;
    category: string;
    address: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country?: string | undefined;
        coordinates?: {
            lat: number;
            lng: number;
        } | undefined;
    };
    description?: string | undefined;
}>;
export declare const updateStoreSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    category: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodDefault<z.ZodString>;
        coordinates: z.ZodOptional<z.ZodObject<{
            lat: z.ZodNumber;
            lng: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            lat: number;
            lng: number;
        }, {
            lat: number;
            lng: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        coordinates?: {
            lat: number;
            lng: number;
        } | undefined;
    }, {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country?: string | undefined;
        coordinates?: {
            lat: number;
            lng: number;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    category?: string | undefined;
    address?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        coordinates?: {
            lat: number;
            lng: number;
        } | undefined;
    } | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    category?: string | undefined;
    address?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country?: string | undefined;
        coordinates?: {
            lat: number;
            lng: number;
        } | undefined;
    } | undefined;
}>;
export declare const createProductSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    sku: z.ZodOptional<z.ZodString>;
    price: z.ZodNumber;
    compareAtPrice: z.ZodOptional<z.ZodNumber>;
    inventoryQuantity: z.ZodDefault<z.ZodNumber>;
    inventoryPolicy: z.ZodDefault<z.ZodEnum<["deny", "continue"]>>;
    weight: z.ZodOptional<z.ZodNumber>;
    images: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    variants: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        options: z.ZodRecord<z.ZodString, z.ZodString>;
        price: z.ZodNumber;
        sku: z.ZodOptional<z.ZodString>;
        quantity: z.ZodNumber;
        image: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        options: Record<string, string>;
        name: string;
        price: number;
        id: string;
        quantity: number;
        sku?: string | undefined;
        image?: string | undefined;
    }, {
        options: Record<string, string>;
        name: string;
        price: number;
        id: string;
        quantity: number;
        sku?: string | undefined;
        image?: string | undefined;
    }>, "many">>;
    attributes: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    price: number;
    inventoryQuantity: number;
    inventoryPolicy: "deny" | "continue";
    images: string[];
    variants: {
        options: Record<string, string>;
        name: string;
        price: number;
        id: string;
        quantity: number;
        sku?: string | undefined;
        image?: string | undefined;
    }[];
    attributes: Record<string, string>;
    tags: string[];
    description?: string | undefined;
    sku?: string | undefined;
    compareAtPrice?: number | undefined;
    weight?: number | undefined;
}, {
    name: string;
    price: number;
    description?: string | undefined;
    sku?: string | undefined;
    compareAtPrice?: number | undefined;
    inventoryQuantity?: number | undefined;
    inventoryPolicy?: "deny" | "continue" | undefined;
    weight?: number | undefined;
    images?: string[] | undefined;
    variants?: {
        options: Record<string, string>;
        name: string;
        price: number;
        id: string;
        quantity: number;
        sku?: string | undefined;
        image?: string | undefined;
    }[] | undefined;
    attributes?: Record<string, string> | undefined;
    tags?: string[] | undefined;
}>;
export declare const updateProductSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    sku: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    price: z.ZodOptional<z.ZodNumber>;
    compareAtPrice: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    inventoryQuantity: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    inventoryPolicy: z.ZodOptional<z.ZodDefault<z.ZodEnum<["deny", "continue"]>>>;
    weight: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    images: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    variants: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        options: z.ZodRecord<z.ZodString, z.ZodString>;
        price: z.ZodNumber;
        sku: z.ZodOptional<z.ZodString>;
        quantity: z.ZodNumber;
        image: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        options: Record<string, string>;
        name: string;
        price: number;
        id: string;
        quantity: number;
        sku?: string | undefined;
        image?: string | undefined;
    }, {
        options: Record<string, string>;
        name: string;
        price: number;
        id: string;
        quantity: number;
        sku?: string | undefined;
        image?: string | undefined;
    }>, "many">>>;
    attributes: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>>;
    tags: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    sku?: string | undefined;
    price?: number | undefined;
    compareAtPrice?: number | undefined;
    inventoryQuantity?: number | undefined;
    inventoryPolicy?: "deny" | "continue" | undefined;
    weight?: number | undefined;
    images?: string[] | undefined;
    variants?: {
        options: Record<string, string>;
        name: string;
        price: number;
        id: string;
        quantity: number;
        sku?: string | undefined;
        image?: string | undefined;
    }[] | undefined;
    attributes?: Record<string, string> | undefined;
    tags?: string[] | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    sku?: string | undefined;
    price?: number | undefined;
    compareAtPrice?: number | undefined;
    inventoryQuantity?: number | undefined;
    inventoryPolicy?: "deny" | "continue" | undefined;
    weight?: number | undefined;
    images?: string[] | undefined;
    variants?: {
        options: Record<string, string>;
        name: string;
        price: number;
        id: string;
        quantity: number;
        sku?: string | undefined;
        image?: string | undefined;
    }[] | undefined;
    attributes?: Record<string, string> | undefined;
    tags?: string[] | undefined;
}>;
export declare const createOrderSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        variantId: z.ZodOptional<z.ZodString>;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        productId: string;
        variantId?: string | undefined;
    }, {
        quantity: number;
        productId: string;
        variantId?: string | undefined;
    }>, "many">;
    shippingAddress: z.ZodObject<{
        recipient: z.ZodString;
        phone: z.ZodString;
        street1: z.ZodString;
        street2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        phone: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        recipient: string;
        street1: string;
        street2?: string | undefined;
    }, {
        phone: string;
        city: string;
        state: string;
        postalCode: string;
        recipient: string;
        street1: string;
        country?: string | undefined;
        street2?: string | undefined;
    }>;
    paymentMethodId: z.ZodString;
    couponCode: z.ZodOptional<z.ZodString>;
    customerNote: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    items: {
        quantity: number;
        productId: string;
        variantId?: string | undefined;
    }[];
    shippingAddress: {
        phone: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        recipient: string;
        street1: string;
        street2?: string | undefined;
    };
    paymentMethodId: string;
    couponCode?: string | undefined;
    customerNote?: string | undefined;
}, {
    items: {
        quantity: number;
        productId: string;
        variantId?: string | undefined;
    }[];
    shippingAddress: {
        phone: string;
        city: string;
        state: string;
        postalCode: string;
        recipient: string;
        street1: string;
        country?: string | undefined;
        street2?: string | undefined;
    };
    paymentMethodId: string;
    couponCode?: string | undefined;
    customerNote?: string | undefined;
}>;
export declare const createStreamSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodDefault<z.ZodEnum<["public", "private", "scheduled"]>>;
    scheduledAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "scheduled" | "public" | "private";
    title: string;
    description?: string | undefined;
    scheduledAt?: string | undefined;
}, {
    title: string;
    type?: "scheduled" | "public" | "private" | undefined;
    description?: string | undefined;
    scheduledAt?: string | undefined;
}>;
export declare const updateStreamSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    type: z.ZodOptional<z.ZodDefault<z.ZodEnum<["public", "private", "scheduled"]>>>;
    scheduledAt: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    type?: "scheduled" | "public" | "private" | undefined;
    description?: string | undefined;
    title?: string | undefined;
    scheduledAt?: string | undefined;
}, {
    type?: "scheduled" | "public" | "private" | undefined;
    description?: string | undefined;
    title?: string | undefined;
    scheduledAt?: string | undefined;
}>;
export declare const streamMessageSchema: z.ZodObject<{
    content: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["text", "reaction", "product_request"]>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    type: "reaction" | "text" | "product_request";
    content: string;
    metadata?: Record<string, unknown> | undefined;
}, {
    content: string;
    type?: "reaction" | "text" | "product_request" | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
export declare const addressSchema: z.ZodObject<{
    label: z.ZodOptional<z.ZodString>;
    recipient: z.ZodString;
    phone: z.ZodString;
    street1: z.ZodString;
    street2: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    state: z.ZodString;
    postalCode: z.ZodString;
    country: z.ZodDefault<z.ZodString>;
    isDefault: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    phone: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    recipient: string;
    street1: string;
    isDefault: boolean;
    street2?: string | undefined;
    label?: string | undefined;
}, {
    phone: string;
    city: string;
    state: string;
    postalCode: string;
    recipient: string;
    street1: string;
    country?: string | undefined;
    street2?: string | undefined;
    label?: string | undefined;
    isDefault?: boolean | undefined;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNumber]>, number, string | number>>;
    limit: z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNumber]>, number, string | number>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: string | number | undefined;
    limit?: string | number | undefined;
}>;
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const searchSchema: z.ZodObject<{
    q: z.ZodString;
    category: z.ZodOptional<z.ZodString>;
    minPrice: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNumber]>, number | undefined, string | number>>;
    maxPrice: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNumber]>, number | undefined, string | number>>;
    sort: z.ZodDefault<z.ZodEnum<["relevance", "price_asc", "price_desc", "newest"]>>;
}, "strip", z.ZodTypeAny, {
    sort: "relevance" | "price_asc" | "price_desc" | "newest";
    q: string;
    category?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
}, {
    q: string;
    sort?: "relevance" | "price_asc" | "price_desc" | "newest" | undefined;
    category?: string | undefined;
    minPrice?: string | number | undefined;
    maxPrice?: string | number | undefined;
}>;
export declare const driverLocationSchema: z.ZodObject<{
    lat: z.ZodNumber;
    lng: z.ZodNumber;
    heading: z.ZodOptional<z.ZodNumber>;
    speed: z.ZodOptional<z.ZodNumber>;
    accuracy: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    lat: number;
    lng: number;
    heading?: number | undefined;
    speed?: number | undefined;
    accuracy?: number | undefined;
}, {
    lat: number;
    lng: number;
    heading?: number | undefined;
    speed?: number | undefined;
    accuracy?: number | undefined;
}>;
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
