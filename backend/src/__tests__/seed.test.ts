import { PrismaClient, type Product } from '@prisma/client';
import { execSync } from 'child_process';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL;
const skipIntegration = !DATABASE_URL || DATABASE_URL.includes('placeholder');

const describeIfDb = skipIntegration ? describe.skip : describe;

describeIfDb('US-000-TASK-04: Seed integration tests', () => {
  const prisma = new PrismaClient();

  beforeAll(async () => {
    // Run seed before tests
    execSync('ts-node prisma/seed.ts', {
      cwd: path.join(__dirname, '../..'),
      env: { ...process.env },
      stdio: 'pipe',
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('seed inserts exactly 12 products', async () => {
    const count = await prisma.product.count();
    expect(count).toBe(12);
  });

  it('seed is idempotent — running twice does not duplicate', async () => {
    execSync('ts-node prisma/seed.ts', {
      cwd: path.join(__dirname, '../..'),
      env: { ...process.env },
      stdio: 'pipe',
    });
    const count = await prisma.product.count();
    expect(count).toBe(12);
  });

  it('seeded products have valid running filter attributes', async () => {
    const products: Product[] = await prisma.product.findMany();
    const hasFilterAttrs = products.some(
      (p) => p.distance.length > 0 && p.surface.length > 0
    );
    expect(hasFilterAttrs).toBe(true);
  });
});
