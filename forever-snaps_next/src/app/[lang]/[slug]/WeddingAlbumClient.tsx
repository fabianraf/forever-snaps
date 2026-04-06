'use client'
import React from "react"
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
    const { isNotFound, success, uploading, previewUrl, weddingNames, mounted, handleCameraSelect, confirmPreviewUpload, cancelPreview, handleGallerySelect } = useWeddingAlbum(slug, dictionary)

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

            {settings?.backgroundImageUrl && <div className="absolute inset-0 bg-black/40 z-0"></div>}
            <div className="bg-[#C6B8B8] backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white max-w-sm w-full text-center z-10">
                <div className="flex justify-center mb-4 h-9 items-center">
                    {weddingNames ? <h1 className="text-3xl font-serif font-bold text-center">{settings?.mainGreeting || weddingNames}</h1> : <div className="h-8 w-48 bg-[#e8d5d1] animate-pulse rounded-md"></div>}
                </div>
                <p className="min-h-[24px] text-start">
                    {mounted ? new Date(2026, 3, 10).toLocaleDateString(dictionary.ALBUM_PAGE.DATE_LOCALE, { day: 'numeric', month: 'long', year: 'numeric' }) : ""}
                </p>
                <p className="text-[#7b6f6a] text-sm mb-8 text-start">{dictionary.ALBUM_PAGE.DESCRIPTION}</p>

                <div className="my-2">
                    <input type="file" accept="image/*" capture="environment" id="cameraInput" className="hidden" onChange={handleCameraSelect} disabled={uploading} />
                    <label htmlFor="cameraInput" className={`block w-full py-4 rounded-2xl text-white font-semibold cursor-pointer transition-all ${uploading ? 'bg-gray-400' : 'bg-gradient-to-b from-[#d8a9af] to-[#c79299] shadow-[0_14px_26px_rgba(200,140,150,0.26)] active:scale-95'}`}>
                        {uploading ? dictionary.ALBUM_PAGE.UPLOADING : (settings?.primaryCtaLabel || dictionary.ALBUM_PAGE.TAKE_PHOTO)}
                    </label>
                </div>

                <div className="my-2">
                    <input type="file" accept="image/*" id="galeryInput" className="hidden" onChange={handleGallerySelect} disabled={uploading} multiple />
                    <label htmlFor="galeryInput" className={`block w-full py-4 rounded-2xl text-black font-semibold cursor-pointer transition-all ${uploading ? 'bg-gray-400' : 'bg-white shadow-[0_14px_26px_rgba(200,140,150,0.26)] active:scale-95'}`}>
                        {uploading ? dictionary.ALBUM_PAGE.UPLOADING : (settings?.secondaryCtaLabel || dictionary.ALBUM_PAGE.UPLOAD_GALLERY)}
                    </label>
                </div>

                <div className="my-4">
                    <button type="button" onClick={() => router.push(`/${lang}/${slug}/gallery`)} className="block w-full py-4 rounded-2xl bg-transparent text-white cursor-pointer transition-all active:scale-95">
                        {dictionary.ALBUM_PAGE.VIEW_GALLERY_BTN}
                    </button>
                </div>
            </div>
        </main>
    );
};
export default WeddingAlbumClient;