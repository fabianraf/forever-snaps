import { useEffect, useState } from "react";
import {
  getPresignedUrl,
  getWeddingDetails,
  rollbackS3Upload,
  savePhotoRecord,
} from "../actions/photoActions";
import { DictionaryType as Dictionary } from "../constants/translations";
import { formatWeddingDate } from "@/utils/formatWeddingDate";
import imageCompression from "browser-image-compression";

const MAX_ORIGINAL_BYTES = 15 * 1024 * 1024;

const DISPLAY_COMPRESSION = {
  maxSizeMB: 0.35,
  maxWidthOrHeight: 800,
  useWebWorker: true,
  fileType: "image/jpeg" as const,
};

export const useWeddingAlbum = (slug: string, dictionary: Dictionary) => {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [weddingNames, setWeddingNames] = useState<string | null>(null);
  const [weddingDateFormatted, setWeddingDateFormatted] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const fetchWeddingInfo = async () => {
      const data = await getWeddingDetails(slug);
      if (data?.names) {
        setWeddingNames(data.names);
        if (data.date) setWeddingDateFormatted(formatWeddingDate(data.date));
      } else setIsNotFound(true);
    };
    fetchWeddingInfo();
  }, [slug]);

  const uploadFileToS3 = async (presignedUrl: string, body: File | Blob, contentType: string) => {
    const uploadResponse = await fetch(presignedUrl, {
      method: "PUT",
      body,
      headers: { "Content-type": contentType },
    });
    if (!uploadResponse.ok) throw new Error(`Fallo S3: ${uploadResponse.status}`);
  };

  const processUploads = async (filesToUpload: File[]) => {
    setUploading(true);
    try {
      for (const file of filesToUpload) {
        if (file.size > MAX_ORIGINAL_BYTES) {
          throw new Error("La foto supera el límite de 15 MB.");
        }

        const {
          url: originalPresigned,
          publicUrl: originalUrl,
          fileId,
        } = await getPresignedUrl(file.name, file.type || "image/jpeg", "original");

        await uploadFileToS3(originalPresigned, file, file.type || "application/octet-stream");

        let displayUrl: string;
        try {
          const displayBlob = await imageCompression(file, DISPLAY_COMPRESSION);
          const displayFile = new File([displayBlob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          const { url: displayPresigned, publicUrl } = await getPresignedUrl(
            file.name,
            "image/jpeg",
            "display",
            fileId
          );
          await uploadFileToS3(displayPresigned, displayFile, "image/jpeg");
          displayUrl = publicUrl;
        } catch (displayError) {
          await rollbackS3Upload([originalUrl]);
          throw displayError;
        }

        if (!slug) throw new Error(dictionary.ALBUM_PAGE.NOT_FOUND);

        try {
          await savePhotoRecord(slug, { originalUrl, displayUrl });
        } catch (saveError) {
          await rollbackS3Upload([originalUrl, displayUrl]);
          throw saveError;
        }
      }
      setSuccess(true);
    } catch (error) {
      console.error("Error photo uploading", error);
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
    e.target.value = "";
  };

  const confirmPreviewUpload = async () => {
    if (selectedFiles.length === 0) return;
    await processUploads(selectedFiles);
  };

  const cancelPreview = () => {
    setSelectedFiles([]);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSuccess(false);
  };

  const handleGallerySelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setSuccess(false);
    await processUploads(Array.from(files));
    e.target.value = "";
  };

  return {
    uploading,
    success,
    weddingNames,
    weddingDateFormatted,
    mounted,
    isNotFound,
    previewUrl,
    handleCameraSelect,
    confirmPreviewUpload,
    cancelPreview,
    handleGallerySelect,
  };
};
