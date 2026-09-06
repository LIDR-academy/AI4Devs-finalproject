import { PrismaClient, UserRole } from '@prisma/client';
import 'dotenv/config';
import {
  UnsafeDestructiveOperationError,
  formatTargetSummary,
  getSanitizedDbTarget,
  validateDestructiveExecution,
} from '../src/common/utils/destructive-db-ops';

const prisma = new PrismaClient();
const ADMIN_EMAIL = 'admin@taller.com';

async function main(): Promise<void> {
  validateDestructiveExecution({
    nodeEnv: process.env.NODE_ENV,
    allowDestructiveDbOps: process.env.ALLOW_DESTRUCTIVE_DB_OPS,
    argv: process.argv,
  });

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new UnsafeDestructiveOperationError('DATABASE_URL is required');
  }

  const target = getSanitizedDbTarget(databaseUrl);
  console.log(formatTargetSummary(target, process.env.NODE_ENV));
  console.log(
    'Proceeding with destructive cleanup (admin password will NOT be reset).',
  );

  const result = await prisma.$transaction(async (tx) => {
    const tasks = await tx.workOrderTask.deleteMany();
    const workOrders = await tx.workOrder.deleteMany();
    const ownerships = await tx.vehicleOwnership.deleteMany();
    await tx.vehicle.updateMany({
      data: { excludedById: null, excludedAt: null },
    });
    const vehicles = await tx.vehicle.deleteMany();
    const clients = await tx.client.deleteMany();
    const users = await tx.user.deleteMany({
      where: { email: { not: ADMIN_EMAIL } },
    });

    const existingAdmin = await tx.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (!existingAdmin) {
      return {
        tasks,
        workOrders,
        ownerships,
        vehicles,
        clients,
        users,
        adminEmail: null as string | null,
        adminPreserved: false,
      };
    }

    const admin = await tx.user.update({
      where: { email: ADMIN_EMAIL },
      data: {
        active: true,
        role: UserRole.ADMIN,
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
      },
    });

    return {
      tasks,
      workOrders,
      ownerships,
      vehicles,
      clients,
      users,
      adminEmail: admin.email,
      adminPreserved: true,
    };
  });

  if (!result.adminPreserved) {
    console.warn(
      `Warning: no admin user (${ADMIN_EMAIL}) remained after cleanup. Password was not created or reset.`,
    );
  } else {
    console.log('Database cleaned. Remaining admin:', result.adminEmail);
    console.log('Admin password hash was preserved (not reset).');
  }

  console.log('Deleted counts:', {
    tasks: result.tasks.count,
    workOrders: result.workOrders.count,
    ownerships: result.ownerships.count,
    vehicles: result.vehicles.count,
    clients: result.clients.count,
    users: result.users.count,
  });
}

main()
  .catch((error: unknown) => {
    if (error instanceof UnsafeDestructiveOperationError) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
