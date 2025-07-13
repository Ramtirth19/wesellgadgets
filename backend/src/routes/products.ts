import express from 'express';
import { body, query } from 'express-validator';
import { auth, adminAuth } from '../middleware/auth';
import productController from '../controllers/products';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['name', 'price', '-price', 'rating', '-rating', 'createdAt', '-createdAt']),
  query('category').optional().isMongoId().withMessage('Invalid category ID'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be non-negative'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be non-negative'),
  query('condition').optional().isIn(['excellent', 'good', 'fair', 'refurbished']),
  query('inStock').optional().isBoolean().withMessage('inStock must be boolean'),
  query('featured').optional().isBoolean().withMessage('featured must be boolean')
], productController.getAllProducts);

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', productController.getProductById);

// @route   POST /api/products
// @desc    Create product
// @access  Private/Admin
router.post('/', [auth, adminAuth], [
  body('name').trim().isLength({ min: 1 }).withMessage('Product name is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be non-negative'),
  body('category').isMongoId().withMessage('Valid category ID is required'),
  body('brand').trim().isLength({ min: 1 }).withMessage('Brand is required'),
  body('condition').isIn(['excellent', 'good', 'fair', 'refurbished']).withMessage('Invalid condition'),
  body('stockCount').isInt({ min: 0 }).withMessage('Stock count must be non-negative'),
  body('sku').trim().isLength({ min: 1 }).withMessage('SKU is required'),
  body('images').isArray({ min: 1 }).withMessage('At least one image is required')
], productController.createProduct);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
router.put('/:id', [auth, adminAuth], productController.updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete product (soft delete)
// @access  Private/Admin
router.delete('/:id', [auth, adminAuth], productController.deleteProduct);

export default router;