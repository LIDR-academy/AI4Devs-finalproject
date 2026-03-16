import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envs } from '../config';

const modules = [
    TypeOrmModule.forRoot({
        type: 'postgres',
        host: envs.db.host,
        port: envs.db.port,
        username: envs.db.username,
        password: envs.db.password,
        database: envs.db.name,
        synchronize: true,
        entities: [__dirname + '/**/*.model{.ts,.js}'],
        ssl: envs.db.ssl,
        // Configuración optimizada para PgBouncer con pool_mode = transaction
        extra: {
            // PgBouncer maneja el pooling, reducir el pool del cliente
            max: envs.db.maxPool,
            connectionTimeoutMillis: envs.db.connTimeout,
            idleTimeoutMillis: envs.db.idleTimeout,
            // Configuración especifica para PgBouncer
            statement_timeout: envs.db.statementTimeout,
            query_timeout: envs.db.statementTimeout,
            // Deshabilitar prepared statements para PgBouncer transaction mode
            prepare: false,
            // Configuración de keep-alive
            keepAlive: true,
            keepAliveInitialDelayMillis: 10000,
        },
        // Configuraci'on de logging para debugging
        logging: envs.nodeEnv === 'development' ? ['query', 'error'] : ['error'],
        // Configuración de migraciones
        migrations: [],
        migrationsRun: false,
        // Configuración de cache
        cache: {
            duration: 30000, // 30 segundos
        },
    }),
]

@Module({
    imports: modules,
    exports: modules,
})
export class OrmDatabaseModule { }
