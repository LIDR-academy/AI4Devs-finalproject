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

Gerard Rico Botella

### **0.2. Nombre del proyecto:**

Tandem

### **0.3. Descripción breve del proyecto:**

Tandem es una plataforma para centralizar la planificación, ejecución y seguimiento del desarrollo de software, pensada para equipos que combinan Product Owners, Developers, Team Leads/Tech Leads y Reviewers. Su objetivo es acompañar el ciclo completo de un entregable —desde la definición de requisitos funcionales, pasando por la revisión funcional del Tech Lead y el análisis técnico de los developers, hasta la ejecución y seguimiento de los work items resultantes en un board Kanban— eliminando la fragmentación de información entre documentos, chats y hojas de cálculo dispersas.

### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

https://github.com/gricob/tandem

---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**

Hoy en muchos equipos existe una separación entre la definición del producto y la ejecución técnica: el Product Owner define prioridades y requisitos mientras los developers ejecutan en herramientas distintas, lo que provoca pérdida de contexto, dificultad para seguir el estado real del trabajo, falta de trazabilidad entre una idea y su entrega, y desalineación entre lo esperado y el progreso real.

Tandem resuelve esto ofreciendo un único espacio donde Product Owners y Developers pueden definir workstreams, entregables y tareas, mantener el contexto funcional y técnico junto a la ejecución, y hacer seguimiento del progreso con total transparencia. Va dirigido a:

- **Product Owners**, que necesitan convertir ideas en entregables claros, priorizar el trabajo y supervisar el avance sin perder contexto.
- **Developers**, que necesitan entender qué deben hacer, por qué, con qué prioridad y qué dependencias existen, así como actualizar el estado de sus tareas de forma ágil.
- **Team Leads / Engineering Managers**, que necesitan visibilidad del progreso del equipo, riesgos y bloqueos.
- **Administrators**, que necesitan gestionar usuarios, roles y los elementos de configuración base de la plataforma.

El valor diferencial de Tandem es que un entregable no entra en desarrollo hasta que su alcance funcional está validado por el Tech Lead y su viabilidad técnica ha sido documentada y aprobada por los reviewers asignados, garantizando así trazabilidad completa y reduciendo el retrabajo por requisitos mal definidos.

### **1.2. Características y funcionalidades principales:**

- **Gestión de usuarios y roles**: altas, roles combinables (`admin`, `product_owner`, `developer`, `team_lead`) y permisos derivados de esos roles.
- **Workstreams**: contenedores de alto nivel para agrupar trabajo relacionado (épicas, agrupaciones de tareas o de bugs), que pueden contener entregables, work items directos, o ambos.
- **Entregables (Deliverables)** con un flujo de validación en dos pasos antes de pasar a desarrollo:
  1. Definición de requisitos funcionales mediante tipos de requisito y formularios configurables.
  2. Revisión funcional del Tech Lead (aprobación como "Listo para desarrollo" o bloqueo con comentarios).
  3. Análisis técnico elaborado por los developers asignados, con creación de work items en borrador como *implementation steps*.
  4. Revisión del análisis técnico por los reviewers asignados (aprobación o solicitud de cambios), tras la cual los work items en borrador se publican automáticamente.
- **Tipos de requisito y de work item configurables**, cada uno asociado a un formulario con campos dinámicos (texto, número, booleano, selección simple/múltiple, fecha, referencia a usuario).
- **Board Kanban** de work items con estados predefinidos (`draft`, `to_do`, `in_progress`, `blocked`, `done`) y arrastrar y soltar entre columnas.
- **Vista de roadmap** con los entregables como hitos, usando sus fechas de inicio y objetivo.
- **Comentarios, historial y adjuntos** en entregables, requisitos, análisis técnico y work items.
- **Bloqueos (Blockers)** para registrar impedimentos y riesgos, que fuerzan el estado `blocked` del elemento asociado.
- **Notificaciones** ante cambios de estado, asignaciones o comentarios relevantes.
- **Búsqueda** de workstreams, entregables y work items por texto o referencia, y filtrado por responsable, prioridad, tipo o contenedor.

### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

### **1.4. Instrucciones de instalación:**
> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

Tandem sigue una arquitectura **cliente-servidor** clásica: un backend que expone una API REST con toda la lógica de negocio del dominio, y un frontend de escritorio nativo para macOS que la consume. Dentro del backend, el núcleo del dominio (entidades con máquina de estados: Deliverable, Requirement/WorkItemRequirement, TechnicalAnalysis, WorkItem, Blocker) se implementa con **DDD ligero + CQRS**, mientras que el resto de módulos (Auth, Users, Workstreams, RequirementTypes, Forms, WorkItemTypes, Comments, Attachments, Notifications, Search) siguen un patrón de **capas simples** (Controller → Service → ORM).

