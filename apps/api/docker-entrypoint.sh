#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

if [ "${ENABLE_ADMIN_BOOTSTRAP}" = "true" ]; then
  echo "Running optional one-time admin bootstrap..."
  if [ -f prisma/dist-seed/bootstrap-admin.js ]; then
    node prisma/dist-seed/bootstrap-admin.js
  else
    npx ts-node --transpile-only prisma/bootstrap-admin.ts
  fi
else
  echo "Admin bootstrap skipped (ENABLE_ADMIN_BOOTSTRAP is not true)."
fi

echo "Skipping development seed on startup (US-010)."
echo "Starting API..."
exec node dist/src/main.js
