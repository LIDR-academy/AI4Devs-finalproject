import { registerAs } from '@nestjs/config';

/**
 * Configuración general de la aplicación.
 */
export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  environment: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api',
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:5174',
      ],
}));
