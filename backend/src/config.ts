import { z } from 'zod'

const DATABASE_URL_REQUIRED_MESSAGE =
  'Variable obligatoria DATABASE_URL no definida. Ver .env.example'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  API_PORT: z.preprocess(
    (value) => (value === undefined || value === '' ? '3001' : value),
    z.coerce.number().int().positive()
  ),
  CORS_ORIGIN: z
    .string()
    .min(1)
    .default('http://localhost:5173'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
})

export type AppConfig = {
  databaseUrl: string
  apiPort: number
  corsOrigin: string
  nodeEnv: 'development' | 'production' | 'test'
}

function failConfig(message: string): never {
  console.error(message)
  process.exit(1)
}

export function parseConfig(env: NodeJS.ProcessEnv): AppConfig {
  if (!env.DATABASE_URL || env.DATABASE_URL.trim() === '') {
    failConfig(DATABASE_URL_REQUIRED_MESSAGE)
  }

  const result = envSchema.safeParse({
    DATABASE_URL: env.DATABASE_URL,
    API_PORT: env.API_PORT,
    CORS_ORIGIN: env.CORS_ORIGIN,
    NODE_ENV: env.NODE_ENV,
  })

  if (!result.success) {
    console.error(result.error.message)
    process.exit(1)
  }

  const parsed = result.data

  return {
    databaseUrl: parsed.DATABASE_URL,
    apiPort: parsed.API_PORT,
    corsOrigin: parsed.CORS_ORIGIN,
    nodeEnv: parsed.NODE_ENV,
  }
}

export const config = parseConfig(process.env)
