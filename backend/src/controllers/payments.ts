import Stripe from 'stripe';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Order from '../models/Order';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

const paymentController = {
  // Create Stripe payment intent
  createPaymentIntent: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { amount, currency = 'usd', orderId } = req.body;

      // Verify order belongs to user
      if (orderId) {
        const order = await Order.findById(orderId);
        if (!order || order.user.toString() !== req.user?.userId) {
          return res.status(403).json({
            success: false,
            message: 'Order not found or access denied'
          });
        }
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          userId: req.user?.userId || '',
          orderId: orderId || ''
        }
      });

      return res.json({
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id
        }
      });
    } catch (error) {
      console.error('Create payment intent error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while creating payment intent'
      });
    }
  },

  // Confirm payment and update order
  confirmPayment: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { paymentIntentId, orderId } = req.body;

      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({
          success: false,
          message: 'Payment not completed'
        });
      }

      // Update order
      const order = await Order.findById(orderId);
      if (!order || order.user.toString() !== req.user?.userId) {
        return res.status(403).json({
          success: false,
          message: 'Order not found or access denied'
        });
      }

      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        updateTime: new Date().toISOString(),
        emailAddress: paymentIntent.receipt_email || ''
      };
      order.status = 'processing';

      await order.save();

      return res.json({
        success: true,
        message: 'Payment confirmed successfully',
        data: { order }
      });
    } catch (error) {
      console.error('Confirm payment error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while confirming payment'
      });
    }
  },

  // Stripe webhook endpoint
  webhook: async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.error('Stripe webhook secret not configured');
      return res.status(400).send('Webhook secret not configured');
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);
        // Update order status if needed
        if (paymentIntent.metadata.orderId) {
          try {
            await Order.findByIdAndUpdate(paymentIntent.metadata.orderId, {
              isPaid: true,
              paidAt: new Date(),
              status: 'processing'
            });
          } catch (error) {
            console.error('Error updating order from webhook:', error);
          }
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', failedPayment.id);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return res.json({ received: true });
  }
};

export default paymentController;
