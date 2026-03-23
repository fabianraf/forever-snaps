'use server'

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PrismaClient } from "../../generated/prisma";
import crypto from "crypto";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function getPresignedUrl(fileName: string, contentType: string) {
    const uniqueFileName = `photos/${crypto.randomUUID()}-${fileName}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: uniqueFileName,
        ContentType: contentType,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 60 });

    return {
        url,
        fileKey: uniqueFileName,
        publicUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`
    };
}

export async function savePhotoRecord(weddingSlug: string, photoUrl: string) {
    const wedding = await prisma.wedding.findUnique({
        where: { slug: weddingSlug }
    });

    if (!wedding) throw new Error("Wedding not found!");

    const photo = await prisma.photo.create({
        data: {
            url: photoUrl,
            weddingId: wedding.id,
        }
    });

    return photo;
}