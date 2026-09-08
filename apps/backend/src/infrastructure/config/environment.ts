import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env file into process.env if present
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/backend/.env') });

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('3000'),
  DATABASE_URL: z.string().url('DATABASE_URL debe ser una URI valida de PostgreSQL'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET debe contener al menos 16 caracteres para alta entropia.'),
  CORS_ALLOWED_ORIGINS: z.string().default('*'),
  RATE_LIMIT_WINDOW_MS: z.string().transform((val) => parseInt(val, 10)).default('900000'), // 15 minutos
  RATE_LIMIT_MAX_REQUESTS: z.string().transform((val) => parseInt(val, 10)).default('300'), // global /api/v1/*, por cliente real (AUDIT-SEC-003)
  LOGIN_RATE_LIMIT_WINDOW_MS: z.string().transform((val) => parseInt(val, 10)).default('900000'),
  LOGIN_RATE_LIMIT_MAX: z.string().transform((val) => parseInt(val, 10)).default('10'), // anti-fuerza-bruta login/forgot/reset PIN (Guard 16)
});

export type Environment = z.infer<typeof environmentSchema>;

export function getEnvironment(env: Record<string, string | undefined> = process.env): Environment {
  const result = environmentSchema.safeParse(env);
  if (!result.success) {
    const errorFormatted = result.error.format();
    throw new Error(
      `Error de configuracion de entorno Fail-Fast (Guard 14): ${JSON.stringify(errorFormatted, null, 2)}`
    );
  }

  if (result.data.NODE_ENV === 'production') {
    if (result.data.JWT_SECRET.length < 32) {
      throw new Error(
        'CONFIG FATAL (Guard 14): En entorno de produccion, JWT_SECRET debe tener una entropia minima de 32 caracteres.'
      );
    }

    if (result.data.CORS_ALLOWED_ORIGINS === '*') {
      throw new Error(
        'CONFIG FATAL (Guard 14): En entorno de produccion, CORS_ALLOWED_ORIGINS no puede ser un comodin "*". Especifique los dominios permitidos.'
      );
    }

    if (result.data.JWT_SECRET.includes('dev') || result.data.JWT_SECRET.includes('default')) {
      throw new Error(
        'CONFIG FATAL (Guard 14): En entorno de produccion, JWT_SECRET no puede usar valores por defecto de desarrollo.'
      );
    }
  }

  return result.data;
}
