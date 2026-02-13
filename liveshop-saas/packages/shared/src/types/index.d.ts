export interface UserProfile {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    dateOfBirth?: string;
    gender?: string;
}
export interface KycData {
    idType?: string;
    idNumber?: string;
    idFrontImage?: string;
    idBackImage?: string;
    selfieImage?: string;
    verifiedAt?: string;
}
export interface StoreSettings {
    workingHours?: WorkingHours;
    deliveryRadius?: number;
    minimumOrder?: number;
    preparationTime?: number;
    autoAcceptOrders?: boolean;
    allowScheduledDelivery?: boolean;
    deliveryFee?: number;
    freeDeliveryThreshold?: number;
}
export interface WorkingHours {
    [day: string]: {
        open: string;
        close: string;
        isOpen: boolean;
    };
}
export interface StoreAddress {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}
export interface ProductVariant {
    id: string;
    name: string;
    options: Record<string, string>;
    price: number;
    sku?: string;
    quantity: number;
    image?: string;
}
export interface ProductAttribute {
    name: string;
    value: string;
}
export interface OrderItemData {
    productId: string;
    variantId?: string;
    name: string;
    sku?: string;
    image?: string;
    quantity: number;
    unitPrice: number;
    total: number;
}
export interface ShippingAddress {
    label?: string;
    recipient: string;
    phone: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}
export interface StreamSettings {
    allowChat?: boolean;
    allowReactions?: boolean;
    moderationEnabled?: boolean;
    slowMode?: boolean;
    slowModeDelay?: number;
}
export interface StreamAnalytics {
    peakViewers?: number;
    averageWatchTime?: number;
    engagementRate?: number;
    conversionRate?: number;
}
export interface TrackingPoint {
    lat: number;
    lng: number;
    timestamp: string;
    accuracy?: number;
    speed?: number;
    heading?: number;
}
export interface DriverLocation {
    lat: number;
    lng: number;
    accuracy?: number;
    heading?: number;
    speed?: number;
    lastUpdated: string;
}
export interface PaymentMethodDetails {
    brand?: string;
    last4: string;
    expMonth?: number;
    expYear?: number;
    country?: string;
    funding?: string;
}
export interface NotificationData {
    orderId?: string;
    streamId?: string;
    deliveryId?: string;
    productId?: string;
    url?: string;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        hasMore?: boolean;
    };
}
export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export interface StreamEvent {
    type: 'viewer_joined' | 'viewer_left' | 'message' | 'reaction' | 'product_pinned' | 'order_placed';
    data: unknown;
    timestamp: string;
}
export interface DeliveryEvent {
    type: 'location_update' | 'status_change' | 'driver_assigned' | 'delivered';
    data: unknown;
    timestamp: string;
}
export type UserRole = 'customer' | 'store_owner' | 'store_staff' | 'driver' | 'admin' | 'super_admin';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'refunded' | 'disputed';
export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'partially_refunded';
export type DeliveryStatus = 'pending' | 'searching_driver' | 'driver_assigned' | 'driver_accepted' | 'at_pickup' | 'picked_up' | 'in_transit' | 'at_dropoff' | 'delivered' | 'failed' | 'cancelled';
export type StreamStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';
