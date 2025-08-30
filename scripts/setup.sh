#!/bin/bash

# Script de instalación automatizada para Zonmatch
# Autor: Antonio Alejandro Moreno Martinez

set -e

echo "🚀 Iniciando instalación de Zonmatch..."
echo "=========================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Verificar requisitos previos
check_requirements() {
    print_step "Verificando requisitos previos..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado. Por favor instala Node.js 18+"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js versión $NODE_VERSION detectada. Se requiere versión 18+"
        exit 1
    fi
    
    print_message "Node.js $(node --version) ✓"
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        print_error "npm no está instalado"
        exit 1
    fi
    
    print_message "npm $(npm --version) ✓"
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        print_warning "Docker no está instalado. La instalación local puede tomar más tiempo"
        DOCKER_AVAILABLE=false
    else
        print_message "Docker $(docker --version) ✓"
        DOCKER_AVAILABLE=true
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_warning "Docker Compose no está instalado"
        DOCKER_COMPOSE_AVAILABLE=false
    else
        print_message "Docker Compose $(docker-compose --version) ✓"
        DOCKER_COMPOSE_AVAILABLE=true
    fi
}

# Configurar variables de entorno
setup_environment() {
    print_step "Configurando variables de entorno..."
    
    if [ ! -f .env ]; then
        if [ -f env.example ]; then
            cp env.example .env
            print_message "Archivo .env creado desde env.example"
        else
            print_warning "No se encontró env.example. Creando .env básico..."
            cat > .env << EOF
# Configuración del Proyecto
NODE_ENV=development
PORT=3001

# Base de Datos MySQL
DATABASE_URL=mysql://zonmatch_user:zonmatch_pass@localhost:3306/zonmatch
DB_HOST=localhost
DB_PORT=3306
DB_NAME=zonmatch
DB_USER=zonmatch_user
DB_PASSWORD=zonmatch_pass

# Redis Cache
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000
EOF
        fi
    else
        print_message "Archivo .env ya existe"
    fi
}

# Instalar dependencias
install_dependencies() {
    print_step "Instalando dependencias..."
    
    # Instalar dependencias del proyecto raíz
    print_message "Instalando dependencias del proyecto raíz..."
    npm install
    
    # Instalar dependencias del backend
    if [ -d "backend" ]; then
        print_message "Instalando dependencias del backend..."
        cd backend
        npm install
        cd ..
    else
        print_error "Directorio backend no encontrado"
        exit 1
    fi
    
    # Instalar dependencias del frontend
    if [ -d "frontend" ]; then
        print_message "Instalando dependencias del frontend..."
        cd frontend
        npm install
        cd ..
    else
        print_error "Directorio frontend no encontrado"
        exit 1
    fi
    
    print_message "Todas las dependencias instaladas ✓"
}

# Configurar base de datos
setup_database() {
    print_step "Configurando base de datos..."
    
    if [ "$DOCKER_AVAILABLE" = true ] && [ "$DOCKER_COMPOSE_AVAILABLE" = true ]; then
        print_message "Usando Docker para la base de datos..."
        
        # Verificar si los servicios ya están corriendo
        if docker-compose ps | grep -q "mysql"; then
            print_message "Servicios Docker ya están corriendo"
        else
            print_message "Levantando servicios Docker..."
            docker-compose up -d mysql redis
            sleep 10 # Esperar a que los servicios estén listos
        fi
        
        # Ejecutar migraciones
        print_message "Ejecutando migraciones de base de datos..."
        cd backend
        npm run db:migrate
        
        # Ejecutar seeders
        print_message "Ejecutando seeders de base de datos..."
        npm run db:seed
        cd ..
        
    else
        print_warning "Docker no disponible. Asegúrate de tener MySQL y Redis corriendo localmente"
        print_message "Ejecuta manualmente:"
        echo "  cd backend"
        echo "  npm run db:migrate"
        echo "  npm run db:seed"
    fi
}

# Construir proyectos
build_projects() {
    print_step "Construyendo proyectos..."
    
    # Build del backend
    if [ -d "backend" ]; then
        print_message "Construyendo backend..."
        cd backend
        npm run build
        cd ..
    fi
    
    # Build del frontend
    if [ -d "frontend" ]; then
        print_message "Construyendo frontend..."
        cd frontend
        npm run build
        cd ..
    fi
    
    print_message "Proyectos construidos ✓"
}

# Verificar instalación
verify_installation() {
    print_step "Verificando instalación..."
    
    # Verificar que los archivos principales existen
    if [ -f "backend/dist/app.js" ] || [ -f "backend/src/app.ts" ]; then
        print_message "Backend ✓"
    else
        print_error "Backend no encontrado"
    fi
    
    if [ -f "frontend/dist/index.html" ] || [ -f "frontend/src/App.tsx" ]; then
        print_message "Frontend ✓"
    else
        print_error "Frontend no encontrado"
    fi
    
    if [ -f ".env" ]; then
        print_message "Variables de entorno ✓"
    else
        print_error "Archivo .env no encontrado"
    fi
    
    print_message "Verificación completada ✓"
}

# Mostrar información de inicio
show_startup_info() {
    echo ""
    echo "🎉 ¡Instalación completada exitosamente!"
    echo "=========================================="
    echo ""
    echo "📋 Para iniciar el proyecto:"
    echo ""
    
    if [ "$DOCKER_AVAILABLE" = true ] && [ "$DOCKER_COMPOSE_AVAILABLE" = true ]; then
        echo "🐳 Con Docker (Recomendado):"
        echo "  npm run docker:up"
        echo ""
        echo "🔍 Ver logs:"
        echo "  npm run docker:logs"
        echo ""
        echo "🛑 Detener servicios:"
        echo "  npm run docker:down"
        echo ""
    fi
    
    echo "💻 Desarrollo local:"
    echo "  npm run dev                    # Backend + Frontend"
    echo "  npm run dev:backend            # Solo Backend"
    echo "  npm run dev:frontend           # Solo Frontend"
    echo ""
    echo "🌐 Acceso a la aplicación:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:3001"
    echo "  Health:   http://localhost:3001/health"
    echo ""
    echo "👤 Usuarios de prueba:"
    echo "  Admin:   admin@zonmatch.com / Admin123!"
    echo "  Agente:  agente@zonmatch.com / Agente123!"
    echo "  Usuario: usuario@zonmatch.com / Usuario123!"
    echo ""
    echo "📚 Comandos útiles:"
    echo "  npm run db:migrate            # Ejecutar migraciones"
    echo "  npm run db:seed               # Ejecutar seeders"
    echo "  npm run build                 # Build completo"
    echo "  npm test                      # Ejecutar tests"
    echo ""
    echo "📖 Documentación: ./docs/"
    echo "🐛 Issues: GitHub Issues"
    echo ""
    echo "¡Disfruta desarrollando con Zonmatch! 🏠✨"
}

# Función principal
main() {
    echo "🏠 Zonmatch - Instalador Automatizado"
    echo "====================================="
    echo ""
    
    check_requirements
    setup_environment
    install_dependencies
    setup_database
    build_projects
    verify_installation
    show_startup_info
}

# Ejecutar función principal
main "$@"
