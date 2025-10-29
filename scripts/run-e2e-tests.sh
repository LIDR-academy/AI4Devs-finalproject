#!/bin/bash

# Script para ejecutar tests E2E de Cypress
# Verifica que todo esté corriendo antes de ejecutar los tests

echo "🧪 Preparando tests E2E de Cypress..."
echo ""

# Verificar que la infraestructura esté corriendo
echo "🔍 Verificando servicios..."
./scripts/verify-all.sh

# Detectar en qué puerto está corriendo el frontend
FRONTEND_PORT=""
if curl -f -s http://localhost:5173 > /dev/null; then
    FRONTEND_PORT="5173"
    echo "✅ Frontend detectado en modo desarrollo (puerto 5173)"
elif curl -f -s http://localhost:3000 > /dev/null; then
    FRONTEND_PORT="3000"
    echo "✅ Frontend detectado en modo Docker (puerto 3000)"
else
    echo ""
    echo "❌ Frontend no está corriendo"
    echo "💡 Opciones:"
    echo "   - Modo desarrollo: ./scripts/start-frontend-dev.sh (puerto 5173)"
    echo "   - Modo Docker: ./scripts/start-frontend.sh (puerto 3000)"
    echo "   - Todo junto: ./scripts/start-all-services.sh"
    exit 1
fi

if ! curl -f -s http://localhost:8080/realms/covoituraje > /dev/null; then
    echo ""
    echo "❌ Keycloak no está corriendo"
    echo "�� Ejecuta: ./scripts/dev-infra.sh"
    exit 1
fi

echo ""
echo "✅ Todos los servicios están corriendo"
echo ""
echo "📝 Nota: Cypress usará baseUrl configurada en cypress.config.ts"
echo "   Si el frontend está en puerto diferente, actualiza cypress.config.ts"
echo ""

# Preguntar qué tipo de tests ejecutar
echo "🎯 ¿Qué tests quieres ejecutar?"
echo ""
echo "  1) Smoke tests (rápido, ~1 min)"
echo "  2) Authentication tests (~2 min)"
echo "  3) Todos los tests (~5 min)"
echo "  4) Abrir Cypress Test Runner (interactivo)"
echo ""

read -p "Selecciona una opción [1-4]: " option

case $option in
  1)
    echo "🏃 Ejecutando smoke tests..."
    cd Frontend && npm run test:e2e:smoke
    ;;
  2)
    echo "🏃 Ejecutando authentication tests..."
    cd Frontend && npx cypress run --spec "cypress/e2e/02-authentication/**/*"
    ;;
  3)
    echo "🏃 Ejecutando todos los tests..."
    cd Frontend && npm run test:e2e
    ;;
  4)
    echo "🏃 Abriendo Cypress Test Runner..."
    cd Frontend && npm run test:e2e:open
    ;;
  *)
    echo "❌ Opción inválida"
    exit 1
    ;;
esac

echo ""
echo "✅ Tests completados"
