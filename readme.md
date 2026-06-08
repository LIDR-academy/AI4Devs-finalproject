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
Aura Planning is a SaaS platform that replaces paper wedding invitations with an interactive digital ecosystem. It combines customizable invitation design, centralized guest management with real-time RSVP tracking, and a **Live Guest Journey** — real-time event-day storytelling via WhatsApp managed by a trusted "accomplice" (best man/maid of honor). The business model is a one-time payment (EUR 19-29) with free draft-mode access, initially targeting the Spanish wedding market with future expansion to LATAM and other celebration types.
### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido


---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**

Aura Planning replaces paper wedding invitations with an **interactive digital ecosystem** that eliminates logistical stress and generates anticipation among guests. It delivers three core capabilities:

1. **Design** — Beautiful, customizable invitation templates requiring no design skills
2. **Logistics** — Centralized guest management, RSVP tracking, dietary/transport coordination
3. **Communication** — Multi-channel invitations (email + WhatsApp) with automated reminders and real-time event-day storytelling

**Value proposition:**
| Problem | Aura's Solution |
|---------|-----------------|
| Paper invitations cost EUR 800-1,200 for 120 guests | One-time EUR 29.99 payment — 97% cost savings |
| RSVP tracking via WhatsApp/phone is chaotic | Real-time dashboard with dietary/transport tracking |
| Guests lack real-time event updates | Live narrative via WhatsApp managed by an accomplice |
| Couples manage logistics on their wedding day | Accomplice handles all guest communication |

**Target audience:** Millennials (28-40) and Gen Z (22-28) planning weddings in Spain, tech-savvy, mobile-first, WhatsApp-native.

**Slogan:** *"Design your event's narrative, manage the logistics effortlessly."*

### **1.2. Características y funcionalidades principales:**

#### A. Host Management Panel (Angular 22 SPA)
- **Template Editor:** Visual customization of 3 preset wedding templates — colors, typography, hero images with real-time preview and auto-save
- **Guest Manager:** Manual entry + CSV import with validation, categorization (family/friends/colleagues), search/filter/pagination, free mode limited to 5 guests
- **Control Dashboard:** Real-time RSVP statistics (confirmed/declined/pending), dietary restrictions list, transportation needs count, plus-one tracking, CSV export

#### B. Guest Microsite (JAMstack Static Site)
- Ultra-fast mobile-first invitation page served via CDN (< 2s load on 3G)
- Embedded Google Maps venue with directions links (Google Maps / Waze)
- Smart RSVP form: attendance (yes/no/maybe), dietary restrictions, transport needs, plus-one, personal message — no account required
- Add-to-calendar buttons (Google Calendar, Apple Calendar)

#### C. Communication System
- **Multichannel Invitations:** Email (Gmail SMTP) + WhatsApp (Meta Cloud API) with personalized templates and delivery tracking
- **Automated Reminders:** Configurable schedule for non-responders, same channel as original invitation, manual trigger option
- **Post-Event Thank You Cards:** Automated digital cards sent 1 day after event with optional external photo gallery links

#### D. Live Guest Journey (Killer Feature)
- **Accomplice Mode:** Secure magic-link access for a trusted person (best man/maid of honor), no password required
- **Swipe-to-Send Panel:** Pre-configured narrative buttons ("The bride is leaving!", "They said YES!", "Let the dancing begin!") requiring swipe gesture to prevent accidental sends
- **WhatsApp Delivery:** Real-time message dispatch via WhatsApp Business API with delivery status tracking
- **Access Control:** Permissions scoped to event, expires EventDate + 1 day, revocable by host

#### E. Registration & Onboarding
- Passwordless authentication via email magic links (15-min expiry, JWT sessions)
- Two-step flow: Register account → Create event
- Guided onboarding wizard: template selection → event basics → guest import → dashboard
- Publishing paywall: Stripe one-time payment to activate public URL and RSVP system

### **1.3. Diseño y experiencia de usuario:**

#### User Journey — Host (Couple)
```
Landing Page → Enter Email → Magic Link Email → Click Link → Profile Setup
→ Onboarding Wizard (Template → Event Basics → Guest Import) → Dashboard
→ Customize Template → Add Guests → Publish (Stripe Payment) → Send Invitations
→ Track RSVPs in Real-Time → Grant Accomplice Access → Enjoy Event Day
```

#### User Journey — Guest
```
Receive Invitation (Email/WhatsApp) → Click RSVP Link → View Event Microsite
→ Fill RSVP Form (Attendance + Dietary + Transport) → Submit → Confirmation
→ Add to Calendar → Get Directions → Receive Live Updates on Event Day
```

