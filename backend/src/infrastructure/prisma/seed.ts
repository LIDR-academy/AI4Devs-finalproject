/**
 * Seed default data: portal health initial state.
 * Run: npm run db:seed
 *
 * The CHECKLIST_TEMPLATE now lives in domain/services/ChecklistTemplate.ts
 * (per FR-024 it is pure data, not infrastructure).
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INITIAL_PORTALS = [
  'idealista.com',
  'fotocasa.es',
  'habitaclia.com',
  'pisos.com',
  'milanuncios.com',
];

async function main(): Promise<void> {
  console.log('Seeding default data...');

  for (const domain of INITIAL_PORTALS) {
    await prisma.portalHealthCheck.upsert({
      where: { domain },
      update: {},
      create: { domain, status: 'UNKNOWN' },
    });
  }
  console.log(`  ✓ ${INITIAL_PORTALS.length} portal health entries`);

  console.log('Done. Checklist items are created per-process at runtime (FR-024).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
