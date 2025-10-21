import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TechItem from '@/lib/models/TechItem';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication for admin operations
    const { requireAuth } = await import('@/lib/auth');
    await requireAuth(request as any);
    
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const techItem = await TechItem.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!techItem) {
      return NextResponse.json(
        { success: false, error: 'Tech item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: techItem });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    console.error('Error updating tech item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update tech item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication for admin operations
    const { requireAuth } = await import('@/lib/auth');
    await requireAuth(request as any);
    
    await connectDB();
    const { id } = await params;
    const techItem = await TechItem.findByIdAndDelete(id);
    
    if (!techItem) {
      return NextResponse.json(
        { success: false, error: 'Tech item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: techItem });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    console.error('Error deleting tech item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete tech item' },
      { status: 500 }
    );
  }
}

