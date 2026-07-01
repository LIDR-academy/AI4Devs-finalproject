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

### **0.1. Tu nombre completo:**
Pedro San Román Pacheco

### **0.2. Nombre del proyecto:**
Aura Planning

### **0.3. Descripción breve del proyecto:**
Aura Planning es una plataforma SaaS que reemplaza las invitaciones de boda de papel con un ecosistema digital interactivo. Combina el diseño de invitaciones personalizables, la gestión centralizada de invitados con seguimiento de RSVP en tiempo real, y un **Live Guest Journey** — narración en tiempo real del día del evento a través de WhatsApp gestionado por un "cómplice" de confianza (padrino/dama de honor). El modelo de negocio es un pago único (19-29 EUR) con acceso gratuito al modo borrador, dirigiéndose inicialmente al mercado de bodas en España con una futura expansión a LATAM y otros tipos de celebraciones.

### **0.4. URL del proyecto:**

https://github.com/users/pedrosrp/projects/3

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido

---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**

Aura Planning reemplaza las invitaciones de boda de papel con un **ecosistema digital interactivo** que elimina el estrés logístico y genera expectación entre los invitados. Ofrece tres capacidades principales:

1. **Diseño** — Plantillas de invitación hermosas y personalizables que no requieren habilidades de diseño
2. **Logística** — Gestión centralizada de invitados, seguimiento de RSVP, coordinación dietética/transporte
3. **Comunicación** — Invitaciones multicanal (Email + WhatsApp) con recordatorios automáticos y narración en tiempo real del día del evento

**Propuesta de valor:**
| Problema | Solución de Aura |
|---------|-----------------|
| Las invitaciones de papel cuestan 800-1.200 EUR para 120 invitados | Pago único de 29,99 EUR — 97% de ahorro en costes |
| El seguimiento de RSVP vía WhatsApp/teléfono es caótico | Panel de control en tiempo real con seguimiento de dieta/transporte |
| Los invitados carecen de actualizaciones del evento en tiempo real | Narrativa en vivo vía WhatsApp gestionada por un cómplice |
| Las parejas gestionan la logística el día de su boda | El cómplice maneja toda la comunicación con los invitados |

**Público objetivo:** Millennials (28-40) y Gen Z (22-28) planificando bodas en España, conocedores de la tecnología, enfocados en móviles, nativos de WhatsApp.

**Eslogan:** *"Diseña la narrativa de tu evento, gestiona la logística sin esfuerzo."*

### **1.2. Características y funcionalidades principales:**

#### A. Host Management Panel (Angular 22 SPA)
- **Template Editor:** Personalización visual de 3 plantillas de boda preestablecidas — colores, tipografía, imágenes principales con vista previa en tiempo real y autoguardado
- **Guest Manager:** Entrada manual + importación CSV con validación, categorización (familia/amigos/colegas), búsqueda/filtro/paginación, modo gratuito limitado a 5 invitados
- **Control Dashboard:** Estadísticas de RSVP en tiempo real (confirmados/rechazados/pendientes), lista de restricciones dietéticas, recuento de necesidades de transporte, seguimiento de acompañantes, exportación CSV

#### B. Guest Microsite (JAMstack Static Site)
- Página de invitación ultrarrápida orientada a móviles y servida a través de CDN (< 2s de carga en 3G)
- Mapa del lugar integrado con Google Maps con enlaces de indicaciones (Google Maps / Waze)
- Formulario inteligente de RSVP: asistencia (sí/no/tal vez), restricciones dietéticas, necesidades de transporte, acompañante, mensaje personal — no se requiere cuenta
- Botones de añadir al calendario (Google Calendar, Apple Calendar)

#### C. Communication System
- **Multichannel Invitations:** Email (Gmail SMTP) + WhatsApp (Meta Cloud API) con plantillas personalizadas y seguimiento de entrega
- **Automated Reminders:** Programación configurable para los que no responden, mismo canal que la invitación original, opción de activación manual
- **Post-Event Thank You Cards:** Tarjetas digitales automatizadas enviadas 1 día después del evento con enlaces opcionales a galerías de fotos externas

