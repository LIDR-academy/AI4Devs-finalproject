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
Nestor Mata Cuthbert

### **0.2. Nombre del proyecto:**
Project Vault

### **0.3. Descripción breve del proyecto:**
Una herramienta código abierto para manejar en un solo lugar las claves,
chequeos, certificados, rotación de claves, y demás elementos seguros de uno o
multiples proyectos.

### **0.4. URL del proyecto:**

> Proyecto en desarrollo activo — no disponible aún para uso público como servicio. El código está disponible en el repositorio de GitHub.

### 0.5. URL o archivo comprimido del repositorio

https://github.com/nestormata/project-vault

---

## 1. Descripción general del producto

### **1.1. Objetivo:**

Project Vault es una **Plataforma de Operaciones de Proyecto (ProjOps)** de código abierto y auto-alojable — la memoria institucional de un proyecto de ingeniería.

**El problema que resuelve:** Los equipos de ingeniería modernos trabajan con arquitecturas distribuidas que abarcan múltiples proveedores cloud, servicios de terceros, instancias VPS, bases de datos y herramientas SaaS. Cada pieza añade nuevas credenciales, certificados, dominios, subscripciones de pago y dependencias de servicio que deben rastrearse, asegurarse y mantenerse. Ninguna herramienta existente gestiona esta superficie operacional bajo un contexto centrado en el proyecto. Los equipos compensan con una combinación de gestores de secretos de proveedores cloud, herramientas de contraseñas compartidas, hojas de cálculo, cron jobs sin mantenimiento y recordatorios en el calendario — todos operando de forma aislada, ninguno modelando la unidad natural de responsabilidad de ingeniería: el *proyecto*.

**La diferencia clave:** Todo gestor de secretos existente organiza alrededor de una *ubicación de almacenamiento* — tus cosas de AWS aquí, tus cosas de base de datos allá. Project Vault organiza por *proyecto* — como archivar por carpeta de proyecto, no por gabinete. Este no es un cambio de interfaz; es un modelo de datos fundamentalmente distinto.

**Para quién:** Desde desarrolladores indie que manejan múltiples proyectos (tier OSS) hasta equipos de ingeniería de tamaño mediano de 5–50 ingenieros (tier comercial) que han superado las herramientas ad-hoc. Los usuarios de máquina (pipelines CI/CD, microservicios, funciones serverless) son ciudadanos de primera clase.

### **1.2. Características y funcionalidades principales:**

**🔐 Gestión de Secretos y Credenciales**
- Almacenamiento cifrado con versionado completo e inmutable de cada secreto
- RBAC granular con roles por proyecto (Owner, Admin, Member, Viewer)
- Fechas de expiración y programas de rotación configurables por credencial
- Registro de sistemas dependientes por credencial (base de la rotación automatizada)
- Importación masiva desde archivos `.env` y exportaciones JSON
- Etiquetado y búsqueda/filtrado por nombre, tag, estado y expiración
- Búsqueda global por nombre de credencial desde cualquier punto del producto

**🔄 Rotación con Propagación**
- Flujo de rotación con checklist de confirmación por sistema dependiente
- El sistema impide marcar la rotación como completa hasta que todos los sistemas confirman
- La credencial anterior se retira únicamente cuando todos los sistemas dependientes están confirmados
- Historial completo de rotación por credencial (quién inició, confirmaciones por sistema, resultado)
- Soporte para fallo de confirmación de sistema durante una rotación activa sin abandonarla

**📡 Monitoreo Operacional y Alertas**
- Monitoreo de disponibilidad HTTP para endpoints registrados
- Rastreo de expiración de certificados SSL/TLS
- Alertas de renovación de dominios
- Registros de servicios de hosting, suscripciones de pago y herramientas SaaS con fechas de renovación
- Alertas proactivas configurables con tiempos de anticipación por activo
- Panel de estado público opcional por proyecto (shareable sin cuenta)
- Vista de salud cruzada entre todos los proyectos del usuario

**🤖 Usuarios de Máquina**
- Identidades de usuario de máquina con roles de proyecto acotados
- API keys con expiración configurable; emisión y revocación por administradores
- Caché offline: persiste el último secreto válido conocido; se activa automáticamente cuando el vault es inalcanzable (trigger: 3 fallos consecutivos en 30 segundos)
- Integración nativa con GitHub Actions y GitLab CI
- Registro de eventos de caché fallback en el log de auditoría con alertas al administrador

**📋 Auditoría e Cumplimiento**
- Log de auditoría de seguridad: append-only, encadenamiento criptográfico por fila, 100% de captura garantizada
- Log de eventos operacionales separado (health checks, jobs, scheduler)
- Pseudonimización GDPR: PII externalizado a tabla de referencia mutable; eliminación de usuario no rompe checksums
- Exportación en formatos estructurados para revisiones de cumplimiento
- Verificación de integridad del log como paso obligatorio antes de toda exportación de cumplimiento
- Reenvío de logs a almacenamiento externo de escritura única controlado por el cliente

**🔑 Autenticación y Seguridad de Plataforma**
- Autenticación con email/contraseña + MFA TOTP obligatorio para roles Owner y Admin
- Gestión de sesiones con timeout de inactividad configurable
- Unsealing del vault: contraseña maestra o cifrado por sobre con clave dividida (half-key env var + half-key ruta de filesystem separada)
- Aislamiento de datos por organización aplicado a nivel de base de datos vía RLS
- Rate limiting por cuenta autenticada y por IP

**💾 Backup y Restauración**
- Snapshots cifrados programados de todos los datos del vault
- Política de retención y destino de almacenamiento configurables
- Restauración desde snapshot; monitoreo de salud de backups con alertas

**🌐 Plataforma**
- Interfaz web responsive (desktop + tablet + móvil); WCAG 2.1 AA
- REST API versionada con especificación OpenAPI publicada
- Despliegue self-hosted vía Docker / Docker Compose (AMD64 + ARM64)
- Modelo open-core: núcleo completamente abierto; tier SaaS comercial en v2

### **1.3. Diseño y experiencia de usuario:**

> ℹ️ *El proyecto está en desarrollo activo. La capa de UI está en construcción progresiva: el shell MVP (navegación autenticada, dashboard vacío de proyecto, vault init/unseal) está implementado y funcional. Las pantallas de gestión de credenciales y las siguientes epics se implementan de forma iterativa. Los principios y flujos descritos a continuación son los diseñados y guían la implementación.*

**Principio central: La ausencia como señal primaria**