```mermaid
flowchart TB
    subgraph Cliente
        FE["Frontend macOS<br/>SwiftUI + MVVM (@Observable)"]
    end

    subgraph Backend["Backend (NestJS / TypeScript)"]
        API["API REST (OpenAPI)"]
        AUTH["AuthModule<br/>JWT + Argon2"]
        CORE["Núcleo del dominio<br/>DDD ligero + CQRS<br/>(Deliverables, Requirements,<br/>TechnicalAnalyses, WorkItems, Blockers)"]
        SUPPORT["Módulos de soporte<br/>Controller → Service → Prisma<br/>(Users, Workstreams, Forms,<br/>Comments, Attachments, Notifications, Search)"]
        BUS["EventBus (@nestjs/cqrs)"]
    end

    DB[("PostgreSQL<br/>+ JSONB para form_data")]
    STORAGE[("Almacenamiento de adjuntos<br/>adapter local / S3-compatible")]

    FE -- "HTTPS + Bearer JWT<br/>cliente generado con swift-openapi-generator" --> API
    API --> AUTH
    API --> CORE
    API --> SUPPORT
    CORE -- eventos de dominio --> BUS
    BUS --> SUPPORT
    CORE --> DB
    SUPPORT --> DB
    SUPPORT --> STORAGE
```

**Justificación**: no se aplica DDD/hexagonal estricto a todo el backend porque la mayoría de entidades son esencialmente CRUD, y forzar puertos/adaptadores ahí solo añadiría indirección sin beneficio. El subconjunto de entidades con invariantes de negocio no triviales (por ejemplo, "un `Deliverable` solo pasa a `ready_for_review` con todos sus `Requirement` completados", o "solo un `reviewer_id` puede aprobar el `TechnicalAnalysis`") sí se beneficia de entidades ricas aisladas de HTTP y del ORM, con transiciones modeladas como comandos explícitos (CQRS) y eventos de dominio que desacoplan efectos secundarios como las notificaciones.

**Beneficios**: las reglas de negocio críticas quedan testeables sin infraestructura, el dominio no depende de HTTP ni de Prisma, y los módulos simples no arrastran una complejidad que no necesitan. **Sacrificios**: conviven dos estilos arquitectónicos en el mismo backend, lo que exige disciplina para decidir a qué patrón se ajusta cada módulo nuevo (regla práctica: si tiene una transición de estado con invariantes reales va al núcleo; si es CRUD, va a soporte).

### **2.2. Descripción de componentes principales:**

- **Frontend (macOS)**: aplicación nativa en **Swift 6.3** + **SwiftUI**, con interoperabilidad puntual con AppKit, arquitectura **MVVM** apoyada en el framework `Observation` (`@Observable`), concurrencia con `async/await`/actors, y un cliente de red generado automáticamente a partir del contrato OpenAPI del backend (`swift-openapi-generator`). Usa **SwiftData** como caché local y **Keychain** para el almacenamiento seguro de los tokens JWT.
- **Backend (API)**: servicio en **TypeScript** sobre **NestJS 11.x** y **Node.js 24.x**, con **PostgreSQL 18.x** como base de datos y **Prisma** como ORM/gestor de migraciones. Expone una API **REST** documentada con `@nestjs/swagger` (OpenAPI), que es el contrato usado para generar el cliente Swift del frontend.
- **Autenticación y autorización**: JWT (access + refresh token) con contraseñas cifradas con **Argon2**; los permisos se derivan directamente del array `roles` de cada `User`, sin una entidad de roles independiente.
- **Base de datos**: PostgreSQL, con `form_data` almacenado como `JSONB` para soportar los formularios dinámicos de `Requirement` y `WorkItem`. Identificadores **ULID** generados en la aplicación.
- **Almacenamiento de adjuntos**: interfaz de storage abstracta, con un adaptador local en desarrollo y compatible con S3 en producción, para no acoplarse a un proveedor concreto antes de decidir el hosting.
- **Notificaciones**: generadas de forma reactiva a partir de eventos de dominio (`DeliverableBlockedEvent`, `TechnicalAnalysisApprovedEvent`, etc.) y consultadas vía REST (pull/polling) en el MVP.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

El proyecto se organiza en dos paquetes independientes, `backend/` y `frontend/`, cada uno con su propio pipeline de CI en GitHub Actions.

**Backend** — separa el núcleo del dominio (DDD ligero + CQRS) de los módulos de soporte (capas simples), cada uno con su propia carpeta `domain/application/infrastructure/interface` cuando aplica:

```
backend/
  src/
    core/                       # DDD ligero + CQRS
      deliverables/
        domain/                # entidad Deliverable, value objects, eventos, puerto del repositorio
        application/            # command handlers, query handlers
        infrastructure/         # repositorio Prisma (adaptador), mappers
        interface/               # controller, DTOs de la API
      requirements/              # Requirement + WorkItemRequirement
      technical-analyses/
      work-items/
      blockers/
    modules/                    # capas simples, Controller -> Service -> Prisma
      auth/
      users/
      workstreams/
      requirement-types/
      forms/
      work-item-types/
      comments/
      attachments/
      notifications/
      search/
    common/                     # guards, decorators, filters, pipes
    prisma/                      # schema.prisma, migrations
  test/
  docker-compose.yml
  Dockerfile
```

**Frontend** — organizado por features siguiendo MVVM, con una capa de red generada a partir del contrato OpenAPI:

