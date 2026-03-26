'use client'
import React, { use, useEffect, useState } from "react"
import { getPresignedUrl, getWeddingDetails, savePhotoRecord } from "../actions/photoActions";
import { notFound, useRouter } from "next/navigation";
import SuccessPage from "../(components)/SuccessPage";
import PreviewPage from "../(components)/PreviewPage";
import { DICTIONARY } from "../constants/translations";
import { useWeddingAlbum } from "../hooks/useWeddingAlbum";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const WeddingAlbum = ({ params }: PageProps) => {
  const router = useRouter();
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const {
    isNotFound,
    success,
    uploading,
    previewUrl,
    weddingNames,
    mounted,
    handleCameraSelect,
    confirmPreviewUpload,
    cancelPreview,
    handleGallerySelect
  } = useWeddingAlbum(slug)

  if (isNotFound) {
    notFound();
  }

  if (success) {
    return <SuccessPage uploading={uploading} handleCameraSelect={handleCameraSelect} slug={slug} />;
  }

  if (previewUrl) {
    return (
      <PreviewPage
        previewUrl={previewUrl}
        uploading={uploading}
        confirmPreviewUpload={confirmPreviewUpload}
        cancelPreview={cancelPreview}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#AD9B99] p-6 flex flex-col items-center justify-center font-sans text-white">
      <div className="bg-[#C6B8B8] backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white max-w-sm w-full text-center">
        <div className="flex justify-center mb-4 h-9 items-center">
          {weddingNames ? (
            <h1 className="text-3xl font-serif font-bold text-center">
              {weddingNames}
            </h1>
          ) : (
            <div className="h-8 w-48 bg-[#e8d5d1] animate-pulse rounded-md"></div>
          )}
        </div>
        <p className="min-h-[24px] text-start">
          {mounted ? new Date(2026, 3, 25).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }) : ""}
        </p>

        <p className="text-[#7b6f6a] text-sm mb-8 text-start">
          {DICTIONARY.ES.ALBUM_PAGE.DESCRIPTION}
        </p>

        <div className="my-2">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            id="cameraInput"
            className="hidden"
            onChange={handleCameraSelect}
            disabled={uploading}
          />
          <label
            htmlFor="cameraInput"
            className={`
                        block w-full py-4 rounded-2xl text-white font-semibold cursor-pointer transition-all
                        ${uploading ? 'bg-gray-400' : 'bg-gradient-to-b from-[#d8a9af] to-[#c79299] shadow-[0_14px_26px_rgba(200,140,150,0.26)] active:scale-95'}
                    `}
          >
            {uploading ? DICTIONARY.ES.ALBUM_PAGE.UPLOADING : DICTIONARY.ES.ALBUM_PAGE.TAKE_PHOTO}
          </label>
        </div>

        <div className="my-2">
          <input
            type="file"
            accept="image/*"
            id="galeryInput"
            className="hidden"
            onChange={handleGallerySelect}
            disabled={uploading}
            multiple
          />
          <label
            htmlFor="galeryInput"
            className={`
                            block w-full py-4 rounded-2xl text-black font-semibold cursor-pointer transition-all
                            ${uploading ? 'bg-gray-400' : 'bg-white shadow-[0_14px_26px_rgba(200,140,150,0.26)] active:scale-95'}
                        `}
          >
            {uploading ? DICTIONARY.ES.ALBUM_PAGE.UPLOADING : DICTIONARY.ES.ALBUM_PAGE.UPLOAD_GALLERY}
          </label>
        </div>

        <div className="my-4">
          <button
            type="button"
            onClick={() => router.push(`/album/${slug}/gallery`)}
            className="block w-full py-4 rounded-2xl bg-transparent text-white cursor-pointer transition-all active:scale-95"
          >
            {DICTIONARY.ES.ALBUM_PAGE.VIEW_GALLERY_BTN}
          </button>
        </div>
      </div>
    </main>
  );
};

export default WeddingAlbum;