#!/bin/bash

# Script para levantar el frontend en modo desarrollo (sin Docker)
# Útil para desarrollo rápido con hot-reload

echo "⚡ Iniciando Frontend en Modo Desarrollo (Local)"
echo ""

# Verificar que Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "💡 Instala Node.js 20+ desde: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"
echo ""

# Verificar que la infraestructura esté corriendo
echo "🔍 Verificando infraestructura..."
if ! docker exec covoituraje_db pg_isready -U app &>/dev/null; then
    echo "❌ PostgreSQL no está corriendo"
    echo "💡 Ejecuta primero: ./scripts/dev-infra.sh"
    exit 1
fi

if ! curl -f -s http://localhost:8080/realms/master &>/dev/null; then
    echo "❌ Keycloak no está corriendo"
    echo "💡 Ejecuta primero: ./scripts/dev-infra.sh"
    exit 1
fi

echo "✅ Infraestructura OK"
echo ""

# Verificar microservicios
echo "🔍 Verificando microservicios..."
if ! curl -f -s http://localhost:8081/api/trips &>/dev/null; then
    echo "⚠️  trips-service no está corriendo"
    echo "💡 Levántalo con: docker-compose --profile services up -d trips-service"
    echo ""
    read -p "¿Continuar sin trips-service? [y/N]: " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Microservicios disponibles"
fi

echo ""

# Ir al directorio del frontend
cd Frontend || exit 1

# Verificar si las dependencias están instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    echo ""
fi

# Verificar variables de entorno
if [ ! -f ".env.local" ]; then
    echo "⚙️  Creando .env.local..."
    cat > .env.local << 'EOF'
# Configuración local para desarrollo
VITE_USERS_API_BASE_URL=http://localhost:8082/api
VITE_TRIPS_API_BASE_URL=http://localhost:8081/api
VITE_BOOKING_API_BASE_URL=http://localhost:8083/api
VITE_MATCHING_API_BASE_URL=http://localhost:8084/api
VITE_OIDC_ISSUER=http://localhost:8080/realms/covoituraje
VITE_OIDC_CLIENT_ID=covoituraje-frontend
EOF
    echo "✅ Archivo .env.local creado"
    echo ""
fi

echo "🎯 Variables de entorno:"
cat .env.local
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Iniciando servidor de desarrollo..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 El frontend estará disponible en:"
echo "   👉 http://localhost:5173 (puerto por defecto de Vite)"
echo ""
echo "🔥 Hot reload habilitado - los cambios se verán automáticamente"
echo ""
echo "🛑 Para detener: Ctrl+C"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Iniciar Vite en modo desarrollo
npm run dev

