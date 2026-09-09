# GitHub Secrets

Configure these repository secrets in:

```text
GitHub repository -> Settings -> Secrets and variables -> Actions -> New repository secret
```

## Required Deployment Secrets

| Secret | Purpose | Example |
| --- | --- | --- |
| `ORACLE_HOST` | Oracle VPS public IP or DNS name. | `203.0.113.10` |
| `ORACLE_USER` | SSH user created on the VPS. | `ubuntu` |
| `ORACLE_SSH_PRIVATE_KEY` | Private key used by GitHub Actions to SSH into the VPS. | Contents of a deploy-only private key |
| `ORACLE_SSH_PORT` | SSH port. Optional if using `22`. | `22` |
| `MSSQL_SA_PASSWORD` | SQL Server `sa` password used by the container. | Generate a strong password |
| `TEJAFLOW_CONNECTION_STRING` | Backend production SQL Server connection string. | `Server=sqlserver,1433;Database=TejaFlow;User Id=sa;Password=...;TrustServerCertificate=True;Encrypt=True` |
| `JWT_ISSUER` | JWT issuer. | `TejaFlow` |
| `JWT_AUDIENCE` | JWT audience. | `TejaFlowSpa` |
| `JWT_SIGNING_KEY` | JWT signing key, at least 32 characters. | Generate a random key |
| `JWT_EXPIRATION_MINUTES` | Token lifetime in minutes. | `120` |
| `CORS_ALLOWED_ORIGIN` | Public frontend origin. | `https://tejaflow.example.com` |
| `TEJAFLOW_RUN_MIGRATIONS` | Whether API applies EF migrations on startup. | `true` |

Do not store real secret values in repository files.

## Generate Safe Values

Generate a JWT signing key:

```bash
openssl rand -base64 48
```

Generate a SQL Server password:

```bash
openssl rand -base64 32
```

SQL Server passwords must satisfy SQL Server complexity rules. If the generated password is rejected, use a longer value with uppercase, lowercase, digits, and symbols.

## SSH Key For Deployment

Create a deploy-only SSH key on your workstation:

```bash
ssh-keygen -t ed25519 -C "github-actions-tejaflow" -f tejaflow_deploy_key
```

Add the public key to the Oracle VPS:

```bash
ssh-copy-id -i tejaflow_deploy_key.pub ubuntu@YOUR_ORACLE_HOST
```

Store the private key contents in:

```text
ORACLE_SSH_PRIVATE_KEY
```

## GHCR Access

The workflow publishes images to GitHub Container Registry using `GITHUB_TOKEN`.

For private repositories, the deploy job also logs into GHCR on the VPS using the workflow token during deployment. No extra GHCR password secret is required for the current pipeline.

## Production Environment File

The workflow writes `/opt/tejaflow/.env.production` on the VPS during deployment. That file is generated from GitHub Secrets and must not be committed.

The committed files `.env.example` and `.env.production.example` contain placeholders only.
