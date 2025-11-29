'use client';

import { useState, useEffect, useRef } from 'react';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
}

interface DropdownPosition {
  top: number;
  left: number;
}

export default function ShareButton({ url, title, description }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Check if native share is available (mostly mobile)
    setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 200;
      
      // Position below the button, aligned to the right
      let left = rect.right - dropdownWidth;
      
      // Make sure it doesn't go off the left edge
      if (left < 8) {
        left = 8;
      }
      
      setDropdownPosition({
        top: rect.bottom + 8,
        left: left,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const fullUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${url.startsWith('/') ? url : `/${url}`}`
    : url;

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title,
        text: description || title,
        url: fullUrl,
      });
      setIsOpen(false);
    } catch (err) {
      // User cancelled or share failed - silently ignore
      if ((err as Error).name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(title);
    const shareUrl = encodeURIComponent(fullUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`,
      '_blank',
      'noopener,noreferrer,width=550,height=420'
    );
    setIsOpen(false);
  };

  const shareToBluesky = () => {
    const text = encodeURIComponent(`${title} ${fullUrl}`);
    window.open(
      `https://bsky.app/intent/compose?text=${text}`,
      '_blank',
      'noopener,noreferrer,width=550,height=420'
    );
    setIsOpen(false);
  };

  const shareToLinkedIn = () => {
    const shareUrl = encodeURIComponent(fullUrl);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      '_blank',
      'noopener,noreferrer,width=550,height=420'
    );
    setIsOpen(false);
  };

  const shareToFacebook = () => {
    const shareUrl = encodeURIComponent(fullUrl);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      '_blank',
      'noopener,noreferrer,width=550,height=420'
    );
    setIsOpen(false);
  };

  return (
    <div className="share-button-container" ref={containerRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="share-button-trigger"
        title="Share this event"
        aria-label="Share this event"
        aria-expanded={isOpen}
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="share-dropdown"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          {canNativeShare && (
            <button onClick={handleNativeShare} className="share-dropdown-item">
              <span className="share-dropdown-icon">📤</span>
              <span>Share...</span>
            </button>
          )}
          
          <button onClick={shareToTwitter} className="share-dropdown-item">
            <span className="share-dropdown-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </span>
            <span>Share on X</span>
          </button>
          
          <button onClick={shareToBluesky} className="share-dropdown-item">
            <span className="share-dropdown-icon">
              <svg width="16" height="16" viewBox="0 0 600 530" fill="currentColor">
                <path d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z"/>
              </svg>
            </span>
            <span>Share on Bluesky</span>
          </button>
          
          <button onClick={shareToLinkedIn} className="share-dropdown-item">
            <span className="share-dropdown-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </span>
            <span>Share on LinkedIn</span>
          </button>
          
          <button onClick={shareToFacebook} className="share-dropdown-item">
            <span className="share-dropdown-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </span>
            <span>Share on Facebook</span>
          </button>
          
          <div className="share-dropdown-divider" />
          
          <button onClick={handleCopyLink} className="share-dropdown-item">
            <span className="share-dropdown-icon">
              {copied ? '✓' : '🔗'}
            </span>
            <span>{copied ? 'Copied!' : 'Copy link'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
