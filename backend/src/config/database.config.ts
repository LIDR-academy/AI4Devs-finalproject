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
      // Synchronize: DESACTIVADO por defecto para evitar pérdida de datos
      // ⚠️ ADVERTENCIA: synchronize: true puede borrar datos al recrear tablas
      // Solo activar explícitamente con DB_SYNCHRONIZE=true para setup inicial
      // En producción, SIEMPRE usar migraciones (migrationsRun: true)
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      logging: process.env.NODE_ENV !== 'production',
      migrations: [join(rootPath, 'database', 'migrations', '*.{.ts,.js}')],
      // Ejecutar migraciones automáticamente al iniciar (recomendado para producción)
      migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true',
    };
  },
);
