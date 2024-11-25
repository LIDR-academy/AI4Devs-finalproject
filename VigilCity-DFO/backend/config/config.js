const path = require('path');

// Determinar qué archivo .env cargar
const envPath = process.env.NODE_ENV === 'production'
  ? path.resolve(__dirname, '../.env.production')
  : path.resolve(__dirname, '../.env.development');

// Cargar el archivo .env correspondiente
require('dotenv').config({ path: envPath });

// Para debugging - eliminar en producción
console.log('Current ENV:', process.env.NODE_ENV);
console.log('DB_NAME:', process.env.DB_NAME);

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres'
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres'
  }
};
