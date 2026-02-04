#!/bin/bash

# Script de backup manual de la base de datos PostgreSQL
# Uso: ./backup-database.sh [tipo]
# Tipos: manual, daily, weekly

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$SCRIPT_DIR/../backups}"
TYPE="${1:-manual}"

# Cargar variables de entorno
if [ -f "$SCRIPT_DIR/../docker/.env" ]; then
    source "$SCRIPT_DIR/../docker/.env"
fi

DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-sigq_db}"
DB_USER="${POSTGRES_USER:-sigq_user}"
DB_PASSWORD="${POSTGRES_PASSWORD:-sigq_password_change_in_prod}"

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Generar nombre del archivo
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="backup-${TYPE}-${TIMESTAMP}.sql.gz"
FILEPATH="$BACKUP_DIR/$FILENAME"

echo "🔄 Creando backup de la base de datos..."
echo "   Base de datos: $DB_NAME"
echo "   Host: $DB_HOST:$DB_PORT"
echo "   Archivo: $FILENAME"

# Crear backup comprimido
export PGPASSWORD="$DB_PASSWORD"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -F c | gzip > "$FILEPATH"

if [ $? -eq 0 ]; then
    SIZE=$(du -h "$FILEPATH" | cut -f1)
    echo "✅ Backup completado exitosamente"
    echo "   Archivo: $FILEPATH"
    echo "   Tamaño: $SIZE"
else
    echo "❌ Error al crear el backup"
    exit 1
fi

# Limpiar backups antiguos (mantener últimos 30 días)
echo "🧹 Limpiando backups antiguos..."
find "$BACKUP_DIR" -name "backup-*.sql.gz" -type f -mtime +30 -delete
echo "✅ Limpieza completada"
