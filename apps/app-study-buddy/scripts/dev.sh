#!/usr/bin/env bash
# Start local Supabase (Docker), write .env from status, then Expo.
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$(cd "$APP_DIR/../.." && pwd)"
ENV_FILE="$APP_DIR/.env"

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. Start Docker Desktop first." >&2
  exit 1
fi

cd "$ROOT"
echo "Starting local Supabase..."
npx supabase start

# status -o env may mix human lines on stdout; pick only KEY=value rows.
STATUS="$(npx supabase status -o env 2>/dev/null || true)"
API_URL="$(printf '%s\n' "$STATUS" | sed -n 's/^API_URL=//p' | head -1 | tr -d '"')"
ANON_KEY="$(printf '%s\n' "$STATUS" | sed -n 's/^ANON_KEY=//p' | head -1 | tr -d '"')"

if [[ -z "$API_URL" || -z "$ANON_KEY" ]]; then
  echo "Failed to read API_URL / ANON_KEY from \`supabase status\`." >&2
  exit 1
fi

# Upsert the two Expo public vars; keep any other existing keys.
touch "$ENV_FILE"
TMP="$(mktemp)"
grep -vE '^(EXPO_PUBLIC_SUPABASE_URL|EXPO_PUBLIC_SUPABASE_ANON_KEY)=' "$ENV_FILE" >"$TMP" || true
{
  cat "$TMP"
  printf 'EXPO_PUBLIC_SUPABASE_URL=%s\n' "$API_URL"
  printf 'EXPO_PUBLIC_SUPABASE_ANON_KEY=%s\n' "$ANON_KEY"
} >"$ENV_FILE"
rm -f "$TMP"

echo "Wrote $ENV_FILE → $API_URL"
cd "$APP_DIR"
exec npx expo start "$@"
