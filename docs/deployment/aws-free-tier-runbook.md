# AWS Free-Tier Deployment Runbook

Deploys the backend and frontend to a single AWS free-tier EC2 instance plus an RDS Postgres
instance, with CloudFront as the HTTPS entrypoint. Intended for a course demo running for a
semester, not long-term production use.

## Architecture

```
Teacher's browser
   │  https
   ▼
CloudFront distribution        ← single HTTPS entrypoint, path-based routing:
   │                              /api/*  → backend origin (port 3000, caching disabled)
   │                              default → frontend origin (port 4173)
   ▼
EC2 t3.micro (Elastic IP)
   ├── Docker: nestjs-api      (port 3000)
   └── Docker: frontend-ssr    (Nitro node-server, port 4173)
   │  TCP 5432, security-group-to-security-group only
   ▼
RDS PostgreSQL (private, not publicly accessible)
```

Both the backend and the frontend must run as persistent Node processes (the backend has
`setInterval`-based schedulers; TanStack Start's build always needs a Nitro server to render the
initial HTML, even though this app has no functional SSR data-loading dependency) — hence two
containers on one EC2 box rather than a static frontend host.

## Gotchas

1. **SES sandbox mode** — a new SES account can only send to/from verified addresses until
   "production access" is requested. Verify each teacher's email in the SES Console ahead of the
   demo, or request production access early (can take a day+ to be granted).
2. **AWS's 12-months-free clock is account-wide and per-account, not per-project.** On an account
   older than 12 months, EC2 and RDS are billed at standard on-demand rates — for this architecture
   (t3.micro EC2 + db.t4g.micro RDS running 24/7) that's roughly **$21/month** (~$7.50 EC2 + ~$14
   RDS incl. storage), plus the IPv4 charge below. CloudFront's free tier is "Always Free" and is
   not affected by account age. Confirm your account's age in Billing → Free Tier before budgeting.
3. **Public IPv4 addresses are billed separately from the EC2 free tier** (since Feb 2024,
   ~$0.005/hr per address, Elastic IP or not, regardless of account age) — roughly $3.65/month,
   unavoidable since the backend must be internet-reachable. Combined with gotcha #2, budget
   **~$25/month (~$100 for a 4-month semester)** on an account past its free-tier window.
4. **`VITE_*` env vars are baked into the frontend at build time**, not read at container runtime —
   the frontend image must be (re)built after you know the CloudFront domain.
5. **EC2 needs an Elastic IP** so the CloudFront origin doesn't break on every instance stop/start
   (already provisioned by the Terraform below).
6. Never open Postgres (5432) to `0.0.0.0/0` — the Terraform's RDS security group only allows the
   EC2 security group, not a CIDR.
7. **First RDS instance in an account** requires the `AWSServiceRoleForRDS` service-linked role to
   exist; the least-privilege deploy user deliberately can't create it (bootstrapping it is an
   elevated, one-time, account-wide action). Run once, using a more privileged identity (root/admin,
   e.g. via CloudShell): `aws iam create-service-linked-role --aws-service-name rds.amazonaws.com`.
8. **RDS engine minor versions get deprecated** — if `terraform apply` errors with
   `Cannot find version X.Y for postgres`, check currently available versions with
   `aws rds describe-db-engine-versions --engine postgres --query 'DBEngineVersions[].EngineVersion'`
   and update `rds_engine_version` in `terraform.tfvars` (or the default in `variables.tf`).
9. **S3 bucket names must be all-lowercase** — `var.project_name` (`RealSaveFooding`) is mixed case,
   so bucket-naming resources must wrap it in `lower(...)` (already done in `main.tf`).

## Steps

