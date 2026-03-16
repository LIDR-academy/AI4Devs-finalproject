const path = require('path');
const dotenv = require('dotenv');

// Determinar el archivo .env correcto
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';

// Corregir la ruta - ahora apuntará a la carpeta backend
const envPath = path.resolve(__dirname, '../', envFile);

console.log('Intentando cargar archivo:', envPath);

// Cargar variables de entorno
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env file:', result.error);
    throw result.error;
}

// Verificar que se cargaron las variables
console.log('Variables cargadas:', {
    NODE_ENV: process.env.NODE_ENV,
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME
});

module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,
    DB_CONFIG: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432
    }
};
