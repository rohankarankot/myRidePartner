import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const slugArg = process.argv[2];
const nameArg = process.argv[3];

if (!slugArg) {
  console.error('Usage: node scripts/register-app-source.mjs <slug> [displayName]');
  process.exit(1);
}

const slug = slugArg.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '-');
const name =
  nameArg?.trim() ||
  slug
    .split(/[-_.]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const appSource = await prisma.appSource.upsert({
    where: { slug },
    create: {
      slug,
      name,
    },
    update: {
      name,
      isActive: true,
    },
  });

  console.log(JSON.stringify(appSource, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
