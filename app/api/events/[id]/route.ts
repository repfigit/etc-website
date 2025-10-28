import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import { logger } from '@/lib/logger';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    // Check if this is an admin request
    const url = new URL(request.url);
    const admin = url.searchParams.get('admin');
    
    // Only exclude presentation data for public API calls, not admin
    const selectFields = admin === 'true' ? '' : '-presentations.data';
    const event = await Event.findById(id).select(selectFields);
    
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    logger.error('Error fetching event', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication for admin operations
    const { requireAuth } = await import('@/lib/auth');
    await requireAuth(request as any);
    
    await connectDB();
    const { id } = await params;
    
    // Check if request contains FormData (with presentation) or JSON
    const contentType = request.headers.get('content-type') || '';
    let body: any;
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData with presentation
      const formData = await request.formData();
      
      body = {
        date: formData.get('date'),
        time: formData.get('time'),
        presenter: formData.get('presenter'),
        presenterUrl: formData.get('presenterUrl'),
        topic: formData.get('topic'),
        location: formData.get('location'),
        locationUrl: formData.get('locationUrl'),
        isVisible: formData.get('isVisible') === 'true',
        content: formData.get('content')
      };
      
      // Handle multiple presentation files
      const presentationFiles = formData.getAll('presentations') as File[];
      const presentationsToKeep = formData.getAll('keepPresentations') as string[];
      
      // Always process presentations when editing (even if empty)
      // Get existing presentations and filter to only keep specified ones
      let existingPresentations = [];
      if (presentationsToKeep.length > 0) {
        const existingEvent = await Event.findById(id).select('presentations');
        existingPresentations = (existingEvent?.presentations || [])
          .filter(p => presentationsToKeep.includes(p.filename));
      }
      
      body.presentations = [...existingPresentations];
      
      // Add new files
      for (const file of presentationFiles) {
        if (file instanceof File && file.size > 0) {
          try {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            body.presentations.push({
              filename: file.name,
              data: buffer,
              contentType: file.type,
              size: file.size,
              uploadedAt: new Date()
            });
          } catch (fileError) {
            logger.error('Error processing presentation file', fileError);
            // Continue without this file rather than failing the entire request
          }
        }
      }
    } else {
      // Handle JSON without presentation
      body = await request.json();
    }
    
    // Fix timezone issue: convert date string to proper Date object
    if (body.date) {
      // If date is in YYYY-MM-DD format, create a date at noon local time to avoid timezone issues
      const dateStr = body.date;
      if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-').map(Number);
        // Create date at noon local time to avoid timezone conversion issues
        body.date = new Date(year, month - 1, day, 12, 0, 0);
      }
    }
    
    logger.debug('Updating event', {
      ...body,
      presentations: body.presentations ? body.presentations.map(p => ({
        filename: p.filename,
        contentType: p.contentType,
        size: p.size,
        dataLength: p.data?.length
      })) : null
    });
    
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
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    logger.error('Error updating event', error);
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
    // Verify authentication for admin operations
    const { requireAuth } = await import('@/lib/auth');
    await requireAuth(request as any);
    
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
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    logger.error('Error deleting event', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}

