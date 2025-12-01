import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/models/product';
import { Seller } from '@/lib/models/seller';
import { connectDB } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await connectDB();

    // Find product with seller information
    const product = await Product.findById(id)
      .populate('sellerId', 'companyName email phone')
      .lean();

    if (!product || product.status !== 'active') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Format product for marketplace
    const formattedProduct = {
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      images: product.images || [],
      category: product.category,
      seller: {
        _id: product.sellerId?._id,
        companyName: product.sellerId?.companyName || 'Unknown Seller',
        email: product.sellerId?.email,
        phone: product.sellerId?.phone
      },
      stock: product.inventory?.currentStock || 0,
      rating: product.rating || 0,
      reviews: product.reviewCount || 0,
      createdAt: product.createdAt,
      tags: product.tags || [],
      specifications: product.specifications || {},
      shippingInfo: product.shippingInfo || {
        weight: 1,
        dimensions: { length: 10, width: 10, height: 10 }
      },
      featured: product.featured || false
    };

    return NextResponse.json({
      product: formattedProduct
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