#### D. Live Guest Journey (Killer Feature)
- **Accomplice Mode:** Acceso seguro con enlace mágico para una persona de confianza (padrino/dama de honor), sin contraseña
- **Swipe-to-Send Panel:** Botones de narrativa preconfigurados ("¡La novia está saliendo!", "¡Dijeron que SÍ!", "¡Que empiece el baile!") que requieren un gesto de deslizamiento para evitar envíos accidentales
- **WhatsApp Delivery:** Envío de mensajes en tiempo real vía WhatsApp Business API con seguimiento del estado de entrega
- **Access Control:** Permisos limitados al evento, caduca el EventDate + 1 día, revocable por el anfitrión

#### E. Registration & Onboarding
- Autenticación sin contraseña a través de enlaces mágicos por email (caducidad de 15 minutos, sesiones JWT)
- Flujo de dos pasos: Registrar cuenta → Crear evento
- Asistente de inicio guiado: selección de plantilla → datos básicos del evento → importación de invitados → panel de control
- Muro de pago para publicar: Pago único en Stripe para activar la URL pública y el sistema RSVP

### **1.3. Diseño y experiencia de usuario:**

#### User Journey — Host (Pareja)
```
Landing Page → Introducir Email → Email con enlace mágico → Clic en enlace → Configuración de perfil
→ Asistente de inicio (Plantilla → Datos del evento → Importar invitados) → Panel de control
→ Personalizar plantilla → Añadir invitados → Publicar (Pago en Stripe) → Enviar invitaciones
→ Seguir RSVPs en tiempo real → Otorgar acceso al cómplice → Disfrutar el día del evento
```

#### User Journey — Guest
```
Recibir invitación (Email/WhatsApp) → Clic en enlace de RSVP → Ver micrositio del evento
→ Completar formulario RSVP (Asistencia + Dieta + Transporte) → Enviar → Confirmación
→ Añadir al calendario → Obtener indicaciones → Recibir actualizaciones en vivo el día del evento
```

#### User Journey — Accomplice
```
Recibir enlace mágico por email → Clic en enlace → Abrir Accomplice Panel
→ Ver resumen de RSVP → Deslizar botón de mensaje → Enviar actualización en vivo vía WhatsApp
→ Monitorizar estado de entrega
```

#### Principios de diseño
- **Minimalista y elegante** — La interfaz transmite la paz sugerida por el nombre "Aura"
- **Orientado a móviles** — Micrositio de invitados optimizado para navegadores móviles, no requiere descarga de aplicación
- **Sin contraseñas** — Autenticación por enlace mágico para anfitriones y cómplices, cero fricción
- **Accesible** — Objetivo de cumplimiento WCAG 2.1 AA

> **Nota:** Se añadirán capturas de pantalla de la interfaz de usuario y tutoriales en vídeo una vez que se implemente el frontend. Los wireframes y los tokens del sistema de diseño están definidos en el PRD (ver [07-work-breakdown.md](business-documentation/prd/07-work-breakdown.md) para los flujos de trabajo de UI).

### **1.4. Instrucciones de instalación:**

#### Requisitos previos
- .NET 9 SDK
- Node.js 20+ y npm
- Docker Desktop (o Docker Engine + Docker Compose)

#### Infraestructura local (Docker Compose)

Todos los servicios de infraestructura necesarios para desarrollo local se ejecutan con un solo comando:

```bash
docker compose up -d
```

Esto levanta los siguientes servicios:

| Servicio | Puerto(s) | Descripción |
|----------|-----------|-------------|
| **PostgreSQL 16** | `5432` | Base de datos relacional. DB: `auraplanning_dev`, User: `postgres`, Pass: `postgres` |
| **DragonflyDB** | `6379` | Cola distribuida y caché (Redis-compatible) |
| **MinIO** | `9000` (API), `9001` (Console) | Object storage S3-compatible. User: `minioadmin`, Pass: `minioadmin` |

