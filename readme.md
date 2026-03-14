## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:** Luis Enrique Alonso Sierra

### **0.2. Nombre del proyecto:** CitaYa

### **0.3. Descripción breve del proyecto:**
Plataforma web “CitaYa” que permite a pacientes encontrar médicos cercanos por especialidad y disponibilidad, reservar citas, recibir confirmaciones y calificar la atención.

### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido


---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**
Plataforma web “CitaYa” que conecta a pacientes con médicos cercanos para reservar citas presenciales de forma ágil y segura. Aporta:
- Valor al paciente: encontrar rápidamente médicos por especialidad y cercanía, ver disponibilidad en horario de CDMX, reservar, reprogramar/cancelar sin penalización y recibir recordatorios y confirmaciones.
- Valor al médico: publicar disponibilidad, evitar sobrecupo con bloqueo de slots, recibir notificaciones y gestionar su agenda y reputación (reseñas).
- Valor operativo: admins pueden validar credenciales profesionales y moderar reseñas para mantener confianza y calidad.

### **1.2. Características y funcionalidades principales:**
- Autenticación y roles: registro/login por email/contraseña; roles paciente, médico y admin.
- Verificación médica: carga de cédula profesional (imagen/PDF); revisión manual por admin con estados pendiente/aprobado/rechazado.
- Búsqueda y filtrado: por especialidad, disponibilidad y proximidad; radio inicial 5 km editable; fallback por código postal.
- Geolocalización y mapa: permiso de ubicación, render de médicos cercanos en Google Maps.
- Agenda y disponibilidad: zona horaria fija CDMX; duración estándar de cita; bloques configurables por médico.
- Reserva de citas: selección y bloqueo transaccional del slot para evitar doble booking; confirmación inmediata.
- Gestión de cambios: reprogramar y cancelar sin penalizaciones ni límites de citas activas por paciente.
- Notificaciones: email transaccional (SendGrid) y push web; recordatorio 30 minutos antes de la cita y avisos de cambios/cancelaciones.
- Calificaciones y reseñas: escala 1-5 con texto obligatorio; moderación por admin; promedio visible en el perfil del médico.
- Panel del médico: agenda, próximas citas, estado de verificación, reseñas y calificación promedio.
- Dashboards básicos (admin): reservas por día/semana, cancelaciones, calificaciones promedio por médico/especialidad y mapa de demanda. Procesamiento batch diario con visualizaciones prioritarias en gráficos y tablas.
- Idiomas: soporte bilingüe ES/EN desde el lanzamiento.

### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

### **1.4. Instrucciones de instalación:**
> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

La arquitectura propuesta sigue un patrón **monolítico modular** con separación clara de responsabilidades, preparada para evolucionar hacia microservicios si es necesario. Se basa en una arquitectura de **3 capas** (presentación, aplicación, datos) con servicios externos para funcionalidades específicas.

```mermaid
graph TB
    subgraph "Cliente"
        WEB[Web Browser<br/>Next.js App]
    end
    
    subgraph "CDN / Edge (Opcional)"
        CF[CloudFlare<br/>CDN + DDoS Protection<br/>Opcional para MVP]
    end
    
    subgraph "Capa de Presentación"
        LB[Load Balancer<br/>Nginx]
        FE[Frontend Instance<br/>Next.js SSR<br/>Escalable después]
    end
    
    subgraph "Capa de Aplicación"
        API[API Instance<br/>Node.js + Express<br/>Escalable después]
        WORKER[Background Workers<br/>Node.js Workers<br/>Mismo VPS]
    end
    
    subgraph "Capa de Datos"
        MYSQL[(MySQL 8.0 / MariaDB 10.11<br/>Primary<br/>Réplicas después)]
        REDIS[(Redis 7<br/>Cache + Sessions)]
        STORAGE[(Sistema de Archivos<br/>VPS - Archivos Estáticos)]
    end
    
    subgraph "Servicios Externos"
        GM[Google Maps API<br/>Geolocalización]
        SG[SendGrid API<br/>Emails Transaccionales]
        RECAPTCHA[reCAPTCHA v3<br/>Protección Anti-bot]
    end
    
    subgraph "Observabilidad (MVP Básico)"
        MONITOR[Scripts de Monitoreo<br/>Health Checks<br/>Alertas Discord]
        PROM[Prometheus<br/>Métricas Básicas<br/>Grafana después]
    end
    
    WEB -->|HTTPS| CF
    CF -.->|Opcional| LB
    WEB -->|HTTPS Directo| LB
    LB --> FE
    FE -->|API Calls| API
    API --> MYSQL
    API --> REDIS
    API --> GM
    API --> RECAPTCHA
    WORKER --> MYSQL
    WORKER --> REDIS
    WORKER --> SG
    API --> STORAGE
    
    API -.->|/health| MONITOR
    API -.->|Métricas| PROM
    WORKER -.->|Métricas| PROM
    MONITOR -.->|Alertas| DISCORD[Discord Webhook<br/>Errores 500, DB, Disco]
```

#### **Patrón Arquitectónico: Monolítico Modular**

**Justificación:**
- **Escalabilidad horizontal**: Permite escalar frontend y backend de forma independiente
- **Simplicidad operativa**: Menor complejidad que microservicios para el MVP
- **Costos optimizados**: Menos overhead de infraestructura que arquitecturas distribuidas
- **Preparado para evolución**: Estructura modular facilita extracción futura a microservicios

**Beneficios:**
- ✅ Desarrollo rápido y despliegue simplificado
- ✅ Transacciones ACID garantizadas en una única BD
- ✅ Debugging y monitoreo más sencillo
- ✅ Menor latencia entre componentes
- ✅ Infraestructura como código con Docker Compose (MVP) y Kubernetes (producción)

**Sacrificios/Déficits:**
- ⚠️ Escalado acoplado: cambios en backend requieren redeploy completo
- ⚠️ Tecnología única: todo el backend en Node.js (mitigado por modularidad)
- ⚠️ Punto único de fallo: mitigado con múltiples instancias y load balancer

### **2.2. Descripción de componentes principales:**

#### **Frontend - Next.js 14+ (App Router)**
- **Tecnología**: React 18+, Next.js 14+ con App Router, TypeScript
- **Responsabilidades**:
  - Renderizado SSR/SSG para mejor SEO y performance
  - Gestión de estado con React Context + Zustand
  - Internacionalización con `next-intl` (ES/EN)
  - Integración con Google Maps JavaScript API
  - **Service Workers**: Implementación en fase posterior (no MVP inicial)
- **Características**:
  - Server Components para reducir bundle size
  - Client Components solo donde se requiere interactividad
  - Optimización automática de imágenes y assets
- **Web Push**: VAPID keys a generar cuando se implementen Service Workers

#### **Backend API - Node.js + Express**
- **Tecnología**: Node.js 20 LTS, Express.js, TypeScript
- **Responsabilidades**:
  - API RESTful con validación de esquemas (Zod)
  - Autenticación JWT con refresh tokens
  - Lógica de negocio (reservas, disponibilidad, bloqueo de slots)
  - Integración con servicios externos (SendGrid, Google Maps, reCAPTCHA)
  - Rate limiting y protección CSRF
- **Estructura**: Arquitectura por capas (Controllers → Services → Repositories → Models)

#### **Base de Datos - MySQL 8.0 / MariaDB 10.11**
- **Tecnología**: MySQL 8.0+ o MariaDB 10.11+ (compatibles)
- **ORM**: TypeORM (mejor soporte para MySQL)
- **Responsabilidades**:
  - Almacenamiento transaccional de todas las entidades
  - Transacciones ACID para bloqueo de slots (evitar doble booking)
  - Índices optimizados para búsquedas por especialidad y geolocalización
  - Constraints de integridad referencial
- **Configuración MVP**:
  - **Inicial**: Una sola instancia MySQL (Primary)
  - **Escalado**: Read Replicas se añadirán cuando el tráfico lo requiera
  - Backups automáticos diarios con `mysqldump` y retención de 30 días
  - Connection pooling con `mysql2` (built-in pool)
  - Motor de almacenamiento: InnoDB (soporte ACID completo)
- **Migraciones**:
  - Gestión con TypeORM migrations
  - Ejecución automática en CI/CD con plan de rollback
  - Scripts de rollback preparados para cada migración

#### **Cache y Sesiones - Redis 7**
- **Tecnología**: Redis 7 en modo standalone (instalado en VPS)
- **Responsabilidades**:
  - Almacenamiento de sesiones de usuario (TTL configurable)
  - Cache de consultas frecuentes (médicos por especialidad, disponibilidad)
  - Rate limiting distribuido
  - Cola de trabajos para notificaciones asíncronas
- **TTL**: Sesiones 24h, cache de datos 5-15 minutos según criticidad
- **Configuración**: Instalación directa en VPS con persistencia AOF (Append Only File)

#### **Background Workers - Node.js**
- **Tecnología**: Node.js con `bull` (cola Redis-based)
- **Responsabilidades**:
  - Envío de emails transaccionales (SendGrid)
  - Envío de Web Push Notifications
  - Recordatorios 30 minutos antes de citas (cron jobs)
  - Procesamiento de tareas asíncronas (generación de reportes batch)
- **Escalado**: Múltiples workers para alta disponibilidad

#### **Almacenamiento de Archivos - Sistema de Archivos VPS**
- **Tecnología**: Sistema de archivos del VPS (ext4/xfs) con Nginx para servir archivos estáticos
- **Responsabilidades**:
  - Almacenamiento de cédulas profesionales (PDF/imágenes)
  - Almacenamiento de avatares de usuarios
  - Política de acceso: directorios privados con URLs firmadas temporales (tokens JWT)
- **Cumplimiento GDPR**: 
  - **Encriptación**: LUKS solo para directorios específicos con datos sensibles (`/var/www/citaya/storage/uploads/`)
  - **Permisos restrictivos**: Directorios con permisos 700 (solo propietario)
  - **Logs de acceso**: Nginx access logs
  - **Estructura**: `/var/www/citaya/storage/uploads/` (cédulas) y `/var/www/citaya/storage/avatares/` (avatares)
- **SSL/TLS**: Let's Encrypt con Certbot, renovación automática configurada

#### **Observabilidad - Monitoreo Básico MVP**
- **MVP Inicial**:
  - Scripts de monitoreo con health checks (`/health` endpoint)
  - Logs estructurados (JSON) en archivos del sistema
  - Alertas a Discord webhook (errores 500, DB caída, disco lleno)
  - Métricas básicas con Prometheus (sin Grafana inicialmente)
- **Escalado Futuro**:
  - Grafana para dashboards visuales (fase posterior)
  - Loki para agregación avanzada de logs (fase posterior)
- **Health Check Endpoint**: `/health` expuesto en API para monitoreo
- **Integración**: Exporters de Node.js (prom-client) y MySQL (mysqld_exporter)

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

```
citaya/
├── frontend/                    # Aplicación Next.js
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
│   ├── docker-compose.yml   # Desarrollo local
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
├── .env.example            # Variables de entorno de ejemplo
│   # Incluye: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY (para fase posterior)
├── docker-compose.yml      # Orquestación local (desarrollo)
├── .gitignore
├── package.json            # Workspace root (opcional)
└── README.md               # Este archivo
```

**Patrón Arquitectónico**: **Clean Architecture / Hexagonal Architecture**
- Separación clara de capas (presentación → aplicación → datos)
- Inversión de dependencias: servicios no dependen de frameworks
- Testabilidad: fácil mockear repositorios y servicios externos
- Independencia de frameworks: fácil cambiar Express por Fastify, MySQL por otro SQL

#### **Descripción de Componentes Principales de la Estructura**

**Frontend (`frontend/`)**:
- Aplicación Next.js 14+ con App Router e internacionalización (ES/EN)
- Estructura modular por roles: paciente, médico, admin
- Service Worker (`public/sw.js`) preparado para Web Push (implementación fase posterior)
- Tests en carpeta dedicada

**Backend (`backend/`)**:
- API RESTful con Express y TypeScript
- Arquitectura por capas: Controllers → Services → Repositories → Models
- Health check endpoint (`/health`) en `controllers/health.controller.ts`
- Migraciones TypeORM con estructura de rollback preparada
- Configuración TypeORM + MySQL en `config/database.ts`

**Workers (`workers/`)**:
- Procesamiento asíncrono con Bull (colas Redis)
- Cron jobs para recordatorios de citas
- Procesamiento batch diario para dashboards admin (`src/batch/`)

**Infraestructura (`infrastructure/`)**:
- Dockerfiles separados para cada servicio
- Docker Compose para desarrollo y producción
- Ansible opcional para provisioning del VPS

**Scripts (`scripts/`)**:
- **Monitoreo**: Health checks, verificación de recursos, alertas Discord
- **Despliegue**: Scripts SSH para despliegue automático, migraciones con rollback

**Monitoreo (`monitoring/`)**:
- **Básico (MVP)**: Configuración de health checks y alertas Discord
- **Avanzado (Fase posterior)**: Prometheus, Grafana, Loki

**CI/CD (`.github/workflows/`)**:
- Build y test separados para frontend y backend
- Despliegue automático a VPS mediante SSH y GitHub Container Registry

#### **Estructura MVP vs Escalado**

**MVP Inicial**:
- ✅ Estructura completa preparada para escalado
- ✅ Monitoreo básico (`monitoring/basic/`) con scripts y alertas Discord
- ✅ Health check endpoint implementado desde el inicio
- ✅ Migraciones con rollback preparadas
- ✅ Service Workers incluidos pero implementación en fase posterior
- ⏳ Monitoreo avanzado (`monitoring/advanced/`) para fase posterior
- ⏳ Grafana/Loki para dashboards avanzados (fase posterior)

