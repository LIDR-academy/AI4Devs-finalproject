# Convenciones

## Estilo de codigo

### Backend (Python)
- **Formato:** `snake_case` para funciones/variables, `PascalCase` para clases, `SCREAMING_SNAKE_CASE` para constantes
- **Async:** todos los endpoints usan `async def`
- **Modelos:** Pydantic v2 con `ConfigDict(extra="ignore")`
- **IDs:** UUIDs v4 como strings, generados con `uuid.uuid4()` o `.hex[:12]` con prefijo
- **Fechas:** ISO strings (`.isoformat()`), timezone-aware (`datetime.now(timezone.utc)`)
- **Linting:** flake8, mypy, black, isort (en requirements.txt pero [PENDIENTE: verificar si se usan activamente])
- **Copyright:** `Copyright (c) 2026 sdd-ia, LLC. All rights reserved.` en cada archivo
- **Idioma:** codigo y comentarios en espanglish (mezcla espanol/ingles)

### Frontend (JavaScript/React)
- **Formato:** `PascalCase` para componentes, `camelCase` para hooks/funciones/variables
- **Extensiones:** `.jsx` para componentes, `.js` para hooks/utilidades
- **Sin TypeScript:** `"tsx": false` en components.json
- **Imports:** alias `@/` para `src/` (ej. `@/components/ui/button`)
- **Copyright:** `Copyright (c) 2026 sdd-ia, LLC. All rights reserved.` en cada archivo
- **Linting:** ESLint 9 con plugins react, react-hooks, jsx-a11y, import
- **Idioma:** UI en espanol, codigo en ingles

## Patrones que usamos

### Backend
- **Fire-and-forget:** email (`send_email`) y auditoria (`record_audit`) nunca lanzan excepcion
- **Lazy imports:** dentro de funciones para evitar circular imports entre routers
- **Model dump antes de insert:** `doc = model.model_dump(); insert_doc = doc.copy()` — copia defensiva
- **Thread pool para LLMs:** SDKs sync de openai/httpx ejecutados en `asyncio.to_thread()`
- **RLS manual:** `rls_filter(user)` anade filtro `created_by` a queries MongoDB
- **Migraciones en startup:** checks idempotentes en `@app.on_event("startup")`
- **Sin response_model:** la mayoria de endpoints devuelven dicts, no modelos Pydantic tipados
- **Proyeccion:** siempre excluyen `_id` con `{"_id": 0}`

### Frontend
- **Fetch nativo:** no se usa axios (aunque esta en dependencias). Sin wrapper centralizado.
- **Auth centralizada:** `lib/api.js` exporta `getAuthHeaders()` con Content-Type + Bearer token (migrado 2026-07-06). Paginas antiguas pueden tener `authHeaders()` inline.
- **useI18n().t():** TODOS los textos visibles usan la funcion `t()` de internacionalizacion
- **shadcn/ui new-york style:** componentes Radix wrappeados con `cn()` y `cva()`
- **data-testid:** en casi todos los elementos interactivos
- **3 fuentes:** Chivo (headings), Work Sans (body), IBM Plex Mono (labels/code/mono)
- **Sin emojis** (prohibido en design_guidelines.json)
- **Estilo brutalista (original):** `rounded-none`, `border-2`, sombras solidas `shadow-[8px_8px_0_0_#18181b]`
  - NOTA: El diseno esta migrando hacia un estilo mas moderno con `rounded-lg`, glass effects, ghost buttons (ver team memory "Modern UI design direction")
- **Glassmorphism (nuevo):** clases CSS reutilizables en `index.css`: `.glass-card`, `.ai-glow`, `.gradient-text`, `.bg-tech-pattern`
- **Colores landing:** tokens Tailwind `deep-navy`, `electric-cyan`, `soft-glass`, `accent-glow` (solo en landing page)

### Commits
- **Convencion actual:** Conventional Commits (`feat:`, `fix:`, `i18n:`, `chore:`)
- **Adoptado:** mediados de mayo 2026 (~commit #250)
- **Antes:** mensajes libres en lenguaje natural, a veces con prefijo `@`
- **Auto-commits:** 203 commits (45%) generados por agente IA con formato `auto-commit for <UUID>`
- **Rama activa:** `dev` (NO hacer commit directo a `main`)
- **Frecuencia:** ~4-5 commits/dia en periodos activos

### Tests
- **Framework:** pytest 9.0.2 + pytest-asyncio 1.3.0
- **Tipo:** tests de integracion contra API real (no mocks de MongoDB/LLM)
- **Auth:** fixture `auth_headers` que hace `dev-login` y retorna token Bearer
- **Modificacion de DB:** usan `pymongo.MongoClient` directo para cambiar roles/estado entre tests

## Patrones prohibidos

- No usar TypeScript en frontend
- No usar emojis en UI
- No usar imagenes externas (design_guidelines.json)
- No usar rounded corners en componentes (estilo brutalista original, aunque esta cambiando)
- No hacer commit directo a `main` — siempre via `dev`
- No usar ORM/ODM para MongoDB — consultas directas
- No usar password-based auth — solo OAuth/SAML

## Naming

| Que | Convencion | Ejemplo |
|---|---|---|
| Rutas API | `kebab-case` | `/generate-code`, `/scheduled-tasks` |
| Archivos Python | `snake_case.py` | `project_files.py` |
| Componentes React | `PascalCase.jsx` | `ProjectDetailPage.jsx` |
| Hooks | `usePascalCase.js` | `useCollaboration.js` |
| Contextos | `PascalCase` + Context | `I18nContext` |
| Claves i18n | `namespace.key` | `"proj.export"`, `"common.cancel"` |
| Colecciones MongoDB | `snake_case` | `project_files`, `ai_usage` |
| Ramas git | `kebab-case` o convencional | `dev`, `main`, `version-1.0` |
