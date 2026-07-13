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

Elvis Manuel Marques Pita

### **0.2. Nombre del proyecto:**

SupportHub

### **0.3. Descripción breve del proyecto:**

SupportHub es un **portal web de soporte al cliente** diseñado para consultoras de software que gestionan incidencias y peticiones de sus clientes a través de Jira internamente, pero carecen de un canal estructurado y transparente hacia el cliente final.

SupportHub actúa como **capa de experiencia de cliente sobre Jira**: el equipo técnico sigue trabajando en Jira como siempre, mientras que el cliente dispone de un portal propio donde crear tickets, hacer seguimiento en tiempo real y comunicarse con el equipo, eliminando por completo la dependencia del email y el WhatsApp como canal de soporte.

### **0.4. URL del proyecto:**

> https://supporthub.initiumsoft.es

### 0.5. URL o archivo comprimido del repositorio

https://github.com/emarques-7/support-hub

---

## 1. Descripción general del producto

> Documento de producto completo: [documentation/ProyectoFinal_ProductDoc.md](documentation/ProyectoFinal_ProductDoc.md)

### **1.1. Objetivo:**

SupportHub resuelve un problema frecuente en consultoras de software: el equipo técnico gestiona las incidencias de sus clientes en Jira, pero el cliente final no tiene visibilidad ni canal estructurado de comunicación, lo que obliga a intercambiar emails y mensajes de WhatsApp para cualquier consulta de estado.

El producto ofrece un **portal web de soporte** donde el cliente puede crear tickets, consultarlos, añadir comentarios y recibir notificaciones automáticas ante cualquier cambio — todo sincronizado en tiempo real con Jira. El equipo técnico no cambia su flujo de trabajo: Jira sigue siendo la fuente de verdad.

**¿Para quién?** Consultoras de software con clientes que tienen soporte técnico contratado y gestionan su trabajo internamente en Jira.

**Propuesta de valor única:** *"Tu equipo en Jira. Tu cliente en SupportHub."*

### **1.2. Características y funcionalidades principales:**

| Módulo | Funcionalidades |
|---|---|
| **Portal del Cliente** | Registro por invitación · Creación de tickets con editor WYSIWYG · Adjuntos (S3) · Listado paginado y filtrable · Detalle con hilo de comentarios · Notificaciones por email |
| **Panel Administrativo** | Gestión de clientes y usuarios · Envío de invitaciones · Configuración de integración Jira · Dashboard de métricas |
| **Integración con Jira** | Creación de issues en tiempo real · Lectura directa desde Jira (sin caché local) · Comentarios bidireccionales · Webhooks inbound para notificaciones |

### **1.3. Diseño y experiencia de usuario:**

> TBD — se añadirán capturas y/o videotutorial cuando el frontend esté implementado.

### **1.4. Instrucciones de instalación:**

> TBD — se documentarán cuando el código final esté disponible.

---

## 2. Arquitectura del Sistema

> Diagramas detallados en [documentation/diagrams/architecture/](documentation/diagrams/architecture/).

### **2.1. Diagrama de arquitectura:**

El sistema se compone de cuatro servicios desplegados en Docker: un servidor OIDC (`identity`), un backend principal (`api`), y dos SPAs (`client-portal` y `backoffice`). En producción se despliegan sobre EC2 detrás de un ALB, con RDS PostgreSQL en subnet privada, S3 para adjuntos y SES para email.

- [01-aws-infrastructure.md](documentation/diagrams/architecture/01-aws-infrastructure.md) — topología AWS: VPC, subnets, ALB, EC2, RDS.
- [02-request-flow.md](documentation/diagrams/architecture/02-request-flow.md) — flujo de peticiones desde el navegador hasta los servicios y sistemas externos.
- [03-auth-flow.md](documentation/diagrams/architecture/03-auth-flow.md) — flujo OIDC authorization_code + PKCE entre SPA, identity y api.
- [04-jira-integration.md](documentation/diagrams/architecture/04-jira-integration.md) — integración Jira: outbound (portal → Jira) e inbound (webhook → notificaciones).

### **2.2. Descripción de componentes principales:**

