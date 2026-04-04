'use server'

import { PrismaClient } from "../../generated/prisma";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const getAdminEmail = async () => {
  const token = (await cookies()).get('admin_session')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload.email as string;
  } catch {
    return null;
  }
}

export const getWeddingSettings = async (slug: string) => {
  const wedding = await prisma.wedding.findUnique({
    where: { slug },
    include: { settings: true }
  });
  return wedding?.settings || null;
}

export const updateWeddingSettings = async (slug: string, formData: {
  mainGreeting?: string;
  secondaryText?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  backgroundImageUrl?: string;
}) => {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) throw new Error("No autorizado");

  const wedding = await prisma.wedding.findUnique({ where: { slug } });
  if (!wedding) throw new Error("Boda no encontrada");
  
  const sanitize = (val?: string) => (val && val.trim() !== '') ? val.trim() : null;

  const updatedSettings = await prisma.weddingSettings.upsert({
    where: { weddingId: wedding.id },
    update: {
      mainGreeting: sanitize(formData.mainGreeting),
      secondaryText: sanitize(formData.secondaryText),
      primaryCtaLabel: sanitize(formData.primaryCtaLabel),
      secondaryCtaLabel: sanitize(formData.secondaryCtaLabel),
      backgroundImageUrl: sanitize(formData.backgroundImageUrl),
      updatedBy: adminEmail,
    },
    create: {
      weddingId: wedding.id,
      mainGreeting: sanitize(formData.mainGreeting),
      secondaryText: sanitize(formData.secondaryText),
      primaryCtaLabel: sanitize(formData.primaryCtaLabel),
      secondaryCtaLabel: sanitize(formData.secondaryCtaLabel),
      backgroundImageUrl: sanitize(formData.backgroundImageUrl),
      updatedBy: adminEmail,
    }
  });
  return updatedSettings;
}