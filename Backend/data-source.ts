import { DataSource } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno (prioridad: .env.local luego .env)
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

/**
 * DataSource configuration for TypeORM CLI.
 * This file is used by TypeORM CLI commands (migration:run, migration:revert, etc.)
 * and must be separate from NestJS's configuration.
 *
 * Usage:
 *   npm run migration:run
 *   npm run migration:revert
 *   npm run migration:show
 *
 * Note: Environment variables should be loaded from .env or .env.local files.
 */

// Use process.cwd() which works with ts-node
const root_dir = process.cwd();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'travelsplit',
  entities: [path.join(root_dir, 'src', '**', '*.entity{.ts,.js}')],
  migrations: [path.join(root_dir, 'src', 'migrations', '**', '*.{ts,js}')],
  synchronize: false, // Never use synchronize with migrations
  logging: process.env.DB_LOGGING === 'true',
  migrationsTableName: 'migrations',
});

export default dataSource;
