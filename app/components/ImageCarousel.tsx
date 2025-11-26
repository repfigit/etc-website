'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageCarouselProps {
  images: Array<{
    filename: string;
    contentType: string;
    size: number;
    uploadedAt?: string;
  }>;
  eventId: string;
}

export default function ImageCarousel({ images, eventId }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Sort images by order if available
  const sortedImages = [...images].sort((a, b) => {
    const orderA = (a as any).order !== undefined ? (a as any).order : 0;
    const orderB = (b as any).order !== undefined ? (b as any).order : 0;
    return orderA - orderB;
  });

  useEffect(() => {
    // Reset to first image when images change
    setCurrentIndex(0);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? sortedImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === sortedImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  if (!sortedImages || sortedImages.length === 0) {
    return null;
  }

  return (
    <div className="image-carousel-container">
      <div
        className="image-carousel"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Previous Button */}
        {sortedImages.length > 1 && (
          <button
            className="carousel-button carousel-button-prev"
            onClick={goToPrevious}
            aria-label="Previous image"
          >
            ‹
          </button>
        )}

        {/* Image Container */}
        <div className="carousel-image-container">
          {sortedImages.map((image, index) => (
            <div
              key={index}
              className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
            >
              <Image
                src={`/api/events/${eventId}/images/${index}`}
                alt={image.filename}
                width={800}
                height={600}
                style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                unoptimized
                priority={index === currentIndex}
              />
            </div>
          ))}
        </div>

        {/* Next Button */}
        {sortedImages.length > 1 && (
          <button
            className="carousel-button carousel-button-next"
            onClick={goToNext}
            aria-label="Next image"
          >
            ›
          </button>
        )}

        {/* Thumbnail Navigation */}
        {sortedImages.length > 1 && (
          <div className="carousel-thumbnails">
            {sortedImages.map((image, index) => (
              <button
                key={index}
                className={`carousel-thumbnail ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to image ${index + 1}`}
              >
                <img
                  src={`/api/events/${eventId}/images/${index}`}
                  alt={image.filename}
                />
              </button>
            ))}
          </div>
        )}

        {/* Image Counter */}
        {sortedImages.length > 1 && (
          <div className="carousel-counter">
            {currentIndex + 1} / {sortedImages.length}
          </div>
        )}
      </div>
    </div>
  );
}

