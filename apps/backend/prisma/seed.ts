import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function hashPin(rawPin: string): string {
  if (!/^\d{4,6}$/.test(rawPin)) {
    throw new Error(`PIN invalido: debe ser numerico de 4 a 6 digitos (recibido: "${rawPin}").`);
  }
  const saltHex = crypto.randomBytes(16).toString('hex');
  const hashHex = crypto.scryptSync(rawPin, Buffer.from(saltHex, 'hex'), 32).toString('hex');
  return `${saltHex}:${hashHex}`;
}

const DEFAULT_SYSTEM_PERMISSIONS = [
  { id: 'perm-1', code: 'stock:extract', name: 'Extraer Insumos de Bodega', module: 'STOCK' },
  { id: 'perm-2', code: 'stock:restock', name: 'Reabastecer Bodega', module: 'STOCK' },
  { id: 'perm-3', code: 'stock:read', name: 'Consultar Stock e Historial', module: 'STOCK' },
  { id: 'perm-4', code: 'kitchen:recipe_prepare', name: 'Preparar Recetas FEFO', module: 'KITCHEN' },
  { id: 'perm-5', code: 'kitchen:remanente_consume', name: 'Consumir/Descartar Remanentes', module: 'KITCHEN' },
  { id: 'perm-6', code: 'reports:view', name: 'Ver Reportes y Dashboard', module: 'REPORTS' },
  { id: 'perm-7', code: 'users:manage', name: 'Gestionar Personal', module: 'USERS' },
  { id: 'perm-8', code: 'roles:manage', name: 'Gestionar Roles y Permisos', module: 'ROLES' },
];

async function seedDefaultRoles(): Promise<{ adminRoleId: string; kitchenRoleId: string }> {
  // 1. Sembrar Permisos del Sistema
  for (const perm of DEFAULT_SYSTEM_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { id: perm.id },
      update: { code: perm.code, name: perm.name, module: perm.module },
      create: perm,
    });
  }

  // 2. Sembrar Roles Base
  const adminRole = await prisma.role.upsert({
    where: { id: 'role-admin' },
    update: { name: 'ADMIN' },
    create: {
      id: 'role-admin',
      name: 'ADMIN',
      description: 'Administrador General',
    },
  });

  const kitchenRole = await prisma.role.upsert({
    where: { id: 'role-kitchen' },
    update: { name: 'KITCHEN_STAFF' },
    create: {
      id: 'role-kitchen',
      name: 'KITCHEN_STAFF',
      description: 'Personal de Cocina',
    },
  });

  // 3. Vincular Permisos a Roles
  for (const perm of DEFAULT_SYSTEM_PERMISSIONS) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  const kitchenPermIds = ['perm-1', 'perm-2', 'perm-3', 'perm-4', 'perm-5'];
  for (const permId of kitchenPermIds) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: kitchenRole.id, permissionId: permId } },
      update: {},
      create: { roleId: kitchenRole.id, permissionId: permId },
    });
  }

  return { adminRoleId: adminRole.id, kitchenRoleId: kitchenRole.id };
}


// TK-092 (AUDIT-SEC-001 F-1): antes del fix, un usuario creado por la API se persistía
// con roleId = NULL y el mapper lo resolvía a 'ADMIN' (escalada de privilegios). Este
// paso idempotente reconcilia cualquier usuario huérfano preexistente asignándole el
// rol de MENOR privilegio (KITCHEN_STAFF); un administrador puede promoverlo después.
async function reconcileOrphanUserRoles(kitchenRoleId: string): Promise<void> {
  const { count } = await prisma.user.updateMany({
    where: { roleId: null },
    data: { roleId: kitchenRoleId },
  });
  if (count > 0) {
    console.log(
      `🔐 Reconciliados ${count} usuario(s) sin rol → KITCHEN_STAFF (TK-092 / AUDIT-SEC-001 F-1).`
    );
  }
}

