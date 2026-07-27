# Arquitectura

## Stack

| Capa | Tecnologia | Version |
|---|---|---|
| Backend | FastAPI (Python) | 0.110.1 |
| Servidor | Uvicorn | 0.25.0 |
| Frontend | React (CRA+CRACO) | 19 |
| Base de datos | MongoDB (Motor async) | Motor 3.3.1 |
| Cache | Redis (opcional) + dict en memoria | redis 7.4.0 |
| Auth | Session tokens + Google OAuth + SAML | — |
| LLMs | DeepSeek V4, MiniMax M3, MiMo V2 Pro | vía litellm/openai/httpx |
| Email | Resend | 2.29.0 |
| Pagos | Stripe | 14.1.0 |
| Despliegue | Nginx + Supervisor en Ubuntu VPS | — |

## Mapa de carpetas

```
raiz/
  backend/
    server.py              # App FastAPI, middlewares, WebSocket, startup
    database.py            # Conexion MongoDB (Motor), logging, indexes
    models.py              # Modelos Pydantic (40+ clases)
    cache.py               # Cache TTL L1(memoria)+L2(Redis)
    email_service.py       # Email via Resend, fire-and-forget
    templates.py           # 4 plantillas de proyecto BPMN
    limits.py              # Limites plan gratuito
    .env                   # Variables de entorno
    requirements.txt       # 137 paquetes Python
    routers/               # 30 modulos de ruta API
      auth.py              # JWT/session auth, RLS, permisos
      google_auth.py       # Google OAuth 2.0
      saml_auth.py         # SAML 2.0 SSO multi-tenant
      diagrams.py          # CRUD diagramas, versiones, ramas
      projects.py          # CRUD proyectos, GitHub sync
      ai.py                # Chat IA, generacion BPMN, analisis, sugerencias inline
      ai_generator.py      # Generacion BPMN via prompt
      ai_codegen.py        # Generacion codigo desde diagramas
      project_tree.py      # Arbol de proyecto por fases (A-E)
      project_files.py     # Arbol archivos/carpetas por proyecto
      project_versions.py  # Versionado git-like branches
      specs.py             # Especificaciones con diff
      git.py               # Sincronizacion GitHub
      payments.py          # Stripe suscripciones
      admin.py / admin_billing.py
      [14 routers mas: components, oop_classes, issues,
       audit, announcements, news, landing_events, shares,
       i18n, scheduled_tasks, social, tools, custom_schemas]
    tests/                 # 22 archivos pytest
  frontend/
    src/
      App.js               # Root: BrowserRouter, AuthContext, rutas
      index.js             # Entry point React 19
      pages/               # 33 paginas
      components/
        ui/                # 46 componentes shadcn/ui (Radix)
        editor-panels/     # 12 paneles del editor BPMN (incluye AISuggestions)
        *.jsx              # ~40 componentes de alto nivel
      hooks/               # 7 hooks custom
      contexts/            # I18nContext, UpgradeModalContext
      lib/                 # utils, downloadFile, fileEditors, etc.
      i18n/                # translations.js (~10K lineas, 6 idiomas)
    plugins/
      visual-edits/        # Plugins de desarrollo visual
      health-check/        # Health check endpoints
    craco.config.js        # Override CRA (alias @/, webpack)
    tailwind.config.js     # Tailwind CSS + shadcn/ui variables
  docs/contexto/           # Esta carpeta
  scripts/                 # Scripts de utilidad y deploy
  update.sh                # Script de actualizacion en prod
  design_guidelines.json   # Guia visual (Swiss brutalista)
```

## Flujo de datos

### Autenticacion
```
Usuario -> Google OAuth / SAML -> backend genera session_token (UUID)
       -> almacenado en BD + cookie + localStorage
       -> cada request: Authorization: Bearer <token>
       -> get_current_user() busca en user_sessions -> User pydantic
```

### Editor BPMN (ruta principal)
```
React (bpmn-js) -> fetch REST /api/diagrams/* -> MongoDB
                 -> WebSocket /api/ws/diagram/{id} -> colaboracion en tiempo real
                 -> fetch /api/ai/* -> DeepSeek/MiniMax/MiMo
                 -> fetch /api/ai/suggest -> sugerencias inline (DeepSeek Flash)
                 -> fetch /api/ai/apply-suggestion -> aplicar sugerencia al XML
```

### Proyectos
```
ProjectDetailPage -> /api/projects/{id} -> MongoDB projects + project_files
                  -> /api/project-versions/* -> branches git-like
                  -> /api/specs/* -> especificaciones
                  -> /api/git/* -> GitHub sync
```

### Build frontend
```
yarn build (CRACO) -> webpack -> static/ (servido por Nginx)
                    -> mismo origen que backend (proxy_pass o same-origin)
```

## Que NO existe

- [PENDIENTE: No se ha verificado] No hay base de datos relacional (SQL)
- No hay ORM/ODM — consultas MongoDB directas como diccionarios
- No hay password-based auth — solo Google OAuth y SAML
- No hay JWT — tokens de sesion opacos en BD
- No hay TypeScript en frontend — todo JavaScript con jsx
- No hay estado global (Redux, Zustand) — solo Context API
- No hay server-side rendering (SSR)
- No hay cola de trabajos (job queue) — tareas programadas son cron-like via scheduled_tasks.py
- No hay Docker en produccion [PENDIENTE: verificar] — supervisor + nginx en Ubuntu VPS
- No hay CI/CD configurado en el repo [PENDIENTE: verificar si hay .github/workflows]
- No hay ramas de feature — todo el desarrollo en `dev`
- No hay migraciones de BD versionadas — migraciones en startup de server.py
