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
      className="feral-page p-6 sm:p-10 flex flex-col items-center justify-center font-sans text-feral-ink relative"
      style={settings?.backgroundImageUrl ? {
        backgroundImage: `url(${settings.backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : undefined}
    >
      {settings?.backgroundImageUrl && <div className="feral-page-overlay" aria-hidden />}

      <div className="feral-card p-8 sm:p-10 max-w-md w-full text-center mt-auto mb-auto">
        <div className="flex justify-center mb-5 items-center">
          {weddingNames ? (
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-center text-feral-ink leading-tight">
              {settings?.mainGreeting || weddingNames}
            </h1>
          ) : (
            <div className="h-9 w-48 bg-feral-cream animate-pulse rounded-full" />
          )}
        </div>

        <p className="text-center text-feral-orange font-semibold tracking-wide mb-5">
          {mounted && weddingDateFormatted ? weddingDateFormatted : ""}
        </p>

        <p className="text-feral-body text-sm sm:text-[0.9375rem] mb-8 text-center whitespace-pre-line leading-relaxed">
          {uploading ? dictionary.ALBUM_PAGE.UPLOADING : (settings?.secondaryText || dictionary.ALBUM_PAGE.DESCRIPTION)}
        </p>

        <div className="space-y-3">
          <div>
            <input type="file" accept="image/*" capture="environment" id="cameraInput" className="hidden" onChange={handleCameraSelect} disabled={uploading} />
            <label htmlFor="cameraInput" className={uploading ? "btn-feral-primary opacity-60 pointer-events-none" : "btn-feral-primary"}>
              {uploading
                ? `📸 ${dictionary.ALBUM_PAGE.UPLOADING}`
                : `📸 ${settings?.primaryCtaLabel || dictionary.ALBUM_PAGE.TAKE_PHOTO}`
              }
            </label>
          </div>

          <div>
            <input type="file" accept="image/*" id="galeryInput" className="hidden" onChange={handleGallerySelect} disabled={uploading} multiple />
            <label htmlFor="galeryInput" className={uploading ? "btn-feral-secondary opacity-60 pointer-events-none" : "btn-feral-secondary"}>
              {uploading
                ? `🖼️ ${dictionary.ALBUM_PAGE.UPLOADING}`
                : `🖼️ ${settings?.secondaryCtaLabel || dictionary.ALBUM_PAGE.UPLOAD_GALLERY}`}
            </label>
          </div>

          <button
            type="button"
            onClick={() => router.push(`/${lang}/${slug}/gallery`)}
            className="btn-feral-ghost"
          >
            {dictionary.ALBUM_PAGE.VIEW_GALLERY_BTN}
          </button>
        </div>
      </div>

      <footer className="w-full py-6 mt-auto text-center relative z-10">
        <a
          href="https://www.senirop.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-feral-muted hover:text-feral-orange transition-colors"
        >
          Senirop — {new Date().getFullYear()}
        </a>
      </footer>
    </main>
  );
};

export default WeddingAlbumClient;