```bash
# Levantar infraestructura
docker compose up -d

# Ver logs
docker compose logs -f

# Parar infraestructura
docker compose down

# Parar y eliminar volúmenes (reset completo)
docker compose down -v
```

> **Nota:** Los puertos y credenciales están alineados con `backend/src/Aura.Api/appsettings.Development.json`. Si cambias valores en docker-compose, actualiza también ese archivo.

#### Backend (.NET 9) — Desarrollo local

```bash
# 1. Levantar infraestructura primero
docker compose up -d

# 2. Aplicar migraciones de base de datos
dotnet ef database update --project backend/src/Aura.Infrastructure --startup-project backend/src/Aura.Api

# 3. Ejecutar la API
dotnet run --project backend/src/Aura.Api
# API disponible en http://localhost:5000
# Swagger UI: http://localhost:5000/scalar/v1
```

#### Frontend (Angular 22) — Desarrollo local

```bash
cd frontend
npm install
npm start                     # Servidor de desarrollo en http://localhost:4200
```

#### Ejecutar frontend y backend simultáneamente

**Windows (PowerShell):**
```powershell
.\dev.ps1                    # Start everything
.\dev.ps1 -SkipInfra         # Skip docker compose (if already running)
.\dev.ps1 -BackendOnly       # Only backend
.\dev.ps1 -FrontendOnly      # Only frontend
```

**Linux/Mac (Bash):**
```bash
chmod +x dev.sh              # Make executable (first time only)
./dev.sh                     # Start everything
./dev.sh --skip-infra        # Skip docker compose
./dev.sh --backend-only      # Only backend
./dev.sh --frontend-only     # Only frontend
```

Ambos scripts:
- Inician infraestructura (docker compose)
- Inician backend en `http://localhost:5000`
- Inician frontend en `http://localhost:4200`
- Escriben logs en `.dev-backend.log` y `.dev-frontend.log`
- Limpian todo al presionar Ctrl+C

#### Configuración
Los valores de desarrollo están preconfigurados en `appsettings.Development.json` y alineados con `docker-compose.yml`:

| Clave | Valor local | Servicio |
|-------|-------------|----------|
| `ConnectionStrings:DefaultConnection` | `Host=localhost;Port=5432;Database=auraplanning_dev;Username=postgres;Password=postgres` | PostgreSQL |
| `Dragonfly:ConnectionString` | `localhost:6379` | DragonflyDB |
| `Minio:Endpoint` | `localhost:9000` | MinIO |
| `Minio:AccessKey` / `Minio:SecretKey` | `minioadmin` / `minioadmin` | MinIO |
| `Smtp:Host` / `Smtp:Port` | `localhost` / `1025` | Mailhog |
| `Jwt:Key` | Clave de desarrollo (no usar en producción) | — |

Para producción, estas claves se inyectan vía variables de entorno de Kubernetes Secrets.

#### Base de datos
- PostgreSQL 16 con migraciones EF Core
- Las migraciones están versionadas y son reversibles
- Ejecuta `dotnet ef database update` para aplicar (o como InitContainer en K8s)
- Datos semilla: las plantillas se inyectan en la primera ejecución

#### Ejecución de pruebas
```bash
dotnet test    # Pruebas unitarias y de integración del backend
npm test       # Pruebas unitarias del frontend
```

---

## 2. Arquitectura del Sistema

> **Documentación extendida:** Ver [`technical-documentation/architecture/`](technical-documentation/architecture/) para documentación detallada de cada subsección.

### **2.1. Diagrama de arquitectura:**

Aura Planning utiliza una arquitectura **cloud-native sobre Kubernetes** combinada con **Clean Architecture (Onion)** en el backend. Los micrositios de invitados son sitios estáticos servidos desde MinIO vía Cloudflare CDN, mientras que el panel de gestión es una SPA Angular que consume una API .NET 10 desplegada en pods K8s.

**Patrones arquitectónicos:**
- **Cloud-Native Kubernetes**: Microservicios containerizados con orquestación K8s, escalado automático (HPA), service discovery nativo, StatefulSets para PostgreSQL, Dragonfly y MinIO
- **Clean Architecture** para backend: separación en capas (Api → Core → Infrastructure) con dependencias apuntando hacia el centro

