import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth.config';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { Product, Order } from '@/lib/models/supplier';

export async function GET() {
  try {
    // Verify admin authentication
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database if not already connected
    await connectDB();

    // Get counts for dashboard
    const [
      totalFarmers,
      totalSuppliers,
      totalProducts,
      totalSupplierOrders
    ] = await Promise.all([
      User.countDocuments({ role: 'farmer' }).catch(() => 0),
      User.countDocuments({ role: 'supplier' }).catch(() => 0),
      Product.countDocuments({ status: 'active' }).catch(() => 0),
      Order.countDocuments().catch(() => 0)
    ]);

    // Return response with basic data
    const stats = {
      totalFarmers,
      totalSuppliers,
      totalProducts,
      totalMarketplaceOrders: 0, // Will add later
      totalSupplierOrders,
      totalRevenue: 0,
      recentActivities: [],
      topProducts: [],
      recentOrders: [],
      recentActivity: []
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