```
frontend/
  TandemApp/
    App/                  # entry point, DI, sesión
    Features/
      Workstreams/
      Deliverables/
      Requirements/
      TechnicalAnalysis/
      WorkItems/
      Board/
      Roadmap/
      Admin/
    Networking/            # cliente generado (OpenAPI) + servicios
    Models/
    Common/                 # componentes UI reutilizables, extensions
  TandemAppTests/
  TandemAppUITests/
```

En ambos casos, `.github/workflows/` contiene los pipelines de CI (`backend-ci.yml`, `frontend-ci.yml`).

### **2.4. Infraestructura y despliegue**

```mermaid
flowchart LR
    DEV["Push / PR"] --> CI["GitHub Actions"]
    CI -->|"backend-ci.yml<br/>lint + typecheck + tests<br/>(Postgres de servicio)"| BE_ART["Imagen Docker backend"]
    CI -->|"frontend-ci.yml<br/>runner macos-latest<br/>lint + build + tests"| FE_ART["Build firmado<br/>(Developer ID + notarización)"]
    BE_ART -.->|"CD pendiente de<br/>decisión de hosting"| HOST[("Hosting backend<br/>(por decidir)")]
    FE_ART -.-> DIST["Distribución directa<br/>(fuera de Mac App Store)"]
```

- **CI**: GitHub Actions en ambos paquetes. El backend ejecuta lint, chequeo de tipos, tests unitarios y e2e contra un servicio PostgreSQL levantado en el propio job, y en rama principal construye y publica la imagen Docker. El frontend usa un runner `macos-latest`, ejecuta SwiftLint y `xcodebuild test`, y en rama principal produce un build de release firmado con Developer ID y notarizado.
- **Despliegue backend**: pensado como contenedor Docker para no acoplarse a un proveedor; el hosting/infraestructura concreta (cloud gestionado vs. self-hosted) y el CD efectivo están **pendientes de decisión**, se abordarán como su propio cambio de especificación.
- **Distribución frontend**: al ser una herramienta interna de equipo, se distribuye directamente (firma con Developer ID + notarización) en lugar de vía Mac App Store, evitando las restricciones de sandboxing de la tienda.

### **2.5. Seguridad**

- **Autenticación**: JWT de acceso y de refresco (`@nestjs/jwt`); los refresh tokens son rotativos y revocables. Las contraseñas se almacenan cifradas con **Argon2** (`argon2`), adecuado frente a ataques de fuerza bruta offline.
- **Autorización basada en roles**: los permisos se derivan del array `roles` (`admin`, `product_owner`, `developer`, `team_lead`) de cada `User` mediante guards de NestJS; un usuario puede acumular varios roles. Las reglas de autorización específicas de una transición (por ejemplo, "solo un `team_lead` puede aprobar `ready_for_development`", o "solo un `reviewer_id` del `Deliverable` puede aprobar su `TechnicalAnalysis`") se validan en el `CommandHandler` correspondiente antes de invocar el dominio, manteniendo las entidades de dominio libres de dependencias de sesión.
- **Validación de entrada**: `class-validator`/`class-transformer` sobre los DTOs de la API, incluyendo la validación del contenido dinámico de `form_data` contra los `FormField` configurados para cada tipo.
- **Almacenamiento seguro en cliente**: el frontend guarda los tokens JWT en el **Keychain** de macOS en lugar de en disco o `UserDefaults`.
- **Separación de secretos e infraestructura**: el almacenamiento de adjuntos se abstrae tras una interfaz para no exponer credenciales de un proveedor concreto en el dominio de la aplicación.

### **2.6. Tests**

El proyecto se encuentra en fase de diseño/especificación (ver `docs/backend.md` §8 y `docs/frontend.md` §6 del repositorio de desarrollo), con la siguiente estrategia de testing prevista para el MVP:

- **Backend — núcleo del dominio**: tests unitarios de las entidades de dominio (las 12 reglas de negocio del modelo de datos, p. ej. transiciones de `Deliverable` o `TechnicalAnalysis`) sin infraestructura real, y tests de los `CommandHandler`/`QueryHandler` con el repositorio en memoria o mockeado.
- **Backend — módulos de soporte**: tests unitarios por servicio con **Jest**.
- **Backend — end-to-end**: tests con **Supertest** cubriendo los flujos críticos completos: revisión funcional del Tech Lead, ciclo de análisis técnico, y publicación automática de work items en borrador al aprobarse el análisis técnico.
- **Frontend**: tests unitarios de `ViewModel` con **Swift Testing**, y tests de interfaz de los flujos críticos (crear Workstream, ciclo completo de un Deliverable, mover un WorkItem en el board) con **XCTest UI Testing**.
- Ambos pipelines de CI ejecutan lint (ESLint/SwiftLint) y la suite de tests en cada push/PR sobre sus respectivas rutas.

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

