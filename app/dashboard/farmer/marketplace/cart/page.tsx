"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  seller: {
    companyName: string;
  };
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function FarmerMarketplaceCart() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Helper function to build URLs with userId
  const buildUrl = (path: string) => {
    return userId ? `${path}?userId=${userId}` : path;
  };

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('marketplaceCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setLoading(false);
  };

  const saveCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem('marketplaceCart', JSON.stringify(updatedCart));
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

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const shipping = subtotal >= 500 ? 0 : 50;
    return subtotal + shipping;
  };

  const proceedToCheckout = () => {
    router.push(buildUrl('/dashboard/farmer/marketplace/checkout'));
  };

  // Calculate totals
  const subtotal = getSubtotal();
  const shipping = subtotal >= 500 ? 0 : 50;
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + shipping + tax;

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
        <h1 className="text-2xl font-bold text-[#1f3b2c] mb-2">Shopping Cart</h1>
        <p className="text-[#6b7280]">Review and manage your selected products</p>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-16 h-16 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-[#1f3b2c] mb-4">Your cart is empty</h3>
          <p className="text-[#6b7280] mb-6">Add some agricultural products to get started</p>
          <div className="space-y-4">
            <Link
              href={buildUrl('/dashboard/farmer/marketplace')}
              className="inline-block bg-[#1f3b2c] text-white px-6 py-3 rounded-lg hover:bg-[#2d4f3c] font-medium"
            >
              Continue Shopping
            </Link>
            <div className="text-sm text-[#6b7280]">
              <p className="mb-2">🌾 Popular Categories:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Link href={buildUrl('/dashboard/farmer/marketplace?category=seeds')} className="text-[#1f3b2c] hover:underline">Seeds</Link>
                <span>•</span>
                <Link href={buildUrl('/dashboard/farmer/marketplace?category=fertilizers')} className="text-[#1f3b2c] hover:underline">Fertilizers</Link>
                <span>•</span>
                <Link href={buildUrl('/dashboard/farmer/marketplace?category=tools')} className="text-[#1f3b2c] hover:underline">Tools</Link>
                <span>•</span>
                <Link href={buildUrl('/dashboard/farmer/marketplace?category=irrigation')} className="text-[#1f3b2c] hover:underline">Irrigation</Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Header */}
            <div className="bg-white rounded-lg border border-[#e2d4b7] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[#1f3b2c]">
                  Shopping Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
                </h2>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear your cart?')) {
                      saveCart([]);
                    }
                  }}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Clear Cart
                </button>
              </div>
              
              <div className="space-y-6">
                {cart.map((item) => (
                  <div key={item.product._id} className="border border-[#e2d4b7] rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                        {item.product.images && item.product.images.length > 0 ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl text-[#6b7280]">🌾</span>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link
                              href={buildUrl(`/dashboard/farmer/marketplace/products/${item.product._id}`)}
                              className="font-semibold text-[#1f3b2c] hover:text-[#2d4f3c] line-clamp-2"
                            >
                              {item.product.name}
                            </Link>
                            <p className="text-sm text-[#6b7280] mt-1">
                              Sold by <span className="text-[#1f3b2c]">{item.product.seller.companyName}</span>
                            </p>
                            <div className="flex items-center mt-2">
                              <span className="text-yellow-400 text-sm">⭐</span>
                              <span className="text-sm text-[#6b7280] ml-1">{item.product.rating}</span>
                              <span className="text-sm text-[#6b7280] ml-1">({item.product.reviewCount})</span>
                            </div>
                            
                            {/* Stock Status */}
                            <div className="mt-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                item.product.stock > 5 
                                  ? 'bg-green-100 text-green-800' 
                                  : item.product.stock > 0 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                {item.product.stock > 0 ? `${item.product.stock} in stock` : 'Out of stock'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.product._id)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-3">
                            <label className="text-sm font-medium text-[#6b7280]">Qty:</label>
                            <div className="flex items-center border border-[#e2d4b7] rounded-lg">
                              <button
                                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="px-2 py-1 text-[#1f3b2c] hover:bg-gray-100 disabled:opacity-50"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.product._id, parseInt(e.target.value))}
                                className="w-16 text-center border-x border-[#e2d4b7] py-1"
                                min="1"
                                max={item.product.stock}
                              />
                              <button
                                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock}
                                className="px-2 py-1 text-[#1f3b2c] hover:bg-gray-100 disabled:opacity-50"
                              >
                                +
                              </button>
                            </div>
                            {item.quantity >= item.product.stock && (
                              <span className="text-xs text-red-600">Max quantity reached</span>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold text-[#1f3b2c]">
                              ₹{(item.product.price * item.quantity).toLocaleString()}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-sm text-[#6b7280]">
                                ₹{item.product.price.toLocaleString()} each
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="mt-3 pt-3 border-t border-[#e2d4b7]">
                          <div className="flex items-center text-sm text-[#6b7280]">
                            <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Free delivery on orders above ₹500
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Products */}
            <div className="bg-white rounded-lg border border-[#e2d4b7] p-6">
              <h3 className="text-lg font-semibold text-[#1f3b2c] mb-4">Frequently bought together</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mock recommended products */}
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 border border-[#e2d4b7] rounded-lg hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl text-[#6b7280]">🌱</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-[#1f3b2c] text-sm line-clamp-1">Organic Fertilizer Pack</h4>
                      <p className="text-sm text-[#6b7280]">₹299</p>
                    </div>
                    <button className="bg-[#1f3b2c] text-white px-3 py-1 rounded text-sm hover:bg-[#2d4f3c]">
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-[#e2d4b7] p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-[#1f3b2c] mb-4">Order Summary</h3>
              
              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b7280]">Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span className="text-[#1f3b2c]">₹{subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b7280]">Shipping</span>
                  <span className="text-[#1f3b2c]">
                    {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString()}`}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b7280]">Tax (GST 18%)</span>
                  <span className="text-[#1f3b2c]">₹{tax.toLocaleString()}</span>
                </div>
                
                {subtotal < 500 && (
                  <div className="bg-green-50 text-green-700 text-xs p-2 rounded">
                    Add ₹{(500 - subtotal).toLocaleString()} more for FREE shipping!
                  </div>
                )}
                
                <div className="border-t border-[#e2d4b7] pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-[#1f3b2c]">Total</span>
                    <span className="text-lg font-bold text-[#1f3b2c]">₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    className="flex-1 px-3 py-2 border border-[#e2d4b7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] text-gray-700"
                  />
                  <button className="bg-[#1f3b2c] text-white px-4 py-2 rounded-lg hover:bg-[#2d4f3c] text-sm">
                    Apply
                  </button>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={proceedToCheckout}
                className="w-full bg-[#f7941d] text-white py-3 rounded-lg font-semibold hover:bg-[#e8850e] transition-colors mb-4"
              >
                Proceed to Checkout
              </button>

              {/* Security Badges */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center space-x-2 text-xs text-[#6b7280]">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center justify-center space-x-4 text-xs text-[#6b7280]">
                  <span>🔒 SSL Encrypted</span>
                  <span>💳 Safe Payment</span>
                  <span>🛡️ Buyer Protection</span>
                </div>
              </div>

              {/* Accepted Payments */}
              <div className="mt-6 pt-6 border-t border-[#e2d4b7]">
                <p className="text-xs text-[#6b7280] mb-3">Accepted Payment Methods</p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-8 h-5 bg-gray-200 rounded text-xs flex items-center justify-center">COD</div>
                  <div className="w-8 h-5 bg-gray-200 rounded text-xs flex items-center justify-center">UPI</div>
                  <div className="w-8 h-5 bg-gray-200 rounded text-xs flex items-center justify-center">Card</div>
                  <div className="w-8 h-5 bg-gray-200 rounded text-xs flex items-center justify-center">Net</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trust Signals */}
      {cart.length > 0 && (
        <div className="mt-8 bg-white rounded-lg border border-[#e2d4b7] p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600">🚚</span>
              </div>
              <h4 className="font-semibold text-[#1f3b2c] mb-1">Fast Delivery</h4>
              <p className="text-sm text-[#6b7280]">3-5 business days</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600">↩️</span>
              </div>
              <h4 className="font-semibold text-[#1f3b2c] mb-1">Easy Returns</h4>
              <p className="text-sm text-[#6b7280]">7 days return policy</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600">💬</span>
              </div>
              <h4 className="font-semibold text-[#1f3b2c] mb-1">24/7 Support</h4>
              <p className="text-sm text-[#6b7280]">Dedicated help desk</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600">✓</span>
              </div>
              <h4 className="font-semibold text-[#1f3b2c] mb-1">Quality Assured</h4>
              <p className="text-sm text-[#6b7280]">100% genuine products</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
