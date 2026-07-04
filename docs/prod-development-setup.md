# Production (AWS) Deployment Setup

## 1. Overview

RealSaveFooding's production deployment runs on AWS free-tier-shaped infrastructure, provisioned
entirely with Terraform and operated with two helper scripts (`prod.sh` / `Makefile`):

| Component | Where | Technology | Responsibility |
|-----------|-------|------------|-----------------|
| **CloudFront** | AWS (global) | CloudFront distribution | Single HTTPS entrypoint, path-based routing |
| **Backend** | EC2 (container) | NestJS in Docker, port 3000 | REST API, business logic, AWS integrations |
| **Frontend** | EC2 (container) | TanStack Start (Nitro `node-server`) in Docker, port 4173 | SSR app server |
| **Database** | RDS | PostgreSQL | Persistent data storage (private, not publicly accessible) |

```
Browser
   │ https
   ▼
CloudFront          /api/* → backend:3000 (caching disabled)
   │                default → frontend:4173
   ▼
EC2 t3.micro (Elastic IP)
   ├── Docker: realsavefooding-api
   └── Docker: realsavefooding-front
   │ TCP 5432, security-group-to-security-group only
   ▼
RDS PostgreSQL (private)
```

Both the backend and frontend run as persistent Node processes on the same EC2 instance — there is
no serverless/Lambda component and no static-hosted frontend (TanStack Start's build requires its
own Nitro server to render HTML, even though the app has no functional SSR data-loading need).

For the full first-time provisioning walkthrough (AWS account hygiene, IAM setup, gotchas
encountered) see **`docs/deployment/aws-free-tier-runbook.md`**. This document is the day-to-day
reference once that initial setup is done.

---

## 2. Prerequisites

| Tool | Notes |
|------|-------|
| AWS CLI v2 | `brew install awscli`; configure with the IAM deploy user's keys (`aws configure`) |
| Terraform ≥ 1.6 | Manages `infra/terraform/envs/prod/` |
| Docker | Used to build images (though the frontend must be built **natively on the EC2 box**, not cross-built locally — see §7 Troubleshooting) |
| `session-manager-plugin` | `brew install --cask session-manager-plugin` — needed for SSH-over-SSM |
| SSH-over-SSM config | An `~/.ssh/config` entry aliasing the instance (see below) |

> **Why SSH-over-SSM instead of plain SSH?** Some networks (corporate proxies like Zscaler) block
> outbound port 22. SSM tunnels over HTTPS instead, which almost always works. The alias used
> throughout this doc and in `prod.sh` is `realsavefooding-prod`.

`~/.ssh/config` entry (replace `<instance-id>` with the `ec2_instance_id` Terraform output):

```
Host realsavefooding-prod
  HostName <instance-id>
  User ubuntu
  IdentityFile ~/.ssh/realsavefooding-prod.pem
  ProxyCommand sh -c "aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters 'portNumber=%p' --region eu-west-1"
```

---

## 3. Environment Configuration

### Terraform variables — `infra/terraform/envs/prod/terraform.tfvars`

Gitignored (never commit). Copy from the example and fill in:

```bash
cp infra/terraform/envs/prod/terraform.tfvars.example infra/terraform/envs/prod/terraform.tfvars
```

| Variable | Purpose |
|----------|---------|
| `admin_cidr` | Your current public IP (`x.x.x.x/32`) — allowed to SSH into the EC2 security group |
| `ec2_key_name` | Name of an EC2 key pair you created for SSH access |
| `db_password` | RDS master password |

### App secrets — `infra/docker/prod.secrets.env`

Gitignored. Holds values that must stay **stable across redeploys** — regenerating them
invalidates existing sessions/push subscriptions. `./prod.sh app-deploy` auto-generates this file
on first run if it doesn't exist yet.

```dotenv
JWT_SECRET=<openssl rand -base64 48>
VAPID_PUBLIC_KEY=<from web-push generateVAPIDKeys()>
VAPID_PRIVATE_KEY=<from web-push generateVAPIDKeys()>
VAPID_SUBJECT=mailto:you@example.com
AWS_SES_FROM_ADDRESS=you@example.com
```

> `AWS_SES_FROM_ADDRESS` must be an address you can actually verify in SES (SES sandbox mode only
> sends to/from verified identities) — don't use a domain you don't own.

### Backend runtime env — `/opt/realsavefooding/back.env` (on the EC2 box)

Generated automatically by `./prod.sh app-deploy` from Terraform outputs + `prod.secrets.env` —
you shouldn't need to hand-edit this. Notably, `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` are
**intentionally left unset**: the EC2 instance's IAM role supplies AWS credentials automatically
via the SDK's default credential provider chain.

### Frontend build-time env

`VITE_API_BASE_URL` and `VITE_VAPID_PUBLIC_KEY` are baked into the frontend bundle **at Docker
build time** (Vite convention), not read at container runtime. `app-deploy` passes these as
`--build-arg`s automatically using the live `cloudfront_domain` Terraform output — this is why the
frontend image must be (re)built after the CloudFront domain is known, and why editing
`VITE_API_BASE_URL` requires a rebuild, not just a container restart.

---

## 4. Infrastructure Setup (Terraform)

```bash
make deploy
# equivalent to: ./prod.sh deploy → (cd infra/terraform/envs/prod && terraform apply)
```

Provisions: RDS Postgres, EC2 + Elastic IP, 2 security groups, IAM role/instance profile, S3
bucket, SNS topic, CloudFront distribution. Review the plan before confirming — this is the step
that starts real AWS billing (~$25/month on an account past its 12-month free-tier window; see the
runbook for the cost breakdown).

