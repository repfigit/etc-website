'use client';

import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '2em'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="modal-content"
        style={{
          backgroundColor: '#121212',
          border: '2px solid #00ffcc',
          borderRadius: '8px',
          padding: '2em',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflow: 'auto',
          width: '100%',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1em',
            right: '1em',
            background: 'none',
            border: 'none',
            color: '#00ffcc',
            fontSize: '1.5em',
            cursor: 'pointer',
            padding: '0.25em',
            lineHeight: 1,
            fontFamily: 'inherit'
          }}
          title="Close modal"
        >
          ×
        </button>

        {/* Modal title */}
        <h2 style={{ 
          marginTop: 0, 
          marginBottom: '1.5em', 
          color: '#00ffcc',
          paddingRight: '2em'
        }}>
          {title}
        </h2>

        {/* Modal content */}
        {children}
      </div>
    </div>
  );
}