**Escalado Futuro**:
- Añadir múltiples instancias de frontend/API (misma estructura)
- Implementar `monitoring/advanced/` con Prometheus/Grafana/Loki
- Activar Service Workers y Web Push Notifications
- Añadir réplicas MySQL (misma configuración)

### **2.4. Infraestructura y despliegue**

#### **Diagrama de Infraestructura (MVP - VPS Hostgator Autogestionado)**

```mermaid
graph TB
    subgraph "VPS Hostgator - Mismo Servidor"
        NGINX[Nginx<br/>Reverse Proxy<br/>SSL/TLS Termination<br/>Balanceo Manual]
        
        subgraph "Entorno Producción"
            FE_PROD[Frontend Prod<br/>Puerto 3000<br/>Escalable después]
            API_PROD[API Prod<br/>Puerto 4000<br/>Escalable después]
            WORKER_PROD[Worker Prod<br/>Puerto interno]
        end
        
        subgraph "Entorno Staging"
            FE_STAGING[Frontend Staging<br/>Puerto 3001]
            API_STAGING[API Staging<br/>Puerto 4001]
            WORKER_STAGING[Worker Staging<br/>Puerto interno]
        end
        
        subgraph "Base de Datos Compartida"
            MYSQL[MySQL 8.0 / MariaDB 10.11<br/>Primary<br/>Puerto 3306<br/>Compartida Prod/Staging]
        end
        
        REDIS[Redis 7<br/>Cache + Sessions<br/>Puerto 6379<br/>Compartida Prod/Staging]
        
        subgraph "Almacenamiento"
            STORAGE["/var/www/citaya/storage<br/>Archivos Estáticos<br/>LUKS en directorios sensibles"]
            BACKUPS["/var/backups/mysql<br/>Backups Automáticos Cron<br/>Retención 30 días<br/>Rotación automática"]
        end
        
        subgraph "Monitoring MVP Básico"
            CRON[Cron Jobs<br/>Cada 5 minutos]
            MONITOR[Scripts Monitoreo<br/>Health Checks /health<br/>Alertas Discord]
            PROM[Prometheus<br/>Puerto 9090<br/>Grafana después]
        end
        
        CERTBOT[Certbot<br/>Let's Encrypt<br/>Auto-renovación<br/>Garantizado por proveedor]
        
        LOGS["/var/www/citaya/logs<br/>Rotación automática<br/>Retención local"]
    end
    
    subgraph "External Services"
        SENDGRID[SendGrid API]
        GMAPS[Google Maps API]
        RECAPTCHA[reCAPTCHA API]
        DISCORD[Discord Webhook<br/>Alertas]
    end
    
    INTERNET[Internet] -->|HTTPS :443| NGINX
    NGINX -->|Producción| FE_PROD
    NGINX -->|Staging<br/>staging.citaya.com| FE_STAGING
    FE_PROD --> API_PROD
    FE_STAGING --> API_STAGING
    API_PROD --> MYSQL
    API_STAGING --> MYSQL
    API_PROD --> REDIS
    API_STAGING --> REDIS
    WORKER_PROD --> MYSQL
    WORKER_PROD --> REDIS
    WORKER_STAGING --> MYSQL
    API_PROD --> STORAGE
    API_STAGING --> STORAGE
    
    API_PROD -->|HTTPS| SENDGRID
    API_PROD -->|HTTPS| GMAPS
    API_PROD -->|HTTPS| RECAPTCHA
    WORKER_PROD -->|HTTPS| SENDGRID
    
    MYSQL --> BACKUPS
    CERTBOT --> NGINX
    
    CRON --> MONITOR
    API_PROD -.->|/health cada 5 min| MONITOR
    API_STAGING -.->|/health cada 5 min| MONITOR
    API_PROD -.->|Métricas| PROM
    WORKER_PROD -.->|Métricas| PROM
    MYSQL -.->|Métricas| PROM
    REDIS -.->|Métricas| PROM
    
    MONITOR -.->|Alertas| DISCORD
    API_PROD -.->|Logs| LOGS
    API_STAGING -.->|Logs| LOGS
    WORKER_PROD -.->|Logs| LOGS
```

#### **Especificaciones de Infraestructura MVP**