**Diagramas principales:**
- C4 Context Diagram: actores externos, cluster K8s (Ingress, API pods, workers, StatefulSets), servicios externos
- C4 Container Diagram: navegadores, Cloudflare CDN, Ingress Controller, API pods, deployments de workers, StatefulSets de PostgreSQL/Dragonfly/MinIO
- Sequence diagrams: Guest Microsite Flow (Cloudflare → MinIO), Live Guest Journey (Accomplice → Dragonfly queue → WhatsApp)

**Beneficios:** escalabilidad automática (HPA), portabilidad (Rancher Desktop local → cualquier cloud provider), resiliencia (liveness/readiness probes, auto-restart), costo optimizado (Dragonfly usa 25x menos memoria que Redis), observabilidad nativa (Prometheus + Grafana + Loki).

**Sacrificios:** complejidad operativa de K8s vs PaaS, Gmail SMTP limitado a 500 emails/día (conocido, IEmailService abstraído para swap futuro), single-cluster sin HA multi-región para MVP.

📄 [Ver documentación completa →](technical-documentation/architecture/01-architecture-diagram.md)

### **2.2. Descripción de componentes principales:**

El sistema se compone de componentes distribuidos en un cluster Kubernetes:

| Capa | Componente | Tecnología | Responsabilidad |
|------|-----------|------------|-----------------|
| **Frontend** | Host Dashboard | Angular 22, Signals | Gestión de eventos, invitados, plantillas, RSVPs |
| **Frontend** | Guest Microsite | Static HTML/JS/CSS | Invitación estática, formulario RSVP, mapas |
| **Frontend** | Accomplice Panel | Angular 22, Touch Gestures | Enviar mensajes en vivo vía WhatsApp deslizando |
| **API Tier** | API Server (2+ pods) | .NET 10, Minimal APIs | REST endpoints, auth, lógica de negocio, webhooks |
| **Workers** | Email Dispatcher | .NET 10 Worker, Gmail SMTP | Envío asíncrono de emails desde cola Dragonfly |
| **Workers** | WhatsApp Dispatcher | .NET 10 Worker, Meta API | Envío asíncrono de mensajes con lógica de reintento |
| **Workers** | Static Site Generator | .NET 10 Worker, Razor + MinIO SDK | Genera y sube micrositios a MinIO |
| **CronJobs** | Data Retention | .NET 10 CronJob | Eliminación física de datos 30 días post-evento |
| **CronJobs** | Reminder Scheduler | .NET 10 CronJob | Recordatorios RSVP a no-responders |
| **Data** | PostgreSQL | StatefulSet, PVC | Base de datos relacional principal |
| **Data** | Dragonfly | StatefulSet, Redis-compatible | Cola distribuida, rate limiting, caché |
| **Data** | MinIO | StatefulSet, S3-compatible | Object storage para micrositios y backups |

> **⚠️ Limitación conocida:** Gmail SMTP gratuito tiene límite de 500 emails/día sin webhooks de rebote. `IEmailService` está abstraído para swap futuro a Mailgun/Brevo.

📄 [Ver documentación completa →](technical-documentation/architecture/02-components.md)

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

El proyecto combina **Clean Architecture (Onion)** en .NET con **Kustomize** para gestión de Kubernetes:

```
backend/
├── src/
│   ├── Aura.Api/              # Capa de presentación (Controllers, Middleware, Health)
│   ├── Aura.Core/             # Dominio + Aplicación (Models, Interfaces, Services)
│   └── Aura.Infrastructure/   # Infraestructura (Data, Repositories, Queue, Workers)
├── workers/                   # Proyectos de workers (Dockerfiles separados)
│   ├── Aura.Workers.Email/
│   ├── Aura.Workers.WhatsApp/
│   └── Aura.Workers.SSG/
└── tests/

frontend/
└── src/app/
    ├── core/                  # Singleton services, guards, interceptors
    ├── features/              # Feature modules de carga perezosa
    └── shared/                # Componentes de UI reutilizables

k8s/                           # Manifiestos de Kubernetes (Kustomize)
├── base/                      # Manifiestos canónicos
│   ├── api/                   # Deployment, Service, HPA, Ingress
│   ├── workers/               # Deployments de Workers
│   ├── cronjobs/              # CronJobs de retención de datos + recordatorios
│   ├── database/              # PostgreSQL StatefulSet
│   ├── dragonfly/             # DragonflyDB StatefulSet
│   ├── minio/                 # MinIO StatefulSet
│   └── frontend/              # Angular + nginx Deployment
└── overlays/
    ├── local/                 # Rancher Desktop (1 réplica, bajos recursos)
    └── production/            # Producción (2+ réplicas, recursos completos)
```