La interacción más frecuente en Project Vault es el *monitoreo de rutina*: un usuario abre el producto, confirma que nada necesita atención, y lo cierra — en 15–30 segundos. El panel principal está optimizado para comunicar "nada requiere atención" de forma inmediata, en un vistazo.

**Dos modos de interacción claramente separados:**
- **Modo monitoreo** — alta densidad de información, optimizado para un vistazo. Máxima señal, mínimo espacio visual. Duración típica: 15–30 segundos cuando todo está bien.
- **Modo acción** — flujos paso a paso con educación contextual, indicadores de progreso y checkpoints explícitos. Para tareas específicas: rotar una credencial, exportar logs de auditoría, incorporar un nuevo servicio.

**Flujos UX clave diseñados:**
1. **Asistente de incorporación** — guiado, bypass-proof, termina solo después de que el usuario coloca al menos una credencial real; el modelo mental centrado en proyecto se aprende de la estructura del producto, no de instrucciones
2. **Importación de credenciales** — pantalla de revisión previa a la importación con mapeo de campos visible y conflictos surfaceados; nada se confirma hasta que el usuario aprueba; convierte la ansiedad de migración en un momento de confianza
3. **Rotación de credenciales** — checklist adaptativo por sistema dependiente; soporte para descubrimiento de sistema mid-rotation; pace se adapta a urgencia sin saltarse controles de seguridad
4. **Visibilidad de cobertura** — el proyecto muestra activos ausentes junto a los presentes; indicador de salud/cobertura del proyecto como objetivo concreto y mejorable
5. **Vista de gobernanza (comprador)** — superficie distinta al dashboard operacional; resumen de acceso del equipo, indicadores de cumplimiento, eventos de seguridad recientes; exportable para stakeholders no técnicos

### **1.4. Instrucciones de instalación:**

**Versiones mínimas requeridas:**

| Herramienta | Versión mínima |
|---|---|
| Node.js | 24 LTS |
| pnpm | 9.x o superior |
| Docker | 24+ con Buildx |
| Docker Compose | v2 |

Plataformas soportadas: macOS y Linux nativamente. Windows requiere WSL2.

**Inicio rápido con Docker:**

```bash
cp .env.example .env          # configurar variables de entorno
docker compose up --build     # iniciar todos los servicios
```

Servicios disponibles en:
- Web: http://localhost:5173
- API: http://localhost:3000
- Health: http://localhost:3000/health

**Desarrollo local:**

```bash
pnpm install
make db-up
make db-migrate

export DATABASE_URL=postgresql://vault_app:dev-only-change-in-prod@localhost:5432/project_vault
export VAULT_BOOTSTRAP_TOKEN=$(openssl rand -base64 32)
pnpm turbo dev
```

Abrir http://localhost:5173. El flujo de primer uso:
1. Inicializar el vault (elegir modo Passphrase, introducir el `VAULT_BOOTSTRAP_TOKEN` y una contraseña de unseal)
2. Registrar el primer usuario
3. Iniciar sesión para acceder al shell autenticado

**Make targets disponibles:**

```bash
make help          # listar todas las tareas disponibles
make db-up         # iniciar solo el contenedor Postgres
make db-migrate    # ejecutar migraciones (como postgres, inicializa vault_app + RLS)
make test          # ejecutar tests (como vault_app)
make check-rls     # verificar cobertura RLS
make ci            # ejecutar la secuencia completa de quality-gate local
make docker-up     # construir + iniciar el stack completo
```

**Producción:**

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

```mermaid
graph TB
    subgraph Cliente
        Browser["Navegador Web\nSvelteKit 2 + Svelte 5\nTailwind CSS v4"]
        CI["CI/CD Pipeline\nGitHub Actions / GitLab CI"]
    end

    subgraph "apps/api — Fastify v5"
        SecureRoute["SecureRoute\n(RBAC + org_id + audit\n+ rate limit + memory safety)"]
        AuthModule["Autenticación\nJWT + TOTP MFA"]
        SecretsModule["Módulo de Secretos\nCifrado AES-256-GCM"]
        RotationEngine["Motor de Rotación\nAdvisory Lock + Compound TX"]
        MonitoringWorker["Worker de Monitoreo\npg-boss scheduler"]
        PluginGateway["Plugin Gateway\nPSK TLS localhost socket"]
        NotificationSvc["Servicio Notificaciones\nEmail + Slack"]
    end

    subgraph "packages/"
        CryptoPkg["packages/crypto\nAES-256-GCM + HKDF"]
        DBPkg["packages/db\nDrizzle ORM + RLS Policies"]
        SharedPkg["packages/shared\nZod schemas + Types"]
    end

    subgraph "PostgreSQL"
        RLS["Row-Level Security\n(org_id enforcement)"]
        SecretsTbl["secrets + secret_versions"]
        AuditLog["security_audit_log\n(append-only + checksums)"]
        OpLog["operational_event_log"]
        PGBoss["pg_boss (job queue)"]
    end

    subgraph "Plugin Process"
        PluginProc["Plugin aislado\n(subprocess, 3s timeout)"]
    end

    Browser -->|"HTTPS / TLS 1.3"| SecureRoute
    CI -->|"API Key + JWT"| SecureRoute
    SecureRoute --> AuthModule
    SecureRoute --> SecretsModule
    SecureRoute --> RotationEngine
    SecretsModule --> CryptoPkg
    SecretsModule --> DBPkg
    RotationEngine --> PluginGateway
    PluginGateway -->|"PSK TLS"| PluginProc
    MonitoringWorker --> PGBoss
    DBPkg --> RLS
    RLS --> SecretsTbl
    RLS --> AuditLog
    RLS --> OpLog
```

**Patrón arquitectural:** Monolito modular (monorepo Turborepo). Se eligió este patrón por la escala de referencia (instancia única, 50 usuarios concurrentes) y el contexto de construcción (fundador en solitario + asistencia de IA). Separar en microservicios introduciría complejidad operacional sin beneficio de escala en v1; el diseño no impide la separación futura.

**Beneficios principales:**
- `SecureRoute` como constructor sellado: todas las preocupaciones transversales (RBAC, org_id, auditoría, rate limiting, seguridad de memoria) se aplican por defecto — un desarrollador no puede crear una ruta insegura por omisión de middleware
- PostgreSQL RLS como única fuente de verdad para el aislamiento de organización: una query sin org_id falla en la base de datos, no en la aplicación
- pg-boss elimina Redis como dependencia de infraestructura adicional, usando el PostgreSQL existente para la cola de jobs

**Compromisos:**
- Escalado horizontal requiere refactorización (separar workers a procesos independientes); no es un objetivo de v1
- El modelo de procesos plugin (subprocess) introduce latencia de arranque; aceptable para rotación manual, no para operaciones síncronas frecuentes

