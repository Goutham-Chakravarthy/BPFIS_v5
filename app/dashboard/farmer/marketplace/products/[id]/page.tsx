"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
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
    totalProducts: number;
    responseTime: string;
    shippingTime: string;
  };
  specifications?: Record<string, any>;
  shippingInfo?: {
    deliveryTime: string;
    cost: number;
    freeShippingThreshold: number;
  };
  tags: string[];
  featured?: boolean;
  discount?: number;
  prime?: boolean;
  warranty?: string;
  returnPolicy?: string;
  createdAt: string;
  updatedAt: string;
}

interface Review {
  _id: string;
  customer: {
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  helpful: number;
  verified: boolean;
  images?: string[];
  createdAt: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Helper function to build URLs with userId
  const buildUrl = (path: string) => {
    return userId ? `${path}?userId=${userId}` : path;
  };

  useEffect(() => {
    if (params.id) {
      loadProduct(params.id as string);
      loadCart();
    }
  }, [params.id]);

  useEffect(() => {
    if (product) {
      loadReviews(product._id);
      loadRelatedProducts(product.category, product._id);
    }
  }, [product]);

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/marketplace/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (productId: string) => {
    try {
      const response = await fetch(`/api/marketplace/products/${productId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  const loadRelatedProducts = async (category: string, currentProductId: string) => {
    try {
      const response = await fetch(`/api/marketplace/products?category=${category}&limit=6`);
      if (response.ok) {
        const data = await response.json();
        setRelatedProducts(data.products.filter((p: Product) => p._id !== currentProductId));
      }
    } catch (err) {
      console.error('Failed to load related products:', err);
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

  const addToCart = () => {
    if (!product) return;
    
    const existingItem = cart.find(item => item.product._id === product._id);
    let updatedCart: CartItem[];
    
    if (existingItem) {
      updatedCart = cart.map(item =>
        item.product._id === product._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      updatedCart = [...cart, { product, quantity }];
    }
    
    saveCart(updatedCart);
    
    // Show success message
    alert(`${product.name} added to cart!`);
  };

  const buyNow = () => {
    if (!product) return;
    
    // Add to cart and redirect to checkout
    const existingItem = cart.find(item => item.product._id === product._id);
    let updatedCart: CartItem[];
    
    if (existingItem) {
      updatedCart = cart.map(item =>
        item.product._id === product._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      updatedCart = [...cart, { product, quantity }];
    }
    
    saveCart(updatedCart);
    router.push(buildUrl('/dashboard/farmer/marketplace/checkout'));
  };

  const updateQuantity = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (product && newQuantity > product.stock) return;
    setQuantity(newQuantity);
  };

  const renderStars = (rating: number, size = 'text-sm') => {
    return (
      <div className={`flex items-center ${size}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f3b2c]"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-[#1f3b2c] mb-4">Product Not Found</h2>
        <p className="text-[#6b7280] mb-6">The product you're looking for doesn't exist.</p>
        <Link
          href={buildUrl('/dashboard/farmer/marketplace')}
          className="bg-[#1f3b2c] text-white px-6 py-3 rounded-lg hover:bg-[#2d4f3c]"
        >
          Back to Marketplace
        </Link>
      </div>
    );
  }
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-[#6b7280] mb-6">
        <Link href={buildUrl('/dashboard/farmer')} className="hover:text-[#1f3b2c]">Dashboard</Link>
        <span>/</span>
        <Link href={buildUrl('/dashboard/farmer/marketplace')} className="hover:text-[#1f3b2c]">Marketplace</Link>
        <span>/</span>
        <span className="text-[#1f3b2c]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl text-[#6b7280]">🌾</span>
              </div>
            )}
          </div>
          
