import { NextRequest, NextResponse } from 'next/server';
import { Seller } from '@/lib/models/seller';
import { Product } from '@/lib/models/product';
import { connectDB } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectDB();

    // Find seller
    const seller = await Seller.findById(id).lean();

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    // Get seller's products
    const products = await Product.find({ sellerId: id, status: 'active' })
      .select('name description price images category rating reviewCount inventory.createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate seller metrics
    const totalProducts = products.length;
    const avgRating = 4.5; // Mock rating - would be calculated from reviews
    const totalReviews = 128; // Mock review count - would be calculated from reviews

    // Format seller data
    const formattedSeller = {
      _id: seller._id,
      companyName: seller.companyName,
      email: seller.email,
      phone: seller.phone,
      address: seller.address,
      gstNumber: seller.gstNumber,
      businessDetails: seller.businessDetails,
      verificationStatus: seller.verificationStatus,
      rating: avgRating,
      totalReviews,
      responseTime: '2 hours',
      shippingTime: '2-4 days',
      returnPolicy: '7-day return policy for damaged or incorrect products',
      createdAt: seller.createdAt,
      totalProducts
    };

    return NextResponse.json({
      seller: formattedSeller
    });
  } catch (error) {
    console.error('Error fetching seller:', error);
    return NextResponse.json({ error: 'Failed to fetch seller' }, { status: 500 });
  }
}
