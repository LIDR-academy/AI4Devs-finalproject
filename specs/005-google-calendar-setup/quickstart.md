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

## Validate Calendar API Access (with a test script)

Create a file `test-calendar-access.mjs`:

```javascript
import { google } from 'googleapis';
import { readFileSync } from 'fs';

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(readFileSync('/path/to/coacher-calendar-sa-key.json', 'utf-8')),
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth });

// List calendars the SA can access
const res = await calendar.calendarList.list();
console.log('Accessible calendars:', res.data.items.map(c => c.summary));

// Expected output should include all 3 system calendars:
// "Coacher Scheduling Engine [dev]"
// "Coacher Scheduling Engine [staging]"
// "Coacher Scheduling Engine [prod]"
```

Run:

```bash
node test-calendar-access.mjs
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
