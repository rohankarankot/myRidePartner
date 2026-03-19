import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  
  if (!email) {
    console.error('Please provide an email address');
    process.exit(1);
  }

  const data: any = { role: 'SUPER_ADMIN' };
  if (password) {
    data.password = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: data,
    create: {
      email,
      username: email.split('@')[0],
      ...data,
      confirmed: true,
    },
  });

  console.log(`User ${email} promoted to SUPER_ADMIN ${password ? 'with new password' : ''}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
