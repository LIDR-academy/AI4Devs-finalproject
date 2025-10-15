# Entorno local de desarrollo

## Requisitos
- **Docker y Docker Compose** (versión 3.9+)
- **Java 17** (para Backend)
- **Node 18+** (para Frontend)
- **Maven 3.9+** (para compilación)
- **jq** (para configuración de Keycloak)

### Instalación de dependencias
```bash
# macOS
brew install docker docker-compose openjdk@17 node maven jq

# Ubuntu/Debian
sudo apt-get install docker.io docker-compose openjdk-17-jdk nodejs npm maven jq

# Windows
# Usar Docker Desktop + WSL2
```

## Setup Automático (Recomendado)

### Opción 1: Setup completo automático
```bash
# Ejecutar script maestro que configura todo
./scripts/setup-dev.sh
```

### Opción 2: Setup paso a paso
```bash
# 1. Levantar infraestructura
./scripts/dev-infra.sh

# 2. Ejecutar migraciones
./scripts/migrate.sh

# 3. Configurar Keycloak
./scripts/setup-keycloak.sh

# 4. Levantar microservicios (opcional)
docker-compose --profile services up -d
```

## Servicios Disponibles

### Infraestructura Base
- **PostgreSQL + PostGIS**: `localhost:5433` (user/pass/db: `app/app/app`)
- **Redis**: `localhost:6379`
- **Keycloak**: `http://localhost:8080` (admin: `admin/admin`)
- **Mailhog**: `http://localhost:8025` (UI), `localhost:1025` (SMTP)

### Microservicios (Profile: services)
- **trips-service**: `localhost:8081`
- **users-service**: `localhost:8082`
- **booking-service**: `localhost:8083`
- **matching-service**: `localhost:8084`
- **frontend**: `localhost:3000`

## Configuración Manual

### 1. Variables de entorno
```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar variables según tu configuración
nano .env
```

### 2. Base de datos
```bash
# Conectar a PostgreSQL
psql postgres://app:app@localhost:5433/app

# Verificar esquemas
\dn

# Verificar tablas
\dt trips.*
\dt users.*
\dt bookings.*
\dt matches.*
```

### 3. Keycloak
```bash
# Acceder a admin console
open http://localhost:8080/admin

# Credenciales: admin/admin
# Realm: covoituraje
# Cliente: covoituraje-frontend
```

### 4. Usuario de prueba
- **Usuario**: `test.user`
- **Contraseña**: `password123`
- **Rol**: `EMPLOYEE`

## Desarrollo

### Backend (Java 17 + Jakarta)
```bash
# Compilar un servicio específico
cd Backend/trips-service
mvn clean package

# Ejecutar tests
mvn test

# Ejecutar tests de integración
mvn test -Dtest=*IntegrationTest

# Ejecutar migraciones de Flyway
mvn flyway:migrate
```

### Frontend (React/TS)
```bash
# Instalar dependencias
cd Frontend
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Tests
npm test
```

## Comandos Docker Útiles

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f trips-service

# Reiniciar un servicio
docker-compose restart trips-service

# Limpiar todo
docker-compose down --remove-orphans
docker system prune -f

# Rebuild de servicios
docker-compose build --no-cache
```

## Troubleshooting

### PostgreSQL no está listo
```bash
# Verificar estado
docker exec covoituraje_db pg_isready -U app

# Ver logs
docker-compose logs db
```

### Keycloak no responde
```bash
# Verificar que Keycloak responde
curl http://localhost:8080/realms/master

# Reiniciar Keycloak
docker-compose restart keycloak
```

### Migraciones fallan
```bash
# Verificar conexión a BD
psql postgres://app:app@localhost:5433/app

# Ejecutar migraciones manualmente
cd Backend/trips-service
mvn flyway:migrate -Dflyway.url=jdbc:postgresql://localhost:5433/app
```

### Puerto ocupado
```bash
# Verificar qué proceso usa el puerto
lsof -i :5433
lsof -i :8080

# Cambiar puerto en docker-compose.yml si es necesario
```

## Notas Importantes
- **Puerto PostgreSQL**: Usamos 5433 para evitar conflictos con instalaciones locales
- **Profiles Docker**: Los microservicios usan profile `services` para desarrollo opcional
- **Variables de entorno**: El archivo `.env` se carga automáticamente
- **Seguridad**: En desarrollo, `REQUIRE_ROLE_EMPLOYEE=false`
- **Privacidad**: Usamos zona aproximada, no dirección exacta