**Outputs** (`cd infra/terraform/envs/prod && terraform output`):

| Output | Used for |
|--------|----------|
| `ec2_instance_id` | SSH-over-SSM target, temporary resize during builds |
| `ec2_public_ip` / `ec2_public_dns` | Direct box access |
| `cloudfront_domain` | Public app URL, `VITE_API_BASE_URL` |
| `rds_endpoint` | `DATABASE_URL` host:port |
| `s3_receipts_bucket` | `AWS_S3_BUCKET` |
| `sns_topic_arn` | `AWS_SNS_TOPIC_ARN` |

---

## 5. Application Deployment

```bash
make app-deploy
# equivalent to: ./prod.sh app-deploy
```

This single command:
1. Packages `back/` and `front/` source (excluding `node_modules`/`dist`/`.output`).
2. Builds the backend image **natively on the EC2 box** (fast, plain npm/Node build).
3. Temporarily resizes the instance to `t3.small` (2GB RAM) and builds the frontend image natively
   there too — the Bun/Vite build needs more memory than `t3.micro` has, and reliably **segfaults
   under QEMU emulation** if cross-built from an Apple Silicon machine, so it must be built on a
   real amd64 host.
4. Resizes back down to `t3.micro` for steady-state running.
5. Writes `back.env` (from Terraform outputs + `prod.secrets.env`) and deploys both containers via
   `docker compose -f docker-compose.prod.yml up -d --force-recreate`.
6. Runs `prisma migrate deploy` against RDS.
7. Sanity-checks both endpoints, locally on the box and through the public CloudFront URL.

Run this whenever backend or frontend code changes and needs to reach production.

---

## 6. Verification

```bash
curl -I https://<cloudfront_domain>/api/health   # expect 200
curl -I https://<cloudfront_domain>/             # expect 200, HTML
```

On the box (`ssh realsavefooding-prod`):

```bash
sudo docker ps -a                                  # both containers should show "Up"
sudo docker logs RealSaveFooding-api --tail 30      # check for DB connection / startup errors
sudo docker logs RealSaveFooding-frontend --tail 30
sudo docker compose -f /opt/realsavefooding/docker-compose.prod.yml logs -f api   # confirm the 60s notification scheduler is running
```

In a real browser: register/log in, upload a receipt (exercises S3 + Textract via the EC2 instance
role), trigger a notification (SES/web-push), refresh a deep link (e.g. `/pantry`) to confirm the
frontend's own SSR server handles routing.

---

## 7. Troubleshooting

### `PrismaClientInitializationError: Authentication failed`

**Symptom:** backend container restarts, logs show a Prisma auth error against RDS.

- Almost certainly a `DATABASE_URL` password mismatch. Never hand-parse `terraform.tfvars` with
  `sed`/shell regex to reconstruct it — a macOS/BSD `sed` `\s` portability bug once produced a
  41-character mangled password instead of the real 24-character one. `prod.sh` parses it with a
  small `node -e` script instead; if you're building `back.env` by hand, do the same.

### `exec /usr/local/bin/docker-entrypoint.sh: exec format error`

**Symptom:** container immediately crash-loops after `docker compose up -d`.

- Architecture mismatch — the image was built for `arm64` (default on Apple Silicon) but the EC2
  box is `amd64`. Rebuild with `--platform linux/amd64`, or (for the frontend specifically) build
  natively on the box — `app-deploy` already does this correctly.

### Frontend build segfaults / "Bun has crashed"

**Symptom:** `docker build` for `front/` panics with a segmentation fault when run via
`--platform linux/amd64` on an Apple Silicon machine.

- This is a real Bun limitation under QEMU emulation, not a config bug. Build the frontend image
  natively on amd64 hardware instead (the EC2 box itself, or CI). `app-deploy` handles this.

### Frontend build hangs / thrashes without crashing

**Symptom:** `docker build` for `front/` makes no progress for many minutes; `free -h` shows heavy
swap usage.

- `t3.micro`'s 1GB RAM isn't enough even with a swapfile. `app-deploy` temporarily resizes to
  `t3.small` for this build and back down afterward — don't try to force the frontend build on
  `t3.micro`.

### `No space left on device` during a build

**Symptom:** `apk add`/`bun install`/`npm ci` fails partway with a disk-space error.

- The default 8GB root EBS volume fills up fast across repeated build attempts. Free space with
  `sudo docker builder prune -af`. **Do not run `docker image prune -a`** while no containers are
  running — with nothing referencing them, it deletes your already-built app images too.

### SSH just hangs or gets intercepted

**Symptom:** `ssh ubuntu@<ip>` connects but immediately closes, or shows a corporate proxy banner
(e.g. Zscaler "Not allowed to use HTTP tunnel").

- Your network is blocking outbound port 22. Use the SSH-over-SSM alias (§2) instead of a direct
  IP-based SSH connection.

### SSM session won't start after a reboot/resize

**Symptom:** `aws ssm describe-instance-information` shows `ConnectionLost` or stale `PingStatus`
for a while after a stop/start or reboot.

- Normal — give it 1–2 minutes for cloud-init and the SSM agent to come back up, then retry. If
  it's been much longer, check `aws ec2 describe-instance-status` for the underlying instance
  health before assuming something is broken.

### Tear-down

```bash
make destroy
# equivalent to: ./prod.sh destroy → (cd infra/terraform/envs/prod && terraform destroy)
```

Removes everything Terraform created (RDS, EC2, EIP, security groups, IAM role, S3 bucket, SNS
topic, CloudFront distribution) in one go. Not removed (created manually, zero ongoing cost): the
default VPC and the EC2 key pair.
