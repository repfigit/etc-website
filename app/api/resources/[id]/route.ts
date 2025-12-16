import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Resource from '@/lib/models/Resource';
import { logger } from '@/lib/logger';
import { uploadFileToBlob, deleteFromBlob } from '@/lib/blob';

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
    
    const contentType = request.headers.get('content-type') || '';
    let body: any;
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData with thumbnail
      const formData = await request.formData();
      const thumbnailFile = formData.get('thumbnail') as File;
      const removeThumbnail = formData.get('removeThumbnail') === 'true';
      
      body = {
        title: formData.get('title'),
        url: formData.get('url'),
        description: formData.get('description'),
        featured: formData.get('featured') === 'true',
        order: parseInt(formData.get('order') as string) || 0,
        isVisible: formData.get('isVisible') === 'true'
      };
      
      // Get existing resource to check for existing thumbnail
      const existingResource = await Resource.findById(id).select('thumbnail');
      
      // Handle thumbnail removal
      if (removeThumbnail) {
        // Delete existing thumbnail from blob
        if (existingResource?.thumbnail?.url) {
          await deleteFromBlob(existingResource.thumbnail.url);
          logger.debug('Deleted existing thumbnail from blob');
        }
        body.thumbnail = null;
      }
      // Handle new thumbnail upload
      else if (thumbnailFile && thumbnailFile instanceof File && thumbnailFile.size > 0) {
        // Delete old thumbnail if it exists
        if (existingResource?.thumbnail?.url) {
          await deleteFromBlob(existingResource.thumbnail.url);
          logger.debug('Deleted old thumbnail from blob before uploading new one');
        }
        
        try {
          const uploadResult = await uploadFileToBlob('resources', id, 'thumbnail', thumbnailFile);
          
          body.thumbnail = {
            filename: uploadResult.filename,
            url: uploadResult.url,
            contentType: uploadResult.contentType,
            size: uploadResult.size
          };
          
          logger.debug('Thumbnail uploaded to blob', {
            filename: thumbnailFile.name,
            url: uploadResult.url,
            size: thumbnailFile.size
          });
        } catch (fileError) {
          logger.error('Error uploading thumbnail file', fileError);
        }
      }
    } else {
      // Handle JSON without thumbnail
      body = await request.json();
    }
    
    const resource = await Resource.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!resource) {
      return NextResponse.json(
        { success: false, error: 'Resource not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: resource });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    logger.error('Error updating resource', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update resource' },
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
    
    // Get resource to find thumbnail to delete
    const resource = await Resource.findById(id);
    
    if (!resource) {
      return NextResponse.json(
        { success: false, error: 'Resource not found' },
        { status: 404 }
      );
    }
    
    // Delete thumbnail from blob if it exists
    if (resource.thumbnail?.url) {
      await deleteFromBlob(resource.thumbnail.url);
      logger.debug('Deleted thumbnail from blob');
    }
    
    // Delete the resource from database
    await Resource.findByIdAndDelete(id);
    
    return NextResponse.json({ success: true, data: resource });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
}
