"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingDetails: {
    estimatedDelivery?: string;
    status: string;
    trackingNumber?: string;
  };
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const orderId = params.id as string;
  
  // Helper function to build URLs with userId
  const buildUrl = (path: string) => {
    return userId ? `${path}?userId=${userId}` : path;
  };
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      // Mock order data for now
      const mockOrder: Order = {
        _id: orderId,
        orderId: 'AGR1701234567',
        items: [
          {
            name: 'Organic Wheat Seeds',
            quantity: 2,
            price: 299,
            image: undefined
          },
          {
            name: 'Bio Fertilizer Pack',
            quantity: 1,
            price: 450,
            image: undefined
          }
        ],
        totalAmount: 1048,
        status: 'delivered',
        createdAt: '2025-11-25T10:30:00Z',
        shippingDetails: {
          estimatedDelivery: '2025-11-29T00:00:00Z',
          status: 'delivered',
          trackingNumber: 'TRK123456789'
        },
        shippingAddress: {
          fullName: 'John Farmer',
          phone: '+91 98765 43210',
          address: '123 Farm Road, Village Green',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001'
        },
        paymentMethod: 'cod'
      };
      setOrder(mockOrder);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Pending';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f3b2c]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-[#1f3b2c]">Order not found</h2>
        <p className="text-[#6b7280] mt-2">The order you're looking for doesn't exist.</p>
        <Link
          href={buildUrl('/dashboard/farmer/marketplace/orders')}
          className="inline-block mt-6 bg-[#1f3b2c] text-white px-6 py-3 rounded-lg hover:bg-[#2d4f3c]"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-[#6b7280] mb-6">
        <Link href={buildUrl('/dashboard/farmer/marketplace')} className="hover:text-[#1f3b2c]">
          Marketplace
        </Link>
        <span>/</span>
        <Link href={buildUrl('/dashboard/farmer/marketplace/orders')} className="hover:text-[#1f3b2c]">
          Orders
        </Link>
        <span>/</span>
        <span className="text-[#1f3b2c]">Order #{order.orderId}</span>
      </nav>

      {/* Order Header */}
      <div className="bg-white rounded-lg border border-[#e2d4b7] p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1f3b2c] mb-2">Order #{order.orderId}</h1>
            <p className="text-[#6b7280]">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <div className="text-right">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
            </span>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="flex items-center justify-between mb-6">
          {['confirmed', 'processing', 'shipped', 'delivered'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                order.status === step || 
                (order.status === 'delivered' && index <= 3) ||
                (order.status === 'shipped' && index <= 2) ||
                (order.status === 'processing' && index <= 1) ||
                (order.status === 'confirmed' && index <= 0)
                  ? 'bg-[#1f3b2c] text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {index + 1}
              </div>
              <span className={`ml-2 text-sm ${
                order.status === step || 
                (order.status === 'delivered' && index <= 3) ||
                (order.status === 'shipped' && index <= 2) ||
                (order.status === 'processing' && index <= 1) ||
                (order.status === 'confirmed' && index <= 0)
                  ? 'text-[#1f3b2c]' : 'text-gray-500'
              }`}>
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </span>
              {index < 3 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  order.status === 'delivered' && index <= 2 ||
                  order.status === 'shipped' && index <= 1 ||
                  order.status === 'processing' && index <= 0
                    ? 'bg-[#1f3b2c]' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-lg border border-[#e2d4b7] p-6">
            <h2 className="text-lg font-semibold text-[#1f3b2c] mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
                    ) : (
                      <span className="text-lg text-[#6b7280]">Item</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-[#1f3b2c]">{item.name}</h3>
                    <p className="text-sm text-[#6b7280]">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#1f3b2c]">₹{item.price.toLocaleString()}</p>
                    <p className="text-sm text-[#6b7280]">each</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#1f3b2c]">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-lg border border-[#e2d4b7] p-6">
            <h2 className="text-lg font-semibold text-[#1f3b2c] mb-4">Shipping Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-[#1f3b2c] mb-2">Delivery Address</h3>
                <div className="text-[#6b7280]">
                  <p className="font-medium text-[#1f3b2c]">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.phone}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                </div>
              </div>

              {order.shippingDetails.trackingNumber && (
                <div>
                  <h3 className="font-medium text-[#1f3b2c] mb-2">Tracking Information</h3>
                  <div className="text-[#6b7280]">
                    <p>Tracking Number: <span className="font-mono">{order.shippingDetails.trackingNumber}</span></p>
                    <button className="text-[#1f3b2c] hover:underline text-sm mt-1">
                      Track Package →
                    </button>
                  </div>
                </div>
              )}

              {order.shippingDetails.estimatedDelivery && (
                <div>
                  <h3 className="font-medium text-[#1f3b2c] mb-2">Estimated Delivery</h3>
                  <p className="text-[#6b7280]">
                    {new Date(order.shippingDetails.estimatedDelivery).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-[#e2d4b7] p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-[#1f3b2c] mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b7280]">Subtotal ({order.items.length} items)</span>
                <span className="text-[#1f3b2c]">₹{order.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6b7280]">Shipping</span>
                <span className="text-[#1f3b2c]">FREE</span>
              </div>
            </div>

            <div className="border-t border-[#e2d4b7] pt-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-[#1f3b2c]">Total</span>
                <span className="text-lg font-bold text-[#1f3b2c]">₹{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-medium text-[#1f3b2c] mb-2">Payment Method</h3>
              <p className="text-[#6b7280] capitalize">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {order.status === 'delivered' && (
                <button className="w-full bg-[#1f3b2c] text-white py-2 rounded-lg font-medium hover:bg-[#2d4f3c]">
                  Reorder Items
                </button>
              )}
              
              <Link
                href={buildUrl('/dashboard/farmer/marketplace')}
                className="block w-full text-center border border-[#e2d4b7] text-[#1f3b2c] py-2 rounded-lg font-medium hover:bg-[#f9fafb]"
              >
                Continue Shopping
              </Link>
              
              <Link
                href={buildUrl('/dashboard/farmer/marketplace/orders')}
                className="block w-full text-center text-[#6b7280] hover:text-[#1f3b2c] text-sm"
              >
                ← Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
