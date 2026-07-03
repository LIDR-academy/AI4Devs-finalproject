# Local Development Setup

## 1. Overview

RealSaveFooding is a mobile-first web application composed of three independent processes:

| Process | Folder | Technology | Responsibility |
|---------|--------|------------|----------------|
| **Frontend** | `front/` | React 19, TanStack Start, Vite, TypeScript | UI, routing, client-side state |
| **Backend** | `back/` | NestJS, Prisma ORM, TypeScript | REST API, business logic, AWS integrations |
| **Database** | Docker | PostgreSQL 16 | Persistent data storage |

The frontend communicates with the backend via `http://localhost:3000/api`. The backend reads from and writes to the PostgreSQL container on port `5432`.

---

## 2. Prerequisites

| Tool | Recommended version | Notes |
|------|---------------------|-------|
| Git | ≥ 2.40 | — |
| Node.js | ≥ 22 LTS | Current runtime in use is v26 |
| npm | ≥ 10 | Bundled with Node.js |
| Docker | ≥ 25 | Needed for the local PostgreSQL container |
| Docker Compose | ≥ 2.24 | Bundled with Docker Desktop |

> **Assumption:** AWS credentials for Textract, S3, and SNS are not required to run the frontend or most of the backend locally — only the receipt OCR feature will fail without them. For full local testing of OCR, provide real AWS credentials in `back/.env`.

---

## 3. Repository Setup

```bash
# Clone
git clone <repository-url>
cd JRG-AI4Devs-finalproject

# Install backend dependencies
cd back && npm install && cd ..

# Install frontend dependencies
cd front && npm install && cd ..
```

---

## 4. Environment Configuration

### Backend — `back/.env`

Copy the example and edit as needed:

```bash
cp back/.env.example back/.env
```

The file `back/.env.example` contains:

```dotenv
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/RealSaveFooding
JWT_SECRET=replace-this-secret
JWT_EXPIRES_IN=1d
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=RealSaveFooding-receipts-dev
AWS_SNS_TOPIC_ARN=arn:aws:sns:eu-west-1:123456789012:RealSaveFooding-expiration-dev
AWS_SES_FROM_ADDRESS=notifications@realsavefooding.com
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@realsavefooding.com
```

| Variable | Purpose | Local value |
|----------|---------|-------------|
| `NODE_ENV` | Runtime mode | `development` |
| `PORT` | NestJS HTTP port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | Matches Docker Compose defaults |
| `JWT_SECRET` | Signing key for JWT tokens | Any non-empty string locally |
| `JWT_EXPIRES_IN` | Token lifetime | `1d` |
| `AWS_REGION` | AWS region for S3/Textract/SNS/SES | `eu-west-1` |
| `AWS_ACCESS_KEY_ID` | AWS credentials | Required for receipt OCR and email notifications |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials | Required for receipt OCR and email notifications |
| `AWS_S3_BUCKET` | S3 bucket for receipt images | Required only for receipt upload |
| `AWS_SNS_TOPIC_ARN` | SNS topic for expiration alerts | Required only for SNS-based notifications |
| `AWS_SES_FROM_ADDRESS` | Verified sender address in AWS SES | Required for email notifications |
| `VAPID_PUBLIC_KEY` | VAPID public key for Web Push | Required for browser push notifications |
| `VAPID_PRIVATE_KEY` | VAPID private key for Web Push | Required for browser push notifications |
| `VAPID_SUBJECT` | Contact URI sent with push messages | `mailto:admin@yourdomain.com` |

### Frontend — `front/.env`

The frontend reads `VITE_API_BASE_URL` and `VITE_VAPID_PUBLIC_KEY` at build/dev time. `VITE_API_BASE_URL` defaults to `http://localhost:3000/api` in source, but **`VITE_VAPID_PUBLIC_KEY` is required** if you want browser push notifications to work.

Create `front/.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:3000/api
VITE_VAPID_PUBLIC_KEY=<same public key as VAPID_PUBLIC_KEY in back/.env>
```

> The VAPID public key must be identical in both `back/.env` and `front/.env` — the frontend uses it to register push subscriptions and the backend uses it to sign outgoing push messages.

### Notification credentials setup

The notification service delivers alerts via two channels: **email (AWS SES)** and **browser push (Web Push / VAPID)**. Each requires its own credentials.

#### AWS SES — email delivery

1. Open **AWS Console → IAM → Users → Create user**.
2. Attach the policy `AmazonSESFullAccess` (or a scoped policy allowing `ses:SendEmail`).
3. Under **Security credentials**, create an Access Key — copy the values into `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.
4. Open **AWS Console → SES → Verified identities → Create identity**.
5. Verify the sender email address or domain you intend to use as `AWS_SES_FROM_ADDRESS`.
6. **Sandbox limitation:** by default SES can only send to other verified addresses. To send to real users, request production access from the SES console.

#### VAPID keys — browser push

Run this once in the `back/` directory (the `web-push` package is already installed):

```bash
cd back && npx web-push generate-vapid-keys
```

The command prints a public/private key pair. Copy:

- **Public Key** → `VAPID_PUBLIC_KEY` in `back/.env` **and** `VITE_VAPID_PUBLIC_KEY` in `front/.env`
- **Private Key** → `VAPID_PRIVATE_KEY` in `back/.env` only

> The private key must never be exposed to the browser or committed to the repository.

---

## 5. Database Setup

The database runs inside Docker using the Compose file at `infra/docker/docker-compose.local.yml`.

```bash
# Start the PostgreSQL container (detached)
docker compose -f infra/docker/docker-compose.local.yml up -d
```

| Setting | Value |
|---------|-------|
| Image | `postgres:16-alpine` |
| Container name | `RealSaveFooding-postgres` |
| Host port | `5432` |
| Database | `RealSaveFooding` |
| Username | `postgres` |
| Password | `postgres` |

**Verify the container is running:**

```bash
docker ps --filter name=RealSaveFooding-postgres
```

**Apply all pending migrations:**

```bash
cd back && npm run prisma:migrate
```

This command runs `prisma migrate dev`, which creates the database schema and applies all migrations under `back/prisma/migrations/`.

**Seed the database (optional):**

There is a seed script at `back/prisma/seed.ts` that creates a demo user (`demo@RealSaveFooding.dev`) and a set of price catalog items:

```bash
cd back && npx prisma db seed
```

> **Note:** There is no `seed` script registered in `back/package.json`. If the command above fails, run it directly:
> ```bash
> cd back && npx ts-node prisma/seed.ts
> ```

**Stop the container:**

```bash
docker compose -f infra/docker/docker-compose.local.yml down
```

To also remove the persisted volume:

```bash
docker compose -f infra/docker/docker-compose.local.yml down -v
```

---

## 6. Backend Startup

```bash
cd back && npm run start:dev
```

NestJS starts in watch mode (ts-node + incremental compilation). The server listens on `http://localhost:3000`.

