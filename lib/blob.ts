import { put, del } from '@vercel/blob';

/**
 * Blob storage utility functions for file uploads and deletions
 */

export type BlobFolder = 'events' | 'resources';
export type BlobSubfolder = 'images' | 'presentations' | 'thumbnail';

/**
 * Generate a blob path for a file
 * Structure: files/{folder}/{id}/{subfolder}/{filename}
 */
export function generateBlobPath(
  folder: BlobFolder,
  id: string,
  subfolder: BlobSubfolder,
  filename: string
): string {
  // Sanitize filename to remove special characters that might cause issues
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `files/${folder}/${id}/${subfolder}/${sanitizedFilename}`;
}

/**
 * Upload a file to Vercel Blob Storage
 * Returns the public URL of the uploaded file
 */
export async function uploadToBlob(
  folder: BlobFolder,
  id: string,
  subfolder: BlobSubfolder,
  filename: string,
  data: Buffer | Blob | ArrayBuffer | ReadableStream,
  contentType: string
): Promise<string> {
  const path = generateBlobPath(folder, id, subfolder, filename);
  
  const blob = await put(path, data, {
    access: 'public',
    contentType,
    addRandomSuffix: false, // Use exact path for predictability
  });
  
  return blob.url;
}

/**
 * Delete a file from Vercel Blob Storage
 */
export async function deleteFromBlob(url: string): Promise<void> {
  if (!url) return;
  
  try {
    await del(url);
  } catch (error) {
    // Log but don't throw - file may already be deleted
    console.error('Error deleting blob:', error);
  }
}

/**
 * Delete multiple files from Vercel Blob Storage
 */
export async function deleteMultipleFromBlob(urls: string[]): Promise<void> {
  if (!urls || urls.length === 0) return;
  
  const validUrls = urls.filter(url => url && url.length > 0);
  if (validUrls.length === 0) return;
  
  try {
    await del(validUrls);
  } catch (error) {
    console.error('Error deleting blobs:', error);
  }
}

/**
 * Upload a File object to Vercel Blob Storage
 * Convenience wrapper for handling File objects from form uploads
 */
export async function uploadFileToBlob(
  folder: BlobFolder,
  id: string,
  subfolder: BlobSubfolder,
  file: File
): Promise<{ url: string; filename: string; contentType: string; size: number }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const url = await uploadToBlob(folder, id, subfolder, file.name, buffer, file.type);
  
  return {
    url,
    filename: file.name,
    contentType: file.type,
    size: file.size,
  };
}

/**
 * Upload a Buffer to Vercel Blob Storage
 * Convenience wrapper for handling Buffer data (e.g., from MongoDB migration)
 */
export async function uploadBufferToBlob(
  folder: BlobFolder,
  id: string,
  subfolder: BlobSubfolder,
  filename: string,
  data: Buffer,
  contentType: string,
  size: number
): Promise<{ url: string; filename: string; contentType: string; size: number }> {
  const url = await uploadToBlob(folder, id, subfolder, filename, data, contentType);
  
  return {
    url,
    filename,
    contentType,
    size,
  };
}

