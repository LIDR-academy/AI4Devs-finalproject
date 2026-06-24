'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Image } from 'lucide-react';

export interface Photo {
  url: string;
  caption: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
}

/**
 * PhotoGallery Component (T043)
 *
 * Displays a primary large photo with a thumbnail strip below.
 * - Click thumbnail → swap primary
 * - Click primary → open lightbox with prev/next navigation
 * - Handles empty photos gracefully with placeholder
 */
export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-border rounded-card h-96 text-taupe"
        data-testid="photo-gallery-placeholder"
      >
        <div className="text-center">
          <Image className="w-16 h-16 mx-auto mb-3 text-taupe" aria-hidden />
          <p className="text-sm">No photos available</p>
        </div>
      </div>
    );
  }

  const primaryPhoto = photos[activeIndex];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const prevLightbox = () =>
    setLightboxIndex((i) => (i - 1 + photos.length) % photos.length);

  const nextLightbox = () =>
    setLightboxIndex((i) => (i + 1) % photos.length);

  return (
    <div className="space-y-2" data-testid="photo-gallery">
      {/* Primary photo */}
      <button
        type="button"
        className="relative w-full h-96 overflow-hidden rounded-card bg-border focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
        onClick={() => openLightbox(activeIndex)}
        aria-label={`View ${primaryPhoto.caption} in full screen`}
      >
        <img
          src={primaryPhoto.url}
          alt={primaryPhoto.caption}
          className="w-full h-full object-cover transition-opacity duration-200"
        />
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
        {photos.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-ink/70 text-white text-xs px-2 py-1 rounded-full">
            {activeIndex + 1} / {photos.length}
          </div>
        )}
      </button>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="list" aria-label="Photo thumbnails">
          {photos.map((photo, index) => (
            <button
              key={index}
              type="button"
              role="listitem"
              onClick={() => setActiveIndex(index)}
              className={`flex-shrink-0 w-20 h-16 overflow-hidden rounded-card border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta ${
                index === activeIndex
                  ? 'border-terracotta opacity-100'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              aria-label={`Photo ${index + 1}: ${photo.caption}`}
              aria-pressed={index === activeIndex}
            >
              <img
                src={photo.url}
                alt={photo.caption}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Previous button */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prevLightbox(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-white/70 bg-black/40 rounded-full p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Main image */}
          <div
            className="max-w-5xl max-h-screen p-8 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[lightboxIndex].url}
              alt={photos[lightboxIndex].caption}
              className="max-h-screen max-w-full object-contain rounded-card"
            />
            <p className="mt-2 text-white text-sm">{photos[lightboxIndex].caption}</p>
          </div>

          {/* Next button */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); nextLightbox(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-white/70 bg-black/40 rounded-full p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Next photo"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
