# Estructura de Directorios y Configuración Docker - CitaYa

## 📁 Estructura de Directorios

Según el README, la aplicación debe seguir esta estructura:

```
citaya/
├── frontend/                    # Aplicación Next.js 14+
│   ├── app/                    # App Router (Next.js 14+)
│   │   ├── [locale]/          # Rutas internacionalizadas (es, en)
│   │   │   ├── (auth)/        # Rutas de autenticación
│   │   │   ├── (patient)/     # Panel de paciente
│   │   │   ├── (doctor)/      # Panel de médico
│   │   │   └── (admin)/       # Panel de administrador
│   │   └── api/               # API Routes (proxies, webhooks)
│   ├── components/            # Componentes React reutilizables
│   │   ├── ui/               # Componentes base (Button, Input, etc.)
│   │   ├── maps/             # Componentes de Google Maps
│   │   └── forms/            # Formularios
│   ├── lib/                  # Utilidades y helpers
│   │   ├── i18n/            # Configuración de internacionalización
│   │   ├── api/             # Cliente API (fetch wrappers)
│   │   └── utils/           # Funciones auxiliares
│   ├── hooks/               # Custom React hooks
│   ├── store/               # Estado global (Zustand)
│   ├── public/              # Assets estáticos
│   │   └── sw.js            # Service Worker (implementación fase posterior)
│   ├── tests/               # Tests unitarios e integración
│   └── middleware.ts        # Middleware Next.js (auth, i18n)
│
├── backend/                  # API Node.js + Express
│   ├── src/
│   │   ├── controllers/     # Controladores (manejan requests HTTP)
│   │   │   └── health.controller.ts  # Health check endpoint
│   │   ├── services/        # Lógica de negocio
│   │   ├── repositories/    # Acceso a datos (abstracción BD)
│   │   ├── models/          # Modelos de datos (TypeORM)
│   │   ├── middleware/      # Middleware Express (auth, validation, error handling)
│   │   ├── routes/          # Definición de rutas
│   │   │   └── health.routes.ts  # Ruta /health
│   │   ├── utils/           # Utilidades (validators, helpers)
│   │   ├── config/          # Configuración (env, DB, etc.)
│   │   │   └── database.ts  # Configuración TypeORM + MySQL
│   │   ├── jobs/            # Background jobs (bull queues)
│   │   └── types/           # TypeScript types/interfaces
│   ├── migrations/          # Migraciones de BD (TypeORM)
│   │   ├── 1234567890-CreateUsersTable.ts
│   │   ├── 1234567891-CreateDoctorsTable.ts
│   │   └── rollback/        # Scripts de rollback SQL
│   │       ├── 1234567890-CreateUsersTable.rollback.sql
│   │       └── 1234567891-CreateDoctorsTable.rollback.sql
│   ├── seeds/               # Datos de prueba
│   └── tests/               # Tests unitarios e integración
│
├── workers/                  # Background workers
│   ├── src/
│   │   ├── queues/          # Definición de colas (bull)
│   │   ├── processors/      # Procesadores de jobs
│   │   ├── schedulers/      # Cron jobs (recordatorios)
│   │   └── batch/           # Procesamiento batch (dashboards admin)
│   │       ├── daily-reports.ts
│   │       └── analytics.ts
│
├── infrastructure/           # Infraestructura como código
│   ├── docker/              # Dockerfiles
│   │   ├── Dockerfile.frontend
│   │   ├── Dockerfile.backend
│   │   └── Dockerfile.worker
│   ├── docker-compose.prod.yml  # Producción VPS
│   └── ansible/             # Provisioning VPS (opcional)
│       └── playbooks/
│
├── scripts/                  # Scripts de automatización
│   ├── monitoring/           # Scripts de monitoreo
│   │   ├── health-check.sh   # Verificación /health endpoint
│   │   ├── check-disk.sh     # Verificación espacio disco
│   │   ├── check-db.sh       # Verificación conexión MySQL
│   │   └── alert-discord.sh  # Envío alertas a Discord
│   └── deployment/           # Scripts de despliegue
│       ├── deploy.sh         # Despliegue por SSH
│       ├── rollback.sh        # Rollback de despliegue
│       └── migrate.sh         # Ejecución migraciones con rollback
│
├── monitoring/               # Configuración de observabilidad
│   ├── basic/               # Monitoreo básico MVP
│   │   ├── health-check-config.json
│   │   └── alert-rules.json  # Reglas de alertas Discord
│   └── advanced/            # Monitoreo avanzado (fase posterior)
│       ├── prometheus/       # Configuración Prometheus
│       │   └── prometheus.yml
│       ├── grafana/          # Dashboards y datasources
│       │   └── dashboards/
│       └── loki/             # Configuración Loki
│           └── loki-config.yml
│
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
│       ├── frontend.yml     # Build y test frontend
│       ├── backend.yml      # Build y test backend
│       └── deploy.yml       # Despliegue a VPS (SSH + GitHub Container Registry)
│
├── docs/                    # Documentación adicional
│   ├── api/                 # Documentación API (OpenAPI/Swagger)
│   ├── deployment/           # Guías de despliegue
│   │   └── ssl-setup.md     # Documentación Certbot/Let's Encrypt
│   └── architecture/         # Documentación arquitectura
│
├── docker-compose.yml      # Orquestación local (desarrollo) - EN LA RAIZ
├── .gitignore
├── package.json            # Workspace root (opcional)
└── README.md               # Este archivo
```

