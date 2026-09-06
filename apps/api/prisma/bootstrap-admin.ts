import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import {
  AdminBootstrapError,
  assertUserTableEmpty,
  shouldRunAdminBootstrap,
  validateAdminBootstrapEnv,
} from '../src/common/utils/admin-bootstrap';

const prisma = new PrismaClient();

/**
 * One-time first-admin bootstrap for empty databases only.
 * Opt-in via ENABLE_ADMIN_BOOTSTRAP=true and explicit credentials.
 * Never overwrites existing users.
 */
export async function runAdminBootstrap(): Promise<void> {
  if (!shouldRunAdminBootstrap(process.env.ENABLE_ADMIN_BOOTSTRAP)) {
    console.log(
      'Admin bootstrap skipped (ENABLE_ADMIN_BOOTSTRAP is not true).',
    );
    return;
  }

  const credentials = validateAdminBootstrapEnv({
    enableAdminBootstrap: process.env.ENABLE_ADMIN_BOOTSTRAP,
    email: process.env.BOOTSTRAP_ADMIN_EMAIL,
    password: process.env.BOOTSTRAP_ADMIN_PASSWORD,
    fullName: process.env.BOOTSTRAP_ADMIN_NAME,
  });

  const userCount = await prisma.user.count();
  assertUserTableEmpty(userCount);

  const passwordHash = await bcrypt.hash(credentials.password, 12);

  const admin = await prisma.user.create({
    data: {
      email: credentials.email,
      passwordHash,
      fullName: credentials.fullName,
      role: UserRole.ADMIN,
      active: true,
    },
  });

  console.log(`Admin bootstrap completed for ${admin.email}`);
}

async function main(): Promise<void> {
  try {
    await runAdminBootstrap();
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch(async (error: unknown) => {
    if (error instanceof AdminBootstrapError) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    await prisma.$disconnect();
    process.exit(1);
  });
}
