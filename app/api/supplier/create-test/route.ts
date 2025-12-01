import { NextResponse } from 'next/server';
import { Seller } from '@/lib/models/seller';
import { connectDB } from '@/lib/db';

export async function POST() {
  try {
    await connectDB();
    
    // Check if test seller already exists
    const existingSeller = await Seller.findOne({ email: 'test@supplier.com' });
    if (existingSeller) {
      return NextResponse.json({
        success: true,
        message: 'Test seller already exists',
        seller: {
          id: existingSeller._id,
          companyName: existingSeller.companyName,
          email: existingSeller.email
        }
      });
    }

    // Create test seller (without password hash for testing)
    const seller = new Seller({
      companyName: 'Test Supplier Company',
      email: 'test@supplier.com',
      phone: '9876543210',
      passwordHash: '$2a$12$test_hash_for_testing_only', // Mock hash
      address: {
        street: '123 Test Street',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India'
      },
      gstNumber: '29ABCDE1234F1ZV',
      emailVerified: true,
      phoneVerified: true,
      isActive: true,
      verificationStatus: 'verified'
    });

    await seller.save();

    console.log('✅ Test seller created:', seller._id);

    return NextResponse.json({
      success: true,
      message: 'Test seller created successfully',
      seller: {
        id: seller._id,
        companyName: seller.companyName,
        email: seller.email
      }
    });

  } catch (error) {
    console.error('❌ Error creating test seller:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create test seller'
    }, { status: 500 });
  }
}
