"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

interface CartItem {
  product: Product;
  quantity: number;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  seller: {
    companyName: string;
  };
  category: string;
  stock: number;
  rating: number;
  reviewCount: number;
}

export default function FarmerMarketplacePage() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockProducts: Product[] = [
      {
        _id: '1',
        name: 'Premium Organic Seeds - Tomato',
        price: 299,
        images: [],
        seller: { companyName: 'AgriSeeds India' },
        category: 'seeds',
        stock: 50,
        rating: 4.5,
        reviewCount: 128
      },
      {
        _id: '2',
        name: 'NPK Fertilizer 20-20-20',
        price: 450,
        images: [],
        seller: { companyName: 'GreenGrow Fertilizers' },
        category: 'fertilizers',
        stock: 25,
        rating: 4.3,
        reviewCount: 89
      },
      {
        _id: '3',
        name: 'Drip Irrigation Kit',
        price: 2500,
        images: [],
        seller: { companyName: 'Irrigation Solutions' },
        category: 'irrigation',
        stock: 15,
        rating: 4.7,
        reviewCount: 56
      },
      {
        _id: '4',
        name: 'Garden Tool Set - 5 Pieces',
        price: 899,
        images: [],
        seller: { companyName: 'FarmTools Co.' },
        category: 'tools',
        stock: 30,
        rating: 4.2,
        reviewCount: 203
      }
    ];

    setTimeout(() => {
      let filteredProducts = mockProducts;
      
      if (category) {
        filteredProducts = mockProducts.filter(p => p.category === category);
      }
      
      if (searchTerm) {
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setProducts(filteredProducts);
      setLoading(false);
    }, 500);
  }, [category, searchTerm]);

  const categories = [
    { id: 'seeds', name: 'Seeds', icon: '🌱' },
    { id: 'fertilizers', name: 'Fertilizers', icon: '🧪' },
    { id: 'tools', name: 'Tools', icon: '🔧' },
    { id: 'irrigation', name: 'Irrigation', icon: '💧' }
  ];

  const addToCart = (product: Product) => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem('marketplaceCart') || '[]');
    const existingItem = cart.find((item: CartItem) => item.product._id === product._id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ product, quantity: 1 });
    }
    
    localStorage.setItem('marketplaceCart', JSON.stringify(cart));
    alert('Product added to cart!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f3b2c]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1f3b2c] mb-2">AgriLink Marketplace</h1>
        <p className="text-[#6b7280]">Quality agricultural products for your farming needs</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search for seeds, fertilizers, tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-[#e2d4b7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f3b2c]"
            />
          </div>
          <Link
            href="/dashboard/farmer/marketplace/cart"
            className="bg-[#1f3b2c] text-white px-6 py-2 rounded-lg hover:bg-[#2d4f3c] flex items-center gap-2"
          >
            🛒 View Cart
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[#1f3b2c] mb-4">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/dashboard/farmer/marketplace?category=${cat.id}`}
              className={`p-4 rounded-lg border transition-colors ${
                category === cat.id 
                  ? 'border-[#1f3b2c] bg-[#1f3b2c] text-white' 
                  : 'border-[#e2d4b7] bg-white hover:border-[#1f3b2c]'
              }`}
            >
              <div className="text-2xl mb-2">{cat.icon}</div>
              <div className="font-medium">{cat.name}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1f3b2c]">
            {category ? categories.find(c => c.id === category)?.name : 'All Products'} 
            <span className="text-sm text-[#6b7280] ml-2">({products.length} products)</span>
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-[#6b7280]">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-[#1f3b2c] mb-2">No products found</h3>
            <p className="text-[#6b7280] mb-4">Try adjusting your search or browse our categories</p>
            <Link
              href="/dashboard/farmer/marketplace"
              className="text-[#1f3b2c] hover:underline"
            >
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white border border-[#e2d4b7] rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {/* Product Image */}
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={192}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl text-[#6b7280]">🌾</span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <Link
                    href={`/dashboard/farmer/marketplace/products/${product._id}`}
                    className="font-semibold text-[#1f3b2c] hover:text-[#2d4f3c] line-clamp-2"
                  >
                    {product.name}
                  </Link>
                  
                  <p className="text-sm text-[#6b7280] mt-1">
                    by {product.seller.companyName}
                  </p>

                  <div className="flex items-center mt-2">
                    <span className="text-yellow-400 text-sm">⭐</span>
                    <span className="text-sm text-[#6b7280] ml-1">{product.rating}</span>
                    <span className="text-sm text-[#6b7280] ml-1">({product.reviewCount})</span>
                  </div>

                  <div className="mt-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      product.stock > 10 
                        ? 'bg-green-100 text-green-800' 
                        : product.stock > 0 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-[#1f3b2c]">
                        ₹{product.price.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        product.stock === 0
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-[#1f3b2c] text-white hover:bg-[#2d4f3c]'
                      }`}
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}