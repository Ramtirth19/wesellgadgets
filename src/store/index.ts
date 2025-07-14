import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import authService from '../services/authService';
import orderService from '../services/orderService';

// Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  condition: 'excellent' | 'good' | 'fair' | 'refurbished';
  category: string;
  brand: string;
  images: string[];
  specifications: Record<string, string>;
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

// Store interfaces
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  checkAuth: () => Promise<void>;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

interface ProductState {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  filters: {
    category: string;
    priceRange: [number, number];
    condition: string[];
    brand: string[];
    inStock: boolean;
  };
  sortBy: 'name' | 'price-low' | 'price-high' | 'rating' | 'newest';
  searchQuery: string;
  fetchProducts: (filters?: any) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  updateFilters: (filters: Partial<ProductState['filters']>) => void;
  setSortBy: (sortBy: ProductState['sortBy']) => void;
  setSearchQuery: (query: string) => void;
  getFilteredProducts: () => Product[];
}

interface AdminState {
  orders: Order[];
  loading: boolean;
  stats: {
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalUsers: number;
  };
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

// Auth Store
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        loading: false,
        
        login: async (email: string, password: string) => {
          set({ loading: true });
          try {
            const response = await authService.login(email, password);
            if (response.success && response.data) {
              set({ 
                user: response.data.user, 
                isAuthenticated: true,
                loading: false 
              });
              return true;
            }
            set({ loading: false });
            return false;
          } catch (error) {
            set({ loading: false });
            return false;
          }
        },
        
        logout: async () => {
          await authService.logout();
          set({ user: null, isAuthenticated: false });
        },
        
        register: async (email: string, password: string, name: string) => {
          set({ loading: true });
          try {
            const response = await authService.register(name, email, password);
            if (response.success && response.data) {
              set({ 
                user: response.data.user, 
                isAuthenticated: true,
                loading: false 
              });
              return true;
            }
            set({ loading: false });
            return false;
          } catch (error) {
            set({ loading: false });
            return false;
          }
        },
        
        checkAuth: async () => {
          if (!authService.isAuthenticated()) {
            set({ user: null, isAuthenticated: false });
            return;
          }
          
          try {
            const response = await authService.getCurrentUser();
            if (response.success && response.data) {
              set({ 
                user: response.data.user, 
                isAuthenticated: true 
              });
            } else {
              set({ user: null, isAuthenticated: false });
            }
          } catch (error) {
            set({ user: null, isAuthenticated: false });
          }
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ 
          user: state.user, 
          isAuthenticated: state.isAuthenticated 
        }),
      }
    )
  )
);

// Cart Store
export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        isOpen: false,
        addItem: (product: Product, quantity = 1) => {
          const items = get().items;
          const existingItem = items.find(item => item.product.id === product.id);
          
          if (existingItem) {
            set({
              items: items.map(item =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            });
          } else {
            set({ items: [...items, { product, quantity }] });
          }
        },
        removeItem: (productId: string) => {
          set({
            items: get().items.filter(item => item.product.id !== productId),
          });
        },
        updateQuantity: (productId: string, quantity: number) => {
          if (quantity <= 0) {
            get().removeItem(productId);
            return;
          }
          
          set({
            items: get().items.map(item =>
              item.product.id === productId
                ? { ...item, quantity }
                : item
            ),
          });
        },
        clearCart: () => {
          set({ items: [] });
        },
        toggleCart: () => {
          set({ isOpen: !get().isOpen });
        },
        getTotalItems: () => {
          return get().items.reduce((total, item) => total + item.quantity, 0);
        },
        getTotalPrice: () => {
          return get().items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
        },
      }),
      {
        name: 'cart-storage',
      }
    )
  )
);

