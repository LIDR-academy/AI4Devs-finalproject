import { createPostgresPool, migratePostgres } from './postgres.js';
import { seedPostgres } from './postgresSeed.js';
import { config } from '../config.js';

if (config.databaseUrl) {
  const pool = createPostgresPool();
  await migratePostgres(pool);
  await seedPostgres(pool);
  await pool.end();
} else {
  const { createDatabase } = await import('./database.js');
  const { seedDemoData } = await import('./seedData.js');
  const db = createDatabase();
  seedDemoData(db);
  db.close();
}

console.log(`${config.databaseUrl ? 'PostgreSQL' : 'SQLite'} demo data ready`);
