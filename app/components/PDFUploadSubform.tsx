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

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File size must be less than 10MB. Skipping: ${file.name}`);
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
    <div style={{ marginTop: '1em' }}>
      <label style={{ display: 'block', marginBottom: '0.5em', fontWeight: 'bold' }}>
        Presentation PDFs
      </label>
      
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragActive ? '#00ffcc' : '#666'}`,
          borderRadius: '8px',
          padding: '2em',
          textAlign: 'center',
          background: dragActive ? '#001a1a' : '#000',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          marginBottom: '1em'
        }}
        onClick={() => document.getElementById('pdf-upload-input')?.click()}
      >
        <div style={{ color: '#00ffcc', fontSize: '1.2em', marginBottom: '0.5em' }}>
          📁 Drop PDF files here or click to browse
        </div>
        <div style={{ color: '#888', fontSize: '0.9em' }}>
          Maximum 10MB per file
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
        <div style={{ marginTop: '1em' }}>
          <h4 style={{ color: '#00ffcc', marginBottom: '0.5em' }}>
            Uploaded Files ({presentations.length})
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
            {presentations.map((pdf) => (
              <div
                key={pdf.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75em',
                  background: '#001a1a',
                  border: '1px solid #00ffcc',
                  borderRadius: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                  <span style={{ color: '#ff4444', fontSize: '1.2em' }}>📄</span>
                  <div>
                    <div style={{ color: '#00ffcc', fontWeight: 'bold' }}>
                      {pdf.name}
                    </div>
                    <div style={{ color: '#888', fontSize: '0.8em' }}>
                      {formatFileSize(pdf.size)}
                      {pdf.file === null && <span style={{ color: '#ffff00', marginLeft: '0.5em' }}>(existing)</span>}
                    </div>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => removePDF(pdf.id)}
                  style={{
                    padding: '0.5em',
                    background: '#ff4444',
                    color: '#fff',
                    border: '1px solid #ff4444',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9em'
                  }}
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
