import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.development") });
dotenv.config();
import { PrismaClient } from "../src/generated/prisma";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { getPgConnectionString } from "../src/lib/pgConnectionString";

const LEGACY_SLUGS = ["shali-jhonatan", "shali-jonathan"];
const SLUG = "sharon_wedding";

const SECONDARY_TEXT = `Nuestro amor se ve a través de sus ojos

Gracias por acompañarnos en nuestro sí para siempre.

Cada risa, cada abrazo y cada baile de hoy es parte de nuestra historia.

Si tomaste fotos, súbelas aquí y ayúdanos a guardar este día para siempre.

Con amor ❤️,
ShaLi & Jonathan`;

async function main() {
  let connectionString: string;
  try {
    connectionString = getPgConnectionString();
  } catch {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter });

  const existing = await prisma.wedding.findUnique({ where: { slug: SLUG } });
  const legacy = await prisma.wedding.findFirst({
    where: { slug: { in: LEGACY_SLUGS } },
  });

  if (legacy && existing && legacy.id !== existing.id) {
    await prisma.photo.updateMany({
      where: { weddingId: legacy.id },
      data: { weddingId: existing.id },
    });
    await prisma.weddingSettings.deleteMany({ where: { weddingId: legacy.id } });
    await prisma.wedding.delete({ where: { id: legacy.id } });
    console.log(`Merged "${legacy.slug}" into "${SLUG}" (photos moved, legacy removed).`);
  } else if (legacy && !existing) {
    await prisma.wedding.update({
      where: { id: legacy.id },
      data: { slug: SLUG },
    });
    console.log(`Renamed slug "${legacy.slug}" → "${SLUG}".`);
  }

  const weddingData = {
    names: "ShaLi & Jonathan",
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