### **2.2. Descripción de componentes principales:**

| Componente | Tecnología | Responsabilidad |
|---|---|---|
| **Web App** | SvelteKit 2 + Svelte 5 + Tailwind CSS v4 | Interfaz de usuario responsive; SSR para primer render; client-side routing para navegación; optimizada para modo monitoreo (densidad) y modo acción (flujos guiados) |
| **API Server** | Fastify v5 + TypeScript + Node.js 24 | REST API versionada (/api/v1/); validación con Zod vía `@fastify/type-provider-zod`; generación automática de spec OpenAPI con `@fastify/swagger`; rate limiting con `@fastify/rate-limit` |
| **SecureRoute** | Abstracción interna Fastify | Constructor sellado que compone todas las preocupaciones transversales de seguridad como defaults; las preocupaciones se deshabilitan explícitamente con flags nombrados, nunca por omisión |
| **packages/db** | Drizzle ORM 0.45.x + postgres.js | Esquema de base de datos, migraciones, definiciones de políticas RLS; fuente de verdad única para tipos de base de datos |
| **packages/crypto** | Node.js crypto (AES-256-GCM, HKDF) | Primitivas criptográficas; cifrado/descifrado con zeroing de memoria; derivación de claves HKDF para clave de auditoría separada |
| **packages/shared** | Zod + TypeScript | Esquemas de validación compartidos entre API y web; fuente de verdad única para tipos de request/response |
| **Background Jobs** | pg-boss 12.18.2 | Cola de jobs PostgreSQL-backed (sin Redis); monitoreo HTTP, alertas de expiración, snapshots de backup, notificaciones; exactly-once delivery vía SKIP LOCKED |
| **Plugin Gateway** | PSK TLS localhost socket | Entrega segura de secretos a plugins aislados; token de ejecución con scope de contexto; expira al finalizar la ejecución |
| **PostgreSQL** | PostgreSQL + Row-Level Security | Almacenamiento principal; RLS enforcement de org_id a nivel de base de datos; dos tablas de log separadas (seguridad vs. operacional) |

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

El proyecto sigue una arquitectura de **monorepo Turborepo** con `pnpm workspaces`. Cada `app` es un proceso desplegable; cada `package` es una librería interna compartida.

```
project-vault/
├── apps/
│   ├── web/                    # SvelteKit 2 + Svelte 5 — interfaz de usuario
│   │   ├── src/routes/         # Rutas de página (file-based routing)
│   │   ├── src/lib/            # Componentes Svelte, stores, utilidades cliente
│   │   └── src/app.html        # Plantilla HTML base
│   │
│   └── api/                    # Fastify v5 — REST API + workers de background
│       ├── src/routes/         # Definiciones de endpoints (SecureRoute)
│       ├── src/modules/        # Módulos de dominio (secrets, rotation, audit…)
│       ├── src/jobs/           # Handlers de pg-boss (monitoring, notifications…)
│       └── src/plugins/        # Plugins Fastify (auth, rate-limit, swagger…)
│
├── packages/
│   ├── db/                     # Drizzle ORM: esquema, migraciones, políticas RLS
│   │   ├── src/schema/         # Definiciones de tablas por dominio
│   │   ├── src/migrations/     # Archivos de migración generados por drizzle-kit
│   │   └── src/rls/            # Definiciones de políticas Row-Level Security
│   │
│   ├── crypto/                 # Primitivas criptográficas
│   │   ├── src/aes.ts          # AES-256-GCM cifrado/descifrado con memory zeroing
│   │   └── src/hkdf.ts         # Derivación de claves HKDF (clave auditoría separada)
│   │
│   ├── shared/                 # Tipos y esquemas Zod compartidos
│   │   ├── src/schemas/        # Esquemas Zod por dominio (secrets, users, projects…)
│   │   └── src/types/          # Tipos TypeScript derivados de los esquemas
│   │
│   ├── tsconfig/               # Configuración TypeScript base compartida
│   └── eslint-config/          # Configuración ESLint compartida
│
├── docker/
│   ├── Dockerfile              # Build multi-stage (AMD64 + ARM64)
│   └── docker-compose.yml      # Stack completo: api + web + postgres
│
├── turbo.json                  # Configuración de pipeline Turborepo
└── pnpm-workspace.yaml         # Definición de workspaces pnpm
```

**Convenciones:**
- `packages/shared` es la fuente de verdad para tipos API; `packages/db` es la fuente de verdad para tipos de base de datos — no hay step de generación de tipos separado
- Los módulos en `apps/api/src/modules/` siguen una estructura de dominio (no capas técnicas): cada módulo contiene su router, servicio, y tipos locales
- Las políticas RLS viven en `packages/db/src/rls/` junto al esquema, no como migraciones separadas

### **2.4. Infraestructura y despliegue**

```mermaid
graph LR
    subgraph "Host (VPS / servidor self-hosted)"
        subgraph "Docker Compose Stack"
            WebContainer["web\nSvelteKit (Node.js)\n:3000"]
            APIContainer["api\nFastify + pg-boss\n:3001"]
            PGContainer["postgres\nPostgreSQL 16\n:5432 (interno)"]
        end
        KeyFile["Master Key File\n/secrets/vault.key\n(volumen separado)"]
        BackupVol["Backup Volume\n/backups/\n(snapshots cifrados)"]
    end
    Nginx["Reverse Proxy\nnginx / Caddy\n(TLS termination)"] --> WebContainer
    Nginx --> APIContainer
    APIContainer --> PGContainer
    APIContainer --> KeyFile
    APIContainer --> BackupVol
```

**Proceso de despliegue:**
1. `docker compose pull` — obtiene imágenes pre-construidas (AMD64 + ARM64)
2. Primera ejecución: ceremonia de inicialización interactiva para configurar modelo de clave (mounted file path o envelope encryption con split-key)
3. `docker compose up -d` — levanta el stack; `api` ejecuta migraciones Drizzle en startup
4. Reverse proxy (nginx o Caddy) con terminación TLS delante del stack

**Actualizaciones in-place:**
```bash
docker compose pull && docker compose up -d
# Las migraciones de base de datos se ejecutan automáticamente en el startup del contenedor api
# Todos los datos, secretos, logs de auditoría y configuración se preservan
```

### **2.5. Seguridad**

**Cifrado en reposo**
- AES-256-GCM para todos los secretos y backups
- Clave de auditoría derivada por separado vía HKDF con `info` string distinto — rotación de clave maestra y de clave de auditoría tienen ciclos de vida independientes
- Versión de clave almacenada por entrada de auditoría; versiones antiguas retenidas en key history store