// Product Store
export const useProductStore = create<ProductState>()(
  devtools((set, get) => ({
    products: [],
    categories: [],
    loading: false,
    error: null,
    filters: {
      category: '',
      priceRange: [0, 5000],
      condition: [],
      brand: [],
      inStock: false,
    },
    sortBy: 'newest',
    searchQuery: '',
    
    fetchProducts: async (filters = {}) => {
      set({ loading: true, error: null });
      try {
        const response = await productService.getProducts(filters);
        if (response.success && response.data) {
          set({ 
            products: response.data.products,
            loading: false 
          });
        } else {
          set({ 
            products: [],
            loading: false,
            error: 'Failed to fetch products'
          });
        }
      } catch (error: any) {
        set({ 
          loading: false, 
          error: error.message || 'Failed to fetch products' 
        });
      }
    },
    
    fetchCategories: async () => {
      try {
        const response = await categoryService.getCategories();
        const categories = response.categories || response.data || [];
        set({ categories });
      } catch (error: any) {
        console.error('Failed to fetch categories:', error);
        set({ categories: [] });
      }
    },
    
    fetchProductById: async (id: string) => {
      try {
        const response = await productService.getProductById(id);
        if (response.success && response.data) {
          return response.data.product;
        }
        return null;
      } catch (error) {
        console.error('Failed to fetch product:', error);
        return null;
      }
    },
    
    updateFilters: (newFilters) => {
      set({
        filters: { ...get().filters, ...newFilters },
      });
    },
    
    setSortBy: (sortBy) => set({ sortBy }),
    
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    
    getFilteredProducts: () => {
      const { products, filters, sortBy, searchQuery } = get();
      let filtered = [...products];

      // Search filter
      if (searchQuery) {
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Category filter
      if (filters.category) {
        filtered = filtered.filter(product => product.category === filters.category);
      }

      // Price range filter
      filtered = filtered.filter(product =>
        product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
      );

      // Condition filter
      if (filters.condition.length > 0) {
        filtered = filtered.filter(product => filters.condition.includes(product.condition));
      }

      // Brand filter
      if (filters.brand.length > 0) {
        filtered = filtered.filter(product => filters.brand.includes(product.brand));
      }

      // In stock filter
      if (filters.inStock) {
        filtered = filtered.filter(product => product.inStock);
      }

      // Sorting
      switch (sortBy) {
        case 'name':
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'price-low':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }

      return filtered;
    },
  }))
);

// Admin Store
export const useAdminStore = create<AdminState>()(
  devtools((set, get) => ({
    orders: [],
    loading: false,
    stats: {
      totalOrders: 0,
      totalRevenue: 0,
      totalProducts: 0,
      totalUsers: 0,
    },
    
    fetchOrders: async () => {
      set({ loading: true });
      try {
        const response = await orderService.getAllOrdersAdmin();
        if (response.success && response.data) {
          const orders = response.data.orders || [];
          const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
          set({
            orders,
            loading: false,
            stats: {
              ...get().stats,
              totalOrders: orders.length,
              totalRevenue,
            },
          });
        } else {
          set({ loading: false });
        }
      } catch (error) {
        set({ loading: false });
        console.error('Failed to fetch orders:', error);
      }
    },
    
    updateOrderStatus: async (orderId, status) => {
      try {
        const response = await orderService.updateOrderStatus(orderId, status);
        if (response.success) {
          set({
            orders: get().orders.map(order =>
              order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order
            ),
          });
        }
      } catch (error) {
        console.error('Failed to update order status:', error);
      }
    },
    
    addProduct: async (productData) => {
      try {
        const response = await productService.createProduct(productData);
        if (response.success) {
          // Refresh products
          const productStore = useProductStore.getState();
          await productStore.fetchProducts();
        }
      } catch (error) {
        console.error('Failed to add product:', error);
      }
    },
    
    updateProduct: async (id, productData) => {
      try {
        const response = await productService.updateProduct(id, productData);
        if (response.success) {
          // Refresh products
          const productStore = useProductStore.getState();
          await productStore.fetchProducts();
        }
      } catch (error) {
        console.error('Failed to update product:', error);
      }
    },
    
    deleteProduct: async (id) => {
      try {
        const response = await productService.deleteProduct(id);
        if (response.success) {
          // Refresh products
          const productStore = useProductStore.getState();
          await productStore.fetchProducts();
        }
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    },
    
    addCategory: async (categoryData) => {
      try {
        const response = await categoryService.createCategory(categoryData);
        if (response.success) {
          // Refresh categories
          const productStore = useProductStore.getState();
          await productStore.fetchCategories();
        }
      } catch (error) {
        console.error('Failed to add category:', error);
      }
    },
    
    updateCategory: async (id, categoryData) => {
      try {
        const response = await categoryService.updateCategory(id, categoryData);
        if (response.success) {
          // Refresh categories
          const productStore = useProductStore.getState();
          await productStore.fetchCategories();
        }
      } catch (error) {
        console.error('Failed to update category:', error);
      }
    },
    
    deleteCategory: async (id) => {
      try {
        const response = await categoryService.deleteCategory(id);
        if (response.success) {
          // Refresh categories
          const productStore = useProductStore.getState();
          await productStore.fetchCategories();
        }
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    },
  }))
);