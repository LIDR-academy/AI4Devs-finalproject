# ADR-011: Despliegue en Producción — Docker + ECR + AWS Lightsail + Caddy

**Estado**: ✅ Aceptada  
**Fecha**: 2026-03-15  
**Reemplaza**: Plan original de Konsole H + Traefik (nunca implementado)

---

## Contexto

El MVP de Adresles necesitaba una infraestructura de producción real (no local) para demostrar el sistema funcionando. Los requisitos eran:

- **Coste mínimo**: entorno MVP sin comprometer dinero innecesario
- **HTTPS automático**: certificado SSL para `backend.adresles.com`
- **CI/CD**: despliegue automático al hacer push a `main`
- **Reproducibilidad**: misma configuración en local y producción (Docker)
- **Aislamiento**: el dominio principal `adresles.com` (WordPress) no debe verse afectado
- **Frontend separado**: `web-admin` en Vercel (Free tier, sin Dockerizar)

**Restricción importante**: `api.adresles.com` estaba ya en uso por otra aplicación del dominio.

---

## Decisión

Se adopta una arquitectura de **servidor único** con los siguientes componentes:

### Infraestructura


| Componente             | Tecnología                                    | Propósito                              |
| ---------------------- | --------------------------------------------- | -------------------------------------- |
| **Compute**            | AWS Lightsail `small_3_0` ($12/mes, 2 GB RAM) | Servidor Ubuntu 22.04 con IPv4 pública |
| **Container Registry** | AWS ECR (`eu-central-1`)                      | Imágenes Docker privadas               |
| **Reverse Proxy**      | Caddy 2 (`caddy:2-alpine`)                    | HTTPS automático con Let's Encrypt     |
| **Backend API**        | Docker container                              | NestJS en puerto 3000 (interno)        |
| **Worker**             | Docker container                              | BullMQ + OpenAI                        |
| **Redis**              | Docker container `redis:7-alpine`             | Colas + Pub/Sub                        |
| **Orquestación**       | Docker Compose (`docker-compose.prod.yml`)    | Stack completo en un servidor          |
| **Frontend**           | Vercel (Free tier)                            | `simulator.adresles.com`               |
| **CI/CD**              | GitHub Actions                                | Push a `main` → ECR → SSH → Compose up |


### DNS


| Subdominio               | Tipo  | Destino                | Propósito       |
| ------------------------ | ----- | ---------------------- | --------------- |
| `adresles.com`           | A     | KonsoleH/WordPress     | **NO TOCADO**   |
| `backend.adresles.com`   | A     | `52.57.222.42`         | API REST        |
| `simulator.adresles.com` | CNAME | `cname.vercel-dns.com` | Dashboard Admin |


### Dockerfiles (multi-stage)

Ambas apps (`api` y `worker`) usan el patrón:

1. **Stage `builder`**: instala todo el monorepo, compila TypeScript, ejecuta `pnpm deploy --prod`
2. **Stage `runner`**: imagen mínima (`node:20-alpine`) con solo `node_modules` + `dist/`

**Correcciones aplicadas durante el despliegue**:

- `CMD ["node", "dist/src/main.js"]` (no `dist/main.js`) — el tsconfig de la API no tiene `rootDir`, por lo que TypeScript compila a `dist/src/`
- `RUN apk add --no-cache openssl` en el runner — Prisma necesita detectar OpenSSL 3.x en Alpine para cargar el engine correcto
- `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` en `schema.prisma` — Alpine 3.17+ usa OpenSSL 3.x (no 1.1)
- `dotenv` movido de `devDependencies` a `dependencies` en `apps/worker/package.json` — `pnpm deploy --prod` excluye devDeps

---

## Alternativas Consideradas

### Opción A: Konsole H + Traefik (plan original)

- **Ventaja**: servidor ya pagado, conocido
- **Descartada**: Konsole H no tenía acceso SSH/Docker directo en el momento del MVP; Traefik implica más configuración

