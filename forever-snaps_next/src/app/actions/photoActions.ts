'use server'

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PrismaClient } from "../../generated/prisma";
import crypto from "crypto";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { s3KeyFromPublicUrl } from "@/utils/photoUrls";
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

export type UploadVariant = "original" | "display";

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
  fileName: string,
  contentType: string,
  variant: UploadVariant = "original",
  fileId?: string
) => {
  const safeName = fileName ? fileName.replace(/[^a-zA-Z0-9.]/g, "_") : `foto_boda_${Date.now()}.jpg`;
  const safeType = contentType || "image/jpeg";
  const id = fileId ?? crypto.randomUUID();

  const fileKey =
    variant === "original"
      ? `photos/original/${id}-${safeName}`
      : `photos/display/${id}-${safeName.replace(/\.[^.]+$/, "") || "photo"}.jpg`;

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
  photoId: string,
  imageUrl: string,
  displayUrl?: string | null
) => {
  await verifyAdmin();
  try {
    const keysToDelete = new Set<string>([s3KeyFromPublicUrl(imageUrl)]);
    if (displayUrl) {
      keysToDelete.add(s3KeyFromPublicUrl(displayUrl));
    }

    for (const fileKey of keysToDelete) {
      await deleteS3Key(fileKey);
    }

    await prisma.photo.delete({
      where: { id: photoId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar foto:", error);
    return { error: "No se pudo eliminar la foto" };
  }
};