```mermaid
erDiagram
    USER {
        string id PK
        string full_name
        string email UK
        string roles "array<enum>: admin, product_owner, developer, team_lead"
        datetime created_at
        datetime updated_at
    }

    WORKSTREAM {
        string id PK
        string name
        string description "nullable"
        string status "enum: planning, active, on_hold, completed, cancelled"
        datetime created_at
        datetime updated_at
    }

    DELIVERABLE {
        string id PK
        string workstream_id FK
        string title
        string description "nullable"
        string owner_ids "array<FK User>"
        string assignee_ids "array<FK User>"
        string reviewer_ids "array<FK User>"
        string status "enum: draft..cancelled"
        string priority "enum: low, medium, high, critical"
        string approved_by_lead_id FK "nullable, FK User"
        datetime approved_at "nullable"
        date start_date "nullable"
        date target_date "nullable"
        datetime created_at
        datetime updated_at
    }

    REQUIREMENT_TYPE {
        string id PK
        string name
        string description "nullable"
        string form_id FK
        datetime created_at
        datetime updated_at
    }

    FORM {
        string id PK
        string name
        string description "nullable"
        datetime created_at
        datetime updated_at
    }

    FORM_FIELD {
        string id PK
        string form_id FK
        string label
        string field_type "enum: text, textarea, number, boolean, select, multi_select, date, user_reference"
        boolean is_required
        json options "nullable, para select/multi_select"
        int order_index
        datetime created_at
    }

    REQUIREMENT {
        string id PK
        string deliverable_id FK
        string requirement_type_id FK
        string title
        json form_data
        boolean is_completed
        int order_index
        datetime created_at
        datetime updated_at
    }

    TECHNICAL_ANALYSIS {
        string id PK
        string deliverable_id FK, UK "1:1 con Deliverable"
        string content
        string status "enum: draft, in_review, approved, changes_requested"
        string submitted_by_id FK "nullable, FK User"
        datetime submitted_at "nullable"
        string reviewed_by_id FK "nullable, FK User"
        datetime reviewed_at "nullable"
        datetime created_at
        datetime updated_at
    }

    WORK_ITEM_TYPE {
        string id PK
        string name
        string description "nullable"
        string form_id FK
        datetime created_at
        datetime updated_at
    }

    WORK_ITEM {
        string id PK
        string deliverable_id FK "nullable, exclusivo con workstream_id"
        string workstream_id FK "nullable, exclusivo con deliverable_id"
        string work_item_type_id FK
        string title
        json form_data
        string status "enum: draft, to_do, in_progress, blocked, done"
        string priority "enum: low, medium, high, critical"
        string assignee_id FK "nullable, FK User"
        string reviewer_id FK "nullable, FK User"
        float estimate_hours
        float logged_hours
        datetime created_at
        datetime updated_at
    }

    WORK_ITEM_REQUIREMENT {
        string id PK
        string work_item_id FK
        string requirement_id FK
        datetime created_at
    }

    COMMENT {
        string id PK
        string entity_type "enum: deliverable, technical_analysis, work_item"
        string entity_id FK "polimórfico"
        string author_id FK
        string body
        datetime created_at
    }

    ATTACHMENT {
        string id PK
        string entity_type "enum: deliverable, technical_analysis, work_item"
        string entity_id FK "polimórfico"
        string file_name
        string mime_type
        string storage_path
        string uploaded_by_id FK
        datetime created_at
    }

    BLOCKER {
        string id PK
        string entity_type "enum: deliverable, work_item"
        string entity_id FK "polimórfico"
        string title
        string description "nullable"
        string severity "enum: low, medium, high, critical"
        string status "enum: open, in_progress, resolved, cancelled"
        datetime created_at
        datetime resolved_at "nullable"
    }

    NOTIFICATION {
        string id PK
        string recipient_id FK
        string event_type "status_changed, assigned, commented..."
        string entity_type "enum: deliverable, technical_analysis, work_item"
        string entity_id FK "polimórfico"
        string message
        boolean is_read
        datetime created_at
    }

    WORKSTREAM ||--o{ DELIVERABLE : contains
    WORKSTREAM ||--o{ WORK_ITEM : contains

    FORM ||--o{ FORM_FIELD : has
    FORM ||--o{ REQUIREMENT_TYPE : used_by
    FORM ||--o{ WORK_ITEM_TYPE : used_by

    REQUIREMENT_TYPE ||--o{ REQUIREMENT : classifies
    WORK_ITEM_TYPE ||--o{ WORK_ITEM : classifies

    DELIVERABLE ||--o{ REQUIREMENT : has
    DELIVERABLE ||--|| TECHNICAL_ANALYSIS : has
    DELIVERABLE ||--o{ WORK_ITEM : contains
    DELIVERABLE ||--o{ COMMENT : has
    DELIVERABLE ||--o{ ATTACHMENT : has
    DELIVERABLE ||--o{ BLOCKER : has

    TECHNICAL_ANALYSIS ||--o{ COMMENT : has
    TECHNICAL_ANALYSIS ||--o{ ATTACHMENT : has

    REQUIREMENT ||--o{ WORK_ITEM_REQUIREMENT : covered_by
    WORK_ITEM ||--o{ WORK_ITEM_REQUIREMENT : covers

    WORK_ITEM ||--o{ COMMENT : has
    WORK_ITEM ||--o{ ATTACHMENT : has
    WORK_ITEM ||--o{ BLOCKER : has

    USER ||--o{ DELIVERABLE : "owner_ids/assignee_ids/reviewer_ids"
    USER ||--o{ WORK_ITEM : "assignee_id/reviewer_id"
    USER ||--o{ TECHNICAL_ANALYSIS : "submitted_by_id/reviewed_by_id"
    USER ||--o{ COMMENT : writes
    USER ||--o{ ATTACHMENT : uploads
    USER ||--o{ NOTIFICATION : receives
```

