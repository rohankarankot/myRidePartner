import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const appSources = [
  { slug: 'myridepartner', name: 'myRidePartner' },
  { slug: 'interport', name: 'interPort' },
];

async function main() {
  for (const appSource of appSources) {
    await prisma.appSource.upsert({
      where: { slug: appSource.slug },
      create: appSource,
      update: { name: appSource.name, isActive: true },
    });
  }

  console.log(`Seeded ${appSources.length} app sources.`);
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
