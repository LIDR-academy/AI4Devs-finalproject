#!/bin/bash
set -e

# Docker entrypoint script for VetConnect
# This script runs database migrations before starting the server

echo "🚀 Starting VetConnect..."

# Wait for database to be ready (useful for first deployment)
echo "⏳ Waiting for database connection..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
  if bundle exec rails runner "ActiveRecord::Base.connection.execute('SELECT 1')" 2>/dev/null; then
    echo "✅ Database is ready"
    break
  fi
  attempt=$((attempt + 1))
  echo "Database is unavailable - sleeping (attempt $attempt/$max_attempts)"
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "⚠️  Warning: Database connection timeout, but continuing..."
fi

# Run database migrations
echo "📦 Running database migrations..."
if bundle exec rails db:migrate; then
  echo "✅ Migrations completed successfully"
else
  echo "⚠️  Warning: Migration failed, but continuing startup..."
  # Don't exit - allow server to start even if migrations fail
  # This prevents blocking deployment if there's a migration issue
fi

# Check migration status
if bundle exec rails db:migrate:status 2>/dev/null | grep -q "down"; then
  echo "⚠️  Warning: Some migrations are still pending"
else
  echo "✅ All migrations are up to date"
fi

# Start the server
echo "🌐 Starting Puma server..."
exec "$@"