| Componente | Tecnología | Responsabilidad |
|---|---|---|
| `identity` | .NET 10 · ASP.NET Core Identity · OpenIddict | Servidor OIDC. Autenticación, emisión de tokens JWT, gestión de sesiones. |
| `api` | .NET 10 · ASP.NET Core · EF Core · Npgsql | Backend principal (Clean Architecture). Lógica de negocio, integración Jira, S3, SES. |
| `client-portal` | React 19 · TypeScript · Vite · shadcn/ui | SPA para usuarios cliente. Tickets, comentarios, notificaciones. |
| `backoffice` | React 19 · TypeScript · Vite · shadcn/ui | SPA para administradores. Gestión de usuarios, configuración Jira, métricas. |
| PostgreSQL 17 | RDS / Docker | Una instancia, dos schemas: `public` (api) e `identity`. |
| AWS S3 | AWSSDK.S3 | Almacenamiento de adjuntos. |
| AWS SES | AWSSDK.SimpleEmailServiceV2 | Email transaccional: invitaciones, notificaciones. |
| Jira Cloud | REST API v3 | Sistema de registro de tickets — fuente de verdad para todo el contenido de los tickets. |

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

El proyecto sigue una estructura multi-repositorio (4 repos). El backend `api` aplica Clean Architecture en 4 capas (`Domain` / `Application` / `Infrastructure` / `API`). El `identity` usa una estructura de 2 proyectos (servicio de infraestructura, sin lógica de dominio propia). Las SPAs siguen una organización feature-first.

> Convenciones técnicas detalladas: [ai-specs/backend-guidelines.md](ai-specs/backend-guidelines.md) · [ai-specs/api-conventions.md](ai-specs/api-conventions.md)

### **2.4. Infraestructura y despliegue**

> TBD — se documentará cuando el despliegue esté operativo.

### **2.5. Seguridad**

Principales prácticas implementadas:

- **OIDC authorization_code + PKCE** para SPAs — sin implicit flow, sin client secrets en el navegador.
- **Access token en memoria, refresh token en HttpOnly cookie** — nunca en `localStorage` (OWASP).
- **JWKS discovery** — el `api` valida JWTs sin secreto compartido con `identity`.
- **Account lockout** — 5 intentos fallidos → bloqueo de 15 minutos (ASP.NET Core Identity).
- **Revocación de sesiones** en reset de contraseña (`RevokeBySubjectAsync`).
- **HMAC-SHA256** para validar webhooks entrantes de Jira.
- **Rate limiting** en el endpoint de webhook (60 req/min por IP).
- **Ownership check** en cada acceso a ticket — el `api` verifica que el ticket pertenece al cliente del JWT.
- **Audit log automático** con Audit.NET — todos los writes EF Core y eventos de auth quedan registrados con redacción de campos sensibles.
- **Anti-enumeración** en recuperación de contraseña — respuesta siempre `200 OK` independientemente de si el email existe.
- **Sin credenciales en logs** — Serilog configurado para excluir tokens, API keys y contraseñas en cualquier nivel.


---

## 3. Modelo de Datos

> Diagramas completos en [documentation/diagrams/database/](documentation/diagrams/database/).
>
> - [cross-schema-overview.mmd](documentation/diagrams/database/cross-schema-overview.mmd) — visión general de ambos schemas y relaciones cross-schema.
> - [public-schema.mmd](documentation/diagrams/database/public-schema.mmd) — schema `public` (servicio `api`): Clients, ClientUsers, Projects, Tickets, Notifications, NotificationReadReceipts, AuditLogs.
> - [identity-schema.mmd](documentation/diagrams/database/identity-schema.mmd) — schema `identity`: ApplicationUser, tablas de ASP.NET Identity, tablas de OpenIddict, AuditLogs.

### **3.1. Diagrama del modelo de datos:**

Una instancia PostgreSQL 17 con dos schemas independientes:

- **`identity`:** gestiona usuarios, credenciales, roles, tokens de sesión (OpenIddict) y log de eventos de autenticación.
- **`public`:** gestiona el dominio de negocio — clientes, usuarios del portal, proyectos, tickets (registro ancla mínimo — el contenido vive en Jira), notificaciones y audit log de operaciones.

Las relaciones cross-schema son **soft FKs** (UUID sin constraint de BD) para mantener el desacoplamiento entre servicios.

### **3.2. Descripción de entidades principales:**

