/// <reference types="vite/client" />
import { z } from 'zod';

const frontendEnvSchema = z.object({
  VITE_API_URL: z.string().url('VITE_API_URL debe ser una URL valida').default('http://localhost:3000'),
});

export type FrontendEnv = z.infer<typeof frontendEnvSchema>;

function getFrontendEnv(): FrontendEnv {
  const result = frontendEnvSchema.safeParse({
    VITE_API_URL: import.meta.env.VITE_API_URL,
  });

  if (!result.success) {
    console.error('❌ Error en variables de entorno de Frontend:', result.error.format());
    throw new Error('CONFIG FATAL: Variables de entorno invalidadas en Frontend.');
  }

  return result.data;
}

export const env = getFrontendEnv();
