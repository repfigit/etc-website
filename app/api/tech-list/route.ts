import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TechItem from '@/lib/models/TechItem';

export async function GET() {
  try {
    await connectDB();
    const techItems = await TechItem.find({ isVisible: true })
      .sort({ order: 1 })
      .lean();
    
    return NextResponse.json({ success: true, data: techItems });
  } catch (error) {
    console.error('Error fetching tech items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tech items' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const techItem = await TechItem.create(body);
    
    return NextResponse.json({ success: true, data: techItem }, { status: 201 });
  } catch (error) {
    console.error('Error creating tech item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create tech item' },
      { status: 500 }
    );
  }
}