**Convenciones:** Backend usa namespaces con ámbito de archivo, constructores primarios, records para DTOs. Frontend usa componentes standalone, signals, formularios tipados. K8s usa Kustomize overlays, etiquetas `app.kubernetes.io/*`.

📄 [Ver documentación completa →](technical-documentation/architecture/03-project-structure.md)

### **2.4. Infraestructura y despliegue**

**Infraestructura:**
- **Cluster:** Kubernetes (Rancher Desktop local, por determinar para producción: GKE/EKS/DOKS)
- **Database:** PostgreSQL 16 (StatefulSet + PVC, backups pg_dump a MinIO)
- **Queue/Cache:** DragonflyDB (Redis-compatible, 25x más rápido, menor memoria)
- **Object Storage:** MinIO (S3-compatible) para micrositios estáticos y backups
- **CDN:** Cloudflare con origen en MinIO
- **Email:** Gmail SMTP (500 emails/día, IEmailService abstraído)
- **Container Registry:** GitHub Container Registry (GHCR) — capa gratuita 500MB

**CI/CD Pipeline:** GitHub Actions tradicional: Compilación .NET/Angular → Pruebas → Compilación de imágenes Docker → Subir a GHCR → `kubectl apply -k k8s/overlays/production`

**Kustomize:** Manifiestos base canónicos + overlays por entorno (local: 1 réplica, recursos reducidos; production: 2+ réplicas, recursos completos)

