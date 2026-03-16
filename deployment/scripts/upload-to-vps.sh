#!/usr/bin/env bash
# Wrapper script to keep deployment helpers discoverable under deployment/scripts.
# Delegates execution to the repository-root upload script.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ROOT_SCRIPT="$ROOT_DIR/upload-deployment-to-vps.sh"

if [[ ! -f "$ROOT_SCRIPT" ]]; then
  echo "ERROR: Root script not found: $ROOT_SCRIPT"
  exit 1
fi

if [[ ! -x "$ROOT_SCRIPT" ]]; then
  chmod +x "$ROOT_SCRIPT"
fi

exec "$ROOT_SCRIPT" "$@"
