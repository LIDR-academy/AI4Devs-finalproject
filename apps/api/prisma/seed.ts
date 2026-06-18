import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('AdminPass123', 12);
  const mechanicPasswordHash = await bcrypt.hash('MechanicPass123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@taller.com' },
    update: {},
    create: {
      email: 'admin@taller.com',
      passwordHash,
      fullName: 'Workshop Admin',
      role: UserRole.ADMIN,
      active: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'mechanic@taller.com' },
    update: {},
    create: {
      email: 'mechanic@taller.com',
      passwordHash: mechanicPasswordHash,
      fullName: 'Workshop Mechanic',
      role: UserRole.MECHANIC,
      active: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'inactive@taller.com' },
    update: {},
    create: {
      email: 'inactive@taller.com',
      passwordHash: await bcrypt.hash('InactivePass123', 12),
      fullName: 'Inactive User',
      role: UserRole.MECHANIC,
      active: false,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
