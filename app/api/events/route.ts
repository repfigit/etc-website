import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import { logger } from '@/lib/logger';
import { CacheConfig, addCacheHeaders } from '@/lib/cache';

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
    
    // Only exclude presentation data for public API calls, not admin
    if (admin !== 'true') {
      query = query.select('-presentations.data');
    }
    
    // Get total count
    const total = await Event.countDocuments(filter);
    
    // Apply limit if specified
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const events = await query.lean();
    
    // Log presentation data for admin requests
    if (admin === 'true' && events.length > 0) {
      logger.debug('Admin events fetched', events.map(e => ({
        id: e._id,
        topic: e.topic,
        presentations: e.presentations?.map((p: any) => ({
          filename: p.filename,
          contentType: p.contentType,
          size: p.size,
          hasData: !!p.data
        })) || []
      })));
    }
    
    const response = NextResponse.json({ success: true, data: events, total });
    
    // Add cache headers for public requests
    if (admin !== 'true') {
      return addCacheHeaders(response, CacheConfig.EVENTS);
    }
    
    return response;
  } catch (error) {
    logger.error('Error fetching events', error);
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
    
    // Check if request contains FormData (with presentation) or JSON
    const contentType = request.headers.get('content-type') || '';
    logger.debug('Content-Type', { contentType });
    let body: any;
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData with presentation
      const formData = await request.formData();
      const presentationFile = formData.get('presentation') as File;
      
      logger.debug('FormData received', { 
        fields: Array.from(formData.keys()),
        presentationFile: presentationFile ? presentationFile.name : 'none'
      });
      
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
    if (presentationFiles.length > 0) {
      body.presentations = [];
      
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

            logger.debug('Presentation data prepared', {
              filename: file.name,
              contentType: file.type,
              size: file.size
            });
          } catch (fileError) {
            logger.error('Error processing presentation file', fileError);
            // Continue without this file rather than failing the entire request
          }
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
    
    logger.debug('Creating event', {
      ...body,
      presentation: body.presentation ? {
        filename: body.presentation.filename,
        contentType: body.presentation.contentType,
        size: body.presentation.size,
        dataLength: body.presentation.data?.length
      } : null
    });
    
    const event = await Event.create(body);
    
    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    logger.error('Error creating event', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

