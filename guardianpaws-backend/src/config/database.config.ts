import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

// Validar variables de entorno requeridas
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME', 'DB_ENVIRONMENT'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
    synchronize: false,
    namingStrategy: new SnakeNamingStrategy(),
    ssl: process.env.DB_ENVIRONMENT === 'aws' ? {
        rejectUnauthorized: false
    } : false,
    extra: process.env.DB_ENVIRONMENT === 'aws' ? {
        ssl: {
            rejectUnauthorized: false
        }
    } : {}
});

export default AppDataSource; 