### Notas Importantes sobre la Estructura:

1. **`docker-compose.yml` en la raíz**: Según tus requerimientos, el archivo debe estar en la raíz del proyecto, no en `infrastructure/`
2. **Dockerfiles en `infrastructure/docker/`**: Los Dockerfiles se mantienen en esa ubicación
3. **Patrón arquitectónico**: Clean Architecture / Hexagonal Architecture con separación de capas

---

## 🐳 Configuración Docker para Desarrollo Local

### Archivo: `docker-compose.yml` (Raíz del proyecto)

```yaml
version: '3.8'

services:
  # MySQL 8.0 - Base de datos principal
  mysql:
    image: mysql:8.0
    container_name: citaya_mysql
    environment:
      MYSQL_ROOT_PASSWORD: root_password_dev
      MYSQL_DATABASE: citaya_dev
      MYSQL_USER: citaya_user
      MYSQL_PASSWORD: citaya_password_dev
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/migrations:/docker-entrypoint-initdb.d
    command: --default-authentication-plugin=mysql_native_password
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-proot_password_dev"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - citaya_network

  # Redis 7 - Cache y sesiones
  redis:
    image: redis:7-alpine
    container_name: citaya_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - citaya_network

  # Backend API - Node.js + Express
  backend:
    build:
      context: ./backend
      dockerfile: ../infrastructure/docker/Dockerfile.backend
    container_name: citaya_backend
    ports:
      - "4000:4000"
    volumes:
      # Hot reload: montar código fuente
      - ./backend/src:/app/src
      - ./backend/package.json:/app/package.json
      - ./backend/tsconfig.json:/app/tsconfig.json
      # Excluir node_modules del volumen para usar los del contenedor
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_NAME=citaya_dev
      - DB_USER=citaya_user
      - DB_PASSWORD=citaya_password_dev
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=dev_jwt_secret_change_in_production
      - JWT_REFRESH_SECRET=dev_refresh_secret_change_in_production
      - API_PORT=4000
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: npm run dev
    networks:
      - citaya_network
    restart: unless-stopped

  # Frontend - Next.js
  frontend:
    build:
      context: ./frontend
      dockerfile: ../infrastructure/docker/Dockerfile.frontend
    container_name: citaya_frontend
    ports:
      - "3000:3000"
    volumes:
      # Hot reload: montar código fuente
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
      - WATCHPACK_POLLING=true
    depends_on:
      - backend
    command: npm run dev
    networks:
      - citaya_network
    restart: unless-stopped

  # Workers - Background jobs
  worker:
    build:
      context: ./workers
      dockerfile: ../infrastructure/docker/Dockerfile.worker
    container_name: citaya_worker
    volumes:
      # Hot reload: montar código fuente
      - ./workers/src:/app/src
      - ./workers/package.json:/app/package.json
      - ./workers/tsconfig.json:/app/tsconfig.json
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_NAME=citaya_dev
      - DB_USER=citaya_user
      - DB_PASSWORD=citaya_password_dev
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - SENDGRID_API_KEY=${SENDGRID_API_KEY:-}
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: npm run dev
    networks:
      - citaya_network
    restart: unless-stopped

volumes:
  mysql_data:
    driver: local
  redis_data:
    driver: local

networks:
  citaya_network:
    driver: bridge
```

### Características de la Configuración:

1. **Hot Reload Habilitado**:
   - Volúmenes montan el código fuente (`./backend/src`, `./frontend`, `./workers/src`)
   - `node_modules` excluidos del volumen para usar los del contenedor
   - Comandos `npm run dev` para desarrollo con watch mode

2. **Persistencia de Datos**:
   - Volúmenes nombrados `mysql_data` y `redis_data` para persistir datos entre reinicios
   - Los datos se mantienen incluso si se eliminan los contenedores

3. **Puertos Estándar**:
   - Frontend: `3000`
   - Backend: `4000`
   - MySQL: `3306`
   - Redis: `6379`

4. **Health Checks**:
   - MySQL y Redis tienen health checks para asegurar que estén listos antes de iniciar dependencias

