import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
config();

/**
 * Configuración de DataSource para TypeORM CLI
 * Usado por los scripts de migración
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.dbHost || 'localhost',
  port: parseInt(process.env.dbPort || '5432'),
  username: process.env.dbUser || 'postgres',
  password: process.env.dbPassword || 'postgres',
  database: process.env.dbName || 'finantix_auth',
  ssl: process.env.dbSsl === 'true',
  synchronize: false, // NUNCA true en producción
  logging: process.env.nodeEnv === 'development',
  // No cargar entidades durante migraciones - solo las migraciones
  entities: [],
  migrations: [path.join(__dirname, '../../database/migrations/*{.ts,.js}')],
  migrationsTransactionMode: 'each',
  migrationsTableName: 'migrations',
  migrationsRun: false,
});

