# 🚀 Guía Rápida - bonÀreaGo

## Scripts Disponibles

### 🏗️ `./scripts/dev-infra.sh`
Levanta solo la infraestructura (PostgreSQL, Redis, Keycloak, Mailhog).
```bash
./scripts/dev-infra.sh
```

### 🔍 `./scripts/verify-infra.sh`
Verifica el estado de todos los servicios de infraestructura (PostgreSQL, Keycloak, Redis, Mailhog).
```bash
./scripts/verify-infra.sh
```

### 🔍 `./scripts/verify-all.sh`
Verifica el estado completo del sistema (infraestructura + microservicios + frontend).
```bash
./scripts/verify-all.sh
```

### 📊 `./scripts/migrate.sh`
Ejecuta las migraciones de base de datos (Flyway).
```bash
./scripts/migrate.sh
```

### 🔐 `./scripts/setup-keycloak.sh`
Configura Keycloak con realm, cliente y usuario de prueba.
```bash
./scripts/setup-keycloak.sh
```

### ⚙️ `./scripts/setup-dev.sh`
Setup completo automático (infraestructura + migraciones + Keycloak).
```bash
./scripts/setup-dev.sh
```

### 🌐 `./scripts/start-frontend.sh`
Levanta el frontend (Docker + Nginx). Verifica dependencias y ofrece levantar microservicios si es necesario.
```bash
./scripts/start-frontend.sh
```

### 🌐 `./scripts/start-frontend-dev.sh`
Levanta el frontend en modo desarrollo local (Vite + hot reload). Más rápido para desarrollo.
```bash
./scripts/start-frontend-dev.sh
```

### 🚀 `./scripts/start-all-services.sh`
Levanta todo el sistema completo: infraestructura + microservicios + frontend.
```bash
./scripts/start-all-services.sh
```

### 🧪 `./scripts/run-e2e-tests.sh`
Ejecuta tests End-to-End con Cypress. Menú interactivo para elegir qué tests ejecutar.
```bash
./scripts/run-e2e-tests.sh
```

### 🐳 `./scripts/check-docker.sh`
Verifica si Docker está corriendo y lo arranca automáticamente si está apagado.
```bash
./scripts/check-docker.sh
```

## 🐳 Verificación Automática de Docker

Todos los scripts ahora **verifican automáticamente** si Docker está corriendo:
- ✅ Si Docker está corriendo → continúa normalmente
- ⚠️ Si Docker no está corriendo → intenta arrancarlo automáticamente
- ⏳ Espera hasta 60 segundos a que Docker arranque
- ❌ Si no puede arrancar → muestra mensaje de error claro

**Sistemas soportados:**
- 🍎 **macOS**: Abre Docker Desktop automáticamente
- 🐧 **Linux**: Usa `systemctl` o `service`
- 🪟 **Windows**: Requiere arranque manual

**Script standalone:**
```bash
# Verificar/arrancar Docker manualmente
./scripts/check-docker.sh
```

## 🧪 Testing E2E con Cypress

### Scripts de Testing

```bash
cd Frontend

# Abrir Cypress Test Runner (interactivo, recomendado)
npm run test:e2e:open

# Ejecutar todos los tests (headless)
npm run test:e2e

# Ejecutar solo smoke tests (rápido)
npm run test:e2e:smoke

# Ejecutar en Chrome específicamente
npm run test:e2e:chrome
```

### Documentación Completa

Ver `Frontend/cypress/README.md` para:
- Cómo escribir tests
- Comandos personalizados
- Best practices
- Debugging
- CI/CD integration

### Tests Disponibles

- ✅ **Smoke Tests**: Verificación básica de la aplicación
- ✅ **Authentication**: Login/logout con Keycloak
- ✅ **Navigation**: Navegación entre páginas
- ✅ **Complete Flows**: Flujos de usuario completos

Total: ~21 tests E2E implementados

## 🔄 Reseteo Completo del Sistema

### Opción 1: Reseteo Simple (Recomendado)
```bash
# Detener y eliminar todo (incluye volúmenes/base de datos)
docker-compose down -v

# Levantar de nuevo
./scripts/setup-dev.sh
```

### Opción 2: Reseteo Profundo
```bash
# Detener servicios
docker-compose --profile services down -v

# Limpieza profunda de Docker
docker system prune -a -f --volumes

# Limpiar builds de Maven
cd Backend && mvn clean && cd ..

# Setup completo
./scripts/setup-dev.sh
```

### Opción 3: Un Solo Comando
```bash
docker-compose --profile services down -v && \
docker system prune -a -f --volumes && \
cd Backend && mvn clean && cd .. && \
./scripts/setup-dev.sh
```

## 📋 Servicios y Puertos

