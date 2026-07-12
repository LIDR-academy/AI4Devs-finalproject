#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
TF_DIR="$ROOT/infra/terraform/envs/prod"
DOCKER_DIR="$ROOT/infra/docker"
SECRETS_FILE="$DOCKER_DIR/prod.secrets.env"
SSH_ALIAS="realsavefooding-prod"
AWS_REGION="eu-west-1"
BUILD_INSTANCE_TYPE="t3.small"   # temporary size while building the frontend (needs ~2GB RAM)
RUN_INSTANCE_TYPE="t3.micro"     # steady-state size (free-tier eligible)

usage() {
  echo "Usage: $0 {deploy|destroy|app-deploy}"
  echo "  deploy      - terraform apply (provisions/updates the AWS prod infra)"
  echo "  destroy     - terraform destroy (tears down the AWS prod infra)"
  echo "  app-deploy  - build the app images on the EC2 box and deploy containers + migrations"
  echo "                (see docs/deployment/aws-free-tier-runbook.md for prerequisites: SSH-over-SSM"
  echo "                config alias '$SSH_ALIAS', session-manager-plugin installed)"
  exit 1
}

tf_output() {
  (cd "$TF_DIR" && terraform output -raw "$1")
}

ssh_box() {
  ssh -o ConnectTimeout=15 "$SSH_ALIAS" "$@"
}

wait_for_ssm() {
  local instance_id="$1"
  echo "Waiting for instance to boot and register with SSM..."
  for _ in $(seq 1 20); do
    if ssh_box "echo OK" >/dev/null 2>&1; then
      echo "Reachable."
      return 0
    fi
    sleep 10
  done
  echo "ERROR: instance did not become reachable over SSH-over-SSM in time." >&2
  return 1
}

resize_instance() {
  local instance_id="$1" new_type="$2"
  echo "Resizing $instance_id to $new_type..."
  aws ec2 stop-instances --region "$AWS_REGION" --instance-ids "$instance_id" >/dev/null
  aws ec2 wait instance-stopped --region "$AWS_REGION" --instance-ids "$instance_id"
  aws ec2 modify-instance-attribute --region "$AWS_REGION" --instance-id "$instance_id" \
    --instance-type "{\"Value\": \"$new_type\"}" >/dev/null
  aws ec2 start-instances --region "$AWS_REGION" --instance-ids "$instance_id" >/dev/null
  aws ec2 wait instance-running --region "$AWS_REGION" --instance-ids "$instance_id"
  wait_for_ssm "$instance_id"
}

ensure_secrets_file() {
  if [[ -f "$SECRETS_FILE" ]]; then
    return 0
  fi
  echo "No $SECRETS_FILE found — generating one (JWT secret + VAPID keys)."
  echo "This only runs once per environment: regenerating these later invalidates existing"
  echo "JWTs/push subscriptions, so this file is precious — back it up somewhere durable."
  local jwt_secret vapid_public vapid_private
  jwt_secret=$(openssl rand -base64 48 | tr -d '\n')
  local vapid_json
  vapid_json=$(cd "$ROOT/back" && node -e "console.log(JSON.stringify(require('web-push').generateVAPIDKeys()))")
  vapid_public=$(node -e "console.log(JSON.parse(process.argv[1]).publicKey)" "$vapid_json")
  vapid_private=$(node -e "console.log(JSON.parse(process.argv[1]).privateKey)" "$vapid_json")
  cat > "$SECRETS_FILE" <<EOF
JWT_SECRET=${jwt_secret}
VAPID_PUBLIC_KEY=${vapid_public}
VAPID_PRIVATE_KEY=${vapid_private}
VAPID_SUBJECT=mailto:CHANGE-ME@example.com
AWS_SES_FROM_ADDRESS=CHANGE-ME@example.com
EOF
  chmod 600 "$SECRETS_FILE"
  echo "Wrote $SECRETS_FILE — edit VAPID_SUBJECT/AWS_SES_FROM_ADDRESS before continuing if the"
  echo "placeholders don't suit you (the from-address must be verifiable in SES)."
}

# Reads a quoted string value out of terraform.tfvars without relying on shell regex
# (a `sed`-with-\s portability bug here once produced a mangled DB password).
tfvar_value() {
  node -e "
    const fs = require('fs');
    const content = fs.readFileSync(process.argv[2], 'utf8');
    const re = new RegExp(process.argv[1] + '\\\\s*=\\\\s*\"([^\"]*)\"');
    const m = content.match(re);
    if (!m) { process.exit(1); }
    process.stdout.write(m[1]);
  " "$1" "$TF_DIR/terraform.tfvars"
}

