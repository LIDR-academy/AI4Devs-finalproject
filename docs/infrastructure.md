# Infrastructure: Google Cloud Platform

> Hosting (Render), database (Neon) and push notifications (Firebase) are documented separately in
> [`docs/cloud-infrastructure.md`](./cloud-infrastructure.md).

## GCP Project

| Property | Value |
|----------|-------|
| **Project ID** | `coacher-scheduling-engine` |
| **Project Name** | Coacher Scheduling Engine |
| **Billing** | Linked active billing account |
| **APIs Enabled** | `calendar-json.googleapis.com` (Google Calendar API) |

## Service Account

| Property | Value |
|----------|-------|
| **Name** | `scheduling-engine-calendar-sa` |
| **Email** | `scheduling-engine-calendar-sa@coacher-scheduling-engine.iam.gserviceaccount.com` |
| **IAM Roles** | None (calendar access via Calendar sharing, not IAM) |
| **Key File** | JSON key stored outside version control (path via `GOOGLE_CALENDAR_SA_KEY_PATH`) |

## System Calendars

| Environment | Calendar Name | Calendar ID Env Var |
|-------------|---------------|---------------------|
| dev | Coacher Scheduling Engine [dev] | `GOOGLE_CALENDAR_ID_DEV` |
| staging | Coacher Scheduling Engine [staging] | `GOOGLE_CALENDAR_ID_STAGING` |
| prod | Coacher Scheduling Engine [prod] | `GOOGLE_CALENDAR_ID_PROD` |

All calendars are shared with writer permission to the Service Account email above.

## Environment Variables

See `backend/.env.example` for the full set of required variables.

```
GOOGLE_CALENDAR_SA_EMAIL=scheduling-engine-calendar-sa@coacher-scheduling-engine.iam.gserviceaccount.com
GOOGLE_CALENDAR_SA_KEY_PATH=secrets/coacher-calendar-sa-key.json
GOOGLE_CALENDAR_ID_DEV=<dev-calendar-id>
GOOGLE_CALENDAR_ID_STAGING=<staging-calendar-id>
GOOGLE_CALENDAR_ID_PROD=<production-calendar-id>
```

## Provisioning

The GCP infrastructure was provisioned following the plan in `specs/005-google-calendar-setup/`.
For a reproducible setup, run:

```bash
bash scripts/setup-gcp-calendar.sh
```

## Security Constraints

- The Service Account has **no** GCP IAM roles — all calendar access is controlled via Calendar sharing permissions
- The JSON key file must **never** be committed to version control (excluded via `.gitignore`)
- Google Calendar is accessed **exclusively** server-side via the Service Account — no browser-originating Calendar API calls
