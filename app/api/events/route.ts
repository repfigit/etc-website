import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import { uploadFileToBlob } from '@/lib/blob';

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

    // Log presentation and image data for admin requests
    if (admin === 'true' && events.length > 0) {
      console.log('Admin events fetched:', events.map((e: any) => ({
        id: e._id,
        topic: e.topic,
        presentations: e.presentations?.map((p: any) => ({
          filename: p.filename,
          url: p.url,
          contentType: p.contentType,
          size: p.size
        })) || [],
        images: e.images?.map((img: any) => ({
          filename: img.filename,
          url: img.url,
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

    // Check if request contains FormData (with presentation) or JSON
    const contentType = request.headers.get('content-type') || '';
    console.log('Content-Type:', contentType);
    let body: any;

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData with presentation
      const formData = await request.formData();

      console.log('FormData fields:', Array.from(formData.keys()));

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

      // Create event first to get the ID for blob storage paths
      // Fix timezone issue: convert date string to proper Date object
      if (body.date) {
        const dateStr = body.date;
        if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          const [year, month, day] = dateStr.split('-').map(Number);
          body.date = new Date(year, month - 1, day, 12, 0, 0);
        }
      }

      const event = await Event.create(body);
      const eventId = event._id.toString();

      // Handle multiple presentation files
      const presentationFiles = formData.getAll('presentations') as File[];
      if (presentationFiles.length > 0) {
        const presentations = [];

        for (const file of presentationFiles) {
          if (file instanceof File && file.size > 0) {
            try {
              const uploadResult = await uploadFileToBlob('events', eventId, 'presentations', file);
              presentations.push({
                ...uploadResult,
                uploadedAt: new Date()
              });

              console.log('Presentation uploaded to blob:', {
                filename: file.name,
                url: uploadResult.url,
                size: file.size
              });
            } catch (fileError) {
              console.error('Error uploading presentation file:', fileError);
            }
          }
        }

        if (presentations.length > 0) {
          event.presentations = presentations;
        }
      }

      // Handle multiple image files
      const imageFiles = formData.getAll('images') as File[];
      console.log(`Received ${imageFiles.length} image files for processing`);
      
      if (imageFiles.length > 0) {
        const images: Array<{ url: string; filename: string; contentType: string; size: number; uploadedAt: Date; order: number }> = [];
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
              const uploadResult = await uploadFileToBlob('events', eventId, 'images', file);

              images.push({
                ...uploadResult,
                uploadedAt: new Date(),
                order: images.length
              });

              console.log('Image uploaded to blob:', {
                filename: file.name,
                url: uploadResult.url,
                order: images.length - 1
              });
            } catch (fileError) {
              console.error('Error uploading image file:', fileError);
            }
          } else {
            console.warn(`Skipping invalid file: ${file.name} (not a File instance or size is 0)`);
          }
        }
        
        if (images.length > 0) {
          event.images = images;
        }
        console.log(`Final images array has ${images.length} images`);
      } else {
        console.log('No image files provided in FormData');
      }

      // Save the event with uploaded files
      await event.save();

      console.log('Event created with files:', {
        id: event._id,
        topic: event.topic,
        presentationsCount: event.presentations?.length || 0,
        imagesCount: event.images?.length || 0
      });

      return NextResponse.json({ success: true, data: event }, { status: 201 });
    } else {
      // Handle JSON without presentation
      body = await request.json();

      // Fix timezone issue: convert date string to proper Date object
      if (body.date) {
        const dateStr = body.date;
        if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          const [year, month, day] = dateStr.split('-').map(Number);
          body.date = new Date(year, month - 1, day, 12, 0, 0);
        }
      }

      console.log('Creating event with body:', body);

      const event = await Event.create(body);

      return NextResponse.json({ success: true, data: event }, { status: 201 });
    }
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
