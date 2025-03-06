#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Checking for potentially sensitive information in the codebase...${NC}"

# Define patterns to search for
PATTERNS=(
  "password"
  "passwd"
  "secret"
  "api[_-]key"
  "auth[_-]token"
  "access[_-]token"
  "credentials"
  "mongodb+srv"
  "mongodb://"
  "postgres://"
  "mysql://"
  "redis://"
  "smtp://"
  "ftp://"
  "ssh://"
  "Bearer "
  "Authorization: "
  "private[_-]key"
  "BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY"
)

# Join patterns with OR operator for grep
GREP_PATTERN=$(printf "|%s" "${PATTERNS[@]}")
GREP_PATTERN=${GREP_PATTERN:1} # Remove the first |

# Files to exclude
EXCLUDE_DIRS=(
  "node_modules"
  "dist"
  "build"
  ".git"
  ".env.example"
  "package-lock.json"
  "yarn.lock"
  "scripts/check-sensitive-info.sh"
)

# Build exclude pattern for grep
EXCLUDE_PATTERN=$(printf " --exclude-dir=%s" "${EXCLUDE_DIRS[@]}")

# Check for sensitive patterns
echo -e "${YELLOW}Searching for sensitive patterns...${NC}"
RESULTS=$(grep -r -i -E "$GREP_PATTERN" $EXCLUDE_PATTERN --include="*.{js,jsx,ts,tsx,json,yml,yaml,xml,md,html,css,scss,env}" . || true)

if [ -z "$RESULTS" ]; then
  echo -e "${GREEN}No sensitive patterns found in code files.${NC}"
else
  echo -e "${RED}Potentially sensitive information found:${NC}"
  echo "$RESULTS"
  echo -e "${YELLOW}Please review these files and ensure no sensitive information is committed.${NC}"
fi

# Check for .env files that might be committed
echo -e "\n${YELLOW}Checking for .env files...${NC}"
ENV_FILES=$(find . -name ".env" -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/build/*" || true)

if [ -z "$ENV_FILES" ]; then
  echo -e "${GREEN}No .env files found outside of excluded directories.${NC}"
else
  echo -e "${RED}Found .env files that might contain sensitive information:${NC}"
  echo "$ENV_FILES"
  echo -e "${YELLOW}Please ensure these files are added to .gitignore and not committed.${NC}"
fi

echo -e "\n${YELLOW}Checking git history for potentially leaked secrets...${NC}"
GIT_HISTORY_CHECK=$(git log -p | grep -i -E "$GREP_PATTERN" || true)

if [ -z "$GIT_HISTORY_CHECK" ]; then
  echo -e "${GREEN}No sensitive patterns found in git history.${NC}"
else
  echo -e "${RED}Potentially sensitive information found in git history:${NC}"
  echo "$GIT_HISTORY_CHECK"
  echo -e "${YELLOW}Consider using tools like BFG Repo-Cleaner or git-filter-branch to remove sensitive data from history.${NC}"
fi

echo -e "\n${YELLOW}Security check complete.${NC}" 