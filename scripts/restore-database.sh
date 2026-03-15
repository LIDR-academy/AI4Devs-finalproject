#!/bin/bash

# Script de restauración de base de datos desde backup
# Uso: ./restore-database.sh <archivo-backup>
# Ejemplo: ./restore-database.sh backup-daily-20240120_020000.sql.gz

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$SCRIPT_DIR/../backups}"

if [ -z "$1" ]; then
    echo "❌ Error: Debe especificar el archivo de backup"
    echo "Uso: $0 <archivo-backup>"
    echo ""
    echo "Backups disponibles:"
    ls -lh "$BACKUP_DIR"/backup-*.sql.gz 2>/dev/null || echo "  No hay backups disponibles"
    exit 1
fi

BACKUP_FILE="$1"

# Si es solo el nombre del archivo, buscar en el directorio de backups
if [ ! -f "$BACKUP_FILE" ]; then
    BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Archivo de backup no encontrado: $BACKUP_FILE"
    exit 1
fi

# Cargar variables de entorno
if [ -f "$SCRIPT_DIR/../docker/.env" ]; then
    source "$SCRIPT_DIR/../docker/.env"
fi

DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-sigq_db}"
DB_USER="${POSTGRES_USER:-sigq_user}"
DB_PASSWORD="${POSTGRES_PASSWORD:-sigq_password_change_in_prod}"

echo "⚠️  ADVERTENCIA: Esta operación reemplazará todos los datos de la base de datos"
echo "   Base de datos: $DB_NAME"
echo "   Host: $DB_HOST:$DB_PORT"
echo "   Archivo: $BACKUP_FILE"
echo ""
read -p "¿Está seguro de que desea continuar? (escriba 'SI' para confirmar): " CONFIRM

if [ "$CONFIRM" != "SI" ]; then
    echo "❌ Operación cancelada"
    exit 1
fi

echo "🔄 Restaurando base de datos..."

# Descomprimir y restaurar
export PGPASSWORD="$DB_PASSWORD"

if [[ "$BACKUP_FILE" == *.gz ]]; then
    # Backup comprimido
    gunzip -c "$BACKUP_FILE" | pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c
else
    # Backup sin comprimir
    pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "$BACKUP_FILE"
fi

if [ $? -eq 0 ]; then
    echo "✅ Base de datos restaurada exitosamente"
else
    echo "❌ Error al restaurar la base de datos"
    exit 1
fi
