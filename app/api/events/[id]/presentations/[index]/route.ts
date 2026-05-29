import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import { versionedBlobUrl } from '@/lib/blob';

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
    
    if (!presentation || !presentation.url) {
      return NextResponse.json(
        { success: false, error: 'Presentation not found' },
        { status: 404 }
      );
    }

    // Redirect to the (version-busted) blob URL. The redirect itself must not
    // be cached, or a later file change would never be picked up.
    return NextResponse.redirect(
      versionedBlobUrl(presentation.url, presentation.uploadedAt),
      {
        status: 302,
        headers: {
          'Cache-Control': 'no-store',
        }
      }
    );
  } catch (error) {
    console.error('Error fetching presentation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch presentation' },
      { status: 500 }
    );
  }
}
