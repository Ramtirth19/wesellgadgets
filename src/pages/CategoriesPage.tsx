import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Laptop, 
  Headphones, 
  Watch, 
  Gamepad2, 
  Tablet,
  ArrowRight,
  Zap
} from 'lucide-react';
import { useProductStore } from '../store';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const CategoriesPage: React.FC = () => {
  const { categories } = useProductStore();

  const categoryIcons = {
    'Smartphones': Smartphone,
    'Laptops': Laptop,
    'Audio & Headphones': Headphones,
    'Smart Watches': Watch,
    'Gaming Consoles': Gamepad2,
    'Tablets': Tablet,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-4xl font-bold text-gray-900">
              Shop by Category
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover premium refurbished electronics across all categories. 
              Each device is thoroughly tested and comes with our quality guarantee.
            </p>
          </motion.div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {categories.map((category, index) => {
            const IconComponent = categoryIcons[category.name as keyof typeof categoryIcons] || Zap;
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/products?category=${category.name}`}>
                  <Card hover className="group overflow-hidden">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="flex items-center space-x-2 mb-2">
                          <IconComponent className="w-6 h-6" />
                          <span className="text-sm font-medium">{category.productCount} Products</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {category.description}
                      </p>
                      <div className="flex items-center text-primary-600 font-medium group-hover:text-primary-700">
                        <span>Shop Now</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-8 text-center bg-gradient-to-r from-primary-600 to-accent-600 text-white">
            <h2 className="text-2xl font-bold mb-4">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Browse all our products or use our advanced search to find exactly what you need. 
              We're constantly adding new inventory!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button variant="secondary" size="lg">
                  Browse All Products
                </Button>
              </Link>
              <Link to="/search">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600">
                  Advanced Search
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CategoriesPage;