**Aislamiento de organización**
- `org_id` en cada entidad del esquema; aplicado mediante PostgreSQL Row-Level Security (RLS) a nivel de base de datos — una query sin `org_id` falla en la BD, no en la aplicación; no puede ser omitida por bugs de código o queries SQL directas

**Rutas de código seguras**
- Comparaciones en tiempo constante para todas las operaciones con secretos/tokens
- Zeroing de memoria después del uso de secretos (aplicado en `packages/crypto`)
- Los valores de secretos nunca aparecen en logs, stack traces ni mensajes de error (requisito de code review)
- Rutas sensibles enumeradas en checklist de code review como artefacto de CI

**Autenticación y sesiones**
- MFA TOTP obligatorio para roles Owner y Admin antes de poder invitar miembros
- Tokens JWT de corta vida (≤1h TTL) para usuarios de máquina; refresh mediante API key
- Timeout de inactividad de sesión web: 30 minutos por defecto, configurable

**SecureRoute — defensa por defecto**
- Cada handler HTTP y contexto de background job usa el constructor `SecureRoute` que aplica RBAC, org_id, auditoría, rate limiting y safety de memoria por defecto
- Las preocupaciones se deshabilitan explícitamente con flags nombrados — es imposible crear una ruta insegura por omisión

**Aislamiento de plugins**
- Los plugins se ejecutan como procesos separados con timeout de 3s
- Los secretos nunca se entregan vía IPC de pipe/socket (los buffers del kernel no se pueden zerear); los plugins solicitan valores vía un token de ejecución con scope de contexto a través de un socket TLS local con PSK

**Rate limiting**
- 120 req/min por cuenta autenticada o API key; 60 req/min por IP no autenticada

### **2.6. Tests**

El framework de testing unificado es **Vitest** — runner TypeScript-nativo compatible con SvelteKit y Node.js.

**Estrategia de testing planificada:**

| Tipo | Herramienta | Ejemplos de cobertura |
|---|---|---|
| Tests unitarios | Vitest | `packages/crypto`: cifrado/descifrado round-trip; zeroing de memoria; derivación de claves HKDF |
| Tests de integración | Vitest + testcontainers | Módulo de secretos con PostgreSQL real + RLS activo; operaciones de rotación con compound transaction |
| Tests de auditoría | Vitest + harness de fallo deliberado | Simula fallo de escritura en audit log durante operación; verifica que la operación falla y no se persiste sin audit entry |
| Tests de accesibilidad | axe-core | Gate de CI que bloquea merge en violaciones WCAG 2.1 AA; auditoría manual de top-5 flujos pre-lanzamiento |
| Tests de carga | k6 | Verificación de targets de performance: secret fetch p95 ≤100ms; dashboard FMC ≤2s; audit queries p95 ≤500ms a máxima carga sostenida |

**Test crítico destacado — invariante de auditoría:**
```typescript
// El log de auditoría se escribe en la misma transacción que la operación
// Si la escritura de auditoría falla, la operación completa debe fallar
it('operation fails atomically when audit write fails', async () => {
  // Simula fallo de inserción en security_audit_log
  await db.execute(sql`SET LOCAL statement_timeout = '1ms'`); // fuerza timeout
  await expect(secretsService.revealSecret(secretId, userId))
    .rejects.toThrow();
  // Verifica que el secret_version tampoco se registró como accedido
  const accessLog = await auditLog.findBySecret(secretId);
  expect(accessLog).toHaveLength(0);
});
```

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

