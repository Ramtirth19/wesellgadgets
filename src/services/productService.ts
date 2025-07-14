import api from '../config/api';
import { Product } from '../store';

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string[];
  brand?: string[];
  inStock?: boolean;
  featured?: boolean;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ProductResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalProducts: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export const productService = {
  async getProducts(filters: ProductFilters = {}): Promise<ProductResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    return api.products.getAll(params);
  },

  async getProductById(id: string): Promise<{ success: boolean; data: { product: Product } }> {
    return api.products.getById(id);
  },

  async createProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<{ success: boolean; data: { product: Product } }> {
    return api.products.create(productData);
  },

  async updateProduct(id: string, productData: Partial<Product>): Promise<{ success: boolean; data: { product: Product } }> {
    return api.products.update(id, productData);
  },

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    return api.products.delete(id);
  },

  async searchProducts(query: string): Promise<ProductResponse> {
    return this.getProducts({ search: query });
  },

  async getFeaturedProducts(): Promise<ProductResponse> {
    return this.getProducts({ featured: true, limit: 8 });
  },

  async getProductsByCategory(category: string): Promise<ProductResponse> {
    return this.getProducts({ category });
  },
};

export default productService;