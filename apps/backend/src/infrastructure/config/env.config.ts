import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  JWT_SECRET: z.string().min(1, { message: 'JWT_SECRET debe estar configurada en el entorno.' }).default('restostock-super-secret-jwt-key-2026'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/restostock?schema=public'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Error crítico de configuración en variables de entorno:', _env.error.format());
  throw new Error('Configuración de entorno inválida.');
}

export const env = _env.data;
