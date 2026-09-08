# Operations Runbook

## Google Calendar — Recovery Procedures

### Service Account Key Rotation

If the Service Account key is compromised or needs rotation:

1. Delete the old key:
   ```bash
   gcloud iam service-accounts keys delete <KEY_ID> \
     --iam-account=scheduling-engine-calendar-sa@coacher-scheduling-engine.iam.gserviceaccount.com \
     --project=coacher-scheduling-engine
   ```
   Find `<KEY_ID>` via: `gcloud iam service-accounts keys list --iam-account=scheduling-engine-calendar-sa@coacher-scheduling-engine.iam.gserviceaccount.com --project=coacher-scheduling-engine`

2. Generate a new key:
   ```bash
   gcloud iam service-accounts keys create ./coacher-calendar-sa-key.json \
     --iam-account=scheduling-engine-calendar-sa@coacher-scheduling-engine.iam.gserviceaccount.com \
     --project=coacher-scheduling-engine
   ```

3. Replace the key file at the path referenced by `GOOGLE_CALENDAR_SA_KEY_PATH`

4. Verify the new key loads:
   ```bash
   gcloud auth activate-service-account --key-file=<path-to-new-key>
   ```

5. Run `test-calendar-access.mjs` to confirm access still works.

**Impact**: The old key stops working immediately. The new key takes effect once deployed. No calendar data loss.

---

### System Calendar Deleted Accidentally

If a system calendar (dev, staging, or prod) is deleted:

1. Create a new calendar in Google Calendar UI:
   - Name: `Coacher Scheduling Engine [<env>]` (e.g., `Coacher Scheduling Engine [dev]`)
   - Description: `<Env> environment system calendar`
   - Timezone: Gym's local timezone

2. Share the new calendar with the Service Account:
   - Add `scheduling-engine-calendar-sa@coacher-scheduling-engine.iam.gserviceaccount.com`
   - Permission: "Make changes to events" (writer)

3. Copy the new Calendar ID from "Settings and sharing" → "Integrate calendar"

4. Update the corresponding environment variable (e.g., `GOOGLE_CALENDAR_ID_DEV`)

5. Restart the scheduling engine to pick up the new Calendar ID

**Impact**: Events in the deleted calendar are lost (Google Calendar does not retain deleted calendars). If recovery is critical, check Google Takeout or Vault (if using Google Workspace).

---

### Service Account Deleted

If the Service Account is deleted:

1. Re-create the Service Account:
   ```bash
   gcloud iam service-accounts create scheduling-engine-calendar-sa \
     --display-name="Scheduling Engine Calendar Service Account" \
     --project=coacher-scheduling-engine
   ```

2. Generate a new JSON key:
   ```bash
   gcloud iam service-accounts keys create ./coacher-calendar-sa-key.json \
     --iam-account=scheduling-engine-calendar-sa@coacher-scheduling-engine.iam.gserviceaccount.com \
     --project=coacher-scheduling-engine
   ```

3. Re-share all 3 system calendars with the new SA email (writer permissions) via Google Calendar UI

4. Update the key file at the path referenced by `GOOGLE_CALENDAR_SA_KEY_PATH`

5. Verify access: run `test-calendar-access.mjs`

**Impact**: Calendar access is interrupted from deletion until re-sharing completes. Existing calendar events are preserved.

---

### Billing Disabled

If billing is disabled on the GCP project:

1. All Calendar API calls will fail with billing-related errors (HTTP 403/ billing account not found)

2. Re-enable billing:
   - Go to [GCP Console → Billing](https://console.cloud.google.com/billing)
   - Link the project `coacher-scheduling-engine` to an active billing account

3. Verify Calendar API is still active:
   ```bash
   gcloud services list --project=coacher-scheduling-engine --enabled | grep calendar
   ```

4. Verify API access with `test-calendar-access.mjs`

**Impact**: All Calendar operations (read/write events) are unavailable while billing is disabled. No data loss.

---

## Monitoring

- **Calendar API quota**: Monitor via GCP Console → APIs & Services → Quotas (`calendar-json.googleapis.com`)
- **Free tier**: 1,000,000 queries/day. If exceeded, request increase via GCP Console → IAM & Admin → Quotas
- **Alert**: Set up budget alerts in GCP Billing to avoid surprise billing disablement
