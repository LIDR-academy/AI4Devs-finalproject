import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Tables to truncate in FK-safe order (dependents first).
 * Does not truncate migrations or expense_categories (seed data).
 */
const TABLES_TO_TRUNCATE = [
  'expense_splits',
  'expenses',
  'trip_participants',
  'trips',
  'users',
];

/**
 * Truncates test tables in order so FK constraints are satisfied.
 * Use in afterEach/afterAll to reset state. Requires test database.
 *
 * @param app - Nest application (must have TypeORM DataSource)
 */
export async function truncateTestTables(app: INestApplication): Promise<void> {
  const dataSource = app.get(DataSource);
  const qr = dataSource.createQueryRunner();
  await qr.connect();
  try {
    await qr.query(
      `TRUNCATE TABLE ${TABLES_TO_TRUNCATE.join(', ')} RESTART IDENTITY CASCADE`,
    );
  } finally {
    await qr.release();
  }
}