```mermaid
erDiagram
    ORGANIZATION {
        uuid id PK
        string name "NOT NULL"
        string slug "UNIQUE NOT NULL"
        string tier "NOT NULL — free|team|enterprise"
        timestamp created_at "NOT NULL DEFAULT now()"
    }

    USER {
        uuid id PK
        uuid org_id FK "NOT NULL — RLS anchor"
        string email "UNIQUE NOT NULL"
        string password_hash "NOT NULL"
        bool mfa_enabled "NOT NULL DEFAULT false"
        string totp_secret "nullable — cifrado"
        timestamp last_active_at "nullable"
        bool is_active "NOT NULL DEFAULT true"
        timestamp created_at "NOT NULL DEFAULT now()"
    }

    USER_IDENTITY_TOKEN {
        uuid id PK
        uuid user_id "nullable — NULL tras pseudonimización"
        string display_name "NOT NULL — permanente post-eliminación"
        bool is_pseudonymized "NOT NULL DEFAULT false"
    }

    PROJECT {
        uuid id PK
        uuid org_id FK "NOT NULL — RLS anchor"
        string name "NOT NULL"
        string slug "NOT NULL"
        text description "nullable"
        text notes "nullable"
        bool is_archived "NOT NULL DEFAULT false"
        timestamp created_at "NOT NULL DEFAULT now()"
    }

    PROJECT_MEMBER {
        uuid id PK
        uuid project_id FK "NOT NULL"
        uuid user_id FK "NOT NULL"
        string role "NOT NULL — owner|admin|member|viewer"
        timestamp joined_at "NOT NULL DEFAULT now()"
    }

    SECRET {
        uuid id PK
        uuid org_id FK "NOT NULL — RLS anchor"
        uuid project_id FK "NOT NULL"
        string name "NOT NULL"
        string[] tags "NOT NULL DEFAULT []"
        date expiry_date "nullable"
        interval rotation_schedule "nullable"
        timestamp created_at "NOT NULL DEFAULT now()"
    }

    SECRET_VERSION {
        uuid id PK
        uuid secret_id FK "NOT NULL"
        bytea encrypted_value "NOT NULL — AES-256-GCM"
        string key_version "NOT NULL"
        int version_number "NOT NULL"
        bool is_current "NOT NULL DEFAULT false"
        timestamp created_at "NOT NULL DEFAULT now()"
    }

    DEPENDENT_SYSTEM {
        uuid id PK
        uuid secret_id FK "NOT NULL"
        string name "NOT NULL"
        text description "nullable"
    }

    MACHINE_USER {
        uuid id PK
        uuid org_id FK "NOT NULL — RLS anchor"
        uuid project_id FK "NOT NULL"
        string name "NOT NULL"
        string role "NOT NULL"
        bool is_active "NOT NULL DEFAULT true"
        date key_expiry "nullable"
        timestamp created_at "NOT NULL DEFAULT now()"
    }

    MACHINE_USER_KEY {
        uuid id PK
        uuid machine_user_id FK "NOT NULL"
        string key_hash "NOT NULL — BLAKE2b"
        bool is_active "NOT NULL DEFAULT true"
        timestamp created_at "NOT NULL DEFAULT now()"
        timestamp revoked_at "nullable"
    }

    ROTATION_EVENT {
        uuid id PK
        uuid org_id FK "NOT NULL — RLS anchor"
        uuid secret_id FK "NOT NULL"
        uuid initiated_by FK "NOT NULL — identity_token_id"
        string status "NOT NULL — in_progress|completed|failed"
        timestamp started_at "NOT NULL DEFAULT now()"
        timestamp completed_at "nullable"
    }

    ROTATION_CHECKLIST_ITEM {
        uuid id PK
        uuid rotation_event_id FK "NOT NULL"
        uuid dependent_system_id FK "NOT NULL"
        string status "NOT NULL — pending|confirmed|failed"
        uuid confirmed_by FK "nullable — identity_token_id"
        timestamp confirmed_at "nullable"
    }

    SECURITY_AUDIT_LOG {
        uuid id PK
        uuid org_id FK "NOT NULL — RLS anchor"
        uuid identity_token_id FK "NOT NULL"
        string event_type "NOT NULL"
        jsonb event_data "NOT NULL"
        bytea row_checksum "NOT NULL — HMAC-SHA256"
        uuid prev_entry_id FK "nullable — encadenamiento criptográfico"
        timestamp created_at "NOT NULL DEFAULT now()"
    }

    SERVICE_RECORD {
        uuid id PK
        uuid org_id FK "NOT NULL — RLS anchor"
        uuid project_id FK "NOT NULL"
        string name "NOT NULL"
        string url "nullable"
        string type "NOT NULL — hosting|payment|saas|other"
        date renewal_date "nullable"
        bool monitoring_enabled "NOT NULL DEFAULT true"
    }

    CERTIFICATE {
        uuid id PK
        uuid org_id FK "NOT NULL — RLS anchor"
        uuid project_id FK "NOT NULL"
        string domain "NOT NULL"
        date expiry_date "NOT NULL"
        timestamp created_at "NOT NULL DEFAULT now()"
    }

    DOMAIN_RECORD {
        uuid id PK
        uuid org_id FK "NOT NULL — RLS anchor"
        uuid project_id FK "NOT NULL"
        string domain "NOT NULL"
        date renewal_date "NOT NULL"
        string registrar "nullable"
    }

    ORGANIZATION ||--o{ USER : "tiene"
    ORGANIZATION ||--o{ PROJECT : "posee"
    USER ||--|| USER_IDENTITY_TOKEN : "referenciado por"
    PROJECT ||--o{ PROJECT_MEMBER : "tiene"
    USER ||--o{ PROJECT_MEMBER : "pertenece_a"
    PROJECT ||--o{ SECRET : "contiene"
    SECRET ||--o{ SECRET_VERSION : "tiene versiones"
    SECRET ||--o{ DEPENDENT_SYSTEM : "depende de"
    SECRET ||--o{ ROTATION_EVENT : "tiene rotaciones"
    ROTATION_EVENT ||--o{ ROTATION_CHECKLIST_ITEM : "tiene items"
    ROTATION_CHECKLIST_ITEM }o--|| DEPENDENT_SYSTEM : "verifica"
    PROJECT ||--o{ MACHINE_USER : "tiene"
    MACHINE_USER ||--o{ MACHINE_USER_KEY : "tiene keys"
    ORGANIZATION ||--o{ SECURITY_AUDIT_LOG : "tiene"
    SECURITY_AUDIT_LOG }o--|| USER_IDENTITY_TOKEN : "referencia"
    PROJECT ||--o{ SERVICE_RECORD : "tiene"
    PROJECT ||--o{ CERTIFICATE : "tiene"
    PROJECT ||--o{ DOMAIN_RECORD : "tiene"
```

### **3.2. Descripción de entidades principales:**

**`ORGANIZATION`**
Unidad raíz de aislamiento de datos. Cada deployment self-hosted puede contener múltiples organizaciones. Toda entidad del sistema lleva `org_id` como anchor para PostgreSQL RLS.

**`USER`**
Usuario humano de la plataforma. `totp_secret` se almacena cifrado. `last_active_at` alimenta la detección de cuentas inactivas (FR71). La PII nunca se almacena directamente en `SECURITY_AUDIT_LOG` — se referencia vía `USER_IDENTITY_TOKEN`.

**`USER_IDENTITY_TOKEN`**
Tabla de indirección para PII en el log de auditoría. Cuando un usuario es eliminado, `display_name` se convierte en pseudónimo permanente y `user_id` se pone a NULL. Los checksums de las filas de auditoría no se ven afectados porque nunca contienen PII directamente.

**`PROJECT`**
Unidad organizacional principal del producto. Todos los activos operacionales (secretos, certificados, dominios, servicios, usuarios de máquina) pertenecen a un proyecto. Soporta archivado sin pérdida de historial.

**`PROJECT_MEMBER`**
Tabla de unión USER ↔ PROJECT con rol. Permite que un mismo usuario tenga roles distintos en proyectos distintos. `UNIQUE(project_id, user_id)`.

**`SECRET` / `SECRET_VERSION`**
`SECRET` es el identificador estable por nombre; `SECRET_VERSION` almacena los valores cifrados. `is_current = true` identifica la versión activa. Las versiones son inmutables una vez escritas (append-only). El valor cifrado usa AES-256-GCM con `key_version` para soportar rotación de clave maestra sin re-cifrado inmediato.

**`DEPENDENT_SYSTEM`**
Registra qué sistemas externos usan cada secreto. Es la base del checklist de rotación y de la visibilidad de cobertura. Credenciales sin sistemas dependientes se marcan como gaps.

**`ROTATION_EVENT` / `ROTATION_CHECKLIST_ITEM`**
Estado de máquina de rotación. `ROTATION_EVENT` es la rotación en sí; `ROTATION_CHECKLIST_ITEM` rastrea la confirmación por cada `DEPENDENT_SYSTEM`. La rotación solo puede completarse cuando todos los items están en estado `confirmed`. Advisory lock de PostgreSQL sobre `secret_id` previene rotaciones concurrentes.

**`SECURITY_AUDIT_LOG`**
Log de auditoría de seguridad append-only. `row_checksum` es un HMAC-SHA256 del contenido de la fila. `prev_entry_id` crea el encadenamiento criptográfico que permite verificar integridad. Se escribe en la misma transacción que la operación auditada — la operación falla si la escritura de auditoría falla.