> Nota: las relaciones de `DELIVERABLE`/`WORK_ITEM` hacia `USER` a través de `owner_ids`, `assignee_ids`, `reviewer_ids` se modelan como arrays de ULIDs (no como tablas puente independientes) por simplicidad en el MVP; `entity_type`/`entity_id` en `COMMENT`, `ATTACHMENT`, `BLOCKER` y `NOTIFICATION` son claves foráneas polimórficas.

### **3.2. Descripción de entidades principales:**

- **User**: representa a una persona que interactúa con la plataforma. PK `id` (ULID). `email` único. `roles` es un array de enum (`admin`, `product_owner`, `developer`, `team_lead`); un usuario puede combinar varios roles y acumula los permisos de todos ellos. Sin entidad de roles independiente: la autorización se deriva directamente de este array.

- **Workstream**: contenedor de nivel superior para agrupar trabajo relacionado (una épica, una agrupación de tareas o de bugs). PK `id`. `status` enum (`planning`, `active`, `on_hold`, `completed`, `cancelled`). Relación 1:N con `Deliverable` y 1:N con `WorkItem` (work items directos, sin pasar por el flujo de requisitos).

- **Deliverable**: entregable de negocio o técnico. PK `id`; FK `workstream_id` (NOT NULL) hacia `Workstream`. `owner_ids`, `assignee_ids`, `reviewer_ids` son arrays de FK hacia `User`. `status` enum (`draft`, `ready_for_review`, `blocked`, `ready_for_development`, `in_technical_analysis`, `in_progress`, `done`, `cancelled`) con transiciones gobernadas por reglas de negocio (ver más abajo). FK opcional `approved_by_lead_id` hacia `User` (debe tener rol `team_lead`). Relación 1:N con `Requirement`, 1:1 con `TechnicalAnalysis`, 1:N con `WorkItem`, `Comment`, `Attachment` y `Blocker`.

- **Requirement**: requisito funcional dentro de un `Deliverable`. PK `id`; FK `deliverable_id` y FK `requirement_type_id` (ambas NOT NULL). `form_data` es JSON validado en aplicación contra los `FormField` del `Form` asociado al `RequirementType`. `is_completed` (boolean) bloquea el paso del `Deliverable` a `ready_for_review` mientras sea `false` en algún requisito.

- **RequirementType**: tipo de requisito configurable (p. ej. historia de usuario, regla de negocio). PK `id`; FK `form_id` (NOT NULL) hacia `Form`, que determina el formulario a completar.

- **Form**: formulario configurable y reutilizable. PK `id`. Puede asociarse a uno o varios `RequirementType` y/o `WorkItemType`. Relación 1:N con `FormField`.

- **FormField**: campo individual de un `Form`. PK `id`; FK `form_id` (NOT NULL). `field_type` enum (`text`, `textarea`, `number`, `boolean`, `select`, `multi_select`, `date`, `user_reference`). `is_required` determina si el campo debe completarse para considerar el `Requirement`/`WorkItem` como completo. `options` (JSON, nullable) para los tipos `select`/`multi_select`.

- **TechnicalAnalysis**: análisis técnico elaborado por los developers asignados, previo a la creación efectiva de los work items. PK `id`; FK `deliverable_id` **única** (relación 1:1 con `Deliverable`). `status` enum (`draft`, `in_review`, `approved`, `changes_requested`). FK opcionales `submitted_by_id` y `reviewed_by_id` hacia `User` (este último debe estar en `reviewer_ids` del `Deliverable`).

- **WorkItemType**: tipo de work item configurable (tarea técnica, bug, spike…). PK `id`; FK `form_id` (NOT NULL) hacia `Form`.

- **WorkItem**: unidad ejecutable de trabajo. PK `id`. FK `deliverable_id` y FK `workstream_id` son mutuamente excluyentes y exactamente una debe estar presente (restricción de negocio, no de columna). FK `work_item_type_id` (NOT NULL) determina el `form_data` a completar. `status` enum (`draft`, `to_do`, `in_progress`, `blocked`, `done`). FK opcionales `assignee_id` y `reviewer_id` hacia `User`. Un `WorkItem` en `draft` solo puede existir mientras el `TechnicalAnalysis` de su `Deliverable` no esté `approved`, y debe tener al menos un `Requirement` asociado.

- **WorkItemRequirement**: tabla puente N:M entre `WorkItem` (en estado `draft`) y `Requirement`. PK `id`; FK `work_item_id` y FK `requirement_id` (ambas NOT NULL). Garantiza la trazabilidad entre los *implementation steps* del análisis técnico y los requisitos que cubren.

