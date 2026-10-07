import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.development") });
dotenv.config();
import { PrismaClient } from "../src/generated/prisma";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const OLD_SLUG = "shali-jhonatan";
const SLUG = "shali-jonathan";

const SECONDARY_TEXT = `Nuestro amor se ve a través de sus ojos

Gracias por acompañarnos en nuestro sí para siempre.

Cada risa, cada abrazo y cada baile de hoy es parte de nuestra historia. Si tomaste fotos o videos, súbelos aquí y ayúdanos a guardar este día para siempre.

Con amor,
ShaLi & Jonathan`;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter });

  const legacy = await prisma.wedding.findUnique({ where: { slug: OLD_SLUG } });
  if (legacy) {
    await prisma.wedding.update({
      where: { id: legacy.id },
      data: { slug: SLUG },
    });
    console.log(`Renamed slug "${OLD_SLUG}" → "${SLUG}".`);
  }

  const weddingData = {
    names: "ShaLi y Jonathan",
    date: new Date("2026-10-10T00:00:00.000Z"),
  };

  const updated = await prisma.wedding.upsert({
    where: { slug: SLUG },
    update: weddingData,
    create: { slug: SLUG, ...weddingData },
  });

  await prisma.weddingSettings.upsert({
    where: { weddingId: updated.id },
    update: {
      secondaryText: SECONDARY_TEXT,
      mainGreeting: null,
    },
    create: {
      weddingId: updated.id,
      secondaryText: SECONDARY_TEXT,
    },
  });

  console.log(`Updated wedding "${SLUG}": names="${updated.names}", date=2026-10-10, secondaryText set.`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
