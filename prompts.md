# BPMN Modeler — Prompt Técnico Completo

> **Propósito:** Referencia exhaustiva para cualquier agente AI que trabaje en este proyecto.
> **Idioma:** Español (UI, documentación, comentarios). Código en inglés.
> **URL producción:** https://sdd-ia.com
> **Repositorio:** `thorpette/bpmnoo` (GitHub)
> **Rama activa:** `dev`

---

## 1. VISIÓN GENERAL DEL PROYECTO

BPMN Modeler es una aplicación web full-stack para modelado de diagramas BPMN 2.0 con generación de código impulsada por IA, versionado estilo Git, colaboración en tiempo real, y gestión de proyectos con trazabilidad de requisitos. Orientada a arquitectura Spec-Driven Development (SDD).

**Stack tecnológico:**
- **Backend:** Python 3.11 + FastAPI 0.110 + MongoDB (Motor async) + Redis (opcional)
- **Frontend:** React 19 + CRACO + Tailwind CSS 3 + Radix UI + bpmn-js 17
- **Infraestructura:** Ubuntu VPS + Nginx + Supervisor + Docker (MongoDB) + Certbot (SSL)
- **AI:** Múltiples LLMs vía litellm (DeepSeek V4, MiniMax M2.7, MiMo-V2-Pro, Gemini 2.5 Flash, GPT-4.1)
- **Email:** Resend API
- **Pagos:** Stripe

