# Configuración de Variables de Entorno - Backend

## Archivo .env

Crea un archivo `.env` en el directorio `backend/` con las siguientes variables:

```env
# ============================================
# Base de Datos PostgreSQL
# ============================================
# Usa las mismas credenciales que docker-compose.yml
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=sigq_user
POSTGRES_PASSWORD=sigq_password_change_in_prod
POSTGRES_DB=sigq_db

# Alternativamente, puedes usar estos nombres (también funcionan):
# DATABASE_HOST=localhost
# DATABASE_PORT=5432
# DATABASE_USER=sigq_user
# DATABASE_PASSWORD=sigq_password_change_in_prod
# DATABASE_NAME=sigq_db

# ============================================
# Redis
# ============================================
REDIS_HOST=localhost
REDIS_PORT=6379

# ============================================
# Keycloak
# ============================================
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=sistema-quirurgico
KEYCLOAK_CLIENT_ID=backend-api
KEYCLOAK_CLIENT_SECRET=change-this-in-production
KEYCLOAK_ADMIN_USER=admin
KEYCLOAK_ADMIN_PASSWORD=admin_change_in_prod

# ============================================
# JWT
# ============================================
JWT_SECRET=change-this-secret-in-production-use-strong-secret-min-32-chars
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# ============================================
# API
# ============================================
NODE_ENV=development
API_PORT=3000
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# ============================================
# Encriptación (para SSN y datos sensibles)
# ============================================
ENCRYPTION_KEY=change-this-encryption-key-32-chars-minimum

# ============================================
# Logging
# ============================================
LOG_LEVEL=debug
LOG_FORMAT=json
```

## Importante

⚠️ **Las credenciales de PostgreSQL deben coincidir con las de `docker/docker-compose.yml`:**

En `docker-compose.yml`:
- `POSTGRES_USER: sigq_user`
- `POSTGRES_PASSWORD: sigq_password_change_in_prod`
- `POSTGRES_DB: sigq_db`

En `backend/.env`:
- `POSTGRES_USER=sigq_user`
- `POSTGRES_PASSWORD=sigq_password_change_in_prod`
- `POSTGRES_DB=sigq_db`

## Crear el archivo .env

```bash
cd backend
cp .env.example .env
# Editar .env con las credenciales correctas
```

O crear manualmente:

```bash
cd backend
nano .env
# Pegar el contenido de arriba y ajustar las credenciales
```

## Verificar Conexión

Una vez configurado, verifica que el backend pueda conectarse a PostgreSQL:

```bash
cd backend
npm run start:dev
```

Si hay errores de conexión, verifica:
1. Que PostgreSQL esté corriendo: `docker compose ps` (desde `docker/`)
2. Que las credenciales coincidan exactamente
3. Que el puerto 5432 esté accesible desde el host
