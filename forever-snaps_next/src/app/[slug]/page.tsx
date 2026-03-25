'use client'
import React, { use, useEffect, useState } from "react"
import { getPresignedUrl, getWeddingDetails, savePhotoRecord } from "../actions/photoActions";
import { useRouter } from "next/navigation";
import SuccessPage from "../(components)/SuccessPage";
import PreviewPage from "../(components)/PreviewPage";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}



const WeddingAlbum = ({ params }: PageProps) => {
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [weddingNames, setWeddingNames] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const router = useRouter();

    const resolvedParams = use(params);
    const slug = resolvedParams.slug;

    const processUploads = async (filesToUpload: File[]) => {
        setUploading(true);
        try {
            for (const file of filesToUpload) {
                const { url, publicUrl } = await getPresignedUrl(file.name, file.type);

                const uploadResponse = await fetch(url, {
                    method: 'PUT',
                    body: file,
                    headers: {
                        'Content-type': file.type || 'image/jpeg'
                    }
                });

                if (!uploadResponse.ok) {
                    const textError = await uploadResponse.text();
                    throw new Error(`Fallo S3: ${uploadResponse.status} - ${textError}`);
                }

                if (!slug) {
                    throw new Error("El slug de la boda no está definido.");
                }
                await savePhotoRecord(slug, publicUrl);
            }

            setSuccess(true);
        } catch (error) {
            console.error('Error photo uploading', error);
            setSuccess(false);
        } finally {
            setUploading(false);
        }
    };

    const handleCameraSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const filesArray = Array.from(files);
        setSelectedFiles(filesArray);

        const objectURL = URL.createObjectURL(filesArray[0]);
        setPreviewUrl(objectURL);
        setSuccess(false);
        e.target.value = '';
    }

    const confirmPreviewUpload = async () => {
        if (selectedFiles.length === 0) return;
        await processUploads(selectedFiles);
    }

    const cancelPreview = () => {
        setSelectedFiles([]);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setSuccess(false);
    }

    const handleGallerySelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setSuccess(false);
        const filesArray = Array.from(files);
        await processUploads(filesArray);
        e.target.value = '';
    }

    useEffect(() => {
        setMounted(true);
        const fetchWeddingInfo = async () => {
            const data = await getWeddingDetails(slug);
            if (data?.names) {
                setWeddingNames(data.names);
            }
        };
        fetchWeddingInfo();
    }, [slug]);

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
                    Comparte tus momentos con nosotros y ayúdanos a guardar cada recuerdo de esta noche.
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
                        {uploading ? 'Subiendo...' : '📸 Tomar foto'}
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
                        {uploading ? 'Subiendo...' : '🖼️ Subir desde galería'}
                    </label>
                </div>

                <div className="my-4">
                    <button
                        type="button"
                        onClick={() => router.push(`/album/${slug}/gallery`)}
                        className="block w-full py-4 rounded-2xl bg-transparent text-white cursor-pointer transition-all active:scale-95"
                    >
                        ↓ Ver fotos del evento
                    </button>
                </div>


            </div>
        </main>
    );
};

export default WeddingAlbum;