| Componente | Tipo | Especificación | Justificación |
|------------|------|----------------|---------------|
| **VPS Principal** | Hostgator VPS | 4 vCPU, 8GB RAM, 160GB SSD | Suficiente para todas las aplicaciones Docker (frontend, API, workers) |
| **Frontend** | Contenedor Docker | 1 instancia inicial (escalable después) | Suficiente para MVP, escalado horizontal cuando crezca tráfico |
| **API** | Contenedor Docker | 1 instancia inicial (escalable después) | Suficiente para MVP, escalado horizontal cuando crezca tráfico |
| **Workers** | Contenedor Docker | 1+ workers en mismo VPS | Procesamiento asíncrono, escalable según carga |
| **MySQL Primary** | Contenedor Docker | 2GB RAM dedicada | Una sola instancia inicial, réplicas después cuando sea necesario |
| **Redis** | Contenedor Docker | 512MB RAM dedicada | Cache y sesiones, suficiente para MVP |
| **Monitoring** | Scripts + Prometheus | Monitoreo básico inicial, Grafana después | Health checks, alertas Discord, métricas básicas |
| **Almacenamiento** | Sistema de archivos VPS | 160GB SSD compartido, LUKS en directorios sensibles | Archivos estáticos, backups MySQL |
| **Load Balancer** | Nginx | Instalación nativa en VPS | Reverse proxy, SSL termination (Let's Encrypt) |

**Configuración Recomendada VPS Hostgator**:
- **Plan**: VPS Business o superior (4+ vCPU, 8GB+ RAM)
- **Sistema Operativo**: Ubuntu 22.04 LTS o Debian 12
- **Docker**: Docker Engine 24+ con Docker Compose
- **Nginx**: Instalación nativa (no contenedor) para mejor performance
- **SSL/TLS**: Let's Encrypt con Certbot, renovación automática garantizada por proveedor
- **CDN**: CloudFlare opcional (no requerido para MVP inicial)
- **Entornos**: Producción y Staging en el mismo VPS (puertos diferentes)
- **Base de Datos**: MySQL compartida entre producción y staging (con prefijos de tabla diferentes)

**Costo Estimado Mensual MVP**: ~$40-60 USD (VPS Hostgator Business, sin incluir dominio ni CDN)

**Setup Inicial del VPS**:
El proceso de configuración inicial del VPS está documentado paso a paso en `docs/deployment/vps-setup.md` e incluye:
- Instalación de Docker y Docker Compose
- Configuración de Nginx como reverse proxy (producción y staging)
- Configuración de SSL con Certbot/Let's Encrypt (renovación automática garantizada)
- Setup de usuarios y permisos
- Configuración de firewall (UFW)
- Instalación de scripts de monitoreo y cron jobs (cada 5 minutos)
- Configuración de backups automáticos MySQL (cron diario)
- Setup de SSH para CI/CD (GitHub Actions)

**Docker Compose**:
- Un solo archivo `docker-compose.prod.yml` para producción y staging
- Diferenciación por variables de entorno (`.env.prod` y `.env.staging`)
- Puertos diferentes: Producción (3000/4000), Staging (3001/4001)
- Base de datos MySQL compartida con prefijos de tabla diferentes (o bases de datos separadas)

#### **Proceso de Despliegue con GitHub Actions**

```mermaid
graph TB
    DEV[Developer<br/>git push] --> GITHUB[GitHub Repository]
    GITHUB -->|Trigger| GH_ACTIONS[GitHub Actions]
    
    GH_ACTIONS --> BUILD[Build Step]
    BUILD -->|Docker Build| DOCKER_REGISTRY[GitHub Container Registry<br/>ghcr.io<br/>Tag: v1.0.X]
    DOCKER_REGISTRY -->|Retención| VERSIONS[Últimas 5 versiones<br/>disponibles para rollback]
    
    GH_ACTIONS --> TEST[Test Step]
    TEST -->|Unit Tests| TEST_RESULT{¿Tests OK?}
    TEST_RESULT -->|No| FAIL[Fail Pipeline]
    TEST_RESULT -->|Sí| SECURITY[Security Scan<br/>Trivy/Snyk]
    
    SECURITY --> SEC_RESULT{¿Vulnerabilidades?}
    SEC_RESULT -->|Críticas| FAIL
    SEC_RESULT -->|No/Aceptables| DEPLOY_STAGING[Deploy to Staging<br/>Automático]
    
    DEPLOY_STAGING --> SSH_STAGING[SSH al VPS<br/>Puerto 3001/4001]
    SSH_STAGING --> PULL_STAGING[Pull Imagen<br/>ghcr.io]
    PULL_STAGING --> MIGRATE_STAGING[Ejecutar Migraciones<br/>TypeORM Automático]
    MIGRATE_STAGING --> MIGRATE_CHECK{¿Migraciones OK?}
    MIGRATE_CHECK -->|No| ROLLBACK_STAGING[Rollback Migraciones<br/>+ Notificar Discord]
    MIGRATE_CHECK -->|Sí| RESTART_STAGING[Docker Compose<br/>Restart Staging]
    RESTART_STAGING --> HEALTH_STAGING[Health Check /health<br/>Solo alerta]
    HEALTH_STAGING --> NOTIFY_STAGING[Notificar Discord<br/>Staging Deployed]
    
    NOTIFY_STAGING --> MANUAL_APPROVAL{¿Aprobación Manual<br/>para Producción?}
    MANUAL_APPROVAL -->|No| WAIT[Esperar Aprobación]
    MANUAL_APPROVAL -->|Sí| DEPLOY_PROD[Deploy to Production]
    
    DEPLOY_PROD --> SSH_PROD[SSH al VPS<br/>Puerto 3000/4000]
    SSH_PROD --> PULL_PROD[Pull Imagen<br/>ghcr.io Tag específico]
    PULL_PROD --> MIGRATE_PROD[Ejecutar Migraciones<br/>TypeORM Automático]
    MIGRATE_PROD --> MIGRATE_CHECK_PROD{¿Migraciones OK?}
    MIGRATE_CHECK_PROD -->|No| ROLLBACK_PROD[Rollback Migraciones<br/>+ Rollback Deploy]
    MIGRATE_CHECK_PROD -->|Sí| RESTART_PROD[Docker Compose<br/>Rolling Restart Prod]
    RESTART_PROD --> HEALTH_PROD[Health Check /health<br/>Cada 5 min]
    HEALTH_PROD --> HEALTH_RESULT{¿Health OK<br/>después de 5 min?}
    HEALTH_RESULT -->|No| ROLLBACK_AUTO[Rollback Automático<br/>Reconstruir desde tag anterior]
    HEALTH_RESULT -->|Sí| SUCCESS[Deploy Exitoso<br/>Notificar Discord]
    
    ROLLBACK_AUTO --> VERSIONS
    ROLLBACK_STAGING --> FAIL
    ROLLBACK_PROD --> FAIL
```

**Pipeline CI/CD Detallado**:

1. **Build Stage**:
   - Build de imágenes Docker (frontend, backend, workers)
   - Push a GitHub Container Registry (ghcr.io)
   - Tagging con versión semántica (ej: `v1.0.0`, `v1.0.1`)
   - **Retención**: Se mantienen las últimas 5 versiones disponibles para rollback

2. **Test Stage**:
   - Tests unitarios (Jest/Vitest)
   - Tests de integración (Supertest para API)
   - Linting (ESLint) y type checking (TypeScript)
   - Coverage mínimo 70%

3. **Security Stage**:
   - Escaneo de vulnerabilidades en imágenes Docker (Trivy)
   - Escaneo de dependencias (npm audit, Snyk)
   - Análisis estático de código (SonarQube opcional)

4. **Deploy Staging**:
   - Despliegue automático a entorno de staging (mismo VPS, puertos diferentes)
   - Pull de imágenes desde GitHub Container Registry
   - Ejecución automática de migraciones TypeORM (con rollback si fallan)
   - Smoke tests automatizados
   - Health check (`/health` endpoint) - solo alerta, no bloquea deploy
   - Notificación a Discord

5. **Deploy Production**:
   - Requiere aprobación manual (GitHub Environments)
   - Despliegue simple con downtime mínimo (rolling restart)
   - Despliegue por SSH al VPS usando `scripts/deployment/deploy.sh`
   - Pull de imágenes desde GitHub Container Registry (tag específico)
   - Ejecución automática de migraciones TypeORM (con rollback si fallan)
   - Health checks post-deploy (`/health` endpoint cada 5 minutos)
   - **Rollback automático**: Si health check falla, se reconstruye desde tag anterior (últimas 5 versiones disponibles)

**Proceso de Rollback**:
```bash
# Rollback automático si health check falla
1. Identificar tag de versión anterior (últimas 5 disponibles)
2. Reconstruir contenedores desde tag anterior
3. Ejecutar rollback de migraciones si es necesario
4. Verificar health check
5. Notificar resultado a Discord
```

**Infraestructura como Código**:
- **Docker Compose**: Un solo archivo `docker-compose.prod.yml` para producción y staging (variables de entorno diferentes)
- **Scripts de despliegue**: Bash scripts en `scripts/deployment/` para automatizar despliegue y rollback
- **Ansible** (opcional): Provisioning y configuración del VPS (usuarios, firewall, servicios)
- **Migraciones**: TypeORM migrations ejecutadas automáticamente en cada deploy con plan de rollback
- **Variables de Entorno**: Secrets almacenados en `.env` encriptado en el VPS (permisos 600)
- **Escalado Nginx**: Configuración manual cuando se añadan más instancias (documentado en `docs/deployment/nginx-scaling.md`)

**Monitoreo y Mantenimiento**:
- **Health Checks**: Scripts ejecutados por cron cada 5 minutos (`scripts/monitoring/health-check.sh`)
  - Verifica endpoint `/health` de producción y staging
  - Solo alerta a Discord, no bloquea despliegues
- **Verificación Disco**: Cron cada 5 minutos (`scripts/monitoring/check-disk.sh`)
  - Alerta si uso de disco > 90%
- **Verificación DB**: Cron cada 5 minutos (`scripts/monitoring/check-db.sh`)
  - Verifica conexión a MySQL
  - Alerta si base de datos no responde
- **Backups MySQL**: 
  - Cron job diario a las 2:00 AM (`scripts/backup/mysql-backup.sh`)
  - Retención 30 días con rotación automática
  - Comprimir backups antiguos para ahorrar espacio
  - Almacenados en `/var/backups/mysql/daily/`
- **Logs**: 
  - Rotación automática configurada en Docker Compose
  - Retención local según espacio disponible
  - Logs separados por entorno (prod/staging)
  - Ubicación: `/var/www/citaya/logs/`
- **SSL**: Renovación automática garantizada por proveedor (Certbot)
  - Verificación periódica de renovación exitosa

### **2.5. Seguridad**

#### **Prácticas de Seguridad Implementadas**

1. **Autenticación y Autorización**
   - **JWT con Refresh Tokens**: Access tokens de corta duración (15 min), refresh tokens de larga duración (7 días) almacenados en httpOnly cookies
   - **Bcrypt para contraseñas**: Hashing con salt rounds = 12
   - **Rate Limiting**: 
     - 5 intentos de login por IP cada 15 minutos
     - Configuración por endpoint (diferentes límites según criticidad)
     - Contadores almacenados en memoria de la aplicación (no distribuido, reinicia con cada instancia)
   - **reCAPTCHA v3**: 
     - Protección anti-bot solo en registro y login
     - Score threshold: 0.0-1.0 (configurable por endpoint)
   - **Middleware de autorización**: Verificación de roles (paciente, médico, admin) en cada endpoint

   ```typescript
   // Ejemplo: Middleware de autenticación
   export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
     const token = req.cookies.accessToken;
     if (!token) return res.status(401).json({ error: 'No autorizado' });
     
     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET!);
       req.user = decoded;
       next();
     } catch (error) {
       return res.status(401).json({ error: 'Token inválido' });
     }
   };
   ```

2. **Protección de Datos (GDPR)**
   - **Encriptación en tránsito**: TLS 1.3 en todas las comunicaciones
   - **Encriptación en reposo**: 
     - **MySQL**: Encriptación a nivel de aplicación para cédulas profesionales únicamente
       - Cédulas encriptadas antes de almacenar en base de datos
       - Clave de encriptación almacenada en `.env` encriptado
     - **Sistema de archivos**: LUKS (disk encryption) configurado después del setup inicial
       - Solo para directorio `/var/www/citaya/storage/uploads/` (cédulas profesionales)
       - Clave LUKS almacenada de forma segura, acceso solo para administrador del VPS
     - **Redis**: Encriptación en tránsito (TLS) y persistencia AOF encriptada
   - **Datos sensibles**: 
     - Cédulas profesionales almacenadas en directorios privados (`/var/www/citaya/storage/uploads/`) con permisos 700
     - Acceso mediante URLs firmadas temporales (tokens JWT con expiración corta)
     - Validación de tipos MIME y extensiones de archivos subidos
     - Límite de tamaño para cédulas profesionales (configurado en backend)
     - Escaneo de archivos en busca de malware antes de almacenar
   - **Logs**: Sin información sensible (PII) en logs de aplicación
   - **Derecho al olvido**: 
     - Endpoint para eliminación de datos personales (soft delete)
     - Retención de datos eliminados: 1 año después del soft delete
     - Eliminación permanente después de 1 año (incluyendo backups externos)

3. **Protección de API**
   - **CORS**: 
     - Configurado para dominios específicos: `citaya.com`, `www.citaya.com`, `staging.citaya.com`
     - No wildcard, solo producción y staging permitidos
   - **CSRF Protection**: 
     - Tokens CSRF en formularios críticos
     - Tokens almacenados en Redis por sesión
     - Generación de token por sesión (no por request)
   - **Input Validation**: Validación estricta con Zod en todos los endpoints
   - **SQL Injection Prevention**: ORM (TypeORM) con queries parametrizadas usando `mysql2`
   - **XSS Prevention**: Sanitización de inputs y output encoding en frontend
   - **Protección de Archivos Subidos**:
     - Validación de tipos MIME y extensiones de archivos
     - Límite de tamaño configurado (cédulas profesionales)
     - Escaneo de malware antes de almacenar

   ```typescript
   // Ejemplo: Validación de input con Zod
   const createAppointmentSchema = z.object({
     doctorId: z.string().uuid(),
     slotId: z.string().uuid(),
     date: z.string().datetime(),
   });
   
   export const createAppointment = async (req: Request, res: Response) => {
     const validated = createAppointmentSchema.parse(req.body);
     // ... lógica de negocio
   };
   ```
   
   **Nota**: Para MySQL, usar `mysql2` con prepared statements para prevenir SQL injection:
   ```typescript
   const [rows] = await db.execute(
     'SELECT * FROM appointments WHERE patient_id = ? AND status = ?',
     [patientId, 'confirmed']
   );
   ```
   
   **Ejemplo: Encriptación de cédulas a nivel de aplicación**:
   ```typescript
   import crypto from 'crypto';
   
   const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32 bytes
   const IV_LENGTH = 16;
   
   function encryptCedula(text: string): string {
     const iv = crypto.randomBytes(IV_LENGTH);
     const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
     let encrypted = cipher.update(text);
     encrypted = Buffer.concat([encrypted, cipher.final()]);
     return iv.toString('hex') + ':' + encrypted.toString('hex');
   }
   
   function decryptCedula(text: string): string {
     const parts = text.split(':');
     const iv = Buffer.from(parts.shift()!, 'hex');
     const encryptedText = Buffer.from(parts.join(':'), 'hex');
     const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
     let decrypted = decipher.update(encryptedText);
     decrypted = Buffer.concat([decrypted, decipher.final()]);
     return decrypted.toString();
   }
   ```

4. **Seguridad de Infraestructura**
   - **Firewall (UFW)**:
     - Solo puertos necesarios permitidos: 22 (SSH, puerto personalizado), 80 (HTTP), 443 (HTTPS)
     - Todos los demás puertos bloqueados por defecto
   - **SSH**:
     - Login solo con claves SSH (deshabilitado login por contraseña)
     - Puerto SSH cambiado del puerto por defecto (22) a puerto personalizado
     - Fail2ban configurado para proteger contra ataques de fuerza bruta
     - Límite de intentos fallidos antes de bloqueo temporal
   - **Secrets Management**: 
     - Variables sensibles en archivos `.env` encriptados con AES
     - Solo administrador del VPS tiene acceso a las claves de desencriptación
     - Secrets para CI/CD almacenados en GitHub Secrets (GitHub Actions)
     - Rotación periódica de claves SSH y API keys recomendada
   - **Principio de menor privilegio**: 
     - Usuario `citaya` con permisos mínimos necesarios
     - Contenedores Docker ejecutados con usuarios no-root cuando sea posible
   - **Backups encriptados**: 
     - Backups de MySQL con `mysqldump` y encriptación GPG
     - Retención 30 días localmente
     - Envío a almacenamiento externo (encriptado)
     - Clave GPG almacenada de forma segura, acceso solo para administrador
   - **Seguridad Docker**:
     - Imágenes escaneadas en CI/CD con Trivy antes del despliegue
     - Contenedores con límites de recursos (CPU, memoria)
     - Ejecución con usuarios no-root cuando sea posible

5. **Monitoreo de Seguridad**
   - **Logging de eventos de seguridad**: 
     - Archivo separado: `/var/www/citaya/logs/security.log`
     - Eventos registrados: Intentos de login fallidos, cambios de permisos, accesos a datos sensibles
     - Retención: 1 semana, luego rotación automática
   - **Alertas a Discord**: Notificaciones por:
     - Errores HTTP 500 (servidor)
     - Base de datos caída o no accesible
     - Disco lleno (>90% uso)
     - Intentos sospechosos (múltiples fallos de login, acceso desde IPs desconocidas)
     - Fallos de Fail2ban (bloqueos SSH)
   - **Auditoría**: 
     - Logs de todas las acciones (no solo administrativas)
     - Información registrada: quién (usuario), qué (acción), cuándo (timestamp), IP (dirección IP)
     - Operaciones auditadas: login, logout, creación/modificación de citas, acceso a datos sensibles, acciones administrativas
     - Almacenamiento: Base de datos `audit_logs` con retención configurable
   - **Health Check**: Endpoint `/health` expuesto para monitoreo continuo

6. **Protección de Sesiones**
   - **HttpOnly Cookies**: Prevención de acceso vía JavaScript (XSS)
   - **Secure Flag**: Cookies solo por HTTPS en producción
   - **SameSite**: Protección CSRF con SameSite=Strict
   - **Expiración**: Sesiones con TTL configurable, invalidación en logout

### **2.6. Tests**

#### **Estrategia de Testing**

**Pirámide de Testing**:
- **70% Unit Tests**: Lógica de negocio, servicios, utilidades
- **20% Integration Tests**: Endpoints API, integración con BD
- **10% E2E Tests**: Flujos críticos de usuario (reserva de cita, login)

**Stack de Testing**:
- **Unit e Integration Tests**: Jest
- **E2E Tests**: Cypress
- **Base de Datos de Pruebas**: MySQL en contenedor Docker separado
- **Datos de Prueba**: Generados dinámicamente (no fixtures estáticos)

#### **Configuración de Entorno de Testing**

**Docker Compose para Tests**:
```yaml
# docker-compose.test.yml
version: '3.8'
services:
  mysql-test:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: test_password
      MYSQL_DATABASE: citaya_test
    ports:
      - "3307:3306"
    tmpfs:
      - /var/lib/mysql  # Mejor performance para tests
```

**Setup y Teardown**:
- Base de datos MySQL separada (`citaya_test`)
- Migraciones ejecutadas antes de cada suite de tests
- Limpieza de datos después de cada test (transacciones que se revierten)
- Contenedor Docker iniciado antes de ejecutar tests

#### **Ejemplos de Tests Implementados**

1. **Unit Tests (Jest)**:
   ```typescript
   // Ejemplo: Test de servicio de reservas
   describe('AppointmentService', () => {
     beforeEach(async () => {
       // Setup: Limpiar datos y crear datos de prueba dinámicamente
       await db.query('TRUNCATE TABLE appointments, slots');
       // Generar datos dinámicamente
       const doctor = await createTestDoctor();
       const slot = await createTestSlot(doctor.id);
     });
     
     it('debe bloquear slot cuando se crea una cita', async () => {
       const slot = await slotRepository.findById('slot-123');
       expect(slot.isAvailable).toBe(true);
       
       await appointmentService.createAppointment({
         doctorId: 'doc-123',
         slotId: 'slot-123',
         patientId: 'patient-123',
       });
       
       const updatedSlot = await slotRepository.findById('slot-123');
       expect(updatedSlot.isAvailable).toBe(false);
     });
     
     it('debe lanzar error si paciente ya tiene cita activa', async () => {
       await appointmentService.createAppointment({...});
       
       await expect(
         appointmentService.createAppointment({...})
       ).rejects.toThrow('Paciente ya tiene una cita activa');
     });
   });
   ```

2. **Integration Tests (Jest + Supertest)**:
   ```typescript
   // Ejemplo: Test de endpoint de reserva
   describe('POST /api/appointments', () => {
     let patientToken: string;
     
     beforeEach(async () => {
       // Generar datos dinámicamente
       const patient = await createTestPatient();
       patientToken = await generateTestToken(patient.id);
     });
     
     it('debe crear una cita exitosamente', async () => {
       const doctor = await createTestDoctor();
       const slot = await createTestSlot(doctor.id);
       
       const response = await request(app)
         .post('/api/appointments')
         .set('Cookie', `accessToken=${patientToken}`)
         .send({
           doctorId: doctor.id,
           slotId: slot.id,
           date: '2026-01-25T10:00:00Z',
         });
       
       expect(response.status).toBe(201);
       expect(response.body).toHaveProperty('appointmentId');
     });
     
     it('debe rechazar si slot ya está ocupado', async () => {
       const doctor = await createTestDoctor();
       const slot = await createTestSlot(doctor.id);
       
       // Primera reserva
       await request(app)
         .post('/api/appointments')
         .set('Cookie', `accessToken=${patientToken}`)
         .send({ doctorId: doctor.id, slotId: slot.id, date: '2026-01-25T10:00:00Z' });
       
       // Segunda reserva del mismo slot
       const response = await request(app)
         .post('/api/appointments')
         .set('Cookie', `accessToken=${patientToken}`)
         .send({ doctorId: doctor.id, slotId: slot.id, date: '2026-01-25T10:00:00Z' });
       
       expect(response.status).toBe(409);
       expect(response.body.error).toContain('Slot no disponible');
     });
   });
   ```
   
   **Nota**: Para tests con MySQL, usar `mysql2` con transacciones y rollback automático después de cada test.

3. **E2E Tests (Cypress)**:
   ```typescript
   // Ejemplo: Flujo completo de reserva
   describe('Reserva de Cita', () => {
     beforeEach(() => {
       // Generar datos dinámicamente en base de datos de prueba
       cy.task('seedTestData');
     });
     
     it('paciente puede reservar una cita', () => {
       cy.visit('/login');
       cy.get('[name="email"]').type('patient@test.com');
       cy.get('[name="password"]').type('password123');
       cy.get('button[type="submit"]').click();
       
       cy.visit('/search');
       cy.get('[name="specialty"]').type('Cardiología');
       cy.get('button:has-text("Buscar")').click();
       
       cy.get('.doctor-card').first().click();
       cy.get('.available-slot').first().click();
       cy.get('button:has-text("Confirmar Cita")').click();
       
       cy.get('.success-message').should('be.visible');
     });
   });
   ```

4. **Tests de Seguridad**:
   ```typescript
   // Ejemplo: Tests de seguridad OWASP
   describe('Seguridad - Inyección SQL', () => {
     it('debe prevenir inyección SQL en búsqueda de médicos', async () => {
       const maliciousInput = "'; DROP TABLE doctors; --";
       
       const response = await request(app)
         .get(`/api/doctors?specialty=${maliciousInput}`);
       
       expect(response.status).toBe(400); // Validación falla antes de query
       // Verificar que tabla doctors aún existe
       const doctors = await db.query('SELECT COUNT(*) FROM doctors');
       expect(doctors[0]['COUNT(*)']).toBeGreaterThan(0);
     });
   });
   
   describe('Seguridad - XSS', () => {
     it('debe sanitizar inputs en reseñas', async () => {
       const xssPayload = '<script>alert("XSS")</script>';
       
       const response = await request(app)
         .post('/api/reviews')
         .set('Cookie', `accessToken=${patientToken}`)
         .send({ doctorId: 'doc-123', rating: 5, comment: xssPayload });
       
       expect(response.status).toBe(201);
       // Verificar que script fue sanitizado
       const review = await reviewRepository.findById(response.body.reviewId);
       expect(review.comment).not.toContain('<script>');
     });
   });
   
   describe('Seguridad - Rate Limiting', () => {
     it('debe bloquear después de múltiples intentos de login fallidos', async () => {
       for (let i = 0; i < 6; i++) {
         await request(app)
           .post('/api/auth/login')
           .send({ email: 'test@test.com', password: 'wrong' });
       }
       
       const response = await request(app)
         .post('/api/auth/login')
         .send({ email: 'test@test.com', password: 'wrong' });
       
       expect(response.status).toBe(429); // Too Many Requests
     });
   });
   ```

5. **Tests de Validación de Archivos**:
   ```typescript
   describe('Validación de Archivos Subidos', () => {
     it('debe rechazar archivos con tipo MIME inválido', async () => {
       const fakePdf = Buffer.from('fake content');
       
       const response = await request(app)
         .post('/api/doctors/verification')
         .set('Cookie', `accessToken=${doctorToken}`)
         .attach('cedula', fakePdf, { filename: 'cedula.pdf', contentType: 'application/x-executable' });
       
       expect(response.status).toBe(400);
       expect(response.body.error).toContain('Tipo de archivo no permitido');
     });
     
     it('debe rechazar archivos con extensión inválida', async () => {
       const file = Buffer.from('fake content');
       
       const response = await request(app)
         .post('/api/doctors/verification')
         .set('Cookie', `accessToken=${doctorToken}`)
         .attach('cedula', file, { filename: 'cedula.exe' });
       
       expect(response.status).toBe(400);
       expect(response.body.error).toContain('Extensión no permitida');
     });
     
     it('debe rechazar archivos que excedan el tamaño máximo', async () => {
       const largeFile = Buffer.alloc(11 * 1024 * 1024); // 11MB
       
       const response = await request(app)
         .post('/api/doctors/verification')
         .set('Cookie', `accessToken=${doctorToken}`)
         .attach('cedula', largeFile, { filename: 'cedula.pdf' });
       
       expect(response.status).toBe(400);
       expect(response.body.error).toContain('Tamaño máximo excedido');
     });
   });
   ```

6. **Tests de Migraciones**:
   ```typescript
   describe('Migraciones TypeORM', () => {
     it('debe ejecutar migración correctamente', async () => {
       await runMigration('1234567890-CreateUsersTable');
       
       const tables = await db.query('SHOW TABLES');
       expect(tables.some(t => t.Tables_in_citaya_test === 'users')).toBe(true);
     });
     
     it('debe hacer rollback correctamente', async () => {
       await runMigration('1234567890-CreateUsersTable');
       await rollbackMigration('1234567890-CreateUsersTable');
       
       const tables = await db.query('SHOW TABLES');
       expect(tables.some(t => t.Tables_in_citaya_test === 'users')).toBe(false);
     });
     
     it('debe ejecutar script de rollback SQL correctamente', async () => {
       await runMigration('1234567890-CreateUsersTable');
       await executeRollbackScript('1234567890-CreateUsersTable.rollback.sql');
       
       const tables = await db.query('SHOW TABLES');
       expect(tables.some(t => t.Tables_in_citaya_test === 'users')).toBe(false);
     });
   });
   ```

7. **Tests de Cron Jobs (Workers)**:
   ```typescript
   describe('Cron Jobs - Recordatorios de Citas', () => {
     it('debe enviar recordatorio 30 minutos antes de la cita', async () => {
       // Crear cita que empieza en 30 minutos
       const appointmentDate = new Date();
       appointmentDate.setMinutes(appointmentDate.getMinutes() + 30);
       
       const appointment = await createTestAppointment({
         appointmentDate,
         status: 'confirmed',
         reminderSent: false
       });
       
       // Ejecutar cron job manualmente
       await executeCronJob('send-appointment-reminders');
       
       // Verificar que recordatorio fue enviado
       const updatedAppointment = await appointmentRepository.findById(appointment.id);
       expect(updatedAppointment.reminderSent).toBe(true);
       
       // Verificar que job fue encolado en Bull
       const jobs = await notificationQueue.getJobs(['completed']);
       expect(jobs.some(j => j.data.appointmentId === appointment.id)).toBe(true);
     });
   });
   ```

8. **Tests con Mocks de Servicios Externos**:
   ```typescript
   // Mock completo de servicios externos
   jest.mock('@sendgrid/mail', () => ({
     setApiKey: jest.fn(),
     send: jest.fn().mockResolvedValue([{ statusCode: 202 }]),
   }));
   
   jest.mock('googlemaps', () => ({
     geocode: jest.fn().mockResolvedValue({
       results: [{ geometry: { location: { lat: 19.4326, lng: -99.1332 } } }]
     }),
   }));
   
   jest.mock('google-recaptcha-v3', () => ({
     verify: jest.fn().mockResolvedValue({ score: 0.9 }),
   }));
   
   describe('Integración con Servicios Externos', () => {
     it('debe enviar email usando SendGrid mockeado', async () => {
       await notificationService.sendAppointmentConfirmation(appointmentId);
       
       expect(sendGrid.send).toHaveBeenCalledWith(
         expect.objectContaining({
           to: 'patient@test.com',
           templateId: 'appointment-confirmation',
         })
       );
     });
   });
   ```

**Cobertura Objetivo**: 
- Mínimo 70% de cobertura de código general
- 90% en lógica crítica (reservas, autenticación, bloqueo de slots)
- Herramienta: Istanbul/nyc para medición de cobertura

**CI/CD Integration**: 
- Todos los tests se ejecutan automáticamente en cada Pull Request
- Tests E2E también se ejecutan en cada PR (no solo en staging/producción)
- Los tests deben pasar para que el PR pueda ser mergeado
- Reportes de cobertura generados y mostrados en PR

**Estructura de Tests**:
```
backend/
└── tests/
    ├── unit/                  # Tests unitarios
    │   ├── services/
    │   ├── repositories/
    │   └── utils/
    ├── integration/           # Tests de integración
    │   ├── api/
    │   └── database/
    ├── security/              # Tests de seguridad
    │   ├── sql-injection.test.ts
    │   ├── xss.test.ts
    │   └── rate-limiting.test.ts
    ├── migrations/            # Tests de migraciones
    │   └── migration.test.ts
    ├── workers/              # Tests de cron jobs
    │   └── schedulers.test.ts
    ├── files/                # Tests de validación de archivos
    │   └── validation.test.ts
    └── helpers/              # Helpers y utilidades para tests
        ├── test-db.ts        # Setup de base de datos de prueba
        ├── factories.ts      # Factories para generar datos dinámicamente
        └── mocks.ts          # Mocks de servicios externos

frontend/
└── tests/
    ├── unit/                 # Tests unitarios de componentes
    ├── integration/          # Tests de integración
    └── e2e/                  # Tests E2E con Cypress
        ├── auth.spec.ts
        ├── appointments.spec.ts
        └── search.spec.ts
```

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

> Recomendamos usar mermaid para el modelo de datos, y utilizar todos los parámetros que permite la sintaxis para dar el máximo detalle, por ejemplo las claves primarias y foráneas.

```mermaid
erDiagram
    USERS {
        CHAR id PK
        VARCHAR email UK
        VARCHAR password_hash
        ENUM role
        VARCHAR first_name
        VARCHAR last_name
        VARCHAR phone
        VARCHAR avatar_path
        BOOLEAN email_verified
        DATETIME created_at
        DATETIME updated_at
        DATETIME deleted_at
    }

    DOCTORS {
        CHAR id PK
        VARCHAR cedula_profesional
        TEXT bio
        VARCHAR address
        VARCHAR postal_code
        DECIMAL latitude
        DECIMAL longitude
        ENUM verification_status
        TEXT verification_notes
        CHAR verified_by FK
        DATETIME verified_at
        DECIMAL rating_average
        INT total_reviews
        DATETIME created_at
        DATETIME updated_at
        DATETIME deleted_at
    }

    SPECIALTIES {
        CHAR id PK
        VARCHAR name_es
        VARCHAR name_en
        VARCHAR slug UK
        TEXT description_es
        TEXT description_en
        BOOLEAN is_active
        INT display_order
        DATETIME created_at
        DATETIME updated_at
        DATETIME deleted_at
    }

    DOCTOR_SPECIALTIES {
        CHAR id PK
        CHAR doctor_id FK
        CHAR specialty_id FK
        BOOLEAN is_primary
        DATETIME created_at
    }

    DOCTOR_SCHEDULES {
        CHAR id PK
        CHAR doctor_id FK
        INT day_of_week
        TIME start_time
        TIME end_time
        INT slot_duration_minutes
        INT break_duration_minutes
        BOOLEAN is_active
        DATETIME created_at
        DATETIME updated_at
        DATETIME deleted_at
    }

    SLOTS {
        CHAR id PK
        CHAR doctor_id FK
        CHAR schedule_id FK
        DATETIME start_time
        DATETIME end_time
        BOOLEAN is_available
        CHAR locked_by FK
        DATETIME locked_until
        DATETIME created_at
        DATETIME updated_at
    }

    APPOINTMENTS {
        CHAR id PK
        CHAR patient_id FK
        CHAR doctor_id FK
        CHAR slot_id FK
        DATETIME appointment_date
        ENUM status
        TEXT cancellation_reason
        BOOLEAN reminder_sent
        DATETIME reminder_sent_at
        TEXT notes
        DATETIME created_at
        DATETIME updated_at
        DATETIME deleted_at
    }

    APPOINTMENT_HISTORY {
        CHAR id PK
        CHAR appointment_id FK
        ENUM old_status
        ENUM new_status
        TEXT change_reason
        CHAR changed_by FK
        DATETIME changed_at
        TEXT metadata
    }

    REVIEWS {
        CHAR id PK
        CHAR appointment_id FK
        CHAR patient_id FK
        CHAR doctor_id FK
        INT rating
        TEXT comment
        ENUM moderation_status
        TEXT moderation_notes
        CHAR moderated_by FK
        DATETIME moderated_at
        DATETIME created_at
        DATETIME updated_at
        DATETIME deleted_at
    }

    VERIFICATION_DOCUMENTS {
        CHAR id PK
        CHAR doctor_id FK
        VARCHAR file_path
        VARCHAR original_filename
        VARCHAR mime_type
        BIGINT file_size_bytes
        ENUM document_type
        ENUM status
        TEXT admin_notes
        CHAR reviewed_by FK
        DATETIME reviewed_at
        DATETIME created_at
        DATETIME updated_at
        DATETIME deleted_at
    }

    NOTIFICATIONS {
        CHAR id PK
        CHAR user_id FK
        ENUM type
        VARCHAR title
        TEXT message
        ENUM channel
        ENUM status
        TEXT metadata
        DATETIME sent_at
        DATETIME created_at
        DATETIME updated_at
    }

    SYSTEM_SETTINGS {
        VARCHAR key PK
        TEXT value
        VARCHAR description
        VARCHAR category
        DATETIME updated_at
        CHAR updated_by FK
    }

    AUDIT_LOGS {
        CHAR id PK
        CHAR user_id FK
        VARCHAR action
        VARCHAR entity_type
        CHAR entity_id
        TEXT old_values
        TEXT new_values
        VARCHAR ip_address
        VARCHAR user_agent
        DATETIME created_at
    }

    USERS ||--|| DOCTORS : "has"
    USERS ||--o{ APPOINTMENTS : "creates"
    USERS ||--o{ REVIEWS : "writes"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ AUDIT_LOGS : "triggers"
    USERS ||--o{ SLOTS : "locks"
    USERS ||--o{ DOCTORS : "verifies"
    USERS ||--o{ REVIEWS : "moderates"
    USERS ||--o{ VERIFICATION_DOCUMENTS : "reviews"
    USERS ||--o{ SYSTEM_SETTINGS : "updates"
    USERS ||--o{ APPOINTMENT_HISTORY : "changes"
    
    DOCTORS ||--o{ DOCTOR_SPECIALTIES : "has"
    DOCTORS ||--o{ DOCTOR_SCHEDULES : "defines"
    DOCTORS ||--o{ SLOTS : "offers"
    DOCTORS ||--o{ APPOINTMENTS : "attends"
    DOCTORS ||--o{ REVIEWS : "receives"
    DOCTORS ||--o{ VERIFICATION_DOCUMENTS : "submits"
    
    SPECIALTIES ||--o{ DOCTOR_SPECIALTIES : "assigned_to"
    
    DOCTOR_SCHEDULES ||--o{ SLOTS : "generates"
    
    APPOINTMENTS ||--|| SLOTS : "reserves"
    APPOINTMENTS ||--o{ APPOINTMENT_HISTORY : "tracks"
    APPOINTMENTS ||--o| REVIEWS : "receives"
```


### **3.2. Descripción de entidades principales:**

#### **USERS**
Tabla principal de usuarios del sistema. Almacena información común para pacientes, médicos y administradores.

**Clave Primaria**: `id` (CHAR/UUID)

**Atributos**:
- `id` (CHAR/UUID, PK): Identificador único del usuario
- `email` (VARCHAR, UNIQUE, NOT NULL, INDEX): Email del usuario, usado para login
- `password_hash` (VARCHAR, NOT NULL): Hash bcrypt de la contraseña (salt rounds = 12)
- `role` (ENUM, NOT NULL, INDEX): Rol del usuario. Valores: `'patient'`, `'doctor'`, `'admin'`
- `first_name` (VARCHAR, NOT NULL): Nombre del usuario
- `last_name` (VARCHAR, NOT NULL): Apellido del usuario
- `phone` (VARCHAR, NULLABLE): Teléfono de contacto
- `avatar_path` (VARCHAR, NULLABLE): Ruta al archivo de avatar en storage
- `email_verified` (BOOLEAN, NOT NULL, DEFAULT false): Indica si el email fue verificado
- `created_at` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP): Fecha de creación
- `updated_at` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE): Fecha de última actualización
- `deleted_at` (DATETIME, NULLABLE, INDEX): Fecha de soft delete (GDPR compliance)

