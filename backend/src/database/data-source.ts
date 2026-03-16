import { DataSource } from 'typeorm';
import { join } from 'path';

/**
 * DataSource para el CLI de TypeORM (migration:run, migration:generate).
 * Usa las mismas variables de entorno que database.config.ts.
 * Cargar .env antes de ejecutar: desde backend/ run con variables exportadas
 * o "node -r dotenv/config node_modules/.bin/typeorm migration:run -d dist/database/data-source.js"
 */
const rootPath = join(__dirname, '..');

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || process.env.DATABASE_HOST || 'localhost',
  port: parseInt(
    process.env.POSTGRES_PORT || process.env.DATABASE_PORT || '5432',
    10,
  ),
  username:
    process.env.POSTGRES_USER || process.env.DATABASE_USER || 'sigq_user',
  password:
    process.env.POSTGRES_PASSWORD ||
    process.env.DATABASE_PASSWORD ||
    'sigq_password_change_in_prod',
  database:
    process.env.POSTGRES_DB || process.env.DATABASE_NAME || 'sigq_db',
  migrations: [join(rootPath, 'database', 'migrations', '*.js')],
  // Sin entities necesarias solo para ejecutar migraciones
});
