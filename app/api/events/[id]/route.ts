import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';

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

    const event = await Event.findById(id).lean();

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Remove Buffer data from presentations and images (can't be serialized to JSON)
    // This must be done after .lean() because Mongoose select doesn't work well with nested arrays
    const sanitized: any = { ...event };
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

    // Log what we're returning for debugging
    console.log('Fetching event for admin:', {
      id: sanitized._id,
      topic: sanitized.topic,
      hasImages: 'images' in sanitized,
      imagesCount: sanitized.images?.length || 0,
      images: sanitized.images?.map((img: any) => ({
        filename: img.filename,
        contentType: img.contentType,
        size: img.size,
        order: img.order
      })) || []
    });

    return NextResponse.json({ success: true, data: sanitized });
  } catch (error) {
    console.error('Error fetching event:', error);
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

      // Handle multiple image files
      const imageFiles = formData.getAll('images') as File[];
      const imagesToKeep = formData.getAll('keepImages') as string[];

      console.log(`Editing event: received ${presentationFiles.length} new presentation files, ${presentationsToKeep.length} presentations to keep`);
      console.log(`Editing event: received ${imageFiles.length} new image files, ${imagesToKeep.length} images to keep`);
      console.log('keepImages filenames:', imagesToKeep);

      // Fetch existing event data once for both presentations and images
      const existingEvent = await Event.findById(id).select('presentations images');
      const existingPresentationsData = existingEvent?.presentations || [];
      const existingImagesData = existingEvent?.images || [];

      console.log(`Found ${existingPresentationsData.length} existing presentations in database`);
      console.log(`Found ${existingImagesData.length} existing images in database`);
      console.log('Existing image filenames:', existingImagesData.map((img: any) => img.filename));

      // Always process presentations when editing (even if empty)
      // Get existing presentations and filter to only keep specified ones
      let existingPresentations: any[] = [];
      if (presentationsToKeep.length > 0) {
        existingPresentations = existingPresentationsData
          .filter((p: any) => presentationsToKeep.includes(p.filename));
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
            console.error('Error processing presentation file:', fileError);
            // Continue without this file rather than failing the entire request
          }
        }
      }

      // Always process images when editing
      // The admin page always sends keepImages for existing images that should be kept
      // If keepImages is empty and no new images, it means user deleted all images

      // Get existing images and create a map for quick lookup
      const existingImagesMap = new Map();
      const existingImages = existingImagesData;
      
      if (imagesToKeep.length > 0) {
        existingImages.forEach((img: any) => {
          if (imagesToKeep.includes(img.filename)) {
            existingImagesMap.set(img.filename, img);
            console.log(`Keeping existing image: ${img.filename}`);
          }
        });
      }

      // Reconstruct images array in the order specified by imagesToKeep (which preserves client-side order)
      body.images = [];
      
      // Add existing images in the order they appear in imagesToKeep (preserves client-side reordering)
      imagesToKeep.forEach(filename => {
        const existingImage = existingImagesMap.get(filename);
        if (existingImage) {
          body.images.push(existingImage);
        } else {
          console.warn(`Image to keep not found in database: ${filename}`);
        }
      });

      // Add new image files (they're already in the correct order from the client)
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
      const maxImageSize = 5 * 1024 * 1024; // 5MB

      for (const file of imageFiles) {
        console.log(`Processing new image file: ${file.name} (${file.size} bytes, type: ${file.type})`);
        
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

            body.images.push({
              filename: file.name,
              data: buffer,
              contentType: file.type,
              size: file.size,
              uploadedAt: new Date()
            });
            
            console.log(`Added new image to body.images: ${file.name} (buffer length: ${buffer.length})`);
          } catch (fileError) {
            console.error('Error processing image file:', fileError);
            // Continue without this file rather than failing the entire request
          }
        } else {
          console.warn(`Skipping invalid file: ${file.name}`);
        }
      }

      // Set order based on current array position (preserves the order from client)
      body.images = body.images.map((img: any, idx: number) => ({
        ...img,
        order: idx
      }));
      
      console.log(`Final body.images array has ${body.images.length} images with order set`);
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

    console.log('Updating event with body:', {
      ...body,
      presentations: body.presentations ? body.presentations.map((p: any) => ({
        filename: p.filename,
        contentType: p.contentType,
        size: p.size,
        dataLength: p.data?.length
      })) : null,
      images: body.images ? body.images.map((img: any) => ({
        filename: img.filename,
        contentType: img.contentType,
        size: img.size,
        order: img.order,
        dataLength: img.data?.length
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

    // Verify images were saved correctly
    console.log('Event updated successfully:', {
      id: event._id,
      imagesCount: event.images?.length || 0,
      imageFilenames: event.images?.map((img: any) => img.filename) || []
    });

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    console.error('Error updating event:', error);
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
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}

