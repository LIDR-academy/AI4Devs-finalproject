# Automated Production Deployment

TejaFlow deploys automatically from GitHub Actions when code is pushed to `main`.

## Pipeline Flow

1. Restore and build the backend.
2. Run backend tests.
3. Install and build the frontend.
4. Build ARM64 Docker images for Oracle Ampere.
5. Push images to GitHub Container Registry.
6. Upload `docker-compose.prod.yml` to `/opt/tejaflow` on the Oracle VPS.
7. Write `/opt/tejaflow/.env.production` from GitHub Secrets.
8. Pull the latest images on the VPS.
9. Run `docker compose up -d`.
10. Verify `http://127.0.0.1:8080/api/health`.

Deployment stops before production if build or tests fail.

Deployment fails after rollout if the health endpoint does not respond within 150 seconds.

## Manual Trigger

The workflow also supports manual execution from:

```text
GitHub -> Actions -> TejaFlow CI/CD -> Run workflow
```

## Required Server State

Before the first automatic deployment, the Oracle VPS must be bootstrapped:

```bash
sudo bash deploy/oracle/bootstrap-ubuntu.sh tejaflow.example.com
```

The bootstrap script creates `/opt/tejaflow`, installs Docker/Nginx/Certbot, and configures host-level reverse proxying.

## Health Check

The deployment validates the app through the same local frontend entrypoint used by host Nginx:

```bash
curl -fsS http://127.0.0.1:8080/api/health
```

If this fails, the workflow prints:

- `docker compose ps`
- recent logs for `api`, `frontend`, and `sqlserver`

## Roll Forward

The deployment strategy is roll-forward. Push a fix to `main` and GitHub Actions will build and redeploy the latest images.
