'use client';

import { useEffect, useCallback } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** If true, clicking the overlay will not close the modal. Default: false */
  preventOverlayClose?: boolean;
  /** If true, pressing Escape will not close the modal. Default: false */
  preventEscapeClose?: boolean;
  /** If provided, will show a confirmation dialog before closing */
  confirmClose?: string;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  preventOverlayClose = false,
  preventEscapeClose = false,
  confirmClose
}: ModalProps) {
  
  const handleClose = useCallback(() => {
    if (confirmClose) {
      if (window.confirm(confirmClose)) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [onClose, confirmClose]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventEscapeClose) {
        handleClose();
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
  }, [isOpen, handleClose, preventEscapeClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !preventOverlayClose) {
          handleClose();
        }
      }}
    >
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="modal-close-button"
          title="Close modal"
        >
          ×
        </button>

        {/* Modal title */}
        <h2 className="modal-title">
          {title}
        </h2>

        {/* Modal content */}
        {children}
      </div>
    </div>
  );
}
