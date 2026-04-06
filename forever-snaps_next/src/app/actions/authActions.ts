'use server'

import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { PrismaClient } from "../../generated/prisma";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

export const loginAdmin = async (email: string, password: string) => {
  if (email !== process.env.ADMIN_EMAIL) {
    return { error: "Credenciales inválidas" };
  }

  const isValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH!);
  if (!isValid) {
    return { error: "Credenciales inválidas" };
  }

  const token = await new SignJWT({ email, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secretKey);

  const cookieStore = await cookies();
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 2,
    path: '/',
  });

  await prisma.adminAuditLog.create({
    data: { action: "LOGIN", email }
  });

  const wedding = await prisma.wedding.findFirst();
  const targetSlug = wedding?.slug || "sharon_wedding";

  return { success: true, slug: targetSlug };
}

export const logoutAdmin = async () => {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  await prisma.adminAuditLog.create({
    data: { action: "LOGOUT", email: process.env.ADMIN_EMAIL! }
  });
}
