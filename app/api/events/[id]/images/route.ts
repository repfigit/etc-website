import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication for admin operations
    const { requireAuth } = await import('@/lib/auth');
    await requireAuth(request as any);

    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const index = parseInt(searchParams.get('index') || '');

    if (isNaN(index)) {
      return NextResponse.json(
        { success: false, error: 'Invalid image index' },
        { status: 400 }
      );
    }

    const event = await Event.findById(id);
    
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    if (!event.images || event.images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No images found for this event' },
        { status: 404 }
      );
    }

    if (index < 0 || index >= event.images.length) {
      return NextResponse.json(
        { success: false, error: 'Image index out of range' },
        { status: 404 }
      );
    }

    // Remove the image at the specified index
    event.images.splice(index, 1);
    
    // Update order for remaining images
    event.images = event.images.map((img: any, idx: number) => ({
      ...img,
      order: idx
    }));

    await event.save();

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication for admin operations
    const { requireAuth } = await import('@/lib/auth');
    await requireAuth(request as any);

    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { order } = body;

    if (!Array.isArray(order)) {
      return NextResponse.json(
        { success: false, error: 'Order must be an array' },
        { status: 400 }
      );
    }

    const event = await Event.findById(id);
    
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    if (!event.images || event.images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No images found for this event' },
        { status: 404 }
      );
    }

    if (order.length !== event.images.length) {
      return NextResponse.json(
        { success: false, error: 'Order array length must match number of images' },
        { status: 400 }
      );
    }

    // Reorder images based on the provided order array
    const reorderedImages = order.map((index: number) => event.images[index]).filter(Boolean);
    
    if (reorderedImages.length !== event.images.length) {
      return NextResponse.json(
        { success: false, error: 'Invalid order indices' },
        { status: 400 }
      );
    }

    // Update images with new order
    event.images = reorderedImages.map((img: any, idx: number) => ({
      ...img,
      order: idx
    }));

    await event.save();

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    console.error('Error reordering images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reorder images' },
      { status: 500 }
    );
  }
}

