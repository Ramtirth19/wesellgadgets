import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import { useProductStore } from '../store';
import ProductCard from '../components/product/ProductCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const {
    products,
    categories,
    loading,
    filters,
    sortBy,
    fetchProducts,
    updateFilters,
    setSortBy,
    getFilteredProducts,
  } = useProductStore();

  useEffect(() => {
    // Apply URL parameters and fetch products
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    const fetchFilters: any = {};
    if (category) fetchFilters.category = category;
    if (search) fetchFilters.search = search;
    
    // Update local filters
    if (category) {
      updateFilters({ category });
    }
    
    // Fetch products with filters
    fetchProducts(fetchFilters);
  }, [searchParams, fetchProducts, updateFilters]);

  const filteredProducts = getFilteredProducts();
  const brands = [...new Set(products.map(p => p.brand))];
  const conditions = ['excellent', 'good', 'fair', 'refurbished'];

  const handleFilterChange = (key: string, value: any) => {
    updateFilters({ [key]: value });
    
    // Apply filters and fetch new products
    const newFilters = { ...filters, [key]: value };
    const fetchFilters: any = {};
    
    if (newFilters.category) fetchFilters.category = newFilters.category;
    if (newFilters.priceRange[0] > 0) fetchFilters.minPrice = newFilters.priceRange[0];
    if (newFilters.priceRange[1] < 5000) fetchFilters.maxPrice = newFilters.priceRange[1];
    if (newFilters.condition.length > 0) fetchFilters.condition = newFilters.condition;
    if (newFilters.brand.length > 0) fetchFilters.brand = newFilters.brand;
    if (newFilters.inStock) fetchFilters.inStock = newFilters.inStock;
    
    fetchProducts(fetchFilters);
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    const newPriceRange: [number, number] = [min, max];
    updateFilters({ priceRange: newPriceRange });
    
    const fetchFilters: any = { ...filters };
    if (min > 0) fetchFilters.minPrice = min;
    if (max < 5000) fetchFilters.maxPrice = max;
    
    fetchProducts(fetchFilters);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy as any);
    fetchProducts({ ...filters, sort: newSortBy });
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            All Products
          </h1>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <p className="text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </p>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-white rounded-lg p-1 border">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name A-Z</option>
              </select>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 space-y-6`}>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <SlidersHorizontal className="w-5 h-5 mr-2" />
                Filters
              </h3>

              {/* Category Filter */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Category</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={filters.category === ''}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">All Categories</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category.name}
                        checked={filters.category === category.name}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {category.name} ({category.productCount})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3 pt-6 border-t">
                <h4 className="font-medium text-gray-900">Price Range</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange[0]}
                      onChange={(e) => handlePriceRangeChange(Number(e.target.value), filters.priceRange[1])}
                      className="text-sm"
                    />
                    <span className="text-gray-500">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange[1]}
                      onChange={(e) => handlePriceRangeChange(filters.priceRange[0], Number(e.target.value))}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Condition Filter */}
              <div className="space-y-3 pt-6 border-t">
                <h4 className="font-medium text-gray-900">Condition</h4>
                <div className="space-y-2">
                  {conditions.map((condition) => (
                    <label key={condition} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.condition.includes(condition)}
                        onChange={(e) => {
                          const newConditions = e.target.checked
                            ? [...filters.condition, condition]
                            : filters.condition.filter(c => c !== condition);
                          handleFilterChange('condition', newConditions);
                        }}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {condition === 'excellent' ? 'Like New' : condition}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div className="space-y-3 pt-6 border-t">
                <h4 className="font-medium text-gray-900">Brand</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {brands.map((brand) => (
                    <label key={brand} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.brand.includes(brand)}
                        onChange={(e) => {
                          const newBrands = e.target.checked
                            ? [...filters.brand, brand]
                            : filters.brand.filter(b => b !== brand);
                          handleFilterChange('brand', newBrands);
                        }}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {brand}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* In Stock Filter */}
              <div className="space-y-3 pt-6 border-t">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    In Stock Only
                  </span>
                </label>
              </div>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Filter className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or search criteria
                </p>
                <Button
                  onClick={() => {
                    updateFilters({
                      category: '',
                      priceRange: [0, 5000],
                      condition: [],
                      brand: [],
                      inStock: false,
                    });
                    fetchProducts();
                  }}
                >
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;