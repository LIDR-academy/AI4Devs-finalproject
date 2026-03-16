#!/bin/bash

# Script simplificado para probar autenticación
# Usa este si TEST-AUTH.sh no detecta el backend

echo "=== Test Simple de Autenticación ==="
echo ""

BASE_URL="http://localhost:3000/api/v1"

# 1. Verificar backend
echo "1. Verificando backend..."
if curl -s --max-time 2 http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend está corriendo"
elif curl -s --max-time 2 http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ Backend está corriendo (root endpoint)"
else
    echo "❌ Backend no responde. ¿Está corriendo?"
    echo "   Prueba: curl http://localhost:3000/health"
    exit 1
fi
echo ""

# 2. Login
echo "2. Haciendo login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}')

echo "Respuesta del login:"
echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

# Extraer token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken // .accessToken // empty' 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    # Intentar con grep
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "❌ No se pudo extraer el token"
    exit 1
fi

echo "✅ Token obtenido: ${TOKEN:0:50}..."
echo ""

# 3. Verificar perfil
echo "3. Verificando perfil..."
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $TOKEN")

echo "Respuesta del perfil:"
echo "$PROFILE_RESPONSE" | jq '.' 2>/dev/null || echo "$PROFILE_RESPONSE"
echo ""

if echo "$PROFILE_RESPONSE" | grep -q "401\|Unauthorized"; then
    echo "❌ Error: Token no válido"
    exit 1
fi

echo "✅ Perfil obtenido correctamente"
echo ""

# 4. Crear paciente
echo "4. Creando paciente..."
PATIENT_RESPONSE=$(curl -s -X POST "$BASE_URL/hce/patients" \
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

echo "Respuesta de crear paciente:"
echo "$PATIENT_RESPONSE" | jq '.' 2>/dev/null || echo "$PATIENT_RESPONSE"
echo ""

if echo "$PATIENT_RESPONSE" | grep -q "401\|Unauthorized"; then
    echo "❌ Error: Token no válido para crear paciente"
    exit 1
fi

echo "✅ Paciente creado correctamente"
echo ""
echo "=== Test completado ==="
