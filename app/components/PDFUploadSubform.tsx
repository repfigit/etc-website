'use client';

import { useState } from 'react';

interface PDFFile {
  id: string;
  file: File | null; // Allow null for existing presentations
  name: string;
  size: number;
  type: string;
}

interface PDFUploadSubformProps {
  presentations: PDFFile[];
  onPresentationsChange: (presentations: PDFFile[]) => void;
}

export default function PDFUploadSubform({ presentations, onPresentationsChange }: PDFUploadSubformProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const newPDFs: PDFFile[] = [];
    
    Array.from(files).forEach(file => {
      // Validate file type
      if (file.type !== 'application/pdf') {
        alert(`Only PDF files are allowed. Skipping: ${file.name}`);
        return;
      }

      // Validate file size (max 50MB - using client-side blob uploads)
      if (file.size > 50 * 1024 * 1024) {
        alert(`File size must be less than 50MB. Skipping: ${file.name}`);
        return;
      }

      // Check for duplicates
      const isDuplicate = presentations.some(p => p.name === file.name);
      if (isDuplicate) {
        alert(`File already uploaded: ${file.name}`);
        return;
      }

      newPDFs.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: file.type
      });
    });

    if (newPDFs.length > 0) {
      onPresentationsChange([...presentations, ...newPDFs]);
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

  const removePDF = (id: string) => {
    onPresentationsChange(presentations.filter(p => p.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="pdf-upload-container">
      <label className="pdf-upload-label">
        Presentation PDFs
      </label>
      
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`pdf-upload-area ${dragActive ? 'drag-active' : ''}`}
        onClick={() => document.getElementById('pdf-upload-input')?.click()}
      >
        <div className="pdf-upload-text">
          📁 Drop PDF files here or click to browse
        </div>
        <div className="pdf-upload-subtext">
          Maximum 50MB per file
        </div>
        
        <input
          id="pdf-upload-input"
          type="file"
          accept=".pdf"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* File List */}
      {presentations.length > 0 && (
        <div className="pdf-file-list">
          <h4 className="pdf-file-list-title">
            Uploaded Files ({presentations.length})
          </h4>
          
          <div className="pdf-file-list-container">
            {presentations.map((pdf) => (
              <div
                key={pdf.id}
                className="pdf-file-item"
              >
                <div className="pdf-file-info">
                  <span className="pdf-file-icon">📄</span>
                  <div>
                    <div className="pdf-file-name">
                      {pdf.name}
                    </div>
                    <div className="pdf-file-details">
                      {formatFileSize(pdf.size)}
                      {pdf.file === null && <span className="pdf-file-existing">(existing)</span>}
                    </div>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => removePDF(pdf.id)}
                  className="pdf-remove-button"
                  title="Remove file"
                >
                  ✕ Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
