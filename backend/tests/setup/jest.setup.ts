// Configuración global de Jest
import dotenv from 'dotenv';

// Cargar variables de entorno de testing
dotenv.config({ path: '.env.test' });

// Configurar variables de entorno para tests ANTES de importar cualquier módulo
// Esto asegura que AppDataSource use la configuración correcta
if (!process.env.DB_HOST) {
  process.env.DB_HOST = 'localhost';
}
if (!process.env.DB_PORT) {
  process.env.DB_PORT = '3306';
}
if (!process.env.DB_USER) {
  process.env.DB_USER = 'citaya_user';
}
if (!process.env.DB_PASSWORD) {
  process.env.DB_PASSWORD = 'citaya_password_dev';
}
if (!process.env.DB_NAME) {
  process.env.DB_NAME = 'citaya_test';
}

// Aumentar timeout para tests de base de datos
jest.setTimeout(30000);
