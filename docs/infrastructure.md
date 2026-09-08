# Infrastructure

Hosting, database, push notifications, and Google Calendar integration for the **Coacher** production deployment.

For local development setup, see [`docs/setup.md`](./setup.md).

| Provider | Purpose | Live resources |
|----------|---------|----------------|
| **Render** | Hosts the backend API (Web Service) and the frontend (Static Site) | `coacher-api`, `coacher-frontend` |
| **Neon** | Managed PostgreSQL database (serverless) | Project `rough-cloud-03066723` |
| **Firebase (FCM)** | Push notifications (Web Push / cloud messaging) | Project `coacher` |
| **Google Cloud** | Google Calendar system-of-record (Service Account) | Project `coacher-scheduling-engine` |

---

## 1. GCP Project

| Property | Value |
|----------|-------|
| **Project ID** | `coacher-scheduling-engine` |
| **Project Name** | Coacher Scheduling Engine |
| **Billing** | Linked active billing account |
| **APIs Enabled** | `calendar-json.googleapis.com` (Google Calendar API) |

### Service Account

| Property | Value |
|----------|-------|
| **Name** | `scheduling-engine-calendar-sa` |
| **Email** | `scheduling-engine-calendar-sa@coacher-scheduling-engine.iam.gserviceaccount.com` |
| **IAM Roles** | None (calendar access via Calendar sharing, not IAM) |
| **Key File** | JSON key stored outside version control (path via `GOOGLE_CALENDAR_SA_KEY_PATH`) |

### System Calendars

| Environment | Calendar Name | Calendar ID Env Var |
|-------------|---------------|---------------------|
| dev | Coacher Scheduling Engine [dev] | `GOOGLE_CALENDAR_ID_DEV` |
| staging | Coacher Scheduling Engine [staging] | `GOOGLE_CALENDAR_ID_STAGING` |
| prod | Coacher Scheduling Engine [prod] | `GOOGLE_CALENDAR_ID_PROD` |

All calendars are shared with writer permission to the Service Account email above.

### Provisioning

The GCP infrastructure was provisioned following the plan in `specs/005-google-calendar-setup/`.
For a reproducible setup, run:

```bash
bash scripts/setup-gcp-calendar.sh
```

---

## 2. Render

Deployment host for both services. Both services **auto-deploy from the `main` branch** on every push
(`autoDeploy: true` in `render.yaml`).

### Services

| Property | Backend (`coacher-api`) | Frontend (`coacher-frontend`) |
|----------|--------------------------|------------------------------|
| Type | Web Service (`node`) | Static Site |
| Root dir | `backend/` | `frontend/` |
| Plan | Free | Free |
| Region | Frankfurt (`frankfurt`) | — |
| Public URL | `https://ai4devs-finalproject-sby8.onrender.com` | `https://coacher-frontend.onrender.com` |
| Build cmd | `npm install && npx prisma generate && npx prisma migrate deploy && npm run build` | `npm install && npm run build` |
| Start cmd | `node dist/index.js` | — (serves `staticPublishPath: dist`) |

### Environment variables

Values marked **Manually set in the Render dashboard** (declared as `sync: false` in `render.yaml`)
are NOT tracked in the repo — they must be re-entered if the service is recreated.

**Backend `coacher-api`:**

| Variable | Source | Notes |
|----------|--------|-------|
| `DATABASE_URL` | **dashboard** | Neon Postgres connection string (prod database `neondb`) |
| `JWT_SECRET` | **dashboard** | `>= 32` chars |
| `COACH_FINANCIAL_ENCRYPTION_KEY` | **dashboard** | exactly 32 chars (AES-256-GCM) |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | **dashboard** | single-line JSON service-account key for FCM |
| `NODE_ENV` | `render.yaml` | `production` |
| `PORT` | `render.yaml` | `10000` |
| `CORS_ORIGIN` | `render.yaml` | `https://coacher-frontend.onrender.com` |

`GOOGLE_CALENDAR_*` (SA email + key path + calendar ID) are read from `docs/infrastructure.md` /
`backend/.env.example`. On Render the SA key must be made available at the path set in
`GOOGLE_CALENDAR_SA_KEY_PATH` (e.g. a dashboard value pointing to an accessible path, or mounted file).

**Frontend `coacher-frontend` (Static Site):**

| Variable | Source | Notes |
|----------|--------|-------|
| `VITE_API_BASE_URL` | `render.yaml` | `https://ai4devs-finalproject-sby8.onrender.com` |
| `VITE_FIREBASE_API_KEY` | **dashboard** | Firebase web app config |
| `VITE_FIREBASE_AUTH_DOMAIN` | **dashboard** | Firebase web app config |
| `VITE_FIREBASE_PROJECT_ID` | **dashboard** | Firebase web app config |
| `VITE_FIREBASE_STORAGE_BUCKET` | **dashboard** | Firebase web app config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | **dashboard** | Firebase web app config |
| `VITE_FIREBASE_APP_ID` | **dashboard** | Firebase web app config |
| `VITE_FIREBASE_VAPID_KEY` | **dashboard** | Web Push VAPID key (public) |