**Índices**:
- `idx_email`: Búsqueda rápida por email (login)
- `idx_role`: Filtrado por rol
- `idx_deleted_at`: Filtrado de registros activos (soft delete)

**Relaciones**:
- 1:1 con `DOCTORS` (si role='doctor')
- 1:N con `APPOINTMENTS` (como paciente)
- 1:N con `REVIEWS` (como paciente)
- 1:N con `NOTIFICATIONS`
- 1:N con `AUDIT_LOGS` (quien ejecutó acciones)
- 1:N con `SLOTS` (como paciente que bloquea slot)

---

#### **DOCTORS**
Información específica de médicos. Relación 1:1 con `USERS` cuando el usuario tiene role='doctor'.

**Clave Primaria**: `id` (CHAR/UUID, FK -> USERS.id)

**Claves Foráneas**:
- `id` → `USERS.id` (1:1, usuario médico)
- `verified_by` → `USERS.id` (admin que verificó)

**Atributos**:
- `id` (CHAR/UUID, PK, FK): Identificador único, referencia a USERS.id
- `cedula_profesional` (VARCHAR, NULLABLE): Número de cédula profesional
- `bio` (TEXT, NULLABLE): Descripción profesional del médico
- `address` (VARCHAR, NOT NULL): Dirección completa del consultorio/clínica
- `postal_code` (VARCHAR, NOT NULL, INDEX): Código postal (obligatorio para búsqueda fallback)
- `latitude` (DECIMAL, NOT NULL): Coordenada geográfica latitud (geocodificada)
- `longitude` (DECIMAL, NOT NULL): Coordenada geográfica longitud (geocodificada)
- `verification_status` (ENUM, NOT NULL, DEFAULT 'pending', INDEX): Estado de verificación. Valores: `'pending'`, `'approved'`, `'rejected'`
- `verification_notes` (TEXT, NULLABLE): Notas del administrador sobre la verificación
- `verified_by` (CHAR/UUID, NULLABLE, FK): ID del admin que verificó al médico
- `verified_at` (DATETIME, NULLABLE): Fecha de verificación
- `rating_average` (DECIMAL, NULLABLE, DEFAULT 0.0): Promedio de calificaciones (1-5)
- `total_reviews` (INT, NOT NULL, DEFAULT 0): Contador total de reseñas aprobadas
- `created_at` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE)
- `deleted_at` (DATETIME, NULLABLE, INDEX): Soft delete

