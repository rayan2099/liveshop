// Order Status Flow
export const ORDER_STATUS_FLOW = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready_for_pickup', 'cancelled'],
  ready_for_pickup: ['picked_up', 'cancelled'],
  picked_up: ['in_transit'],
  in_transit: ['delivered', 'failed'],
  delivered: [],
  cancelled: [],
  refunded: [],
  disputed: ['resolved'],
} as const;

// Delivery Status Flow
export const DELIVERY_STATUS_FLOW = {
  pending: ['searching_driver', 'cancelled'],
  searching_driver: ['driver_assigned', 'cancelled'],
  driver_assigned: ['driver_accepted', 'cancelled'],
  driver_accepted: ['at_pickup', 'cancelled'],
  at_pickup: ['picked_up', 'cancelled'],
  picked_up: ['in_transit', 'cancelled'],
  in_transit: ['at_dropoff', 'failed'],
  at_dropoff: ['delivered', 'failed'],
  delivered: [],
  failed: [],
  cancelled: [],
} as const;

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  STORE_OWNER: 'store_owner',
  STORE_STAFF: 'store_staff',
  DRIVER: 'driver',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY_FOR_PICKUP: 'ready_for_pickup',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  DISPUTED: 'disputed',
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  AUTHORIZED: 'authorized',
  CAPTURED: 'captured',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
} as const;

// Delivery Status
export const DELIVERY_STATUS = {
  PENDING: 'pending',
  SEARCHING_DRIVER: 'searching_driver',
  DRIVER_ASSIGNED: 'driver_assigned',
  DRIVER_ACCEPTED: 'driver_accepted',
  AT_PICKUP: 'at_pickup',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  AT_DROPOFF: 'at_dropoff',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

// Stream Status
export const STREAM_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  ENDED: 'ended',
  CANCELLED: 'cancelled',
} as const;

// Platform Fees
export const PLATFORM_FEES = {
  COMMISSION_PERCENTAGE: 0.10, // 10%
  PAYMENT_PROCESSING_PERCENTAGE: 0.029, // 2.9%
  PAYMENT_PROCESSING_FIXED: 0.30, // $0.30
  DELIVERY_BASE_FEE: 2.99,
  DELIVERY_PER_KM: 0.50,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  USER_SESSION: 60 * 60 * 24 * 7, // 7 days
  STORE_INFO: 60 * 5, // 5 minutes
  PRODUCT_LIST: 60 * 2, // 2 minutes
  STREAM_INFO: 30, // 30 seconds
  DRIVER_LOCATION: 10, // 10 seconds
} as const;

// JWT
export const JWT = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
} as const;

// File Upload
export const UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
  IMAGE_DIMENSIONS: {
    THUMBNAIL: { width: 300, height: 300 },
    MEDIUM: { width: 800, height: 800 },
    LARGE: { width: 1600, height: 1600 },
  },
} as const;

// Real-time
export const REALTIME = {
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  RECONNECT_INTERVAL: 5000, // 5 seconds
  MAX_RECONNECT_ATTEMPTS: 5,
} as const;

// Search
export const SEARCH = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
  DEFAULT_RESULTS_LIMIT: 20,
} as const;

// Timeouts
export const TIMEOUTS = {
  DRIVER_ASSIGNMENT: 2 * 60 * 1000, // 2 minutes
  ORDER_PREPARATION: 30 * 60 * 1000, // 30 minutes
  DELIVERY_ESTIMATE_BUFFER: 5 * 60 * 1000, // 5 minutes
} as const;
