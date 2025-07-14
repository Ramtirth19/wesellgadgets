import api from '../config/api';
import { Category } from '../store';

export interface CategoryResponse {
  success?: boolean;
  categories?: Category[];
  data?: Category[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const categoryService = {
  async getCategories(): Promise<CategoryResponse> {
    try {
      const response = await api.categories.getAll();
      // Handle different response formats
      if (response.categories) {
        return response;
      } else if (Array.isArray(response)) {
        return { categories: response };
      } else if (response.data) {
        return { categories: response.data };
      }
      return { categories: [] };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { categories: [] };
    }
  },

  async getCategoryById(id: string): Promise<{ success: boolean; data?: Category; category?: Category }> {
    return api.categories.getById(id);
  },

  async getCategoryBySlug(slug: string): Promise<{ success: boolean; data?: Category; category?: Category }> {
    return api.categories.getBySlug(slug);
  },

  async createCategory(categoryData: Omit<Category, 'id'>): Promise<{ success: boolean; data: { category: Category } }> {
    return api.categories.create(categoryData);
  },

  async updateCategory(id: string, categoryData: Partial<Category>): Promise<{ success: boolean; data: { category: Category } }> {
    return api.categories.update(id, categoryData);
  },

  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    return api.categories.delete(id);
  },
};

export default categoryService;