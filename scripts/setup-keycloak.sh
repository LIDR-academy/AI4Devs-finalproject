#!/bin/bash

# Script para configurar Keycloak con realm y clientes

echo "🔐 Configurando Keycloak..."

# Verificar que Keycloak esté ejecutándose
if ! curl -f -s http://localhost:8080/realms/master > /dev/null 2>&1; then
    echo "❌ Keycloak no está ejecutándose. Ejecuta primero: ./scripts/dev-infra.sh"
    exit 1
fi

# Configurar realm y cliente usando kcadm
echo "📝 Creando realm 'covoituraje'..."

# Crear realm
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(curl -s -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=admin&password=admin&grant_type=password&client_id=admin-cli" \
    http://localhost:8080/realms/master/protocol/openid-connect/token | jq -r '.access_token')" \
  -d '{
    "realm": "covoituraje",
    "enabled": true,
    "displayName": "Covoituraje Corporativo",
    "loginWithEmailAllowed": true,
    "duplicateEmailsAllowed": false,
    "resetPasswordAllowed": true,
    "editUsernameAllowed": false,
    "bruteForceProtected": false
  }' \
  http://localhost:8080/admin/realms

echo "✅ Realm creado"

# Crear cliente para el frontend
echo "📱 Creando cliente para frontend..."

curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(curl -s -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=admin&password=admin&grant_type=password&client_id=admin-cli" \
    http://localhost:8080/realms/master/protocol/openid-connect/token | jq -r '.access_token')" \
  -d '{
    "clientId": "covoituraje-frontend",
    "enabled": true,
    "publicClient": true,
    "standardFlowEnabled": true,
    "implicitFlowEnabled": false,
    "directAccessGrantsEnabled": false,
    "serviceAccountsEnabled": false,
    "redirectUris": ["http://localhost:3000/*"],
    "webOrigins": ["http://localhost:3000"],
    "protocol": "openid-connect",
    "attributes": {
      "pkce.code.challenge.method": "S256"
    }
  }' \
  http://localhost:8080/admin/realms/covoituraje/clients

echo "✅ Cliente frontend creado"

# Crear usuario de prueba
echo "👤 Creando usuario de prueba..."

curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(curl -s -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=admin&password=admin&grant_type=password&client_id=admin-cli" \
    http://localhost:8080/realms/master/protocol/openid-connect/token | jq -r '.access_token')" \
  -d '{
    "username": "test.user",
    "email": "test.user@company.com",
    "firstName": "Test",
    "lastName": "User",
    "enabled": true,
    "credentials": [{
      "type": "password",
      "value": "password123",
      "temporary": false
    }],
    "realmRoles": ["EMPLOYEE"]
  }' \
  http://localhost:8080/admin/realms/covoituraje/users

echo "✅ Usuario de prueba creado"

echo "🎉 Configuración de Keycloak completada!"
echo ""
echo "Credenciales de prueba:"
echo "👤 Usuario: test.user"
echo "🔑 Contraseña: password123"
echo "🏢 Rol: EMPLOYEE"
echo ""
echo "URLs importantes:"
echo "🔐 Admin Console: http://localhost:8080/admin"
echo "🌐 Realm: http://localhost:8080/realms/covoituraje"
