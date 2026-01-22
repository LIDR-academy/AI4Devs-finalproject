import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../models/user.entity';
import { AuditLog } from '../models/audit-log.entity';
import { Doctor } from '../models/doctor.entity';
import { Specialty } from '../models/specialty.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'citaya_user',
  password: process.env.DB_PASSWORD || 'citaya_password_dev',
  database: process.env.DB_NAME || 'citaya_dev',
  synchronize: false, // Nunca true en producción
  logging: process.env.NODE_ENV === 'development',
  entities: [User, AuditLog, Doctor, Specialty],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
  migrationsTableName: 'migrations',
  extra: {
    connectionLimit: 10,
  },
});
