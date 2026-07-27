import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  OPENROUTER_API_KEY: z.string().min(20, 'OPENROUTER_API_KEY must be set'),
  OPENROUTER_MODEL: z.string().default('anthropic/claude-3.5-sonnet'),

  RATE_LIMIT_PER_DAY: z.coerce.number().int().positive().default(20),

  NOMINATIM_BASE_URL: z.string().url().default('https://nominatim.openstreetmap.org'),
  CATASTRO_BASE_URL: z.string().url().default(
    'https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCallejero.asmx',
  ),
  REALISTA_USER_AGENT: z.string().default('Realista/1.0 (analizador educativo)'),
  ALLOWED_PORTALS: z
    .string()
    .default('idealista.com,fotocasa.es,habitaclia.com,pisos.com,milanuncios.com')
    .transform((s) => s.split(',').map((d) => d.trim())),

  HEALTH_CHECK_CRON: z.string().default('*/30 * * * *'),

  // Playwright headless-browser adapter (DataDome bypass)
  PLAYWRIGHT_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  PLAYWRIGHT_POOL_SIZE: z.coerce.number().int().positive().default(1),
  PLAYWRIGHT_BROWSER_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
  PLAYWRIGHT_HEADLESS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:');
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}

const rawEnv = loadEnv();

export const env = Object.assign(rawEnv, {
  get IS_TEST(): boolean {
    return process.env.VITEST === 'true' || (process.env.NODE_ENV || 'development') === 'test';
  },
}) as Env & { IS_TEST: boolean };
