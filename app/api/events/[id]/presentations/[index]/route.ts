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
    const presentationIndex = parseInt(index);
    
    if (isNaN(presentationIndex)) {
      return NextResponse.json(
        { success: false, error: 'Invalid presentation index' },
        { status: 400 }
      );
    }

    const event = await Event.findById(id).select('presentations');
    
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    if (!event.presentations || event.presentations.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No presentations found for this event' },
        { status: 404 }
      );
    }

    if (presentationIndex < 0 || presentationIndex >= event.presentations.length) {
      return NextResponse.json(
        { success: false, error: 'Presentation index out of range' },
        { status: 404 }
      );
    }

    const presentation = event.presentations[presentationIndex];
    
    if (!presentation || !presentation.data) {
      return NextResponse.json(
        { success: false, error: 'Presentation data not found' },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const download = url.searchParams.get('download') === 'true';

    if (download) {
      // Return as downloadable file
      return new NextResponse(presentation.data, {
        headers: {
          'Content-Type': presentation.contentType,
          'Content-Disposition': `attachment; filename="${presentation.filename}"`,
          'Content-Length': presentation.size.toString(),
        },
      });
    } else {
      // Return as inline PDF for viewing
      return new NextResponse(presentation.data, {
        headers: {
          'Content-Type': presentation.contentType,
          'Content-Length': presentation.size.toString(),
        },
      });
    }
  } catch (error) {
    console.error('Error fetching presentation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch presentation' },
      { status: 500 }
    );
  }
}
