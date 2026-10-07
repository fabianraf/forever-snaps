'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { getPhotoDisplayUrl } from '@/utils/photoUrls';
import type { DictionaryType } from '@/app/constants/translations';

interface Photo {
  id: string;
  url: string;
  displayUrl?: string | null;
}

interface GalleryGridProps {
  photos: Photo[];
  dictionary: DictionaryType;
}

const SWIPE_THRESHOLD_PX = 50;

export default function GalleryGrid({ photos, dictionary }: GalleryGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const initialOpenRef = useRef(true);

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
    initialOpenRef.current = true;
  }, []);

  const goPrev = useCallback(() => {
    setSelectedIndex((idx) => {
      if (idx === null || idx <= 0) return idx;
      initialOpenRef.current = false;
      return idx - 1;
    });
  }, []);

  const goNext = useCallback(() => {
    setSelectedIndex((idx) => {
      if (idx === null || idx >= photos.length - 1) return idx;
      initialOpenRef.current = false;
      return idx + 1;
    });
  }, [photos.length]);

  useEffect(() => {
    if (selectedIndex === null) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedIndex, closeLightbox, goPrev, goNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX || Math.abs(deltaX) <= Math.abs(deltaY)) return;

    if (deltaX < 0) goNext();
    else goPrev();
  };

  const activePhoto = selectedIndex !== null ? photos[selectedIndex] : null;
  const canGoPrev = selectedIndex !== null && selectedIndex > 0;
  const canGoNext = selectedIndex !== null && selectedIndex < photos.length - 1;
  const g = dictionary.GALLERY_PAGE;

  return (
    <>
      {photos.length > 0 ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 cursor-pointer">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="break-inside-avoid relative group rounded-xl overflow-hidden shadow-sm"
              onClick={() => {
                initialOpenRef.current = true;
                setSelectedIndex(index);
              }}
            >
              <img
                src={getPhotoDisplayUrl(photo)}
                alt="Recuerdo de la boda"
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-3xl drop-shadow-md">
                  ⛶
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-feral-muted mt-20">
          <p className="text-xl font-serif text-feral-ink">{dictionary.GALLERY_PAGE.EMPTY_STATE}</p>
          <p className="text-sm text-feral-body mt-2">{dictionary.GALLERY_PAGE.EMPTY_SUBTEXT}</p>
        </div>
      )}

      {activePhoto && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 md:p-8 backdrop-blur-sm"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={g.LIGHTBOX_CLOSE}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white text-4xl cursor-pointer hover:text-gray-300 transition-colors z-[60] min-w-11 min-h-11 flex items-center justify-center"
            aria-label={g.LIGHTBOX_CLOSE}
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
          >
            &times;
          </button>

          <p className="absolute top-5 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium z-[60]">
            {selectedIndex + 1} / {photos.length}
          </p>

          <button
            type="button"
            aria-label={g.LIGHTBOX_PREVIOUS}
            disabled={!canGoPrev}
            className={`absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-[60] min-w-11 min-h-11 md:min-w-12 md:min-h-12 flex items-center justify-center rounded-full bg-white/15 text-white text-2xl md:text-3xl backdrop-blur-sm transition ${
              canGoPrev ? 'hover:bg-white/25 active:scale-95' : 'opacity-30 pointer-events-none'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
          >
            ‹
          </button>

          <button
            type="button"
            aria-label={g.LIGHTBOX_NEXT}
            disabled={!canGoNext}
            className={`absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-[60] min-w-11 min-h-11 md:min-w-12 md:min-h-12 flex items-center justify-center rounded-full bg-white/15 text-white text-2xl md:text-3xl backdrop-blur-sm transition ${
              canGoNext ? 'hover:bg-white/25 active:scale-95' : 'opacity-30 pointer-events-none'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
          >
            ›
          </button>

          <div
            className="relative w-full max-w-5xl h-[75vh] md:h-[85vh] mt-8"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              key={activePhoto.id}
              src={activePhoto.url}
              alt="Vista ampliada"
              fill
              className="object-contain rounded-md select-none"
              sizes="(max-width: 768px) 100vw, 1200px"
              quality={80}
              priority={initialOpenRef.current}
              draggable={false}
            />
          </div>
        </div>
      )}
    </>
  );
}
