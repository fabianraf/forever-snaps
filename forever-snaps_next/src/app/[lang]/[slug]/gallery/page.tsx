import React from 'react';
import { getWeddingPhotos, getWeddingDetails } from '@/app/actions/photoActions';
import Link from 'next/link';
import { getDictionary, Locale } from '@/utils/getDictionary';
import { notFound } from 'next/navigation';
import GalleryGrid from './GalleryGrid';
import DownloadAllButton from './DownloadAllButton';

interface PageProps {
  params: Promise<{ lang: Locale; slug: string; }>;
}

export default async function GalleryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const lang = resolvedParams.lang;

  const dictionary = await getDictionary(lang);
  const [photos, weddingDetails] = await Promise.all([
    getWeddingPhotos(slug),
    getWeddingDetails(slug)
  ]);

  if (!weddingDetails) notFound();

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <main className="bg-white border border-gray-300 p-4 md:p-8 font-sans max-w-6xl mx-auto rounded-xl">
        <div className="flex flex-col items-center justify-center mb-10 text-gray-700 text-center">
          <h1 className="text-4xl font-serif font-bold mb-2">
            {weddingDetails?.names || dictionary.GALLERY_PAGE.TITLE_FALLBACK}
          </h1>
          <p className="text-[#7b6f6a] bg-white/20 px-4 py-1 rounded-full text-sm backdrop-blur-sm">
            {photos.length} {dictionary.GALLERY_PAGE.SHARED_MOMENTS}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <Link href={`/${lang}/${slug}`} className="bg-white border border-gray-300 text-[#7b6f6a] px-6 py-2 rounded-full font-semibold shadow-sm hover:shadow-md active:scale-95 transition-all text-center">
            {dictionary.GALLERY_PAGE.UPLOAD_MORE}
          </Link>
        </div>
        <GalleryGrid photos={photos} dictionary={dictionary} />
      </main>
    </div>
  );
}