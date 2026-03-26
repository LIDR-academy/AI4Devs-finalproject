import { registerAs } from '@nestjs/config';

/**
 * Configuración de JWT.
 */
export default registerAs('jwt', () => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.trim() === '') {
    throw new Error(
      'JWT_SECRET no está configurado. Por favor, configure la variable de entorno JWT_SECRET antes de iniciar la aplicación.',
    );
  }

  return {
    secret,
    expiresIn: process.env.JWT_EXPIRES_IN || '3600', // Default: 1 hora en segundos
  };
});