**Verify the backend is up:**

```bash
curl http://localhost:3000/api/health
# Expected: {"status":"ok"}
```

**Run migrations before first start** (if not already done — see §5):

```bash
cd back && npm run prisma:migrate
```

**Open Prisma Studio** (optional visual DB browser):

```bash
cd back && npm run prisma:studio
```

---

## 7. Frontend Startup

```bash
cd front && npm run dev
```

Vite starts the dev server. The application is accessible at:

```
http://localhost:5173
```

The frontend communicates with the backend at `http://localhost:3000/api`. Ensure the backend is running before logging in or performing any data operations.

---

## 8. Running Automated Tests

### Backend unit tests

```bash
cd back && npm test
```

Runs Jest with the configuration in `back/test/jest-unit.json`. Matches files with the `.spec.ts` extension.

### Backend integration / e2e tests

```bash
cd back && npm run test:e2e
```

Runs Jest with the configuration in `back/test/jest-e2e.json`. Matches files with the `.e2e-spec.ts` extension. These tests require a running database — start the Docker container first.

### Frontend unit tests (Vitest)

```bash
cd front && npm test
```

Runs Vitest in single-run mode.

### Frontend e2e tests (Playwright)

**Install browsers on first run:**

```bash
cd front && npm run playwright:install
```

**Run all e2e tests:**

```bash
cd front && npm run test:e2e
```

**Run specific test suites:**

```bash
# Expiration confidence flow (headed)
cd front && npm run test:e2e:ui:headed

# Notification tests
cd front && npm run test:e2e:notifications
```

Playwright tests target `http://localhost:3000/api` by default. The backend must be running before executing e2e tests. Override the target with:

```bash
E2E_API_BASE_URL=http://localhost:3000/api npm run test:e2e
```

---

## 9. Typical Local Development Workflow

```bash
# 1. Start the database
docker compose -f infra/docker/docker-compose.local.yml up -d

# 2. Apply any new migrations
cd back && npm run prisma:migrate && cd ..

# 3. Start the backend (keep this terminal open)
cd back && npm run start:dev

# 4. Start the frontend in a new terminal (keep this terminal open)
cd front && npm run dev

# 5. Run unit tests before committing
cd back && npm test
cd front && npm test
```

### Shortcut: `dev.sh`

The repository root includes a `dev.sh` script that automates steps 1, 3, and 4 above in a single terminal: it starts the Postgres container (stopping any other container bound to port `5432`), waits for the database to become ready, then launches the backend and frontend dev servers together.

```bash
./dev.sh
```

Press `Ctrl+C` to stop the backend, frontend, and database container together. You still need to run migrations (step 2) separately before first use or after pulling new migrations.

---

## 10. Troubleshooting

### Database connection failures

**Symptom:** Backend logs `ECONNREFUSED` or Prisma throws `Can't reach database server`.

- Verify the container is running: `docker ps --filter name=RealSaveFooding-postgres`
- Confirm `DATABASE_URL` in `back/.env` matches the Docker Compose credentials (`postgres:postgres@localhost:5432/RealSaveFooding`).
- Port `5432` may be in use by a local PostgreSQL instance — stop it or change the host port in `infra/docker/docker-compose.local.yml`.

### Missing environment variables

**Symptom:** NestJS fails to start or throws at runtime with `undefined` config values.

- Ensure `back/.env` exists and was copied from `back/.env.example`.
- Check that `JWT_SECRET` is not an empty string.

### Port conflicts

| Port | Service |
|------|---------|
| `5432` | PostgreSQL |
| `3000` | NestJS backend |
| `5173` | Vite frontend dev server |

Change the offending port in the relevant config file and update `VITE_API_BASE_URL` / `DATABASE_URL` accordingly.

### Failed migrations

**Symptom:** `prisma migrate dev` errors about an existing schema or dirty migration state.

```bash
# Reset the local database (destroys all data)
cd back && npx prisma migrate reset
```

### Frontend unable to reach the backend

**Symptom:** Network errors or 404 responses in the browser console.

- Confirm the backend is running: `curl http://localhost:3000/api/health`
- Check `VITE_API_BASE_URL` in `front/.env` (or confirm no `.env` exists and the default `http://localhost:3000/api` is correct).
- Ensure CORS is not blocked — the backend calls `app.enableCors()` with no restrictions in development mode.

### Playwright execution problems

**Symptom:** `browserType.launch` fails or tests time out immediately.

- Run `cd front && npm run playwright:install` to install the required browser binaries.
- Ensure the backend is running before starting Playwright tests.
- Use `--headed` flags to visually debug a failing test.