| Entidad | Schema | Descripción |
|---|---|---|
| `ApplicationUser` | identity | Usuario del sistema (Admin o Client). Extiende `IdentityUser`. Incluye `Role` y `PreferredLanguage` como claims en el JWT. |
| `Clients` | public | Empresa cliente de la consultora. Entidad raíz del tenant. Soft-delete. |
| `ClientUsers` | public | Usuario del portal vinculado a un cliente. Ciclo de vida: PendingActivation → Active → Inactive. Soft FK a `ApplicationUser`. |
| `Projects` | public | Configuración de integración cliente ↔ Jira. Almacena `JiraProjectKey` y el hash del secreto HMAC para webhooks. |
| `Tickets` | public | Registro ancla mínimo: `JiraIssueKey` + `ProjectId`. Sin título, descripción, estado ni prioridad — todo vive en Jira. |
| `Notifications` | public | Evento generado por webhook inbound de Jira (StatusChanged, CommentAdded). Una notificación por evento. |
| `NotificationReadReceipts` | public | Estado de lectura por usuario. Ausencia de fila = no leída. |
| `AuditLogs` | public / identity | Log automático de operaciones. En `public`: INSERT/UPDATE/DELETE de EF Core. En `identity`: eventos de auth (LOGIN, LOGIN_FAILED, etc.). |

---

## 4. Especificación de la API

> Convenciones completas de la API: [ai-specs/api-conventions.md](ai-specs/api-conventions.md)

Los tres endpoints principales:

### `POST /api/tickets` — Crear ticket

Crea un nuevo ticket de soporte y el issue correspondiente en Jira en tiempo real. Acepta `multipart/form-data`.

```yaml
POST /api/tickets
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

Request:
  title: string        # requerido, max 200 chars
  description: string  # requerido, HTML (se convierte a ADF antes de enviarse a Jira), max 5000 chars
  type: string         # requerido — "Bug" | "Question" | "Feature Request"
  priority: string     # requerido — "Low" | "Medium" | "High" | "Critical"
  files[]: File[]      # opcional, max 10 archivos, max 10 MB cada uno

Responses:
  201 Created:
    { "id": "uuid", "jiraIssueKey": "ACME-42", "attachments": [{ "fileName": "...", "success": true }] }
  401 Unauthorized
  422 Unprocessable Entity:
    { "code": "VALIDATION_ERROR", "message": "...", "details": ["..."] }
  502 Bad Gateway  # Jira no disponible — el ticket no se crea
```

---

### `GET /api/tickets` — Listar tickets del cliente

Lista paginada de tickets del cliente autenticado, leída en tiempo real desde Jira. El `clientId` se extrae del JWT.

```yaml
GET /api/tickets
Authorization: Bearer {access_token}

Query Parameters:
  page: integer            # default 1
  pageSize: integer        # 10 | 20 | 50, default 20
  sortBy: string           # "created" | "resolutiondate" | "priority" | "status" | "summary"
  sortDir: string          # "asc" | "desc"
  status: string[]         # multi-value, opcional
  dateRange: string        # "today" | "yesterday" | "last7days" | "thisMonth" | "lastMonth" | "custom"
  dateFrom / dateTo: string # ISO date, solo si dateRange=custom, máximo 184 días de rango

Responses:
  200 OK:
    { "items": [...], "totalCount": 47, "page": 1, "pageSize": 20, "totalPages": 3 }
  401 Unauthorized
  422 Unprocessable Entity  # rango > 184 días o sortBy inválido
  502 Bad Gateway
```

---

### `POST /api/webhooks/jira` — Webhook inbound de Jira

Recibe eventos de Jira (cambios de estado, nuevos comentarios) y genera notificaciones para el cliente. Autenticado exclusivamente mediante firma HMAC-SHA256.

```yaml
POST /api/webhooks/jira
X-Hub-Signature: sha256={hmac_signature}
Content-Type: application/json

Request Body:
  { "webhookEvent": "jira:issue_updated", "issue": { "key": "ACME-42", ... } }

Responses:
  200 OK       # siempre (evita reintentos innecesarios de Jira)
  401          # firma HMAC inválida o ausente
  429          # rate limit superado (60 req/min por IP)
```

---

## 5. Historias de Usuario

> Backlog completo: [documentation/BacklogDoc.md](documentation/BacklogDoc.md)  
> Epics con historias y tareas detalladas: [documentation/epics/](documentation/epics/)

---

## 6. Tickets de Trabajo

> Todos los tickets técnicos con detalle completo en [documentation/epics/](documentation/epics/).

---

## 7. Pull Requests

- [Pull Request #1](https://github.com/emarques-7/support-hub/pull/1)
- [Pull Request #2](https://github.com/emarques-7/support-hub/pull/2)
- [Pull Request #3](https://github.com/emarques-7/support-hub/pull/3)
- [Pull Request #4](https://github.com/emarques-7/support-hub/pull/4)
- [Pull Request #5](https://github.com/emarques-7/support-hub/pull/5)
- [Pull Request #6](https://github.com/emarques-7/support-hub/pull/6)

