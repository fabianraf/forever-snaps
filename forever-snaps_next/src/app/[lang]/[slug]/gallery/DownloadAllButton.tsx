'use client';

import { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface DownloadButtonProps {
  photos: { id: string; url: string }[];
  label: string;
}

export default function DownloadAllButton({ photos, label }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
    if (photos.length === 0) return;
    setIsDownloading(true);
    setProgress(0);
    const zip = new JSZip();
    const folder = zip.folder("fotos_boda");

    if (!folder) {
      setIsDownloading(false);
      return;
    }

    try {

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];



        const cacheBusterUrl = `${photo.url}?t=${new Date().getTime()}`;

        const response = await fetch(cacheBusterUrl, {
          mode: 'cors'
        });

        if (!response.ok) throw new Error(`Error descargando foto ${i}`);

        const blob = await response.blob();
        const urlObj = new URL(photo.url);
        const fileName = urlObj.pathname.split('/').pop() || `foto_${i + 1}.jpg`;
        folder.file(fileName, blob);
        setProgress(Math.round(((i + 1) / photos.length) * 100));
      }
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "fotos_boda.zip");

    } catch (error) {
      console.error("Error al comprimir las fotos:", error);
      alert("Hubo un problema al descargar algunas fotos.");
    } finally {
      setIsDownloading(false);
      setProgress(0);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading || photos.length === 0}
      className="bg-gray-800 text-white px-6 py-2 rounded-full font-semibold shadow-md hover:bg-gray-900 active:scale-95 transition-all disabled:bg-gray-400 disabled:active:scale-100 flex items-center justify-center min-w-[200px]"
    >
      {isDownloading ? `Comprimiendo... ${progress}%` : label}
    </button>
  );
}