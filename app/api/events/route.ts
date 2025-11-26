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
    
    // Remove Buffer data from presentations and images (can't be serialized to JSON)
    // This must be done after .lean() because Mongoose select doesn't work well with nested arrays
    const sanitizedEvents = events.map((event: any) => {
      const sanitized = { ...event };
      if (sanitized.presentations) {
        sanitized.presentations = sanitized.presentations.map((p: any) => {
          const { data, ...rest } = p;
          return rest;
        });
      }
      if (sanitized.images) {
        sanitized.images = sanitized.images.map((img: any) => {
          const { data, ...rest } = img;
          return rest;
        });
      }
      return sanitized;
    });

    // Log presentation and image data for admin requests
    if (admin === 'true' && sanitizedEvents.length > 0) {
      console.log('Admin events fetched:', sanitizedEvents.map(e => ({
        id: e._id,
        topic: e.topic,
        presentations: e.presentations?.map((p: any) => ({
          filename: p.filename,
          contentType: p.contentType,
          size: p.size
        })) || [],
        images: e.images?.map((img: any) => ({
          filename: img.filename,
          contentType: img.contentType,
          size: img.size,
          order: img.order
        })) || [],
        hasImagesField: 'images' in e,
        imagesType: typeof e.images,
        imagesIsArray: Array.isArray(e.images),
        imagesCount: e.images?.length || 0
      })));
    }

    return NextResponse.json({ success: true, data: sanitizedEvents, total });
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

    // Check if request contains FormData (with presentation) or JSON
    const contentType = request.headers.get('content-type') || '';
    console.log('Content-Type:', contentType);
    let body: any;

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData with presentation
      const formData = await request.formData();
      const presentationFile = formData.get('presentation') as File;

      console.log('FormData fields:', Array.from(formData.keys()));
      console.log('Presentation file:', presentationFile ? presentationFile.name : 'none');

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

              console.log('Presentation data prepared:', {
                filename: file.name,
                contentType: file.type,
                size: file.size
              });
            } catch (fileError) {
              console.error('Error processing presentation file:', fileError);
              // Continue without this file rather than failing the entire request
            }
          }
        }
      }

      // Handle multiple image files
      const imageFiles = formData.getAll('images') as File[];
      console.log(`Received ${imageFiles.length} image files for processing`);
      
      if (imageFiles.length > 0) {
        body.images = []; // Initialize images array only if there are files to process
        // Validate image types
        const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
        const maxImageSize = 5 * 1024 * 1024; // 5MB

        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          console.log(`Processing image file ${i + 1}/${imageFiles.length}: ${file.name} (${file.size} bytes, type: ${file.type})`);
          
          if (file instanceof File && file.size > 0) {
            // Validate file type
            if (!allowedImageTypes.includes(file.type)) {
              console.error(`Invalid image type: ${file.type} for file: ${file.name}`);
              continue;
            }

            // Validate file size
            if (file.size > maxImageSize) {
              console.error(`Image too large: ${file.name} (${file.size} bytes)`);
              continue;
            }

            try {
              const bytes = await file.arrayBuffer();
              const buffer = Buffer.from(bytes);

              // Use body.images.length as order to ensure sequential ordering
              // even when some files are skipped due to validation errors
              const order = body.images.length;

              body.images.push({
                filename: file.name,
                data: buffer,
                contentType: file.type,
                size: file.size,
                uploadedAt: new Date(),
                order: order
              });

              console.log('Image data prepared and added to body.images:', {
                filename: file.name,
                contentType: file.type,
                size: file.size,
                order: order,
                bufferLength: buffer.length
              });
            } catch (fileError) {
              console.error('Error processing image file:', fileError);
              // Continue without this file rather than failing the entire request
            }
          } else {
            console.warn(`Skipping invalid file: ${file.name} (not a File instance or size is 0)`);
          }
        }
        
        console.log(`Final body.images array has ${body.images.length} images`);
      } else {
        console.log('No image files provided in FormData');
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

    console.log('Creating event with body:', {
      ...body,
      presentation: body.presentation ? {
        filename: body.presentation.filename,
        contentType: body.presentation.contentType,
        size: body.presentation.size,
        dataLength: body.presentation.data?.length
      } : null,
      images: body.images ? body.images.map((img: any) => ({
        filename: img.filename,
        contentType: img.contentType,
        size: img.size,
        order: img.order,
        dataLength: img.data?.length
      })) : null
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
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

