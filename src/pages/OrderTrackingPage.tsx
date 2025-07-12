import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin,
  Calendar,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';
import { formatDate, formatPrice } from '../utils/format';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

// Mock tracking data
const mockTrackingData = {
  'TRK123456789': {
    orderNumber: 'TV1234567890',
    status: 'shipped',
    estimatedDelivery: '2024-01-30T00:00:00Z',
    carrier: 'FedEx',
    trackingNumber: 'TRK123456789',
    shippingAddress: {
      name: 'John Doe',
      address: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105'
    },
    items: [
      {
        id: '1',
        name: 'iPhone 14 Pro Max',
        image: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=400',
        price: 899,
        quantity: 1
      }
    ],
    timeline: [
      {
        status: 'Order Placed',
        date: '2024-01-25T10:30:00Z',
        description: 'Your order has been received and is being processed',
        completed: true
      },
      {
        status: 'Processing',
        date: '2024-01-26T14:15:00Z',
        description: 'Your order is being prepared for shipment',
        completed: true
      },
      {
        status: 'Shipped',
        date: '2024-01-27T09:45:00Z',
        description: 'Your package has been shipped and is on its way',
        completed: true,
        location: 'San Francisco, CA'
      },
      {
        status: 'In Transit',
        date: '2024-01-28T16:20:00Z',
        description: 'Package is in transit to destination',
        completed: true,
        location: 'Oakland, CA'
      },
      {
        status: 'Out for Delivery',
        date: null,
        description: 'Package is out for delivery',
        completed: false
      },
      {
        status: 'Delivered',
        date: null,
        description: 'Package has been delivered',
        completed: false
      }
    ]
  }
};

const OrderTrackingPage: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      const data = mockTrackingData[trackingNumber.trim()];
      if (data) {
        setTrackingData(data);
        setError('');
      } else {
        setTrackingData(null);
        setError('Tracking number not found. Please check your tracking number and try again.');
      }
      setLoading(false);
    }, 1000);
  };

  const getStatusIcon = (status: string, completed: boolean) => {
    if (!completed) {
      return <Clock className="w-5 h-5 text-gray-400" />;
    }

    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-success-500" />;
      case 'shipped':
      case 'in transit':
      case 'out for delivery':
        return <Truck className="w-5 h-5 text-primary-500" />;
      default:
        return <Package className="w-5 h-5 text-warning-500" />;
    }
  };

  const getCurrentStatus = () => {
    if (!trackingData) return null;
    const completedStatuses = trackingData.timeline.filter((item: any) => item.completed);
    return completedStatuses[completedStatuses.length - 1];
  };

  const currentStatus = getCurrentStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Track Your Order
          </h1>
          <p className="text-gray-600">
            Enter your tracking number to see the latest updates on your shipment
          </p>
        </div>

        {/* Tracking Form */}
        <Card className="p-6 mb-8">
          <form onSubmit={handleTrackOrder} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter tracking number (e.g., TRK123456789)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>
              <Button type="submit" loading={loading} size="lg">
                Track Order
              </Button>
            </div>
            {error && (
              <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
                {error}
              </div>
            )}
          </form>
        </Card>

        {/* Demo Tracking Numbers */}
        {!trackingData && (
          <Card className="p-6 mb-8 bg-primary-50 border-primary-200">
            <h3 className="font-semibold text-primary-800 mb-2">Demo Tracking Numbers:</h3>
            <div className="text-sm text-primary-700">
              <p><strong>TRK123456789</strong> - Active shipment in transit</p>
            </div>
          </Card>
        )}

        {/* Tracking Results */}
        {trackingData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Order Summary */}
            <Card className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Order Information
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500">Order Number</span>
                      <p className="font-mono font-medium text-gray-900">
                        {trackingData.orderNumber}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Tracking Number</span>
                      <p className="font-mono font-medium text-gray-900">
                        {trackingData.trackingNumber}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Carrier</span>
                      <p className="font-medium text-gray-900">
                        {trackingData.carrier}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Current Status</span>
                      <div className="flex items-center space-x-2 mt-1">
                        {currentStatus && getStatusIcon(currentStatus.status, true)}
                        <Badge variant="info">
                          {currentStatus?.status || 'Processing'}
                        </Badge>
                      </div>
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
                        {formatDate(trackingData.estimatedDelivery)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Shipping Address</span>
                      <div className="text-gray-900">
                        <p className="font-medium">{trackingData.shippingAddress.name}</p>
                        <p>{trackingData.shippingAddress.address}</p>
                        <p>
                          {trackingData.shippingAddress.city}, {trackingData.shippingAddress.state} {trackingData.shippingAddress.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tracking Timeline */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Tracking Timeline
              </h2>
              <div className="space-y-6">
                {trackingData.timeline.map((event: any, index: number) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      event.completed 
                        ? 'bg-primary-100' 
                        : 'bg-gray-100'
                    }`}>
                      {getStatusIcon(event.status, event.completed)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-medium ${
                          event.completed ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {event.status}
                        </h3>
                        {event.date && (
                          <span className="text-sm text-gray-500">
                            {formatDate(event.date)}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${
                        event.completed ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {event.description}
                      </p>
                      {event.location && (
                        <div className="flex items-center space-x-1 mt-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Order Items */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Order Items
              </h2>
              <div className="space-y-4">
                {trackingData.items.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Contact Support */}
            <Card className="p-6 bg-primary-50 border-primary-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-primary-800 mb-2">
                    Need Help with Your Order?
                  </h3>
                  <p className="text-sm text-primary-700">
                    Our customer support team is here to help with any questions about your shipment.
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Support
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Support
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;