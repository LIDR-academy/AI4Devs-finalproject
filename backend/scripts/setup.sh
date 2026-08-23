#!/bin/bash
set -e

echo "========================================"
echo "COACHER - Development Environment Setup"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  if [ -f .env.example ]; then
    cp .env.example .env
    echo ".env created. Please review and update values if needed."
  else
    echo "No .env.example found. Creating minimal .env..."
    cat > .env << 'EOF'
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/coacher_dev
JWT_SECRET=dev-jwt-secret-minimum-32-characters-long
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
COACH_FINANCIAL_ENCRYPTION_KEY=12345678901234567890123456789012
EOF
    echo ".env created with default values."
  fi
  echo ""
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate Prisma client
echo ""
echo "Generating Prisma client..."
npx prisma generate

# Run migrations
echo ""
echo "Running database migrations..."
npx prisma migrate dev

# Seed database
echo ""
echo "Seeding database with test data..."
npx tsx prisma/seed-all.ts

echo ""
echo "========================================"
echo "Setup complete!"
echo ""
echo "To start the backend dev server:"
echo "  cd backend && npm run dev"
echo ""
echo "To start the frontend dev server:"
echo "  cd frontend && npm run dev"
echo ""
echo "Default test credentials:"
echo "  Admin:  admin@coacher.com / 123456789"
echo "  Coach:  coach@coacher.com / 123456789"
echo "  Coachee: coachee1@coacher.com / 123456789"
echo "  (and 9 more coachees: coachee2 through coachee10)"
echo "========================================"
