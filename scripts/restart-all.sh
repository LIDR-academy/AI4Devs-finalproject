#!/bin/bash

# ShopMefy - Simple Restart Script
# 1. Kill ports
# 2. Restart Docker
# 3. Start Backend and Frontend

echo "🔄 ShopMefy System Restart"

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Step 1: Kill processes on ports
echo "🛑 Killing processes on ports..."
PORTS=(3001 3000)
for port in "${PORTS[@]}"; do
    echo "   Killing port $port..."
    if command -v npx >/dev/null 2>&1; then
        npx kill-port $port >/dev/null 2>&1
    else
        lsof -ti:$port | xargs kill -9 2>/dev/null
    fi
done

# Step 2: Check and start Docker
echo "🐳 Checking Docker..."
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "   Please start Docker Desktop and try again"
    exit 1
fi

# Step 3: Restart Docker containers
echo "🐳 Restarting Docker containers..."
cd "$PROJECT_ROOT/backend" || exit 1
docker compose down >/dev/null 2>&1
docker compose up -d >/dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Failed to start Docker containers"
    exit 1
fi

# Wait for database
echo "⏳ Waiting for database..."
sleep 8

# Step 4: Start Backend
echo "🟢 Starting Backend..."
cd "$PROJECT_ROOT/backend" || exit 1
npm run dev &
BACKEND_PID=$!

# Wait for backend
sleep 3

# Step 5: Start Frontend  
echo "🟢 Starting Frontend..."
cd "$PROJECT_ROOT/frontend" || exit 1
npm run dev &
FRONTEND_PID=$!

# Final status
sleep 2
echo ""
echo "✅ System restarted!"
echo "📊 Backend: http://localhost:3001"
echo "📊 Frontend: http://localhost:3000 (or check terminal)"
echo "🗄️ Database: localhost:5434"
echo ""
echo "🛑 To stop: Use Ctrl+C in terminals or kill processes manually"

cd "$PROJECT_ROOT" 