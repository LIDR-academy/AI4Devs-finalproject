#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "Stopping local Supabase stack and wiping local data volumes…"
npx supabase stop --no-backup

echo "Starting local Supabase stack (reapplies migrations, seed.sql, and functions)…"
npx supabase start