**Principios de diseño UI (brutalist Swiss):**
- Fuentes: Chivo (headings), Work Sans (body), IBM Plex Mono (labels/botones/mono)
- Esquinas rectas (rounded-none), shadows sólidos (shadow-[8px_8px_0_0_#18181b])
- Sin emojis, sin bordes redondeados, sin sombras suaves
- Diseño responsive, UI completamente en español
- Iconografía: lucide-react exclusivamente

---

## 2. ESTRUCTURA DEL PROYECTO

```
bpmnoo/
├── backend/
│   ├── server.py              # App FastAPI principal, CORS, middleware, WebSocket, startup
│   ├── database.py            # Conexión MongoDB (Motor), logging, helpers
│   ├── models.py              # Todos los modelos Pydantic (~50 modelos)
│   ├── limits.py              # Límites plan gratuito y utilidades de verificación
│   ├── cache.py               # Caché TTL (Redis L2 + memoria L1)
│   ├── email_service.py       # Envío de emails transaccionales (Resend, fire-and-forget)
│   ├── templates.py           # Plantillas de proyectos predefinidas con BPMN XML
│   ├── requirements.txt       # Dependencias Python (~140 paquetes)
│   ├── .env                   # Variables de entorno (MONGO_URL, API keys, etc.)
│   ├── logs/                  # Logs rotativos de la aplicación
│   ├── routers/               # 31 módulos de rutas FastAPI
│   │   ├── auth.py            # Autenticación JWT (login, registro, sesiones)
│   │   ├── google_auth.py     # OAuth2 con Google
│   │   ├── saml_auth.py       # SSO corporativo vía SAML
│   │   ├── diagrams.py        # CRUD de diagramas BPMN, versiones, branches, comentarios
│   │   ├── projects.py        # CRUD de proyectos, miembros del equipo, GitHub sync, RLS
│   │   ├── project_files.py   # Árbol de archivos/carpetas dentro de proyectos
│   │   ├── project_versions.py # Versionado git-like de proyectos (branches)
│   │   ├── project_tree.py    # Árbol de proyecto por fases (A-E)
│   │   ├── ai.py              # Chat AI, generación BPMN, análisis de código
│   │   ├── ai_generator.py    # Generación de BPMN desde prompts
│   │   ├── ai_codegen.py      # Generación de código desde diagramas
│   │   ├── oop_classes.py     # Definiciones de clases OOP con versionado
│   │   ├── components.py      # Componentes BPMN reutilizables
│   │   ├── specs.py           # Especificaciones/requisitos con diff de versiones
│   │   ├── git.py             # Sincronización con repositorios GitHub
│   │   ├── payments.py        # Integración Stripe (checkout, webhooks, suscripciones)
│   │   ├── admin.py           # Panel de administración (usuarios, sistema)
│   │   ├── admin_billing.py   # Administración de facturación
│   │   ├── issues.py          # Seguimiento de issues/tickets
│   │   ├── audit.py           # Registro de auditoría
│   │   ├── announcements.py   # Banners de anuncios globales
│   │   ├── news.py            # Publicaciones de noticias
│   │   ├── social.py          # Notificaciones sociales
│   │   ├── shares.py          # Compartición de recursos entre usuarios
│   │   ├── i18n.py            # Gestión de traducciones (ES/EN)
│   │   ├── custom_schemas.py  # Schemas JSON personalizados
│   │   ├── tools.py           # Utilidades varias
│   │   ├── landing_events.py  # Eventos de analytics de landing page
│   │   └── scheduled_tasks.py # Tareas programadas (cron-like)
│   └── tests/                 # Tests pytest
│       ├── test_bpmn_api.py
│       ├── test_ai_codegen.py
│       ├── test_free_limits.py
│       ├── test_bpmn_sanitizer.py
│       └── test_project_tree.py
├── frontend/
│   ├── src/
│   │   ├── App.js             # Componente raíz, BrowserRouter, rutas, AuthContext
│   │   ├── index.js           # Punto de entrada
│   │   ├── pages/             # ~25 páginas
│   │   ├── components/        # Componentes UI + editor panels
│   │   │   ├── ui/            # Componentes shadcn/ui-style (Radix)
│   │   │   └── editor-panels/ # Paneles del editor BPMN
│   │   ├── hooks/             # 7 hooks personalizados
│   │   ├── contexts/          # 2 contextos (i18n, UpgradeModal)
│   │   └── lib/               # Utilidades (utils.js, landingTracker.js, downloadFile.js)
│   ├── package.json           # Dependencias React (~70 paquetes)
│   ├── craco.config.js        # Configuración CRACO (alias, webpack)
│   ├── tailwind.config.js     # Configuración Tailwind
│   └── public/                # Assets estáticos
├── design_guidelines.json     # Guía de diseño brutalist (fuentes, colores, componentes)
├── CLAUDE.md                  # Instrucciones base para agentes AI
└── .claude/                   # Configuración de hooks y skills de Claude Code
```

---

## 3. BACKEND — ARQUITECTURA DETALLADA

### 3.1 Server (server.py)

**Capa de middleware (orden de aplicación):**
1. `SecurityHeadersMiddleware` — Headers HTTP de seguridad en todas las respuestas
2. `CORSMiddleware` — CORS configurable vía `CORS_ORIGINS`, `FRONTEND_URL`, `CORS_ORIGIN_REGEX`

**Seguridad aplicada:**
| Header | Valor |
|--------|-------|
| X-Content-Type-Options | nosniff |
| X-Frame-Options | SAMEORIGIN |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera=(), microphone=(), geolocation=(), payment=() |
| Strict-Transport-Security | max-age=31536000; includeSubDomains |
| Content-Security-Policy | default-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:; style-src 'self' 'unsafe-inline' https:; img-src 'self' https: data: blob:; font-src 'self' https: data:; connect-src 'self' https: wss: ws:; frame-ancestors 'self'; base-uri 'self'; |

**Prefijos de rutas:**
- Todas las rutas API bajo `/api` (APIRouter con prefix="/api")
- WebSocket: `/api/ws/diagram/{diagram_id}`
- Health: `/api/`, `/api/health`, `/api/health/cache`
- Documentación: `/docs` (proxy nginx → FastAPI)

**Eventos de startup (idempotentes):**
1. `seed_database()`:
   - Backfill de `role` → "subscription" para usuarios sin rol
   - Backfill de `is_active` → True para usuarios legacy
   - Backfill de `noticias` → False para usuarios legacy
   - Sincronización de ADMIN_EMAILS como rol "admin"
   - Backfill de `spec.project_version_id` para especificaciones existentes
   - Migración de proyectos: baseline+delta → ramas git (ProjectBranch)
2. `ensure_indexes()`: Crea todos los índices de MongoDB
3. `start_scheduler()`: Inicia el scheduler de tareas programadas en background

### 3.2 Base de Datos (database.py)

**Conexión MongoDB:**
- Driver: Motor (async) para Python
- URL desde variable de entorno `MONGO_URL`
- Soporte TLS: detecta `tls=true`, `tlsAllowInvalidCertificates=true`, `tlsCAFile=` en la URL
- Nombre de BD desde `DB_NAME` (producción: `bpmn_modeler_dev`)

**Logging:**
- RotatingFileHandler: 10MB por archivo, 5 backups
- Formato: `%(asctime)s - %(name)s - %(levelname)s - %(message)s`
- Salida a stderr + archivo (configurable vía `LOG_FILE`, `LOG_LEVEL`)

**Helper `get_active_project_version_id()`:**
- Versión nueva: retorna el `active_branch_id` (o `default_branch_id` como fallback)
- Compatibilidad legacy: busca en `active_version_ids` para proyectos no migrados

### 3.3 Modelos Pydantic (models.py)

#### Entidades principales:

**User** — `user_id`, `email`, `name`, `last_name`, `country`, `phone`, `document`, `picture`, `role` (free/subscription/admin), `plan` (free/pro/team/enterprise), `noticias`, `github_login`, `github_access_token`, `github_connected_at`, `created_at`

**BpmnDiagram** — `id` (UUIDv4), `name`, `description`, `current_xml`, `current_version`, `tags`, `created_by`, `created_at`, `updated_at`

**BpmnVersion** — `id`, `diagram_id`, `version_number`, `xml_content`, `commit_message`, `validation_status`, `validation_errors`, `tags`, `annotations`, `parent_version`, `changed_elements`, `created_by`, `created_at`

**Branch** (por diagrama) — `id`, `diagram_id`, `name`, `description`, `base_version`, `current_xml`, `current_version`, `is_merged`, `merged_version`, `status`, `created_by`, `created_at`

**OOPClass** — `id`, `name`, `description`, `properties: List[OOPProperty]`, `category`, `tags`, `parent_class`, `interfaces`, `created_by`, `created_at`, `updated_at`

**OOPProperty** — `name`, `type`, `description`, `required`, `default_value`, `referenceClass`, `arrayItemType`, `arrayItemClass`, `nested_properties`, `validations`, `enum_values`

**OOPClassVersion** — `id`, `class_id`, `class_name`, `version_number`, `description`, `properties`, `category`, `tags`, `commit_message`, `changes_summary`, `created_by`, `created_at`

**Project** — `id`, `name`, `description`, `color`, `icon`, `tags`, `diagram_ids`, `github_repo_url`, `github_default_branch`, `github_sync_path`, `github_last_sync`, `created_by`, `created_at`, `updated_at`, `active_version_ids` (legacy), `baseline_id` (legacy), `active_branch_id`, `default_branch_id`

**ProjectBranch** — `id`, `project_id`, `name`, `parent_branch_id`, `description`, `file_ids`, `diagram_ids`, `spec_ids`, `code_snapshot_ids`, `impact_summary`, `is_default`, `created_by`, `created_at`

**ProjectFileNode** — `id`, `project_id`, `parent_id`, `type` (file/directory), `name`, `content`, `template`, `branch_id`, `created_by`, `created_at`, `updated_at`

**Comment** — `id`, `diagram_id`, `element_id`, `element_name`, `content`, `mentions`, `parent_comment_id` (hilos), `is_resolved`, `created_by`, `created_by_name`, `created_at`

**Notification** — `id`, `recipient_email`, `type`, `message`, `from_user`, `diagram_id`, `diagram_name`, `comment_id`, `is_read`, `created_at`

**Favorite** — `id`, `user_id`, `diagram_id`, `diagram_name`, `created_at`

**BpmnComponent** — `id`, `name`, `xml_fragment`, `description`, `category`, `preview_image`, `tags`, `is_public`, `usage_count`, `created_by`, `created_at`

**GitRepository** — `id`, `name`, `provider`, `repository_url`, `access_token`, `default_branch`, `current_branch`, `last_sync`, `sync_path`, `auto_sync`, `diagram_id`, `project_id`, `created_by`, `created_at`

#### Modelos legacy (mantenidos para compatibilidad de migración):
- `ProjectBaseline` — Snapshot completo de un proyecto en un punto de versión
- `ProjectVersion` — Versión incremental con deltas (reemplazado por ProjectBranch)
- `CreateProjectVersionRequest`, `ToggleVersionRequest`, `ProjectStateResponse` — API legacy

#### Modelos de requests AI:
- `AIGenerateRequest` — `prompt`, `context`
- `CodeAnalyzeRequest` — `code`, `language`
- `GeneratePromptRequest` — `diagram_ids`, `code_type`, `language`, `custom_instructions`
- `GenerateCodeRequest` — `prompt`, `code_type`, `language`
- `GenerateSummaryRequest` — `include_xml`, `include_oop`, `custom_context`
- `ProcessPromptRequest` — `prompt`, `llm_provider` (deepseek/deepseek-flash/minimax/mimo), `output_type` (code/docs), `language`
- `RewriteContentRequest` — `content`, `system_prompt`

### 3.4 Sistema de Límites (limits.py)

**Plan gratuito (`FREE_LIMITS`):**
| Recurso | Límite |
|---------|--------|
| max_projects | 1 |
| max_diagrams | 2 |
| max_diagrams_per_project | 3 |
| max_ai_per_month | 6 |
| max_oop_classes | 10 |
| max_components | 10 |
| can_export | false |

**Funciones de verificación:**
- `get_user_role(user_id)` — Obtiene el rol del usuario
- `check_project_limit(user_id, email)` — Máximo 1 proyecto para free
- `check_diagrams_per_project_limit(user_id, project_id)` — Máximo 3 diagramas por proyecto
- `check_diagram_limit(user_id)` — Máximo 2 diagramas totales
- `check_ai_limit(user_id)` — Máximo 6 llamadas AI/mes (ventana desde día 1 del mes)
- `check_oop_limit(user_id, email)` — Máximo 10 clases OOP
- `check_component_limit(user_id, email)` — Máximo 10 componentes
- `check_export_allowed(user_id)` — Exportación solo para no-free
- `record_ai_usage(user_id)` — Registra uso de AI (colección `ai_usage`)

**IMPORTANTE:** Los límites se aplican del lado del servidor en cada endpoint. El frontend consulta vía `useLimits` hook.

### 3.5 Sistema de Caché (cache.py)

**Arquitectura L1 + L2:**
- **L1:** Dict en memoria (siempre activo, acceso sincrónico)
- **L2:** Redis (si `REDIS_URL` está configurada y accesible)

**API pública:**
- `get(key)` → Any (sync, L1)
- `set_value(key, value, ttl_seconds)` → None (L1 + mirror async L2)
- `invalidate(prefix)` → int (L1 solamente, borra por prefijo)
- `await get_or_set(key, ttl, loader)` → Any (L1 → L2 → loader con lock por key)
- `await delete(key)` → int (L1 + L2)
- `await incr(key, amount, ttl)` → int (rate limiting, Redis con fallback memoria)
- `await health()` → dict (backend info)

**Patrón de uso típico:**
```python
result = await cache.get_or_set(f"llm:{hash}", 3600, lambda: call_llm(prompt))
```

**IMPORTANTE:** MongoDB es source of truth. La caché es solo para aceleración. Nunca escribir datos críticos solo en caché.

### 3.6 Servicio de Email (email_service.py)

- **Proveedor:** Resend (https://resend.com)
- **Configuración:** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `APP_PUBLIC_URL`
- **Fire-and-forget:** Errores se loguean pero nunca se propagan al caller
- **Envío asíncrono:** `asyncio.to_thread(resend.Emails.send, params)`
- **Email de bienvenida:** Template HTML inline + texto plano, multi-cliente (Outlook/Gmail)

### 3.7 Plantillas (templates.py)

Plantillas predefinidas de proyectos con BPMN XML completo para:
- Orden de compra (purchase order)
- Onboarding de empleados
- Y otras plantillas de dominio

---

## 4. API ENDPOINTS — CATÁLOGO COMPLETO

Todas las rutas bajo `/api`. Los routers sin prefix explícito usan su tag como ruta (ej: `tags=["diagrams"]` → `/api/diagrams/...`).

### Tabla resumen de los 29 routers:

| # | Archivo | Prefijo | Propósito |
|---|---------|---------|-----------|
| 1 | `auth.py` | `/auth` | JWT sessions, perfil, límites, RLS, dev-login |
| 2 | `google_auth.py` | `/auth/google` | OAuth2 Google con state HMAC |
| 3 | `saml_auth.py` | (sin prefix) | SSO SAML multi-tenant por dominio |
| 4 | `diagrams.py` | (sin prefix) | CRUD diagramas, versiones, branches, merge, diff |
| 5 | `projects.py` | (sin prefix) | CRUD proyectos, templates, export/import, GitHub |
| 6 | `project_files.py` | (sin prefix) | Árbol file/folder, branch-aware |
| 7 | `project_versions.py` | (sin prefix) | Ramas git-like, deep-copy, switch, compare |
| 8 | `project_tree.py` | `/projects` | Snapshots por fase (A-E), restore, dashboard |
| 9 | `ai.py` | `/ai` | Multi-LLM, BPMN gen, code analysis, chat |
| 10 | `ai_codegen.py` | `/ai-projects` | Codegen Fase D (FastAPI+React), polling |
| 11 | `ai_generator.py` | `/ai-projects` | Reqs + BPMN-from-spec, element→req links |
| 12 | `oop_classes.py` | (sin prefix) | Clases OOP con versionado |
| 13 | `social.py` | (sin prefix) | Comentarios, notificaciones, favoritos |
| 14 | `components.py` | (sin prefix) | Componentes BPMN reutilizables |
| 15 | `git.py` | (sin prefix) | GitHub sync para diagramas |
| 16 | `tools.py` | (sin prefix) | Validación BPMN, UML, simulación, docs, stats |
| 17 | `i18n.py` | `/i18n` | Traducciones (es/en/fr/it/zh/ja) |
| 18 | `admin.py` | `/admin` | Gestión usuarios, log viewer |
| 19 | `shares.py` | `/shares` | Compartición recursos (viewer/editor) |
| 20 | `specs.py` | `/specs` | OpenSpec: requisitos, MoSCoW/RACI, AI criteria |
| 21 | `payments.py` | (sin prefix) | Stripe Checkout, webhooks, portal, trial |
| 22 | `admin_billing.py` | `/admin/billing` | KPIs facturación (MRR, churn, transacciones) |
| 23 | `custom_schemas.py` | (sin prefix) | JSON Schema enterprise para OOP |
| 24 | `issues.py` | (sin prefix) | Reporte bugs con screenshots, admin triage |
| 25 | `audit.py` | (sin prefix) | `record_audit()` + admin log viewer, CSV export |
| 26 | `announcements.py` | `/announcements` | Banners con targeting, dismissals versionados |
| 27 | `landing_events.py` | `/landing` | Analytics anónimos landing (TTL 90d, IP anonimizada) |
| 28 | `news.py` | `/news` | Difusión noticias IA por email a users noticias=True |
| 29 | `scheduled_tasks.py` | `/admin/scheduled-tasks` | Tareas DeepSeek cron/one-shot con historial |

### 4.1 Autenticación — `/api/auth`

### 4.1 Autenticación — `/api/auth`
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Registro de usuario |
| POST | `/auth/login` | Login con email |
| POST | `/auth/logout` | Cerrar sesión |
| GET | `/auth/me` | Obtener usuario actual (requiere token) |
| GET | `/auth/session` | Validar sesión vía X-Session-ID |
| GET | `/auth/session-token` | Obtener token de sesión actual |

### 4.2 Google OAuth — `/api/auth/google`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/auth/google/login` | Iniciar flujo OAuth2 Google |
| GET | `/auth/google/callback` | Callback OAuth2 |

### 4.3 SAML SSO — `/api/saml`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/saml/login` | Iniciar SSO SAML |
| POST | `/saml/acs` | Assertion Consumer Service |
| GET/POST | `/saml/metadata` | Metadatos del SP |

### 4.4 Diagramas BPMN — `/api/diagrams`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/diagrams` | Listar diagramas del usuario |
| POST | `/diagrams` | Crear diagrama |
| GET | `/diagrams/{id}` | Obtener diagrama |
| PUT | `/diagrams/{id}` | Actualizar diagrama |
| DELETE | `/diagrams/{id}` | Eliminar diagrama |
| GET | `/diagrams/{id}/versions` | Listar versiones |
| POST | `/diagrams/{id}/versions` | Crear nueva versión |
| GET | `/diagrams/{id}/versions/{version}` | Obtener versión específica |
| GET | `/diagrams/{id}/versions/diff` | Diff entre versiones |
| POST | `/diagrams/{id}/branches` | Crear branch |
| GET | `/diagrams/{id}/branches` | Listar branches |
| PUT | `/diagrams/{id}/branches/{branch_id}/merge` | Mergear branch |
| GET | `/diagrams/{id}/comments` | Listar comentarios |
| POST | `/diagrams/{id}/comments` | Añadir comentario |
| PUT | `/diagrams/{id}/comments/{comment_id}/resolve` | Resolver comentario |
| GET | `/diagrams/{id}/favorites` | Verificar favorito |
| POST | `/diagrams/{id}/favorites` | Marcar favorito |
| DELETE | `/diagrams/{id}/favorites` | Quitar favorito |

### 4.5 Proyectos — `/api/projects`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/projects` | Listar proyectos (RLS) |
| POST | `/projects` | Crear proyecto |
| GET | `/projects/{id}` | Obtener proyecto |
| PUT | `/projects/{id}` | Actualizar proyecto |
| DELETE | `/projects/{id}` | Eliminar proyecto |
| POST | `/projects/{id}/files` | Crear archivo/carpeta |
| GET | `/projects/{id}/files` | Listar archivos |
| PUT | `/projects/{id}/files/{file_id}` | Actualizar archivo |
| DELETE | `/projects/{id}/files/{file_id}` | Eliminar archivo |
| POST | `/projects/{id}/branches` | Crear branch de proyecto |
| GET | `/projects/{id}/branches` | Listar branches |
| PUT | `/projects/{id}/branches/switch` | Cambiar branch activo |
| GET | `/projects/{id}/versions` | Estado de versiones (legacy) |
| POST | `/projects/{id}/versions` | Crear versión (legacy) |

### 4.6 Project Tree (Fases A-E) — `/api/projects`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/projects/{id}/tree` | Obtener árbol de proyecto |
| POST | `/projects/{id}/tree/snapshot` | Crear snapshot de fase |
| GET | `/projects/{id}/tree/phase/{phase}` | Obtener fase específica |

### 4.7 IA — `/api/ai`
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/ai/generate` | Generar BPMN desde prompt |
| POST | `/ai/analyze` | Analizar código |
| POST | `/ai/chat` | Chat conversacional con IA |
| POST | `/ai/process` | Procesar prompt con provider específico |
| POST | `/ai/rewrite` | Reescribir contenido con system prompt |
| POST | `/ai/generate-code` | Generar código desde prompt |
| POST | `/ai/generate-summary` | Generar resumen de proyecto |
| POST | `/ai-projects/generate` | Generar proyecto BPMN completo |
| POST | `/ai-projects/codegen` | Generar código desde diagramas del proyecto |

**Providers LLM disponibles:**
- `deepseek` — DeepSeek V4 (default)
- `deepseek-flash` — DeepSeek rápido
- `minimax` — MiniMax M2.7
- `mimo` — MiMo-V2-Pro
- Gemini 2.5 Flash (vía Google AI)
- GPT-4.1 (vía OpenAI)

### 4.8 Clases OOP — `/api/oop-classes`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/oop-classes` | Listar clases |
| POST | `/oop-classes` | Crear clase |
| GET | `/oop-classes/{id}` | Obtener clase |
| PUT | `/oop-classes/{id}` | Actualizar clase |
| DELETE | `/oop-classes/{id}` | Eliminar clase |
| GET | `/oop-classes/{id}/versions` | Historial de versiones |

### 4.9 Componentes BPMN — `/api/components`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/components` | Listar componentes |
| POST | `/components` | Crear componente |
| GET | `/components/{id}` | Obtener componente |
| PUT | `/components/{id}` | Actualizar componente |
| DELETE | `/components/{id}` | Eliminar componente |

### 4.10 Especificaciones — `/api/specs`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/specs` | Listar especificaciones |
| POST | `/specs` | Crear especificación |
| GET | `/specs/{id}` | Obtener especificación |
| PUT | `/specs/{id}` | Actualizar especificación |
| DELETE | `/specs/{id}` | Eliminar especificación |
| GET | `/specs/{id}/diff` | Diff entre versiones |
| GET | `/specs/{id}/requirements` | Listar requisitos |
| POST | `/specs/{id}/requirements` | Añadir requisito |

### 4.11 Pagos — `/api/payments`
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/payments/create-checkout` | Crear sesión Stripe Checkout |
| POST | `/payments/webhook` | Webhook de Stripe |
| GET | `/payments/subscription` | Obtener suscripción actual |
| POST | `/payments/cancel` | Cancelar suscripción |

### 4.12 Admin — `/api/admin`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/admin/users` | Listar usuarios registrados |
| POST | `/admin/users` | Crear usuario (admin asigna email/rol) |
| PUT | `/admin/users/{id}` | Actualizar datos de usuario |
| PUT | `/admin/users/{id}/toggle-active` | Activar/desactivar cuenta |
| DELETE | `/admin/users/{id}` | Eliminar usuario |
| POST | `/admin/users/{id}/revoke-sessions` | Cerrar todas las sesiones de un usuario |
| GET | `/admin/billing` | KPIs de facturación (MRR, churn, transacciones) |
| GET | `/admin/issues` | Listar issues con filtros (status, severity, category) |
| GET | `/admin/issues/stats` | Conteos agregados por status/severity |
| GET | `/admin/issues/{id}` | Detalle de issue (incluye screenshot data-URL) |
| PATCH | `/admin/issues/{id}` | Actualizar status y/o admin_note |
| DELETE | `/admin/issues/{id}` | Eliminar issue |
| GET | `/admin/audit` | Registro de auditoría con filtros |
| GET | `/admin/audit/stats` | Estadísticas de auditoría (top actions) |
| GET | `/admin/audit/export` | Exportar CSV de auditoría (máx 20K filas) |
| GET | `/admin/audit/actions` | Lista de nombres de acciones distintos |
| GET | `/admin/sso` | Configuración SSO/SAML |
| GET/POST | `/admin/announcements` | Gestionar anuncios globales |
| GET/POST | `/admin/news` | Gestionar publicaciones de noticias IA |
| GET | `/admin/logs` | Ver logs del sistema en tiempo real |
| GET | `/admin/landing-stats` | Estadísticas de landing page |
| GET/POST | `/admin/scheduled-tasks` | Gestionar tareas programadas |
| PUT | `/admin/scheduled-tasks/{id}` | Actualizar tarea programada |
| DELETE | `/admin/scheduled-tasks/{id}` | Eliminar tarea y su historial |
| POST | `/admin/scheduled-tasks/{id}/run` | Ejecutar tarea inmediatamente |
| GET | `/admin/scheduled-tasks/{id}/executions` | Historial de ejecuciones de tarea |

### 4.13 Issues — `/api/issues`
Sistema de reporte de bugs/issues con screenshots (data-URLs base64, máx 2MB).

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/issues` | Reportar issue (title, description, severity, category, screenshot) |
| GET | `/issues/mine` | Listar mis issues reportados |

### 4.14 Auditoría — `/api/audit-logs`
`record_audit()` es llamado por todos los routers para registrar acciones. Almacenado en colección `audit_logs`.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/audit-logs` | Listar entradas con filtros (action, resource_type, actor, fechas) |
| GET | `/audit-logs/stats` | Total, top 10 acciones, timestamp más reciente |
| GET | `/audit-logs/export` | Exportar CSV (máx 20K filas) |
| GET | `/audit-logs/actions` | Lista de acciones distintas para UI de filtros |

### 4.15 Anuncios — `/api/announcements`
Banners globales con targeting por audiencia, programación temporal, y tracking de dismissals.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/announcements/active` | Anuncios activos para el viewer actual (auth opcional) |
| POST | `/announcements/{id}/dismiss` | Descartar anuncio (usuario autenticado) |
| GET | `/announcements` | Admin: listar todos los anuncios |
| POST | `/announcements` | Admin: crear anuncio |
| PUT | `/announcements/{id}` | Admin: actualizar (puede invalidar dismissals) |
| DELETE | `/announcements/{id}` | Admin: eliminar anuncio y dismissals |

**Targeting:** all, free, subscription, admin, enterprise. **Severities:** info, success, warning, critical.

### 4.16 Noticias IA — `/api/news`
Difusión de noticias generadas por IA vía email a usuarios con `noticias=True`.

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/news` | Recibir noticia en HTML y difundir por email |
| GET | `/news` | Admin: listar todas las noticias |
| DELETE | `/news/{id}` | Admin: eliminar noticia |

**Autenticación:** API key (`NEWS_API_KEY`) o sesión admin. Broadcast asíncrono vía `asyncio.create_task`.

### 4.17 Analytics Landing — `/api/landing`
Eventos anónimos de la landing page con privacidad (IP anonimizada, TTL 90 días).

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/landing/events` | Registrar evento anónimo (sin auth) |
| GET | `/landing/events/stats?days=30` | Admin: total eventos, visitantes, por tipo |
| GET | `/landing/events/funnel?days=30` | Admin: funnel conversión maturity quiz |

### 4.18 Tareas Programadas — `/api/admin/scheduled-tasks`
Ejecuta prompts DeepSeek en schedule cron o one-shot. Background scheduler polling cada 30s.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/admin/scheduled-tasks` | Listar tareas |
| POST | `/admin/scheduled-tasks` | Crear tarea (prompt, cron, model, max_tokens) |
| PUT | `/admin/scheduled-tasks/{id}` | Actualizar tarea |
| DELETE | `/admin/scheduled-tasks/{id}` | Eliminar tarea + historial ejecuciones |
| POST | `/admin/scheduled-tasks/{id}/run` | Ejecutar inmediatamente |
| GET | `/admin/scheduled-tasks/{id}/executions` | Historial de ejecuciones |

### 4.19 Otros endpoints
| Router | Prefijo | Rutas clave |
|--------|---------|-------------|
| Git | (sin prefix) | `/api/git/connect`, `/api/git/sync`, `/api/git/repos` |
| Shares | `/shares` | Compartir recursos (create, list, revoke, viewer/editor roles) |
| Social | (sin prefix) | `/api/social/notifications`, `/api/social/comments` |
| i18n | `/i18n` | `/api/i18n/translations` (get/set/list, locales: es/en/fr/it/zh/ja) |
| Custom Schemas | (sin prefix) | `/api/custom-schemas` (JSON Schema enterprise para OOP) |
| Tools | (sin prefix) | `/api/tools/validate`, `/api/tools/uml`, `/api/tools/simulate`, `/api/tools/stats` |

### 4.14 WebSocket — Colaboración en tiempo real

**Endpoint:** `ws://host/api/ws/diagram/{diagram_id}`

**Mensajes entrantes (cliente → servidor):**
| type | Payload | Descripción |
|------|---------|-------------|
| `cursor` | `{position: {x, y}}` | Posición del cursor |
| `select` | `{element_id}` | Elemento seleccionado |
| `update` | `{xml}` | XML del diagrama actualizado |
| `lock` | `{element_id}` | Bloquear elemento para edición |
| `unlock` | `{element_id}` | Desbloquear elemento |

**Mensajes salientes (servidor → cliente):**
| type | Payload | Descripción |
|------|---------|-------------|
| `presence` | `{users: [{id, name, color, cursor, selected_element}]}` | Lista de usuarios conectados |
| `cursor` | `{user_id, user_name, color, position}` | Cursor remoto |
| `select` | `{user_id, user_name, element_id}` | Selección remota |
| `update` | `{user_id, xml}` | Actualización XML remota |
| `lock` | `{user_id, user_name, color, element_id}` | Elemento bloqueado |
| `unlock` | `{user_id, element_id}` | Elemento desbloqueado |

---

## 5. BASE DE DATOS — COLECCIONES E ÍNDICES

### Colecciones MongoDB (25+):

**Core:**
- `users` — Usuarios registrados
- `diagrams` — Diagramas BPMN
- `versions` — Versiones de diagramas
- `branches` — Ramas por diagrama
- `comments` — Comentarios en elementos
- `favorites` — Favoritos de usuario

**Proyectos:**
- `projects` — Proyectos
- `project_files` — Archivos/carpetas dentro de proyectos
- `project_versions` — Ramas (branches) de proyectos y versiones legacy
- `project_baselines` — Baselines de proyecto (legacy)
- `phase_snapshots` — Snapshots de fases A-E

**OOP:**
- `oop_classes` — Definiciones de clases
- `oop_class_versions` — Versiones de clases

**Componentes:**
- `bpmn_components` — Componentes BPMN reutilizables

**Especificaciones:**
- `specifications` — Especificaciones de proyecto
- `requirements` — Requisitos individuales
- `requirement_changes` — Historial de cambios de requisitos
- `element_requirement_links` — Links entre elementos BPMN y requisitos

**IA:**
- `ai_usage` — Registro de uso de IA (para límites)

**Infraestructura:**
- `user_sessions` — Sesiones JWT (TTL index en expires_at)
- `resource_shares` — Recursos compartidos entre usuarios
- `git_repositories` — Conexiones GitHub
- `notifications` — Notificaciones sociales
- `announcements` — Anuncios globales
- `user_announcement_dismissals` — Anuncios descartados por usuario
- `news_posts` — Publicaciones de noticias
- `landing_events` — Analytics de landing (TTL 90 días)
- `scheduled_tasks` — Tareas programadas
- `task_executions` — Ejecuciones de tareas
- `code_generations` — Generaciones de código (Fase D)
- `audit_log` — Registro de auditoría

### Índices críticos:

**Rendimiento (hot paths):**
```
users.email                        — login lookups
diagrams.id (unique)               — CRUD
versions.diagram_id + version_number — historial
comments.diagram_id + created_at   — hilos de comentarios
projects.created_by                — RLS filtering
project_files.project_id + branch_id + parent_id + name (unique) — árbol de archivos
project_versions.project_id + name — búsqueda de ramas
sessions.session_token             — auth hot path
sessions.expires_at (TTL)          — limpieza automática
```

**RLS (multi-tenant):**
```
projects.created_by
diagrams.created_by
versions.created_by
resource_shares.user_email + resource_type
resource_shares.resource_id + resource_type
```

---

## 6. FRONTEND — ARQUITECTURA DETALLADA

### 6.1 Sistema de Rutas (App.js)

**Componentes de ruta:**
- `ProtectedRoute` — Requiere autenticación JWT (token en cookie/localStorage)
- `AdminRoute` — Requiere rol "admin"
- `PublicRoute` — Auth opcional, user puede ser null

**Flujo de autenticación:**
1. Token almacenado en `localStorage.session_token` y cookie `session_token`
2. Validación vía `GET /api/auth/me` con header `Authorization: Bearer {token}`
3. Callback OAuth: hash `session_id=` → `GET /api/auth/session` → almacena token
4. Token expirado: redirect a `/login`

**Rutas públicas (sin auth):**
- `/` → LandingPage
- `/login` → LoginPage
- `/token-login` → TokenLoginPage
- `/pricing` → PricingPage
- `/terms` → TermsPage

**Rutas protegidas (auth requerida):**
- `/dashboard` → Dashboard
- `/library` → DiagramsLibrary
- `/projects` → ProjectsPage
- `/projects/:projectId` → ProjectDetailPage
- `/projects/:projectId/tree` → ProjectTreePage
- `/projects/:projectId/versions` → ProjectVersionsPage
- `/projects/:projectId/codegen` → CodeGenPage
- `/editor` → BpmnEditorPage
- `/editor/:diagramId` → BpmnEditorPage
- `/versions` → VersionsOverviewPage
- `/oop-classes` → OOPClassesManager
- `/components` → BpmnComponentsLibrary
- `/ai-assistant` → MiniMaxAssistant
- `/specs` → SpecsListPage
- `/specs/:specId` → SpecDetailPage
- `/custom-schemas` → CustomSchemasPage
- `/my-permissions` → MyPermissionsPage
- `/billing/success` → BillingSuccessPage

**Rutas admin:**
- `/admin/users` → AdminUsersPage
- `/admin/billing` → AdminBillingPage
- `/admin/announcements` → AdminAnnouncementsPage
- `/admin/news` → AdminNewsPage
- `/admin/logs` → AdminLogsPage
- `/admin/scheduled-tasks` → AdminScheduledTasksPage
- `/admin/landing-stats` → AdminLandingStatsPage
- `/admin/issues` → AdminIssuesPage
- `/admin/audit` → AdminAuditPage
- `/admin/sso` → AdminSsoPage
- `/translations` → TranslationsPage

### 6.2 Páginas Principales

**BpmnEditorPage.jsx** (~96KB) — El editor BPMN principal:
- Integración bpmn-js 17 + properties panel
- Colaboración en tiempo real vía WebSocket
- Gestión de versiones (historial, diff, commit)
- Ramas (branches) git-like para experimentación
- Panel lateral: AI Generator, Chat, Components, Comments, Branch Management
- Exportación: BPMN XML, SVG, PNG

**ProjectDetailPage.jsx** (~107KB) — Vista detallada de proyecto:
- Pestañas: Diagrams, Specs, Code, Team, Settings, Versions
- File tree con navegación de ramas
- Gestión de equipo y permisos
- GitHub sync
- Métricas e impacto de cambios

**LandingPage.jsx** (~58KB) — Landing pública:
- Diseño brutalist Swiss
- Pricing tiers (Gratis, Suscripción, Admin)
- Sección de modelos AI
- Formularios CTA
- Analytics de eventos

**Pages restantes:**
- `Dashboard.jsx` — Panel principal post-login
- `ProjectsPage.jsx` — Listado de proyectos con filtros
- `DiagramsLibrary.jsx` — Biblioteca de diagramas
- `CodeGenPage.jsx` — Generación de código desde diagramas
- `ProjectTreePage.jsx` — Árbol de proyecto por fases A-E
- `ProjectVersionsPage.jsx` — Gestión de ramas y versiones de proyecto
- `VersionsOverviewPage.jsx` — Vista global de versiones
- `OOPClassesManager.jsx` — Editor de clases OOP con versionado
- `BpmnComponentsLibrary.jsx` — Biblioteca de componentes reutilizables
- `SpecsListPage.jsx` / `SpecDetailPage.jsx` — Especificaciones con diff
- `CustomSchemasPage.jsx` — Builder de schemas JSON personalizados
- `TranslationsPage.jsx` — Editor de traducciones i18n
- `LoginPage.jsx` — Login con Google OAuth + SAML SSO
- `PricingPage.jsx` — Página de precios
- `MiniMaxAssistant.jsx` — Asistente AI

### 6.3 Componentes (components/)

**UI (Radix + shadcn/ui-style):**
button, dialog, form, input, select, dropdown-menu, tabs, tooltip, accordion, alert-dialog, avatar, checkbox, collapsible, context-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, separator, slider, switch, tabs, toggle, toggle-group, toast (sonner)

**Paneles del editor (editor-panels/):**
- AIGeneratorDialog — Generación BPMN con IA desde prompt
- BranchManagementDialog — Gestión de ramas (crear, merge, switch)
- CommentsTab — Hilos de comentarios por elemento
- ComponentsTab — Biblioteca de componentes arrastrables
- VersionsTab — Historial de versiones con diff visual
- PropertiesTab — Panel de propiedades del elemento seleccionado
- CollaborationPanel — Usuarios conectados, cursores, locks

**Componentes globales:**
- AnnouncementBanner — Banner de anuncios dismissable
- IssueReporter — Botón flotante para reportar bugs
- ProjectMenuBar — Barra de navegación de proyecto (usada en todas las páginas de proyecto)
- AppSidebar — Sidebar de navegación (layout legacy, en desuso)

### 6.4 Hooks Personalizados

**useCollaboration.js:**
- WebSocket connection a `/api/ws/diagram/{id}`
- Presencia: lista de usuarios conectados con colores
- Cursores remotos: renderizados como overlays SVG en el canvas
- Locks por elemento: overlays de "Editando: Usuario" en elementos bloqueados
- Broadcast de cambios XML, cursor, selección
- API: `{collaborators, lockedElements, handleCanvasMouseMove, handleElementLock, handleElementUnlock, broadcastChange}`

**useEditorNotifications.js:**
- Notificaciones toast para eventos del editor (guardado, errores, conflictos)

**useEditorShortcuts.js:**
- Atajos de teclado para el editor BPMN (Ctrl+S, Ctrl+Z, etc.)

**useElementIO.js:**
- Import/export de elementos BPMN entre diagramas

**useLimits.js:**
- Verificación de límites del plan gratuito
- Consulta límites actuales y muestra alertas cuando se alcanzan

**useVersionDiff.js:**
- Comparación visual de versiones de diagrama
- Integración con bpmn-js para resaltar cambios

**use-toast.js:**
- Hook de toast notifications (basado en sonner)

### 6.5 Contextos

**I18nContext.jsx:**
- Provider de internacionalización (español/inglés)
- Carga traducciones desde `/api/i18n`
- Hook: `useI18n()` → `{t, locale, setLocale}`

**UpgradeModalContext.jsx:**
- Modal de upgrade para usuarios free que alcanzan límites
- Se activa automáticamente al recibir error 402/limit de la API

### 6.6 API Client

```javascript
// App.js — Singleton API URL
export const API = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";
```

En producción, Nginx sirve frontend y proxy de API en el mismo dominio → `API = "/api"`.
En desarrollo local, `REACT_APP_BACKEND_URL=http://localhost:8001` → `API = "http://localhost:8001/api"`.

### 6.7 Dependencias Clave

| Paquete | Versión | Uso |
|---------|---------|-----|
| bpmn-js | 17 | Modeler BPMN 2.0 |
| bpmn-js-properties-panel | 5 | Panel de propiedades |
| @bpmn-io/properties-panel | ^3.35.1 | Base del panel |
| react | ^19.0.0 | UI framework |
| react-router-dom | ^7.5.1 | Routing SPA |
| @radix-ui/* | varios | Componentes accesibles |
| framer-motion | ^12.24.12 | Animaciones |
| recharts | ^3.6.0 | Gráficos |
| tailwindcss | ^3.4.17 | CSS utility |
| lucide-react | ^0.507.0 | Iconos |
| axios | ^1.8.4 | HTTP client |
| cmdk | ^1.1.1 | Command palette |
| sonner | ^2.0.3 | Toast notifications |
| react-hook-form | ^7.56.2 | Formularios |
| zod | ^3.24.4 | Validación schemas |
| mermaid | ^10 | Diagramas de documentación |
| html2canvas | ^1.4.1 | Exportación imagen |

---

## 7. INFRAESTRUCTURA DE PRODUCCIÓN

### 7.1 Servidor
- **Proveedor:** OVH (VPS Ubuntu)
- **IP:** 37.187.159.167
- **Dominio:** sdd-ia.com (www.sdd-ia.com redirige)
- **Blog:** blog.sdd-ia.com (Ghost CMS estático servido por Nginx)

### 7.2 Nginx (proxy reverso + archivos estáticos)

```
sdd-ia.com / www.sdd-ia.com:
├── location /           → frontend/build (SPA: try_files $uri /index.html)
├── location /api        → proxy_pass http://localhost:8000
│   ├── proxy_read_timeout 600s (llamadas IA largas)
│   ├── proxy_buffering off
│   └── WebSocket: Upgrade + Connection headers
└── location /docs       → proxy_pass http://localhost:8000/docs

SSL: Let's Encrypt vía Certbot (renovación automática)
```

### 7.3 Supervisor (gestión de procesos)

```
[program:bpmn-backend]
command=uvicorn server:app --host 0.0.0.0 --port 8000
directory=/opt/bpmn-modeler/backend
user=ubuntu
autostart=true
autorestart=true
stderr_logfile=/var/log/bpmn-backend.err.log
stdout_logfile=/var/log/bpmn-backend.out.log
environment=MONGO_URL="mongodb://bpmnapp:****@localhost:27017/?tls=true&tlsAllowInvalidCertificates=true",
            MINIMAX_API_KEY="sk-...",
            DEEPSEEK_API_KEY="sk-..."
```

**IMPORTANTE:** Las variables de entorno en supervisor SOBREESCRIBEN las del archivo `.env`. El `.env` local puede tener valores simplificados para desarrollo.

### 7.4 MongoDB (Docker)

**Contenedor:** `mongo:latest` (MongoDB 8.0)
**Nombre:** `mongodb`
**Puerto:** `127.0.0.1:27017→27017/tcp` (solo localhost)
**Seguridad:**
- `--auth` — Autenticación requerida
- `--tlsMode requireTLS` — TLS obligatorio
- `--tlsCertificateKeyFile /etc/certs/mongo-server.pem`
- `--tlsCAFile /etc/certs/mongo-ca.crt`
- `--tlsAllowConnectionsWithoutCertificates` — No requiere certificado de cliente
- Usuario: `bpmnapp` (contraseña configurada en MONGO_URL)
- BD: `bpmn_modeler_dev`

**Conexión desde Python (Motor):**
```
mongodb://bpmnapp:****@localhost:27017/?tls=true&tlsAllowInvalidCertificates=true
```
El driver Python (pymongo) parsea los query params y los convierte en kwargs (`tls=True`, `tlsAllowInvalidCertificates=True`).

### 7.5 Script de Deploy (update.sh)

```
/opt/bpmn-modeler/update.sh [branch]   # default: dev
```

**Flujo:**
1. `git fetch origin {branch}` + `git reset --hard origin/{branch}`
2. Si cambió `backend/requirements.txt` → `pip install -r requirements.txt`
3. Si cambió `frontend/` → `yarn install --frozen-lockfile` + `yarn build`
4. `chown -R ubuntu:ubuntu /opt/bpmn-modeler`
5. `supervisorctl restart bpmn-backend`
6. `nginx -t && systemctl reload nginx`
7. Health check: `curl http://127.0.0.1:8001/api/`

**Detección de cambios:** Compara `PREV_HEAD` vs `NEW_HEAD` con `git diff --name-only`.

### 7.6 Sistema de Backup MongoDB

**Script:** `/home/ubuntu/backup-mongodb.py`
**Cron:** `0 3 * * *` (3:00 AM diario)
**Log:** `/home/ubuntu/cron_backup.log`

**Flujo del backup:**
1. `mongodump` dentro del contenedor Docker: `docker exec mongodb mongodump --uri={GO_URI} --db=bpmn_modeler_dev --out /tmp/dump`
2. `docker cp` del dump al host: `/tmp/bpmnoo-backup-dump`
3. Mover a directorio final: `/home/ubuntu/mongodb_backup/daily/YYYY-MM-DD/`
4. Rotación semanal: elimina el backup de hace 7 días
5. Notificación por email a admins vía Resend (éxito o fallo)

**Función crítica `motor_to_go_uri()`:**
Convierte la URI del driver Python Motor a formato Go (para mongodump):
- Reemplaza `tlsAllowInvalidCertificates=true` → `tlsInsecure=true`
- Añade `authSource=admin` si no existe
- Usa `?` para el primer query param y `&` para los siguientes

**Ubicación backups:** `/home/ubuntu/mongodb_backup/daily/`
**Retención:** 7 días (rotación por día de la semana: lunes reemplaza al lunes anterior)

### 7.7 Tareas Programadas (Scheduled Tasks)

**Scheduler interno:** Iniciado en startup de FastAPI (`start_scheduler()`)
**Endpoint:** `/api/admin/scheduled-tasks`
**Colecciones:** `scheduled_tasks` (definición), `task_executions` (historial)
**Índices:** `run_at + enabled`, `task_id + started_at`

---

## 8. AUTENTICACIÓN Y AUTORIZACIÓN

### 8.1 Flujo JWT

1. Registro/Login → servidor crea `session_token` (string aleatorio) en colección `user_sessions`
2. Token almacenado en cookie `session_token` (HttpOnly, SameSite=Lax, 7 días) y `localStorage`
3. Cada request autenticado: `Authorization: Bearer {token}` o cookie
4. Middleware `get_current_user()`:
   - Busca token en cookie → header Bearer → query param `session_token`
   - Valida contra `user_sessions` (token + expires_at)
   - Retorna documento User o None

### 8.2 Roles

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| `free` | Usuario gratuito | Límites restrictivos, sin exportación |
| `subscription` | Usuario de pago | Sin límites, todas las features |
| `admin` | Administrador | Acceso a paneles admin, gestión de usuarios |

**Asignación de rol:**
- `ADMIN_EMAILS` (env var) → automáticamente rol "admin"
- Resto → "subscription" por defecto (o "free" si se especifica en registro)
- El startup `seed_database()` re-sincroniza admins de `ADMIN_EMAILS`

### 8.3 SSO / OAuth

**Google OAuth:**
- Endpoints: `/api/auth/google/login`, `/api/auth/google/callback`
- Redirige con hash `#session_id={token}` → AuthCallback procesa y redirige a `/dashboard`

**SAML SSO:**
- Endpoints: `/api/saml/login`, `/api/saml/acs`, `/api/saml/metadata`
- Configurable en `/admin/sso`
- ThreadPoolExecutor para operaciones blocking de crypto SAML

### 8.4 RLS (Row-Level Security)

La mayoría de queries filtran por `created_by`:
```python
# Patrón típico en routers
diagrams = await db.diagrams.find({"created_by": user.user_id})
```

**Resource Sharing:** Sistema de compartición que permite acceso cruzado entre usuarios:
- Colección `resource_shares` con (user_email, resource_type, resource_id)
- Índices para búsqueda rápida por email y por recurso

---

## 9. SISTEMA DE VERSIONADO

### 9.1 Versionado de Diagramas (Git-like)

Cada diagrama tiene:
- **Versiones:** secuencia lineal de snapshots XML con `version_number`
- **Ramas (Branches):** líneas de desarrollo paralelas que pueden mergearse
- **Commits:** mensajes descriptivos, tags, elementos cambiados
- **Diff:** comparación visual entre versiones (elementos añadidos/modificados/eliminados)
- **Validación:** cada versión tiene `validation_status` (valid/invalid) y `validation_errors`

### 9.2 Versionado de Proyectos (Branch-based)

**Sistema actual (ProjectBranch):**
- Cada proyecto tiene ramas (`project_versions` collection)
- Rama default "main" contiene todos los recursos (files, diagrams, specs, code)
- Crear rama = deep-copy de project_files + reference-copy de diagrams/specs
- Cambiar de rama = navegación instantánea entre snapshots completos
- Cada ProjectFileNode tiene `branch_id` para scope isolation

**Sistema legacy (baseline+delta, deprecado):**
- `ProjectBaseline`: snapshot completo inicial
- `ProjectVersion`: deltas incrementales (file_changes, diagram_version_ids)
- `ToggleVersionRequest`: activar/desactivar versiones
- Migración automática en startup → crea rama "main" para proyectos no migrados

### 9.3 Versionado de Clases OOP

- Cada clase tiene historial de versiones (`oop_class_versions`)
- `changes_summary`: {added: [], removed: [], modified: []}
- Campos versionados: properties, description, category, tags

---

## 10. INTEGRACIÓN IA

### 10.1 Arquitectura LLM

**Capa de abstracción:** litellm (unifica API de múltiples providers)
**Providers configurados:**
- DeepSeek V4 (default para la mayoría de operaciones)
- DeepSeek Flash (rápido, para operaciones simples)
- MiniMax M2.7
- MiMo-V2-Pro
- Gemini 2.5 Flash (Google AI)
- GPT-4.1 (OpenAI)

**Funciones principales:**
- `_call_default_llm(system_msg, prompt, session_prefix)` — LLM por defecto con caché
- `_call_provider_llm(provider, system_msg, prompt)` — LLM específico

**Caché de resultados LLM:**
- Clave: `llm:{session_prefix}:{hash de system+prompt}`
- TTL: configurable (típicamente 3600s)
- Implementado con `cache.get_or_set()`

### 10.2 Capacidades IA

1. **Generación BPMN desde prompt** — Describe el proceso en lenguaje natural → XML BPMN 2.0
2. **Análisis de código** — Analiza código fuente y sugiere mejoras
3. **Chat conversacional** — Asistente con contexto de proyecto
4. **Code generation** — Genera código (Python, Node.js, Java, C#, Go, SudoLang) desde diagramas BPMN + clases OOP
5. **Generación de specs** — Crea especificaciones técnicas desde requisitos
6. **Resumen de proyecto** — Genera documentación ejecutiva
7. **Reescritura de contenido** — Transforma texto con system prompt personalizado

**SudoLang:** Lenguaje de pseudocódigo para definir lógica de negocios en elementos BPMN.

---

## 11. STRIPE — PAGOS Y SUSCRIPCIONES

**Endpoints:** `/api/payments`
**Colección:** `subscriptions` (planes, estado, Stripe customer ID)
**Webhook:** endpoint público que recibe eventos de Stripe (checkout completado, suscripción cancelada, etc.)
**Verificación:** firma del webhook validada con `STRIPE_WEBHOOK_SECRET`

**Flujo de pago:**
1. Cliente → `POST /api/payments/create-checkout` → servidor crea Stripe Checkout Session
2. Cliente redirigido a Stripe Checkout
3. Stripe → `POST /api/payments/webhook` → servidor actualiza suscripción
4. Cliente redirigido a `/billing/success`

---

## 12. INTERNACIONALIZACIÓN (i18n)

**Endpoint:** `/api/i18n`
**Idiomas:** Español (default), Inglés
**Contexto:** `I18nContext.jsx` + `useI18n()` hook
**Traducciones:** Almacenadas en colección `translations` (key → {es, en})
**Admin:** `/translations` (solo admin) permite editar todas las claves

**IMPORTANTE:** Nuevas claves de UI deben añadirse en ambos idiomas. El equipo descubrió gaps de traducción post-refactor de versiones (claves `proj.*`).

---

## 13. TESTING

### Backend (pytest)
- `test_bpmn_api.py` — Endpoints de diagramas (CRUD, versiones, branches)
- `test_ai_codegen.py` — Generación de código con IA
- `test_free_limits.py` — Verificación de límites plan gratuito
- `test_bpmn_sanitizer.py` — Sanitización de XML BPMN
- `test_project_tree.py` — Árbol de proyecto por fases

**Ejecución:** `cd backend && pytest -v`

### Frontend (Jest + React Testing Library)
- `yarn test` (vía CRACO)

---

## 14. PATRONES DE CÓDIGO Y CONVENCIONES

### 14.1 Backend

**Manejo de errores HTTP:**
```python
try:
    # lógica
except HTTPException:
    raise  # NUNCA atrapar HTTPException — re-lanzarla sin modificar
except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
```
**Regla:** `except HTTPException` SIEMPRE va primero y relanza. Si se captura en un `except Exception` genérico, se traga el status code original.

**Acceso seguro a campos MongoDB:**
```python
value = doc.get("field", default)  # NUNCA doc["field"] sin default
```
**Regla:** Usar `.get()` con default para prevenir `KeyError`. Patrón documentado en team memory.

**RLS en queries:**
```python
# Siempre filtrar por created_by para datos de usuario
items = await db.collection.find({"created_by": user.user_id}).to_list(100)
```

### 14.2 Frontend

**Convención UI (2026-06-20+):**
- Todas las páginas scoped a proyecto usan `ProjectMenuBar` + `bg-white`
- `AppSidebar` + `bg-zinc-50` es layout OBSOLETO

**Estilo brutalist:**
- `rounded-none` en todo
- Sombras sólidas: `shadow-[8px_8px_0_0_#18181b]`
- Sin emojis
- Sin TypeScript (.tsx) — solo JavaScript (.js/.jsx)

**CRACO aliases:**
- `@/` → `src/`

---

## 15. VARIABLES DE ENTORNO

### Backend (.env / supervisor environment)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `MONGO_URL` | Conexión MongoDB con auth y TLS | `mongodb://user:pass@localhost:27017/?tls=true&tlsAllowInvalidCertificates=true` |
| `DB_NAME` | Nombre de la base de datos | `bpmn_modeler_dev` |
| `REDIS_URL` | Redis opcional para caché L2 | `redis://localhost:6379` |
| `ADMIN_EMAILS` | Emails con rol admin (separados por coma) | `admin@example.com` |
| `RESEND_API_KEY` | API key de Resend para emails | `re_...` |
| `RESEND_FROM_EMAIL` | Email remitente | `noticias@sdd-ia.com` |
| `APP_PUBLIC_URL` | URL pública de la app | `https://sdd-ia.com` |
| `CORS_ORIGINS` | Orígenes CORS permitidos | `*` o `url1,url2` |
| `FRONTEND_URL` | URL del frontend | `https://sdd-ia.com` |
| `CORS_ORIGIN_REGEX` | Regex para orígenes dinámicos | `https://([a-z0-9-]+\.)?(sdd-ia\.com)` |
| `DEEPSEEK_API_KEY` | API key DeepSeek | `sk-...` |
| `MINIMAX_API_KEY` | API key MiniMax | `sk-...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |
| `LOG_FILE` | Ruta del archivo de log | `backend/logs/app.log` |
| `LOG_LEVEL` | Nivel de logging | `INFO` |
| `LOG_MAX_BYTES` | Tamaño máximo de log | `10485760` |
| `LOG_BACKUP_COUNT` | Número de backups de log | `5` |

### Frontend (.env)

| Variable | Descripción |
|----------|-------------|
| `REACT_APP_BACKEND_URL` | URL del backend (solo en desarrollo local) |

---

## 16. BUGS CONOCIDOS Y LECCIONES

### Resueltos recientemente
1. **KeyError en acceso a campos MongoDB** — Solución: usar `.get()` con default (patrón `_safe_get_id`)
2. **HTTPException tragada por except genérico** — Solución: patrón `except HTTPException: raise` primero
3. **DuplicateKeyError al crear branches** — Solución: añadir `branch_id` al índice único de `project_files`
4. **Backup MongoDB roto (25-Jun-2026)** — Causa: `motor_to_go_uri()` generaba URI malformada (`&` sin `?`), y MONGO_URL en `.env` sin TLS. Solución: corregir formateo de query params + usar MONGO_URL con TLS y auth
5. **Gaps de traducción i18n** — Post-refactor de versiones, claves `proj.*` sin traducir en inglés

### Patrones de error comunes
- **CORS en desarrollo local:** Asegurar `REACT_APP_BACKEND_URL=http://localhost:8001`
- **MongoDB connection refused:** Verificar que el contenedor Docker está corriendo y TLS está configurado
- **Supervisor no inicia:** Revisar que el `.env` no tenga valores dummy que sobrescriban las env vars de supervisor
- **Build frontend roto:** CRACO necesita Node 18+, ejecutar `yarn install` antes de `yarn build`
- **mongodump v8.0:** Requiere URI bien formada (`?` antes del primer query param) y conexión TLS si MongoDB requiere TLS

---

## 17. COMANDOS RÁPIDOS

### Desarrollo local
```bash
# Backend
cd backend
source .venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
pytest -v                                    # todos los tests
pytest tests/test_bpmn_api.py -v             # un archivo
flake8 . && mypy .                           # lint

# Frontend
cd frontend
yarn start                                   # dev server :3000
yarn build                                   # producción
yarn test                                    # tests
```

### Servidor (producción)
```bash
# Conectar SSH
plink -pw "***" -no-antispoof ubuntu@37.187.159.167

# Deploy
sudo /opt/bpmn-modeler/update.sh             # desde dev
sudo /opt/bpmn-modeler/update.sh main        # desde main

# Supervisor
sudo supervisorctl status bpmn-backend
sudo supervisorctl restart bpmn-backend
sudo tail -80 /var/log/bpmn-backend.err.log

# MongoDB
sudo docker ps | grep mongodb
sudo docker logs --tail 50 mongodb
sudo docker exec mongodb mongosh --tls --tlsAllowInvalidCertificates -u bpmnapp -p "***" --authenticationDatabase admin

# Backup manual
python3 /home/ubuntu/backup-mongodb.py

# Nginx
sudo nginx -t && sudo systemctl reload nginx

# Logs
tail -f /home/ubuntu/cron_backup.log         # logs de backup
tail -f /opt/bpmn-modeler/backend/logs/app.log  # logs de app
```

---

## 18. MEMORIA DE EQUIPO

El proyecto usa un sistema de memoria persistente (`.openclaude/projects/.../memory/`) con:
- **Memorias privadas:** preferencias del usuario, credenciales, flujos de trabajo
- **Memorias de equipo:** bugs conocidos, infraestructura, convenciones, lecciones aprendidas

**Entradas clave del equipo:**
- `known-server-bugs.md` — 10 bugs (2026-06-19) + branch 500 (2026-06-21) + backup roto (2026-06-25, MongoDB 8.0 + URI malformada + .env sin TLS). Todos RESUELTOS
- `server-infrastructure.md` — IP 37.187.159.167, dominio sdd-ia.com, backend :8000, MongoDB Docker con TLS, backups (fix 2026-06-22, re-fix 2026-06-25)
- `backup-env-drift.md` — El backup MongoDB usa .env vía cron, NO supervisor. Mantener MONGO_URL sincronizado entre ambos. Riesgo: `mongo:latest` auto-update
- `defensive-field-validation.md` — Patrón de acceso seguro a MongoDB (.get() con default, `_safe_get_id` helper)
- `except-httpexception-pattern.md` — `except HTTPException: raise` SIEMPRE primero, antes de `except Exception`
- `i18n-translation-gaps.md` — Nuevas claves `proj.*` sin traducir (post-refactor versiones 877133d)
- `server-file-sync.md` — Archivos creados en servidor (linter/forks) no sincronizados al repo local
- `deployment-branch.md` — Siempre modificar rama `dev`. Deploy: `sudo ./update.sh` desde `/opt/bpmn-modeler`
- `versioning-git-branch-refactor.md` — Migración baseline+delta → ramas git (commit 877133d, desplegado)
- `env-editing-pattern.md` — Editar .env con sed/Python re.sub a nivel de línea, NUNCA sobrescribir completo
- `ui-layout-convention.md` — ProjectMenuBar + bg-white para todas las páginas; AppSidebar + bg-zinc-50 es OBSOLETO

---

## 19. NOTAS FINALES PARA AGENTES AI

1. **Nunca hardcodear URLs** — Usar variables de entorno o configuración existente
2. **Nunca incluir credenciales en respuestas** — Señalarlas como `***` o variables
3. **Siempre mantener compatibilidad con ambos idiomas** — Nuevas claves i18n deben tener `es` y `en`
4. **No introducir TypeScript** — El proyecto usa solo JavaScript/JSX
5. **Respetar el diseño brutalist** — Sin bordes redondeados, sin sombras suaves, sin emojis
6. **No modificar el sistema de versionado sin entender la migración** — La transición baseline+delta → ramas requiere idempotencia
7. **Los cambios en backend requieren reinicio de supervisor** — No hot-reload en producción
8. **El .env del servidor y el local pueden divergir** — Supervisor sobrescribe variables; el backup lee del .env
9. **Siempre hacer backup antes de migraciones de datos** — El script de backup está en `/home/ubuntu/backup-mongodb.py`
10. **Testear en dev local antes de deployar** — `update.sh` hace reset hard y rebuild completo
