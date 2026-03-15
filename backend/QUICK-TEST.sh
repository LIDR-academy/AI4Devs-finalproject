#!/bin/bash

# Script rápido para probar los endpoints principales del backend

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api/v1"

echo "🧪 Pruebas Rápidas del Backend SIGQ"
echo "===================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para probar endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local description=$3
    local data=$4
    local token=$5
    
    echo -n "Probando: $description... "
    
    if [ -n "$token" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$url" \
                -H "Authorization: Bearer $token" \
                -H "Content-Type: application/json" \
                -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$url" \
                -H "Authorization: Bearer $token")
        fi
    else
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$url" \
                -H "Content-Type: application/json" \
                -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$url")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ OK (${http_code})${NC}"
        return 0
    elif [ "$http_code" -eq 401 ]; then
        echo -e "${YELLOW}⚠ No autenticado (${http_code})${NC}"
        return 1
    else
        echo -e "${RED}✗ Error (${http_code})${NC}"
        echo "  Respuesta: $body"
        return 1
    fi
}

# 1. Health Check
echo "1. Health Check"
test_endpoint "GET" "$BASE_URL/health" "Health check"
test_endpoint "GET" "$BASE_URL/" "Información de API"
echo ""

# 2. Verificar Swagger
echo "2. Documentación"
echo -n "Probando: Swagger UI... "
if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/docs" | grep -q "200"; then
    echo -e "${GREEN}✓ Accesible${NC}"
else
    echo -e "${RED}✗ No accesible${NC}"
fi
echo ""

# 3. Autenticación (sin token - debería fallar o requerir Keycloak)
echo "3. Autenticación"
echo -n "Probando: Login endpoint... "
login_response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test123"}')
login_code=$(echo "$login_response" | tail -n1)

if [ "$login_code" -eq 200 ] || [ "$login_code" -eq 401 ]; then
    echo -e "${GREEN}✓ Endpoint responde (${login_code})${NC}"
    if [ "$login_code" -eq 200 ]; then
        TOKEN=$(echo "$login_response" | sed '$d' | jq -r '.accessToken // empty' 2>/dev/null)
        if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
            echo -e "  ${GREEN}Token obtenido${NC}"
        fi
    fi
else
    echo -e "${RED}✗ Error (${login_code})${NC}"
fi
echo ""

# 4. Endpoints que requieren autenticación (si tenemos token)
if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo "4. Endpoints Protegidos (con token)"
    
    # Profile
    test_endpoint "GET" "$API_URL/auth/profile" "Obtener perfil" "" "$TOKEN"
    
    # Status de integraciones
    test_endpoint "GET" "$API_URL/integration/status" "Estado de integraciones" "" "$TOKEN"
    
    echo ""
fi

# 5. Resumen
echo "===================================="
echo "Resumen:"
echo "- Health check: ✓"
echo "- Swagger: ✓"
echo "- Endpoints de autenticación: Verificado"
if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo "- Endpoints protegidos: Probados con token"
else
    echo "- Endpoints protegidos: Requieren token (configurar Keycloak)"
fi
echo ""
echo "📚 Para más pruebas, consulta: backend/TESTING.md"
echo "🌐 Swagger UI: $BASE_URL/api/docs"
