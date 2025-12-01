import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Simulate a successful supplier login
    const mockSeller = {
      id: '65a1b2c3d4e5f6789012345', // Mock ObjectId
      _id: '65a1b2c3d4e5f6789012345',
      companyName: 'Test Supplier Company',
      email: 'test@supplier.com',
      phone: '9876543210',
      verificationStatus: 'verified',
      emailVerified: true,
      phoneVerified: true,
      isActive: true
    };

    return NextResponse.json({
      success: true,
      message: 'Supplier login simulated successfully',
      seller: mockSeller
    });

  } catch (error) {
    console.error('Error simulating login:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to simulate login'
    }, { status: 500 });
  }
}
