import { NextResponse, NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/withAdminAuth';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(async (request: NextRequest) => {
    try {
      const { id } = await params;
      await connectDB();
      
      // Find supplier by ID from User model (new registration system)
      const supplier = await User.findOne({ _id: id, role: 'supplier' })
        .select('-password -__v');

      if (!supplier) {
        return NextResponse.json(
          { error: 'Supplier not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: supplier
      });
    } catch (error) {
      console.error('Error fetching supplier:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  })(request, { params });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(async (request: NextRequest) => {
    try {
      await connectDB();
      
      const resolvedParams = await context.params;
      const id = resolvedParams.id;
      const body = await request.json();
      const { status } = body;
      
      // Find supplier by ID from User model (new registration system)
      const supplier = await User.findOne({ _id: id, role: 'supplier' });
      if (!supplier) {
        return NextResponse.json(
          { error: 'Supplier not found' },
          { status: 404 }
        );
      }
      
      (supplier as any).status = status;
      await supplier.save();
      
      return NextResponse.json({ message: 'Supplier status updated successfully' });
      
    } catch (error) {
      console.error('Error updating supplier status:', error);
      return NextResponse.json(
        { error: 'Failed to update supplier status' },
        { status: 500 }
      );
    }
  })(request, context);
}
