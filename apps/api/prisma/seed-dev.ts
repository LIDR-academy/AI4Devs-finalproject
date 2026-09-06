import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import {
  AdminBootstrapError,
  DevSeedError,
  assertNotProductionSeed,
} from '../src/common/utils/admin-bootstrap';

const prisma = new PrismaClient();

/**
 * Development/test sample data only.
 * Must be invoked explicitly (npm run db:seed:dev / prisma db seed).
 * Never called from production container startup.
 *
 * Existing users keep their passwordHash (demo passwords apply on create only).
 */
export async function runDevSeed(): Promise<void> {
  assertNotProductionSeed(process.env.NODE_ENV);

  const passwordHash = await bcrypt.hash('AdminPass123', 12);
  const mechanicPasswordHash = await bcrypt.hash('MechanicPass123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@taller.com' },
    update: {
      active: true,
    },
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
    update: {
      active: true,
    },
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

  await prisma.client.upsert({
    where: { nationalId: '1-2345-6789' },
    update: {},
    create: {
      fullName: 'Juan Pérez',
      nationalId: '1-2345-6789',
      phone: '88887777',
      email: 'juan@email.com',
    },
  });

  await prisma.client.upsert({
    where: { nationalId: '2-3456-7890' },
    update: {},
    create: {
      fullName: 'María López',
      nationalId: '2-3456-7890',
      phone: '77776666',
    },
  });

  await prisma.client.upsert({
    where: { nationalId: '3-4567-8901' },
    update: {},
    create: {
      fullName: 'Carlos Ruiz',
      nationalId: '3-4567-8901',
      email: 'carlos@email.com',
    },
  });

  const juanClient = await prisma.client.findUnique({
    where: { nationalId: '1-2345-6789' },
  });
  const mariaClient = await prisma.client.findUnique({
    where: { nationalId: '2-3456-7890' },
  });

  if (juanClient) {
    const juanVehicle = await prisma.vehicle.upsert({
      where: { licensePlate: 'ABC123' },
      update: {},
      create: {
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2018,
        color: 'Blanco',
      },
    });

    const existingJuanOwnership = await prisma.vehicleOwnership.findFirst({
      where: {
        vehicleId: juanVehicle.id,
        clientId: juanClient.id,
        validTo: null,
      },
    });

    if (!existingJuanOwnership) {
      await prisma.vehicleOwnership.create({
        data: {
          vehicleId: juanVehicle.id,
          clientId: juanClient.id,
          validTo: null,
        },
      });
    }
  }

  if (mariaClient) {
    const mariaVehicle = await prisma.vehicle.upsert({
      where: { licensePlate: 'XYZ789' },
      update: {},
      create: {
        licensePlate: 'XYZ789',
        brand: 'Honda',
        model: 'Civic',
        year: 2020,
        color: 'Gris',
      },
    });

    const existingMariaOwnership = await prisma.vehicleOwnership.findFirst({
      where: {
        vehicleId: mariaVehicle.id,
        clientId: mariaClient.id,
        validTo: null,
      },
    });

    if (!existingMariaOwnership) {
      await prisma.vehicleOwnership.create({
        data: {
          vehicleId: mariaVehicle.id,
          clientId: mariaClient.id,
          validTo: null,
        },
      });
    }
  }

  console.log('Development seed completed (existing user passwords preserved).');
  await prisma.$disconnect();
}

async function main(): Promise<void> {
  await runDevSeed();
}

if (require.main === module) {
  main().catch(async (error: unknown) => {
    if (error instanceof AdminBootstrapError || error instanceof DevSeedError) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    await prisma.$disconnect();
    process.exit(1);
  });
}