> Push is only enabled when `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID` and
> `VITE_FIREBASE_VAPID_KEY` are all set (`frontend/src/infrastructure/notifications/firebaseClient.ts`).
> The backend ships with push **disabled** unless one of `FIREBASE_SERVICE_ACCOUNT_KEY` /
> `FIREBASE_SERVICE_ACCOUNT_PATH` is set (the adapter returns `null` otherwise).

### Gotchas

- Render free DBs (if used via `Postgres` dashboard service) can expire — this project uses **Neon** instead.
- `render.yaml` runs `prisma migrate deploy` at build time — schema migrations apply on deploy.
- Static site uses `frontend/public/_redirects` for SPA fallback routing.

---

## 3. Neon (PostgreSQL)

Managed PostgreSQL provider. Single project, one production branch.

| Property | Value |
|----------|-------|
| Project | `Coacher` — id `rough-cloud-03066723` |
| Console | <https://console.neon.tech/app/projects/rough-cloud-03066723> |
| Branch | `production` — id `br-fancy-moon-b27vztmf` (default / primary) |
| Endpoint host | `ep-odd-bird-b2zqw7am.c-6.eu-central-1.aws.neon.tech` |
| Region | `aws-eu-central-1` (Frankfurt) |
| Databases | `neondb` (used by production) and `coacher` (older/alternative) |

- The connection string is **not** committed; the active `DATABASE_URL` is stored in the Render dashboard.
- Local dev does NOT use Neon — it uses Postgres via Docker Compose (`docker compose up -d db`, localhost:5432, db `coacher`).
- Prisma migrations are applied to production automatically via the Render build command.

### Gotchas

- Neon free-tier databases can be paused/suspended while idle and deleted unless upgraded.
- The project also keeps an older `coacher` database on the same branch; production currently targets `neondb`.

---

## 4. Firebase Cloud Messaging (push notifications)

Handles all push delivery. Backend sends via the **Firebase Admin SDK** (FCM HTTP v1), the frontend PWA
subscribes via **Web Push** (Firebase Messaging JS SDK).

| Property | Value |
|----------|-------|
| Project id | `coacher` |
| Backend service account | `coacher@coacher.iam.gserviceaccount.com` (JSON key) |
| Backend env | `FIREBASE_SERVICE_ACCOUNT_KEY` (single-line JSON) or `FIREBASE_SERVICE_ACCOUNT_PATH` |
| Frontend env | `VITE_FIREBASE_*` + `VITE_FIREBASE_VAPID_KEY` (see Render table) |

### Flow

1. Coachee opens the PWA → `usePushRegistration.ts` / `pushManager.ts` request Notification permission
   and registers with Firebase Messaging, storing the FCM token via the backend device-token endpoint.
2. Backend sends notifications (e.g. waiting-list spot opened, class canceled) through
   `FCMNotificationAdapter.send()` — `messaging.sendEachForMulticast` with `notification` + `data`
   (including `link`, see below).
3. The service worker `push.js` (Workbox `importScripts`, scope `/`) receives the FCM push, shows a
   notification, and on `notificationclick` **navigates the focused client** (`client.navigate(url)`)
   so the PWA reloads the current bundle — falling back to `clients.openWindow`.

### Key files

- `frontend/public/push.js` — service worker push + click handler (copied to `dist/` at build time).
- `frontend/vite.config.ts` — PWA plugin: `registerType: autoUpdate`, `importScripts: ["/push.js"]`.
- `frontend/src/infrastructure/notifications/firebaseClient.ts` — Firebase init + VAPID + foreground listener.
- `backend/src/infrastructure/adapters/notifications/FCMNotificationAdapter.ts` — server-side send (returns per-token delivery outcome).
- `backend/src/config/env.ts` — validates `FIREBASE_SERVICE_ACCOUNT_KEY` / `_PATH` (optional).

### Gotchas

- The service account JSON key must be stored as a **single-line** string in
  `FIREBASE_SERVICE_ACCOUNT_KEY` on Render (JSON with newlines breaks parsing → adapter disables push).
- A stale PWA cache used to keep showing the old bundle after a notification click; the current `push.js`
  `client.navigate(url)` logic reloads the app to the freshly deployed version on every click.
- Notification payloads include push `data.link` (default `/`) so the click target is deterministic.

---

## 5. Environment Variables

See `backend/.env.example` for the full set of required variables.

```
GOOGLE_CALENDAR_SA_EMAIL=scheduling-engine-calendar-sa@coacher-scheduling-engine.iam.gserviceaccount.com
GOOGLE_CALENDAR_SA_KEY_PATH=secrets/coacher-calendar-sa-key.json
GOOGLE_CALENDAR_ID_DEV=<dev-calendar-id>
GOOGLE_CALENDAR_ID_STAGING=<staging-calendar-id>
GOOGLE_CALENDAR_ID_PROD=<production-calendar-id>

FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/firebase-sa-key.json
```

---

## 6. Security Constraints

- The Service Account has **no** GCP IAM roles — all calendar access is controlled via Calendar sharing permissions
- The JSON key file must **never** be committed to version control (excluded via `.gitignore`)
- Google Calendar is accessed **exclusively** server-side via the Service Account — no browser-originating Calendar API calls
- All secrets injected via environment variables (no committed `.env`)
