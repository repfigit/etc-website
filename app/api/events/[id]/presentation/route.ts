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
        return NextResponse.redirect(presentation.url, {
          status: 302,
          headers: {
            'Cache-Control': 'public, max-age=31536000',
          }
        });
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
