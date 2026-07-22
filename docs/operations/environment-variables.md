# Environment Variables

This document is the source of truth for runtime configuration across environments.

## Backend

Defined and validated in app/backend/src/config/env.ts.

### Required

- DATABASE_URL: PostgreSQL connection string.

### Required only when AZURE_OPENAI_ENABLED=true

- AZURE_OPENAI_ENDPOINT
- AZURE_OPENAI_API_KEY
- AZURE_OPENAI_DEPLOYMENT

### Optional with defaults

- PORT (default: 3001)
- AUTH_ENABLED (default: false)
- AUTH_LOGIN_PASSWORD (default: dev-pass-123)
- AUTH_TOKEN_SECRET (default: dev-token-secret-change-me)
- AUTH_TOKEN_TTL_SECONDS (default: 28800)
- AUTH_REFRESH_TOKEN_TTL_SECONDS (default: 604800)
- AUTH_SUPERADMIN_ACTOR_IDS (default: "")
- AUTH_ADMIN_ACTOR_IDS (default: "")
- CORS_ALLOWED_ORIGINS (default: http://localhost:3000,http://127.0.0.1:3000)
- RATE_LIMIT_WINDOW_MS (default: 60000)
- RATE_LIMIT_MAX_REQUESTS (default: 120)
- AZURE_OPENAI_ENABLED (default: false)
- AZURE_OPENAI_API_VERSION (default: 2024-10-21)
- AZURE_OPENAI_TIMEOUT_MS (default: 25000)
- AZURE_OPENAI_INPUT_COST_PER_1K (default: 0.005)
- AZURE_OPENAI_OUTPUT_COST_PER_1K (default: 0.015)

## Frontend

- VITE_API_BASE_URL: public backend URL (for example https://projectscope-backend.onrender.com).

## Environment Matrix

| Variable | Local | Staging | Production |
|---|---|---|---|
| DATABASE_URL | Required | Required | Required |
| AUTH_ENABLED | Optional | Optional | Optional |
| AUTH_LOGIN_PASSWORD | Optional | Required | Required |
| AUTH_TOKEN_SECRET | Optional | Required | Required |
| AUTH_TOKEN_TTL_SECONDS | Optional | Optional | Optional |
| AUTH_REFRESH_TOKEN_TTL_SECONDS | Optional | Optional | Optional |
| AUTH_SUPERADMIN_ACTOR_IDS | Optional | Required | Required |
| AUTH_ADMIN_ACTOR_IDS | Optional | Optional | Optional |
| CORS_ALLOWED_ORIGINS | Optional | Optional | Optional |
| RATE_LIMIT_WINDOW_MS | Optional | Optional | Optional |
| RATE_LIMIT_MAX_REQUESTS | Optional | Optional | Optional |
| AZURE_OPENAI_ENABLED | Optional | Optional | Optional |
| AZURE_OPENAI_ENDPOINT | Conditional | Conditional | Conditional |
| AZURE_OPENAI_API_KEY | Conditional | Conditional | Conditional |
| AZURE_OPENAI_DEPLOYMENT | Conditional | Conditional | Conditional |
| VITE_API_BASE_URL | Required | Required | Required |

## Security Notes

- Never commit .env files.
- Store secrets only in provider secret managers (Render, Vercel, cloud provider).
- Rotate AUTH_TOKEN_SECRET and AUTH_LOGIN_PASSWORD if exposed.
- Rotate AZURE_OPENAI_API_KEY if exposed.
- Logout invalida la version de sesion del usuario para revocar refresh/access tokens emitidos previamente.