app_deploy() {
  ensure_secrets_file

  echo "Reading Terraform outputs..."
  local instance_id cloudfront_domain rds_endpoint s3_bucket sns_arn
  instance_id=$(tf_output ec2_instance_id)
  cloudfront_domain=$(tf_output cloudfront_domain)
  rds_endpoint=$(tf_output rds_endpoint)
  s3_bucket=$(tf_output s3_receipts_bucket)
  sns_arn=$(tf_output sns_topic_arn)
  local db_name db_username db_password
  db_name=$(tfvar_value db_name 2>/dev/null || echo "RealSaveFooding")
  db_username=$(tfvar_value db_username 2>/dev/null || echo "realsavefooding")
  db_password=$(tfvar_value db_password)

  echo "Instance: $instance_id"
  echo "CloudFront: $cloudfront_domain"

  if ! ssh_box "echo OK" >/dev/null 2>&1; then
    echo "ERROR: cannot reach '$SSH_ALIAS' over SSH-over-SSM." >&2
    echo "See docs/deployment/aws-free-tier-runbook.md for the ~/.ssh/config + session-manager-plugin setup." >&2
    exit 1
  fi

  echo "Packaging source..."
  tar --exclude='node_modules' --exclude='dist' -czf /tmp/rsf-back-src.tar.gz -C "$ROOT" back
  tar --exclude='node_modules' --exclude='dist' --exclude='.output' --exclude='test-results' \
    --exclude='playwright-report' -czf /tmp/rsf-front-src.tar.gz -C "$ROOT" front

  echo "Transferring source and building backend natively (no resize needed)..."
  scp /tmp/rsf-back-src.tar.gz "$SSH_ALIAS:/tmp/back-src.tar.gz"
  ssh_box "rm -rf /tmp/build && mkdir -p /tmp/build && tar -xzf /tmp/back-src.tar.gz -C /tmp/build"
  ssh_box "cd /tmp/build/back && sudo docker builder prune -af >/dev/null && sudo docker build -t realsavefooding-api:latest ."

  echo "Resizing to $BUILD_INSTANCE_TYPE to build the frontend (Bun/Vite needs ~2GB RAM)..."
  resize_instance "$instance_id" "$BUILD_INSTANCE_TYPE"

  echo "Transferring frontend source and building natively..."
  scp /tmp/rsf-front-src.tar.gz "$SSH_ALIAS:/tmp/front-src.tar.gz"
  ssh_box "rm -rf /tmp/build && mkdir -p /tmp/build && tar -xzf /tmp/front-src.tar.gz -C /tmp/build"
  # shellcheck source=/dev/null
  set -a; source "$SECRETS_FILE"; set +a
  ssh_box "cd /tmp/build/front && sudo docker builder prune -af >/dev/null && sudo docker build --build-arg VITE_API_BASE_URL=${cloudfront_domain}/api --build-arg VITE_VAPID_PUBLIC_KEY=${VAPID_PUBLIC_KEY} -t realsavefooding-front:latest ."

  echo "Resizing back down to $RUN_INSTANCE_TYPE..."
  resize_instance "$instance_id" "$RUN_INSTANCE_TYPE"

  echo "Writing back.env and deploying containers..."
  cat > /tmp/rsf-back.env <<EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://${db_username}:${db_password}@${rds_endpoint}/${db_name}?sslmode=require
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=1d
AWS_REGION=${AWS_REGION}
AWS_S3_BUCKET=${s3_bucket}
AWS_SNS_TOPIC_ARN=${sns_arn}
AWS_SES_FROM_ADDRESS=${AWS_SES_FROM_ADDRESS}
VAPID_PUBLIC_KEY=${VAPID_PUBLIC_KEY}
VAPID_PRIVATE_KEY=${VAPID_PRIVATE_KEY}
VAPID_SUBJECT=${VAPID_SUBJECT}
EOF
  chmod 600 /tmp/rsf-back.env
  scp /tmp/rsf-back.env "$SSH_ALIAS:/tmp/back.env"
  scp "$DOCKER_DIR/docker-compose.prod.yml" "$SSH_ALIAS:/tmp/docker-compose.prod.yml"
  ssh_box "sudo mkdir -p /opt/realsavefooding && sudo mv /tmp/back.env /opt/realsavefooding/back.env && sudo chmod 600 /opt/realsavefooding/back.env && sudo mv /tmp/docker-compose.prod.yml /opt/realsavefooding/docker-compose.prod.yml"
  rm -f /tmp/rsf-back.env /tmp/rsf-back-src.tar.gz /tmp/rsf-front-src.tar.gz

  ssh_box "cd /opt/realsavefooding && sudo docker compose -f docker-compose.prod.yml up -d --force-recreate"

  echo "Running database migrations..."
  ssh_box "cd /opt/realsavefooding && sudo docker compose -f docker-compose.prod.yml exec -T api npx prisma migrate deploy"

  echo "Sanity check..."
  ssh_box "curl -s -o /dev/null -w 'backend (local):  %{http_code}\n' http://localhost:3000/api/health"
  ssh_box "curl -s -o /dev/null -w 'frontend (local): %{http_code}\n' http://localhost:4173/"
  curl -s -o /dev/null -w 'backend (public):  %{http_code}\n' "${cloudfront_domain}/api/health"
  curl -s -o /dev/null -w 'frontend (public): %{http_code}\n' "${cloudfront_domain}/"

  echo "Done. App URL: $cloudfront_domain"
}

[[ $# -eq 1 ]] || usage

case "$1" in
  deploy)
    (cd "$TF_DIR" && terraform apply)
    ;;
  destroy)
    (cd "$TF_DIR" && terraform destroy)
    ;;
  app-deploy)
    app_deploy
    ;;
  *)
    usage
    ;;
esac
