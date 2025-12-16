import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

/**
 * API route for handling client-side Vercel Blob uploads
 * This allows large files to be uploaded directly to Blob storage
 * without going through the serverless function body limit
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify authentication for admin operations
    const { requireAuth } = await import('@/lib/auth');
    await requireAuth(request as any);

    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validate the upload path and type
        // pathname will be like: files/events/{id}/presentations/filename.pdf
        
        return {
          allowedContentTypes: [
            // PDFs
            'application/pdf',
            // Images
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/webp',
            'image/gif',
            'image/svg+xml',
          ],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB max
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // This runs after the file is uploaded
        // We could do additional processing here if needed
        console.log('Blob upload completed:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    console.error('Error handling blob upload:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}

