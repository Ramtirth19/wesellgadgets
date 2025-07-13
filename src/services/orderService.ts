import api from '../config/api';
import { Order, CartItem } from '../store';

export interface CreateOrderData {
  items: Array<{
    product: string;
    quantity: number;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
}

export interface OrderResponse {
  success: boolean;
  data?: {
    order?: Order;
    orders?: Order[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalOrders: number;
    };
  };
  message?: string;
}

export const orderService = {
  async createOrder(orderData: CreateOrderData): Promise<OrderResponse> {
    try {
      const response = await api.orders.create(orderData);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to create order'
      };
    }
  },

  async getUserOrders(): Promise<OrderResponse> {
    try {
      const response = await api.orders.getUserOrders();
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch orders'
      };
    }
  },

  async getOrderById(id: string): Promise<OrderResponse> {
    try {
      const response = await api.orders.getById(id);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch order'
      };
    }
  },

  async getAllOrdersAdmin(): Promise<OrderResponse> {
    try {
      const response = await api.orders.getAllAdmin();
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch orders'
      };
    }
  },

  async updateOrderStatus(id: string, status: string, trackingNumber?: string): Promise<OrderResponse> {
    try {
      const response = await api.orders.updateStatus(id, status, trackingNumber);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to update order status'
      };
    }
  },

  // Helper function to convert cart items to order format
  convertCartItemsToOrderItems(cartItems: CartItem[]) {
    return cartItems.map(item => ({
      product: item.product.id,
      quantity: item.quantity
    }));
  },
};

export default orderService;