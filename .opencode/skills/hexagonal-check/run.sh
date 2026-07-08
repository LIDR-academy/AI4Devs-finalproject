#!/usr/bin/env bash
# hexagonal-check: ensures backend/src/domain/ has no framework/IO imports.
# See .opencode/skills/hexagonal-check.md

set -e

DOMAIN_DIR="${1:-backend/src/domain}"

if [ ! -d "$DOMAIN_DIR" ]; then
  echo "hexagonal-check: $DOMAIN_DIR does not exist"
  exit 1
fi

FORBIDDEN='express|@prisma/client|svelte|@sveltejs|node-fetch|axios|undici|cheerio|dotenv|fs|path|console|xml2js'
VIOLATIONS=$(grep -rE "^(import |from |const .* = require\()" "$DOMAIN_DIR" 2>/dev/null | \
  grep -E "from ['\"]($FORBIDDEN)['\"]|require\(['\"]($FORBIDDEN)['\"]\)" || true)

# Allowed exceptions
ALLOWED='crypto|events'

# Filter allowed exceptions
FILTERED=""
if [ -n "$VIOLATIONS" ]; then
  FILTERED=$(echo "$VIOLATIONS" | grep -vE "from ['\"]($ALLOWED)['\"]" || true)
fi

if [ -z "$FILTERED" ]; then
  echo "hexagonal-check: PASS"
  echo "  - Files scanned: $(find "$DOMAIN_DIR" -name '*.ts' | wc -l | tr -d ' ')"
  exit 0
fi

echo "hexagonal-check: FAIL"
echo "$FILTERED"
exit 1
