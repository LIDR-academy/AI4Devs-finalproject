#!/bin/bash
# scripts/backup_database.sh
# Automated database backup script for VetConnect
# 
# Usage:
#   ./scripts/backup_database.sh
#   DATABASE_URL=postgres://... ./scripts/backup_database.sh

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${HOME}/backups/vetconnect"
BACKUP_FILE="${BACKUP_DIR}/vetconnect_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=7

# Check if DATABASE_URL is set
if [ -z "${DATABASE_URL:-}" ]; then
  echo -e "${RED}Error: DATABASE_URL environment variable is not set${NC}"
  echo "Usage: DATABASE_URL=postgres://... ./scripts/backup_database.sh"
  exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo -e "${YELLOW}📦 Starting database backup...${NC}"
echo "Database: ${DATABASE_URL%%\?*}"  # Show URL without query params
echo "Backup file: ${BACKUP_FILE}"

# Backup PostgreSQL database
if pg_dump "${DATABASE_URL}" | gzip > "${BACKUP_FILE}"; then
  BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
  echo -e "${GREEN}✓ Backup completed successfully${NC}"
  echo "  Size: ${BACKUP_SIZE}"
  echo "  File: ${BACKUP_FILE}"
else
  echo -e "${RED}✗ Backup failed${NC}"
  exit 1
fi

# Optional: Upload to GitHub Releases (requires gh CLI and GITHUB_TOKEN)
if command -v gh &> /dev/null && [ -n "${GITHUB_TOKEN:-}" ]; then
  echo -e "${YELLOW}📤 Uploading to GitHub Releases...${NC}"
  REPO=$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')
  
  if gh release create "backup-${TIMESTAMP}" "${BACKUP_FILE}" \
    --repo "${REPO}" \
    --title "Database Backup ${TIMESTAMP}" \
    --notes "Automated database backup - ${BACKUP_SIZE}" \
    --prerelease \
    --quiet; then
    echo -e "${GREEN}✓ Uploaded to GitHub Releases${NC}"
  else
    echo -e "${YELLOW}⚠ Failed to upload to GitHub (non-critical)${NC}"
  fi
else
  echo -e "${YELLOW}⚠ GitHub CLI not available or GITHUB_TOKEN not set, skipping upload${NC}"
fi

# Clean up old backups (keep only last N days)
echo -e "${YELLOW}🧹 Cleaning up old backups (older than ${RETENTION_DAYS} days)...${NC}"
FILES_DELETED=$(find "${BACKUP_DIR}" -name "vetconnect_*.sql.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)

if [ "${FILES_DELETED}" -gt 0 ]; then
  echo -e "${GREEN}✓ Deleted ${FILES_DELETED} old backup(s)${NC}"
else
  echo -e "${GREEN}✓ No old backups to delete${NC}"
fi

# List remaining backups
REMAINING=$(find "${BACKUP_DIR}" -name "vetconnect_*.sql.gz" | wc -l)
echo -e "${GREEN}✓ Total backups retained: ${REMAINING}${NC}"

echo -e "${GREEN}✅ Backup process completed successfully!${NC}"
