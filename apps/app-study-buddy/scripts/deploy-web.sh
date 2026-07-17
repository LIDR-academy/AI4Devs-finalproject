#!/usr/bin/env bash
# Export web using .env.production only, then eas deploy.
# Usage: ./scripts/deploy-web.sh [--prod] [extra eas deploy flags...]
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE=".env.production"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — copy from .env.example and fill hosted Supabase values." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ -z "${EXPO_PUBLIC_SUPABASE_URL:-}" || -z "${EXPO_PUBLIC_SUPABASE_ANON_KEY:-}" ]]; then
  echo "EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY required in $ENV_FILE" >&2
  exit 1
fi

case "$EXPO_PUBLIC_SUPABASE_URL" in
  *127.0.0.1*|*localhost*)
    echo "Refusing deploy: $ENV_FILE points at local Supabase ($EXPO_PUBLIC_SUPABASE_URL)" >&2
    exit 1
    ;;
esac

# Skip dotenv merge (.env would otherwise override .env.production on export)
EXPO_NO_DOTENV=1 expo export --platform web --clear
eas deploy "$@"
