# Environment Variables

All env vars used by Realista. Set in `.env` for local dev (gitignored) and in GitHub Actions secrets for CI. A template is at `.env.example`.

## Required

| Var | Example | Where | Purpose |
|---|---|---|---|
| `DATABASE_URL` | `postgresql://realista:realista@localhost:5432/realista?schema=public` | backend | Prisma connection string |
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | backend | OpenRouter API key for LLM |
| `PORT` | `3001` | backend | Express port |
| `FRONTEND_URL` | `http://localhost:5173` | backend | CORS allowlist for dev |
| `NODE_ENV` | `development` | both | `development` / `production` / `test` |

## Optional (with sensible defaults)

| Var | Default | Purpose |
|---|---|---|
| `OPENROUTER_MODEL` | `anthropic/claude-3.5-sonnet` | Model for listing analysis. Use a cheaper model (e.g., `openai/gpt-4o-mini`) in dev to save cost |
| `LOG_LEVEL` | `info` | `debug` / `info` / `warn` / `error` |
| `RATE_LIMIT_PER_DAY` | `20` | Max analyses per session UUID per day (FR-010) |
| `NOMINATIM_BASE_URL` | `https://nominatim.openstreetmap.org` | Geocoding endpoint |
| `CATASTRO_BASE_URL` | `https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCallejero.asmx` | Catastro SEC endpoint |
| `REALISTA_USER_AGENT` | `Realista/1.0 (analizador educativo)` | User-Agent for outgoing HTTP (FR-012) |
| `ALLOWED_PORTALS` | `idealista.com,fotocasa.es,habitaclia.com,pisos.com,milanuncios.com` | Comma-separated allowlist of listing domains |
| `HEALTH_CHECK_CRON` | `*/30 * * * *` | Cron expression for portal health check (FR-027) |

## Frontend (SvelteKit)

| Var | Example | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3001` | Backend URL proxied from frontend |
| `VITE_APP_NAME` | `Realista` | App name shown in the UI |
| `VITE_APP_VERSION` | `0.2.0` | App version, displayed in footer |

## Testing

| Var | Default | Purpose |
|---|---|---|
| `MOCK_OPENROUTER` | `false` | If `true`, the LLM adapter returns canned responses (faster, no API cost) |
| `MOCK_NOMINATIM` | `false` | If `true`, the geocoding adapter returns canned coordinates |
| `MOCK_CATASTRO` | `false` | If `true`, the catastro adapter returns canned data |
| `CI` | n/a | Set by CI runner; tests run in non-interactive mode |

## Secrets handling

- **Never commit** `.env` or any file with real API keys. Use `.env.example` for the template.
- **Local dev** — `.env` at the repo root; both `backend/` and `frontend/` read it via `dotenv-cli` or `@dotenvx/dotenvx`.
- **CI** — GitHub Actions secrets. Inject as `env:` in workflow files.
- **Production** — secret manager (Vercel env vars, Railway env vars, etc.). Never hardcoded.

## Validation

The backend validates env vars at startup via Zod (`backend/src/infrastructure/config/env.ts`):

```typescript
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENROUTER_API_KEY: z.string().min(20),
  PORT: z.coerce.number().int().positive().default(3001),
  FRONTEND_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // ... optional ones with defaults
});

export const env = envSchema.parse(process.env);
```

If validation fails, the server does not start and prints the missing/invalid fields.

## Example `.env.example`

```bash
# Database
DATABASE_URL=postgresql://realista:realista@localhost:5432/realista?schema=public

# Backend
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
LOG_LEVEL=info

# OpenRouter (get yours at https://openrouter.ai/keys)
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet

# Rate limiting
RATE_LIMIT_PER_DAY=20

# External services
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
CATASTRO_BASE_URL=https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCallejero.asmx
REALISTA_USER_AGENT=Realista/1.0 (analizador educativo)
ALLOWED_PORTALS=idealista.com,fotocasa.es,habitaclia.com,pisos.com,milanuncios.com

# Health check (FR-027)
HEALTH_CHECK_CRON=*/30 * * * *

# Frontend
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Realista
VITE_APP_VERSION=0.2.0

# Testing (uncomment to mock external APIs in tests)
# MOCK_OPENROUTER=true
# MOCK_NOMINATIM=true
# MOCK_CATASTRO=true
```
