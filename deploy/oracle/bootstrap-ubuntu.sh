#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-tejaflow.example.com}"
APP_DIR="${APP_DIR:-/opt/tejaflow}"
DEPLOY_USER="${DEPLOY_USER:-ubuntu}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this script with sudo."
  exit 1
fi

apt-get update
apt-get install -y ca-certificates curl gnupg nginx certbot python3-certbot-nginx ufw

install -m 0755 -d /etc/apt/keyrings
if [[ ! -f /etc/apt/keyrings/docker.gpg ]]; then
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
fi

if [[ ! -f /etc/apt/sources.list.d/docker.list ]]; then
  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" > /etc/apt/sources.list.d/docker.list
fi

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

usermod -aG docker "${DEPLOY_USER}"
systemctl enable --now docker
systemctl enable --now nginx

mkdir -p "${APP_DIR}"
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${APP_DIR}"

ufw allow OpenSSH
ufw allow "Nginx Full"
ufw --force enable

cat >/etc/nginx/sites-available/tejaflow <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/tejaflow /etc/nginx/sites-enabled/tejaflow
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "Bootstrap complete for ${DOMAIN}."
echo "Copy deploy/docker/docker-compose.prod.yml and .env.production to ${APP_DIR}."
echo "Run certbot after DNS points to this server: sudo certbot --nginx -d ${DOMAIN}"
