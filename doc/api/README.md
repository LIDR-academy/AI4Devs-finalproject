# bonÀreaGo API Documentation

Documentación completa de las APIs REST de bonÀreaGo.

## Tabla de Contenidos

- [Introducción](#introducción)
- [Autenticación](#autenticación)
- [Rate Limiting](#rate-limiting)
- [Versionado](#versionado)
- [Códigos de Error](#códigos-de-error)
- [Servicios](#servicios)
- [Ejemplos de Uso](#ejemplos-de-uso)

---

## Introducción

bonÀreaGo expone APIs REST para todos sus servicios. Todas las APIs siguen los mismos estándares y convenciones.

### Base URL

```
Production: https://api.your-domain.com
Development: http://localhost:8080
```

### Formato de Respuesta

Todas las respuestas son en formato JSON:

```json
{
  "data": {},
  "status": "success",
  "timestamp": "2025-10-25T10:30:00Z"
}
```

### Headers Comunes

```http
Content-Type: application/json
Accept: application/json
Accept-Language: es, en, ca, ro, uk, fr
Authorization: Bearer {token}
```

---

## Autenticación

### JWT con OIDC

bonÀreaGo usa autenticación JWT a través de Keycloak (OIDC).

#### 1. Obtener Token

```bash
curl -X POST https://auth.your-domain.com/realms/bonareago/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=bonareago-backend" \
  -d "client_secret=your-client-secret" \
  -d "username=user@example.com" \
  -d "password=password123"
```

**Respuesta:**

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer"
}
```

#### 2. Usar Token

```bash
curl -X GET https://api.your-domain.com/api/trips \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 3. Refresh Token

```bash
curl -X POST https://auth.your-domain.com/realms/bonareago/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token" \
  -d "client_id=bonareago-backend" \
  -d "client_secret=your-client-secret" \
  -d "refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Roles

- **EMPLOYEE**: Usuario estándar (requerido para todas las operaciones)
- **ADMIN**: Administrador (funcionalidades futuras)

---

## Rate Limiting

### Límites

- **API General**: 10 requests/segundo por IP
- **Auth Endpoints**: 5 requests/segundo por IP

### Headers de Rate Limit

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1635174000
```

### Respuesta cuando se excede el límite

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60

{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

---

## Versionado

Actualmente todas las APIs están en **v1** (implícito en la URL).

Futuras versiones se indicarán en la URL:
```
/api/v2/trips
```

---

## Códigos de Error

### Códigos HTTP

| Código | Significado | Descripción |
|--------|-------------|-------------|
| 200 | OK | Solicitud exitosa |
| 201 | Created | Recurso creado exitosamente |
| 204 | No Content | Solicitud exitosa sin contenido |
| 400 | Bad Request | Solicitud inválida |
| 401 | Unauthorized | No autenticado |
| 403 | Forbidden | No autorizado (falta rol) |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto (ej: recurso ya existe) |
| 422 | Unprocessable Entity | Validación fallida |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error del servidor |
| 503 | Service Unavailable | Servicio no disponible |

### Formato de Error

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Los datos proporcionados no son válidos",
  "details": {
    "field": "email",
    "issue": "Email format is invalid"
  },
  "timestamp": "2025-10-25T10:30:00Z",
  "path": "/api/users/me"
}
```

### Errores Comunes

**401 Unauthorized:**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Token inválido o expirado"
}
```

**403 Forbidden:**
```json
{
  "error": "FORBIDDEN",
  "message": "No tienes permisos para realizar esta acción"
}
```

**404 Not Found:**
```json
{
  "error": "NOT_FOUND",
  "message": "El recurso solicitado no existe"
}
```

---

## Servicios

### 1. Auth Service

Autenticación y autorización.

**Documentación**: [auth-service.yaml](./auth-service.yaml)

**Endpoints principales:**
- `GET /api/auth/health` - Health check
- `POST /api/auth/validate` - Validar token

### 2. Users Service

Gestión de usuarios y perfiles.

**Documentación**: [users-service.yaml](./users-service.yaml)

**Endpoints principales:**
- `GET /api/users/me` - Obtener perfil actual
- `PUT /api/users/me` - Actualizar perfil
- `GET /api/users/{id}` - Obtener usuario por ID
- `POST /api/ratings` - Crear valoración
- `GET /api/ratings/user/{userId}` - Obtener valoraciones de usuario

### 3. Trips Service

Gestión de viajes.

**Documentación**: [trips-service.yaml](./trips-service.yaml)

**Endpoints principales:**
- `GET /api/trips` - Listar viajes
- `POST /api/trips` - Crear viaje
- `GET /api/trips/{id}` - Obtener viaje
- `PUT /api/trips/{id}` - Actualizar viaje
- `DELETE /api/trips/{id}` - Cancelar viaje

### 4. Booking Service

Gestión de reservas.

**Documentación**: [booking-service.yaml](./booking-service.yaml)

**Endpoints principales:**
- `GET /api/bookings` - Listar reservas
- `POST /api/bookings` - Crear reserva
- `GET /api/bookings/{id}` - Obtener reserva
- `DELETE /api/bookings/{id}` - Cancelar reserva

### 5. Matching Service

Búsqueda y emparejamiento de viajes.

**Documentación**: [matching-service.yaml](./matching-service.yaml)

**Endpoints principales:**
- `GET /api/matches` - Buscar viajes compatibles
- `POST /api/matches/{id}/accept` - Aceptar match
- `POST /api/matches/{id}/reject` - Rechazar match

### 6. Notification Service

Notificaciones push y email.

**Documentación**: [notification-service.yaml](./notification-service.yaml)

**Endpoints principales:**
- `POST /api/notifications/subscribe` - Suscribirse a push
- `DELETE /api/notifications/subscribe` - Desuscribirse
- `GET /api/notifications` - Listar notificaciones

---

## Ejemplos de Uso

### Ejemplo 1: Crear un Viaje

```bash
# 1. Autenticarse
TOKEN=$(curl -s -X POST https://auth.your-domain.com/realms/bonareago/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=bonareago-backend" \
  -d "client_secret=your-secret" \
  -d "username=user@example.com" \
  -d "password=password123" \
  | jq -r '.access_token')

# 2. Crear viaje
curl -X POST https://api.your-domain.com/api/trips \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept-Language: es" \
  -d '{
    "origin": {
      "lat": 41.3851,
      "lng": 2.1734
    },
    "destinationSedeId": "SEDE-1",
    "dateTime": "2025-10-26T08:30:00Z",
    "seatsTotal": 3,
    "direction": "TO_SEDE"
  }'
```

**Respuesta:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "driverId": "user-123",
  "origin": {
    "lat": 41.3851,
    "lng": 2.1734
  },
  "destinationSedeId": "SEDE-1",
  "dateTime": "2025-10-26T08:30:00Z",
  "seatsTotal": 3,
  "seatsFree": 3,
  "direction": "TO_SEDE",
  "status": "ACTIVE",
  "createdAt": "2025-10-25T10:30:00Z"
}
```

### Ejemplo 2: Buscar Viajes

```bash
curl -X GET "https://api.your-domain.com/api/matches?destinationSedeId=SEDE-1&direction=TO_SEDE" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept-Language: es"
```

**Respuesta:**

```json
{
  "matches": [
    {
      "tripId": "550e8400-e29b-41d4-a716-446655440000",
      "driverName": "Juan Pérez",
      "origin": {
        "lat": 41.3851,
        "lng": 2.1734
      },
      "destination": "SEDE-1",
      "dateTime": "2025-10-26T08:30:00Z",
      "seatsFree": 3,
      "score": 95,
      "reasons": [
        "Mismo destino",
        "Horario compatible",
        "Alta puntuación de confianza"
      ]
    }
  ],
  "total": 1
}
```

### Ejemplo 3: Reservar Plaza

```bash
curl -X POST https://api.your-domain.com/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tripId": "550e8400-e29b-41d4-a716-446655440000",
    "seatsRequested": 1
  }'
```

**Respuesta:**

```json
{
  "id": "booking-123",
  "tripId": "550e8400-e29b-41d4-a716-446655440000",
  "passengerId": "user-456",
  "seatsRequested": 1,
  "status": "PENDING",
  "createdAt": "2025-10-25T10:35:00Z"
}
```

### Ejemplo 4: Actualizar Perfil

```bash
curl -X PUT https://api.your-domain.com/api/users/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan.perez@example.com",
    "phone": "+34 600 000 000",
    "sedeId": "SEDE-1",
    "preferredSchedule": "08:00-09:00"
  }'
```

**Respuesta:**

```json
{
  "id": "user-123",
  "name": "Juan Pérez",
  "email": "juan.perez@example.com",
  "phone": "+34 600 000 000",
  "sedeId": "SEDE-1",
  "preferredSchedule": "08:00-09:00",
  "trustScore": 4.5,
  "updatedAt": "2025-10-25T10:40:00Z"
}
```

### Ejemplo 5: Suscribirse a Notificaciones Push

```bash
curl -X POST https://api.your-domain.com/api/notifications/subscribe \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM=",
      "auth": "tBHItJI5svbpez7KI4CCXg=="
    }
  }'
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Suscripción creada exitosamente"
}
```

---

## Paginación

Para endpoints que devuelven listas, se usa paginación:

```bash
curl -X GET "https://api.your-domain.com/api/trips?page=1&size=20" \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta:**

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Filtros y Ordenación