| Servicio | Puerto | URL | Credenciales |
|----------|--------|-----|--------------|
| PostgreSQL | 5434 | `localhost:5434` | app/app |
| Keycloak | 8080 | http://localhost:8080 | admin/admin |
| Redis | 6379 | `localhost:6379` | - |
| Mailhog UI | 8025 | http://localhost:8025 | - |
| Mailhog SMTP | 1025 | `localhost:1025` | - |

## 🔍 Scripts de Verificación

| Script | Qué Verifica | Cuándo Usar |
|--------|-------------|-------------|
| `verify-infra.sh` | Solo infraestructura base | Después de levantar la infraestructura con `dev-infra.sh` |
| `verify-all.sh` | Todo el sistema (infra + servicios + frontend) | Para ver el estado completo del proyecto |

### Ejemplo de salida:

**verify-infra.sh** - Rápido y enfocado:
```
📊 PostgreSQL: ✅ OK
🔐 Keycloak: ✅ OK  
🗄️  Redis: ✅ OK
📧 Mailhog: ✅ OK
```

**verify-all.sh** - Completo con secciones:
```
📦 INFRAESTRUCTURA
━━━━━━━━━━━━━━━
[estado de infra]

🔧 MICROSERVICIOS  
━━━━━━━━━━━━━━━
[estado de servicios]

🌐 FRONTEND
━━━━━━━━━━━━━━━
[estado del frontend]
```

## 🌐 Trabajar con el Frontend

### Opción 1: Frontend en Docker (Producción-like)
```bash
# Levantar infraestructura y microservicios
./scripts/dev-infra.sh
docker-compose --profile services up -d trips-service users-service

# Levantar frontend
./scripts/start-frontend.sh
```

**Ventajas:**
- ✅ Entorno similar a producción
- ✅ Nginx configurado
- ✅ Fácil de compartir

**Desventajas:**
- ❌ Rebuild necesario para ver cambios
- ❌ Más lento para desarrollo

### Opción 2: Frontend Local (Desarrollo Rápido) 🔥
```bash
# Levantar infraestructura y microservicios
./scripts/dev-infra.sh
docker-compose --profile services up -d trips-service users-service

# Levantar frontend en modo dev
./scripts/start-frontend-dev.sh
```

**Ventajas:**
- ✅ Hot reload automático
- ✅ Cambios se ven instantáneamente
- ✅ Mejor experiencia de desarrollo

**Desventajas:**
- ❌ Requiere Node.js instalado localmente
- ❌ Usa puerto 5173 en vez de 3000

### Opción 3: Todo de una vez 🚀
```bash
# Levantar TODO (infraestructura + servicios + frontend)
./scripts/start-all-services.sh
```

## 🎯 Flujos Comunes

### Iniciar Desarrollo
```bash
# 1. Levantar infraestructura
./scripts/dev-infra.sh

# 2. Verificar estado de infraestructura
./scripts/verify-infra.sh

# 3. Levantar microservicios
docker-compose --profile services up -d

# 4. Verificar estado completo (infra + servicios + frontend)
./scripts/verify-all.sh

# 5. Ver logs
docker-compose logs -f
```

### Detener Todo
```bash
# Detener microservicios (mantiene infraestructura)
docker-compose --profile services down

# Detener todo
docker-compose down

# Detener todo + eliminar datos
docker-compose down -v
```

### Problemas Comunes

#### Keycloak no responde
```bash
# Ver logs
docker logs covoituraje_keycloak

# Verificar que responde
curl http://localhost:8080/realms/master

# Reiniciar si es necesario
docker-compose restart keycloak
```

#### PostgreSQL no conecta
```bash
# Ver logs
docker logs covoituraje_db

# Verificar estado
docker exec covoituraje_db pg_isready -U app

# Conectar manualmente
psql -h localhost -p 5434 -U app -d app
```

#### Limpiar caché de Docker
```bash
# Eliminar imágenes sin usar
docker image prune -a

# Eliminar todo el caché
docker builder prune -a
```

## 👤 Usuario de Prueba (después de setup-keycloak.sh)

- **Usuario:** test.user
- **Contraseña:** password123
- **Email:** test.user@company.com
- **Rol:** EMPLOYEE

## 🔗 URLs Importantes

- **Keycloak Admin:** http://localhost:8080/admin
- **Keycloak Realm:** http://localhost:8080/realms/covoituraje
- **Mailhog:** http://localhost:8025
- **Frontend:** http://localhost:3000 (cuando esté levantado)

## 📚 Documentación Completa

Para más detalles, consulta:
- `doc/setup/local.md` - Setup local completo
- `doc/setup/keycloak.md` - Configuración de Keycloak
- `Backend/README.md` - Información de backend
- `Frontend/README.md` - Información de frontend

