#!/bin/bash

# Script para probar autenticación y uso de tokens

echo "=== Test de Autenticación ==="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URL base
BASE_URL="http://localhost:3000/api/v1"

# 1. Health check
echo -e "${YELLOW}1. Verificando que el backend esté corriendo...${NC}"
# Intentar múltiples endpoints posibles
HEALTH1=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/health" 2>/dev/null || echo "000")
HEALTH2=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/" 2>/dev/null || echo "000")
HEALTH3=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/v1/health" 2>/dev/null || echo "000")

# También intentar con timeout más corto
if [ "$HEALTH1" != "200" ] && [ "$HEALTH2" != "200" ] && [ "$HEALTH3" != "200" ]; then
    # Intentar una vez más con timeout
    HEALTH1=$(curl -s --max-time 2 -o /dev/null -w "%{http_code}" "http://localhost:3000/health" 2>/dev/null || echo "000")
    HEALTH2=$(curl -s --max-time 2 -o /dev/null -w "%{http_code}" "http://localhost:3000/" 2>/dev/null || echo "000")
fi

if [ "$HEALTH1" = "200" ] || [ "$HEALTH2" = "200" ] || [ "$HEALTH3" = "200" ]; then
    echo -e "${GREEN}✅ Backend está corriendo${NC}"
    # Mostrar qué endpoint funcionó
    if [ "$HEALTH1" = "200" ]; then
        echo -e "${GREEN}   ✓ Health check en /health${NC}"
    fi
    if [ "$HEALTH2" = "200" ]; then
        echo -e "${GREEN}   ✓ Root endpoint en /${NC}"
    fi
    if [ "$HEALTH3" = "200" ]; then
        echo -e "${GREEN}   ✓ Health check en /api/v1/health${NC}"
    fi
else
    echo -e "${RED}❌ Backend no está corriendo o no responde correctamente.${NC}"
    echo -e "${YELLOW}Intentando conectar a:${NC}"
    echo "  - http://localhost:3000/health (código: $HEALTH1)"
    echo "  - http://localhost:3000/ (código: $HEALTH2)"
    echo "  - http://localhost:3000/api/v1/health (código: $HEALTH3)"
    echo ""
    echo -e "${YELLOW}Verifica que:${NC}"
    echo "  1. El backend esté corriendo: cd backend && npm run start:dev"
    echo "  2. El puerto 3000 esté disponible y no esté bloqueado"
    echo "  3. No haya errores en los logs del backend"
    echo "  4. El backend esté escuchando en http://localhost:3000"
    echo ""
    echo -e "${YELLOW}Prueba manualmente:${NC}"
    echo "  curl http://localhost:3000/health"
    echo "  curl http://localhost:3000/"
    exit 1
fi
echo ""

# 2. Login
echo -e "${YELLOW}2. Haciendo login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}')

# Verificar si hay error
if echo "$LOGIN_RESPONSE" | grep -q "error\|Error\|401\|500"; then
    echo -e "${RED}❌ Error en login:${NC}"
    echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
    exit 1
fi

# Extraer token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    # Intentar con jq
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)
fi

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ No se pudo extraer el token de la respuesta:${NC}"
    echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Token obtenido: ${TOKEN:0:50}...${NC}"
echo ""

# 3. Verificar perfil
echo -e "${YELLOW}3. Verificando perfil con token...${NC}"
PROFILE_RESPONSE=$(curl -s --max-time 5 -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE_RESPONSE" | grep -q "401\|Unauthorized\|error\|Error"; then
    echo -e "${RED}❌ Error al verificar perfil:${NC}"
    echo "$PROFILE_RESPONSE" | jq '.' 2>/dev/null || echo "$PROFILE_RESPONSE"
    echo ""
    echo -e "${YELLOW}Token usado: ${TOKEN:0:50}...${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Perfil obtenido:${NC}"
echo "$PROFILE_RESPONSE" | jq '.' 2>/dev/null || echo "$PROFILE_RESPONSE"
echo ""

# 4. Crear paciente
echo -e "${YELLOW}4. Creando paciente...${NC}"
PATIENT_RESPONSE=$(curl -s --max-time 5 -X POST "$BASE_URL/hce/patients" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez García",
    "dateOfBirth": "1985-05-15",
    "gender": "M",
    "ssn": "12345678A",
    "phone": "+34 600 123 456"
  }')

if echo "$PATIENT_RESPONSE" | grep -q "401\|Unauthorized\|error\|Error"; then
    echo -e "${RED}❌ Error al crear paciente:${NC}"
    echo "$PATIENT_RESPONSE" | jq '.' 2>/dev/null || echo "$PATIENT_RESPONSE"
    echo ""
    echo -e "${YELLOW}Token usado: ${TOKEN:0:50}...${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Paciente creado:${NC}"
echo "$PATIENT_RESPONSE" | jq '.' 2>/dev/null || echo "$PATIENT_RESPONSE"
echo ""

echo -e "${GREEN}=== Todos los tests pasaron ✅ ===${NC}"
