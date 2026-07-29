# Quickstart: Google Calendar Infrastructure Validation

**Phase**: 1 — Design & Contracts
**Date**: 2026-07-15

## Prerequisites

- Google Cloud account with billing enabled
- `gcloud` CLI installed and authenticated (`gcloud auth login`)
- Active GCP project: `coacher-scheduling-engine` (see [spec.md Step 1](./spec.md#step-1-create-the-gcp-project))
- Google Calendar API enabled on the project (see [spec.md Step 2](./spec.md#step-2-enable-the-calendar-api))
- Service Account and JSON key created (see [spec.md Step 3](./spec.md#step-3-create-the-service-account-and-key))
- System calendars created and shared with SA (see [spec.md Steps 5-6](./spec.md#step-5-create-the-system-calendars-one-per-environment))

## Validate GCP Project

```bash
gcloud config get-value project
# Expected: coacher-scheduling-engine
```

## Validate Calendar API is Enabled

```bash
gcloud services list --enabled --project=coacher-scheduling-engine | grep calendar
# Expected: calendar-json.googleapis.com
```

## Validate Service Account Exists

```bash
gcloud iam service-accounts list --project=coacher-scheduling-engine
# Expected: scheduling-engine-calendar-sa@coacher-scheduling-engine.iam.gserviceaccount.com
```

## Validate SA Key Is Loadable

```bash
gcloud auth activate-service-account --key-file=/path/to/coacher-calendar-sa-key.json
# Expected: Activated service account credentials for [...]
```

## Validate Calendar API Access

**Note:** Service Accounts cannot use `calendarList.list()` on non-Google-Workspace accounts (see [Google issue tracker](https://issuetracker.google.com/issues/36810541)). Instead, access is verified by querying each calendar directly by its known Calendar ID.

Two validation scripts are available in `backend/scripts/`:

```bash
# Verify each of the 3 calendars is accessible by Calendar ID
cd backend && node scripts/test-calendar-access.mjs

# Verify the SA can create, read, update, and delete events on each calendar
cd backend && node scripts/test-calendar-crud.mjs
```

Expected output for `test-calendar-access.mjs`:
```
Verifying access to each system calendar by Calendar ID:

  ✓ [dev] Access OK — "Coacher Scheduling Engine [dev]"
  ✓ [staging] Access OK — "Coacher Scheduling Engine [staging]"
  ✓ [prod] Access OK — "Coacher Scheduling Engine [prod]"

All 3 system calendars accessible. Verification PASSED.
```

## Verify No Key in Git History

```bash
git log --all -- '**/coacher-calendar-sa-key*'
# Expected: no output (empty)
```

## Validate All Calendar IDs in Environment

```bash
echo "DEV: $GOOGLE_CALENDAR_ID_DEV"
echo "STAGING: $GOOGLE_CALENDAR_ID_STAGING"
echo "PROD: $GOOGLE_CALENDAR_ID_PROD"
# Expected: non-empty calendar ID strings
```

## Environment Variable Setup

Add to your `.env` file (already in `.gitignore`):

```bash
GOOGLE_CALENDAR_SA_EMAIL=scheduling-engine-calendar-sa@coacher-scheduling-engine.iam.gserviceaccount.com
GOOGLE_CALENDAR_SA_KEY_PATH=/path/to/coacher-calendar-sa-key.json
GOOGLE_CALENDAR_ID_DEV=<value-from-step-7>
GOOGLE_CALENDAR_ID_STAGING=<value-from-step-7>
GOOGLE_CALENDAR_ID_PROD=<value-from-step-7>
```

## All Steps Complete

Once all validations above pass, the GCP Calendar infrastructure is fully provisioned and ready for the scheduling engine. See [spec.md Verification Checklist](./spec.md#verification-checklist) for the final sign-off.
