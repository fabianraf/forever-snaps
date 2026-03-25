'use client'
import React, { use, useEffect, useState } from "react"
import { getPresignedUrl, getWeddingDetails, savePhotoRecord } from "../actions/photoActions";

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

    const SuccessPage = () => {
        return (
            <main className="min-h-screen bg-white p-6 flex flex-col items-center justify-center font-sans text-white">
                <div className="bg-[#FBF7F4] backdrop-blur-md p-8 rounded-3xl shadow-xl border border-[#826b602e] max-w-sm w-full text-center">
                    <div className="my-6 p-4 bg-[#f7efe8] rounded-xl border border-[#826b602e]">
                        <div className="text-2xl mb-2 ">🎉 ✨ 🎉</div>
                        <h4 className="text-[#7b6f6a] font-serif font-semibold text-lg">¡Gracias por compartir!</h4>
                        <p className="text-[#7b6f6a] text-sm mt-1">Tu foto ya forma parte del álbum de esta boda</p>
                    </div>

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
                            {uploading ? 'Subiendo...' : '👀 Ver galería'}
                        </label>
                    </div>
                </div>
            </main>
        );
    };

    if (success) {
        return <SuccessPage />;
    }

    if (previewUrl) {
        return (
            <main className="min-h-screen bg-white p-6 flex flex-col items-center justify-center font-sans text-gray-700">
                <div className="bg-white backdrop-blur-md p-6 rounded-3xl shadow-xl border border-gray-300 max-w-sm w-full flex flex-col items-center">
                    <h2 className="text-2xl font-serif font-bold mb-4">Vista previa</h2>
                    <p>Este momento será parte de nuestra historia ❤️</p>

                    <div className="relative w-full aspect-[3/4] mb-6 rounded-xl overflow-hidden shadow-md">
                        <img
                            src={previewUrl}
                            alt="Vista previa"
                            className="object-cover w-full h-full"
                        />
                    </div>

                    <div className="flex flex-col w-full gap-4">
                        <button
                            onClick={confirmPreviewUpload}
                            disabled={uploading}
                            className="flex-1 py-3 rounded-2xl text-white font-semibold bg-gradient-to-b from-[#d8a9af] to-[#c79299] shadow-[0_14px_26px_rgba(200,140,150,0.26)] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {uploading ? 'Subiendo...' : '✅Subir Foto'}
                        </button>
                        <button
                            onClick={cancelPreview}
                            disabled={uploading}
                            className="flex-1 py-3 rounded-2xl bg-white text-black font-semibold active:scale-95 transition-all disabled:opacity-50"
                        >
                            🔄 Volver a tomar
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#C9B9B9] p-6 flex flex-col items-center justify-center font-sans text-white">
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
                    {mounted ? new Date().toLocaleDateString() : ""}
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

                {/* El antiguo mensaje de éxito pequeño ha sido eliminado, ya no es necesario */}
            </div>
        </main>
    );
};

export default WeddingAlbum;