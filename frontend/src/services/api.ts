import axios from 'axios'
import { User, Order } from '../store/slices'

const API_BASE_URL = '/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for handling 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
          const { token } = response.data
          localStorage.setItem('token', token)
          api.defaults.headers.Authorization = `Bearer ${token}`
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }
      } catch (err) {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: Partial<User>) => api.put('/auth/profile', data),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { oldPassword, newPassword }),
  oauthCallback: (provider: string, code: string) =>
    api.post(`/auth/oauth/${provider}/callback`, { code }),
}

// Product APIs
export const productAPI = {
  getProducts: (page: number = 0, size: number = 12, category?: string, search?: string) =>
    api.get('/products', { params: { page, size, category, search } }),
  getFeaturedProducts: () =>
    api.get('/products/featured'),
  getProductById: (id: number) =>
    api.get(`/products/${id}`),
  getCategories: () =>
    api.get('/products/categories'),
  getBrandsByCategory: (category: string) =>
    api.get(`/products/categories/${category}/brands`),
  searchProducts: (query: string, page: number = 0, size: number = 12) =>
    api.get('/products/search', { params: { query, page, size } }),
  getProductReviews: (productId: number) =>
    api.get(`/products/${productId}/reviews`),
  addReview: (productId: number, data: { rating: number; title: string; comment: string }) =>
    api.post(`/products/${productId}/reviews`, data),
}

// Cart APIs
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (productId: number, quantity: number) =>
    api.post('/cart/items', { productId, quantity }),
  removeFromCart: (productId: number) =>
    api.delete(`/cart/items/${productId}`),
  updateCartItem: (productId: number, quantity: number) =>
    api.put(`/cart/items/${productId}`, { quantity }),
  clearCart: () => api.post('/cart/clear'),
}

// Order APIs
export const orderAPI = {
  getOrders: (page: number = 0, size: number = 10) =>
    api.get('/orders', { params: { page, size } }),
  getOrderById: (orderId: string) =>
    api.get(`/orders/${orderId}`),
  createOrder: (data: {
    userId: number
    userEmail?: string
    items: Array<{
      productId: number
      productSku: string
      productName: string
      productImageUrl?: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }>
    shippingAddress: string
    paymentMethod: string
    currency?: string
  }) => api.post('/orders', data),
  cancelOrder: (orderId: string) =>
    api.post(`/orders/${orderId}/cancel`),
  trackOrder: (orderId: string) =>
    api.get(`/orders/${orderId}/tracking`),
  getOrderEvents: (orderId: string) =>
    api.get(`/orders/${orderId}/events`),
}

// User APIs
export const userAPI = {
  getUser: (userId: string) =>
    api.get(`/users/${userId}`),
  getAddresses: () =>
    api.get('/users/addresses'),
  addAddress: (data: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }) => api.post('/users/addresses', data),
  updateAddress: (addressId: string, data: any) =>
    api.put(`/users/addresses/${addressId}`, data),
  deleteAddress: (addressId: string) =>
    api.delete(`/users/addresses/${addressId}`),
  getPaymentMethods: () =>
    api.get('/users/payment-methods'),
  addPaymentMethod: (data: any) =>
    api.post('/users/payment-methods', data),
  deletePaymentMethod: (paymentMethodId: string) =>
    api.delete(`/users/payment-methods/${paymentMethodId}`),
}

// Inventory APIs
export interface InventoryRecord {
  id: number
  productId: number
  availableQuantity: number
  reservedQuantity: number
  stockStatus: string
}

export const inventoryAPI = {
  getInventoryByProduct: (productId: number) =>
    api.get<InventoryRecord>(`/inventory/product/${productId}`),
  getInventoriesByProducts: (productIds: number[]) =>
    api.post<InventoryRecord[]>('/inventory/batch', productIds),
  reserveStock: (productId: number, quantity: number) =>
    api.post<InventoryRecord>('/inventory/reserve', null, { params: { productId, quantity } }),
  releaseStock: (productId: number, quantity: number) =>
    api.post<InventoryRecord>('/inventory/release', null, { params: { productId, quantity } }),
  checkStock: async (productId: number, quantity: number) => {
    const response = await api.get<InventoryRecord>(`/inventory/product/${productId}`)
    return {
      ...response,
      data: {
        ...response.data,
        inStock: response.data.availableQuantity >= quantity,
      },
    }
  },
  getProductStock: (productId: number) =>
    api.get<InventoryRecord>(`/inventory/product/${productId}`),
}

// Payment APIs
export const paymentAPI = {
  createPaymentIntent: (amount: number, orderId: string) =>
    api.post('/payments/intent', { amount, orderId }),
  confirmPayment: (paymentIntentId: string, paymentMethodId: string) =>
    api.post('/payments/confirm', { paymentIntentId, paymentMethodId }),
  getPaymentStatus: (paymentIntentId: string) =>
    api.get(`/payments/${paymentIntentId}/status`),
}

// Notification APIs
export const notificationAPI = {
  getNotifications: (page: number = 0, size: number = 20) =>
    api.get('/notifications', { params: { page, size } }),
  markAsRead: (notificationId: string) =>
    api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () =>
    api.post('/notifications/mark-all-read'),
}

// Admin APIs
export const adminAPI = {
  getDashboardStats: () =>
    api.get('/admin/dashboard/stats'),
  getUsers: (page: number = 0, size: number = 20) =>
    api.get('/admin/users', { params: { page, size } }),
  getOrderStats: () =>
    api.get('/admin/orders/stats'),
  getRevenueStats: (period: 'day' | 'week' | 'month' | 'year') =>
    api.get('/admin/revenue/stats', { params: { period } }),
  getProductPerformance: () =>
    api.get('/admin/products/performance'),
  updateOrderStatus: (orderId: string, status: string) =>
    api.put(`/admin/orders/${orderId}/status`, { status }),
}

export default api