async function seedProductionAdmin(adminRoleId: string): Promise<void> {
  const adminPin = process.env.SEED_ADMIN_PIN;
  if (!adminPin) {
    console.warn(
      '⚠️  SEED_ADMIN_PIN no configurado — se omite el bootstrap del administrador inicial.'
    );
    return;
  }

  const adminName = process.env.SEED_ADMIN_NAME ?? 'Administrador';
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@restostock.com';
  const admin = await prisma.user.upsert({
    where: { id: 'bootstrap-admin' },
    update: { roleId: adminRoleId, email: adminEmail },
    create: {
      id: 'bootstrap-admin',
      name: adminName,
      roleId: adminRoleId,
      pinHash: hashPin(adminPin),
      email: adminEmail,
      status: 'ACTIVE',
    },
  });
  console.log(`✅ Administrador inicial idempotente: ${admin.name} (${admin.id})`);
}

async function seedDevelopmentUsers(roles: { adminRoleId: string; kitchenRoleId: string }): Promise<void> {
  const adminPin = process.env.SEED_ADMIN_PIN ?? '1234';
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@restostock.com';
  const kitchenPin = process.env.SEED_KITCHEN_PIN ?? '1234';

  const adminUser = await prisma.user.upsert({
    where: { id: 'usr-maria-2' },
    update: {
      name: 'Maria Silva (Administrador)',
      roleId: roles.adminRoleId,
      email: adminEmail,
      status: 'ACTIVE',
    },
    create: {
      id: 'usr-maria-2',
      name: 'Maria Silva (Administrador)',
      roleId: roles.adminRoleId,
      pinHash: hashPin(adminPin),
      email: adminEmail,
      status: 'ACTIVE',
    },
  });

  const kitchenUser = await prisma.user.upsert({
    where: { id: 'usr-carlos-1' },
    update: {
      name: 'Carlos Gomez (Cocina)',
      roleId: roles.kitchenRoleId,
      status: 'ACTIVE',
    },
    create: {
      id: 'usr-carlos-1',
      name: 'Carlos Gomez (Cocina)',
      roleId: roles.kitchenRoleId,
      pinHash: hashPin(kitchenPin),
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Usuarios Esenciales Idempotentes: ${adminUser.name}, ${kitchenUser.name}`);
}

// US-016 / US-025: sectores físicos de almacenamiento. Idempotente por `name` (UNIQUE).
const STORAGE_LOCATIONS = [
  { id: 'loc-seed-unclassified', name: 'Bodega Principal – Sin clasificar', type: 'WAREHOUSE' as const, description: 'Sector por defecto para existencias sin sub-sector asignado' },
  { id: 'loc-seed-dry', name: 'Bodega de Secos', type: 'WAREHOUSE' as const, description: 'Estantería de secos y no perecederos' },
  { id: 'loc-seed-meat-fridge', name: 'Heladera de Carnes', type: 'WAREHOUSE' as const, description: 'Refrigerador dedicado a proteínas' },
  { id: 'loc-seed-freezer', name: 'Cámara de Congelados', type: 'WAREHOUSE' as const, description: 'Cámara de congelación' },
  { id: 'loc-seed-kitchen-fridge', name: 'Refrigerador Principal Cocina', type: 'KITCHEN' as const, description: 'Destino de remanentes en línea de fríos' },
];

async function seedStorageLocations(): Promise<void> {
  for (const loc of STORAGE_LOCATIONS) {
    await prisma.storageLocation.upsert({
      where: { name: loc.name },
      update: { type: loc.type, description: loc.description },
      create: { id: loc.id, name: loc.name, type: loc.type, description: loc.description, isActive: true },
    });
  }
  console.log(`✅ Sectores físicos de almacenamiento sembrados: ${STORAGE_LOCATIONS.length}`);
}

async function seedWarehouseStock(insumoId: string, storageLocationId: string, quantity: number): Promise<void> {
  await prisma.warehouseStock.upsert({
    where: { insumoId_storageLocationId: { insumoId, storageLocationId } },
    update: { quantity },
    create: { insumoId, storageLocationId, quantity },
  });
}

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

  // US-025: existencias iniciales por sub-sector de bodega
  await seedWarehouseStock(insumo1.id, 'loc-seed-meat-fridge', 8.0);
  await seedWarehouseStock(insumo2.id, 'loc-seed-dry', 12.0);
  await seedWarehouseStock(insumo3.id, 'loc-seed-freezer', 20.0);

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

  const roles = await seedDefaultRoles();
  await reconcileOrphanUserRoles(roles.kitchenRoleId);
  await seedStorageLocations();

  if (process.env.NODE_ENV === 'production') {
    await seedProductionAdmin(roles.adminRoleId);
  } else {
    await seedDevelopmentUsers(roles);
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
