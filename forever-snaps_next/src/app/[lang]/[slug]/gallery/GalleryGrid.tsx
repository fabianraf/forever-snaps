'use client';

import React, { useState } from 'react';

interface Photo {
  id: string;
  url: string;
}

interface GalleryGridProps {
  photos: Photo[];
  dictionary: any;
}

export default function GalleryGrid({ photos, dictionary }: GalleryGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  return (
    <>
      {photos.length > 0 ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 cursor-pointer">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="break-inside-avoid relative group rounded-xl overflow-hidden shadow-sm"
              onClick={() => setSelectedPhoto(photo.url)}
            >
              <img
                src={photo.url}
                alt="Recuerdo de la boda"
                loading="lazy"
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
        <div className="text-center text-gray-500 mt-20">
          <p className="text-xl font-serif">{dictionary.GALLERY_PAGE.EMPTY_STATE}</p>
          <p className="text-sm opacity-80 mt-2">{dictionary.GALLERY_PAGE.EMPTY_SUBTEXT}</p>
        </div>
      )}

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-8 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl cursor-pointer hover:text-gray-300 transition-colors z-50"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPhoto(null);
            }}
          >
            &times;
          </button>
          <img
            src={selectedPhoto}
            alt="Vista ampliada"
            className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}