**Índices**:
- `idx_location` (SPATIAL): Índice espacial para búsquedas geográficas (fórmula Haversine)
- `idx_verification_status`: Filtrado por estado de verificación
- `idx_postal_code`: Búsqueda por código postal (fallback)
- `idx_deleted_at`: Filtrado de registros activos

**Relaciones**:
- 1:1 con `USERS` (usuario médico)
- 1:N con `DOCTOR_SPECIALTIES` (especialidades del médico)
- 1:N con `DOCTOR_SCHEDULES` (horarios de trabajo)
- 1:N con `SLOTS` (slots de disponibilidad)
- 1:N con `APPOINTMENTS` (citas con pacientes)
- 1:N con `REVIEWS` (reseñas recibidas)
- 1:N con `VERIFICATION_DOCUMENTS` (documentos de verificación)

---

#### **SPECIALTIES**
Catálogo fijo de especialidades médicas gestionado por administradores. Soporte bilingüe ES/EN.

**Clave Primaria**: `id` (CHAR/UUID)

**Atributos**:
- `id` (CHAR/UUID, PK): Identificador único
- `name_es` (VARCHAR, NOT NULL): Nombre en español
- `name_en` (VARCHAR, NOT NULL): Nombre en inglés
- `slug` (VARCHAR, UNIQUE, INDEX): Identificador URL-friendly (ej: 'cardiologia')
- `description_es` (TEXT, NULLABLE): Descripción en español
- `description_en` (TEXT, NULLABLE): Descripción en inglés
- `is_active` (BOOLEAN, NOT NULL, DEFAULT true, INDEX): Indica si la especialidad está activa
- `display_order` (INT, NOT NULL, DEFAULT 0): Orden de visualización en listados
- `created_at` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE)
- `deleted_at` (DATETIME, NULLABLE): Soft delete

**Índices**:
- `idx_slug`: Búsqueda por slug (único)
- `idx_is_active`: Filtrado de especialidades activas

**Relaciones**:
- 1:N con `DOCTOR_SPECIALTIES` (médicos con esta especialidad)

---

#### **DOCTOR_SPECIALTIES**
Tabla intermedia para relación muchos-a-muchos entre médicos y especialidades. Un médico puede tener múltiples especialidades.

**Clave Primaria**: `id` (CHAR/UUID)

**Claves Foráneas**:
- `doctor_id` → `DOCTORS.id`
- `specialty_id` → `SPECIALTIES.id`

**Atributos**:
- `id` (CHAR/UUID, PK): Identificador único
- `doctor_id` (CHAR/UUID, FK, NOT NULL, INDEX): ID del médico
- `specialty_id` (CHAR/UUID, FK, NOT NULL, INDEX): ID de la especialidad
- `is_primary` (BOOLEAN, NOT NULL, DEFAULT false): Indica si es la especialidad principal
- `created_at` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP)

**Índices**:
- `idx_doctor_specialty` (UNIQUE): Evita duplicados (doctor_id, specialty_id)
- `idx_doctor_id`: Búsqueda de especialidades por médico
- `idx_specialty_id`: Búsqueda de médicos por especialidad

**Restricciones**:
- UNIQUE(doctor_id, specialty_id): Un médico no puede tener la misma especialidad duplicada

**Relaciones**:
- N:1 con `DOCTORS`
- N:1 con `SPECIALTIES`

---

#### **DOCTOR_SCHEDULES**
Horarios de trabajo configurables por médico. Plantillas reutilizables que se usan para generar slots automáticamente.

**Clave Primaria**: `id` (CHAR/UUID)

**Clave Foránea**:
- `doctor_id` → `DOCTORS.id`

**Atributos**:
- `id` (CHAR/UUID, PK): Identificador único
- `doctor_id` (CHAR/UUID, FK, NOT NULL, INDEX): ID del médico
- `day_of_week` (INT, NOT NULL, INDEX): Día de la semana (0=domingo, 1=lunes, ..., 6=sábado)
- `start_time` (TIME, NOT NULL): Hora de inicio (formato HH:MM:SS)
- `end_time` (TIME, NOT NULL): Hora de fin (formato HH:MM:SS)
- `slot_duration_minutes` (INT, NOT NULL, DEFAULT 30): Duración de cada slot en minutos
- `break_duration_minutes` (INT, NULLABLE, DEFAULT 0): Duración de pausas entre slots
- `is_active` (BOOLEAN, NOT NULL, DEFAULT true, INDEX): Indica si el horario está activo
- `created_at` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE)
- `deleted_at` (DATETIME, NULLABLE): Soft delete

**Índices**:
- `idx_doctor_id`: Búsqueda de horarios por médico
- `idx_day_of_week`: Filtrado por día de la semana
- `idx_is_active`: Filtrado de horarios activos

**Relaciones**:
- N:1 con `DOCTORS`
- 1:N con `SLOTS` (slots generados desde este horario)

---

#### **SLOTS**
Bloques de tiempo de disponibilidad generados automáticamente desde `DOCTOR_SCHEDULES`. Implementa soft lock para prevenir doble booking.

**Clave Primaria**: `id` (CHAR/UUID)

**Claves Foráneas**:
- `doctor_id` → `DOCTORS.id`
- `schedule_id` → `DOCTOR_SCHEDULES.id` (nullable, puede generarse manualmente)
- `locked_by` → `USERS.id` (paciente que bloquea el slot)

**Atributos**:
- `id` (CHAR/UUID, PK): Identificador único
- `doctor_id` (CHAR/UUID, FK, NOT NULL, INDEX): ID del médico
- `schedule_id` (CHAR/UUID, FK, NULLABLE): ID del horario que generó este slot
- `start_time` (DATETIME, NOT NULL, INDEX): Fecha/hora de inicio (CDMX timezone)
- `end_time` (DATETIME, NOT NULL): Fecha/hora de fin (CDMX timezone)
- `is_available` (BOOLEAN, NOT NULL, DEFAULT true, INDEX): Disponibilidad del slot
- `locked_by` (CHAR/UUID, FK, NULLABLE): ID del paciente que bloqueó el slot
- `locked_until` (DATETIME, NULLABLE, INDEX): Fecha/hora de expiración del lock (5 minutos)
- `created_at` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE)

**Índices**:
- `idx_doctor_id`: Búsqueda de slots por médico
- `idx_start_time`: Búsqueda por fecha/hora
- `idx_is_available`: Filtrado de slots disponibles
- `idx_locked_until`: Cleanup de locks expirados
- `idx_doctor_time` (COMPOSITE): Búsqueda eficiente (doctor_id, start_time, is_available)

**Relaciones**:
- N:1 con `DOCTORS`
- N:1 con `DOCTOR_SCHEDULES` (nullable)
- N:1 con `USERS` (como locked_by, nullable)
- 1:1 con `APPOINTMENTS` (un slot solo puede tener una cita)

**Restricciones**:
- UNIQUE(slot_id) en `APPOINTMENTS`: Un slot solo puede tener una cita confirmada

---

#### **APPOINTMENTS**
Citas entre pacientes y médicos. Vinculadas a un slot específico.

**Clave Primaria**: `id` (CHAR/UUID)

**Claves Foráneas**:
- `patient_id` → `USERS.id`
- `doctor_id` → `DOCTORS.id`
- `slot_id` → `SLOTS.id` (UNIQUE)

**Atributos**:
- `id` (CHAR/UUID, PK): Identificador único
- `patient_id` (CHAR/UUID, FK, NOT NULL, INDEX): ID del paciente
- `doctor_id` (CHAR/UUID, FK, NOT NULL, INDEX): ID del médico
- `slot_id` (CHAR/UUID, FK, NOT NULL, UNIQUE, INDEX): ID del slot reservado
- `appointment_date` (DATETIME, NOT NULL, INDEX): Fecha/hora de la cita (CDMX timezone)
- `status` (ENUM, NOT NULL, DEFAULT 'confirmed', INDEX): Estado de la cita. Valores: `'confirmed'`, `'pending'`, `'completed'`, `'cancelled'`, `'no_show'`
- `cancellation_reason` (TEXT, NULLABLE): Motivo de cancelación si aplica
- `reminder_sent` (BOOLEAN, NOT NULL, DEFAULT false, INDEX): Indica si se envió recordatorio 30 min antes
- `reminder_sent_at` (DATETIME, NULLABLE): Fecha/hora de envío del recordatorio
- `notes` (TEXT, NULLABLE): Notas adicionales sobre la cita
- `created_at` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE)
- `deleted_at` (DATETIME, NULLABLE, INDEX): Soft delete

**Índices**:
- `idx_slot_id` (UNIQUE): Garantiza un slot solo tiene una cita
- `idx_patient_id`: Búsqueda de citas por paciente
- `idx_doctor_id`: Búsqueda de citas por médico
- `idx_appointment_date`: Búsqueda por fecha
- `idx_status`: Filtrado por estado
- `idx_patient_status_date` (COMPOSITE): Verificación de citas activas por paciente (patient_id, status, appointment_date)
- `idx_reminder_sent` (COMPOSITE): Búsqueda de citas para recordatorios (reminder_sent, appointment_date, status)

**Relaciones**:
- N:1 con `USERS` (como paciente)
- N:1 con `DOCTORS`
- 1:1 con `SLOTS` (único slot por cita)
- 1:N con `APPOINTMENT_HISTORY` (historial de cambios)
- 1:1 con `REVIEWS` (una reseña por cita)

**Restricciones de Negocio**:
- Solo una cita activa (`status IN ('confirmed', 'pending')`) por paciente a la vez
- Un slot solo puede tener una cita confirmada

---

#### **APPOINTMENT_HISTORY**
Historial de cambios en citas (reprogramaciones, cancelaciones, cambios de estado).

**Clave Primaria**: `id` (CHAR/UUID)

**Clave Foránea**:
- `appointment_id` → `APPOINTMENTS.id`
- `changed_by` → `USERS.id` (quien hizo el cambio)