- **Comment**, **Attachment**, **Blocker**, **Notification**: entidades de soporte con FK polimórfica (`entity_type` + `entity_id`) hacia `Deliverable`, `TechnicalAnalysis` o `WorkItem` (y además `Blocker` sobre `Deliverable`/`WorkItem`). `Comment.author_id`, `Attachment.uploaded_by_id` y `Notification.recipient_id` son FK NOT NULL hacia `User`. `Blocker.status` (`open`, `in_progress`, `resolved`, `cancelled`); un `Blocker` abierto fuerza el status `blocked` en su `WorkItem` asociado.

**Reglas de negocio clave** (ver detalle completo en la documentación del proyecto):
1. Un `WorkItem` pertenece exactamente a un `Deliverable` o a un `Workstream`, nunca a ambos ni a ninguno.
2. Un `Deliverable` solo pasa a `ready_for_review` con todos sus `Requirement` en `is_completed = true`.
3. Solo un usuario con rol `team_lead` puede aprobar `ready_for_development` o bloquear el `Deliverable` con comentarios.
4. `in_technical_analysis` requiere al menos un `assignee` y un `reviewer` asignados al `Deliverable`.
5. Solo un `reviewer_id` del `Deliverable` puede aprobar o solicitar cambios sobre su `TechnicalAnalysis`.
6. Los `WorkItem` en `draft` solo existen mientras el `TechnicalAnalysis` no está `approved`, y siempre deben tener ≥1 `Requirement` asociado vía `WorkItemRequirement`.
7. Al aprobarse el `TechnicalAnalysis`, todos los `WorkItem` `draft` del `Deliverable` transicionan automáticamente a `to_do`.
8. Un `WorkItem` no puede pasar a `done` con `FormField` obligatorios de su `WorkItemType` sin completar.
9. Un `Blocker` abierto asociado fuerza el status `blocked` en su entidad.

---

## 4. Especificación de la API

El backend expone una API REST versionada (`/api/v1`), autenticada con Bearer JWT, con recursos alineados a las entidades del dominio. A continuación se documentan en formato OpenAPI 3 los tres endpoints principales del flujo de un entregable: creación de requisitos funcionales, transición de estado por parte del Tech Lead, y consulta del board Kanban de work items.

```yaml
openapi: 3.0.3
info:
  title: Tandem API
  version: "1.0"
paths:
  /api/v1/deliverables/{deliverableId}/requirements:
    post:
      summary: Crear un requisito funcional en un entregable
      tags: [Requirements]
      security:
        - bearerAuth: []
      parameters:
        - name: deliverableId
          in: path
          required: true
          schema: { type: string, example: 01HZY3K9G6R8Q2N7X5VJ3B4C8M }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [requirement_type_id, title, form_data]
              properties:
                requirement_type_id: { type: string }
                title: { type: string }
                form_data: { type: object, additionalProperties: true }
      responses:
        "201":
          description: Requisito creado
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Requirement"

  /api/v1/deliverables/{deliverableId}/ready-for-development:
    patch:
      summary: Aprobar la revisión funcional de un entregable (solo Tech Lead)
      tags: [Deliverables]
      security:
        - bearerAuth: []
      parameters:
        - name: deliverableId
          in: path
          required: true
          schema: { type: string }
      responses:
        "200":
          description: Entregable aprobado, pasa a ready_for_development
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Deliverable"
        "403":
          description: El usuario autenticado no tiene rol team_lead
        "409":
          description: El entregable no está en estado ready_for_review

  /api/v1/work-items:
    get:
      summary: Listar work items para el board Kanban, con filtros
      tags: [WorkItems]
      security:
        - bearerAuth: []
      parameters:
        - name: status
          in: query
          schema: { type: string, enum: [draft, to_do, in_progress, blocked, done] }
        - name: assignee_id
          in: query
          schema: { type: string }
        - name: workstream_id
          in: query
          schema: { type: string }
      responses:
        "200":
          description: Listado de work items
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/WorkItem"

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    Requirement:
      type: object
      properties:
        id: { type: string }
        deliverable_id: { type: string }
        requirement_type_id: { type: string }
        title: { type: string }
        form_data: { type: object }
        is_completed: { type: boolean }
        order_index: { type: integer }
    Deliverable:
      type: object
      properties:
        id: { type: string }
        workstream_id: { type: string }
        title: { type: string }
        status:
          type: string
          enum: [draft, ready_for_review, blocked, ready_for_development, in_technical_analysis, in_progress, done, cancelled]
        approved_by_lead_id: { type: string, nullable: true }
        approved_at: { type: string, format: date-time, nullable: true }
    WorkItem:
      type: object
      properties:
        id: { type: string }
        title: { type: string }
        status:
          type: string
          enum: [draft, to_do, in_progress, blocked, done]
        priority:
          type: string
          enum: [low, medium, high, critical]
        assignee_id: { type: string, nullable: true }
```

**Ejemplo — crear un requisito funcional**

