import React from 'react';
import { getWeddingPhotos, getWeddingDetails } from '@/app/actions/photoActions'; // Ajusta tu ruta
import Link from 'next/link';
import { DICTIONARY } from '@/app/constants/translations';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function GalleryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const [photos, weddingDetails] = await Promise.all([
    getWeddingPhotos(slug),
    getWeddingDetails(slug)
  ]);

  if (!weddingDetails) {
    notFound(); // Dispara el error 404 de Next.js y detiene la ejecución
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <main className="bg-white border border-gray-300 p-4 md:p-8 font-sans max-w-6xl mx-auto rounded-xl">

        <div className="flex flex-col items-center justify-center mb-10 text-gray-700 text-center">
          <h1 className="text-4xl font-serif font-bold mb-2">
            {weddingDetails?.names || DICTIONARY.ES.GALLERY_PAGE.TITLE_FALLBACK}
          </h1>
          <p className="text-[#7b6f6a] bg-white/20 px-4 py-1 rounded-full text-sm backdrop-blur-sm">
            {photos.length} {DICTIONARY.ES.GALLERY_PAGE.SHARED_MOMENTS}
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <Link
            href={`/${slug}`}
            className="bg-white text-[#7b6f6a] px-6 py-2 rounded-full font-semibold shadow-md active:scale-95 transition-transform"
          >
            {DICTIONARY.ES.GALLERY_PAGE.UPLOAD_MORE}
          </Link>
        </div>

        {photos.length > 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {photos.map((photo) => (
              <div key={photo.id} className="break-inside-avoid relative group rounded-xl overflow-hidden shadow-sm">
                <img
                  src={photo.url}
                  alt="Recuerdo de la boda"
                  loading="lazy"
                  className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-xl font-serif">{DICTIONARY.ES.GALLERY_PAGE.EMPTY_STATE}</p>
            <p className="text-sm opacity-80 mt-2">{DICTIONARY.ES.GALLERY_PAGE.EMPTY_SUBTEXT}</p>
          </div>
        )}

      </main>
    </div>
  );
}