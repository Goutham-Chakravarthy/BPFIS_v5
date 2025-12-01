"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  rating: number;
  reviews: number;
  seller: {
    _id: string;
    companyName: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
    verificationStatus: string;
    rating: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function FarmerMarketplace() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState('relevance');

  // Helper function to build URLs with userId
  const buildUrl = (path: string) => {
    return userId ? `${path}?userId=${userId}` : path;
  };

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'seeds', name: 'Seeds' },
    { id: 'fertilizers', name: 'Fertilizers' },
    { id: 'pesticides', name: 'Pesticides' },
    { id: 'tools', name: 'Tools' },
    { id: 'irrigation', name: 'Irrigation' },
    { id: 'machinery', name: 'Machinery' },
    { id: 'organic', name: 'Organic' }
  ];

  useEffect(() => {
    loadProducts();
    loadCart();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/marketplace/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('marketplaceCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem('marketplaceCart', JSON.stringify(updatedCart));
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product._id === product._id);
    let updatedCart: CartItem[];
    
    if (existingItem) {
      updatedCart = cart.map(item =>
        item.product._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...cart, { product, quantity: 1 }];
    }
    
    saveCart(updatedCart);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const updatedCart = cart.map(item =>
      item.product._id === productId
        ? { ...item, quantity }
        : item
    );
    
    saveCart(updatedCart);
  };

  const removeFromCart = (productId: string) => {
    const updatedCart = cart.filter(item => item.product._id !== productId);
    saveCart(updatedCart);
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter(product =>
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        // relevance - keep original order
        break;
    }

    return filtered;
  };

  const filteredProducts = filterAndSortProducts();
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f3b2c]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1f3b2c] mb-2">Farmer Marketplace</h1>
        <p className="text-[#6b7280]">Buy quality agricultural products from trusted suppliers</p>
      </div>

      {/* Advanced Filters Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border border-[#e2d4b7] p-4">
            <h3 className="font-semibold text-[#1f3b2c] mb-4">Filters</h3>
            
            {/* Price Range Slider */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-[#1f3b2c] mb-3">Price Range</h4>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-[#6b7280]">
                  <span>₹0</span>
                  <span>₹{priceRange.max.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Category Filters */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-[#1f3b2c] mb-3">Categories</h4>
              <div className="space-y-2">
                {categories.slice(1).map(category => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCategory === category.id}
                      onChange={(e) => setSelectedCategory(e.target.checked ? category.id : 'all')}
                      className="mr-2 rounded border-[#e2d4b7] text-[#1f3b2c] focus:ring-[#1f3b2c]"
                    />
                    <span className="text-sm text-[#6b7280]">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-[#1f3b2c] mb-3">Availability</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="mr-2 rounded border-[#e2d4b7] text-[#1f3b2c] focus:ring-[#1f3b2c]"
                  />
                  <span className="text-sm text-[#6b7280]">In Stock</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2 rounded border-[#e2d4b7] text-[#1f3b2c] focus:ring-[#1f3b2c]"
                  />
                  <span className="text-sm text-[#6b7280]">Include Out of Stock</span>
                </label>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-[#1f3b2c] mb-3">Customer Rating</h4>
              <div className="space-y-2">
                {[4, 3, 2, 1].map(rating => (
                  <label key={rating} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2 rounded border-[#e2d4b7] text-[#1f3b2c] focus:ring-[#1f3b2c]"
                    />
                    <span className="text-sm text-[#6b7280]">
                      {'⭐'.repeat(rating)} & up
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Seller Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-[#1f3b2c] mb-3">Seller Type</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2 rounded border-[#e2d4b7] text-[#1f3b2c] focus:ring-[#1f3b2c]"
                  />
                  <span className="text-sm text-[#6b7280]">Verified Sellers</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2 rounded border-[#e2d4b7] text-[#1f3b2c] focus:ring-[#1f3b2c]"
                  />
                  <span className="text-sm text-[#6b7280]">Local Sellers</span>
                </label>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedCategory('all');
                setPriceRange({ min: 0, max: 10000 });
                setSearchTerm('');
              }}
              className="w-full border border-[#e2d4b7] text-[#1f3b2c] py-2 rounded-lg hover:bg-[#f9fafb] text-sm font-medium"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search and Sort Bar */}
          <div className="bg-white rounded-lg border border-[#e2d4b7] p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for seeds, fertilizers, tools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 pr-4 border border-[#e2d4b7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent text-gray-700"
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-[#e2d4b7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] focus:border-transparent text-gray-700"
              >
                <option value="relevance">Sort by Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
                <option value="bestselling">Bestselling</option>
                <option value="discount">Discount %</option>
              </select>

              {/* View Toggle */}
              <div className="flex border border-[#e2d4b7] rounded-lg">
                <button className="px-3 py-2 bg-[#1f3b2c] text-white rounded-l-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button className="px-3 py-2 hover:bg-gray-100 rounded-r-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Cart Link */}
              <Link
                href={buildUrl('/dashboard/farmer/marketplace/cart')}
                className="relative bg-[#1f3b2c] text-white px-4 py-2 rounded-lg hover:bg-[#2d4f3c] transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Cart ({cartItemsCount})</span>
              </Link>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-[#6b7280]">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </div>

      {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-lg border border-[#e2d4b7] overflow-hidden hover:shadow-lg transition-shadow group">
                {/* Product Image */}
                <div className="relative h-48 bg-gray-100">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl text-[#6b7280]">🌾</span>
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.stock < 10 && product.stock > 0 && (
                      <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded">
                        Only {product.stock} left
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                        Out of Stock
                      </div>
                    )}
                    {product.rating >= 4.5 && (
                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Bestseller
                      </div>
                    )}
                    {Math.random() > 0.7 && (
                      <div className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold">
                        -{Math.floor(Math.random() * 30 + 10)}%
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Seller Info */}
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-[#1f3b2c] rounded-full flex items-center justify-center text-white text-xs mr-2">
                      {product.seller.companyName.charAt(0)}
                    </div>
                    <span className="text-xs text-[#6b7280]">{product.seller.companyName}</span>
                    {product.seller.verificationStatus === 'verified' && (
                      <svg className="w-3 h-3 text-blue-500 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>

                  <h3 className="font-semibold text-[#1f3b2c] line-clamp-2 mb-2 group-hover:text-[#2d4f3c] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-[#6b7280] line-clamp-2 mb-3">{product.description}</p>
                  
                  {/* Rating and Reviews */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      <span className="text-yellow-400 text-sm">⭐</span>
                      <span className="text-sm text-[#6b7280] ml-1">{product.rating.toFixed(1)}</span>
                      <span className="text-sm text-[#6b7280] ml-1">({product.reviews.toLocaleString()})</span>
                    </div>
                    {product.reviews > 100 && (
                      <span className="text-xs text-green-600 ml-2 font-medium">Popular</span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-lg font-bold text-[#1f3b2c]">₹{product.price.toLocaleString()}</span>
                      {Math.random() > 0.5 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400 line-through">₹{Math.floor(product.price * 1.3).toLocaleString()}</span>
                          <span className="text-xs text-green-600 font-medium">{Math.floor(Math.random() * 30 + 10)}% off</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-xs px-2 py-1 rounded ${
                        product.stock > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </div>
                      <div className="text-xs text-[#6b7280] mt-1">
                        Free delivery
                      </div>
                    </div>
                  </div>

                  {/* Prime Badge */}
                  {Math.random() > 0.6 && (
                    <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded mb-2 inline-block">
                      🚚 Prime Delivery
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link
                      href={buildUrl(`/dashboard/farmer/marketplace/products/${product._id}`)}
                      className="flex-1 border border-[#e2d4b7] text-[#1f3b2c] py-2 rounded-lg hover:bg-[#f9fafb] text-center text-sm font-medium transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        product.stock === 0
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-[#f7941d] text-white hover:bg-[#e8850e] shadow-md hover:shadow-lg'
                      }`}
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-3 pt-3 border-t border-[#e2d4b7] flex justify-between text-xs text-[#6b7280]">
                    <span>✓ COD Available</span>
                    <span>✓ Easy Returns</span>
                    <span>✓ Warranty</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <span className="text-6xl text-[#6b7280]">🔍</span>
              <h3 className="text-xl font-semibold text-[#1f3b2c] mt-4">No products found</h3>
              <p className="text-[#6b7280] mt-2">Try adjusting your search or filters</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setPriceRange({ min: 0, max: 10000 });
                  setSearchTerm('');
                }}
                className="mt-4 bg-[#1f3b2c] text-white px-6 py-2 rounded-lg hover:bg-[#2d4f3c]"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
