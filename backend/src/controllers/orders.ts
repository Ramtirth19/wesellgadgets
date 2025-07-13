import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Order from '../models/Order';
import Product from '../models/Product';
import { sendOrderConfirmationEmail } from '../utils/emailService';

const orderController = {
  // Create new order
  createOrder: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { items, shippingAddress, paymentMethod } = req.body;

      // Validate and calculate order totals
      let itemsPrice = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product || !product.isActive) {
          return res.status(400).json({
            success: false,
            message: `Product ${item.product} not found or inactive`
          });
        }

        if (product.stockCount < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}`
          });
        }

        const orderItem = {
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          image: product.images[0]
        };

        orderItems.push(orderItem);
        itemsPrice += product.price * item.quantity;
      }

      // Calculate shipping and tax
      const shippingPrice = itemsPrice >= 50 ? 0 : 9.99;
      const taxPrice = itemsPrice * 0.08; // 8% tax
      const totalPrice = itemsPrice + shippingPrice + taxPrice;

      // Create order
      const order = await Order.create({
        user: req.user?.userId,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
      });

      // Update product stock
      for (const item of items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stockCount: -item.quantity } }
        );
      }

      // Send confirmation email
      try {
        await sendOrderConfirmationEmail(order, shippingAddress.email);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the order creation if email fails
      }

      await order.populate('user', 'name email');

      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: { order }
      });
    } catch (error) {
      console.error('Create order error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while creating order'
      });
    }
  },

  // Get user orders
  getUserOrders: async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const orders = await Order.find({ user: req.user?.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('items.product', 'name images');

      const total = await Order.countDocuments({ user: req.user?.userId });

      return res.json({
        success: true,
        data: {
          orders,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalOrders: total
          }
        }
      });
    } catch (error) {
      console.error('Get orders error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching orders'
      });
    }
  },

  // Get order by ID
  getOrderById: async (req: Request, res: Response) => {
    try {
      const order = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate('items.product', 'name images');

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Check if user owns the order or is admin
      if (order.user._id.toString() !== req.user?.userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      return res.json({
        success: true,
        data: { order }
      });
    } catch (error) {
      console.error('Get order error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching order'
      });
    }
  },

  // Get all orders (Admin)
  getAllOrdersAdmin: async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const filter: any = {};
      if (req.query.status) {
        filter.status = req.query.status;
      }

      const orders = await Order.find(filter)
        .populate('user', 'name email')
        .populate('items.product', 'name images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Order.countDocuments(filter);

      return res.json({
        success: true,
        data: {
          orders,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalOrders: total
          }
        }
      });
    } catch (error) {
      console.error('Get admin orders error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching orders'
      });
    }
  },

  // Update order status (Admin)
  updateOrderStatus: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { status, trackingNumber } = req.body;

      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      order.status = status;
      
      if (trackingNumber) {
        order.trackingNumber = trackingNumber;
      }

      if (status === 'delivered') {
        order.isDelivered = true;
        order.deliveredAt = new Date();
      }

      await order.save();

      return res.json({
        success: true,
        message: 'Order status updated successfully',
        data: { order }
      });
    } catch (error) {
      console.error('Update order status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while updating order status'
      });
    }
  }
};

export default orderController;
