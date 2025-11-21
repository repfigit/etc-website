import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const download = searchParams.get('download') === 'true';
    
    const event = await Event.findById(id);
    
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }
    
    if (!event.presentation) {
      return NextResponse.json(
        { success: false, error: 'No presentation available for this event' },
        { status: 404 }
      );
    }
    
    // Set headers based on whether it's a download or inline view
    const headers: Record<string, string> = {
      'Content-Type': event.presentation.contentType,
      'Content-Length': event.presentation.size.toString(),
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
    };
    
    if (download) {
      // Force download with original filename
      headers['Content-Disposition'] = `attachment; filename="${event.presentation.filename}"`;
    } else {
      // Inline viewing for iframe
      headers['Content-Disposition'] = `inline; filename="${event.presentation.filename}"`;
    }
    
    // Return the PDF file with proper headers
    return new NextResponse(event.presentation.data, {
      status: 200,
      headers,
    });
    
  } catch (error) {
    console.error('Error downloading presentation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to download presentation' },
      { status: 500 }
    );
  }
}
