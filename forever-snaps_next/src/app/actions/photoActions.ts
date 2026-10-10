'use server'

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PrismaClient } from "../../generated/prisma";
import crypto from "crypto";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { s3KeyFromPublicUrl, tryS3KeyFromPublicUrl } from "@/utils/photoUrls";
import { revalidatePath } from "next/cache";
import { getPgConnectionString } from "@/lib/pgConnectionString";

const pool = new Pool({ connectionString: getPgConnectionString() });

const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export type UploadVariant = "original" | "display" | "background";

function sanitizeSlug(slug: string): string {
  const safe = slug.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  return safe || "unknown";
}

function buildPublicUrl(fileKey: string): string {
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
}

async function deleteS3Key(fileKey: string) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileKey,
    })
  );
}

// MÉTODOS PÚBLICOS (INVITADOS)

export const getPresignedUrl = async (
  weddingSlug: string,
  fileName: string,
  contentType: string,
  variant: UploadVariant = "original",
  fileId?: string
) => {
  const wedding = await prisma.wedding.findUnique({ where: { slug: weddingSlug } });
  if (!wedding) {
    throw new Error("Boda no encontrada");
  }

  const safeSlug = sanitizeSlug(weddingSlug);
  const safeName = fileName ? fileName.replace(/[^a-zA-Z0-9.]/g, "_") : `foto_boda_${Date.now()}.jpg`;
  const safeType = contentType || "image/jpeg";
  const id = fileId ?? crypto.randomUUID();
  const displayBaseName = safeName.replace(/\.[^.]+$/, "") || "photo";

  let fileKey: string;
  if (variant === "original") {
    fileKey = `photos/original/${safeSlug}/${id}-${safeName}`;
  } else if (variant === "display") {
    fileKey = `photos/display/${safeSlug}/${id}-${displayBaseName}.jpg`;
  } else {
    fileKey = `photos/backgrounds/${safeSlug}/${id}-${safeName}`;
  }

  const putContentType = variant === "display" ? "image/jpeg" : safeType;

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileKey,
      ContentType: putContentType,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 300 });

    return {
      url,
      fileKey,
      publicUrl: buildPublicUrl(fileKey),
      fileId: id,
    };
  } catch (backendError) {
    console.error("Error al generar firma de AWS:", backendError);
    throw new Error("No se pudo generar el enlace de S3");
  }
};

export const rollbackS3Upload = async (publicUrls: string[]) => {
  for (const publicUrl of publicUrls) {
    try {
      await deleteS3Key(s3KeyFromPublicUrl(publicUrl));
    } catch (error) {
      console.error("Error al revertir subida S3:", error);
    }
  }
};

export const savePhotoRecord = async (
  weddingSlug: string,
  urls: { originalUrl: string; displayUrl: string }
) => {
  const wedding = await prisma.wedding.findUnique({
    where: { slug: weddingSlug },
  });

  if (!wedding) throw new Error("Wedding not found!");

  const photo = await prisma.photo.create({
    data: {
      url: urls.originalUrl,
      displayUrl: urls.displayUrl,
      weddingId: wedding.id,
    },
  });

  return photo;
};

export const getWeddingDetails = async (slug: string) => {
  try {
    const wedding = await prisma.wedding.findUnique({
      where: { slug },
      select: { names: true, date: true },
    });
    return wedding;
  } catch (error) {
    console.error("Error fetching wedding details:", error);
    return null;
  }
};

export const getWeddingPhotos = async (slug: string) => {
  try {
    const photos = await prisma.photo.findMany({
      where: {
        wedding: { slug: slug },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        url: true,
        displayUrl: true,
        createdAt: true,
      },
    });
    return photos;
  } catch (error) {
    console.error("Error obteniendo la galería:", error);
    return [];
  }
};

// MÉTODOS PRIVADOS (ADMINISTRADOR)

async function verifyAdmin() {
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) throw new Error("No autorizado");
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
  } catch {
    throw new Error("Sesión inválida");
  }
}

export const deleteWeddingPhoto = async (
  weddingSlug: string,
  photoId: string,
  imageUrl: string,
  displayUrl?: string | null
) => {
  try {
    await verifyAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  try {
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: { wedding: { select: { slug: true } } },
    });

    if (!photo) {
      return { error: "Foto no encontrada" };
    }

    if (photo.wedding.slug !== weddingSlug) {
      return { error: "No autorizado" };
    }

    const candidateUrls = new Set<string>(
      [photo.url, photo.displayUrl, imageUrl, displayUrl].filter(
        (u): u is string => typeof u === "string" && u.trim() !== ""
      )
    );

    const keysToDelete = new Set<string>();
    for (const url of candidateUrls) {
      const key = tryS3KeyFromPublicUrl(url);
      if (key) keysToDelete.add(key);
    }

    for (const fileKey of keysToDelete) {
      try {
        await deleteS3Key(fileKey);
      } catch (s3Error) {
        console.error("Error eliminando objeto S3 (se continúa con BD):", fileKey, s3Error);
      }
    }

    await prisma.photo.delete({
      where: { id: photoId },
    });

    const slug = photo.wedding.slug;
    for (const lang of ["es", "en"] as const) {
      revalidatePath(`/${lang}/${slug}/gallery`);
      revalidatePath(`/${lang}/${slug}`);
    }
    revalidatePath(`/album/${slug}/gallery`);

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar foto:", error);
    return { error: "No se pudo eliminar la foto" };
  }
};