**`MACHINE_USER` / `MACHINE_USER_KEY`**
Identidades para sistemas automatizados con roles acotados. `MACHINE_USER_KEY` almacena solo el hash de la API key (BLAKE2b). Múltiples keys activas permitidas para rotación sin downtime.

---

## 4. Especificación de la API

La API sigue el patrón REST versionado (`/api/v1/`). La especificación OpenAPI completa se genera automáticamente desde las definiciones de rutas Fastify mediante `@fastify/swagger`.

**Endpoint 1 — Obtener valor de secreto**

```yaml
openapi: "3.1.0"
paths:
  /api/v1/projects/{projectId}/secrets/{secretId}/value:
    get:
      summary: Obtiene el valor actual de un secreto
      description: |
        Retorna el valor cifrado descifrado del secreto en su versión actual.
        Cada llamada genera una entrada en el security_audit_log (event_type: secret.revealed).
        Requiere permiso read-value (distinto de list/enumerate).
      security:
        - bearerAuth: []
        - apiKeyAuth: []
      parameters:
        - name: projectId
          in: path
          required: true
          schema:
            type: string
            format: uuid
        - name: secretId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        "200":
          description: Valor del secreto
          content:
            application/json:
              schema:
                type: object
                properties:
                  secretId:
                    type: string
                    format: uuid
                  name:
                    type: string
                  value:
                    type: string
                    description: Valor en texto plano (descifrado en memoria, nunca persiste)
                  version:
                    type: integer
                  expiresAt:
                    type: string
                    format: date
                    nullable: true
              example:
                secretId: "a1b2c3d4-..."
                name: "STRIPE_SECRET_KEY"
                value: "sk_live_..."
                version: 3
                expiresAt: null
        "403":
          description: Sin permiso read-value para este secreto
        "404":
          description: Secreto no encontrado en este proyecto
```

**Endpoint 2 — Iniciar rotación de credencial**

```yaml
  /api/v1/projects/{projectId}/secrets/{secretId}/rotations:
    post:
      summary: Inicia un flujo de rotación para una credencial
      description: |
        Crea un ROTATION_EVENT con checklist generado automáticamente a partir de
        los DEPENDENT_SYSTEM registrados. Adquiere advisory lock sobre secretId.
        La operación completa (rotation_event + checklist_items + audit_entry) es atómica.
      security:
        - bearerAuth: []
      parameters:
        - name: projectId
          in: path
          required: true
          schema:
            type: string
            format: uuid
        - name: secretId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                newValue:
                  type: string
                  description: Nuevo valor de la credencial (se cifra antes de persistir)
              required: [newValue]
            example:
              newValue: "sk_live_nuevaclave..."
      responses:
        "201":
          description: Rotación iniciada con checklist generado
          content:
            application/json:
              schema:
                type: object
                properties:
                  rotationId:
                    type: string
                    format: uuid
                  status:
                    type: string
                    enum: [in_progress]
                  checklistItems:
                    type: array
                    items:
                      type: object
                      properties:
                        itemId:
                          type: string
                          format: uuid
                        systemName:
                          type: string
                        status:
                          type: string
                          enum: [pending]
              example:
                rotationId: "f9e8d7c6-..."
                status: "in_progress"
                checklistItems:
                  - itemId: "1a2b3c4d-..."
                    systemName: "payments-service"
                    status: "pending"
                  - itemId: "5e6f7g8h-..."
                    systemName: "billing-worker"
                    status: "pending"
        "409":
          description: Ya existe una rotación en progreso para esta credencial
```

**Endpoint 3 — Consultar log de auditoría**

```yaml
  /api/v1/audit-logs:
    get:
      summary: Consulta el log de auditoría de seguridad
      description: |
        Retorna entradas del security_audit_log filtradas. Requiere rol Owner
        o rol Audit explícito. Los Admins solo pueden acceder a entradas de sus proyectos.
        Soporta paginación con cursor.
      security:
        - bearerAuth: []
      parameters:
        - name: projectId
          in: query
          schema:
            type: string
            format: uuid
        - name: eventType
          in: query
          schema:
            type: string
            enum: [secret.revealed, secret.rotated, permission.changed, user.created, user.deleted, audit.exported]
        - name: from
          in: query
          schema:
            type: string
            format: date-time
        - name: to
          in: query
          schema:
            type: string
            format: date-time
        - name: cursor
          in: query
          schema:
            type: string
        - name: limit
          in: query
          schema:
            type: integer
            default: 50
            maximum: 200
      responses:
        "200":
          description: Entradas del log de auditoría
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                          format: uuid
                        eventType:
                          type: string
                        actor:
                          type: string
                          description: display_name del USER_IDENTITY_TOKEN (puede ser pseudónimo)
                        eventData:
                          type: object
                        createdAt:
                          type: string
                          format: date-time
                  nextCursor:
                    type: string
                    nullable: true
                  integrityVerified:
                    type: boolean
                    description: true si el rango consultado pasó verificación de cadena de checksums
```

---

## 5. Historias de Usuario

**Historia de Usuario 1 — Importación de credenciales existentes**

```
Como ingeniero de equipo incorporando un proyecto existente a Project Vault,
quiero importar las credenciales actuales desde archivos .env y exportaciones JSON,
para migrar toda la operativa del proyecto sin introducir errores manuales
y sin comprometer datos antes de confirmar qué se va a crear.

Criterios de aceptación:
- DADO que soy un Admin o Owner del proyecto
  CUANDO subo un archivo .env o JSON al flujo de importación
  ENTONCES el sistema muestra una pantalla de revisión con el mapeo campo a campo
    de cada credencial que se va a crear, incluyendo nombre, valor (enmascarado), y tags
  Y ninguna credencial se persiste hasta que confirmo la importación

- DADO que el archivo contiene nombres de credencial que ya existen en el proyecto
  CUANDO reviso la pantalla de importación
  ENTONCES los conflictos están claramente marcados
  Y puedo elegir por cada conflicto: omitir, sobreescribir, o renombrar

- DADO que confirmo la importación
  CUANDO el sistema procesa el archivo
  ENTONCES cada credencial importada genera una entrada en el security_audit_log
    con event_type: secret.created y el actor que realizó la importación
  Y todas las credenciales son importadas en una sola transacción atómica
    (si alguna falla, ninguna se persiste)
```

---

**Historia de Usuario 2 — Rotación de credencial con checklist de confirmación**

