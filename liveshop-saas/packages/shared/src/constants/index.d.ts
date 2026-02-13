export declare const ORDER_STATUS_FLOW: {
    readonly pending: readonly ["confirmed", "cancelled"];
    readonly confirmed: readonly ["preparing", "cancelled"];
    readonly preparing: readonly ["ready_for_pickup", "cancelled"];
    readonly ready_for_pickup: readonly ["picked_up", "cancelled"];
    readonly picked_up: readonly ["in_transit"];
    readonly in_transit: readonly ["delivered", "failed"];
    readonly delivered: readonly [];
    readonly cancelled: readonly [];
    readonly refunded: readonly [];
    readonly disputed: readonly ["resolved"];
};
export declare const DELIVERY_STATUS_FLOW: {
    readonly pending: readonly ["searching_driver", "cancelled"];
    readonly searching_driver: readonly ["driver_assigned", "cancelled"];
    readonly driver_assigned: readonly ["driver_accepted", "cancelled"];
    readonly driver_accepted: readonly ["at_pickup", "cancelled"];
    readonly at_pickup: readonly ["picked_up", "cancelled"];
    readonly picked_up: readonly ["in_transit", "cancelled"];
    readonly in_transit: readonly ["at_dropoff", "failed"];
    readonly at_dropoff: readonly ["delivered", "failed"];
    readonly delivered: readonly [];
    readonly failed: readonly [];
    readonly cancelled: readonly [];
};
export declare const USER_ROLES: {
    readonly CUSTOMER: "customer";
    readonly STORE_OWNER: "store_owner";
    readonly STORE_STAFF: "store_staff";
    readonly DRIVER: "driver";
    readonly ADMIN: "admin";
    readonly SUPER_ADMIN: "super_admin";
};
export declare const ORDER_STATUS: {
    readonly PENDING: "pending";
    readonly CONFIRMED: "confirmed";
    readonly PREPARING: "preparing";
    readonly READY_FOR_PICKUP: "ready_for_pickup";
    readonly PICKED_UP: "picked_up";
    readonly IN_TRANSIT: "in_transit";
    readonly DELIVERED: "delivered";
    readonly CANCELLED: "cancelled";
    readonly REFUNDED: "refunded";
    readonly DISPUTED: "disputed";
};
export declare const PAYMENT_STATUS: {
    readonly PENDING: "pending";
    readonly AUTHORIZED: "authorized";
    readonly CAPTURED: "captured";
    readonly FAILED: "failed";
    readonly REFUNDED: "refunded";
    readonly PARTIALLY_REFUNDED: "partially_refunded";
};
export declare const DELIVERY_STATUS: {
    readonly PENDING: "pending";
    readonly SEARCHING_DRIVER: "searching_driver";
    readonly DRIVER_ASSIGNED: "driver_assigned";
    readonly DRIVER_ACCEPTED: "driver_accepted";
    readonly AT_PICKUP: "at_pickup";
    readonly PICKED_UP: "picked_up";
    readonly IN_TRANSIT: "in_transit";
    readonly AT_DROPOFF: "at_dropoff";
    readonly DELIVERED: "delivered";
    readonly FAILED: "failed";
    readonly CANCELLED: "cancelled";
};
export declare const STREAM_STATUS: {
    readonly SCHEDULED: "scheduled";
    readonly LIVE: "live";
    readonly ENDED: "ended";
    readonly CANCELLED: "cancelled";
};
export declare const PLATFORM_FEES: {
    readonly COMMISSION_PERCENTAGE: 0.1;
    readonly PAYMENT_PROCESSING_PERCENTAGE: 0.029;
    readonly PAYMENT_PROCESSING_FIXED: 0.3;
    readonly DELIVERY_BASE_FEE: 2.99;
    readonly DELIVERY_PER_KM: 0.5;
};
export declare const PAGINATION: {
    readonly DEFAULT_PAGE: 1;
    readonly DEFAULT_LIMIT: 20;
    readonly MAX_LIMIT: 100;
};
export declare const CACHE_TTL: {
    readonly USER_SESSION: number;
    readonly STORE_INFO: number;
    readonly PRODUCT_LIST: number;
    readonly STREAM_INFO: 30;
    readonly DRIVER_LOCATION: 10;
};
export declare const JWT: {
    readonly ACCESS_TOKEN_EXPIRY: "15m";
    readonly REFRESH_TOKEN_EXPIRY: "7d";
};
export declare const UPLOAD: {
    readonly MAX_FILE_SIZE: number;
    readonly ALLOWED_IMAGE_TYPES: readonly ["image/jpeg", "image/png", "image/webp"];
    readonly ALLOWED_VIDEO_TYPES: readonly ["video/mp4", "video/webm"];
    readonly IMAGE_DIMENSIONS: {
        readonly THUMBNAIL: {
            readonly width: 300;
            readonly height: 300;
        };
        readonly MEDIUM: {
            readonly width: 800;
            readonly height: 800;
        };
        readonly LARGE: {
            readonly width: 1600;
            readonly height: 1600;
        };
    };
};
export declare const REALTIME: {
    readonly HEARTBEAT_INTERVAL: 30000;
    readonly RECONNECT_INTERVAL: 5000;
    readonly MAX_RECONNECT_ATTEMPTS: 5;
};
export declare const SEARCH: {
    readonly MIN_QUERY_LENGTH: 2;
    readonly MAX_QUERY_LENGTH: 100;
    readonly DEFAULT_RESULTS_LIMIT: 20;
};
export declare const TIMEOUTS: {
    readonly DRIVER_ASSIGNMENT: number;
    readonly ORDER_PREPARATION: number;
    readonly DELIVERY_ESTIMATE_BUFFER: number;
};
