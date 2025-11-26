'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageFile {
  id: string;
  file: File | null; // Allow null for existing images
  name: string;
  size: number;
  type: string;
  preview?: string; // URL for preview
}

interface ImageUploadSubformProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  eventId?: string; // For loading existing image previews
}

export default function ImageUploadSubform({ images, onImagesChange, eventId }: ImageUploadSubformProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const newImages: ImageFile[] = [];
    
    Array.from(files).forEach(file => {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        alert(`Only image files (JPEG, PNG, WebP, GIF, SVG) are allowed. Skipping: ${file.name}`);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File size must be less than 5MB. Skipping: ${file.name}`);
        return;
      }

      // Check for duplicates
      const isDuplicate = images.some(img => img.name === file.name);
      if (isDuplicate) {
        alert(`File already uploaded: ${file.name}`);
        return;
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);

      newImages.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview
      });
    });

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (id: string) => {
    const imageToRemove = images.find(img => img.id === id);
    if (imageToRemove?.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    onImagesChange(images.filter(img => img.id !== id));
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newImages.length) {
      return; // Can't move beyond boundaries
    }

    // Swap images
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    onImagesChange(newImages);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getImageUrl = (image: ImageFile, index: number) => {
    if (image.preview) {
      return image.preview;
    }
    if (eventId && image.file === null) {
      // Existing image - construct URL from event API
      // Note: The API will sort images by order, so we use the current index
      // which should match the sorted order
      return `/api/events/${eventId}/images/${index}`;
    }
    return '';
  };

  return (
    <div className="image-upload-container">
      <label className="image-upload-label">
        Event Images
      </label>
      
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`image-upload-area ${dragActive ? 'drag-active' : ''}`}
        onClick={() => document.getElementById('image-upload-input')?.click()}
      >
        <div className="image-upload-text">
          🖼️ Drop image files here or click to browse
        </div>
        <div className="image-upload-subtext">
          JPEG, PNG, WebP, GIF, SVG (max 5MB per file)
        </div>
        
        <input
          id="image-upload-input"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Image List */}
      {images.length > 0 && (
        <div className="image-file-list">
          <h4 className="image-file-list-title">
            Uploaded Images ({images.length})
          </h4>
          
          <div className="image-file-list-container">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="image-file-item"
              >
                <div className="image-file-preview">
                  {getImageUrl(image, index) && (
                    <Image
                      src={getImageUrl(image, index)}
                      alt={image.name}
                      width={100}
                      height={100}
                      style={{ width: 'auto', height: 'auto', maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }}
                      unoptimized
                    />
                  )}
                </div>
                
                <div className="image-file-info">
                  <div className="image-file-name">
                    {image.name}
                  </div>
                  <div className="image-file-details">
                    {formatFileSize(image.size)}
                    {image.file === null && <span className="image-file-existing">(existing)</span>}
                  </div>
                </div>
                
                <div className="image-file-actions">
                  <div className="image-reorder-buttons">
                    <button
                      type="button"
                      onClick={() => moveImage(index, 'up')}
                      className="image-reorder-button"
                      disabled={index === 0}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, 'down')}
                      className="image-reorder-button"
                      disabled={index === images.length - 1}
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="image-remove-button"
                    title="Remove image"
                  >
                    ✕ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

