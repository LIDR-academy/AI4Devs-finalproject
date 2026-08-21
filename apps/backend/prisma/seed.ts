import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Script de Sembrado Idempotente para PostgreSQL (Prisma ORM CLI: `prisma db seed`).
 * Implementa los 5 Pilares del Seeding Profesional:
 * 1. Separación de Entornos (Essential vs Synthetic Fixtures).
 * 2. Idempotencia Relacional (100% re-ejecutable con `upsert`).
 * 3. Runner Desacoplado (CLI independiente).
 * 4. PII Governance (Sobreescritura de credenciales por variables de entorno).
 *
 * Sin importaciones cruzadas hacia src/ (ni Pin.ts) a proposito: este script se compila
 * de forma standalone en el Dockerfile (ver builder stage) para poder ejecutarse en
 * produccion sin necesitar `tsx`/esbuild en la imagen final (TK-044 los elimino de
 * produccion por CVEs). hashPin() replica exactamente el algoritmo de Pin.createFromRaw
 * (mismo formato salt:hash, mismos parametros scrypt) para que el login funcione despues.
 */
function hashPin(rawPin: string): string {
  if (!/^\d{4,6}$/.test(rawPin)) {
    throw new Error(`PIN invalido: debe ser numerico de 4 a 6 digitos (recibido: "${rawPin}").`);
  }
  const saltHex = crypto.randomBytes(16).toString('hex');
  const hashHex = crypto.scryptSync(rawPin, Buffer.from(saltHex, 'hex'), 32).toString('hex');
  return `${saltHex}:${hashHex}`;
}

// 1a. Bootstrap del primer administrador en PRODUCCION — TK-051. Antes de este fix no
// existia ningun camino para crear el primer usuario: POST /api/v1/auth/users exige ya
// ser ADMIN, y una base de datos nueva no tiene ninguno. Solo UN admin generico
// configurable por entorno — nunca los nombres de demo (esos son solo para dev/QA).
async function seedProductionAdmin(): Promise<void> {
  const adminPin = process.env.SEED_ADMIN_PIN;
  if (!adminPin) {
    console.warn(
      '⚠️  SEED_ADMIN_PIN no configurado — se omite el bootstrap del administrador inicial. ' +
        'Sin el, POST /api/v1/auth/users no tiene forma de arrancar (exige ya ser ADMIN).'
    );
    return;
  }

  const adminName = process.env.SEED_ADMIN_NAME ?? 'Administrador';
  const admin = await prisma.user.upsert({
    where: { id: 'bootstrap-admin' },
    update: {},
    create: {
      id: 'bootstrap-admin',
      name: adminName,
      role: 'ADMIN',
      pinHash: hashPin(adminPin),
      status: 'ACTIVE',
    },
  });
  console.log(`✅ Administrador inicial idempotente: ${admin.name} (${admin.id})`);
}

// 1b. 🌱 ESSENTIAL SEEDS de desarrollo/QA (usuarios sinteticos fijos para pruebas manuales)
async function seedDevelopmentUsers(): Promise<void> {
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
      pinHash: hashPin(adminPin),
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
      pinHash: hashPin(kitchenPin),
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

  if (process.env.NODE_ENV === 'production') {
    await seedProductionAdmin();
  } else {
    await seedDevelopmentUsers();
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
