'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  currentImage?: string | null;
  onImageChange: (file: File | null) => void;
  onRemoveImage?: () => void;
}

export default function ImageUpload({ currentImage, onImageChange, onRemoveImage }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onImageChange(file);
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

  const handleRemove = () => {
    setPreview(null);
    onImageChange(null);
    if (onRemoveImage) {
      onRemoveImage();
    }
  };

  return (
    <div className="image-upload-container">
      <label className="image-upload-label">
        Thumbnail Image
      </label>
      
      {!preview ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`image-upload-area ${dragActive ? 'drag-active' : ''}`}
          onClick={() => document.getElementById('image-upload-input')?.click()}
        >
          <div className="image-upload-text">
            🖼️ Drop image here or click to browse
          </div>
          <div className="image-upload-subtext">
            Maximum 5MB (JPG, PNG, GIF, WebP)
          </div>
          
          <input
            id="image-upload-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      ) : (
        <div className="image-preview-container">
          <div className="image-preview">
            <img 
              src={preview} 
              alt="Thumbnail preview"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                objectFit: 'contain',
                border: '2px solid #4ecdc4',
                borderRadius: '4px'
              }}
            />
          </div>
          <div className="image-preview-actions">
            <button
              type="button"
              onClick={() => document.getElementById('image-upload-input')?.click()}
              className="image-change-button"
            >
              Change Image
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="image-remove-button"
            >
              Remove
            </button>
          </div>
          
          <input
            id="image-upload-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}
    </div>
  );
}
