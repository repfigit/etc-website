import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import { uploadFileToBlob, deleteFromBlob, deleteMultipleFromBlob } from '@/lib/blob';

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

    // Log what we're returning for debugging
    console.log('Fetching event for admin:', {
      id: (event as any)._id,
      topic: (event as any).topic,
      hasImages: 'images' in event,
      imagesCount: (event as any).images?.length || 0,
      images: (event as any).images?.map((img: any) => ({
        filename: img.filename,
        url: img.url,
        contentType: img.contentType,
        size: img.size,
        order: img.order
      })) || []
    });

    return NextResponse.json({ success: true, data: event });
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

      // ===== HANDLE PRESENTATIONS =====
      // Get existing presentations and filter to only keep specified ones
      let existingPresentations: any[] = [];
      const presentationsToDelete: string[] = [];
      
      if (presentationsToKeep.length > 0) {
        for (const p of existingPresentationsData) {
          if (presentationsToKeep.includes(p.filename)) {
            existingPresentations.push(p);
          } else if (p.url) {
            presentationsToDelete.push(p.url);
          }
        }
      } else {
        // Delete all existing presentations
        for (const p of existingPresentationsData) {
          if (p.url) {
            presentationsToDelete.push(p.url);
          }
        }
      }

      // Delete removed presentations from blob
      if (presentationsToDelete.length > 0) {
        await deleteMultipleFromBlob(presentationsToDelete);
        console.log(`Deleted ${presentationsToDelete.length} presentations from blob`);
      }

      body.presentations = [...existingPresentations];

      // Add new presentation files
      for (const file of presentationFiles) {
        if (file instanceof File && file.size > 0) {
          try {
            const uploadResult = await uploadFileToBlob('events', id, 'presentations', file);
            body.presentations.push({
              ...uploadResult,
              uploadedAt: new Date()
            });
            console.log('New presentation uploaded:', uploadResult.filename);
          } catch (fileError) {
            console.error('Error processing presentation file:', fileError);
          }
        }
      }

      // ===== HANDLE IMAGES =====
      // Get existing images and create a map for quick lookup
      const existingImagesMap = new Map();
      const imagesToDelete: string[] = [];
      
      if (imagesToKeep.length > 0) {
        existingImagesData.forEach((img: any) => {
          if (imagesToKeep.includes(img.filename)) {
            existingImagesMap.set(img.filename, img);
            console.log(`Keeping existing image: ${img.filename}`);
          } else if (img.url) {
            imagesToDelete.push(img.url);
          }
        });
      } else {
        // Delete all existing images
        for (const img of existingImagesData) {
          if (img.url) {
            imagesToDelete.push(img.url);
          }
        }
      }

      // Delete removed images from blob
      if (imagesToDelete.length > 0) {
        await deleteMultipleFromBlob(imagesToDelete);
        console.log(`Deleted ${imagesToDelete.length} images from blob`);
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
            const uploadResult = await uploadFileToBlob('events', id, 'images', file);
            body.images.push({
              ...uploadResult,
              uploadedAt: new Date()
            });
            
            console.log(`New image uploaded: ${file.name} -> ${uploadResult.url}`);
          } catch (fileError) {
            console.error('Error processing image file:', fileError);
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
      // Handle JSON - may include blob URLs from client-side uploads
      const jsonData = await request.json();
      
      // Extract special fields for file handling
      const { keepPresentations, newPresentationUrls, keepImages, newImageUrls, ...basicData } = jsonData;
      body = basicData;

      // If we have file-related fields, process them
      if (keepPresentations !== undefined || newPresentationUrls !== undefined || 
          keepImages !== undefined || newImageUrls !== undefined) {
        
        // Fetch existing event data
        const existingEvent = await Event.findById(id).select('presentations images');
        const existingPresentationsData = existingEvent?.presentations || [];
        const existingImagesData = existingEvent?.images || [];

        // ===== HANDLE PRESENTATIONS =====
        const presentationsToKeepList = keepPresentations || [];
        const presentationsToDelete: string[] = [];
        let keptPresentations: any[] = [];

        if (presentationsToKeepList.length > 0) {
          for (const p of existingPresentationsData) {
            if (presentationsToKeepList.includes(p.filename)) {
              keptPresentations.push(p);
            } else if (p.url) {
              presentationsToDelete.push(p.url);
            }
          }
        } else if (existingPresentationsData.length > 0) {
          // No presentations to keep, delete all
          for (const p of existingPresentationsData) {
            if (p.url) {
              presentationsToDelete.push(p.url);
            }
          }
        }

        // Delete removed presentations from blob
        if (presentationsToDelete.length > 0) {
          await deleteMultipleFromBlob(presentationsToDelete);
          console.log(`Deleted ${presentationsToDelete.length} presentations from blob`);
        }

        // Build final presentations array
        body.presentations = [...keptPresentations];
        
        // Add new presentations from client-side uploads
        if (newPresentationUrls && Array.isArray(newPresentationUrls)) {
          for (const uploaded of newPresentationUrls) {
            body.presentations.push({
              filename: uploaded.filename,
              url: uploaded.url,
              contentType: uploaded.contentType,
              size: uploaded.size,
              uploadedAt: new Date()
            });
          }
        }

        // ===== HANDLE IMAGES =====
        const imagesToKeepList = keepImages || [];
        const imagesToDelete: string[] = [];
        const existingImagesMap = new Map();

        if (imagesToKeepList.length > 0) {
          for (const img of existingImagesData) {
            if (imagesToKeepList.includes(img.filename)) {
              existingImagesMap.set(img.filename, img);
            } else if (img.url) {
              imagesToDelete.push(img.url);
            }
          }
        } else if (existingImagesData.length > 0) {
          // No images to keep, delete all
          for (const img of existingImagesData) {
            if (img.url) {
              imagesToDelete.push(img.url);
            }
          }
        }

        // Delete removed images from blob
        if (imagesToDelete.length > 0) {
          await deleteMultipleFromBlob(imagesToDelete);
          console.log(`Deleted ${imagesToDelete.length} images from blob`);
        }

        // Build final images array - maintain order from keepImages
        body.images = [];
        for (const filename of imagesToKeepList) {
          const existingImage = existingImagesMap.get(filename);
          if (existingImage) {
            body.images.push(existingImage);
          }
        }

        // Add new images from client-side uploads
        if (newImageUrls && Array.isArray(newImageUrls)) {
          for (const uploaded of newImageUrls) {
            body.images.push({
              filename: uploaded.filename,
              url: uploaded.url,
              contentType: uploaded.contentType,
              size: uploaded.size,
              uploadedAt: new Date()
            });
          }
        }

        // Set order on all images
        body.images = body.images.map((img: any, idx: number) => ({
          ...img,
          order: idx
        }));

        console.log(`Final presentations: ${body.presentations.length}, images: ${body.images.length}`);
      }
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
        url: p.url,
        contentType: p.contentType,
        size: p.size
      })) : null,
      images: body.images ? body.images.map((img: any) => ({
        filename: img.filename,
        url: img.url,
        contentType: img.contentType,
        size: img.size,
        order: img.order
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
    
    // First, get the event to find files to delete from blob
    const event = await Event.findById(id);
    
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Collect all blob URLs to delete
    const urlsToDelete: string[] = [];
    
    if (event.presentations) {
      for (const p of event.presentations) {
        if (p.url) {
          urlsToDelete.push(p.url);
        }
      }
    }
    
    if (event.images) {
      for (const img of event.images) {
        if (img.url) {
          urlsToDelete.push(img.url);
        }
      }
    }

    // Delete all files from blob storage
    if (urlsToDelete.length > 0) {
      await deleteMultipleFromBlob(urlsToDelete);
      console.log(`Deleted ${urlsToDelete.length} files from blob storage`);
    }

    // Now delete the event from database
    await Event.findByIdAndDelete(id);

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