### A. AWS account hygiene
1. Confirm the account's free-tier age in Billing → Free Tier.
2. Create a ~$30/month AWS Budget with 50/80/100% email alerts (sized for the ~$25/month realistic
   cost on accounts past the free-tier window — see Gotcha #2/#3 above).
3. Create an IAM deploy user (not root) with least-privilege access (EC2, RDS, VPC/SG, IAM
   PassRole to the instance role only, S3, SNS, CloudFront scoped to this project) for running
   Terraform from your machine.
4. Confirm root MFA is enabled; use the deploy user for the rest of this runbook.

### B. Provision infrastructure with Terraform
Terraform lives in `infra/terraform/envs/prod/`.

1. In the AWS Console, create an EC2 key pair for SSH access; note its name.
2. `cp infra/terraform/envs/prod/terraform.tfvars.example infra/terraform/envs/prod/terraform.tfvars`
   and fill in `admin_cidr` (your current public IP, as `x.x.x.x/32`), `ec2_key_name` (from step 1),
   and `db_password`. This file is gitignored — never commit it.
3. `cd infra/terraform/envs/prod && terraform init && terraform plan` — review the plan (RDS, EC2 +
   Elastic IP, 2 security groups, IAM role/instance profile, S3 bucket, SNS topic, CloudFront
   distribution).
4. `terraform apply` — this is the step that starts incurring AWS usage; run it deliberately.
   EC2's `user_data` installs Docker automatically on first boot.
5. `terraform output` — note `ec2_public_ip`, `rds_endpoint`, and `cloudfront_domain`.

### C. Build and deploy the app containers
1. Build the backend image: `docker build -t realsavefooding-api:latest ./back`.
2. Build the frontend image, now that the CloudFront domain is known:
   ```
   docker build \
     --build-arg VITE_API_BASE_URL=https://<cloudfront_domain>/api \
     --build-arg VITE_VAPID_PUBLIC_KEY=<your VAPID public key> \
     -t realsavefooding-front:latest ./front
   ```
3. Transfer both images to the EC2 box (no ECR needed for a low-frequency solo deploy):
   `docker save realsavefooding-api:latest realsavefooding-front:latest | ssh ubuntu@<ec2_public_ip> docker load`.
4. On the box, create `/opt/realsavefooding/back.env` (mode 600) from `back/.env.example`'s
   variable names, using `DATABASE_URL=postgresql://<user>:<pass>@<rds_endpoint>/<db>?sslmode=require`
   and leaving `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` blank (the EC2 instance role supplies
   credentials automatically). Copy `infra/docker/docker-compose.prod.yml` there too.
5. `docker compose -f docker-compose.prod.yml up -d`.
6. Sanity check: `curl http://<ec2_public_ip>:3000/api/health` → `{"status":"ok"}`;
   `curl http://<ec2_public_ip>:4173/` → 200 with HTML.

### D. Run database migrations
1. `docker compose exec api npx prisma migrate deploy`, then `npx prisma migrate status` to confirm.
2. Seed minimal demo data if `back/prisma/` has a seed script.

### E. Verification
1. `curl -I https://<cloudfront_domain>/api/health` → 200.
2. In a real browser: register/log in, upload a receipt (exercises S3 + Textract via the EC2
   instance role), trigger a notification (SES/web-push), refresh a deep link (e.g. `/pantry`) to
   confirm the frontend's own SSR server handles routing correctly.
3. `docker compose logs -f api` for a couple of minutes to confirm the 60s notification scheduler
   and daily cron jobs are actually running.
4. Update the Project URL in `readme.md` with the live `cloudfront_domain`.

### Recommended: automate step C locally with `./prod.sh app-deploy`
`./prod.sh app-deploy` (or `make app-deploy`) automates all of step C exactly the way it was done
for the first real deploy: packages `back/`/`front/` source, builds both images **natively on the
EC2 box** (not cross-built locally — see Lesson 3 below), temporarily resizes to `t3.small` only
for the frontend build then back to `t3.micro`, writes `back.env` from Terraform outputs +
`infra/docker/prod.secrets.env` (auto-generated on first run if missing), deploys both containers,
and runs `prisma migrate deploy`. Prerequisites: the SSH-over-SSM setup in Lesson 1 below (alias
`realsavefooding-prod` in `~/.ssh/config`, `session-manager-plugin` installed).

### `.github/workflows/deploy.yml` (not currently usable as-is)
This workflow predates the lessons below: it assumes plain SSH (port 22) to the box, which this
network's corporate proxy blocks, and the EC2 security group only allows SSH from `admin_cidr`
(your IP), not GitHub Actions' dynamic runner IPs. It would need reworking to either open the
security group further for CI or use SSM-based deployment (like `prod.sh app-deploy` does) before
it's actually usable. Building on GitHub's own runners wouldn't hit the arm64/Bun-under-QEMU issue
(their runners are already amd64), but the transport step needs fixing first.

### Tear-down (end of semester)
`terraform destroy` from `infra/terraform/envs/prod` removes everything provisioned in step B in
one go.

## Lessons from the first real deploy (read before redeploying)

1. **Corporate networks may block outbound SSH (port 22)** (e.g. Zscaler proxies). If plain
   `ssh ubuntu@<ip>` gets intercepted/closed, use SSH-over-SSM instead: install
   `session-manager-plugin` (`brew install --cask session-manager-plugin`), add an `~/.ssh/config`
   entry with `HostName <instance-id>` and
   `ProxyCommand sh -c "aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters 'portNumber=%p' --region eu-west-1"`,
   then `ssh <alias>` works normally. Requires the EC2 role to have SSM permissions (already added
   as an inline policy in `main.tf`, see `aws_iam_role_policy.ec2_ssm`) **and** the calling IAM
   user/deploy identity to have `ssm:StartSession`/`ssm:TerminateSession`/`ssm:DescribeInstanceInformation`
   — not included in the deploy user's original least-privilege policy, added as a one-time
   elevated step.
2. **First RDS instance in a fresh account** needs someone with elevated privileges (not the
   scoped deploy user) to run
   `aws iam create-service-linked-role --aws-service-name rds.amazonaws.com` once.
3. **Building on Apple Silicon (arm64) produces the wrong architecture** for a `t3.*` EC2 instance
   (x86_64). `docker build --platform linux/amd64 ...` fixes this for the backend (plain
   Node/npm), but **the frontend's Bun-based build reliably segfaults under QEMU emulation** — this
   isn't a config bug, Bun's build crashes when emulated. The fix is to build the frontend image
   natively on the target (the EC2 box itself, or any real amd64 machine/CI runner), not
   cross-build it from an arm64 laptop.
4. **A t3.micro's 1GB RAM is not enough to build the frontend natively**, even with a 2GB swapfile
   added (`sudo fallocate -l 2G /swapfile && ...`) — it thrashes on swap and makes no forward
   progress rather than crashing outright. Temporarily resize the instance for the build only:
   stop it, `aws ec2 modify-instance-attribute --instance-type '{"Value":"t3.small"}'`, start it,
   build (2GB RAM was sufficient, build finished in under a minute), then resize back to
   `t3.micro` afterward the same way. Don't forget the downsize step — it's easy to leave it
   running on the larger, non-free-tier-priced type by accident.
5. **The default 8GB root EBS volume fills up fast** across a few build attempts (BuildKit cache +
   old image layers). Run `sudo docker builder prune -af` to free space. **Do not run
   `docker image prune -a` while no containers are running** — with nothing referencing them, it
   will delete your just-built app images too (this happened during the first deploy and cost an
   extra rebuild cycle).
6. **Don't parse `terraform.tfvars` values with shell `sed`/regex** to reconstruct connection
   strings — a `\s`-in-BSD-sed portability issue silently produced a mangled 41-character password
   instead of the real 24-character one, and the resulting `DATABASE_URL` caused a confusing
   `PrismaClientInitializationError: Authentication failed` that looked like an RDS/credentials
   problem but wasn't. Parse the file with a real parser (e.g. `node -e "..."` reading the file and
   regex-extracting via a JS string, or just `terraform output`-style tooling) instead.
7. **After a stop/start or `reboot-instances`, `/tmp` is cleared** but the Docker data directory
   (loaded images, volumes) persists on the EBS root volume — expect to re-transfer source
   tarballs/build context, but not to lose already-built/loaded images.
