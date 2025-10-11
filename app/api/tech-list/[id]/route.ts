import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TechItem from '@/lib/models/TechItem';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    const techItem = await TechItem.findByIdAndUpdate(
      params.id,
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
    console.error('Error updating tech item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update tech item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const techItem = await TechItem.findByIdAndDelete(params.id);
    
    if (!techItem) {
      return NextResponse.json(
        { success: false, error: 'Tech item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: techItem });
  } catch (error) {
    console.error('Error deleting tech item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete tech item' },
      { status: 500 }
    );
  }
}

