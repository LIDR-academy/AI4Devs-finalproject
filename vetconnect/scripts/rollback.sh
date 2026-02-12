#!/bin/bash
# scripts/rollback.sh
# Automated rollback script for VetConnect on Render.com
#
# Usage:
#   RENDER_API_KEY=xxx RENDER_SERVICE_ID=xxx ./scripts/rollback.sh
#   RENDER_API_KEY=xxx RENDER_SERVICE_ID=xxx ./scripts/rollback.sh --deploy-id <deploy-id>

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RENDER_API_URL="https://api.render.com/v1"
HEALTH_CHECK_URL="${HEALTH_CHECK_URL:-https://vetconnect.onrender.com/health}"
HEALTH_CHECK_TIMEOUT=60
HEALTH_CHECK_RETRIES=6

# Check required environment variables
if [ -z "${RENDER_API_KEY:-}" ]; then
  echo -e "${RED}Error: RENDER_API_KEY environment variable is not set${NC}"
  exit 1
fi

if [ -z "${RENDER_SERVICE_ID:-}" ]; then
  echo -e "${RED}Error: RENDER_SERVICE_ID environment variable is not set${NC}"
  exit 1
fi

# Parse arguments
DEPLOY_ID=""
if [ "${1:-}" == "--deploy-id" ] && [ -n "${2:-}" ]; then
  DEPLOY_ID="${2}"
fi

echo -e "${BLUE}🔄 VetConnect Rollback Script${NC}"
echo "Service ID: ${RENDER_SERVICE_ID}"
echo ""

# Fetch recent deploys
echo -e "${YELLOW}📋 Fetching recent deploys...${NC}"
DEPLOYS_RESPONSE=$(curl -s -H "Authorization: Bearer ${RENDER_API_KEY}" \
  "${RENDER_API_URL}/services/${RENDER_SERVICE_ID}/deploys?limit=10")

# Check if API call was successful
if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Failed to fetch deploys from Render API${NC}"
  exit 1
fi

# Extract deploy IDs and info using jq if available, otherwise use grep/sed
if command -v jq &> /dev/null; then
  DEPLOY_COUNT=$(echo "${DEPLOYS_RESPONSE}" | jq '. | length')
  
  if [ "${DEPLOY_COUNT}" -eq 0 ]; then
    echo -e "${RED}✗ No deploys found${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}✓ Found ${DEPLOY_COUNT} recent deploy(s)${NC}"
  echo ""
  echo "Recent deploys:"
  echo "${DEPLOYS_RESPONSE}" | jq -r '.[] | "  [\(.id)] \(.status) - \(.createdAt) - Commit: \(.commit.message // "N/A")"'
  echo ""
  
  # Get previous deploy ID if not specified
  if [ -z "${DEPLOY_ID}" ]; then
    PREVIOUS_DEPLOY_ID=$(echo "${DEPLOYS_RESPONSE}" | jq -r '.[1].id // empty')
    
    if [ -z "${PREVIOUS_DEPLOY_ID}" ] || [ "${PREVIOUS_DEPLOY_ID}" == "null" ]; then
      echo -e "${RED}✗ No previous deploy found to rollback to${NC}"
      exit 1
    fi
    
    DEPLOY_ID="${PREVIOUS_DEPLOY_ID}"
  fi
  
  # Verify deploy exists
  DEPLOY_EXISTS=$(echo "${DEPLOYS_RESPONSE}" | jq -r --arg id "${DEPLOY_ID}" '.[] | select(.id == $id) | .id')
  
  if [ -z "${DEPLOY_EXISTS}" ]; then
    echo -e "${RED}✗ Deploy ID ${DEPLOY_ID} not found in recent deploys${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}⚠ jq not installed, using basic parsing${NC}"
  # Fallback: basic parsing without jq
  if [ -z "${DEPLOY_ID}" ]; then
    PREVIOUS_DEPLOY_ID=$(echo "${DEPLOYS_RESPONSE}" | grep -o '"id":"[^"]*"' | head -2 | tail -1 | cut -d'"' -f4)
    
    if [ -z "${PREVIOUS_DEPLOY_ID}" ]; then
      echo -e "${RED}✗ Could not find previous deploy ID${NC}"
      echo "Please install jq for better parsing or specify deploy ID:"
      echo "  ./scripts/rollback.sh --deploy-id <deploy-id>"
      exit 1
    fi
    
    DEPLOY_ID="${PREVIOUS_DEPLOY_ID}"
  fi
fi

echo -e "${YELLOW}⏮️  Rolling back to deploy: ${DEPLOY_ID}${NC}"
read -p "Are you sure you want to rollback? (yes/no): " CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
  echo -e "${YELLOW}Rollback cancelled${NC}"
  exit 0
fi

# Perform rollback
echo -e "${YELLOW}🚀 Initiating rollback...${NC}"
ROLLBACK_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  "${RENDER_API_URL}/services/${RENDER_SERVICE_ID}/deploys/${DEPLOY_ID}/rollback")

# Check if rollback was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Rollback initiated successfully${NC}"
else
  echo -e "${RED}✗ Rollback failed${NC}"
  exit 1
fi

# Wait for deployment to complete
echo -e "${YELLOW}⏳ Waiting for deployment to complete...${NC}"
sleep 30

# Health check
echo -e "${YELLOW}🏥 Performing health check...${NC}"
RETRY_COUNT=0
HEALTH_OK=false

while [ ${RETRY_COUNT} -lt ${HEALTH_CHECK_RETRIES} ]; do
  if curl -f -m 10 "${HEALTH_CHECK_URL}" > /dev/null 2>&1; then
    HEALTH_OK=true
    break
  fi
  
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "  Attempt ${RETRY_COUNT}/${HEALTH_CHECK_RETRIES} failed, retrying in 10s..."
  sleep 10
done

if [ "${HEALTH_OK}" = true ]; then
  echo -e "${GREEN}✓ Health check passed${NC}"
  echo -e "${GREEN}✅ Rollback completed successfully!${NC}"
else
  echo -e "${RED}⚠ Health check failed after ${HEALTH_CHECK_RETRIES} attempts${NC}"
  echo -e "${YELLOW}Please check the service manually: ${HEALTH_CHECK_URL}${NC}"
  exit 1
fi
