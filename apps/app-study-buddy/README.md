# app-study-buddy

Universal Expo app (web / iOS / Android) for AI Study Buddy — turns an uploaded PDF into an AI-generated lesson of instructional and activity slides. Product spec: [`PRD.md`](../../PRD.md).

## Setup

```bash
cp .env.example .env   # fill in EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY
pnpm install           # from the repo root
```

## Run

```bash
pnpm --filter app-study-buddy dev    # Expo dev server
pnpm --filter app-study-buddy web    # web
pnpm --filter app-study-buddy ios    # iOS simulator
pnpm --filter app-study-buddy android
```

## Structure

Screens live in `src/app/` (Expo Router file-based routing) and should mostly compose from the `@helsoft/*` libs in `libs/` — business logic belongs in `libs/study-buddy`, not here. See the root `AGENTS.md` and `.agents/rules/` for architecture rules.
