# app-study-buddy

Universal Expo app (web / iOS / Android) for AI Study Buddy — turns an uploaded PDF into an AI-generated lesson of instructional and activity slides. Product spec: [`PRD.md`](../../PRD.md).

## Prerequisites

- **Docker Desktop** running (required for local Supabase)
- **Supabase CLI** — `brew install supabase/tap/supabase` (or use `npx supabase`)
- **pnpm** (repo uses `pnpm@11.10.0`)

## Local Supabase (Docker)

From the **repo root**:

```bash
npx supabase start          # first run pulls images (slow)
npx supabase status         # prints local URL + anon/service keys
```

Defaults from `supabase/config.toml`:

| Service | URL / port |
| --- | --- |
| API | `http://127.0.0.1:54321` |
| DB | `54322` |
| Studio | `http://127.0.0.1:54323` |

Migrations under `supabase/migrations/` apply on start. Reset + re-apply:

```bash
npx supabase db reset
```

Stop:

```bash
npx supabase stop
```

### Edge functions (AI key save/remove)

`manage-api-key` lives in `supabase/functions/`. Edge runtime starts with the stack. For hot-reload while hacking functions:

```bash
npx supabase functions serve
```

Function URL: `http://127.0.0.1:54321/functions/v1/manage-api-key`

## Setup

```bash
# from repo root
pnpm install
```

## Run

With Docker running, one command starts Supabase, writes `.env` (`EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` from `supabase status`), then Expo:

```bash
pnpm --filter app-study-buddy dev
# or from this package: pnpm dev
```

Expo only (Supabase already up / hosted `.env`):

```bash
pnpm --filter app-study-buddy start
pnpm --filter app-study-buddy web
pnpm --filter app-study-buddy ios
pnpm --filter app-study-buddy android
```

Manual `.env` (hosted project or without the `dev` script): copy `.env.example` and set URL + anon key from Studio → Settings → API, or from `npx supabase status -o env`.

## Structure

Screens live in `src/app/` (Expo Router file-based routing) and should mostly compose from the `@helsoft/*` libs in `libs/` — business logic belongs in `libs/study-buddy`, not here. See the root `AGENTS.md` and `.agents/rules/` for architecture rules.
