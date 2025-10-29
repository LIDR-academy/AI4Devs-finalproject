# Docker Deployment Guide - bonÀreaGo

Esta guía describe cómo desplegar bonÀreaGo usando Docker y Docker Compose.

## Tabla de Contenidos

- [Arquitectura Docker](#arquitectura-docker)
- [Build de Imágenes](#build-de-imágenes)
- [Docker Compose para Producción](#docker-compose-para-producción)
- [Networking](#networking)
- [Volúmenes y Persistencia](#volúmenes-y-persistencia)
- [Health Checks](#health-checks)
- [Escalado](#escalado)
- [Troubleshooting](#troubleshooting)

---

## Arquitectura Docker

### Servicios

bonÀreaGo está compuesto por los siguientes servicios Docker:

```
┌─────────────────────────────────────────────────────────────┐
│                         API Gateway (Nginx)                  │
│                         Port: 8080                           │
└───────────────┬─────────────────────────────────────────────┘
                │
    ┌───────────┴───────────┐
    │                       │
┌───▼────┐  ┌──────┐  ┌────▼────┐  ┌──────────┐  ┌──────────┐
│ Auth   │  │Users │  │ Trips   │  │ Booking  │  │ Matching │
│Service │  │Service│  │ Service │  │ Service  │  │ Service  │
│ :8080  │  │:8082 │  │  :8081  │  │  :8083   │  │  :8084   │
└────────┘  └──────┘  └─────────┘  └──────────┘  └──────────┘
                                                   
┌────────────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐
│ PostgreSQL │  │  Redis  │  │ Keycloak │  │ Frontend │
│   :5432    │  │  :6379  │  │  :8080   │  │  :3000   │
└────────────┘  └─────────┘  └──────────┘  └──────────┘
```

---

## Build de Imágenes

### Backend Services

Cada microservicio tiene su propio Dockerfile:

**Ejemplo: trips-service/Dockerfile**

```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copiar POMs
COPY pom.xml .
COPY shared/pom.xml shared/
COPY trips-service/pom.xml trips-service/

# Descargar dependencias
RUN mvn dependency:go-offline

# Copiar código fuente
COPY shared/src shared/src
COPY trips-service/src trips-service/src

# Build
RUN mvn clean package -DskipTests

# Runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copiar WAR
COPY --from=build /app/trips-service/target/*.war app.war

# Exponer puerto
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8081/api/health || exit 1

# Ejecutar
ENTRYPOINT ["java", "-jar", "app.war"]
```

### Frontend

**Frontend/Dockerfile**

```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copiar package files
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Build
RUN npm run build

# Production stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copiar build
COPY --from=build /app/dist .

# Copiar configuración nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

### Build de Todas las Imágenes

```bash
# Backend services
cd Backend
docker build -t bonareago/auth-service:latest ./auth-service
docker build -t bonareago/users-service:latest ./users-service
docker build -t bonareago/trips-service:latest ./trips-service
docker build -t bonareago/booking-service:latest ./booking-service
docker build -t bonareago/matching-service:latest ./matching-service
docker build -t bonareago/notification-service:latest ./notification-service

# Frontend
cd ../Frontend
docker build -t bonareago/frontend:latest .

# Gateway
cd ../Backend/gateway
docker build -t bonareago/gateway:latest .
```

### Push a Registry

```bash
# Tag para registry
docker tag bonareago/trips-service:latest ghcr.io/your-org/bonareago/trips-service:latest

# Push
docker push ghcr.io/your-org/bonareago/trips-service:latest
```

---

## Docker Compose para Producción

### docker-compose.prod.yml

```yaml
version: '3.8'

services:
  # Database
  postgres:
    image: postgis/postgis:15-3.4
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - bonareago-network

  # Redis
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    restart: unless-stopped
    networks:
      - bonareago-network

  # Keycloak
  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: ${POSTGRES_USER}
      KC_DB_PASSWORD: ${POSTGRES_PASSWORD}
      KC_HOSTNAME: ${KEYCLOAK_HOSTNAME}
      KC_PROXY: edge
      KEYCLOAK_ADMIN: ${KEYCLOAK_ADMIN}
      KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD}
    command:
      - start
      - --optimized
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8080/health/ready || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
    restart: unless-stopped
    networks:
      - bonareago-network

  # Auth Service
  auth-service:
    image: ghcr.io/your-org/bonareago/auth-service:${VERSION:-latest}
    environment:
      OIDC_ISSUER_URI: ${OIDC_ISSUER_URI}
      OIDC_CLIENT_ID: ${OIDC_CLIENT_ID}
      OIDC_CLIENT_SECRET: ${OIDC_CLIENT_SECRET}
      AUTH_DISABLED: ${AUTH_DISABLED:-false}
    ports:
      - "8080:8080"
    depends_on:
      keycloak:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    networks:
      - bonareago-network

  # Users Service
  users-service:
    image: ghcr.io/your-org/bonareago/users-service:${VERSION:-latest}
    environment:
      DATABASE_URL: ${DATABASE_URL}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      OIDC_ISSUER_URI: ${OIDC_ISSUER_URI}
      REQUIRE_ROLE_EMPLOYEE: ${REQUIRE_ROLE_EMPLOYEE:-true}
    ports:
      - "8082:8082"
    depends_on:
      postgres:
        condition: service_healthy
      auth-service:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8082/api/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    networks:
      - bonareago-network

  # Trips Service
  trips-service:
    image: ghcr.io/your-org/bonareago/trips-service:${VERSION:-latest}
    environment:
      DATABASE_URL: ${DATABASE_URL}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      OIDC_ISSUER_URI: ${OIDC_ISSUER_URI}
      REQUIRE_ROLE_EMPLOYEE: ${REQUIRE_ROLE_EMPLOYEE:-true}
    ports:
      - "8081:8081"
    depends_on:
      postgres:
        condition: service_healthy
      auth-service:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8081/api/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    networks:
      - bonareago-network

  # Booking Service
  booking-service:
    image: ghcr.io/your-org/bonareago/booking-service:${VERSION:-latest}
    environment:
      DATABASE_URL: ${DATABASE_URL}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      OIDC_ISSUER_URI: ${OIDC_ISSUER_URI}
      REQUIRE_ROLE_EMPLOYEE: ${REQUIRE_ROLE_EMPLOYEE:-true}
    ports:
      - "8083:8083"
    depends_on:
      postgres:
        condition: service_healthy
      auth-service:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8083/api/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    networks:
      - bonareago-network

  # Matching Service
  matching-service:
    image: ghcr.io/your-org/bonareago/matching-service:${VERSION:-latest}
    environment:
      DATABASE_URL: ${DATABASE_URL}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      OIDC_ISSUER_URI: ${OIDC_ISSUER_URI}
      REQUIRE_ROLE_EMPLOYEE: ${REQUIRE_ROLE_EMPLOYEE:-true}
    ports:
      - "8084:8084"
    depends_on:
      postgres:
        condition: service_healthy
      auth-service:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8084/api/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    networks:
      - bonareago-network

  # Notification Service
  notification-service:
    image: ghcr.io/your-org/bonareago/notification-service:${VERSION:-latest}
    environment:
      DATABASE_URL: ${DATABASE_URL}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      VAPID_PUBLIC_KEY: ${VAPID_PUBLIC_KEY}
      VAPID_PRIVATE_KEY: ${VAPID_PRIVATE_KEY}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
      SMTP_USERNAME: ${SMTP_USERNAME}
      SMTP_PASSWORD: ${SMTP_PASSWORD}
      SMTP_FROM: ${SMTP_FROM}
    ports:
      - "8085:8085"
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8085/api/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    networks:
      - bonareago-network

  # API Gateway
  gateway:
    image: ghcr.io/your-org/bonareago/gateway:${VERSION:-latest}
    ports:
      - "80:8080"
      - "443:8443"
    volumes:
      - ./Backend/gateway/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - auth-service
      - users-service
      - trips-service
      - booking-service
      - matching-service
      - notification-service
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    networks:
      - bonareago-network

  # Frontend
  frontend:
    image: ghcr.io/your-org/bonareago/frontend:${VERSION:-latest}
    environment:
      VITE_API_BASE_URL: ${VITE_API_BASE_URL}
      VITE_VAPID_PUBLIC_KEY: ${VITE_VAPID_PUBLIC_KEY}
    ports:
      - "3000:3000"
    depends_on:
      - gateway
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    networks:
      - bonareago-network

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  bonareago-network:
    driver: bridge
```

### Desplegar

```bash
# Cargar variables de entorno
source .env.production

# Desplegar
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Ver estado
docker-compose -f docker-compose.prod.yml ps
```

---

## Networking

### Red Interna

Todos los servicios se comunican a través de la red `bonareago-network`:

```yaml
networks:
  bonareago-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### Puertos Expuestos

Solo exponer puertos necesarios al host:

- **80/443**: Gateway (acceso público)
- **3000**: Frontend (acceso público)
- **5432**: PostgreSQL (solo si se necesita acceso externo)

---

## Volúmenes y Persistencia

### Volúmenes Nombrados

```yaml
volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /data/bonareago/postgres
  
  redis_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /data/bonareago/redis
```

### Backup de Volúmenes

```bash
# Backup de PostgreSQL
docker exec bonareago_postgres pg_dump -U bonareago_user bonareago_prod | gzip > backup-$(date +%Y%m%d).sql.gz

# Backup de Redis
docker exec bonareago_redis redis-cli --rdb /data/dump.rdb
docker cp bonareago_redis:/data/dump.rdb backup-redis-$(date +%Y%m%d).rdb
```

---

## Health Checks

### Configuración

Cada servicio tiene health checks configurados:

```yaml
healthcheck:
  test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8081/api/health || exit 1"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Monitoreo

```bash
# Ver estado de health checks
docker ps --format "table {{.Names}}\t{{.Status}}"

# Ver logs de health check
docker inspect --format='{{json .State.Health}}' bonareago_trips_service | jq
```

---

## Escalado

### Escalado Horizontal

```yaml
# docker-compose.scale.yml
services:
  trips-service:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Load Balancer

Configurar Nginx como load balancer:

```nginx
upstream trips-service {
    least_conn;
    server trips-service-1:8081;
    server trips-service-2:8081;
    server trips-service-3:8081;
}
```

---

## Troubleshooting

### Ver Logs

```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f trips-service

# Últimas 100 líneas
docker-compose logs --tail=100 trips-service
```

### Reiniciar Servicio

```bash
# Reiniciar servicio específico
docker-compose restart trips-service

# Recrear servicio
docker-compose up -d --force-recreate trips-service
```

### Acceder a Contenedor

```bash
# Shell en contenedor
docker exec -it bonareago_trips_service sh

# Ejecutar comando
docker exec bonareago_trips_service ls -la /app
```

### Verificar Conectividad

```bash
# Ping entre servicios
docker exec bonareago_trips_service ping postgres

# Curl a otro servicio
docker exec bonareago_trips_service wget --spider http://users-service:8082/api/health
```

---

## Comandos Útiles

```bash
# Ver uso de recursos
docker stats

# Limpiar recursos no usados
docker system prune -a

# Ver imágenes
docker images

# Ver volúmenes
docker volume ls

# Inspeccionar red
docker network inspect bonareago-network
```

---

## Referencias

- [Production Setup Guide](./production-setup.md)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
