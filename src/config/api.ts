// API configuration and base setup
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  baseURL: API_BASE_URL,
  
  // Helper method for making requests
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('auth-token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  // Auth endpoints
  auth: {
    login: (email: string, password: string) =>
      api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    
    register: (name: string, email: string, password: string) =>
      api.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }),
    
    getMe: () => api.request('/auth/me'),
    
    logout: () => api.request('/auth/logout', { method: 'POST' }),
  },

  // Products endpoints
  products: {
    getAll: (params?: URLSearchParams) =>
      api.request(`/products${params ? `?${params.toString()}` : ''}`),
    
    getById: (id: string) => api.request(`/products/${id}`),
    
    create: (productData: any) =>
      api.request('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      }),
    
    update: (id: string, productData: any) =>
      api.request(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      }),
    
    delete: (id: string) =>
      api.request(`/products/${id}`, { method: 'DELETE' }),
  },

  // Categories endpoints
  categories: {
    getAll: () => api.request('/categories'),
    
    getById: (id: string) => api.request(`/categories/${id}`),
    
    getBySlug: (slug: string) => api.request(`/categories/slug/${slug}`),
    
    create: (categoryData: any) =>
      api.request('/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
      }),
    
    update: (id: string, categoryData: any) =>
      api.request(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData),
      }),
    
    delete: (id: string) =>
      api.request(`/categories/${id}`, { method: 'DELETE' }),
  },

  // Orders endpoints
  orders: {
    create: (orderData: any) =>
      api.request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      }),
    
    getUserOrders: () => api.request('/orders'),
    
    getById: (id: string) => api.request(`/orders/${id}`),
    
    getAllAdmin: () => api.request('/orders/admin/all'),
    
    updateStatus: (id: string, status: string, trackingNumber?: string) =>
      api.request(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, trackingNumber }),
      }),
  },

  // Payments endpoints
  payments: {
    createPaymentIntent: (amount: number, orderId?: string) =>
      api.request('/payments/create-payment-intent', {
        method: 'POST',
        body: JSON.stringify({ amount, orderId }),
      }),
    
    confirmPayment: (paymentIntentId: string, orderId: string) =>
      api.request('/payments/confirm-payment', {
        method: 'POST',
        body: JSON.stringify({ paymentIntentId, orderId }),
      }),
  },

  // Users endpoints
  users: {
    getProfile: () => api.request('/users/profile'),
    
    updateProfile: (userData: any) =>
      api.request('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
      }),
    
    getAllUsers: () => api.request('/users/users'),
    
    getUserById: (id: string) => api.request(`/users/users/${id}`),
    
    updateUser: (id: string, userData: any) =>
      api.request(`/users/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      }),
    
    deleteUser: (id: string) =>
      api.request(`/users/users/${id}`, { method: 'DELETE' }),
  },
};

export default api;