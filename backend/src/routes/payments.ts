import express from 'express';
import { body } from 'express-validator';
import { auth } from '../middleware/auth';
import paymentController from '../controllers/payments';

const router = express.Router();

// @route   POST /api/payments/create-payment-intent
// @desc    Create Stripe payment intent
// @access  Private
router.post('/create-payment-intent', auth, [
  body('amount').isFloat({ min: 0.5 }).withMessage('Amount must be at least $0.50'),
  body('currency').optional().isIn(['usd', 'eur', 'gbp']).withMessage('Invalid currency')
], paymentController.createPaymentIntent);

// @route   POST /api/payments/confirm-payment
// @desc    Confirm payment and update order
// @access  Private
router.post('/confirm-payment', auth, [
  body('paymentIntentId').isLength({ min: 1 }).withMessage('Payment intent ID is required'),
  body('orderId').isMongoId().withMessage('Valid order ID is required')
], paymentController.confirmPayment);

// @route   POST /api/payments/webhook
// @desc    Stripe webhook endpoint
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.webhook);

export default router;