#### User Journey — Accomplice
```
Receive Magic Link via Email → Click Link → Open Accomplice Panel
→ View RSVP Summary → Swipe Message Button → Send Live Update via WhatsApp
→ Monitor Delivery Status
```

#### Design Principles
- **Minimalist & elegant** — Interface conveys the peace suggested by the name "Aura"
- **Mobile-first** — Guest microsite optimized for mobile browsers, no app download required
- **Passwordless** — Magic link authentication for hosts and accomplices, zero friction
- **Accessible** — WCAG 2.1 AA compliance target

> **Note:** UI screenshots and video tutorials will be added once the frontend is implemented. Wireframes and design system tokens are defined in the PRD (see [07-work-breakdown.md](business-documentation/prd/07-work-breakdown.md) for UI workstreams).

### **1.4. Instrucciones de instalación:**

> **Status:** Project scaffolding is in progress. The following describes the planned setup.

#### Prerequisites
- .NET 10 SDK
- Node.js 20+ and npm
- Rancher Desktop (with k3s + containerd runtime) — primary local development environment

#### Local Development (Rancher Desktop + Kubernetes)
```bash
# 1. Ensure Rancher Desktop is running with k3s
kubectl cluster-info
kubectl create namespace aura

# 2. Build local images
nerdctl build -t ghcr.io/pedrosrp/aura-api:local -f backend/src/Aura.Api/Dockerfile backend/
nerdctl build -t ghcr.io/pedrosrp/aura-frontend:local -f frontend/Dockerfile frontend/

# 3. Deploy to local cluster
kubectl apply -k k8s/overlays/local

# 4. Access API
kubectl port-forward svc/aura-api 5001:80 -n aura
```

#### Frontend (Angular 22) — Native Dev Mode
```bash
cd frontend
npm install
ng serve                     # Starts dev server on http://localhost:4200
```

#### Configuration
Copy `appsettings.json` and configure the following keys:
| Key | Purpose |
|-----|---------|
| `ConnectionStrings:DefaultConnection` | PostgreSQL connection string |
| `Jwt:Key` | 256-bit key for JWT signing |
| `MagicLink:BaseUrl` | Base URL for magic link emails |
| `WhatsApp:ApiKey` | Meta Cloud API key |
| `Smtp:Host` / `Smtp:Port` | Gmail SMTP credentials |
| `Smtp:Username` / `Smtp:Password` | Gmail app password |
| `Stripe:SecretKey` | Stripe API key |
| `GoogleMaps:ApiKey` | Google Maps API key |
| `Minio:Endpoint` / `Minio:AccessKey` | MinIO object storage credentials |
| `Dragonfly:ConnectionString` | DragonflyDB connection string |

#### Database
- PostgreSQL 16 with EF Core migrations
- Migrations are versioned and reversible
- Run `dotnet ef database update` to apply (or as K8s InitContainer)
- Seed data: templates are seeded on first run
- Local: PostgreSQL runs as a StatefulSet in Rancher Desktop k3s cluster