**Atributos**:
- `id` (CHAR/UUID, PK): Identificador único
- `appointment_id` (CHAR/UUID, FK, NOT NULL, INDEX): ID de la cita
- `old_status` (ENUM, NULLABLE): Estado anterior de la cita
- `new_status` (ENUM, NOT NULL): Estado nuevo de la cita
- `change_reason` (TEXT, NULLABLE): Motivo del cambio
- `changed_by` (CHAR/UUID, FK, NULLABLE): ID del usuario que hizo el cambio (paciente, médico o admin)
- `changed_at` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP, INDEX): Fecha/hora del cambio
- `metadata` (TEXT, NULLABLE): JSON con datos adicionales (fechas anteriores, notas, etc.)

**Índices**:
- `idx_appointment_id`: Búsqueda de historial por cita
- `idx_changed_at`: Ordenamiento por fecha de cambio

**Relaciones**:
- N:1 con `APPOINTMENTS`
- N:1 con `USERS` (como changed_by, nullable)

---

#### **REVIEWS**
Reseñas y calificaciones de pacientes sobre médicos. Vinculadas a una cita específica. Una reseña por cita.

**Clave Primaria**: `id` (CHAR/UUID)

**Claves Foráneas**:
- `appointment_id` → `APPOINTMENTS.id` (UNIQUE)
- `patient_id` → `USERS.id`
- `doctor_id` → `DOCTORS.id`
- `moderated_by` → `USERS.id` (admin que moderó)

**Atributos**:
- `id` (CHAR/UUID, PK): Identificador único
- `appointment_id` (CHAR/UUID, FK, NOT NULL, UNIQUE, INDEX): ID de la cita (una reseña por cita)
- `patient_id` (CHAR/UUID, FK, NOT NULL, INDEX): ID del paciente que escribió la reseña
- `doctor_id` (CHAR/UUID, FK, NOT NULL, INDEX): ID del médico calificado
- `rating` (INT, NOT NULL, INDEX, CHECK 1-5): Calificación de 1 a 5 estrellas
- `comment` (TEXT, NOT NULL): Texto de la reseña (obligatorio)
- `moderation_status` (ENUM, NOT NULL, DEFAULT 'pending', INDEX): Estado de moderación. Valores: `'pending'`, `'approved'`, `'rejected'`
- `moderation_notes` (TEXT, NULLABLE): Notas del administrador sobre la moderación
- `moderated_by` (CHAR/UUID, FK, NULLABLE): ID del admin que moderó la reseña
- `moderated_at` (DATETIME, NULLABLE): Fecha/hora de moderación
- `created_at` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE)
- `deleted_at` (DATETIME, NULLABLE, INDEX): Soft delete

**Índices**:
- `idx_appointment_id` (UNIQUE): Garantiza una reseña por cita
- `idx_doctor_id`: Búsqueda de reseñas por médico
- `idx_patient_id`: Búsqueda de reseñas por paciente
- `idx_moderation_status`: Filtrado por estado de moderación
- `idx_rating`: Cálculo de promedios

**Relaciones**:
- 1:1 con `APPOINTMENTS` (una reseña por cita)
- N:1 con `USERS` (como paciente)
- N:1 con `DOCTORS`
- N:1 con `USERS` (como moderated_by admin, nullable)

**Restricciones**:
- UNIQUE(appointment_id): Solo una reseña por cita
- CHECK(rating >= 1 AND rating <= 5): Calificación válida
- NOT NULL(comment): Texto obligatorio

---

#### **VERIFICATION_DOCUMENTS**
Documentos de verificación de médicos (cédulas profesionales, diplomas, etc.). Un médico puede tener múltiples documentos.

**Clave Primaria**: `id` (CHAR/UUID)

**Claves Foráneas**:
- `doctor_id` → `DOCTORS.id`
- `reviewed_by` → `USERS.id` (admin que revisó)

**Atributos**:
- `id` (CHAR/UUID, PK): Identificador único
- `doctor_id` (CHAR/UUID, FK, NOT NULL, INDEX): ID del médico
- `file_path` (VARCHAR, NOT NULL): Ruta al archivo en storage (`/var/www/citaya/storage/uploads/`)
- `original_filename` (VARCHAR, NOT NULL): Nombre original del archivo subido
- `mime_type` (VARCHAR, NOT NULL): Tipo MIME del archivo (ej: 'application/pdf', 'image/jpeg')
- `file_size_bytes` (BIGINT, NOT NULL): Tamaño del archivo en bytes
- `document_type` (ENUM, NOT NULL, INDEX): Tipo de documento. Valores: `'cedula'`, `'diploma'`, `'other'`
- `status` (ENUM, NOT NULL, DEFAULT 'pending', INDEX): Estado de revisión. Valores: `'pending'`, `'approved'`, `'rejected'`
- `admin_notes` (TEXT, NULLABLE): Notas del administrador sobre el documento
- `reviewed_by` (CHAR/UUID, FK, NULLABLE): ID del admin que revisó el documento
- `reviewed_at` (DATETIME, NULLABLE): Fecha/hora de revisión
- `created_at` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE)
- `deleted_at` (DATETIME, NULLABLE, INDEX): Soft delete

**Índices**:
- `idx_doctor_id`: Búsqueda de documentos por médico
- `idx_status`: Filtrado por estado de revisión
- `idx_document_type`: Filtrado por tipo de documento

**Relaciones**:
- N:1 con `DOCTORS`
- N:1 con `USERS` (como reviewed_by admin, nullable)

---

#### **NOTIFICATIONS**
Notificaciones del sistema (email y push web). No se guarda historial de emails/push enviados, solo el registro de la notificación.

**Clave Primaria**: `id` (CHAR/UUID)

**Clave Foránea**:
- `user_id` → `USERS.id`

**Atributos**:
- `id` (CHAR/UUID, PK): Identificador único
- `user_id` (CHAR/UUID, FK, NOT NULL, INDEX): ID del usuario destinatario
- `type` (ENUM, NOT NULL, INDEX): Tipo de notificación. Valores: `'appointment_confirmation'`, `'appointment_reminder'`, `'appointment_cancelled'`, `'appointment_rescheduled'`, `'verification_approved'`, `'verification_rejected'`, `'review_moderated'`
- `title` (VARCHAR, NOT NULL): Título de la notificación
- `message` (TEXT, NOT NULL): Mensaje de la notificación
- `channel` (ENUM, NOT NULL): Canal de envío. Valores: `'email'`, `'push'`, `'both'`
- `status` (ENUM, NOT NULL, DEFAULT 'pending', INDEX): Estado de envío. Valores: `'pending'`, `'sent'`, `'failed'`
- `metadata` (TEXT, NULLABLE): JSON con datos adicionales (appointment_id, etc.)
- `sent_at` (DATETIME, NULLABLE): Fecha/hora de envío exitoso
- `created_at` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP, INDEX)
- `updated_at` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE)

**Índices**:
- `idx_user_id`: Búsqueda de notificaciones por usuario
- `idx_status`: Filtrado por estado de envío
- `idx_type`: Filtrado por tipo de notificación
- `idx_created_at`: Ordenamiento por fecha

**Relaciones**:
- N:1 con `USERS`

---

#### **SYSTEM_SETTINGS**
Configuración del sistema gestionada por administradores (duración estándar de citas, zona horaria, etc.).

**Clave Primaria**: `key` (VARCHAR)

**Clave Foránea**:
- `updated_by` → `USERS.id` (admin que actualizó)

**Atributos**:
- `key` (VARCHAR, PK): Clave de configuración (ej: 'default_appointment_duration', 'timezone')
- `value` (TEXT, NOT NULL): Valor de configuración (puede ser JSON si es necesario)
- `description` (VARCHAR, NULLABLE): Descripción de la configuración
- `category` (VARCHAR, NOT NULL, DEFAULT 'general', INDEX): Categoría de configuración
- `updated_at` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE)
- `updated_by` (CHAR/UUID, FK, NULLABLE): ID del admin que actualizó la configuración

**Índices**:
- `idx_category`: Filtrado por categoría

**Relaciones**:
- N:1 con `USERS` (como updated_by admin, nullable)

**Ejemplos de Configuración**:
- `default_appointment_duration`: "30" (minutos)
- `timezone`: "America/Mexico_City"
- `reminder_minutes_before`: "30"
- `slot_lock_duration_minutes`: "5"

---

#### **AUDIT_LOGS**
Logs de auditoría de todas las acciones del sistema (login, cambios de citas, acceso a datos sensibles, etc.).

**Clave Primaria**: `id` (CHAR/UUID)

**Clave Foránea**:
- `user_id` → `USERS.id` (quien ejecutó la acción)

**Atributos**:
- `id` (CHAR/UUID, PK): Identificador único
- `user_id` (CHAR/UUID, FK, NULLABLE, INDEX): ID del usuario que ejecutó la acción
- `action` (VARCHAR, NOT NULL, INDEX): Nombre de la acción (ej: 'login', 'create_appointment', 'update_doctor')
- `entity_type` (VARCHAR, NOT NULL, INDEX): Tipo de entidad afectada (ej: 'appointment', 'doctor', 'review')
- `entity_id` (CHAR/UUID, NULLABLE): ID de la entidad afectada
- `old_values` (TEXT, NULLABLE): JSON con valores anteriores
- `new_values` (TEXT, NULLABLE): JSON con valores nuevos
- `ip_address` (VARCHAR, NULLABLE): Dirección IP origen
- `user_agent` (VARCHAR, NULLABLE): User agent del navegador
- `created_at` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP, INDEX)

**Índices**:
- `idx_user_id`: Búsqueda de acciones por usuario
- `idx_action`: Filtrado por tipo de acción
- `idx_entity_type`: Filtrado por tipo de entidad
- `idx_created_at`: Ordenamiento por fecha
- `idx_entity` (COMPOSITE): Búsqueda de historial de una entidad específica (entity_type, entity_id)

**Relaciones**:
- N:1 con `USERS` (como user_id, nullable)

**Retención**: Configurable (recomendado: 1 año)

---

### **3.3. Consideraciones de Diseño**

#### **Normalización**
El modelo está normalizado hasta 3NF (Tercera Forma Normal):
- Eliminación de redundancias
- Separación de entidades independientes
- Tablas intermedias para relaciones muchos-a-muchos
- Campos calculados (rating_average, total_reviews) se mantienen por performance (denormalización controlada)

#### **Soft Delete**
Implementado en entidades principales (`USERS`, `DOCTORS`, `APPOINTMENTS`, `REVIEWS`, `SPECIALTIES`, `VERIFICATION_DOCUMENTS`, `DOCTOR_SCHEDULES`) para cumplimiento GDPR:
- Campo `deleted_at` (DATETIME, NULLABLE)
- Registros eliminados se marcan con fecha, no se borran físicamente
- Retención de 1 año antes de eliminación permanente
- Índices en `deleted_at` para filtrado eficiente

#### **Zona Horaria**
- Todas las fechas/horas se almacenan en hora CDMX (America/Mexico_City)
- Campos `DATETIME` sin conversión UTC
- Configuración en `SYSTEM_SETTINGS` para referencia

#### **Geolocalización**
- Coordenadas almacenadas en `DOCTORS` (latitude, longitude)
- Índice espacial (SPATIAL INDEX) para búsquedas eficientes con fórmula Haversine
- Fallback a búsqueda por código postal (`postal_code`) si no hay geolocalización
- Código postal obligatorio en registro de médicos

#### **Bloqueo de Slots (Soft Lock)**
- Campo `locked_by` y `locked_until` en `SLOTS`
- Expiración automática después de 5 minutos
- Cleanup job necesario para liberar locks expirados
- Transacciones ACID para prevenir doble booking

#### **Índices Críticos**
- **Búsquedas geográficas**: SPATIAL INDEX en `DOCTORS` (latitude, longitude)
- **Búsqueda de médicos**: Índice compuesto en `DOCTOR_SPECIALTIES` (specialty_id, doctor_id)
- **Verificación de citas activas**: Índice compuesto en `APPOINTMENTS` (patient_id, status, appointment_date)
- **Recordatorios**: Índice compuesto en `APPOINTMENTS` (reminder_sent, appointment_date, status)
- **Auditoría**: Índice compuesto en `AUDIT_LOGS` (entity_type, entity_id)

#### **Restricciones de Integridad**
- Foreign Keys con CASCADE DELETE donde aplica (ej: eliminar usuario elimina citas)
- UNIQUE constraints en relaciones 1:1 (ej: slot_id en appointments, appointment_id en reviews)
- CHECK constraints en valores válidos (ej: rating 1-5)
- NOT NULL en campos obligatorios

#### **Performance**
- Índices estratégicos para consultas frecuentes
- Campos calculados (rating_average, total_reviews) para evitar agregaciones costosas
- Cache en Redis para búsquedas frecuentes (médicos por especialidad, disponibilidad)

---

## 4. Especificación de la API

La especificación completa de la API del MVP de CitaYa está documentada en formato **OpenAPI 3.1** en el archivo [`api-specification.yaml`](./api-specification.yaml).

### **4.1. Resumen de Endpoints**

La API RESTful está estructurada bajo el prefijo `/api/v1/` y organizada por recursos:

#### **Autenticación** (`/api/v1/auth`)
- `POST /auth/register` - Registrar nuevo usuario (paciente o médico)
- `POST /auth/login` - Iniciar sesión
- `POST /auth/refresh` - Refrescar token de acceso
- `POST /auth/logout` - Cerrar sesión

#### **Búsqueda de Médicos** (`/api/v1/doctors`) - Paciente
- `GET /doctors` - Buscar médicos por especialidad, proximidad y disponibilidad
- `GET /doctors/{id}` - Obtener detalle de médico