```
Como administrador de proyecto responsable de rotar la contraseña de base de datos
de producción,
quiero iniciar una rotación guiada que genere automáticamente un checklist
con todos los sistemas que usan esa credencial,
para garantizar que cada sistema está actualizado antes de retirar la credencial antigua
y tener un registro auditable completo del proceso.

Criterios de aceptación:
- DADO que soy Admin u Owner y la credencial tiene sistemas dependientes registrados
  CUANDO inicio una rotación e introduzco el nuevo valor
  ENTONCES el sistema genera un checklist con una entrada por cada sistema dependiente
  Y el nuevo valor se cifra y almacena como nueva versión inmediatamente
  Y la credencial anterior permanece activa hasta que todos los sistemas confirmen

- DADO que estoy trabajando en el checklist de rotación
  CUANDO confirmo que un sistema ha sido actualizado
  ENTONCES ese item del checklist se marca como confirmado con timestamp y mi identidad
  Y el log de auditoría registra la confirmación

- DADO que todos los items del checklist están confirmados
  CUANDO marco la rotación como completada
  ENTONCES la versión anterior de la credencial se retira
  Y la rotación solo puede completarse si todos los items están confirmados
    (el sistema lo impide si queda alguno pendiente)

- DADO que descubro durante la rotación un sistema que no estaba registrado
  CUANDO añado ese sistema al checklist en curso
  ENTONCES el sistema añade el nuevo item sin abandonar la rotación activa
  Y el nuevo sistema dependiente queda registrado permanentemente para futuras rotaciones
```

---

**Historia de Usuario 3 — Configuración de usuario de máquina para CI/CD**

```
Como ingeniero DevOps configurando el pipeline de CI/CD de nuestro servicio de pagos,
quiero crear un usuario de máquina con acceso acotado exactamente a los secretos
que el pipeline necesita,
para que el pipeline pueda obtener credenciales de forma segura sin acceso
a secretos de otros proyectos o servicios.

Criterios de aceptación:
- DADO que soy Admin u Owner del proyecto
  CUANDO creo un nuevo usuario de máquina con rol Member en el proyecto
  ENTONCES antes de emitir la API key, el sistema muestra explícitamente
    qué puede acceder el usuario de máquina (secretos del proyecto con permiso read)
    Y qué NO puede acceder (secretos de otros proyectos, acciones de admin)

- DADO que confirmo la creación del usuario de máquina
  CUANDO el sistema emite la API key
  ENTONCES la key solo se muestra una vez y se almacena solo su hash
  Y el sistema comunica explícitamente que cambiar el scope requiere emitir una nueva key

- DADO que el vault no está disponible temporalmente durante una ejecución del pipeline
  CUANDO el usuario de máquina intenta obtener un secreto y falla 3 veces en 30 segundos
  ENTONCES el sistema activa la caché offline y retorna el último valor válido conocido
  Y registra el evento de fallback en el log de auditoría
  Y envía una alerta al administrador del proyecto indicando que el fallback se activó

- DADO que el administrador ha configurado una fecha de expiración en la API key
  CUANDO quedan 7 días para que la key expire
  ENTONCES el sistema envía una alerta al administrador con instrucciones para renovar
```

---

## 6. Tickets de Trabajo

**Ticket 1 — Backend: Compound transaction de rotación de credencial**

```
Título: [API] Implementar endpoint POST /rotations con compound transaction atómica

Tipo: Feature — Backend
Prioridad: Alta
Estimación: 5 puntos

Contexto:
La rotación de credencial es la operación más crítica del sistema. La invariante
arquitectural es que el compound transaction (nueva versión + rotation_event +
checklist_items + audit_entry + notification_queue_entry) se confirma completamente
o no se confirma en absoluto. Adicionalmente, no pueden existir dos rotaciones
en progreso para la misma credencial al mismo tiempo.

Criterios de completitud:
□ Endpoint POST /api/v1/projects/:projectId/secrets/:secretId/rotations implementado
  usando SecureRoute (RBAC: Admin/Owner, audit: secret.rotation.started)
□ Advisory lock de PostgreSQL adquirido sobre secretId antes de iniciar la transacción
  (pg_try_advisory_xact_lock); responde 409 si el lock no está disponible
□ Dentro de una única transacción de base de datos:
  - Nueva SECRET_VERSION creada con el nuevo valor cifrado (AES-256-GCM, key_version actual)
  - ROTATION_EVENT creado con status: in_progress
  - ROTATION_CHECKLIST_ITEM creado por cada DEPENDENT_SYSTEM registrado para el secreto
  - Entrada en SECURITY_AUDIT_LOG (misma transacción — operación falla si audit falla)
  - Entrada en cola de notificaciones (pg-boss, misma transacción)
□ La versión anterior del secreto permanece con is_current = true hasta que
  todos los checklist items estén en status: confirmed
□ Tests de integración con PostgreSQL real:
  - Happy path: rotación completa con múltiples sistemas dependientes
  - Fallo de auditoría: simular fallo de insert en audit_log → operación completa hace rollback
  - Concurrencia: dos requests simultáneos → uno recibe 409
  - Sin sistemas dependientes: checklist vacío → rotación puede completarse inmediatamente

Dependencias técnicas:
- packages/db: tablas ROTATION_EVENT, ROTATION_CHECKLIST_ITEM definidas con Drizzle
- packages/crypto: función encryptValue disponible con key_version support
- SecureRoute: concern de auditoría funcional

Notas de seguridad:
- El nuevo valor nunca debe aparecer en logs ni en el audit event_data
- Verificar que el advisory lock se libera correctamente en caso de excepción
```

---

**Ticket 2 — Frontend: Panel de monitoreo — modo scanning**

```
Título: [Web] Implementar dashboard de proyecto en modo monitoreo (scanning mode)

Tipo: Feature — Frontend
Prioridad: Alta
Estimación: 8 puntos

Contexto:
La interacción más frecuente del producto es el "monitoring scan": un usuario abre
el proyecto, confirma que nada necesita atención, y lo cierra en 15-30 segundos.
Esta pantalla debe estar optimizada para comunicar ausencia de problemas de un vistazo.
El diseño separa estrictamente "monitoring mode" de "action mode".

Criterios de completitud:
□ Ruta SvelteKit: /projects/[projectId] — carga con SSR para primer render
□ Orden de carga progresiva implementado (no bloquear render por datos lentos):
  1. Resumen de estado (contadores: credenciales activas/expirando/expiradas, servicios up/down)
  2. Alertas y advertencias de expiración próxima
  3. Feed de actividad reciente
  4. Detalles expandibles bajo demanda
□ Estado "todo verde": cuando no hay alertas, mostrar un indicador de confianza claro
  ("Todos los activos están en buen estado") — no una pantalla vacía ni un estado ambiguo
□ Estado de alerta: cada alerta muestra asset afectado, tipo, urgencia calculada contextualmente
  (ej: "Certificado expira en 4 días — sin renovación registrada") y enlace directo al activo
□ Indicador de cobertura del proyecto: muestra categorías de activos ausentes
  (ej: "Sin dominios registrados", "3 credenciales sin sistemas dependientes")
□ Responsive: en viewport móvil, mostrar solo señal (contadores + alertas);
  detalles se expanden on-tap; sin scroll horizontal
□ Tests de componente (Vitest):
  - Estado sin alertas renderiza indicador de confianza positivo
  - Estado con alertas renderiza cada alerta con enlace correcto
  - Indicador de cobertura muestra categorías ausentes
  - Responsive: en viewport <768px solo muestra señal primaria

Diseño de referencia (principios UX):
- Alta densidad de información en poco espacio visual
- La ausencia de alertas es el estado primario y más valioso — debe sentirse completo
- Progresión visual clara: verde (OK) > ámbar (atención próxima) > rojo (acción requerida)
- La información aumenta con acción deliberada del usuario, nunca sola
```

