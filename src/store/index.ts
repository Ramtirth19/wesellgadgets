import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<boolean>;
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
  filters: {
    category: string;
    priceRange: [number, number];
    condition: string[];
    brand: string[];
    inStock: boolean;
  };
  sortBy: 'name' | 'price-low' | 'price-high' | 'rating' | 'newest';
  searchQuery: string;
  setProducts: (products: Product[]) => void;
  setCategories: (categories: Category[]) => void;
  updateFilters: (filters: Partial<ProductState['filters']>) => void;
  setSortBy: (sortBy: ProductState['sortBy']) => void;
  setSearchQuery: (query: string) => void;
  getFilteredProducts: () => Product[];
}

interface AdminState {
  orders: Order[];
  stats: {
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalUsers: number;
  };
  setOrders: (orders: Order[]) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
}

// Auth Store
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        login: async (email: string, password: string) => {
          // Dummy authentication
          if (email === 'admin@techvault.com' && password === 'admin123') {
            const user: User = {
              id: '1',
              email,
              name: 'Admin User',
              role: 'admin',
            };
            set({ user, isAuthenticated: true });
            return true;
          } else if (email && password) {
            const user: User = {
              id: '2',
              email,
              name: 'Customer User',
              role: 'customer',
            };
            set({ user, isAuthenticated: true });
            return true;
          }
          return false;
        },
        logout: () => {
          set({ user: null, isAuthenticated: false });
        },
        register: async (email: string, password: string, name: string) => {
          // Dummy registration
          if (email && password && name) {
            const user: User = {
              id: Date.now().toString(),
              email,
              name,
              role: 'customer',
            };
            set({ user, isAuthenticated: true });
            return true;
          }
          return false;
        },
      }),
      {
        name: 'auth-storage',
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
    filters: {
      category: '',
      priceRange: [0, 5000],
      condition: [],
      brand: [],
      inStock: false,
    },
    sortBy: 'newest',
    searchQuery: '',
    setProducts: (products) => set({ products }),
    setCategories: (categories) => set({ categories }),
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
    stats: {
      totalOrders: 0,
      totalRevenue: 0,
      totalProducts: 0,
      totalUsers: 0,
    },
    setOrders: (orders) => {
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      set({
        orders,
        stats: {
          ...get().stats,
          totalOrders: orders.length,
          totalRevenue,
        },
      });
    },
    updateOrderStatus: (orderId, status) => {
      set({
        orders: get().orders.map(order =>
          order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order
        ),
      });
    },
    addProduct: (productData) => {
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      const productStore = useProductStore.getState();
      productStore.setProducts([...productStore.products, newProduct]);
    },
    updateProduct: (id, productData) => {
      const productStore = useProductStore.getState();
      const updatedProducts = productStore.products.map(product =>
        product.id === id ? { ...product, ...productData } : product
      );
      productStore.setProducts(updatedProducts);
    },
    deleteProduct: (id) => {
      const productStore = useProductStore.getState();
      const updatedProducts = productStore.products.filter(product => product.id !== id);
      productStore.setProducts(updatedProducts);
    },
    addCategory: (categoryData) => {
      const newCategory: Category = {
        ...categoryData,
        id: Date.now().toString(),
      };
      
      const productStore = useProductStore.getState();
      productStore.setCategories([...productStore.categories, newCategory]);
    },
    updateCategory: (id, categoryData) => {
      const productStore = useProductStore.getState();
      const updatedCategories = productStore.categories.map(category =>
        category.id === id ? { ...category, ...categoryData } : category
      );
      productStore.setCategories(updatedCategories);
    },
    deleteCategory: (id) => {
      const productStore = useProductStore.getState();
      const updatedCategories = productStore.categories.filter(category => category.id !== id);
      productStore.setCategories(updatedCategories);
    },
  }))
);