#### Running Tests
```bash
dotnet test    # Backend unit + integration tests (requires container runtime for Testcontainers)
npm test       # Frontend unit tests
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
- C4 Container Diagram: browsers, Cloudflare CDN, Ingress Controller, API pods, worker deployments, PostgreSQL/Dragonfly/MinIO StatefulSets
- Sequence diagrams: Guest Microsite Flow (Cloudflare → MinIO), Live Guest Journey (Accomplice → Dragonfly queue → WhatsApp)

**Beneficios:** escalabilidad automática (HPA), portabilidad (Rancher Desktop local → cualquier cloud provider), resiliencia (liveness/readiness probes, auto-restart), costo optimizado (Dragonfly usa 25x menos memoria que Redis), observabilidad nativa (Prometheus + Grafana + Loki).

**Sacrificios:** complejidad operativa de K8s vs PaaS, Gmail SMTP limitado a 500 emails/día (conocido, IEmailService abstraído para swap futuro), single-cluster sin HA multi-región para MVP.

📄 [Ver documentación completa →](technical-documentation/architecture/01-architecture-diagram.md)

### **2.2. Descripción de componentes principales:**

El sistema se compone de componentes distribuidos en un cluster Kubernetes:

| Capa | Componente | Tecnología | Responsabilidad |
|------|-----------|------------|-----------------|
| **Frontend** | Host Dashboard | Angular 22, Signals | Gestión de eventos, invitados, plantillas, RSVPs |
| **Frontend** | Guest Microsite | Static HTML/JS/CSS | Invitación estática, formulario RSVP, maps |
| **Frontend** | Accomplice Panel | Angular 22, Touch Gestures | Swipe-to-send live messages via WhatsApp |
| **API Tier** | API Server (2+ pods) | .NET 10, Minimal APIs | REST endpoints, auth, business logic, webhooks |
| **Workers** | Email Dispatcher | .NET 10 Worker, Gmail SMTP | Envío asíncrono de emails desde cola Dragonfly |
| **Workers** | WhatsApp Dispatcher | .NET 10 Worker, Meta API | Envío asíncrono de mensajes con retry logic |
| **Workers** | Static Site Generator | .NET 10 Worker, Razor + MinIO SDK | Genera y sube micrositios a MinIO |
| **CronJobs** | Data Retention | .NET 10 CronJob | Eliminación hard de datos 30 días post-evento |
| **CronJobs** | Reminder Scheduler | .NET 10 CronJob | Recordatorios RSVP a no-responders |
| **Data** | PostgreSQL | StatefulSet, PVC | Base de datos relacional principal |
| **Data** | Dragonfly | StatefulSet, Redis-compatible | Cola distribuida, rate limiting, caché |
| **Data** | MinIO | StatefulSet, S3-compatible | Object storage para micrositios y backups |

> **⚠️ Known Limitation:** Gmail SMTP gratuito tiene límite de 500 emails/día sin bounce webhooks. `IEmailService` está abstraído para swap futuro a Mailgun/Brevo.

📄 [Ver documentación completa →](technical-documentation/architecture/02-components.md)

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

El proyecto combina **Clean Architecture (Onion)** en .NET con **Kustomize** para gestión de Kubernetes:

```
backend/
├── src/
│   ├── Aura.Api/              # Presentation Layer (Controllers, Middleware, Health)
│   ├── Aura.Core/             # Domain + Application (Models, Interfaces, Services)
│   └── Aura.Infrastructure/   # Infrastructure (Data, Repositories, Queue, Workers)
├── workers/                   # Worker projects (separate Dockerfiles)
│   ├── Aura.Workers.Email/
│   ├── Aura.Workers.WhatsApp/
│   └── Aura.Workers.SSG/
└── tests/

frontend/
└── src/app/
    ├── core/                  # Singleton services, guards, interceptors
    ├── features/              # Lazy-loaded feature modules
    └── shared/                # Reusable UI components

k8s/                           # Kubernetes manifests (Kustomize)
├── base/                      # Canonical manifests
│   ├── api/                   # Deployment, Service, HPA, Ingress
│   ├── workers/               # Worker Deployments
│   ├── cronjobs/              # Data Retention + Reminder CronJobs
│   ├── database/              # PostgreSQL StatefulSet
│   ├── dragonfly/             # DragonflyDB StatefulSet
│   ├── minio/                 # MinIO StatefulSet
│   └── frontend/              # Angular + nginx Deployment
└── overlays/
    ├── local/                 # Rancher Desktop (1 replica, low resources)
    └── production/            # Production (2+ replicas, full resources)
