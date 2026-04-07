import { useEffect, useState } from "react";
import { getPresignedUrl, getWeddingDetails, savePhotoRecord } from "../actions/photoActions";
import { DictionaryType as Dictionary } from "../constants/translations";
import imageCompression from "browser-image-compression";

export const useWeddingAlbum = (slug: string, dictionary: Dictionary) => {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [weddingNames, setWeddingNames] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const fetchWeddingInfo = async () => {
      const data = await getWeddingDetails(slug);
      if (data?.names) setWeddingNames(data.names);
      else setIsNotFound(true);
    };
    fetchWeddingInfo();
  }, [slug]);

  const processUploads = async (filesToUpload: File[]) => {
    setUploading(true);
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg',
      };

      for (const file of filesToUpload) {
        const compressedBlob = await imageCompression(file, options);
        const compressedFile = new File([compressedBlob], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });

        const { url, publicUrl } = await getPresignedUrl(compressedFile.name, compressedFile.type);
        const uploadResponse = await fetch(url, {
          method: 'PUT',
          body: compressedFile,
          headers: { 'Content-type': compressedFile.type || 'image/jpeg' }
        });

        if (!uploadResponse.ok) throw new Error(`Fallo S3: ${uploadResponse.status}`);
        if (!slug) throw new Error(dictionary.ALBUM_PAGE.NOT_FOUND);

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
    setPreviewUrl(URL.createObjectURL(filesArray[0]));
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
    await processUploads(Array.from(files));
    e.target.value = '';
  }

  return { uploading, success, weddingNames, mounted, isNotFound, previewUrl, handleCameraSelect, confirmPreviewUpload, cancelPreview, handleGallerySelect }
}