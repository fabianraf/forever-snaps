import React from 'react';
import { getWeddingPhotos, getWeddingDetails } from '@/app/actions/photoActions';
import { getWeddingSettings } from '@/app/actions/settingsActions';
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

  const [photos, weddingDetails, settings] = await Promise.all([
    getWeddingPhotos(slug),
    getWeddingDetails(slug),
    getWeddingSettings(slug)
  ]);

  if (!weddingDetails) notFound();

  return (
    <div
      className="feral-page min-h-screen relative"
      style={settings?.backgroundImageUrl ? {
        backgroundImage: `url(${settings.backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      } : undefined}
    >
      {settings?.backgroundImageUrl && <div className="feral-page-overlay fixed inset-0" aria-hidden />}

      <div className="relative z-10 p-4 sm:p-8 min-h-screen flex flex-col">
        <main className="feral-card p-6 md:p-10 font-sans max-w-6xl w-full mx-auto flex-grow">
          <div className="flex flex-col items-center justify-center mb-10 text-center">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-4 text-feral-ink">
              {settings?.mainGreeting || weddingDetails?.names || dictionary.GALLERY_PAGE.TITLE_FALLBACK}
            </h1>

            <p className="text-feral-body border border-feral-orange/25 px-5 py-1.5 rounded-full text-sm font-medium bg-white/60">
              {photos.length} {dictionary.GALLERY_PAGE.SHARED_MOMENTS}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
            <Link
              href={`/${lang}/${slug}`}
              className="inline-flex items-center justify-center bg-feral-orange text-white hover:bg-feral-orange-hover px-6 py-2.5 rounded-full font-semibold shadow-md shadow-feral-orange/20 active:scale-95 transition-all text-center"
            >
              {dictionary.GALLERY_PAGE.UPLOAD_MORE}
            </Link>

            <DownloadAllButton
              photos={photos}
              label={dictionary.GALLERY_PAGE.DOWNLOAD_ALL || "Descargar Todo"}
            />
          </div>

          <GalleryGrid photos={photos} dictionary={dictionary} />
        </main>

        <footer className="w-full py-6 mt-8 text-center z-10">
          <a
            href="https://www.senirop.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-feral-muted hover:text-feral-orange transition-colors"
          >
            Senirop — {new Date().getFullYear()}
          </a>
        </footer>
      </div>
    </div>
  );
}