Petición:
```http
POST /api/v1/deliverables/01HZY3K9G6R8Q2N7X5VJ3B4C8M/requirements
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "requirement_type_id": "01HZY3M2F7T1W9D4K6P0R2X8Y1",
  "title": "El usuario puede filtrar el board por responsable",
  "form_data": {
    "description": "Como Developer quiero filtrar el board por responsable...",
    "acceptance_criteria": "Dado un board con work items de varios responsables, cuando filtro por uno, entonces solo veo sus tarjetas."
  }
}
```

Respuesta:
```json
{
  "id": "01HZY3N4H8V2X0E5L7Q1S3Y9Z2",
  "deliverable_id": "01HZY3K9G6R8Q2N7X5VJ3B4C8M",
  "requirement_type_id": "01HZY3M2F7T1W9D4K6P0R2X8Y1",
  "title": "El usuario puede filtrar el board por responsable",
  "form_data": {
    "description": "Como Developer quiero filtrar el board por responsable...",
    "acceptance_criteria": "Dado un board con work items de varios responsables, cuando filtro por uno, entonces solo veo sus tarjetas."
  },
  "is_completed": false,
  "order_index": 3
}
```

---

## 5. Historias de Usuario

> Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

**Historia de Usuario 1**

**Como** Product Owner, **quiero** crear requisitos funcionales en un entregable eligiendo su tipo y completando el formulario asociado, **para** capturar la información necesaria según la naturaleza de cada requisito.

*Criterios de aceptación:*
- Dado un entregable en estado `draft`, cuando el Product Owner selecciona un `RequirementType`, entonces la aplicación muestra el formulario asociado a ese tipo (`Form`/`FormField`).
- Dado un formulario con campos obligatorios (`is_required = true`) sin completar, cuando el Product Owner intenta guardar, entonces el requisito se guarda pero `is_completed` queda en `false`.
- Dado un requisito con todos sus campos obligatorios completados, cuando el Product Owner lo guarda, entonces `is_completed` pasa a `true`.
- El entregable solo puede marcarse como "Listo para revisión" cuando todos sus requisitos tienen `is_completed = true`.

**Historia de Usuario 2**

**Como** Tech Lead, **quiero** revisar los requisitos funcionales de un entregable marcado como "Listo para revisión" y aprobarlo o bloquearlo con comentarios, **para** validar que el alcance está suficientemente definido antes de iniciar el análisis técnico.

*Criterios de aceptación:*
- Dado un entregable en estado `ready_for_review`, cuando un usuario con rol `team_lead` lo aprueba, entonces el entregable pasa a `ready_for_development` y se registran `approved_by_lead_id` y `approved_at`.
- Dado un entregable en estado `ready_for_review`, cuando el Tech Lead registra dudas como comentario y lo bloquea, entonces el entregable pasa a `blocked` y las dudas quedan visibles como `Comment` asociado.
- Dado un entregable `blocked`, cuando el Product Owner ajusta los requisitos y lo vuelve a marcar como "Listo para revisión", entonces el entregable vuelve a `ready_for_review` disponible para una nueva revisión.
- Un usuario sin rol `team_lead` no puede realizar esta aprobación (la API responde 403).

**Historia de Usuario 3**

**Como** Developer, **quiero** mover un work item entre estados arrastrándolo en el board Kanban, **para** actualizar mi progreso de forma rápida y visual.

*Criterios de aceptación:*
- Dado el board Kanban con columnas `to_do`, `in_progress`, `blocked` y `done`, cuando arrastro una tarjeta de work item a otra columna, entonces su `status` se actualiza en el backend y el cambio se refleja para el resto de usuarios.
- Dado un work item con `FormField` obligatorios de su `WorkItemType` sin completar, cuando intento moverlo a `done`, entonces la operación se rechaza y se indica qué campos faltan.
- Dado un work item con un `Blocker` abierto asociado, entonces su estado se muestra como `blocked` y no puede moverse manualmente a otra columna hasta resolver el bloqueo.
- El movimiento queda reflejado en el historial de cambios del work item.

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto. 

**Ticket 1 — Backend**

**Título:** Implementar la aprobación funcional de un entregable por el Tech Lead (`ApproveDeliverableCommand`)

**Descripción:** Implementar en `DeliverablesModule` (núcleo del dominio, DDD ligero + CQRS) el comando que permite a un Tech Lead aprobar un `Deliverable` en estado `ready_for_review`, haciéndolo transicionar a `ready_for_development`.

**Tareas técnicas:**
1. Definir `ApproveDeliverableCommand` (payload: `deliverableId`, `approvedByUserId`) y su `CommandHandler` en `core/deliverables/application/`.
2. Añadir el método de dominio `Deliverable.approve(leadId)` en `core/deliverables/domain/`, que valide la precondición `status === 'ready_for_review'` y establezca `status = 'ready_for_development'`, `approved_by_lead_id` y `approved_at`.
3. En el `CommandHandler`, validar que `approvedByUserId` corresponde a un `User` con rol `team_lead` antes de invocar el dominio (la autorización vive en el handler, no en la entidad).
4. Emitir `DeliverableApprovedEvent` tras persistir el cambio, vía `EventBus` de `@nestjs/cqrs`.
5. Exponer el endpoint `PATCH /api/v1/deliverables/{id}/ready-for-development` en `core/deliverables/interface/`, protegido con guard de autenticación.
6. Tests unitarios del método de dominio (transición válida/ inválida) y del `CommandHandler` (autorización, persistencia, emisión de evento) sin infraestructura real.

