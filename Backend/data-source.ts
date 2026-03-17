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
 * Supports:
 * - DATABASE_URL (e.g. from Render "Connect database") – parsed for host, port, user, password, database
 * - Otherwise DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
 */

const root_dir = process.cwd();

function getConnectionFromEnv(): {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
} {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    const url = new URL(databaseUrl);
    const database = url.pathname.replace(/^\//, '') || 'travelsplit';
    const ssl =
      url.searchParams.get('sslmode') === 'require' || databaseUrl.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : undefined;
    return {
      host: url.hostname,
      port: parseInt(url.port || '5432', 10),
      username: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database,
      ...(ssl && { ssl }),
    };
  }
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'travelsplit',
  };
}

const conn = getConnectionFromEnv();

const dataSource = new DataSource({
  type: 'postgres',
  host: conn.host,
  port: conn.port,
  username: conn.username,
  password: conn.password,
  database: conn.database,
  ...(conn.ssl && { ssl: conn.ssl }),
  entities: [path.join(root_dir, 'src', '**', '*.entity{.ts,.js}')],
  migrations: [path.join(root_dir, 'src', 'migrations', '**', '*.{ts,js}')],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  migrationsTableName: 'migrations',
});

export default dataSource;
