import { NextRequest, NextResponse } from 'next/server';
import { MarketplaceOrder } from '@/lib/models/marketplace-order';
import { Product } from '@/lib/models/product';
import { Seller } from '@/lib/models/seller';
import { connectDB } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const orderData = await request.json();
    const { items, shippingAddress, paymentMethod, subtotal, shipping, tax, total, customerInfo } = orderData;

    await connectDB();

    // Generate unique order ID
    const orderId = `AGR${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Validate stock availability
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.status !== 'active') {
        return NextResponse.json({ error: `Product ${item.name} is not available` }, { status: 400 });
      }
      if (product.inventory?.currentStock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${item.name}` }, { status: 400 });
      }
    }

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { 'inventory.currentStock': -item.quantity },
        $set: { 'inventory.lastUpdated': new Date() }
      });
    }

    // Create order items with seller information
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      const seller = await Seller.findById(item.sellerId);
      
      orderItems.push({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        sellerId: item.sellerId,
        sellerName: seller?.companyName || 'Unknown Seller',
        image: product?.images?.[0] || null,
        subtotal: item.price * item.quantity
      });
    }

    // Create order
    const order = new MarketplaceOrder({
      orderId,
      customerDetails: {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: shippingAddress
      },
      items: orderItems,
      totalAmount: total,
      subtotal,
      shipping,
      tax,
      paymentDetails: {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'paid',
        transactionId: paymentMethod !== 'cod' ? uuidv4() : null
      },
      status: 'confirmed',
      statusHistory: [
        {
          status: 'confirmed',
          timestamp: new Date(),
          updatedBy: 'system',
          comment: 'Order placed successfully'
        }
      ],
      shippingDetails: {
        method: 'standard',
        estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        trackingNumber: null,
        status: 'processing'
      }
    });

    await order.save();

    // Group items by seller for potential seller notifications
    const itemsBySeller = orderItems.reduce((acc, item) => {
      if (!acc[item.sellerId]) {
        acc[item.sellerId] = [];
      }
      acc[item.sellerId].push(item);
      return acc;
    }, {});

    // TODO: Send notifications to sellers about new orders
    // This could be implemented with email/SMS notifications

    return NextResponse.json({
      message: 'Order placed successfully',
      order: {
        orderId,
        status: 'confirmed',
        totalAmount: total,
        estimatedDelivery: order.shippingDetails.estimatedDelivery,
        items: orderItems.length,
        customerName: customerInfo.name
      }
    });

  } catch (error) {
    console.error('Error placing order:', error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // This would be for fetching orders (customer order history)
    // For now, return empty as customer authentication is not implemented
    return NextResponse.json({
      orders: [],
      total: 0,
      page: 1,
      totalPages: 0
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
