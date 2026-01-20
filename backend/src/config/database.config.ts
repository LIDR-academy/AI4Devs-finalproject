import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => {
    // En tiempo de ejecución, __dirname apunta a dist/config/
    // Las entidades compiladas están en dist/modules/**/*.entity.js
    // Usar join para construir rutas correctamente en cualquier OS
    const rootPath = join(__dirname, '..');
    
    return {
      type: 'postgres',
      host: process.env.POSTGRES_HOST || process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || process.env.DATABASE_PORT || '5432', 10),
      username: process.env.POSTGRES_USER || process.env.DATABASE_USER || 'sigq_user',
      password: process.env.POSTGRES_PASSWORD || process.env.DATABASE_PASSWORD || 'sigq_password_change_in_prod',
      database: process.env.POSTGRES_DB || process.env.DATABASE_NAME || 'sigq_db',
      // Buscar entidades en dist/modules/**/*.entity.js (o src/modules/**/*.entity.ts en desarrollo)
      entities: [join(rootPath, 'modules', '**', '*.entity{.ts,.js}')],
      // Synchronize: crear tablas automáticamente en desarrollo
      // Si NODE_ENV no está definido, asumimos desarrollo
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
      migrations: [join(rootPath, 'database', 'migrations', '*.{.ts,.js}')],
      migrationsRun: false,
    };
  },
);
