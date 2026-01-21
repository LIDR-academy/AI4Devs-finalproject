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
        synchronize: false, // NUNCA true en producción - usar migraciones
        entities: [__dirname + '/../../modules/**/*.model{.ts,.js}'],
        migrations: [__dirname + '/../../database/migrations/*{.ts,.js}'],
        migrationsTableName: 'migrations',
        migrationsRun: false, // Ejecutar migraciones manualmente
        ssl: envs.db.ssl,
        logging: envs.nodeEnv === 'development',
    }),
]

@Module({
    imports: modules,
    exports: modules,
})
export class OrmDatabaseModule { }
