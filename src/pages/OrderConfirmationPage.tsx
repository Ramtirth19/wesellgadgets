import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Mail, 
  Package, 
  Truck, 
  Calendar,
  ArrowRight,
  Download,
  MessageCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { formatPrice } from '../utils/format';

const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const { orderTotal, orderNumber, email } = location.state || {};

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Order Details */}
          <Card className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Order Number</span>
                    <p className="font-mono font-medium text-gray-900">
                      {orderNumber || 'TV1234567890'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Order Total</span>
                    <p className="text-xl font-bold text-gray-900">
                      {formatPrice(orderTotal || 899)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email</span>
                    <p className="font-medium text-gray-900">
                      {email || 'customer@example.com'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Delivery Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Estimated Delivery</span>
                    <p className="font-medium text-gray-900">
                      {estimatedDelivery.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Shipping Method</span>
                    <p className="font-medium text-gray-900">
                      Standard Shipping (5-7 business days)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* What's Next */}
          <Card className="p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              What happens next?
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Order Confirmation Email</h3>
                  <p className="text-sm text-gray-600">
                    We've sent a confirmation email with your order details to {email || 'your email address'}.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-warning-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Order Processing</h3>
                  <p className="text-sm text-gray-600">
                    Your order is being prepared for shipment. This usually takes 1-2 business days.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="w-4 h-4 text-success-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Shipping & Delivery</h3>
                  <p className="text-sm text-gray-600">
                    Once shipped, you'll receive tracking information to monitor your package.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="grid md:grid-cols-2 gap-4">
            <Link to="/orders">
              <Button variant="outline" size="lg" className="w-full">
                <Package className="w-5 h-5 mr-2" />
                Track Your Order
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full">
              <Download className="w-5 h-5 mr-2" />
              Download Receipt
            </Button>
          </div>

          {/* Continue Shopping */}
          <div className="text-center">
            <Link to="/products">
              <Button size="lg">
                Continue Shopping
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Support */}
          <Card className="p-6 text-center bg-primary-50 border-primary-200">
            <MessageCircle className="w-8 h-8 text-primary-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Need Help?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Our customer support team is here to help with any questions about your order.
            </p>
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;