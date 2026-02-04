#!/bin/bash

# Script de backup automático para SIGQ
# Este script debe ejecutarse vía cron para backups programados

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$DOCKER_DIR/backups"
ENV_FILE="$DOCKER_DIR/.env.prod"
COMPOSE_FILE="$DOCKER_DIR/docker-compose.prod.yml"

cd "$DOCKER_DIR"

# Cargar variables de entorno
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
else
    echo "Error: No se encontró $ENV_FILE"
    exit 1
fi

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Configuración
RETENTION_DAILY=7    # Días a retener backups diarios
RETENTION_WEEKLY=30  # Días a retener backups semanales
RETENTION_MONTHLY=365 # Días a retener backups mensuales

# Determinar tipo de backup
DAY_OF_WEEK=$(date +%u)  # 1-7 (Lunes-Domingo)
DAY_OF_MONTH=$(date +%d) # 1-31

if [ "$DAY_OF_MONTH" = "01" ]; then
    BACKUP_TYPE="monthly"
    RETENTION=$RETENTION_MONTHLY
elif [ "$DAY_OF_WEEK" = "7" ]; then
    BACKUP_TYPE="weekly"
    RETENTION=$RETENTION_WEEKLY
else
    BACKUP_TYPE="daily"
    RETENTION=$RETENTION_DAILY
fi

# Nombre del archivo de backup
BACKUP_FILE="$BACKUP_DIR/backup_${BACKUP_TYPE}_$(date +%Y%m%d_%H%M%S).sql.gz"

echo "[$(date)] Iniciando backup ${BACKUP_TYPE}..."

# Crear backup
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres \
    pg_dump -U "${POSTGRES_USER:-sigq_user}" -d "${POSTGRES_DB:-sigq_db}" -F c | gzip > "$BACKUP_FILE"

if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "[$(date)] Backup creado exitosamente: $BACKUP_FILE (Tamaño: $SIZE)"
    
    # Limpiar backups antiguos
    find "$BACKUP_DIR" -name "backup_${BACKUP_TYPE}_*.sql.gz" -mtime +$RETENTION -delete
    echo "[$(date)] Limpieza de backups ${BACKUP_TYPE} completada (retención: ${RETENTION} días)"
else
    echo "[$(date)] ERROR: El backup no se creó correctamente"
    exit 1
fi

# Backup de MinIO (opcional)
if command -v mc &> /dev/null; then
    MINIO_BACKUP_DIR="$BACKUP_DIR/minio_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$MINIO_BACKUP_DIR"
    
    # Configurar cliente MinIO
    mc alias set sigq http://localhost:9000 "${MINIO_ROOT_USER:-minioadmin}" "${MINIO_ROOT_PASSWORD}" 2>/dev/null || true
    
    # Backup de buckets
    for bucket in imagenes-medicas documentos fotos-pre-postop; do
        mc mirror "sigq/$bucket" "$MINIO_BACKUP_DIR/$bucket" 2>/dev/null || echo "Bucket $bucket no encontrado o vacío"
    done
    
    if [ -d "$MINIO_BACKUP_DIR" ] && [ "$(ls -A $MINIO_BACKUP_DIR)" ]; then
        tar -czf "${MINIO_BACKUP_DIR}.tar.gz" -C "$BACKUP_DIR" "minio_$(date +%Y%m%d_%H%M%S)"
        rm -rf "$MINIO_BACKUP_DIR"
        echo "[$(date)] Backup de MinIO creado"
    fi
fi

echo "[$(date)] Proceso de backup completado"
