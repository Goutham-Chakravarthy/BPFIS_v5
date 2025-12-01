"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

interface PaymentMethod {
  type: 'cod' | 'card' | 'upi';
  details?: {
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    upiId?: string;
  };
}

export default function FarmerMarketplaceCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Helper function to build URLs with userId
  const buildUrl = (path: string) => {
    return userId ? `${path}?userId=${userId}` : path;
  };
  
  // Form states
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    type: 'cod'
  });

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

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const shipping = subtotal >= 500 ? 0 : 50;
    return subtotal + shipping;
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(3);
  };

  const placeOrder = async () => {
    setPlacingOrder(true);
    
    try {
      const orderData = {
        items: cart.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        shippingAddress,
        paymentMethod: paymentMethod.type,
        totalAmount: getTotal()
      };

      const response = await fetch('/api/marketplace/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        // Clear cart
        localStorage.removeItem('marketplaceCart');
        // Redirect to order confirmation
        router.push(buildUrl(`/dashboard/farmer/marketplace/orders/${result.order._id}`));
      } else {
        console.error('Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f3b2c]"></div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-[#1f3b2c]">Your cart is empty</h2>
        <p className="text-[#6b7280] mt-2">Add some products to proceed with checkout</p>
        <Link
          href={buildUrl('/dashboard/farmer/marketplace')}
          className="inline-block mt-6 bg-[#1f3b2c] text-white px-6 py-3 rounded-lg hover:bg-[#2d4f3c]"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1f3b2c] mb-2">Checkout</h1>
        <p className="text-[#6b7280]">Complete your order in a few simple steps</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step
                ? 'bg-[#1f3b2c] text-white'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {step}
            </div>
            <span className={`ml-2 text-sm ${
              currentStep >= step ? 'text-[#1f3b2c]' : 'text-gray-500'
            }`}>
              {step === 1 ? 'Shipping' : step === 2 ? 'Payment' : 'Review'}
            </span>
            {step < 3 && (
              <div className={`w-16 h-0.5 mx-4 ${
                currentStep > step ? 'bg-[#1f3b2c]' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Shipping Address */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg border border-[#e2d4b7] p-6">
              <h2 className="text-lg font-semibold text-[#1f3b2c] mb-4">Shipping Address</h2>
              
              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1f3b2c] mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})}
                      className="w-full px-4 py-2 border border-[#e2d4b7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] text-gray-700"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1f3b2c] mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-[#e2d4b7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] text-gray-700"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1f3b2c] mb-2">
                    Address *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                    className="w-full px-4 py-2 border border-[#e2d4b7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] text-gray-700"
                    placeholder="Enter your street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1f3b2c] mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                      className="w-full px-4 py-2 border border-[#e2d4b7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] text-gray-700"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1f3b2c] mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                      className="w-full px-4 py-2 border border-[#e2d4b7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] text-gray-700"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1f3b2c] mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.pincode}
                      onChange={(e) => setShippingAddress({...shippingAddress, pincode: e.target.value})}
                      className="w-full px-4 py-2 border border-[#e2d4b7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] text-gray-700"
                      placeholder="Pincode"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1f3b2c] mb-2">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.landmark}
                    onChange={(e) => setShippingAddress({...shippingAddress, landmark: e.target.value})}
                    className="w-full px-4 py-2 border border-[#e2d4b7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f3b2c] text-gray-700"
                    placeholder="Nearby landmark"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1f3b2c] text-white py-3 rounded-lg font-medium hover:bg-[#2d4f3c]"
                >
                  Continue to Payment
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg border border-[#e2d4b7] p-6">
              <h2 className="text-lg font-semibold text-[#1f3b2c] mb-4">Payment Method</h2>
              
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-[#e2d4b7] rounded-lg cursor-pointer hover:bg-[#f9fafb]">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod.type === 'cod'}
                      onChange={(e) => setPaymentMethod({ type: 'cod' })}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-[#1f3b2c]">Cash on Delivery</div>
                      <div className="text-sm text-[#6b7280]">Pay when you receive the order</div>
                    </div>
                    <div className="text-4xl mb-4 text-[#6b7280]">Cash</div>
                  </label>

                  <label className="flex items-center p-4 border border-[#e2d4b7] rounded-lg cursor-pointer hover:bg-[#f9fafb]">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod.type === 'card'}
                      onChange={(e) => setPaymentMethod({ type: 'card' })}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-[#1f3b2c]">Credit/Debit Card</div>
                      <div className="text-sm text-[#6b7280]">Pay securely with your card</div>
                    </div>
                    <div className="text-4xl mb-4 text-[#6b7280]">Card</div>
                  </label>

                  <label className="flex items-center p-4 border border-[#e2d4b7] rounded-lg cursor-pointer hover:bg-[#f9fafb]">
                    <input
                      type="radio"
                      name="payment"
                      value="upi"
                      checked={paymentMethod.type === 'upi'}
                      onChange={(e) => setPaymentMethod({ type: 'upi' })}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-[#1f3b2c]">UPI Payment</div>
                      <div className="text-sm text-[#6b7280]">Pay using any UPI app</div>
                    </div>
                    <div className="text-4xl mb-4 text-[#6b7280]">Phone</div>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1f3b2c] text-white py-3 rounded-lg font-medium hover:bg-[#2d4f3c]"
                >
                  Review Order
                </button>
              </form>
            </div>
          )}

          {/* Step 3: Order Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Shipping Address Review */}
              <div className="bg-white rounded-lg border border-[#e2d4b7] p-6">
                <h2 className="text-lg font-semibold text-[#1f3b2c] mb-4">Shipping Address</h2>
                <div className="text-[#6b7280]">
                  <p className="font-medium text-[#1f3b2c]">{shippingAddress.fullName}</p>
                  <p>{shippingAddress.phone}</p>
                  <p>{shippingAddress.address}</p>
                  <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
                  {shippingAddress.landmark && <p>Near: {shippingAddress.landmark}</p>}
                </div>
              </div>

              {/* Payment Method Review */}
              <div className="bg-white rounded-lg border border-[#e2d4b7] p-6">
                <h2 className="text-lg font-semibold text-[#1f3b2c] mb-4">Payment Method</h2>
                <div className="text-[#6b7280]">
                  <p className="font-medium text-[#1f3b2c] capitalize">
                    {paymentMethod.type === 'cod' ? 'Cash on Delivery' : 
                     paymentMethod.type === 'card' ? 'Credit/Debit Card' : 'UPI Payment'}
                  </p>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={placeOrder}
                disabled={placingOrder}
                className="w-full bg-[#1f3b2c] text-white py-3 rounded-lg font-medium hover:bg-[#2d4f3c] disabled:opacity-50"
              >
                {placingOrder ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-[#e2d4b7] p-6 sticky top-6">
            <h3 className="font-semibold text-[#1f3b2c] mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-4">
              {cart.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl text-[#6b7280]">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-[#1f3b2c]">{item.product.name}</h4>
                    <p className="text-[#6b7280]">Sold by {item.product.seller.companyName}</p>
                    <p className="text-[#1f3b2c] font-semibold">₹{item.product.price.toLocaleString()} × {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#1f3b2c]">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b7280]">Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span className="text-[#1f3b2c]">₹{getSubtotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6b7280]">Shipping</span>
                <span className="text-[#1f3b2c]">
                  {getSubtotal() >= 500 ? 'FREE' : `₹50`}
                </span>
              </div>
            </div>

            <div className="border-t border-[#e2d4b7] pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-[#1f3b2c]">Total</span>
                <span className="text-lg font-bold text-[#1f3b2c]">₹{getTotal().toLocaleString()}</span>
              </div>
              
              {getSubtotal() < 500 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-800">
                    Add ₹{(500 - getSubtotal()).toLocaleString()} more for FREE shipping!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
