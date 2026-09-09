import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env file into process.env if present
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/backend/.env') });

// `docker-compose` con `${VAR:-}` (y un `.env` con la clave presente pero vacía) inyecta la
// variable como cadena vacía, no como ausente. Sin esto, `"".url()` / `"".min(16)` fallan la
// validación de formato antes de que `.optional()` tenga oportunidad de aplicar → arranque abortado
// aunque la variable sea legítimamente opcional. Normaliza "" a `undefined`.
const optionalEnv = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional());

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('3000'),
  DATABASE_URL: z.string().url('DATABASE_URL debe ser una URI valida de PostgreSQL'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET debe contener al menos 16 caracteres para alta entropia.'),
  CORS_ALLOWED_ORIGINS: z.string().default('*'),
  // Clave dedicada para el cifrado AES-256-GCM de credenciales de terceros (API keys de IA).
  // Separada de JWT_SECRET a propósito (AUDIT-SEC-004): rotar el JWT no debe volver ilegibles
  // las credenciales cifradas, y una fuga de una no compromete la otra.
  ENCRYPTION_KEY: optionalEnv(z.string().min(16, 'ENCRYPTION_KEY debe tener al menos 16 caracteres.')),
  // Origen (esquema+host) del frontend, usado para construir el enlace del email de
  // recuperación de PIN. En producción NO se confía en el header `Origin` de la petición.
  CLIENT_ORIGIN: optionalEnv(z.string().url('CLIENT_ORIGIN debe ser una URL válida.')),
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

    if (!result.data.ENCRYPTION_KEY) {
      throw new Error(
        'CONFIG FATAL (Guard 14 / AUDIT-SEC-004): En produccion ENCRYPTION_KEY es obligatorio — sin el, el cifrado de credenciales cae a un valor no seguro.'
      );
    }

    if (result.data.ENCRYPTION_KEY === result.data.JWT_SECRET) {
      throw new Error(
        'CONFIG FATAL (Guard 14 / AUDIT-SEC-004): ENCRYPTION_KEY no puede ser igual a JWT_SECRET — deben ser secretos independientes.'
      );
    }
    // Nota: no hace falta un fail-fast dedicado para CLIENT_ORIGIN — el check de
    // CORS_ALLOWED_ORIGINS != "*" de arriba ya garantiza un allowlist concreto en producción, y
    // `RequestAdminPinResetUseCase.resolveResetOrigin` sólo usa un `Origin` de la petición si
    // está en ese allowlist (si no, cae al primer origen concreto). CLIENT_ORIGIN es opcional
    // y sólo fija el origen canónico cuando se quiere forzar uno distinto del primero del CORS.
  }

  return result.data;
}