```

**Convenciones:** Backend usa file-scoped namespaces, primary constructors, records para DTOs. Frontend usa standalone components, signals, typed forms. K8s usa Kustomize overlays, labels `app.kubernetes.io/*`.

📄 [Ver documentación completa →](technical-documentation/architecture/03-project-structure.md)

### **2.4. Infraestructura y despliegue**

**Infraestructura:**
- **Cluster:** Kubernetes (Rancher Desktop local, TBD para producción: GKE/EKS/DOKS)
- **Database:** PostgreSQL 16 (StatefulSet + PVC, backups pg_dump a MinIO)
- **Queue/Cache:** DragonflyDB (Redis-compatible, 25x más rápido, menor memoria)
- **Object Storage:** MinIO (S3-compatible) para micrositios estáticos y backups
- **CDN:** Cloudflare con origin en MinIO
- **Email:** Gmail SMTP (500 emails/día, IEmailService abstraído)
- **Container Registry:** GitHub Container Registry (GHCR) — free tier 500MB

**CI/CD Pipeline:** GitHub Actions tradicional: Build .NET/Angular → Test → Build Docker images → Push to GHCR → `kubectl apply -k k8s/overlays/production`

**Kustomize:** Base manifests canónicos + overlays por entorno (local: 1 replica, recursos reducidos; production: 2+ replicas, recursos completos)

**Ingress:** nginx/traefik con cert-manager (Let's Encrypt) para TLS automático

**Observabilidad:** Serilog → stdout → Loki, Prometheus (metrics), Grafana (dashboards), OpenTelemetry → Tempo (tracing), Sentry (errors)

**Escalabilidad post-MVP:** HPA automático (1-5 pods API), PostgreSQL read replicas, Dragonfly cluster mode, MinIO distributed mode, multi-cluster regional.

📄 [Ver documentación completa →](technical-documentation/architecture/04-infrastructure-deployment.md)

### **2.5. Seguridad**

**Autenticación:** Passwordless con magic links (15-min expiry) + JWT sessions (24h) en httpOnly cookies. Sin contraseñas almacenadas.

**Autorización:** Policy-based en .NET con 5 políticas: `EventOwner`, `AccompliceScoped`, `PublishedEvent`, `DraftGuestLimit`, `ActiveAccomplice`.

**Rate Limiting:** Distribuido via Dragonfly (3 magic links/email/hora, 100 req/IP/minuto, 5 RSVP/token/hora, 20 live messages/accomplice/hora).

**K8s Security:**
- **Secrets:** K8s Secrets + Sealed Secrets/SOPS para Git-safe encryption
- **NetworkPolicies:** PostgreSQL solo accesible desde API/workers, Dragonfly restringido, MinIO aislado
- **PodSecurity:** `runAsNonRoot`, `readOnlyRootFilesystem`, drop ALL capabilities
- **RBAC:** ServiceAccounts con permisos mínimos por componente
- **Image Scanning:** Trivy en CI/CD pipeline

**PII:** Encriptación application-level AES-256 para emails, teléfonos, dietary restrictions. Eliminación automática 30 días post-evento (GDPR CronJob).

**GDPR:** Right to access/rectify/erase/portability implementados. Consent tracking con versión de términos. Data minimization.

**Infrastructure Security:** CORS whitelist, CSRF double-submit cookie, FluentValidation, EF Core parameterized queries, TLS 1.3 (cert-manager), HSTS, CSP headers.

📄 [Ver documentación completa →](technical-documentation/architecture/05-security.md)

### **2.6. Tests**

**Estrategia:** Testing Pyramid con ~80% unit tests, ~15% integration tests (Testcontainers), ~5% e2e tests.

| Nivel | Herramientas | Cobertura Objetivo |
|-------|-------------|-------------------|
| **Unit Tests** | xUnit, NSubstitute, AwesomeAssertions (backend); Jasmine/Karma (frontend) | Core > 80%, Frontend > 70% |
| **Integration Tests** | xUnit, WebApplicationFactory, Testcontainers (PostgreSQL + Dragonfly) | Infrastructure > 60%, Api > 50% |
| **E2E Tests** | Playwright | Critical paths 100% |

**Testcontainers:** PostgreSQL real y Dragonfly real en Docker para tests de integración — repositorios, queue operations, y API endpoints con infraestructura real. Servicios externos (Gmail, WhatsApp, Stripe) mockeados con NSubstitute.

**Critical Paths (100% coverage):** Magic link verification, RSVP submission, payment processing, data retention jobs, WhatsApp dispatch with retry, queue enqueue/dequeue (Dragonfly).

📄 [Ver documentación completa →](technical-documentation/architecture/06-testing.md)

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

> Recomendamos usar mermaid para el modelo de datos, y utilizar todos los parámetros que permite la sintaxis para dar el máximo detalle, por ejemplo las claves primarias y foráneas.


### **3.2. Descripción de entidades principales:**

> Recuerda incluir el máximo detalle de cada entidad, como el nombre y tipo de cada atributo, descripción breve si procede, claves primarias y foráneas, relaciones y tipo de relación, restricciones (unique, not null…), etc.

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

---

## 5. Historias de Usuario

> Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

**Historia de Usuario 1**

**Historia de Usuario 2**

**Historia de Usuario 3**

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto. 

**Ticket 1**

**Ticket 2**

**Ticket 3**

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

### feat(agents): add AI agent system for Aura Planning [PSRP-1]
- **URL:** https://github.com/pedrosrp/AI4Devs-finalproject/pull/2
- **Ticket:** #1 - AI Agent System for Aura Planning
- **Date:** 2026-06-06
- **Summary:** Implement multi-agent AI system using opencode with 6 specialized agents (po-assistant, tech-design, project-scaffolder, feature-dev, doc-writer, doc-reviewer)
- **Files Changed:** 11 files, 1895 insertions

**Pull Request 2**

**Pull Request 3**

