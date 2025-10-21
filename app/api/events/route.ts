import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const admin = searchParams.get('admin');
    
    // For admin panel, show all events (visible and hidden)
    // For public, only show visible events
    const filter = admin === 'true' ? {} : { isVisible: true };
    
    let query = Event.find(filter).sort({ date: -1 });
    
    // Get total count
    const total = await Event.countDocuments(filter);
    
    // Apply limit if specified
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const events = await query.lean();
    
    return NextResponse.json({ success: true, data: events, total });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Verify authentication for admin operations
    const { requireAuth } = await import('@/lib/auth');
    await requireAuth(request as any);
    
    await connectDB();
    const body = await request.json();
    const event = await Event.create(body);
    
    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

