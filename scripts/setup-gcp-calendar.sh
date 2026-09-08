#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="coacher-scheduling-engine"
SA_NAME="scheduling-engine-calendar-sa"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
KEY_FILE="./coacher-calendar-sa-key.json"

echo "=== GCP Calendar Infrastructure Setup ==="
echo "Project: ${PROJECT_ID}"
echo ""

# Check prerequisites
echo "[1/8] Checking gcloud configuration..."
if ! command -v gcloud &> /dev/null; then
  echo "ERROR: gcloud CLI not found. Install from https://cloud.google.com/sdk/docs/install"
  exit 1
fi

CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")
echo "  Current project: ${CURRENT_PROJECT:-"(not set)"}"

# Step 1: Create project (or use existing)
echo ""
echo "[2/8] Setting up GCP project..."
if gcloud projects describe "${PROJECT_ID}" &>/dev/null; then
  echo "  Project ${PROJECT_ID} already exists — using it."
else
  echo "  Creating project ${PROJECT_ID}..."
  gcloud projects create "${PROJECT_ID}" --name="Coacher Scheduling Engine"
  echo "  Linking billing account..."
  echo "  WARN: You must manually link a billing account:"
  echo "    https://console.cloud.google.com/billing/projects"
fi
gcloud config set project "${PROJECT_ID}"

# Step 2: Enable Calendar API
echo ""
echo "[3/8] Enabling Calendar API..."
gcloud services enable calendar-json.googleapis.com --project="${PROJECT_ID}"
echo "  Calendar API enabled."

# Step 3: Verify API enablement
echo ""
echo "[4/8] Verifying Calendar API..."
if gcloud services list --project="${PROJECT_ID}" --enabled | grep -q calendar-json.googleapis.com; then
  echo "  Calendar API is active."
else
  echo "  ERROR: Calendar API not active."
  exit 1
fi

# Step 4: Create Service Account
echo ""
echo "[5/8] Creating Service Account..."
if gcloud iam service-accounts describe "${SA_EMAIL}" --project="${PROJECT_ID}" &>/dev/null; then
  echo "  Service Account ${SA_EMAIL} already exists."
else
  gcloud iam service-accounts create "${SA_NAME}" \
    --display-name="Scheduling Engine Calendar Service Account" \
    --project="${PROJECT_ID}"
  echo "  Created Service Account: ${SA_EMAIL}"
fi

# Step 5: Generate JSON key
echo ""
echo "[6/8] Generating JSON key..."
if [ -f "${KEY_FILE}" ]; then
  echo "  Key file ${KEY_FILE} already exists. Regenerating will invalidate the old key."
  read -rp "  Regenerate? (y/N): " confirm
  if [ "${confirm}" = "y" ] || [ "${confirm}" = "Y" ]; then
    gcloud iam service-accounts keys create "${KEY_FILE}" \
      --iam-account="${SA_EMAIL}" --project="${PROJECT_ID}"
    echo "  Key regenerated: ${KEY_FILE}"
  else
    echo "  Keeping existing key."
  fi
else
  gcloud iam service-accounts keys create "${KEY_FILE}" \
    --iam-account="${SA_EMAIL}" --project="${PROJECT_ID}"
  echo "  Key created: ${KEY_FILE}"
fi

# Step 6: Verify key loads
echo ""
echo "[7/8] Verifying key loads..."
if gcloud auth activate-service-account --key-file="${KEY_FILE}" &>/dev/null; then
  echo "  Key verified successfully."
else
  echo "  ERROR: Key verification failed."
  exit 1
fi

echo ""
echo "[8/8] Setup complete!"
echo ""
echo "=== Next Steps (Manual) ==="
echo "1. Move ${KEY_FILE} to a secure path outside version control"
echo "2. Add the key path to .gitignore"
echo "3. Create system calendars in Google Calendar UI:"
echo "   - 'Coacher Scheduling Engine [dev]'"
echo "   - 'Coacher Scheduling Engine [staging]'"
echo "   - 'Coacher Scheduling Engine [prod]'"
echo "4. Share each calendar with: ${SA_EMAIL} (writer permissions)"
echo "5. Record Calendar IDs and set env vars:"
echo "   GOOGLE_CALENDAR_SA_EMAIL=${SA_EMAIL}"
echo "   GOOGLE_CALENDAR_SA_KEY_PATH=<path-to-key>"
echo "   GOOGLE_CALENDAR_ID_DEV=<dev-calendar-id>"
echo "   GOOGLE_CALENDAR_ID_STAGING=<staging-calendar-id>"
echo "   GOOGLE_CALENDAR_ID_PROD=<production-calendar-id>"
echo ""
echo "See spec.md Steps 5-7 for detailed UI instructions."
