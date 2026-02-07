import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me'),
};

// User API
export const userApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: any) => api.put('/users/me', data),
  getAddresses: () => api.get('/users/me/addresses'),
  addAddress: (data: any) => api.post('/users/me/addresses', data),
  updateAddress: (id: string, data: any) => api.put(`/users/me/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete(`/users/me/addresses/${id}`),
  getPaymentMethods: () => api.get('/users/me/payment-methods'),
  addPaymentMethod: (data: any) => api.post('/users/me/payment-methods', data),
  deletePaymentMethod: (id: string) => api.delete(`/users/me/payment-methods/${id}`),
  getNotifications: (params?: any) => api.get('/users/me/notifications', { params }),
  markNotificationRead: (id: string) => api.put(`/users/me/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/users/me/notifications/read-all'),
};

// Store API
export const storeApi = {
  getStores: (params?: any) => api.get('/stores', { params }),
  getMyStores: () => api.get('/stores/my-stores'),
  getStore: (idOrSlug: string) => api.get(`/stores/${idOrSlug}`),
  createStore: (data: any) => api.post('/stores', data),
  updateStore: (id: string, data: any) => api.put(`/stores/${id}`, data),
  getStoreProducts: (id: string, params?: any) => api.get(`/stores/${id}/products`, { params }),
  getStoreStreams: (id: string, params?: any) => api.get(`/stores/${id}/streams`, { params }),
  getStoreAnalytics: (id: string, params?: any) => api.get(`/stores/${id}/analytics`, { params }),
};

// Product API
export const productApi = {
  search: (params?: any) => api.get('/products/search', { params }),
  getProduct: (id: string) => api.get(`/products/${id}`),
  createProduct: (data: any) => api.post('/products', data),
  updateProduct: (id: string, data: any) => api.put(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
};

// Stream API
export const streamApi = {
  getStreams: (params?: any) => api.get('/streams', { params }),
  getStream: (id: string) => api.get(`/streams/${id}`),
  createStream: (data: any) => api.post('/streams', data),
  startStream: (id: string) => api.post(`/streams/${id}/start`),
  endStream: (id: string) => api.post(`/streams/${id}/end`),
  pinProduct: (id: string, data: any) => api.post(`/streams/${id}/pin`, data),
  getChat: (id: string, params?: any) => api.get(`/streams/${id}/chat`, { params }),
  sendMessage: (id: string, data: any) => api.post(`/streams/${id}/chat`, data),
};

// Order API
export const orderApi = {
  getMyOrders: (params?: any) => api.get('/orders/my', { params }),
  getStoreOrders: (storeId: string, params?: any) => api.get(`/orders/store/${storeId}`, { params }),
  getOrder: (id: string) => api.get(`/orders/${id}`),
  createOrder: (data: any) => api.post('/orders', data),
  updateStatus: (id: string, data: any) => api.put(`/orders/${id}/status`, data),
};

// Delivery API
export const deliveryApi = {
  getAvailable: () => api.get('/deliveries/available'),
  getMyDeliveries: (params?: any) => api.get('/deliveries/my', { params }),
  getDelivery: (id: string) => api.get(`/deliveries/${id}`),
  acceptDelivery: (id: string) => api.post(`/deliveries/${id}/accept`),
  updateStatus: (id: string, data: any) => api.put(`/deliveries/${id}/status`, data),
  updateLocation: (data: any) => api.put('/deliveries/location', data),
  toggleAvailability: () => api.post('/deliveries/toggle-availability'),
};

// Payment API
export const paymentApi = {
  createIntent: (data: any) => api.post('/payments/create-intent', data),
  capture: (data: any) => api.post('/payments/capture', data),
  refund: (data: any) => api.post('/payments/refund', data),
};
