#!/usr/bin/env bash
set -euo pipefail

# Generate localhost certs using mkcert for Vite HTTPS dev

CERT_DIR="${1:-/Users/admin/Documents/AI4Devs-finalproject/Frontend/certs}"
mkdir -p "$CERT_DIR"

if ! command -v mkcert >/dev/null 2>&1; then
  echo "mkcert no está instalado. Instálalo con:"
  echo "  brew install mkcert nss"
  echo "Luego ejecuta de nuevo este script."
  exit 1
fi

# Create local CA if needed
mkcert -install

pushd "$CERT_DIR" >/dev/null
mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1 ::1
popd >/dev/null

echo "Certificados generados en: $CERT_DIR"
echo "Para usar HTTPS en Vite, exporta:"
echo "  export VITE_HTTPS=true"
echo "  export VITE_HTTPS_CERT_DIR=$CERT_DIR"
echo "o especifica rutas con VITE_HTTPS_KEY y VITE_HTTPS_CERT"

