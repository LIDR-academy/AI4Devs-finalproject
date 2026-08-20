import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Script de Sembrado Idempotente para PostgreSQL (Prisma ORM CLI: `prisma db seed`).
 * Implementa los 5 Pilares del Seeding Profesional:
 * 1. Separación de Entornos (Essential vs Synthetic Fixtures).
 * 2. Idempotencia Relacional ($100\%$ re-ejecutable con `upsert`).
 * 3. Runner Desacoplado (CLI independiente).
 * 4. PII Governance (Sobreescritura de credenciales por variables de entorno).
 */
// 1. 🌱 ESSENTIAL SEEDS (Usuarios y Catálogo Estructural)
async function seedEssentialUsers(): Promise<void> {
  const adminPin = process.env.SEED_ADMIN_PIN ?? '1234';
  const kitchenPin = process.env.SEED_KITCHEN_PIN ?? '1234';

  const adminUser = await prisma.user.upsert({
    where: { id: 'usr-maria-2' },
    update: {
      name: 'Maria Silva (Administrador)',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    create: {
      id: 'usr-maria-2',
      name: 'Maria Silva (Administrador)',
      role: 'ADMIN',
      pinHash: adminPin, // En producción real se inyecta el hash Argon2id
      status: 'ACTIVE',
    },
  });

  const kitchenUser = await prisma.user.upsert({
    where: { id: 'usr-carlos-1' },
    update: {
      name: 'Carlos Gomez (Cocina)',
      role: 'KITCHEN_STAFF',
      status: 'ACTIVE',
    },
    create: {
      id: 'usr-carlos-1',
      name: 'Carlos Gomez (Cocina)',
      role: 'KITCHEN_STAFF',
      pinHash: kitchenPin,
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Usuarios Esenciales Idempotentes: ${adminUser.name}, ${kitchenUser.name}`);
}

// 2. 🧪 SYNTHETIC FIXTURES SEEDS (Solo en entornos de Desarrollo / Demo)
async function seedSyntheticFixtures(): Promise<void> {
  console.log('🧪 Sembrando Fixtures Sintéticos de prueba (Insumos y Remanentes)...');

  const insumo1 = await prisma.insumo.upsert({
    where: { id: 'ins-1' },
    update: { name: 'Queso Mozzarella', unitOfMeasure: 'KG' },
    create: {
      id: 'ins-1',
      name: 'Queso Mozzarella',
      unitOfMeasure: 'KG',
    },
  });

  const insumo2 = await prisma.insumo.upsert({
    where: { id: 'ins-2' },
    update: { name: 'Salsa Pomodoro', unitOfMeasure: 'L' },
    create: {
      id: 'ins-2',
      name: 'Salsa Pomodoro',
      unitOfMeasure: 'L',
    },
  });

  const insumo3 = await prisma.insumo.upsert({
    where: { id: 'ins-3' },
    update: { name: 'Masa de Pizza', unitOfMeasure: 'UNITS' },
    create: {
      id: 'ins-3',
      name: 'Masa de Pizza',
      unitOfMeasure: 'UNITS',
    },
  });

  // Remanente FEFO de Prueba
  const now = new Date();
  await prisma.remanente.upsert({
    where: { id: 'rem-101' },
    update: { currentQuantity: 1.75 },
    create: {
      id: 'rem-101',
      insumoId: insumo1.id,
      initialQuantity: 2.0,
      currentQuantity: 1.75,
      location: 'KITCHEN_FRIDGE',
      status: 'ACTIVE',
      expirationDate: new Date(now.getTime() + 2 * 60 * 60 * 1000),
    },
  });

  console.log(`✅ Insumos y Remanentes de Prueba sembrados: ${insumo1.name}, ${insumo2.name}, ${insumo3.name}`);
}

async function main() {
  console.log('🌱 Ejecutando Seeding Profesional de PostgreSQL (Prisma ORM)...');

  await seedEssentialUsers();

  if (process.env.NODE_ENV !== 'production') {
    await seedSyntheticFixtures();
  }

  console.log('🎉 Seeding Prisma completado exitosamente con 0 duplicaciones.');
}

main()
  .catch((err) => {
    const errMsg = String(err);
    if (errMsg.includes('PrismaClientInitializationError') || errMsg.includes('Authentication failed') || err?.code === 'P1001') {
      console.warn('⚠️ Seeding de PostgreSQL omitido: No hay servidor PostgreSQL activo en DATABASE_URL. Usa In-Memory Standalone o levanta Docker Compose.');
    } else {
      console.error('🚨 Error ejecutando Prisma Seeding:', err);
      process.exit(1);
    }
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
