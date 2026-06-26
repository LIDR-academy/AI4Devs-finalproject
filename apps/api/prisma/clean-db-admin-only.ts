import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main(): Promise<void> {
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
      where: { email: { not: 'admin@taller.com' } },
    });

    const passwordHash = await bcrypt.hash('AdminPass123', 12);
    const admin = await tx.user.upsert({
      where: { email: 'admin@taller.com' },
      update: {
        active: true,
        passwordHash,
        fullName: 'Workshop Admin',
        role: UserRole.ADMIN,
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
      },
      create: {
        email: 'admin@taller.com',
        passwordHash,
        fullName: 'Workshop Admin',
        role: UserRole.ADMIN,
        active: true,
      },
    });

    return { tasks, workOrders, ownerships, vehicles, clients, users, adminEmail: admin.email };
  });

  console.log('Database cleaned. Remaining admin:', result.adminEmail);
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
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
