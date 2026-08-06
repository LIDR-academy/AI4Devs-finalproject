import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('3000'),
  DATABASE_URL: z.string().url('DATABASE_URL debe ser una URI valida de PostgreSQL'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET debe contener al menos 8 caracteres'),
});

export type Environment = z.infer<typeof environmentSchema>;

export function getEnvironment(env: Record<string, string | undefined> = process.env): Environment {
  const result = environmentSchema.safeParse(env);
  if (!result.success) {
    const errorFormatted = result.error.format();
    throw new Error(
      `Error de configuracion de entorno Fail-Fast: ${JSON.stringify(errorFormatted, null, 2)}`
    );
  }
  return result.data;
}