5. **Red Docker**:
   - Todos los servicios en la misma red `citaya_network` para comunicación interna

### Comandos Útiles:

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ elimina datos)
docker-compose down -v

# Reconstruir imágenes
docker-compose build --no-cache

# Ejecutar migraciones
docker-compose exec backend npm run migration:run

# Acceder a MySQL
docker-compose exec mysql mysql -u citaya_user -p citaya_dev

# Acceder a Redis CLI
docker-compose exec redis redis-cli
```

---

## ⚠️ Contradicción Encontrada en Reglas de Negocio

### Problema: Validación de "Cita Activa"

**Ubicación del conflicto**:
- `documentation/HU4/backend/HU4-BE-001-Reserva-Cita.md` (línea 113)
- `readme.md` (línea 2380)

**Condición actual en el código de ejemplo**:
```typescript
.andWhere('appointment.appointment_date > NOW()')
```

**Problema**: Esta condición solo valida citas **futuras** (después de la hora actual), pero según tu confirmación, debe incluir también citas del **día actual**.

**Solución recomendada**:
```typescript
// Opción 1: Incluir citas del día actual
.andWhere('appointment.appointment_date >= CURDATE()')

// Opción 2: Usar DATE() para comparar solo la fecha
.andWhere('DATE(appointment.appointment_date) >= CURDATE()')

// Opción 3: En TypeORM con MySQL
.andWhere('DATE(appointment.appointment_date) >= DATE(NOW())')
```

**Impacto**: Esta corrección afecta:
- ✅ Backend: Servicio de citas (`backend/src/services/appointment.service.ts`)
- ✅ Validación en endpoint de reserva (`backend/src/controllers/appointment.controller.ts`)
- ✅ Tests: Actualizar tests unitarios e integración que validen esta regla

**Recomendación**: Actualizar la documentación y el código de ejemplo para reflejar que la restricción aplica a citas del día actual y futuras, no solo futuras.

---

## 📝 Resumen de Configuración Docker

| Servicio | Imagen | Puerto | Volumen | Hot Reload |
|----------|--------|-------|---------|------------|
| MySQL | mysql:8.0 | 3306 | `mysql_data` | ❌ |
| Redis | redis:7-alpine | 6379 | `redis_data` | ❌ |
| Backend | Custom | 4000 | `./backend/src` | ✅ |
| Frontend | Custom | 3000 | `./frontend` | ✅ |
| Worker | Custom | - | `./workers/src` | ✅ |

**Nota**: Los Dockerfiles deben estar en `infrastructure/docker/` y configurados para desarrollo con hot reload usando `nodemon` o `ts-node-dev` para backend/workers, y `next dev` para frontend.

---

## 🟢 Versión de Node.js Recomendada

### **Node.js 20 LTS (Long Term Support)**

Según el README del proyecto, la versión especificada es **Node.js 20 LTS**.

**Versión específica recomendada**: `20.x.x` (última versión LTS disponible)

**Justificación**:
- ✅ **LTS (Long Term Support)**: Soporte hasta abril de 2026
- ✅ **Compatibilidad con Next.js 14+**: Requiere Node.js 18.17 o superior
- ✅ **Mejoras de rendimiento**: Node.js 20 incluye mejoras significativas en rendimiento
- ✅ **Soporte para TypeScript**: Compatible con TypeScript 5.3+
- ✅ **Ecosistema estable**: Todas las dependencias del proyecto son compatibles

### **Configuración en Dockerfiles**

#### **Dockerfile.backend** (ejemplo):
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 4000

# Comando para desarrollo (hot reload)
CMD ["npm", "run", "dev"]
```

#### **Dockerfile.frontend** (ejemplo):
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando para desarrollo (hot reload)
CMD ["npm", "run", "dev"]
```

#### **Dockerfile.worker** (ejemplo):
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Comando para desarrollo (hot reload)
CMD ["npm", "run", "dev"]
```

### **Verificación de Versión**

Para verificar la versión de Node.js en los contenedores:

```bash
# Verificar versión en backend
docker-compose exec backend node --version

# Verificar versión en frontend
docker-compose exec frontend node --version

# Verificar versión en worker
docker-compose exec worker node --version
```

**Resultado esperado**: `v20.x.x` (ejemplo: `v20.11.0`)

### **Notas Adicionales**

1. **Alpine vs Debian**: Se recomienda usar `node:20-alpine` para imágenes más ligeras (menor tamaño)
2. **Actualizaciones**: Mantener actualizado dentro de la línea 20.x.x para recibir parches de seguridad
3. **Producción**: Usar la misma versión en desarrollo y producción para evitar inconsistencias
4. **package.json**: Especificar el engine en `package.json`:
   ```json
   {
     "engines": {
       "node": ">=20.0.0",
       "npm": ">=10.0.0"
     }
   }
   ```
