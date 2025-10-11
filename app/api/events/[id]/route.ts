import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const event = await Event.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const event = await Event.findByIdAndDelete(id);
    
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}