**Ingress:** nginx/traefik con cert-manager (Let's Encrypt) para TLS automático

**Observabilidad:** Serilog → stdout → Loki, Prometheus (métricas), Grafana (dashboards), OpenTelemetry → Tempo (trazas), Sentry (errores)

**Escalabilidad post-MVP:** HPA automático (1-5 pods de API), PostgreSQL read replicas, Dragonfly en modo cluster, MinIO en modo distribuido, multi-cluster regional.

📄 [Ver documentación completa →](technical-documentation/architecture/04-infrastructure-deployment.md)

### **2.5. Seguridad**

**Autenticación:** Passwordless con magic links (caducidad de 15 minutos) + sesiones JWT (24h) en cookies httpOnly. Sin contraseñas almacenadas.

**Autorización:** Basada en políticas en .NET con 5 políticas: `EventOwner`, `AccompliceScoped`, `PublishedEvent`, `DraftGuestLimit`, `ActiveAccomplice`.

**Rate Limiting:** Distribuido vía Dragonfly (3 enlaces mágicos/email/hora, 100 req/IP/minuto, 5 RSVP/token/hora, 20 live messages/cómplice/hora).

**Seguridad K8s:**
- **Secrets:** K8s Secrets + Sealed Secrets/SOPS para encriptación segura en Git
- **NetworkPolicies:** PostgreSQL solo accesible desde API/workers, Dragonfly restringido, MinIO aislado
- **PodSecurity:** `runAsNonRoot`, `readOnlyRootFilesystem`, descartar TODAS las capabilities
- **RBAC:** ServiceAccounts con permisos mínimos por componente
- **Escaneo de imágenes:** Trivy en pipeline CI/CD

**PII:** Encriptación a nivel de aplicación AES-256 para emails, teléfonos, restricciones dietéticas. Eliminación automática 30 días post-evento (GDPR CronJob).

**GDPR:** Derecho de acceso/rectificación/borrado/portabilidad implementados. Seguimiento de consentimiento con versión de términos. Minimización de datos.

**Seguridad de infraestructura:** Lista blanca de CORS, cookie double-submit para CSRF, FluentValidation, consultas parametrizadas EF Core, TLS 1.3 (cert-manager), cabeceras HSTS, CSP.

📄 [Ver documentación completa →](technical-documentation/architecture/05-security.md)

### **2.6. Tests**

**Estrategia:** Testing Pyramid con ~80% unit tests, ~15% integration tests (Testcontainers), ~5% e2e tests.

| Nivel | Herramientas | Cobertura Objetivo |
|-------|-------------|-------------------|
| **Unit Tests** | xUnit, NSubstitute, AwesomeAssertions (backend); Jasmine/Karma (frontend) | Core > 80%, Frontend > 70% |
| **Integration Tests** | xUnit, WebApplicationFactory, Testcontainers (PostgreSQL + Dragonfly) | Infrastructure > 60%, Api > 50% |
| **E2E Tests** | Playwright | Rutas críticas 100% |

**Testcontainers:** PostgreSQL real y Dragonfly real en Docker para pruebas de integración — repositorios, operaciones de cola y endpoints de API con infraestructura real. Servicios externos (Gmail, WhatsApp, Stripe) simulados con NSubstitute.

**Rutas Críticas (100% de cobertura):** Verificación de enlace mágico, envío de RSVP, procesamiento de pago, trabajos de retención de datos, envío de WhatsApp con reintento, encolar/desencolar en cola (Dragonfly).

📄 [Ver documentación completa →](technical-documentation/architecture/06-testing.md)

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

[Diagrama del modelo de datos](technical-documentation/data-model/README.md)


### **3.2. Descripción de entidades principales:**

- **Users**: Cuentas de hosts — los usuarios principales que crean y gestionan eventos.
- **Events**: Detalles de boda/evento — la entidad central a la que se relacionan todos los demás datos.
- **Guests**: Asistentes al evento — importados vía CSV o añadidos manualmente por el host.

---

## 4. Especificación de la API

La especificación completa de la API se encuentra en [openapi.json](technical-documentation/architecture/openapi.json).

### Lista de endpoints:
- `POST /api/auth/magic-link`
- `GET /api/auth/verify`
- `POST /api/events`
- `GET /api/events/{slug}`
- `POST /api/events/{slug}/guests/import`
- `POST /api/events/{slug}/publish`
- `GET /api/events/{slug}/message-templates`
- `PUT /api/events/{slug}/message-templates/{id}`
- `GET /api/events/{slug}/live-messages`
- `GET /api/rsvp/{token}`
- `POST /api/rsvp/{token}`
- `POST /api/accomplices/{eventSlug}/grant`
- `GET /api/accomplices/{eventSlug}`
- `POST /api/accomplices/{eventSlug}/revoke`
- `POST /api/accomplices/{eventSlug}/resend`
- `GET /api/accomplices/verify`
- `POST /api/live/{accompliceToken}/send`

---

## 5. Historias de Usuario

> Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

**Historia de Usuario 1**

**Historia de Usuario 2**

**Historia de Usuario 3**

---

## 6. Tickets de Trabajo

La lista completa de ticket generados están en la carpeta [tickets](tickets). Estos tickets se creatan en el proyecto de github al inicio del mismo. I se borrarán del repositorio. Esto se ha hecho así para simplificar el trabajo con la IA mientras se definia el trabajo.

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

### feat(agents): add AI agent system for Aura Planning [PSRP-1]
- **URL:** https://github.com/pedrosrp/AI4Devs-finalproject/pull/2
- **Ticket:** #1 - AI Agent System for Aura Planning
- **Date:** 2026-06-06
- **Resumen:** Implementar sistema de IA multi-agente usando opencode con 6 agentes especializados (po-assistant, tech-design, project-scaffolder, feature-dev, doc-writer, doc-reviewer)
- **Archivos modificados:** 11 archivos, 1895 inserciones

**Pull Request 2**

**Pull Request 3**
