# 🏗️ BACKEND - MASTER PLAN & PROGRESS REPORT

**Última actualización:** 20 de Enero de 2026  
**Proyecto:** RRFinances v1.0 - Sistema Financiero para Cooperativas

---

## 📋 Tabla de Contenidos

1. [Overview Arquitectura](#overview-arquitectura)
2. [Estado de Microservicios](#estado-de-microservicios)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Despliegue con Docker](#despliegue-con-docker)
5. [Git Submodules](#git-submodules)
6. [Instrucciones Setup Local](#instrucciones-setup-local)
7. [Producción](#producción)
8. [Plan de Acción](#plan-de-acción)

---

## 🏛️ Overview Arquitectura

### Topología

```
                    ┌─────────────────┐
                    │   FRONTEND      │
                    │    (Angular)    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   MS-CORE       │
                    │   (Gateway)     │ :8000
                    │  + Observab.    │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼────┐         ┌────▼────┐        ┌────▼────┐
    │ MS-AUTH │         │MS-PERSO │        │MS-CONFI │
    │ :8001   │         │ :8002   │        │ :8012   │
    └────┬────┘         └────┬────┘        └────┬────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                    ┌────────▼────────┐
                    │  PostgreSQL 15+ │
                    │  (BD Compartida)│
                    └─────────────────┘
```

**Componentes de Infra:**
- **NATS 2.11.8**: Message broker para inter-microservice communication
- **PostgreSQL 15+**: Base de datos compartida (pool de conexiones centralizado)
- **Prometheus + OTEL**: Observabilidad y tracing distribuido

---

## 📊 Estado de Microservicios

### Resumen Ejecutivo

| Microservicio | Puerto | Estado | Endpoints | Tests | Swagger | Plan Futuro |
|:--|:--|:--|:--|:--|:--|:--|
| **MS-CORE** | 8000 | ✅ Operativo | Gateway, health, metrics | Pendiente | Consolidar | OTEL + Tests |
| **MS-AUTH** | 8001 | ✅ Operativo | JWT, login, refresh | 30+ ✅ | Completo | Guards + Auditoría |
| **MS-PERSO** | 8002 | ✅ Operativo | CRUD personas, hexagonal | 50+ ✅ | Completo | Search avanzada |
| **MS-CONFI** | 8012 | ✅ Operativo | GEO + CIIU catálogos | 30+ ✅ | Parcial (GEO) | Swagger GEO |

---

### 1. MS-CORE (API Gateway Central)

**Propósito:** Orquestador de entrada única REST; punto central de observabilidad, resiliencia y seguridad.

**Características:**
- ✅ Integración de módulos ms-auth, ms-perso, ms-confi
- ✅ Prometheus metrics (7 tipos: HTTP, circuit-breaker, DB pool, MS latency, business events)
- ✅ OpenTelemetry auto-instrumentación integrada
- ✅ Circuit-breaker factory per-service para resiliencia
- ✅ Throttler global 100 req/60s
- ✅ Helmet (security headers)
- ✅ Health endpoint

**Estado Actual:**
- Compilación y linter: ✅ OK
- Tests: Pendientes (coverage <50%)
- Documentación: Análisis, diseño, data model, status, plan futuromarca en .prompts/

**Próximos Pasos:**
1. Configurar OTEL endpoint en .env y validar tracing distribuido
2. Implementar tests unitarios para MetricsService, CircuitBreaker, AuthGuard
3. Consolidar Swagger con rutas agregadas de ms-* 

**Enlace de Docs:** [.prompts/](ms-core/.prompts/)

---

### 2. MS-AUTH (Autenticación y Autorización)

**Propósito:** Gestión de usuarios, tokens JWT, sesiones y permisos.

**Características:**
- ✅ Dominios: usuario, perfil, sesión, horarios, historial, auditoría, reset password, autorizaciones temporales
- ✅ Arquitectura hexagonal con layers (application, domain, infrastructure, interface)
- ✅ JWT refresh token + access token (2h default)
- ✅ Endpoints: /signin, /refresh, /logout, /reset-password, CRUD usuarios/perfiles
- ✅ NATS handlers para async events
- ✅ PostgreSQL con TypeORM

**Estado Actual:**
- Compilación: ✅ OK
- Tests: 30+ pasando ✅
- Swagger: Completo y documentado ✅
- Auditoría: Implementada en tablas

**Próximos Pasos:**
1. Validar y optimizar guards por rol (ADMIN, USER, etc.)
2. Agregar rate-limiting por usuario en reset password
3. Implementar autenticación multi-factor (opcional)

**Enlace de Docs:** [.prompts/](ms-auth/.prompts/)

---

### 3. MS-PERSO (Gestión de Personas/Clientes)

**Propósito:** CRUD de personas, clientes, contactos y parámetros relacionados.

**Características:**
- ✅ Arquitectura hexagonal (domain-driven)
- ✅ Módulos: management (persona, cliente), operation, parameter (tiden), search
- ✅ Endpoints: CRUD, búsqueda avanzada, filtros por estado
- ✅ NATS context handlers
- ✅ Validaciones y DTOs completos

**Estado Actual:**
- Compilación: ✅ OK
- Tests: 50+ pasando ✅
- Swagger: Completo ✅
- Integración NATS: ✅ OK

**Próximos Pasos:**
1. Mejorar búsqueda con full-text search PostgreSQL
2. Agregar filtros complejos (multi-criterio)
3. Implementar caching de personas frecuentes

**Enlace de Docs:** [.prompts/](ms-perso/.prompts/)

---

### 4. MS-CONFI (Catálogos y Configuración)

**Propósito:** Catálogos de referencia (geografía, actividades económicas CIIU, parámetros).

**Características:**
- ✅ GEO: provincias, cantones, parroquias con CRUD y soft delete
- ✅ CIIU: secciones, actividades, árbol jerárquico, búsqueda
- ✅ Parámetros: color, icons, opcio, perfi, tofic (estructura presente)
- ✅ Scripts SQL: 001-CreateGeoCatalog.sql
- ✅ Endpoints con códigos SEPS (preservan ceros a izquierda)

**Estado Actual:**
- Compilación: ✅ OK
- Tests: 30+ pasando (CIIU) ✅
- Swagger: ✅ Completo para CIIU; GEO en guía markdown
- GEO endpoints: CRUD y búsqueda ✅

**Próximos Pasos:**
1. Consolidar Swagger para GEO (paridad con CIIU)
2. Tests unitarios para GEO
3. Auditoría en operaciones de catálogos

**Enlace de Docs:** [.prompts/](ms-confi/.prompts/)

---

## 🛠️ Stack Tecnológico

### Backend Common
| Layer | Tecnología | Versión | Propósito |
|:--|:--|:--|:--|
| **Framework** | NestJS | 11.1.3 | Framework REST + microservices |
| **Runtime** | Node.js | 20 (LTS) | JavaScript runtime |
| **Database** | PostgreSQL | 15+ | Base de datos principal |
| **ORM** | TypeORM | 0.3.25 | Object-relational mapping |
| **Messaging** | NATS | 2.11.8 + 2.29.3 | Event-driven architecture |
| **Observability** | Prometheus | prom-client 15.1.3 | Metrics collection |
| **Tracing** | OpenTelemetry | 1.9.0 + SDK 0.203.0 | Distributed tracing |
| **Security** | Helmet | 7.2.0 | HTTP security headers |
| **Validation** | class-validator | 0.14.2 | Data validation |
| **Transform** | class-transformer | 0.5.1 | DTO transformation |
| **Config** | @nestjs/config | 4.0.2 | Environment management |
| **HTTP** | Express | 5.0.3 (via NestJS) | Web server |

### Tooling
| Tool | Versión | Propósito |
|:--|:--|:--|
| **Linter** | ESLint 9.28.0 + TS 8.34.0 | Code quality |
| **Formatter** | Prettier 3.5.3 | Code formatting |
| **Testing** | Jest 29.7.0 | Unit & integration tests |
| **Test Utils** | Supertest 7.1.1 | HTTP assertion |
| **TypeScript** | 5.8.3 | Type safety |
| **Build** | @nestjs/cli 11.0.7 | Build orchestration |

### Container & Infra
| Tool | Versión | Propósito |
|:--|:--|:--|
| **Container** | Docker | Latest | Containerización |
| **Orchestration** | Docker Compose | 3.8+ | Local + prod |
| **CI/CD** | (Pendiente) | - | Pipelines |

---

## 🐳 Despliegue con Docker

### Estructura

```
backend/
├── docker-compose.dev.yml      # Desarrollo (con hot-reload)
├── docker-compose.prod.yml     # Producción (multi-container)
├── .gitmodules                 # Git submodules config
├── ms-core/
│   ├── Dockerfile              # Build dev
│   ├── Dockerfile.prod         # Build prod
│   └── ...
├── ms-auth/
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   └── ...
├── ms-perso/
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   └── ...
└── ms-confi/
    ├── Dockerfile
    ├── Dockerfile.prod
    └── ...
```

### Docker Compose Dev (docker-compose.dev.yml)

**Servicios:**
- `nats-server`: NATS 2.11.8 (:8222)
- `ms-core`: Puerto 8000 (hot-reload)
- `ms-auth`: Puerto 8001 (hot-reload)
- `ms-perso`: Puerto 8002 (hot-reload)
- `ms-confi`: Puerto 8012 (comentado; descomentar si necesario)

**Características:**
- Volúmenes bind: código local sync en tiempo real
- Variables de entorno: BD, JWT, NATS, logging
- Comando: `npm run start:dev`

**Iniciar:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Docker Compose Prod (docker-compose.prod.yml)

**Servicios:**
- Todos los ms con Dockerfile.prod (production-ready)
- Container names: MS-AUTH-FINANTIX-PROD, MS-PERSO-FINANTIX-PROD, MS-CONFI-FINANTIX-PROD
- Restart policy: always
- Dependencias: todos dependen de nats-server

**Variables de Entorno:**
- Interpoladas desde .env (ej. ${portAuth}, ${dbHost}, etc.)
- JWT secrets, DB credentials, log levels

**Iniciar:**
```bash
docker-compose -f docker-compose.prod.yml --env-file .env up -d
```

### Dockerfile Estándar (cada MS)

```dockerfile
# Desarrollo
FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8000
CMD ["npm", "run", "start:dev"]
```

```dockerfile
# Producción
FROM node:20-alpine as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /usr/src/app/dist ./dist
EXPOSE 8000
CMD ["node", "dist/main"]
```

---

## 📦 Git Submodules

### Configuración (.gitmodules)

```properties
[submodule "ms-core"]
	path = ms-core
	url = https://github.com/XXXXXXXXX/MS-CORE.git

[submodule "ms-perso"]
	path = ms-perso
	url = https://github.com/XXXXXXXXX/MS-PERSO.git

[submodule "ms-confi"]
	path = ms-confi
	url = https://github.com/XXXXXXXXX/MS-CONFI.git

[submodule "ms-auth"]
	path = ms-auth
	url = https://github.com/XXXXXXXXX/MS-AUTH.git
```

### Manejo de Submodules

**Clonar con submodules:**
```bash
git clone --recurse-submodules <repo-url>
```

**Inicializar después de clonar sin --recurse-submodules:**
```bash
git submodule update --init --recursive
```

**Actualizar submodules a última versión:**
```bash
git submodule foreach --recursive git pull origin main
```

**Agregar cambios en submodule y push:**
```bash
cd ms-core
git add .
git commit -m "cambios"
git push origin main
cd ..
git add ms-core
git commit -m "Actualizar ms-core a última versión"
git push
```

---

## 🚀 Instrucciones Setup Local

### Prerequisitos

- **Node.js 20 LTS** ([descarga](https://nodejs.org))
- **Docker** ([descarga](https://www.docker.com/products/docker-desktop))
- **PostgreSQL 15+** (opcional si usas Docker)
- **Git** con soporte para submodules

### Opción 1: Docker Compose (Recomendado)

```bash
# 1. Clonar repositorio con submodules
git clone --recurse-submodules <repo-url>
cd AI4Devs-finalproject/3.\ desarrollo/backend

# 2. Crear .env con variables necesarias
# (Copiar desde docker-compose.dev.yml o .env.example de cada ms)

# 3. Levantar servicios
docker-compose -f docker-compose.dev.yml up -d

# 4. Verificar salud
curl http://localhost:8000/health    # MS-CORE
curl http://localhost:8001/health    # MS-AUTH
curl http://localhost:8002/health    # MS-PERSO
curl http://localhost:8012/health    # MS-CONFI (si está activo)

# 5. Ver logs
docker-compose -f docker-compose.dev.yml logs -f ms-core
```

### Opción 2: Local (Sin Docker)

```bash
# 1. Clonar y setup submodules
git clone --recurse-submodules <repo-url>
cd AI4Devs-finalproject/3.\ desarrollo/backend

# 2. Setup cada MS
for ms in ms-core ms-auth ms-perso ms-confi; do
  cd $ms
  npm install
  cd ..
done

# 3. Crear .env en cada MS (ver docker-compose.dev.yml para variables)

# 4. Levantar NATS (en terminal separada)
docker run -d -p 4222:4222 -p 8222:8222 nats:2.11.8

# 5. Levantar cada MS (en terminals separadas)
cd ms-core && npm run start:dev
cd ms-auth && npm run start:dev
cd ms-perso && npm run start:dev
cd ms-confi && npm run start:dev
```

### Acceso a Endpoints

- **MS-CORE Gateway:** http://localhost:8000
- **MS-AUTH:** http://localhost:8001 (Swagger: /doc)
- **MS-PERSO:** http://localhost:8002 (Swagger: /doc)
- **MS-CONFI:** http://localhost:8012 (Swagger: /doc)
- **NATS Admin:** http://localhost:8222

### Ejemplo: Login y Acceso a API

```bash
# 1. Login (MS-AUTH)
curl -X POST http://localhost:8001/signin \
  -H "Content-Type: application/json" \
  -d '{
    "usua_ema_usua": "user@example.com",
    "usua_pas_usua": "password123"
  }'

# Respuesta: { "accessToken": "...", "refreshToken": "..." }

# 2. Usar token en peticiones (MS-PERSO)
curl -X GET http://localhost:8002/personas \
  -H "Authorization: Bearer <accessToken>"
```

---

## 🏭 Producción

### Pre-Deployment Checklist

- [ ] Archivo `.env` con variables de producción (DB, JWT, NATS, logging)
- [ ] Certificados HTTPS (si aplica)
- [ ] PostgreSQL 15+ en cloud (AWS RDS, Google Cloud SQL, Azure Database)
- [ ] NATS en cluster mode (múltiples nodos para HA)
- [ ] Prometheus y Grafana para monitoreo
- [ ] Jaeger/Datadog para tracing OTEL
- [ ] Backups automatizados de BD
- [ ] Logs centralizados (ELK, Datadog, CloudWatch)

### Deploy con Docker Compose Prod

```bash
# 1. Preparar .env
cat > .env << EOF
portCore=8000
portAuth=8001
portPerso=8002
portConfi=8012
dbHost=<cloud-db-host>
dbPort=5432
dbUser=<prod-user>
dbPassword=<secure-password>
dbName=FINANTIXV2
jwtSecret=<secure-jwt-secret>
jwtExpiresIn=2h
jwtRefreshExpiresIn=7d
logLevel=info
logFormat=json
EOF

# 2. Build images
docker-compose -f docker-compose.prod.yml build

# 3. Push a registry (optional)
docker tag ms-core-finantix-prod:latest <registry>/ms-core:latest
docker push <registry>/ms-core:latest
# Repetir para cada ms

# 4. Deploy
docker-compose -f docker-compose.prod.yml up -d

# 5. Verificar
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

### Escalado Horizontal

- **Load Balancer:** Nginx, HAProxy o cloud LB (AWS ALB, GCP LB)
- **Múltiples instancias:** Docker Swarm o Kubernetes
- **Shared BD:** PostgreSQL externa con replicación
- **NATS Cluster:** Múltiples nodos NATS para HA

---

## 📈 Plan de Acción

### Sprint Actual (Próximas 2-4 semanas)

**MS-CORE:**
- [ ] Implementar tests unitarios (MetricsService, CircuitBreaker)
- [ ] Validar OTEL tracing end-to-end
- [ ] Consolidar Swagger con rutas agregadas

**MS-AUTH:**
- [ ] Agregar 2FA (opcional)
- [ ] Optimizar guards por rol
- [ ] Rate-limiting en reset password

**MS-PERSO:**
- [ ] Full-text search avanzada
- [ ] Filtros multi-criterio
- [ ] Caching de frecuentes

**MS-CONFI:**
- [ ] Swagger consolidado para GEO
- [ ] Tests unitarios para GEO
- [ ] Auditoría en cambios de catálogos

### Mid-term (1-2 meses)

- [ ] CI/CD pipeline (GitHub Actions, GitLab CI)
- [ ] Staging environment con data dummy
- [ ] Load testing y optimización
- [ ] Runbooks para operaciones

### Long-term (3+ meses)

- [ ] Replicación BD y HA
- [ ] Kubernetes deployment
- [ ] Advanced observability (custom dashboards)
- [ ] Microservicios adicionales (reportes, notificaciones, etc.)

---

## 📚 Documentación Referenciada

Cada microservicio tiene su propia colección de prompts en `.prompts/`:

- [MS-CORE Prompts](ms-core/.prompts/)
- [MS-AUTH Prompts](ms-auth/.prompts/)
- [MS-PERSO Prompts](ms-perso/.prompts/)
- [MS-CONFI Prompts](ms-confi/.prompts/)

**Archivos de cada prompts:**
- `00-README.md` - Índice
- `01-microservice-overview.md` - Overview
- `02-prompt-library.md` - Prompts reutilizables
- `03-worklog-resumen.md` - Historial
- `04-analisis.md` - Análisis funcional
- `05-diseno.md` - Diseño técnico
- `06-modelo-datos.md` - Modelos de datos
- `07-estado-desarrollo.md` - Estado actual
- `08-plan-futuro.md` - Roadmap

---

## 🆘 Troubleshooting

### Error: "Cannot connect to NATS"
```bash
# Verificar NATS está corriendo
docker ps | grep nats

# Si no, levantarlo
docker run -d -p 4222:4222 -p 8222:8222 nats:2.11.8
```

### Error: "DB Connection Refused"
```bash
# Verificar BD está accesible
psql -h <dbHost> -p <dbPort> -U <dbUser> -d FINANTIXV2

# Si local, levantar PostgreSQL
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15
```

### Error: "Port already in use"
```bash
# Cambiar puerto en .env o docker-compose.dev.yml
# O liberar puerto
lsof -i :8000 | grep LISTEN
kill -9 <PID>
```

---

## 📞 Contacto & Soporte

- **Issues:** GitHub Issues en cada repo de submodule
- **Docs:** Ver carpeta `../../../prompts/` para diagramas de arquitectura
- **Status:** Actualizado al 20 de Enero de 2026

---

**RRFinances Backend Team**  
Versión: 1.0.0  
Estado: ✅ En Desarrollo Activo
