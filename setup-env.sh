#!/bin/bash
# setup-env.sh - Generate secure credentials for local development
# Usage: ./setup-env.sh

set -e

echo "🔐 SF-PM Secure Environment Setup"
echo "=================================="
echo ""

# Check if .env already exists
if [ -f .env ]; then
    echo "⚠️  WARNING: .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled. Existing .env preserved."
        exit 0
    fi
    echo "📝 Backing up existing .env to .env.backup"
    cp .env .env.backup
fi

# Generate secure passwords
echo "🔑 Generating secure credentials..."
DATABASE_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
REDIS_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-24)

# Default values
DATABASE_USER="postgres"
DATABASE_NAME="sfpm_db"

# Create .env file from template
echo "📝 Creating .env file..."
cat > .env << EOF
# Supabase Configuration
# IMPORTANT: Fill these with your actual Supabase project credentials
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-service-role-key-here
SUPABASE_DATABASE_URL=postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres

# Local Development Database (docker-compose db service)
# ✅ Generated secure credentials below
DATABASE_USER=${DATABASE_USER}
DATABASE_PASSWORD=${DATABASE_PASSWORD}
DATABASE_NAME=${DATABASE_NAME}
DATABASE_URL=postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@db:5432/${DATABASE_NAME}

# Redis Authentication (docker-compose redis service)
# ✅ Generated secure password below
REDIS_PASSWORD=${REDIS_PASSWORD}

# Celery (Task Queue)
CELERY_BROKER_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
CELERY_RESULT_BACKEND=redis://:${REDIS_PASSWORD}@redis:6379/0
EOF

echo ""
echo "✅ .env file created successfully!"
echo ""
echo "📋 Generated Credentials (LOCAL DEVELOPMENT ONLY):"
echo "───────────────────────────────────────────────────"
echo "Database User:     ${DATABASE_USER}"
echo "Database Password: ${DATABASE_PASSWORD}"
echo "Database Name:     ${DATABASE_NAME}"
echo "Redis Password:    ${REDIS_PASSWORD}"
echo ""
echo "⚠️  NEXT STEPS:"
echo "1. Edit .env and fill in your SUPABASE_* credentials from https://supabase.com/dashboard"
echo "2. Keep .env file secret - it's already in .gitignore"
echo "3. Start services with: make up-all"
echo ""
echo "🔐 Security Notes:"
echo "- Never commit .env to git"
echo "- Rotate passwords regularly in production"
echo "- Use different credentials for prod/staging/dev"
echo ""
echo "💾 Your credentials are saved in .env (gitignored)"
if [ -f .env.backup ]; then
    echo "📦 Previous .env backed up to .env.backup"
fi
