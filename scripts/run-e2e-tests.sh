#!/bin/bash

# E2E Test Script - Uses restart-all.sh for setup
# 1. Calls restart-all.sh for complete system setup
# 2. Waits for services to be ready
# 3. Runs tests
# 4. Cleans up

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo_msg() {
  echo -e "${YELLOW}[E2E Test]${NC} $1"
}

# Navigate to project root
cd "$(dirname "$0")/.." || { echo_msg "${RED}Failed to navigate to project root${NC}"; exit 1; }
ROOT_DIR=$(pwd)

# Step 1: Use restart-all.sh for complete system setup
echo_msg "Setting up complete system using restart-all.sh..."
./scripts/restart-all.sh

if [ $? -ne 0 ]; then
    echo_msg "${RED}System setup failed${NC}"
    exit 1
fi

echo_msg "${GREEN}System setup completed!${NC}"

# Step 2: Wait for backend health check
echo_msg "Waiting for backend to be ready..."
attempt=0
max_attempts=30
while ! curl -s http://localhost:3001/api/health > /dev/null; do
  attempt=$((attempt+1))
  if [ $attempt -eq $max_attempts ]; then
    echo_msg "${RED}Backend failed to start${NC}"
    exit 1
  fi
  echo_msg "Waiting for backend... (attempt $attempt/$max_attempts)"
  sleep 1
done
echo_msg "${GREEN}Backend is running!${NC}"

# Step 3: Wait for frontend
echo_msg "Waiting for frontend to be ready..."
attempt=0
max_attempts=30
while ! curl -s http://localhost:3000 > /dev/null; do
  attempt=$((attempt+1))
  if [ $attempt -eq $max_attempts ]; then
    echo_msg "${RED}Frontend failed to start${NC}"
    exit 1
  fi
  echo_msg "Waiting for frontend... (attempt $attempt/$max_attempts)"
  sleep 1
done
echo_msg "${GREEN}Frontend is running!${NC}"

# Step 4: Run tests in headless mode
echo_msg "${GREEN}Running E2E tests in headless mode...${NC}"
cd "$ROOT_DIR/frontend" && npx cypress run
TEST_EXIT_CODE=$?

# Step 5: Return test result
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo_msg "${GREEN}Tests completed successfully!${NC}"
  exit 0
else
  echo_msg "${RED}Tests failed with exit code $TEST_EXIT_CODE${NC}"
  exit $TEST_EXIT_CODE
fi 