---

**Ticket 3 — Base de datos: Esquema inicial con RLS para aislamiento de organización**

```
Título: [DB] Esquema base de datos v1 con PostgreSQL RLS para aislamiento por organización

Tipo: Feature — Base de datos
Prioridad: Crítica (bloqueante para todo lo demás)
Estimación: 5 puntos

Contexto:
El aislamiento de organización mediante PostgreSQL Row-Level Security (RLS) es
una invariante arquitectural no negociable. Debe estar en la primera migración.
Todo acceso a datos de otra organización debe fallar a nivel de base de datos,
no a nivel de aplicación.

Criterios de completitud:
□ Configuración de Drizzle ORM en packages/db:
  - drizzle.config.ts apuntando a PostgreSQL via DATABASE_URL
  - Driver postgres.js configurado con application_name = 'project_vault_app'
  - Script pnpm db:migrate que ejecuta migraciones en orden

□ Tablas core creadas en primera migración (0001_initial_schema.sql):
  - organizations, users, user_identity_tokens
  - projects, project_members
  - secrets, secret_versions, dependent_systems
  - machine_users, machine_user_keys
  - rotation_events, rotation_checklist_items
  - security_audit_log, operational_event_log
  - service_records, certificates, domain_records

□ RLS implementado para cada tabla con org_id:
  - RLS habilitado: ALTER TABLE <tabla> ENABLE ROW LEVEL SECURITY;
  - Política SELECT: CREATE POLICY org_isolation ON <tabla>
      USING (org_id = current_setting('app.current_org_id')::uuid);
  - Política INSERT: WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);
  - El rol de aplicación PostgreSQL NO tiene BYPASSRLS

□ Índices de performance creados:
  - (secret_id, version_number) en secret_versions
  - (actor_id, created_at) y (project_id, created_at) en security_audit_log
  - (org_id, created_at) en security_audit_log (para queries por org)
  - (secret_id) en rotation_events WHERE status = 'in_progress' (partial index)

□ Tests de integración con testcontainers (PostgreSQL real, no mock):
  - Query sin SET app.current_org_id → retorna 0 filas (RLS blocks all)
  - Query con org_id de organización A → no retorna filas de organización B
  - INSERT con org_id incorrecto → rechazado por RLS
  - Verificar que todos los índices existen en el schema de test

□ Script de seed para desarrollo local (pnpm db:seed):
  - 1 organización, 3 usuarios (owner/admin/member), 2 proyectos
  - 5 secretos con versiones, 2 máquinas de usuario, 10 entradas de auditoría

Notas críticas:
- current_setting('app.current_org_id') debe setearse al inicio de cada transacción
  tanto en requests HTTP (via SecureRoute) como en jobs de background (via pg-boss worker setup)
- La ausencia del setting debe retornar error, no datos vacíos
- Documentar el patrón de seteo de org_id en el README de packages/db
```

---

## 7. Pull Requests

El proyecto tiene actualmente 25 Pull Requests mergeados. A continuación se documentan tres representativas de distintas capas del sistema.
La lista completa de requests pueden ser vistos aqui: https://github.com/nestormata/project-vault/pulls?q=is%3Apr+is%3Aclosed

**Pull Request 1 — SecureRoute framework y middleware Drizzle RLS**

- **PR #12:** [Feature/1-11 SecureRoute framework and Drizzle RLS middleware](https://github.com/nestormata/project-vault/pull/12)
- **Descripción:** Implementa el constructor `SecureRoute` — la abstracción central que aplica RBAC, `org_id`, auditoría, rate limiting y seguridad de memoria como defaults en todas las rutas HTTP. También implementa el middleware Drizzle que inyecta `SET LOCAL app.current_org_id` al inicio de cada transacción, activando el aislamiento de organización a nivel de base de datos vía PostgreSQL RLS. A partir de esta PR, es imposible registrar una ruta sin las salvaguardas de seguridad básicas.
- **Tipo:** Feature — Infraestructura de seguridad (Epic 1, Story 1.11)

**Pull Request 2 — MVP Frontend Shell y Dashboard de Proyecto Vacío**

- **PR #21:** [Feature/2-0 MVP frontend shell and empty project dashboard](https://github.com/nestormata/project-vault/pull/21)
- **Descripción:** Implementa el primer shell web usable: verificación de readiness del vault, formularios de inicialización/unseal, registro, login, refresh de sesión server-side, logout, el shell autenticado con navegación (Dashboard, Projects, Credentials, Alerts, Health, Settings), y dashboards de proyecto vacíos con estados intencionalmente informativos sobre la cobertura operacional pendiente. Es el punto de entrada al producto para usuarios humanos.
- **Tipo:** Feature — Frontend (Epic 2, Story 2.0)

**Pull Request 3 — Almacenamiento y Recuperación de Credenciales con Historial de Versiones**

- **PR #24:** [Feature/2-2 Credential storage and retrieval with version history](https://github.com/nestormata/project-vault/pull/24)
- **Descripción:** Implementa el CRUD completo de credenciales: creación con cifrado AES-256-GCM, recuperación del valor actual (descifrado en memoria, nunca persistido en claro), historial de versiones inmutable con `is_current` por versión, worker de retención configurable con destrucción criptográfica de claves para versiones fuera de la ventana de retención, y logging de auditoría en la misma transacción que cada operación. Cada reveal de un secreto genera una entrada en `security_audit_log` con `event_type: secret.revealed`.
- **Tipo:** Feature — Backend + Base de datos (Epic 2, Story 2.2)

