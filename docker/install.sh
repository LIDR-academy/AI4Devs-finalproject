#!/bin/bash

# Script de instalación on-premise para SIGQ
# Este script configura y despliega el sistema en un servidor on-premise

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que se ejecuta como root o con sudo
if [ "$EUID" -ne 0 ]; then 
    print_error "Por favor ejecuta este script con sudo"
    exit 1
fi

print_info "=========================================="
print_info "Instalación SIGQ - On-Premise"
print_info "=========================================="
echo ""

# 1. Verificar requisitos
print_info "Verificando requisitos del sistema..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi
print_success "Docker está instalado: $(docker --version)"

# Verificar Docker Compose
if ! docker compose version &> /dev/null; then
    print_error "Docker Compose no está disponible. Por favor instala Docker Compose."
    exit 1
fi
print_success "Docker Compose está disponible: $(docker compose version)"
echo ""

# 2. Crear directorios necesarios
print_info "Creando directorios necesarios..."
mkdir -p backups
mkdir -p logs
mkdir -p data/postgres
mkdir -p data/redis
mkdir -p data/minio
mkdir -p data/keycloak
mkdir -p data/orthanc
mkdir -p data/prometheus
mkdir -p data/loki
mkdir -p data/grafana
print_success "Directorios creados"
echo ""

# 3. Configurar variables de entorno
print_info "Configurando variables de entorno..."

if [ ! -f .env.prod ]; then
    if [ -f .env.prod.example ]; then
        cp .env.prod.example .env.prod
        print_warning "Archivo .env.prod creado desde .env.prod.example"
        print_warning "⚠️  IMPORTANTE: Edita .env.prod y cambia TODAS las contraseñas antes de continuar"
        echo ""
        read -p "¿Has editado .env.prod y cambiado todas las contraseñas? (s/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            print_error "Por favor edita .env.prod antes de continuar"
            exit 1
        fi
    else
        print_error "No se encontró .env.prod.example. Por favor crea .env.prod manualmente"
        exit 1
    fi
else
    print_warning "El archivo .env.prod ya existe. ¿Deseas sobrescribirlo? (s/n)"
    read -p "" -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        cp .env.prod.example .env.prod
        print_warning "⚠️  IMPORTANTE: Edita .env.prod y cambia TODAS las contraseñas"
        read -p "¿Has editado .env.prod? (s/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            print_error "Por favor edita .env.prod antes de continuar"
            exit 1
        fi
    fi
fi
print_success "Variables de entorno configuradas"
echo ""

# 4. Generar secretos si no existen
print_info "Generando secretos de seguridad..."

if ! grep -q "JWT_SECRET=CHANGE_THIS" .env.prod 2>/dev/null; then
    print_success "JWT_SECRET ya configurado"
else
    JWT_SECRET=$(openssl rand -hex 32)
    sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env.prod
    print_success "JWT_SECRET generado"
fi

if ! grep -q "ENCRYPTION_KEY=CHANGE_THIS" .env.prod 2>/dev/null; then
    print_success "ENCRYPTION_KEY ya configurado"
else
    ENCRYPTION_KEY=$(openssl rand -hex 16)
    sed -i.bak "s|ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$ENCRYPTION_KEY|" .env.prod
    print_success "ENCRYPTION_KEY generado"
fi

if ! grep -q "GRAFANA_SECRET_KEY=CHANGE_THIS" .env.prod 2>/dev/null; then
    print_success "GRAFANA_SECRET_KEY ya configurado"
else
    GRAFANA_SECRET_KEY=$(openssl rand -hex 16)
    sed -i.bak "s|GRAFANA_SECRET_KEY=.*|GRAFANA_SECRET_KEY=$GRAFANA_SECRET_KEY|" .env.prod
    print_success "GRAFANA_SECRET_KEY generado"
fi

rm -f .env.prod.bak
echo ""

# 5. Configurar permisos
print_info "Configurando permisos..."
chmod 600 .env.prod
chown root:root .env.prod
print_success "Permisos configurados"
echo ""

# 6. Iniciar servicios
print_info "Iniciando servicios de infraestructura..."
export $(cat .env.prod | grep -v '^#' | xargs)
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d postgres redis minio
print_success "Servicios de infraestructura iniciados"
echo ""

# Esperar a que PostgreSQL esté listo
print_info "Esperando a que PostgreSQL esté listo..."
sleep 10
for i in {1..30}; do
    if docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T postgres pg_isready -U "${POSTGRES_USER:-sigq_user}" -d "${POSTGRES_DB:-sigq_db}" &>/dev/null; then
        print_success "PostgreSQL está listo"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "PostgreSQL no respondió a tiempo"
        exit 1
    fi
    sleep 2
done
echo ""

# 7. Iniciar servicios restantes
print_info "Iniciando servicios restantes..."
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
print_success "Todos los servicios iniciados"
echo ""

# 8. Verificar estado
print_info "Verificando estado de los servicios..."
sleep 5
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
echo ""

# 9. Mostrar información de acceso
print_success "=========================================="
print_success "Instalación completada exitosamente"
print_success "=========================================="
echo ""

# Cargar variables para mostrar información
source .env.prod 2>/dev/null || true

print_info "Servicios disponibles:"
echo "  - PostgreSQL:    localhost:${POSTGRES_PORT:-5432}"
echo "  - Redis:         localhost:${REDIS_PORT:-6379}"
echo "  - MinIO:         localhost:${MINIO_PORT:-9000} (API)"
echo "  - MinIO Console: localhost:${MINIO_CONSOLE_PORT:-9001}"
echo "  - Keycloak:      localhost:${KEYCLOAK_PORT:-8080}"
echo "  - Orthanc:       localhost:${ORTHANC_PORT:-8042}"
echo "  - Prometheus:    localhost:${PROMETHEUS_PORT:-9090}"
echo "  - Grafana:       localhost:${GRAFANA_PORT:-3001}"
echo "  - Loki:          localhost:${LOKI_PORT:-3100}"
echo ""
print_warning "Próximos pasos:"
echo "  1. Configurar Keycloak (realm, clientes, roles)"
echo "  2. Crear buckets en MinIO"
echo "  3. Configurar certificados SSL/TLS si es necesario"
echo "  4. Ejecutar migraciones de base de datos"
echo "  5. Configurar backups automáticos"
echo ""
print_info "Para más información, consulta: docker/DEPLOYMENT.md"
echo ""
print_info "Comandos útiles:"
echo "  ./scripts/manage.sh start    - Iniciar servicios"
echo "  ./scripts/manage.sh stop     - Detener servicios"
echo "  ./scripts/manage.sh status   - Ver estado"
echo "  ./scripts/manage.sh backup   - Crear backup"
echo ""
