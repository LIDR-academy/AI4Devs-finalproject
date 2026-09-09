# Oracle Cloud Deployment

This guide targets an Oracle Cloud Free Tier Ubuntu VPS.

## Recommended VPS Shape

- Oracle Ampere A1 or equivalent ARM VM.
- 2-3 OCPU when available.
- 8-12 GB RAM when available.
- Ubuntu 22.04 or 24.04 LTS.
- Public ports: `22`, `80`, `443`.
- Database port `1433` must remain private inside Docker.

## Oracle Security List

Allow inbound traffic only for:

- SSH: TCP `22` from trusted IPs when possible.
- HTTP: TCP `80` from `0.0.0.0/0`.
- HTTPS: TCP `443` from `0.0.0.0/0`.

Do not expose SQL Server port `1433`.

## Bootstrap Server

Run this once after creating the VM:

```bash
sudo bash deploy/oracle/bootstrap-ubuntu.sh tejaflow.example.com
```

The script installs Docker, Docker Compose, Nginx, Certbot, enables UFW, and configures Nginx to reverse proxy to the frontend container on `127.0.0.1:8080`.

## Production Files

Copy these files to `/opt/tejaflow` on the VPS:

```text
deploy/docker/docker-compose.prod.yml
deploy/docker/.env.production.example
```

Create the production environment file:

```bash
cp .env.production.example .env.production
```

Update:

- `FRONTEND_IMAGE`
- `API_IMAGE`
- `MSSQL_SA_PASSWORD`
- `TEJAFLOW_CONNECTION_STRING`
- `JWT_SIGNING_KEY`
- `CORS_ALLOWED_ORIGIN`

For GitHub Actions deployment secrets, see [GitHub Secrets](github-secrets.md).

For the automated production rollout, see [Automated Production Deployment](automated-production-deployment.md).

## Start Production Stack

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

The API runs EF Core migrations on startup when:

```text
TEJAFLOW_RUN_MIGRATIONS=true
```

## HTTPS

After DNS points to the Oracle public IP:

```bash
sudo certbot --nginx -d tejaflow.example.com
```

Certbot will update Nginx for TLS and automatic HTTP-to-HTTPS redirects.

## Operations

Check containers:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

Check logs:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f api
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f frontend
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f sqlserver
```