### Opción B: AWS ECS Fargate

- **Ventaja**: escalado automático, sin gestión de servidor
- **Descartada**: coste mínimo $30-50/mes para MVP; complejidad innecesaria

### Opción C: EC2 t4g.micro (elegida inicialmente)

- **Intentada**: `small_ipv6_3_0` de Lightsail solo tenía IPv6, sin IPv4 pública
- **Descartada**: se usó `small_3_0` con IPv4 pública (`52.57.222.42`)

### Opción D: Railway / Render / Fly.io

- **Ventaja**: más simple, sin gestión de servidor
- **Descartada**: coste difícil de predecir, monorepo complejo de configurar

---

## Consecuencias

### Positivas

- ✅ Stack completo en producción por ~$12/mes
- ✅ HTTPS automático sin configuración manual (Caddy + Let's Encrypt)
- ✅ CI/CD funcional con GitHub Actions → ECR → SSH
- ✅ `adresles.com` (WordPress) sin modificaciones
- ✅ Vercel gratuito para el frontend
- ✅ Imágenes privadas en ECR dentro de la misma región que la instancia

### Negativas / Compromisos

- ⚠️ Servidor único: si cae, caen API + Worker + Redis juntos
- ⚠️ Redis sin persistencia fuera de Docker (datos de colas se pierden si el contenedor se reinicia limpio)
- ⚠️ ECR tiene coste de almacenamiento (~$0.01/GB/mes), mínimo para MVP
- ⚠️ `small_3_0` ($12/mes) vs Free tier de EC2 t2.micro — el free tier no tiene suficiente RAM para el stack completo

---

## Archivos Creados/Modificados


| Archivo                                         | Cambio                                               |
| ----------------------------------------------- | ---------------------------------------------------- |
| `apps/api/Dockerfile`                           | Nuevo — multi-stage build monorepo                   |
| `apps/worker/Dockerfile`                        | Nuevo — multi-stage build monorepo                   |
| `infrastructure/docker/docker-compose.prod.yml` | Nuevo — stack producción (api, worker, redis, caddy) |
| `infrastructure/docker/Caddyfile`               | Nuevo — `backend.adresles.com` con HTTPS automático  |
| `.env.prod.example`                             | Nuevo — plantilla de variables de producción         |
| `.github/workflows/deploy.yml`                  | Nuevo — CI/CD GitHub Actions → ECR → Lightsail       |
| `.dockerignore`                                 | Nuevo — optimiza el contexto de build                |
| `.gitignore`                                    | Actualizado — `pnpm-lock.yaml` des-ignorado          |
| `packages/shared-types/package.json`            | Actualizado — campo `files: ["dist"]`                |
| `packages/prisma-db/schema.prisma`              | Actualizado — `binaryTargets` para Alpine            |
| `apps/worker/package.json`                      | Actualizado — `dotenv` movido a `dependencies`       |


---

## URLs de Producción


| Servicio               | URL                                                               |
| ---------------------- | ----------------------------------------------------------------- |
| **API** (health check) | `https://backend.adresles.com/api`                                |
| **Dashboard Admin**    | `https://simulator.adresles.com`                                  |
| **ECR** (API)          | `788980370883.dkr.ecr.eu-central-1.amazonaws.com/adresles-api`    |
| **ECR** (Worker)       | `788980370883.dkr.ecr.eu-central-1.amazonaws.com/adresles-worker` |
| **Lightsail IP**       | `52.57.222.42`                                                    |


---

## Referencias

- [ADR-001: Monolito Modular](./001-monolith-modular.md)
- [ADR-010: DynamoDB AWS Multi-entorno](./010-dynamodb-aws-multienv.md)
- [docker-compose.prod.yml](../../infrastructure/docker/docker-compose.prod.yml)
- [deploy.yml](../../.github/workflows/deploy.yml)

