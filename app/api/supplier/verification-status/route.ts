import { NextResponse } from 'next/server';
import { extractTokenFromRequest, verifyAuthToken } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';

// GET /api/supplier/verification-status - Get current verification status
export async function GET(request: Request) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await verifyAuthToken(token);
    if (!user || user.role !== 'supplier') {
      return NextResponse.json(
        { error: 'Access denied. Supplier role required.' },
        { status: 403 }
      );
    }

    await connectDB();

    // Get fresh verification status from User model
    const supplierUser = await User.findById(user._id)
      .select('verificationStatus verifiedAt rejectionReason documentsUploaded');

    if (!supplierUser) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      verificationStatus: {
        documentsUploaded: supplierUser.documentsUploaded || false,
        verificationStatus: supplierUser.verificationStatus || 'pending',
        verifiedAt: supplierUser.verifiedAt,
        rejectionReason: supplierUser.rejectionReason
      }
    });
  } catch (error) {
    console.error('Failed to fetch verification status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification status' },
      { status: 500 }
    );
  }
}
