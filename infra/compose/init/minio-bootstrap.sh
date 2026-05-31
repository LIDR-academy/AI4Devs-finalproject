#!/bin/sh
# Idempotente: crea el bucket de fotos. CORS para el navegador va por variables de entorno
# del servicio minio (MINIO_API_CORS_ALLOW_ORIGIN): en MinIO community no existe API CORS por bucket.
set -eu

ALIAS="mtl-minio"
ENDPOINT="http://minio:9000"
BUCKET="mtl-photos"

i=0
while ! mc alias set "${ALIAS}" "${ENDPOINT}" "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}" >/dev/null 2>&1; do
  i=$((i + 1))
  if [ "${i}" -ge 120 ]; then
    echo "minio-init: timeout esperando a MinIO en ${ENDPOINT}" >&2
    exit 1
  fi
  echo "minio-init: esperando a MinIO (${i}/120)..."
  sleep 1
done

mc mb "${ALIAS}/${BUCKET}" --ignore-existing
echo "minio-init: bucket ${BUCKET} listo."