          {/* Thumbnail Gallery */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-[#1f3b2c]' : 'border-[#e2d4b7]'
                  }`}
                >
                  <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Title and Basic Info */}
          <div>
            <h1 className="text-3xl font-bold text-[#1f3b2c] mb-2">{product.name}</h1>
            <div className="flex items-center space-x-4 mb-4">
              {renderStars(product.rating)}
              <span className="text-sm text-[#6b7280]">({product.reviewCount} reviews)</span>
              <span className="text-sm text-green-600 font-medium">In Stock</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-bold text-[#1f3b2c]">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                <span className="text-lg text-green-600 font-medium">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                </span>
              </>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {product.prime && (
              <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">🚚 Prime Delivery</span>
            )}
            {product.featured && (
              <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full">⭐ Featured</span>
            )}
            {product.discount && (
              <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full">🔥 Hot Deal</span>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-[#1f3b2c]">Quantity:</label>
            <div className="flex items-center border border-[#e2d4b7] rounded-lg">
              <button
                onClick={() => updateQuantity(quantity - 1)}
                disabled={quantity <= 1}
                className="px-3 py-2 text-[#1f3b2c] hover:bg-gray-100 disabled:opacity-50"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => updateQuantity(parseInt(e.target.value))}
                className="w-16 text-center border-x border-[#e2d4b7] py-2"
              />
              <button
                onClick={() => updateQuantity(quantity + 1)}
                disabled={quantity >= product.stock}
                className="px-3 py-2 text-[#1f3b2c] hover:bg-gray-100 disabled:opacity-50"
              >
                +
              </button>
            </div>
            <span className="text-sm text-[#6b7280]">{product.stock} available</span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={addToCart}
              disabled={product.stock === 0}
              className="w-full bg-[#f7941d] text-white py-3 rounded-lg font-semibold hover:bg-[#e8850e] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Add to Cart
            </button>
            <button
              onClick={buyNow}
              disabled={product.stock === 0}
              className="w-full bg-[#1f3b2c] text-white py-3 rounded-lg font-semibold hover:bg-[#2d4f3c] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Buy Now
            </button>
          </div>

          {/* Trust Badges */}
          <div className="border-t border-[#e2d4b7] pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-[#6b7280]">COD Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-[#6b7280]">Easy Returns</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-[#6b7280]">{product.warranty || '1 Year'} Warranty</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-[#6b7280]">Free Delivery</span>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div className="border-t border-[#e2d4b7] pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#1f3b2c]">{product.seller.companyName}</h3>
                <div className="flex items-center space-x-2 text-sm text-[#6b7280]">
                  {renderStars(product.seller.rating, 'text-xs')}
                  <span>({product.seller.totalProducts} products)</span>
                </div>
              </div>
              <Link
                href={buildUrl(`/dashboard/farmer/marketplace/seller/${product.seller._id}`)}
                className="text-[#1f3b2c] hover:text-[#2d4f3c] text-sm font-medium"
              >
                Visit Store
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="bg-white rounded-lg border border-[#e2d4b7]">
        <div className="border-b border-[#e2d4b7]">
          <nav className="flex space-x-8 px-6">
            {['description', 'specifications', 'reviews', 'shipping'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-[#1f3b2c] text-[#1f3b2c]'
                    : 'border-transparent text-[#6b7280] hover:text-[#1f3b2c]'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <p className="text-[#374151] leading-relaxed">{product.description}</p>
              <div className="mt-6">
                <h4 className="font-semibold text-[#1f3b2c] mb-3">Key Features</h4>
                <ul className="list-disc list-inside space-y-2 text-[#374151]">
                  <li>High-quality agricultural product</li>
                  <li>Suitable for Indian farming conditions</li>
                  <li>Quality tested and certified</li>
                  <li>Expert technical support available</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div>
              <h4 className="font-semibold text-[#1f3b2c] mb-4">Product Specifications</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-[#e2d4b7]">
                    <span className="text-[#6b7280] capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span className="text-[#1f3b2c] font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h4 className="font-semibold text-[#1f3b2c] mb-4">Customer Reviews</h4>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-[#e2d4b7] pb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{review.customer.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-[#1f3b2c]">{review.customer.name}</p>
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <span className="text-sm text-[#6b7280]">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[#374151]">{review.comment}</p>
                    {review.verified && (
                      <span className="inline-block mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div>
              <h4 className="font-semibold text-[#1f3b2c] mb-4">Shipping & Delivery</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">🚚</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#1f3b2c]">Standard Delivery</p>
                    <p className="text-sm text-[#6b7280]">{product.shippingInfo?.deliveryTime || '3-5 business days'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#1f3b2c]">Quality Checked</p>
                    <p className="text-sm text-[#6b7280]">All products are quality checked before dispatch</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600">↩️</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#1f3b2c]">Easy Returns</p>
                    <p className="text-sm text-[#6b7280]">{product.returnPolicy || '7 days return policy'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#1f3b2c] mb-6">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct._id} className="bg-white rounded-lg border border-[#e2d4b7] overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-100">
                  {relatedProduct.images && relatedProduct.images.length > 0 ? (
                    <img
                      src={relatedProduct.images[0]}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl text-[#6b7280]">🌾</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[#1f3b2c] line-clamp-2 mb-2">{relatedProduct.name}</h3>
                  <div className="flex items-center mb-2">
                    {renderStars(relatedProduct.rating, 'text-xs')}
                    <span className="text-xs text-[#6b7280] ml-1">({relatedProduct.reviewCount})</span>
                  </div>
                  <p className="text-lg font-bold text-[#1f3b2c] mb-3">₹{relatedProduct.price.toLocaleString()}</p>
                  <Link
                    href={buildUrl(`/dashboard/farmer/marketplace/products/${relatedProduct._id}`)}
                    className="block w-full text-center bg-[#1f3b2c] text-white py-2 rounded-lg hover:bg-[#2d4f3c] transition-colors"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  
  // Helper function to build URLs with userId
  const buildUrl = (path: string) => {
    return userId ? `${path}?userId=${userId}` : path;
  };
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showAddedToCart, setShowAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    if (productId) {
      loadProduct();
      loadReviews();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      const response = await fetch(`/api/marketplace/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      // Mock reviews for now
      const mockReviews: Review[] = [
        {
          _id: '1',
          customer: { name: 'Ramesh Kumar' },
          rating: 5,
          comment: 'Excellent quality seeds. Germination rate was very good.',
          helpful: 12,
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          customer: { name: 'Sunita Patel' },
          rating: 4,
          comment: 'Good product, delivered on time. Packaging was secure.',
          helpful: 8,
          createdAt: new Date().toISOString()
        }
      ];
      setReviews(mockReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const addToCart = () => {
    if (!product) return;

    const savedCart = localStorage.getItem('marketplaceCart');
    const cart = savedCart ? JSON.parse(savedCart) : [];
    
    const existingItem = cart.find((item: any) => item.product._id === product._id);
    let updatedCart;
    
    if (existingItem) {
      updatedCart = cart.map((item: any) =>
        item.product._id === product._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      updatedCart = [...cart, { product, quantity }];
    }
    
    localStorage.setItem('marketplaceCart', JSON.stringify(updatedCart));
    setShowAddedToCart(true);
    setTimeout(() => setShowAddedToCart(false), 3000);
  };

  const buyNow = () => {
    addToCart();
    router.push(buildUrl('/dashboard/farmer/marketplace/checkout'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f3b2c]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-[#1f3b2c]">Product not found</h2>
        <p className="text-[#6b7280] mt-2">The product you're looking for doesn't exist.</p>
        <Link
          href={buildUrl('/dashboard/farmer/marketplace')}
          className="inline-block mt-6 bg-[#1f3b2c] text-white px-6 py-3 rounded-lg hover:bg-[#2d4f3c]"
        >
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Success Message */}
      {showAddedToCart && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          ✓ Added to cart successfully!
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-[#6b7280] mb-6">
        <Link href={buildUrl('/dashboard/farmer/marketplace')} className="hover:text-[#1f3b2c]">
          Marketplace
        </Link>
        <span>/</span>
        <span className="text-[#1f3b2c]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg border border-[#e2d4b7] overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl text-[#6b7280]">No Image</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#1f3b2c] mb-2">{product.name}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                <span className="text-yellow-400">⭐</span>
                <span className="ml-1 font-semibold">{product.rating.toFixed(1)}</span>
                <span className="ml-1 text-[#6b7280]">({product.reviews} reviews)</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                product.stock > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-[#1f3b2c]">₹{product.price.toLocaleString()}</span>
              <p className="text-[#6b7280] text-sm mt-1">Inclusive of all taxes</p>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-[#1f3b2c]">Quantity:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded border border-[#e2d4b7] text-[#1f3b2c] hover:bg-[#f9fafb]"
                  >
                    -
                  </button>
                  <span className="w-16 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 rounded border border-[#e2d4b7] text-[#1f3b2c] hover:bg-[#f9fafb] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={addToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 py-3 rounded-lg font-medium ${
                    product.stock === 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-[#1f3b2c] text-white hover:bg-[#2d4f3c]'
                  }`}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button
                  onClick={buyNow}
                  disabled={product.stock === 0}
                  className={`flex-1 py-3 rounded-lg font-medium ${
                    product.stock === 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'border-2 border-[#1f3b2c] text-[#1f3b2c] hover:bg-[#1f3b2c] hover:text-white'
                  }`}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                </button>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[#1f3b2c] mb-2">Sold by {product.seller.companyName}</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-yellow-400 text-sm">⭐</span>
                <span className="ml-1 text-sm">{product.seller.rating.toFixed(1)}</span>
              </div>
              <Link
                href={buildUrl(`/dashboard/farmer/marketplace/seller/${product.seller._id}`)}
                className="text-[#1f3b2c] hover:underline text-sm"
              >
                View Store
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mt-12">
        <div className="border-b border-[#e2d4b7]">
          <nav className="flex space-x-8">
            {['description', 'specifications', 'reviews', 'shipping'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-[#1f3b2c] text-[#1f3b2c]'
                    : 'border-transparent text-[#6b7280] hover:text-[#1f3b2c]'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'description' && (
            <div className="bg-white rounded-lg border border-[#e2d4b7] p-6">
              <h3 className="font-semibold text-[#1f3b2c] mb-4">Product Description</h3>
              <p className="text-[#6b7280] whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="bg-white rounded-lg border border-[#e2d4b7] p-6">
              <h3 className="font-semibold text-[#1f3b2c] mb-4">Specifications</h3>
              {product.specifications ? (
                <div className="space-y-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-[#6b7280]">{key}</span>
                      <span className="text-[#1f3b2c] font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#6b7280]">No specifications available</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-white rounded-lg border border-[#e2d4b7] p-6">
              <h3 className="font-semibold text-[#1f3b2c] mb-4">Customer Reviews</h3>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b border-gray-100 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="font-medium text-[#1f3b2c]">{review.customer.name}</span>
                          <div className="ml-2 flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>{i < review.rating ? 'Star' : 'Empty'}</span>
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-[#6b7280]">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[#6b7280]">{review.comment}</p>
                      <div className="mt-2">
                        <button className="text-sm text-[#6b7280] hover:text-[#1f3b2c]">
                          Helpful ({review.helpful})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#6b7280]">No reviews yet. Be the first to review this product!</p>
              )}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="bg-white rounded-lg border border-[#e2d4b7] p-6">
              <h3 className="font-semibold text-[#1f3b2c] mb-4">Shipping & Delivery</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl text-[#6b7280]">Truck</div>
                  <div>
                    <h4 className="font-medium text-[#1f3b2c]">Standard Delivery</h4>
                    <p className="text-[#6b7280]">2-4 business days. Free shipping on orders above ₹500.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl text-[#6b7280]">Package</div>
                  <div>
                    <h4 className="font-medium text-[#1f3b2c]">Secure Packaging</h4>
                    <p className="text-[#6b7280]">All products are carefully packaged to prevent damage during transit.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl text-[#6b7280]">Return</div>
                  <div>
                    <h4 className="font-medium text-[#1f3b2c]">Easy Returns</h4>
                    <p className="text-[#6b7280]">7-day return policy if product is damaged or not as described.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
