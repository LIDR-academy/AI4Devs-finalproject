import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * Builds TypeORM options from DATABASE_URL when set (e.g. Render "Connect database"),
 * otherwise from DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME.
 */
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
      url.searchParams.get('sslmode') === 'require' ||
      databaseUrl.includes('sslmode=require')
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

/**
 * Configuración de TypeORM para PostgreSQL.
 * Utiliza DATABASE_URL o variables DB_* para la conexión.
 */
export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const conn = getConnectionFromEnv();
  return {
    type: 'postgres',
    host: conn.host,
    port: conn.port,
    username: conn.username,
    password: conn.password,
    database: conn.database,
    ...(conn.ssl && { ssl: conn.ssl }),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
    synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
    logging: configService.get<boolean>('DB_LOGGING', false),
    migrationsRun: false,
    migrationsTableName: 'migrations',
  };
};
