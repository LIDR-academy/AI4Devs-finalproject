#!/usr/bin/env bash
# upload-deployment-to-vps.sh
# Upload the deployment/ directory to the remote VPS.
# Target: /root/DELIVERIES/ai4devs/deployment/
#
# Usage: ./upload-deployment-to-vps.sh
#
# Requires: rsync, sshpass  (install: sudo apt install rsync sshpass)
set -euo pipefail

# ── Dependency check ──────────────────────────────────────────────────────────
for cmd in rsync sshpass; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: '$cmd' is not installed."
    echo "       Install it with: sudo apt install $cmd"
    exit 1
  fi
done

# ── Interactive inputs ────────────────────────────────────────────────────────
read -rp "VPS host (IP or hostname): " VPS_HOST
if [[ -z "$VPS_HOST" ]]; then
  echo "ERROR: host cannot be empty."
  exit 1
fi

read -rp "SSH user [root]: " VPS_USER
VPS_USER="${VPS_USER:-root}"

read -rsp "SSH password: " VPS_PASSWORD
echo   # newline after hidden input
if [[ -z "$VPS_PASSWORD" ]]; then
  echo "ERROR: password cannot be empty."
  exit 1
fi

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$SCRIPT_DIR/deployment"
REMOTE_TARGET="/root/DELIVERIES/ai4devs/"

echo ""
echo "============================================================"
echo "  From : $SOURCE_DIR"
echo "  To   : ${VPS_USER}@${VPS_HOST}:${REMOTE_TARGET}"
echo "============================================================"
echo ""

# ── Ensure remote target directory exists ────────────────────────────────────
echo ">>> Creating remote target directory (if needed)..."
sshpass -p "$VPS_PASSWORD" ssh \
  -o StrictHostKeyChecking=accept-new \
  -o ConnectTimeout=15 \
  "${VPS_USER}@${VPS_HOST}" \
  "mkdir -p ${REMOTE_TARGET}"

# ── Upload ────────────────────────────────────────────────────────────────────
echo ">>> Uploading deployment/ to ${VPS_HOST}:${REMOTE_TARGET} ..."
sshpass -p "$VPS_PASSWORD" rsync \
  --archive \
  --verbose \
  --compress \
  --delete \
  --exclude='.env' \
  --exclude='logs/' \
  --exclude='__pycache__/' \
  -e "ssh -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15" \
  "$SOURCE_DIR/" \
  "${VPS_USER}@${VPS_HOST}:${REMOTE_TARGET}deployment/"

echo ""
echo "============================================================"
echo "  Upload complete."
echo ""
echo "  Next steps on the VPS:"
echo "    1. cd ${REMOTE_TARGET}deployment"
echo "    2. cp .env.example .env  # then fill in secrets"
echo "    3. docker login           # authenticate with private registry"
echo "    4. ./scripts/prod-up.sh"
echo "============================================================"