### Filtros

```bash
# Filtrar por estado
GET /api/trips?status=ACTIVE

# Filtrar por fecha
GET /api/trips?from=2025-10-25&to=2025-10-31

# Múltiples filtros
GET /api/trips?status=ACTIVE&destinationSedeId=SEDE-1
```

### Ordenación

```bash
# Ordenar por fecha ascendente
GET /api/trips?sort=dateTime,asc

# Ordenar por fecha descendente
GET /api/trips?sort=dateTime,desc

# Múltiples criterios
GET /api/trips?sort=dateTime,desc&sort=seatsTotal,asc
```

---

## Multi-idioma

Todas las APIs soportan 6 idiomas:

- **es**: Español (por defecto)
- **ca**: Catalán
- **en**: Inglés
- **ro**: Rumano
- **uk**: Ucraniano
- **fr**: Francés

### Uso

```bash
curl -X GET https://api.your-domain.com/api/trips \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept-Language: ca"
```

Los mensajes de error y validación se devuelven en el idioma solicitado.

---

## CORS

Las APIs están configuradas para aceptar requests desde los orígenes permitidos:

```http
Access-Control-Allow-Origin: https://your-domain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, Accept-Language
Access-Control-Allow-Credentials: true
```

---

## Webhooks

(Funcionalidad futura)

bonÀreaGo soportará webhooks para notificar eventos:

- `booking.created`
- `booking.confirmed`
- `booking.cancelled`
- `trip.cancelled`
- `match.found`

---

## SDKs

(Funcionalidad futura)

SDKs oficiales para:
- JavaScript/TypeScript
- Python
- Java
- PHP

---

## Soporte

Para más información:
- **Documentación completa**: Ver archivos YAML individuales
- **Issues**: GitHub Issues
- **Email**: support@your-domain.com

---

## Changelog

Ver [CHANGELOG.md](../../CHANGELOG.md) para cambios en las APIs.
