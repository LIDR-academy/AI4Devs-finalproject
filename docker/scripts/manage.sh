#!/bin/bash

# Script de gestión para SIGQ en producción
# Uso: ./manage.sh [start|stop|restart|status|backup|restore|logs|update]

set -e

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$DOCKER_DIR"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[OK]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Verificar que existe el archivo .env.prod
if [ ! -f "$ENV_FILE" ]; then
    print_error "No se encontró $ENV_FILE. Por favor ejecuta install.sh primero."
    exit 1
fi

case "${1:-}" in
    start)
        print_info "Iniciando servicios SIGQ..."
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
        print_success "Servicios iniciados"
        docker compose -f "$COMPOSE_FILE" ps
        ;;
    
    stop)
        print_info "Deteniendo servicios SIGQ..."
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" stop
        print_success "Servicios detenidos"
        ;;
    
    restart)
        print_info "Reiniciando servicios SIGQ..."
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" restart
        print_success "Servicios reiniciados"
        ;;
    
    status)
        print_info "Estado de los servicios:"
        docker compose -f "$COMPOSE_FILE" ps
        echo ""
        print_info "Health checks:"
        docker compose -f "$COMPOSE_FILE" ps --format json | jq -r '.[] | "\(.Name): \(.Health // "N/A")"' 2>/dev/null || docker compose -f "$COMPOSE_FILE" ps
        ;;
    
    backup)
        print_info "Creando backup de la base de datos..."
        BACKUP_DIR="./backups"
        mkdir -p "$BACKUP_DIR"
        BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz"
        
        source "$ENV_FILE"
        docker compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U "${POSTGRES_USER:-sigq_user}" -d "${POSTGRES_DB:-sigq_db}" | gzip > "$BACKUP_FILE"
        
        if [ -f "$BACKUP_FILE" ]; then
            print_success "Backup creado: $BACKUP_FILE"
            print_info "Tamaño: $(du -h "$BACKUP_FILE" | cut -f1)"
        else
            print_error "Error al crear backup"
            exit 1
        fi
        ;;
    
    restore)
        if [ -z "${2:-}" ]; then
            print_error "Uso: $0 restore <archivo_backup>"
            exit 1
        fi
        
        BACKUP_FILE="$2"
        if [ ! -f "$BACKUP_FILE" ]; then
            print_error "Archivo de backup no encontrado: $BACKUP_FILE"
            exit 1
        fi
        
        print_warning "⚠️  Esta operación reemplazará todos los datos actuales"
        read -p "¿Estás seguro? (escribe 'SI' para confirmar): " confirm
        if [ "$confirm" != "SI" ]; then
            print_info "Operación cancelada"
            exit 0
        fi
        
        print_info "Restaurando backup desde $BACKUP_FILE..."
        source "$ENV_FILE"
        
        if [[ "$BACKUP_FILE" == *.gz ]]; then
            gunzip -c "$BACKUP_FILE" | docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U "${POSTGRES_USER:-sigq_user}" -d "${POSTGRES_DB:-sigq_db}"
        else
            docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U "${POSTGRES_USER:-sigq_user}" -d "${POSTGRES_DB:-sigq_db}" < "$BACKUP_FILE"
        fi
        
        print_success "Backup restaurado"
        ;;
    
    logs)
        SERVICE="${2:-}"
        if [ -z "$SERVICE" ]; then
            docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f --tail=100
        else
            docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f --tail=100 "$SERVICE"
        fi
        ;;
    
    update)
        print_info "Actualizando imágenes Docker..."
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull
        print_success "Imágenes actualizadas"
        print_info "Para aplicar los cambios, ejecuta: $0 restart"
        ;;
    
    cleanup)
        print_warning "⚠️  Esto eliminará contenedores detenidos, imágenes no usadas y volúmenes huérfanos"
        read -p "¿Continuar? (s/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            docker compose -f "$COMPOSE_FILE" down
            docker system prune -f
            print_success "Limpieza completada"
        else
            print_info "Operación cancelada"
        fi
        ;;
    
    *)
        echo "Uso: $0 {start|stop|restart|status|backup|restore|logs|update|cleanup}"
        echo ""
        echo "Comandos:"
        echo "  start      - Iniciar todos los servicios"
        echo "  stop       - Detener todos los servicios"
        echo "  restart    - Reiniciar todos los servicios"
        echo "  status     - Mostrar estado de los servicios"
        echo "  backup     - Crear backup de la base de datos"
        echo "  restore    - Restaurar backup (requiere archivo)"
        echo "  logs       - Ver logs (opcional: nombre del servicio)"
        echo "  update     - Actualizar imágenes Docker"
        echo "  cleanup    - Limpiar recursos no usados"
        exit 1
        ;;
esac
