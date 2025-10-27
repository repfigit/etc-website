import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication for admin operations
    const { requireAuth } = await import('@/lib/auth');
    await requireAuth(request as any);
    
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const eventId: string | null = data.get('eventId') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ success: false, error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size must be less than 10MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Store the file data in the database
    const presentationData = {
      filename: file.name,
      data: buffer,
      contentType: file.type,
      size: file.size
    };

    // If eventId is provided, update the specific event
    if (eventId) {
      await connectDB();
      const event = await Event.findByIdAndUpdate(
        eventId,
        { presentation: presentationData },
        { new: true }
      );
      
      if (!event) {
        return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        filename: file.name,
        size: file.size,
        contentType: file.type,
        eventId: eventId || null
      } 
    }, { status: 200 });

  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
