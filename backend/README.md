# SIGQ Backend - NestJS API

Backend del Sistema Integrado de Gestión Quirúrgica desarrollado con NestJS.

## Requisitos

- Node.js 18+
- npm 9+ o yarn
- PostgreSQL 15+ (corriendo en Docker)
- Redis 7+ (corriendo en Docker)
- Keycloak 22+ (corriendo en Docker)

## Instalación

```bash
# Instalar dependencias
npm install

# Copiar archivo de variables de entorno
cp .env.example .env

# Editar .env con las configuraciones necesarias
```

## Configuración

Edita el archivo `.env` con las siguientes variables:

```env
# Base de datos
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=sigq_user
DATABASE_PASSWORD=sigq_password_change_in_prod
DATABASE_NAME=sigq_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Keycloak
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=sistema-quirurgico
KEYCLOAK_CLIENT_ID=backend-api
KEYCLOAK_CLIENT_SECRET=your-client-secret

# JWT
JWT_SECRET=change-this-secret-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# API
API_PORT=3000
CORS_ORIGIN=http://localhost:5173
```

## Desarrollo

```bash
# Iniciar en modo desarrollo
npm run start:dev

# La API estará disponible en http://localhost:3000
# Documentación Swagger: http://localhost:3000/api/docs
```

## Estructura del Proyecto

```
backend/
├── src/
│   ├── modules/
│   │   └── auth/          # Módulo de autenticación
│   ├── common/
│   │   ├── decorators/    # Decoradores personalizados
│   │   ├── guards/        # Guards de seguridad
│   │   └── interceptors/ # Interceptores
│   ├── config/            # Configuraciones
│   └── main.ts            # Punto de entrada
├── test/                  # Tests
└── package.json
```

## Endpoints de Autenticación

### POST /api/v1/auth/login
Iniciar sesión con email y contraseña.

**Request:**
```json
{
  "email": "cirujano@hospital.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "15m",
  "requiresMfa": false
}
```

### POST /api/v1/auth/verify-mfa
Verificar código MFA.

### POST /api/v1/auth/refresh
Refrescar access token.

### POST /api/v1/auth/logout
Cerrar sesión.

### GET /api/v1/auth/profile
Obtener perfil del usuario autenticado.

## Tests

```bash
# Tests unitarios
npm run test

# Tests con cobertura
npm run test:cov

# Tests E2E
npm run test:e2e
```

## Documentación

La documentación completa de la API está disponible en:
- Swagger UI: http://localhost:3000/api/docs
- JSON: http://localhost:3000/api/docs-json

## Próximos Pasos

- [ ] Integración completa con Keycloak
- [ ] Módulo HCE (Historia Clínica Electrónica)
- [ ] Módulo de Planificación Quirúrgica
- [ ] Integración con sistemas externos (HL7, DICOM)
