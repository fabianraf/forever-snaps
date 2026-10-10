export type PhotoUrls = {
  url: string;
  displayUrl?: string | null;
};

export function getPhotoDisplayUrl(photo: PhotoUrls): string {
  return photo.displayUrl ?? photo.url;
}

export function s3KeyFromPublicUrl(imageUrl: string): string {
  const urlObj = new URL(imageUrl);
  return decodeURIComponent(urlObj.pathname.substring(1));
}

export function tryS3KeyFromPublicUrl(imageUrl: string): string | null {
  try {
    return s3KeyFromPublicUrl(imageUrl);
  } catch {
    return null;
  }
}
