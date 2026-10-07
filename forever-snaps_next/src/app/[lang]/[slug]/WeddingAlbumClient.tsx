'use client';

import React from "react";
import { notFound, useRouter } from "next/navigation";
import SuccessPage from "../../(components)/SuccessPage";
import PreviewPage from "../../(components)/PreviewPage";
import { DictionaryType as Dictionary } from "../../constants/translations";
import { useWeddingAlbum } from "../../hooks/useWeddingAlbum";

interface ClientProps {
  slug: string;
  lang: string;
  dictionary: Dictionary;
  settings?: any;
}

const WeddingAlbumClient = ({ slug, lang, dictionary, settings }: ClientProps) => {
  const router = useRouter();
  const { isNotFound, success, uploading, previewUrl, weddingNames, weddingDateFormatted, mounted, handleCameraSelect, confirmPreviewUpload, cancelPreview, handleGallerySelect } = useWeddingAlbum(slug, dictionary);

  if (isNotFound) notFound();
  if (success) return <SuccessPage uploading={uploading} handleCameraSelect={handleCameraSelect} slug={slug} lang={lang} dictionary={dictionary} />;
  if (previewUrl) return <PreviewPage previewUrl={previewUrl} uploading={uploading} confirmPreviewUpload={confirmPreviewUpload} cancelPreview={cancelPreview} dictionary={dictionary} />;

  return (
    <main
      className="min-h-screen bg-[#AD9B99] p-6 flex flex-col items-center justify-center font-sans text-white relative"
      style={settings?.backgroundImageUrl ? {
        backgroundImage: `url(${settings.backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {}}
    >
      {/* Capa oscura de fondo */}
      {settings?.backgroundImageUrl && <div className="absolute inset-0 bg-black/40 z-0"></div>}

      {/* Contenedor de la tarjeta */}
      <div className="backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/50 max-w-sm w-full text-center z-10 mt-auto mb-auto">
        <div className="flex justify-center mb-4 items-center">
          {weddingNames ? (
            <h1 className="text-3xl font-serif font-bold text-center">
              {settings?.mainGreeting || weddingNames}
            </h1>
          ) : (
            <div className="h-8 w-48 bg-[#e8d5d1] animate-pulse rounded-md"></div>
          )}
        </div>

        <p className="text-start text-[#978C12] font-bold mb-4">
          {mounted && weddingDateFormatted ? weddingDateFormatted : ""}
        </p>

        <p className="text-gray-200 text-sm mb-6 text-start whitespace-pre-line leading-relaxed">
          {uploading ? dictionary.ALBUM_PAGE.UPLOADING : (settings?.secondaryText || dictionary.ALBUM_PAGE.DESCRIPTION)}
        </p>

        <div className="my-2">
          <input type="file" accept="image/*" capture="environment" id="cameraInput" className="hidden" onChange={handleCameraSelect} disabled={uploading} />
          <label htmlFor="cameraInput" className={`block w-full py-4 rounded-2xl text-white font-semibold cursor-pointer transition-all ${uploading ? 'bg-gray-400' : 'border border-white hover:bg-white/10'}`}>
            {uploading
              ? `📸 ${dictionary.ALBUM_PAGE.UPLOADING}`
              : `📸 ${settings?.primaryCtaLabel || dictionary.ALBUM_PAGE.TAKE_PHOTO}`
            }
          </label>
        </div>

        <div className="my-2">
          <input type="file" accept="image/*" id="galeryInput" className="hidden" onChange={handleGallerySelect} disabled={uploading} multiple />
          <label htmlFor="galeryInput" className={`block w-full py-4 rounded-2xl text-black font-semibold cursor-pointer transition-all ${uploading ? 'bg-gray-400' : 'bg-[#978C12] hover:bg-[#857b0f]'}`}>
            {uploading
              ? `🖼️ ${dictionary.ALBUM_PAGE.UPLOADING}`
              : `🖼️ ${settings?.secondaryCtaLabel || dictionary.ALBUM_PAGE.UPLOAD_GALLERY}`}
          </label>
        </div>

        <div className="my-4">
          <button type="button" onClick={() => router.push(`/${lang}/${slug}/gallery`)} className="block w-full py-4 rounded-2xl bg-transparent text-white cursor-pointer transition-all active:scale-95 hover:bg-white/5 border border-transparent">
            {dictionary.ALBUM_PAGE.VIEW_GALLERY_BTN}
          </button>
        </div>
      </div>

      {/* Footer reposicionado y elevado en Z */}
      <footer className="w-full py-4 mt-auto text-center z-10">
        <a
          href="https://www.senirop.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-gray-300 hover:text-white transition-colors drop-shadow-md"
        >
          Senirop - {new Date().getFullYear()}
        </a>
      </footer>
    </main>
  );
};

export default WeddingAlbumClient;