**Criterios de aceptación:**
- Un `team_lead` puede aprobar un `Deliverable` en `ready_for_review`; el resultado es `ready_for_development` con `approved_by_lead_id`/`approved_at` informados.
- Un usuario sin rol `team_lead` recibe `403 Forbidden`.
- Un `Deliverable` que no está en `ready_for_review` recibe `409 Conflict`.

**Dependencias:** requiere el modelo `Deliverable` y su repositorio Prisma ya creados (ver Ticket 3).

---

**Ticket 2 — Frontend**

**Título:** Implementar el board Kanban de work items con arrastrar y soltar

**Descripción:** Construir la vista `Board` (SwiftUI) que muestra los `WorkItem` agrupados por `status` (`to_do`, `in_progress`, `blocked`, `done`) y permite cambiar el estado arrastrando la tarjeta entre columnas, consumiendo `GET /api/v1/work-items` y el endpoint de actualización de estado.

**Tareas técnicas:**
1. Crear `BoardViewModel` (`@Observable`) en `Features/Board/`, que consulte `GET /api/v1/work-items` (filtrable por `workstream_id`/`deliverable_id`) a través del cliente generado con `swift-openapi-generator`.
2. Implementar `BoardView` con una columna SwiftUI por estado, renderizando `WorkItemCardView` (título, prioridad, asignado) por cada work item.
3. Habilitar drag & drop nativo (`Transferable`/`onDrop`) para mover una tarjeta entre columnas, invocando la actualización de estado en el `ViewModel` de forma optimista (actualiza la UI antes de confirmar la respuesta del backend) con reversión si la llamada falla.
4. Si el backend rechaza la transición a `done` por `FormField` obligatorios sin completar, mostrar un alert con el detalle de los campos pendientes.
5. Si el work item tiene un `Blocker` abierto, deshabilitar el drag y mostrar un indicador visual de bloqueo.
6. Tests unitarios de `BoardViewModel` con Swift Testing (agrupación por estado, manejo de error al mover) y un test de UI con XCTest que arrastre una tarjeta entre columnas.

**Criterios de aceptación:**
- El board agrupa correctamente los work items por `status` y refleja cambios de prioridad/asignado.
- Arrastrar una tarjeta a otra columna actualiza su estado en backend y en la UI.
- Un work item con `Blocker` abierto no puede arrastrarse y se distingue visualmente como bloqueado.

**Dependencias:** requiere el endpoint `GET /api/v1/work-items` y el de transición de estado ya disponibles en el backend.

---

**Ticket 3 — Base de datos**

**Título:** Modelado y migración inicial de las entidades del flujo de entregable (`Deliverable`, `Requirement`, `RequirementType`, `Form`, `FormField`)

**Descripción:** Definir en `schema.prisma` las tablas necesarias para soportar el flujo de definición y revisión funcional de un entregable, y generar la migración inicial con Prisma Migrate.

**Tareas técnicas:**
1. Modelar `Form` y `FormField` (1:N), con `field_type` como enum de Prisma y `options` como columna `JSONB` nullable.
2. Modelar `RequirementType`, con FK obligatoria `form_id` hacia `Form`.
3. Modelar `Deliverable`, con FK obligatoria `workstream_id`, columnas de array (`owner_ids`, `assignee_ids`, `reviewer_ids`) como `String[]` de ULIDs, `status` y `priority` como enums, y FK nullable `approved_by_lead_id` hacia `User`.
4. Modelar `Requirement`, con FKs obligatorias `deliverable_id` y `requirement_type_id`, y `form_data` como columna `JSONB`.
5. Añadir a todas las tablas `id` (ULID, generado en aplicación), `created_at`, `updated_at`.
6. Añadir índices sobre las FKs (`deliverable_id`, `requirement_type_id`, `form_id`, `workstream_id`) para las consultas de listado más frecuentes.
7. Generar la migración con `prisma migrate dev` y añadir un seed mínimo (un `Workstream`, un `Deliverable`, un `RequirementType` con su `Form`/`FormField`) para desarrollo local.

**Criterios de aceptación:**
- La migración se aplica limpiamente sobre una base de datos vacía (`prisma migrate deploy`).
- Las FKs obligatorias (`workstream_id`, `requirement_type_id`, `form_id`, `deliverable_id`) tienen restricción `NOT NULL` y `ON DELETE RESTRICT` (no se puede borrar un `Form`/`RequirementType`/`Workstream`/`Deliverable` con dependientes).
- El seed de desarrollo puede ejecutarse de forma idempotente (`prisma db seed`).

**Dependencias:** ninguna; es la base sobre la que se apoyan los Tickets 1 y 2.

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**

