'use client';

import { upload } from '@vercel/blob/client';

/**
 * Upload a file directly to Vercel Blob from the client
 * This bypasses the serverless function body size limit
 */
export async function uploadFileToBlobClient(
  file: File,
  folder: string,
  id: string,
  subfolder: string
): Promise<{ url: string; filename: string; contentType: string; size: number }> {
  // Sanitize filename
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const pathname = `files/${folder}/${id}/${subfolder}/${sanitizedFilename}`;

  const blob = await upload(pathname, file, {
    access: 'public',
    handleUploadUrl: '/api/upload/blob',
  });

  return {
    url: blob.url,
    filename: file.name,
    contentType: file.type,
    size: file.size,
  };
}

/**
 * Upload multiple files to blob storage
 * Returns array of upload results with progress callback
 */
export async function uploadFilesToBlobClient(
  files: File[],
  folder: string,
  id: string,
  subfolder: string,
  onProgress?: (completed: number, total: number, currentFile: string) => void
): Promise<Array<{ url: string; filename: string; contentType: string; size: number }>> {
  const results: Array<{ url: string; filename: string; contentType: string; size: number }> = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(i, files.length, file.name);
    
    const result = await uploadFileToBlobClient(file, folder, id, subfolder);
    results.push(result);
  }

  onProgress?.(files.length, files.length, 'Complete');
  return results;
}