#### **Gestión de Citas** (`/api/v1/appointments`) - Paciente
- `POST /appointments` - Crear nueva cita ⭐
- `GET /appointments` - Listar mis citas
- `GET /appointments/{id}` - Obtener detalle de cita
- `PATCH /appointments/{id}` - Reprogramar o cancelar cita ⭐

#### **Reseñas** (`/api/v1/appointments/{id}/reviews`) - Paciente
- `POST /appointments/{id}/reviews` - Crear reseña de cita ⭐
- `GET /appointments/{id}/reviews` - Obtener reseña de cita

#### **Perfil Médico** (`/api/v1/doctors/me`)
- `GET /doctors/me` - Obtener mi perfil
- `PATCH /doctors/me` - Actualizar mi perfil

#### **Verificación Médico** (`/api/v1/doctors/verification`)
- `POST /doctors/verification` - Subir documento de verificación (cédula profesional) ⭐

#### **Horarios Médico** (`/api/v1/doctors/me/schedules`)
- `GET /doctors/me/schedules` - Listar mis horarios
- `POST /doctors/me/schedules` - Crear horario de trabajo
- `PATCH /doctors/me/schedules/{id}` - Actualizar horario
- `DELETE /doctors/me/schedules/{id}` - Eliminar horario

#### **Citas Médico** (`/api/v1/doctors/me/appointments`)
- `GET /doctors/me/appointments` - Listar mis citas (médico)
- `GET /doctors/me/appointments/{id}` - Obtener detalle de cita (médico)

#### **Reseñas Médico** (`/api/v1/doctors/me/reviews`)
- `GET /doctors/me/reviews` - Listar mis reseñas recibidas

⭐ = Endpoints principales con ejemplos de petición y respuesta incluidos en la especificación

### **4.2. Autenticación JWT**

La API utiliza **JWT (JSON Web Tokens)** para autenticación:

- **Access Token**: Duración de 15 minutos, se envía en el header `Authorization: Bearer <token>`
- **Refresh Token**: Duración de 7 días, almacenado en cookie `httpOnly` y `Secure`

