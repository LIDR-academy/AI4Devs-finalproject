import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'mysql',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'citaya_user',
  password: process.env.DB_PASSWORD || 'citaya_password_dev',
  database: process.env.DB_NAME || 'citaya_dev',
  synchronize: false,
  logging: false,
  entities: ['src/models/**/*.ts'],
  migrations: ['migrations/**/*.ts'],
  extra: {
    connectionLimit: 5,
  },
});
