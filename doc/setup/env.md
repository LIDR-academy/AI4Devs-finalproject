# Variables de entorno (plantillas)

## Backend (Java 17/Jakarta)
```
# Database
DB_URL=jdbc:postgresql://localhost:5432/app
DB_USERNAME=app
DB_PASSWORD=app

# OIDC / Keycloak
OIDC_ISSUER_URI=http://localhost:8080/realms/covoituraje-dev
OIDC_JWKS_URI=http://localhost:8080/realms/covoituraje-dev/protocol/openid-connect/certs
OIDC_CLIENT_ID=backend-api
OIDC_CLIENT_SECRET=change-me

# Redis
REDIS_URL=redis://localhost:6379
```

## Frontend (React/TypeScript)
```
# OIDC / Keycloak
VITE_OIDC_AUTHORITY=http://localhost:8080/realms/covoituraje-dev
VITE_OIDC_CLIENT_ID=frontend-spa
VITE_OIDC_REDIRECT_URI=http://localhost:5173/

# API base URLs
VITE_API_USERS=http://localhost:8082/api
VITE_API_TRIPS=http://localhost:8081/api
VITE_API_BOOKINGS=http://localhost:8083/api
VITE_API_MATCHING=http://localhost:8084/api
VITE_API_NOTIFICATIONS=http://localhost:8085/api

# Backend services discovery
TRIPS_SERVICE_URL=http://localhost:8081
USERS_SERVICE_URL=http://localhost:8082
BOOKING_SERVICE_URL=http://localhost:8083
MATCHING_SERVICE_URL=http://localhost:8084
NOTIFICATION_SERVICE_URL=http://localhost:8085/api
```

Nota: crea archivos `.env` locales en `Backend/` y `Frontend/` con estos valores. No se versionan.
