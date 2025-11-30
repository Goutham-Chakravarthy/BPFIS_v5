import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/db';
import { FarmerProfile } from '../../../../../lib/models/FarmerProfile';
import { getUserFromRequest } from '../../../../../lib/auth';

export async function POST(request: Request) {
  try {
    const auth = await getUserFromRequest(request);
    if (!auth || auth.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ready } = await request.json();
    const userId = auth.sub;

    await connectDB();

    // Update farmer's ready to integrate status
    const profile = await FarmerProfile.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          readyToIntegrate: ready,
          readyToIntegrateDate: ready ? new Date() : null
        }
      },
      { new: true }
    );

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: ready ? 'Marked as ready to integrate' : 'Removed from integration list',
      readyToIntegrate: ready
    });

  } catch (error) {
    console.error('Error updating ready status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const auth = await getUserFromRequest(request);
    if (!auth || auth.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = auth.sub;

    await connectDB();

    const profile = await FarmerProfile.findOne({ userId });

    return NextResponse.json({ 
      readyToIntegrate: profile?.readyToIntegrate || false,
      readyToIntegrateDate: profile?.readyToIntegrateDate
    });

  } catch (error) {
    console.error('Error getting ready status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