**Ejemplo de header de autenticación:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJyb2xlIjoicGF0aWVudCIsImlhdCI6MTY3NDIwMDAwMCwiZXhwIjoxNjc0MjAwOTAwfQ.signature
```

### **4.3. Ejemplos de Endpoints Principales**

La especificación OpenAPI incluye ejemplos completos de petición y respuesta para los siguientes endpoints principales:

1. **POST /api/v1/appointments** - Crear nueva cita
   - Ejemplo de petición con `doctorId`, `slotId` y `appointmentDate`
   - Respuestas exitosas (201) y casos de error (400, 404, 409)
   - Manejo de conflictos (slot no disponible, paciente con cita activa)

2. **PATCH /api/v1/appointments/{id}** - Reprogramar o cancelar cita
   - Ejemplos de cancelación y reprogramación
   - Validación de estados y slots disponibles

3. **POST /api/v1/appointments/{id}/reviews** - Crear reseña
   - Validación de calificación (1-5) y comentario obligatorio
   - Restricción: solo una reseña por cita completada

4. **POST /api/v1/doctors/verification** - Subir cédula profesional
   - Validación de tipos de archivo (PDF, JPG, PNG, JPEG)
   - Límite de tamaño (10MB)
   - Encriptación del documento

### **4.4. Casos de Error Documentados**

La especificación incluye ejemplos de respuestas de error para:

- **400 Bad Request**: Validación de datos, slots no disponibles, estados inválidos
- **401 Unauthorized**: Token faltante, inválido o expirado, credenciales incorrectas
- **403 Forbidden**: Usuario sin permisos para acceder al recurso
- **404 Not Found**: Recurso no encontrado (médico, cita, slot, etc.)
- **409 Conflict**: Slot ya reservado, email duplicado, reseña existente
- **429 Too Many Requests**: Rate limiting excedido

### **4.5. Zona Horaria**

Todas las fechas y horas se manejan en **zona horaria de Ciudad de México (America/Mexico_City)** y se representan en formato ISO 8601 con offset `-06:00`.

**Ejemplo:**
```json
{
  "appointmentDate": "2026-01-25T10:00:00-06:00"
}
```

### **4.6. Rate Limiting**

- **Login**: 5 intentos por IP cada 15 minutos
- **Registro**: 3 intentos por IP cada hora
- **API general**: 100 requests por IP cada minuto

### **4.7. Documentación Completa**

Para ver la especificación completa con todos los detalles, schemas, ejemplos y casos de error, consulta el archivo [`api-specification.yaml`](./api-specification.yaml).

La especificación puede ser visualizada usando herramientas como:
- [Swagger Editor](https://editor.swagger.io/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Postman](https://www.postman.com/) (importar archivo YAML)
- [Insomnia](https://insomnia.rest/) (importar archivo YAML)

---

## 5. Historias de Usuario


### **Historia de Usuario 1: Registro de Paciente**

**Como** paciente nuevo  
**Quiero** registrarme en la plataforma con mi email y contraseña  
**Para** poder acceder al sistema y buscar médicos cercanos

#### Descripción
Un paciente nuevo debe poder crear una cuenta en la plataforma proporcionando información básica (email, contraseña, nombre, apellido) y completar el proceso de registro con protección anti-bot.

#### Criterios de Aceptación

**CA1: Formulario de Registro**
- El formulario debe incluir los siguientes campos obligatorios:
  - Email (validación de formato)
  - Contraseña (mínimo 8 caracteres)
  - Nombre (firstName)
  - Apellido (lastName)
  - Rol: "patient" (pre-seleccionado, no editable)
- El formulario debe incluir campo opcional:
  - Teléfono (formato internacional)
- Todos los campos deben tener validación en tiempo real
- El formulario debe mostrar mensajes de error claros para cada campo inválido

**CA2: Protección Anti-bot**
- El formulario debe incluir reCAPTCHA v3 antes de enviar
- El score de reCAPTCHA debe validarse en el backend antes de procesar el registro
- Si el score es menor al threshold configurado, se debe rechazar el registro con mensaje apropiado

**CA3: Validación de Email Único**
- El sistema debe verificar que el email no esté ya registrado
- Si el email existe, debe retornar error 409 con mensaje: "Email ya está registrado"
- El mensaje debe mostrarse claramente en el frontend

**CA4: Rate Limiting**
- El endpoint debe limitar a 3 intentos de registro por IP cada hora
- Si se excede el límite, debe retornar error 429 con header `Retry-After`
- El mensaje debe indicar cuánto tiempo debe esperar el usuario

**CA5: Creación de Usuario**
- Al completar el registro exitosamente:
  - Se crea el usuario en la base de datos con role="patient"
  - La contraseña se hashea con bcrypt (salt rounds=12)
  - Se establece `emailVerified=false` por defecto
  - Se registra timestamp de creación
- Se genera un JWT access token (duración 15 minutos)
- Se genera un JWT refresh token (duración 7 días) almacenado en cookie httpOnly
- Se retorna respuesta 201 con información del usuario y tokens

**CA6: Respuesta Exitosa**
- La respuesta debe incluir:
  - Objeto `user` con: id, email, firstName, lastName, role, emailVerified
  - `accessToken` (string JWT)
  - `refreshToken` (string JWT, también en cookie)
- El usuario debe ser redirigido automáticamente al dashboard de paciente

**CA7: Internacionalización**
- Todos los mensajes del formulario y errores deben estar disponibles en español e inglés
- El idioma debe detectarse automáticamente según preferencias del navegador
- El usuario debe poder cambiar el idioma manualmente

**CA8: Auditoría**
- Se debe registrar en `audit_logs`:
  - Acción: "register"
  - Entity_type: "user"
  - Entity_id: ID del usuario creado
  - IP_address: IP del usuario
  - Timestamp: Fecha/hora del registro

---

### **Historia de Usuario 2: Registro de Médico**

**Como** médico nuevo  
**Quiero** registrarme en la plataforma con mi información profesional  
**Para** poder ofrecer mis servicios y gestionar mi agenda

#### Descripción
Un médico nuevo debe poder crear una cuenta proporcionando información personal y profesional, incluyendo dirección y código postal para geolocalización.

#### Criterios de Aceptación

**CA1: Formulario de Registro Médico**
- El formulario debe incluir los siguientes campos obligatorios:
  - Email (validación de formato)
  - Contraseña (mínimo 8 caracteres)
  - Nombre (firstName)
  - Apellido (lastName)
  - Rol: "doctor" (pre-seleccionado, no editable)
  - Dirección completa del consultorio/clínica
  - Código postal (obligatorio para geolocalización fallback)
- El formulario debe incluir campos opcionales:
  - Teléfono (formato internacional)
  - Bio (descripción profesional, máximo 1000 caracteres)
- Todos los campos deben tener validación en tiempo real

**CA2: Geocodificación de Dirección**
- Al ingresar dirección y código postal:
  - Se debe llamar a Google Maps Geocoding API para obtener coordenadas (latitude, longitude)
  - Si la geocodificación falla, se debe permitir el registro pero mostrar advertencia
  - Las coordenadas se almacenan en la tabla `DOCTORS`
- El código postal se almacena obligatoriamente para búsqueda fallback

**CA3: Protección Anti-bot**
- El formulario debe incluir reCAPTCHA v3 antes de enviar
- El score de reCAPTCHA debe validarse en el backend antes de procesar el registro

**CA4: Validación de Email Único**
- El sistema debe verificar que el email no esté ya registrado
- Si el email existe, debe retornar error 409 con mensaje apropiado

**CA5: Rate Limiting**
- El endpoint debe limitar a 3 intentos de registro por IP cada hora
- Si se excede el límite, debe retornar error 429 con header `Retry-After`

**CA6: Creación de Usuario y Perfil Médico**
- Al completar el registro exitosamente:
  - Se crea el usuario en la tabla `USERS` con role="doctor"
  - Se crea el registro correspondiente en la tabla `DOCTORS` con:
    - `verification_status='pending'` (por defecto)
    - Dirección y código postal
    - Coordenadas geográficas (si geocodificación exitosa)
    - Bio (si se proporcionó)
  - La contraseña se hashea con bcrypt (salt rounds=12)
  - Se establece `emailVerified=false` por defecto
- Se genera un JWT access token (duración 15 minutos)
- Se genera un JWT refresh token (duración 7 días) almacenado en cookie httpOnly

**CA7: Estado de Verificación**
- El médico debe ver un mensaje indicando que su cuenta está pendiente de verificación
- El médico debe poder acceder a su panel pero con funcionalidades limitadas hasta la verificación
- Se debe mostrar claramente el estado de verificación en el perfil

**CA8: Respuesta Exitosa**
- La respuesta debe incluir:
  - Objeto `user` con: id, email, firstName, lastName, role, emailVerified
  - `accessToken` (string JWT)
  - `refreshToken` (string JWT, también en cookie)
- El médico debe ser redirigido al panel de médico con instrucciones para completar verificación

**CA9: Internacionalización**
- Todos los mensajes del formulario y errores deben estar disponibles en español e inglés

**CA10: Auditoría**
- Se debe registrar en `audit_logs`:
  - Acción: "register"
  - Entity_type: "user" y "doctor"
  - Entity_id: IDs creados
  - IP_address: IP del usuario
  - Timestamp: Fecha/hora del registro

---

### **Historia de Usuario 3: Búsqueda de Médicos por Especialidad y Proximidad**

**Como** paciente autenticado  
**Quiero** buscar médicos por especialidad y proximidad geográfica  
**Para** encontrar médicos cercanos que atiendan mi necesidad médica

#### Descripción
Un paciente autenticado debe poder buscar médicos filtrando por especialidad y usando su ubicación (o código postal) para encontrar médicos cercanos, con visualización en mapa.

#### Criterios de Aceptación

**CA1: Autenticación Requerida**
- El endpoint requiere autenticación JWT (Bearer token)
- Si no hay token o es inválido, debe retornar error 401
- El token debe contener role="patient"

**CA2: Filtros de Búsqueda**
- El formulario de búsqueda debe incluir:
  - Selector de especialidad (dropdown con especialidades activas)
  - Opción para usar geolocalización del navegador (botón "Usar mi ubicación")
  - Campo opcional para código postal (fallback si no hay geolocalización)
  - Selector de radio de búsqueda (por defecto 5km, editable 1-50km)
  - Filtro opcional por fecha para ver disponibilidad

**CA3: Geolocalización**
- Si el usuario permite acceso a ubicación:
  - Se obtienen coordenadas (lat, lng) del navegador
  - Se muestran en el mapa con marcador del usuario
  - Se usa para calcular distancia a médicos
- Si el usuario deniega acceso a ubicación:
  - Se muestra campo de código postal como obligatorio
  - Se usa código postal para búsqueda fallback

**CA4: Búsqueda por Proximidad (con coordenadas)**
- Si se proporcionan coordenadas (lat, lng):
  - Se calcula distancia usando fórmula Haversine en MySQL
  - Se filtran médicos dentro del radio especificado (por defecto 5km)
  - Se ordenan por distancia (más cercanos primero)
  - Se muestra distancia en kilómetros para cada médico
- Solo se muestran médicos con `verification_status='approved'`
- Solo se muestran médicos con `deleted_at IS NULL`

**CA5: Búsqueda por Código Postal (fallback)**
- Si no hay coordenadas pero hay código postal:
  - Se usa código postal para filtrar médicos
  - Se ordenan por especialidad y rating promedio
  - No se muestra distancia (no aplicable)
- Se debe mostrar mensaje indicando que se está usando búsqueda por código postal

**CA6: Filtro por Disponibilidad**
- Si se proporciona fecha en el filtro:
  - Se muestran solo médicos con slots disponibles en esa fecha
  - Se verifica que los slots tengan `is_available=true`
  - Se verifica que los slots no estén bloqueados (`locked_until < NOW()` o `locked_until IS NULL`)

**CA7: Resultados de Búsqueda**
- Cada resultado debe mostrar:
  - Nombre completo del médico (firstName + lastName)
  - Especialidades (con nombre en idioma seleccionado)
  - Dirección
  - Distancia en km (si búsqueda por coordenadas)
  - Rating promedio (si tiene reseñas)
  - Total de reseñas
  - Estado de verificación (solo "approved" debe aparecer)
  - Botón "Ver perfil" y "Ver disponibilidad"

**CA8: Visualización en Mapa**
- Se debe mostrar mapa de Google Maps con:
  - Marcador del usuario (si hay geolocalización)
  - Marcadores de todos los médicos encontrados
  - InfoWindow al hacer clic en marcador con información básica del médico
  - Zoom automático para mostrar todos los marcadores
- El mapa debe ser interactivo y permitir hacer clic en marcadores

**CA9: Paginación**
- Los resultados deben estar paginados:
  - Por defecto: 20 resultados por página
  - Máximo: 50 resultados por página
  - Debe incluir información de paginación: página actual, total de páginas, total de resultados

**CA10: Cache**
- Los resultados deben cachearse en Redis:
  - Key: `doctors:{specialty}:{lat}:{lng}:{radius}:{date}`
  - TTL: 10 minutos
  - Si hay cache hit, se retornan resultados desde cache sin consultar BD

**CA11: Manejo de Errores**
- Si no se encuentran médicos:
  - Se muestra mensaje: "No se encontraron médicos con los criterios especificados"
  - Se sugiere ampliar el radio de búsqueda o cambiar especialidad
- Si falla la geocodificación:
  - Se muestra mensaje de error pero se permite búsqueda por código postal

**CA12: Internacionalización**
- Todos los textos deben estar disponibles en español e inglés
- Los nombres de especialidades deben mostrarse en el idioma seleccionado

**CA13: Performance**
- La búsqueda debe completarse en menos de 500ms (P95)
- Se deben usar índices adecuados en BD para optimizar consultas geográficas

---

### **Historia de Usuario 4: Reserva de Cita Médica**

**Como** paciente autenticado  
**Quiero** reservar una cita con un médico seleccionando un slot disponible  
**Para** poder recibir atención médica en la fecha y hora que prefiero

#### Descripción
Un paciente autenticado debe poder seleccionar un médico, ver sus slots disponibles, elegir uno y confirmar la reserva. El sistema debe prevenir doble booking usando transacciones ACID y soft locks.

#### Criterios de Aceptación

**CA1: Autenticación y Autorización**
- El endpoint requiere autenticación JWT (Bearer token)
- Si no hay token o es inválido, debe retornar error 401
- El token debe contener role="patient"

**CA2: Visualización de Slots Disponibles**
- Al seleccionar un médico, se debe mostrar:
  - Calendario con fechas disponibles (solo fechas futuras)
  - Slots disponibles por día (horarios con duración estándar de 30 minutos)
  - Slots bloqueados o no disponibles deben mostrarse deshabilitados
- Los slots deben mostrarse en zona horaria de CDMX
- Solo se muestran slots con `is_available=true` y que no estén bloqueados

**CA3: Selección de Slot**
- El paciente puede hacer clic en un slot disponible
- Al seleccionar un slot:
  - Se muestra información del slot: fecha, hora de inicio, hora de fin
  - Se muestra información del médico: nombre, especialidad, dirección
  - Se habilita botón "Confirmar Cita"
  - Opcionalmente se puede agregar nota (máximo 500 caracteres)

**CA4: Bloqueo Temporal de Slot (Soft Lock)**
- Al iniciar el proceso de reserva:
  - El slot se bloquea temporalmente para el paciente (`locked_by=patientId`)
  - Se establece `locked_until=NOW() + 5 minutos`
  - El slot aparece como "reservando..." para otros usuarios
- Si el paciente no completa la reserva en 5 minutos:
  - El lock expira automáticamente
  - El slot vuelve a estar disponible
  - Se ejecuta cleanup job para liberar locks expirados

**CA5: Validación de Restricciones de Negocio**
- Antes de crear la cita, se debe validar:
  - El paciente no tiene otra cita activa (`status IN ('confirmed', 'pending')` y `appointment_date > NOW()`)
  - Si tiene cita activa, debe retornar error 400: "Ya tienes una cita activa. Cancela o reprograma la cita existente antes de crear una nueva"
  - El slot sigue disponible (`is_available=true` y no está bloqueado por otro usuario)
  - El slot pertenece al médico seleccionado

**CA6: Creación de Cita (Transacción ACID)**
- La creación de cita debe ejecutarse en una transacción ACID:
  1. Verificar y bloquear el slot (UPDATE con WHERE conditions)
  2. Verificar que paciente no tiene cita activa
  3. Crear registro en tabla `APPOINTMENTS` con:
     - `status='confirmed'`
     - `appointment_date` (fecha/hora del slot)
     - `reminder_sent=false`
     - `notes` (si se proporcionaron)
  4. Marcar slot como no disponible (`is_available=false`)
  5. Crear registro en `APPOINTMENT_HISTORY` con cambio de estado
- Si cualquier paso falla, se hace rollback completo de la transacción

**CA7: Prevención de Doble Booking**
- Si dos pacientes intentan reservar el mismo slot simultáneamente:
  - Solo uno debe tener éxito (el primero en adquirir el lock)
  - El segundo debe recibir error 409: "El slot ya fue reservado por otro paciente"
- Se debe usar SELECT FOR UPDATE o UPDATE con condiciones para garantizar atomicidad

**CA8: Notificación de Confirmación**
- Después de crear la cita exitosamente:
  - Se encola trabajo en Bull para enviar email de confirmación (SendGrid)
  - Se encola trabajo para enviar Web Push notification (si está habilitado)
  - El email debe incluir:
    - Fecha y hora de la cita
    - Nombre del médico
    - Dirección del consultorio
    - Instrucciones para reprogramar o cancelar
- Las notificaciones se envían de forma asíncrona (no bloquean la respuesta)

**CA9: Respuesta Exitosa**
- La respuesta debe incluir:
  - `id` de la cita creada
  - `appointmentDate` (formato ISO 8601 con timezone CDMX)
  - `status: "confirmed"`
  - Información del médico (nombre, especialidad)
  - Información del slot (startTime, endTime)
  - `createdAt` timestamp
- Se retorna código 201 Created

**CA10: Manejo de Errores**
- Si el slot no existe: error 404 "Slot no encontrado"
- Si el médico no existe: error 404 "Médico no encontrado"
- Si el slot no está disponible: error 400 "El slot seleccionado no está disponible"
- Si el paciente tiene cita activa: error 400 con código "ACTIVE_APPOINTMENT_EXISTS"
- Si hay conflicto de reserva: error 409 "El slot ya fue reservado por otro paciente"
- Todos los errores deben tener mensajes claros y códigos apropiados

**CA11: Auditoría**
- Se debe registrar en `audit_logs`:
  - Acción: "create_appointment"
  - Entity_type: "appointment"
  - Entity_id: ID de la cita creada
  - IP_address: IP del paciente
  - Timestamp: Fecha/hora de creación

**CA12: Internacionalización**
- Todos los mensajes deben estar disponibles en español e inglés

**CA13: Performance**
- La creación de cita debe completarse en menos de 1 segundo (P95)
- Las notificaciones no deben bloquear la respuesta del API

---

### **Historia de Usuario 8: Gestión de Horarios de Trabajo**

**Como** médico autenticado  
**Quiero** configurar mis horarios de trabajo por día de la semana  
**Para** que el sistema genere automáticamente slots disponibles para que los pacientes reserven citas

#### Descripción
Un médico autenticado debe poder crear, actualizar y eliminar horarios de trabajo que definen cuándo está disponible. Estos horarios se usan para generar slots automáticamente.

#### Criterios de Aceptación

**CA1: Autenticación y Autorización**
- El endpoint requiere autenticación JWT (Bearer token)
- Solo el médico dueño puede gestionar sus horarios
- Si el usuario no tiene role="doctor", debe retornar error 403

**CA2: Visualización de Horarios**
- El médico debe poder ver todos sus horarios activos:
  - Lista de horarios por día de la semana
  - Para cada horario: día, hora de inicio, hora de fin, duración de slot, pausas
  - Indicador de estado activo/inactivo
  - Botones para editar o eliminar

**CA3: Creación de Horario**
- El formulario debe incluir:
  - `dayOfWeek`: Selector de día (0=domingo, 1=lunes, ..., 6=sábado)
  - `startTime`: Hora de inicio (formato HH:MM:SS, ejemplo "09:00:00")
  - `endTime`: Hora de fin (formato HH:MM:SS, ejemplo "17:00:00")
  - `slotDurationMinutes`: Duración de cada slot (por defecto 30 minutos)
  - `breakDurationMinutes`: Duración de pausas entre slots (por defecto 0 minutos)
- Validaciones:
  - `endTime` debe ser posterior a `startTime`
  - `slotDurationMinutes` debe ser mayor a 0
  - `breakDurationMinutes` debe ser mayor o igual a 0
  - No puede haber solapamiento de horarios en el mismo día

**CA4: Generación Automática de Slots**
- Al crear/actualizar un horario activo:
  - Se generan slots automáticamente según la configuración
  - Los slots se crean para fechas futuras (próximas 4 semanas)
  - Cada slot tiene duración `slotDurationMinutes`
  - Entre slots hay pausa de `breakDurationMinutes`
  - Ejemplo: 09:00-17:00, slots de 30 min, pausas de 15 min → slots: 09:00-09:30, 09:45-10:15, 10:30-11:00, etc.
- Los slots se crean en la tabla `SLOTS`:
  - `doctor_id`: ID del médico
  - `schedule_id`: ID del horario que los generó
  - `start_time` y `end_time`: Fechas/horas calculadas
  - `is_available=true` por defecto

**CA5: Actualización de Horario**
- El médico puede actualizar:
  - `startTime` y `endTime`
  - `slotDurationMinutes`
  - `breakDurationMinutes`
  - `isActive` (activar/desactivar horario)
- Al actualizar un horario activo:
  - Se eliminan slots futuros generados por ese horario (soft delete)
  - Se generan nuevos slots según la nueva configuración
  - Los slots ya reservados no se eliminan

**CA6: Eliminación de Horario (Soft Delete)**
- El médico puede eliminar un horario:
  - Se marca `deleted_at` en tabla `DOCTOR_SCHEDULES`
  - Se eliminan slots futuros no reservados generados por ese horario
  - Los slots ya reservados se mantienen (no se eliminan)
- No se puede eliminar un horario si tiene citas futuras confirmadas (mostrar advertencia)

**CA7: Validación de Solapamiento**
- No se pueden crear horarios que se solapen en el mismo día:
  - Ejemplo: Si hay horario 09:00-12:00, no se puede crear 11:00-14:00
  - Si hay solapamiento, retornar error 400: "El horario se solapa con otro horario existente en el mismo día"

**CA8: Zona Horaria**
- Todos los horarios se manejan en zona horaria de CDMX (America/Mexico_City)
- Los slots generados tienen fechas/horas en CDMX
- Se muestra claramente la zona horaria en la interfaz

**CA9: Respuesta Exitosa**
- Al crear horario: código 201 con objeto `DoctorSchedule` completo
- Al actualizar horario: código 200 con objeto `DoctorSchedule` actualizado
- Al eliminar horario: código 200 con mensaje "Horario eliminado exitosamente"

**CA10: Manejo de Errores**
- Si el usuario no es médico: error 403 "Este endpoint solo está disponible para médicos"
- Si hay solapamiento: error 400 "El horario se solapa con otro horario existente"
- Si `endTime` <= `startTime`: error 400 "La hora de fin debe ser posterior a la hora de inicio"
- Si el horario no existe: error 404 "Horario no encontrado"
- Todos los errores deben tener mensajes claros

**CA11: Auditoría**
- Se debe registrar en `audit_logs`:
  - Acción: "create_schedule", "update_schedule", o "delete_schedule"
  - Entity_type: "doctor_schedule"
  - Entity_id: ID del horario
  - IP_address: IP del médico
  - Timestamp: Fecha/hora de la acción

**CA12: Internacionalización**
- Todos los mensajes deben estar disponibles en español e inglés
- Los nombres de días de la semana deben mostrarse en el idioma seleccionado

---

## 6. Tickets de Trabajo

> Tres primeros tickets generados (frontend, backend y base de datos) con rutas actualizadas en `documentation/`.

**Ticket 1 (Frontend)**  
- ID: HU1-FE-001 — Formulario de Registro de Paciente  
- Ruta: `documentation/HU1/frontend/HU1-FE-001-Registro-Paciente.md`  
- Alcance: Formulario con validación en tiempo real, reCAPTCHA v3, manejo de errores 409/429, i18n ES/EN, redirección a dashboard. Incluye pasos técnicos, archivos a crear y dependencias.

**Ticket 2 (Backend)**  
- ID: HU1-BE-001 — Endpoint de Registro de Paciente  
- Ruta: `documentation/HU1/backend/HU1-BE-001-Registro-Paciente.md`  
- Alcance: POST `/api/v1/auth/register` con validación, reCAPTCHA, rate limiting, creación de usuario/bcrypt, tokens JWT, audit_logs. Incluye DTOs, servicio, controlador, manejo de errores y env vars.

**Ticket 3 (Base de Datos)**  
- ID: HU1-DB-001 — Migración Tabla USERS  
- Ruta: `documentation/HU1/database/HU1-DB-001-Migracion-Tabla-USERS.md`  
- Alcance: Migración TypeORM para `USERS` (email único, role enum, timestamps), índices, rollback SQL y pruebas de migración.

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**

