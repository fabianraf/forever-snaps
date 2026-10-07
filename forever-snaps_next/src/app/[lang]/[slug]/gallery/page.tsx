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
    // 1. Contenedor principal con la imagen de fondo fija
    <div
      className="min-h-screen relative"
      style={settings?.backgroundImageUrl ? {
        backgroundImage: `url(${settings.backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed' // ¡Efecto Parallax para que no se mueva al hacer scroll!
      } : { backgroundColor: '#f3f4f6' }} // Gris por defecto si no hay foto
    >

      {/* 2. Capa oscura fija para que no sature la vista */}
      {settings?.backgroundImageUrl && <div className="fixed inset-0 bg-black/40 z-0"></div>}

      {/* 3. Contenedor de contenido sobre la capa oscura */}
      <div className="relative z-10 p-4 sm:p-8 min-h-screen flex flex-col">

        {/* 4. Tarjeta principal flotante con un ligero difuminado (backdrop-blur) */}
        <main className="bg-transparent backdrop-blur-md shadow-2xl border border-white/50 p-6 md:p-10 font-sans max-w-6xl w-full mx-auto rounded-3xl flex-grow">

          <div className="flex flex-col items-center justify-center mb-10 text-gray-800 text-center">
            <h1 className="text-4xl font-serif font-bold mb-3 drop-shadow-sm text-white">
              {settings?.mainGreeting || weddingDetails?.names || dictionary.GALLERY_PAGE.TITLE_FALLBACK}
            </h1>

            <p className="text-[#7b6f6a] border px-5 py-1.5 rounded-full text-sm font-medium">
              {photos.length} {dictionary.GALLERY_PAGE.SHARED_MOMENTS}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
            <Link href={`/${lang}/${slug}`} className="bg-[#978C12] text-gray-900 hover:text-black hover:border-gray-300 px-6 py-2.5 rounded-full font-bold shadow-sm hover:shadow-md active:scale-95 transition-all text-center">
              {dictionary.GALLERY_PAGE.UPLOAD_MORE}
            </Link>

            <DownloadAllButton
              photos={photos}
              label={dictionary.GALLERY_PAGE.DOWNLOAD_ALL || "Descargar Todo"}
            />
          </div>

          <GalleryGrid photos={photos} dictionary={dictionary} />
        </main>

        {/* Footer adaptado a la galería */}
        <footer className="w-full py-6 mt-8 text-center z-10">
          <a
            href="https://www.senirop.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors drop-shadow-md"
          >
            Senirop - 2026
          </a>
        </footer>

      </div>
    </div>
  );
}