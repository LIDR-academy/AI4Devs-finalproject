import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'password',
  database: process.env.DB_NAME ?? 'guardianpaws',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
  ssl: {
    rejectUnauthorized: false,  // Evita problemas de certificados
  }
}; 