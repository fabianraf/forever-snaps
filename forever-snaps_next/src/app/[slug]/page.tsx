'use client'

import React, { use, useState } from "react"
import { getPresignedUrl, savePhotoRecord } from "../actions/photoActions";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

const WeddingAlbum = ({ params }: PageProps) => {
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);

    const resolvedParams = use(params);
    const slug = resolvedParams.slug;

    const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return;

        setUploading(true);
        setSuccess(false);

        try {
            const { url, publicUrl } = await getPresignedUrl(file.name, file.type)

            const uploadResponse = await fetch(url, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                }
            });

            if (uploadResponse.ok) {
                await savePhotoRecord(slug, publicUrl);
                setSuccess(true);
            }
        } catch (error) {
            console.error("Error photo uploading", error);
        } finally {
            setUploading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#fffaf7] p-6 flex flex-col items-center justify-center font-sans text-[#2f2a28]">
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-[#28px] shadow-xl border border-[#826b602e] max-w-sm w-full text-center">
                <h1 className="text-3xl font-serif font-bold mb-2">Captura este momento</h1>
                <p className="text-[#7b6f6a] text-sm mb-8">
                    Toma una foto ahora o selecciona desde tu galeria
                </p>

                <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    id="cameraInput"
                    className="hidden"
                    onChange={handleCapture}
                    disabled={uploading}
                />

                <label
                    htmlFor="cameraInput"
                    className={`
                        block w-full py-4 rounded-2xl text-white font-bold cursor-pointer transition-all
                        ${uploading ? 'bg-gray-400' : 'bg-gradient-to-b from-[#d8a9af] to-[#c79299] shadow-[0_14px_26px_rgba(200,140,150,0.26)] active:scale-95'}
                    `}
                >
                    {uploading ? 'Subiendo...' : '📸 Tomar / Subir foto'}
                </label>

                {success && (
                    <div className="mt-6 p-4 bg-[#f7efe8] rounded-xl border border-[#826b602e]">
                        <div className="text'2xl mb-2 ">🎉 ✨ 🎉</div>
                        <h4 className="font-serif font-bold text-lg">¡Gracias por compartir!</h4>
                        <p className="text-[#7b6f6a] text-sm mt-1">Tu foto ya forma parte del álbum</p>
                    </div>
                )}
            </div>
        </main>
    )
}

export default WeddingAlbum;