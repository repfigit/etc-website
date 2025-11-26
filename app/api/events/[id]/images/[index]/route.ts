import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; index: string }> }
) {
  try {
    await connectDB();
    const { id, index } = await params;
    const imageIndex = parseInt(index);
    
    if (isNaN(imageIndex)) {
      return NextResponse.json(
        { success: false, error: 'Invalid image index' },
        { status: 400 }
      );
    }

    const event = await Event.findById(id).select('images');
    
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

    // Sort images by order if available, otherwise use array index
    const sortedImages = [...event.images].sort((a: any, b: any) => {
      const orderA = a.order !== undefined ? a.order : 0;
      const orderB = b.order !== undefined ? b.order : 0;
      return orderA - orderB;
    });

    if (imageIndex < 0 || imageIndex >= sortedImages.length) {
      return NextResponse.json(
        { success: false, error: 'Image index out of range' },
        { status: 404 }
      );
    }

    const image = sortedImages[imageIndex];
    
    if (!image || !image.data) {
      return NextResponse.json(
        { success: false, error: 'Image data not found' },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const download = url.searchParams.get('download') === 'true';

    const headers: Record<string, string> = {
      'Content-Type': image.contentType,
      'Content-Length': image.size.toString(),
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
    };

    if (download) {
      // Return as downloadable file
      headers['Content-Disposition'] = `attachment; filename="${image.filename}"`;
    } else {
      // Return as inline image for viewing
      headers['Content-Disposition'] = `inline; filename="${image.filename}"`;
    }

    return new NextResponse(image.data, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}

