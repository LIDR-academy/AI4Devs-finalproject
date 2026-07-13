import { createPostgresPool, migratePostgres } from './postgres.js';
import { config } from '../config.js';

if (config.databaseUrl) {
  const pool = createPostgresPool();
  await migratePostgres(pool);
  await pool.end();
} else {
  const { createDatabase } = await import('./database.js');
  const db = createDatabase();
  db.close();
}

console.log(`${config.databaseUrl ? 'PostgreSQL' : 'SQLite'} schema ready`);
