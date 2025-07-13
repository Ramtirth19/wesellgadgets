import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Product from '../models/Product';
import Category from '../models/Category';

const productController = {
  // Get all products with filtering, sorting, and pagination
  getAllProducts: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const skip = (page - 1) * limit;

      // Build filter object
      const filter: any = { isActive: true };

      if (req.query.search) {
        filter.$text = { $search: req.query.search as string };
      }

      if (req.query.category) {
        filter.category = req.query.category;
      }

      if (req.query.brand) {
        filter.brand = new RegExp(req.query.brand as string, 'i');
      }

      if (req.query.minPrice || req.query.maxPrice) {
        filter.price = {};
        if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice as string);
        if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice as string);
      }

      if (req.query.condition) {
        filter.condition = req.query.condition;
      }

      if (req.query.inStock === 'true') {
        filter.inStock = true;
      }

      if (req.query.featured === 'true') {
        filter.featured = true;
      }

      // Build sort object
      let sort: any = { createdAt: -1 };
      if (req.query.sort) {
        const sortField = req.query.sort as string;
        if (sortField.startsWith('-')) {
          sort = { [sortField.substring(1)]: -1 };
        } else {
          sort = { [sortField]: 1 };
        }
      }

      const products = await Product.find(filter)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Product.countDocuments(filter);
      const totalPages = Math.ceil(total / limit);

      return res.json({
        success: true,
        data: {
          products,
          pagination: {
            currentPage: page,
            totalPages,
            totalProducts: total,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      });
    } catch (error) {
      console.error('Get products error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching products'
      });
    }
  },

  // Get single product
  getProductById: async (req: Request, res: Response) => {
    try {
      const product = await Product.findById(req.params.id)
        .populate('category', 'name slug description');

      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      return res.json({
        success: true,
        data: { product }
      });
    } catch (error) {
      console.error('Get product error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching product'
      });
    }
  },

  // Create product
  createProduct: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      // Check if category exists
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Check if SKU already exists
      const existingSku = await Product.findOne({ sku: req.body.sku.toUpperCase() });
      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: 'SKU already exists'
        });
      }

      const product = await Product.create({
        ...req.body,
        sku: req.body.sku.toUpperCase()
      });

      await product.populate('category', 'name slug');

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { product }
      });
    } catch (error) {
      console.error('Create product error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while creating product'
      });
    }
  },

  // Update product
  updateProduct: async (req: Request, res: Response) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Check if SKU is being changed and if it already exists
      if (req.body.sku && req.body.sku.toUpperCase() !== product.sku) {
        const existingSku = await Product.findOne({ 
          sku: req.body.sku.toUpperCase(),
          _id: { $ne: product._id }
        });
        if (existingSku) {
          return res.status(400).json({
            success: false,
            message: 'SKU already exists'
          });
        }
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { ...req.body, sku: req.body.sku?.toUpperCase() },
        { new: true, runValidators: true }
      ).populate('category', 'name slug');

      return res.json({
        success: true,
        message: 'Product updated successfully',
        data: { product: updatedProduct }
      });
    } catch (error) {
      console.error('Update product error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while updating product'
      });
    }
  },

  // Delete product (soft delete)
  deleteProduct: async (req: Request, res: Response) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Soft delete by setting isActive to false
      product.isActive = false;
      await product.save();

      return res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Delete product error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while deleting product'
      });
    }
  }
};

export default productController;
