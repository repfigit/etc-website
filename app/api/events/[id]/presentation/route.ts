import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import { versionedBlobUrl } from '@/lib/blob';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    const event = await Event.findById(id).select('presentations');
    
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Check for presentations array (new format)
    if (event.presentations && event.presentations.length > 0) {
      const presentation = event.presentations[0];
      if (presentation.url) {
        // Redirect to the (version-busted) blob URL. The redirect itself must
        // not be cached, or a later file change would never be picked up.
        return NextResponse.redirect(
          versionedBlobUrl(presentation.url, presentation.uploadedAt),
          {
            status: 302,
            headers: {
              'Cache-Control': 'no-store',
            }
          }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'No presentation available for this event' },
      { status: 404 }
    );
    
  } catch (error) {
    console.error('Error fetching presentation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch presentation' },
      { status: 500 }
    );
  }
}
