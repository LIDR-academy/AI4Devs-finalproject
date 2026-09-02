---
document: stack_manifest
version: 1.13.0
status: approved
approved_by: "Jose Lacruz <lacruzjd@gmail.com>"
approved_at: "2026-09-02"
authority: "Fuente Única de Verdad (SSoT) para decisiones tecnológicas de agentes IA"
---

# 📦 Stack Manifest — Fuente Única de Verdad del Stack Tecnológico

> **⚠️ DIRECTIVA PARA AGENTES IA (Guard 24):**  
> Este archivo es la **Fuente Única de Verdad (SSoT)** del stack tecnológico del proyecto.  
> Ningún Skill de `.agents` puede asumir, recomendar o generar código usando herramientas,  
> versiones o comandos que NO estén declarados y aprobados aquí.  
> Si una herramienta no aparece en este manifiesto → **DETENTE y solicita aprobación humana**.

---

## 🛠️ 1. Runtime y Gestión de Paquetes

| Componente | Tecnología | Versión | Notas |
|:-----------|:-----------|:-------:|:------|
| **Runtime Backend** | Node.js | **24 LTS** (`lts/*`) | Guard 23: prohibido <24 |
| **Package Manager** | pnpm | **9.x** | Monorepo workspaces |
| **Workspace Manager** | pnpm workspaces | — | `apps/backend`, `apps/frontend` |

---

## 💻 2. Backend

| Componente | Tecnología | Versión | Notas |
|:-----------|:-----------|:-------:|:------|
| **Lenguaje** | TypeScript | **5.x** | `strict: true` obligatorio |
| **Framework HTTP** | Express.js | **4.x** | Sin frameworks adicionales |
| **Validación & Sanitización** | Zod | **3.x** | Activo en todos los endpoints HTTP |
| **Precisión Aritmética** | decimal.js | **10.x** | Obligatorio para stock, cantidades y costos |
| **Cifrado** | bcrypt | **5.x** | PIN/password hashing (cost 10) |
| **Autenticación** | JWT (jsonwebtoken) | **9.x** | Access Token ≤15 min |
| **Cabeceras de Seguridad** | Helmet | **7.x** | HSTS, X-Frame-Options, X-Content-Type-Options |


---

## 🗄️ 3. Persistencia y Base de Datos

| Componente | Tecnología | Versión | Notas |
|:-----------|:-----------|:-------:|:------|
| **Base de Datos** | PostgreSQL | **15** | Decimal(12,4) para cantidades físicas |
| **ORM** | Prisma ORM | **5.x** | Migrations en `apps/backend/prisma/` |
| **Repositorios de Test** | InMemory Fakes | — | Nunca mocks; siempre fakes tipados |
| **Seeds** | `prisma/seed.ts` | — | Idempotente con `upsert`; verificado con Postgres real vía `check_seed_idempotency.sh` (TK-055) si el ticket lo toca |
| **Schema Drift Detector** | Script propio (`check_schema_drift.sh`) | — | Compara `schema.prisma` vs. `docs/03_persistence_and_api/06_database_schema.md` §4 (TK-055) |

---

## 🎨 4. Frontend

| Componente | Tecnología | Versión | Notas |
|:-----------|:-----------|:-------:|:------|
| **Framework UI** | React | **18** | Hooks + Functional Components |
| **Bundler** | Vite | **5.x** | Dev server + production build |
| **Routing** | react-router-dom | **7.18.3** | Data router (`createBrowserRouter` + `RouterProvider`). Pin exacto, dist-tag `version-7`, `peerDependencies.react >=18` — **`react-router` v8.x exige React 19 → prohibido** hasta un bump de React aprobado (Guard 24). Shell de rutas de nivel superior + `<ProtectedRoute>` por rol (`US-023`/`TK-085-FE`) |
| **Estilos** | Vanilla CSS + CSS Modules | — | Sin Tailwind ni CSS-in-JS. Tokens y utilidades compartidas en `index.css`; estilos de un solo componente en `Componente.module.css` colocado junto al `.tsx` |
| **Touch Targets** | — | — | Mínimo **48px** (WCAG 2.1 AAA) |
| **Offline Queue** | IndexedDB | — | Para operaciones sin conexión |

---

## 🧪 5. Testing

| Componente | Tecnología | Versión | Notas |
|:-----------|:-----------|:-------:|:------|
| **Test Runner** | Vitest | **1.x** | Backend y Frontend |
| **Testing Library** | React Testing Library | **14.x** | Para componentes React |
| **E2E Browser** | Playwright | **1.x** | Page Object Model (POM) obligatorio |
| **Mutation Testing** | Stryker | **8.x** | Score mínimo ≥70% |
| **Comando de Tests** | `pnpm test` | — | Ejecuta todos los workspaces |

---

## 🔍 5.1 Calidad de Código y Linting

| Componente | Tecnología | Versión | Notas |
|:-----------|:-----------|:-------:|:------|
| **Linter (Backend)** | ESLint | **9.x** (flat config) | `@eslint/js` recommended + `typescript-eslint` recommended |
| **Linter (Frontend)** | ESLint | **9.x** (flat config) | + `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y` (WCAG 2.2) |
| **Comando de Lint** | `pnpm run lint` | — | `tsc --noEmit && eslint .` en cada workspace — el type-check NO reemplaza al linter |
| **Duplication Detector** | jscpd | **5.x** | Umbral 3% (`.jscpd.json`), **bloqueante** en CI vía `pnpm run duplication` |
| **Dead Code Detector** | knip | **6.x** | Guard 5, gate acotado al diff vía `check_dead_code.sh` (TK-055) |

> **Nota histórica (TK-033):** hasta esta versión, `pnpm run lint` era un alias de `tsc --noEmit` sin ningún linter real detrás — el gate de calidad reportaba "0 errores" sin poder detectar duplicación de estilos, `any` inseguros, ni violaciones de accesibilidad. Corregido instalando ESLint real en ambos workspaces.
>
> **Nota histórica (TK-036):** `complexity`, `max-lines-per-function` (≤60) y `max-depth` (≤4) están activas en ambos `eslint.config.*` pero en severidad `warn` — **informativas a nivel de repositorio completo**, por deuda preexistente: 8 advertencias reales en backend (`runSeed`, `ConsumeRecipeUseCase.execute`, `PerformShiftReconciliationUseCase.execute`, `createApp`, `InMemoryRemanenteQueryRepository.findActiveRemanentes`) y 15 en frontend (sobre todo componentes React donde JSX infla el conteo de líneas). La duplicación de código (`jscpd`), en cambio, es bloqueante desde ya a nivel repositorio: el baseline real (1.68%) ya cumple el umbral con margen.
>
> **Nota histórica (TK-037):** activar `complexity`/`max-lines-per-function`/`max-depth` como bloqueantes a nivel repositorio rompería `pnpm run lint` para cualquier ticket futuro sin relación con la deuda existente. En su lugar, `docs/04_governance_and_quality/scripts/check_ticket_code_quality.sh` las hace **bloqueantes acotadas al diff del ticket en curso** (archivos sin commitear — working tree + staged): deuda preexistente en archivos no tocados nunca bloquea, pero código nuevo/modificado sí se exige limpio. Wireado en `SK-16`, `SK-17`, `SK-19` y `04_dev_audit_workflow.md`. En una regeneración completa del proyecto desde cero, todo archivo es "nuevo" en el ticket que lo crea — este mecanismo, aplicado ticket a ticket, produce un repositorio limpio por construcción sin exigir pagar deuda retroactiva.
>
> **Nota histórica (TK-038):** `check_contract_drift.sh`, `profile_test_suite.sh` y `check_ticket_code_quality.sh` viven en `docs/04_governance_and_quality/scripts/`, no en `.agents/scripts/` — están acoplados al stack de este proyecto (TypeScript, ESLint, Vitest) y `.agents/scripts/` es el payload que `install.sh` copia verbatim a cualquier proyecto nuevo sin importar su stack. Son generados por `SK-27` a partir de este manifiesto; regenerar tras un cambio de stack, no editar a mano asumiendo que sean portables.
>
> **Nota histórica (TK-042, Guard 25):** el pipeline CI/CD (`ci.yml`) validaba `.agents/`, el contrato OpenAPI y la frescura de reglas, pero no existía ningún gate que verificara que las herramientas DevSecOps de la sección §6 de este manifiesto (`gitleaks`, `trivy`) estuvieran realmente wireadas como steps ejecutables, ni que los `Dockerfile`/`docker-compose.yml`/módulos `infrastructure/opentofu/*.tf` cumplieran Guard 22/23 (runtime pineado, usuario no-root, sin secretos hardcodeados) — una auditoría manual detectó los tres Dockerfiles/IaC existentes en `node:20-alpine` (viola Guard 23), corriendo como root, y con `JWT_SECRET`/`POSTGRES_PASSWORD` en texto plano en `docker-compose.yml` e `infrastructure/opentofu/main.tf`. Corregido con dos scripts nuevos generados por `SK-27` (1.2.0→1.3.0): `check_container_security.sh` (gate **bloqueante acotado al diff del ticket en curso**, mismo criterio que `check_ticket_code_quality.sh` de TK-037 — deuda preexistente en Dockerfile/IaC no tocados por el ticket no bloquea) y `check_devsecops_manifest_coverage.sh` (gate **informativo a nivel de repositorio**, mismo criterio que `check_rules_freshness.sh` — declarar una herramienta DevSecOps sin wirearla en CI es una alerta, no motivo de build rojo). Wireados en `SK-10` (3.4.1→3.5.0, Job 0 y Non-Goals), `04_dev_audit_workflow.md` FASE 4, y en `ci.yml` (solo el gate informativo — el gate acotado al diff no aplica en un checkout de CI, donde no existe "diff sin commitear"). Nuevo Guard 25 en `AGENTS.md` codifica ambos gates como innegociables. Los 3 hallazgos concretos (Node 20, root, secretos en texto plano) quedan como deuda preexistente a corregir ticket a ticket — este mecanismo, igual que TK-037, produce contenedores limpios por construcción sin exigir pagar deuda retroactiva del repo actual.
>
> **Nota histórica (TK-043, Guard 25):** cierre de los 2 pendientes de TK-042 (auditoría de dependencias bloqueante + migraciones automáticas), con 4 lecciones que el agente debe recordar antes de repetir este trabajo en otro proyecto/stack:
> 1. **`pnpm audit --ignore <GHSA>` y `pnpm-workspace.yaml#auditConfig.ignoreGhsas` son features de versiones de pnpm POSTERIORES a la 9.x pineada aquí** — el entorno de desarrollo del agente puede tener una versión de pnpm más nueva que sí los soporta, dando una falsa sensación de que funcionan. Verificado en vivo con `corepack prepare pnpm@9 --activate`: pnpm 9 no reconoce ninguno de los dos. Corregido con `docs/04_governance_and_quality/scripts/check_dependency_audit.sh` (generado por `SK-27`, 1.3.0→1.4.0), que reimplementa el ignore-por-GHSA a mano con una lista `ALLOWED_GHSAS` documentada y justificada. Riesgo residual aceptado hoy: `GHSA-fx2h-pf6j-xcff` (Vite `server.fs.deny` bypass) y `GHSA-5xrq-8626-4rwp` (RCE vía Vitest UI) — ambos exclusivos del dev-server/UI de las propias herramientas de build/test, nunca ejecutados en `Dockerfile`/`ci.yml`; el fix real exige Vite 6/Vitest 3 (bump de major fuera del alcance de un parche de seguridad, pendiente de aprobación humana bajo Guard 24).
> 2. **`pnpm.overrides` en pnpm 9.x vive en `package.json#pnpm.overrides`, NO en `pnpm-workspace.yaml#overrides`** (la migración a `pnpm-workspace.yaml` es de una versión de pnpm posterior a la pineada) — mismo patrón que la lección 1: verificar SIEMPRE la versión pineada real, no la del entorno del agente, antes de asumir dónde vive una config. Usado para parchear `nanoid`→`3.3.18` y `tmp`→`0.2.7` (2 de las 4 vulnerabilidades originales de TK-042 sí tenían fix real dentro del mismo major).
> 3. **Los overrides de pnpm deben pinear una versión EXACTA, nunca un rango abierto (`>=x.y.z`)** — un rango abierto resuelve la "ultima disponible" en cada instalación (no determinista): la primera vez que se probó esto, `nanoid` saltó de 3.x a 6.x sin querer, y ese resultado no reproducible entre dos instalaciones distintas produce `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH` en `--frozen-lockfile` (exactamente el comando que usa el `Dockerfile` de producción).
> 4. **`node:24-alpine` (Alpine 3.24) no incluye el binario CLI `openssl`** (solo la librería `libssl.so.3`) — la detección de plataforma de Prisma 5.x lo ejecuta (`openssl version -v`) para decidir qué motor OpenSSL-3 usar, y sin él elige mal **dos binarios distintos e independientes**: el *query-engine* (usado por `@prisma/client` en cada request) y el *schema-engine* (usado solo por `prisma migrate`/`db push`) — arreglar uno no arregla el otro. Corregido con `RUN apk add --no-cache openssl` en el `Dockerfile` (antes de `pnpm install`, para que la descarga del motor correcto ocurra en build-time) MÁS la resolución explícita en runtime vía `PRISMA_QUERY_ENGINE_LIBRARY` y `PRISMA_SCHEMA_ENGINE_BINARY` en `apps/backend/docker-entrypoint.sh` (la detección automática de Prisma sigue fallando en runtime incluso con el binario correcto ya descargado — no confíes en que arreglar la detección en build-time sea suficiente).
>
> Nuevo `apps/backend/docker-entrypoint.sh` (patrón documentado en `SK-27`/`backend_rules.md`): aplica `prisma migrate deploy` antes de arrancar el servidor — Fail-Fast si las migraciones no aplican, en vez de servir tráfico contra un esquema desactualizado. Validado extremo a extremo contra un Postgres real vía `docker compose up` (contenedor `healthy`, `/health` → 200). `SK-23` (1.0.0→1.1.0) gana la Fase 3 (Riesgo Residual Documentado) para que futuras dependencias vulnerables sin fix disponible sigan el mismo patrón en vez de bloquear el pipeline indefinidamente o forzar un bump de major sin aprobación humana. `SK-10` (3.5.0→3.6.0) documenta el patrón de entrypoint con migraciones en su Job 4.
>
> **Nota histórica (TK-044, Guard 25):** `gitleaks`/`trivy` estaban wireados en `ci.yml` pero con `continue-on-error: true` sin validar nunca contra un binario real (TK-042/043). Instalados y ejecutados en vivo contra este repo: **`trivy image` reportó 34 CVEs High/Critical en la imagen backend** (25 del binario Go de `esbuild`, arrastrado por `vite`/`vitest` como devDependencies copiadas — sin querer — a la imagen final de producción; el resto, CVEs del `npm` bundleado en `node:24-alpine`, nunca ejecutado porque el proyecto usa `pnpm`) **y 35 en la imagen frontend** (`nginx:1.27-alpine` fijo en Alpine 3.21, desactualizado). Corregido con: (1) stage `deps-prod` en `apps/backend/Dockerfile` — reinstala SOLO `dependencies` (`pnpm install --frozen-lockfile --prod`) para el runner, en vez de copiar el `node_modules` completo del builder (que incluye devDependencies); `prisma` se movió de `devDependencies` a `dependencies` en `apps/backend/package.json` porque `docker-entrypoint.sh` sí lo necesita en producción; (2) eliminación explícita del `npm`/`npx`/`corepack` bundleados en la imagen runner (superficie nunca usada); (3) base `nginx:stable-alpine` (Alpine 3.24, 0 CVEs) en vez de `nginx:1.27-alpine`. Validado en vivo: `trivy image --severity CRITICAL,HIGH --exit-code 1` → 0 en ambas imágenes. **`gitleaks git .`** sobre el historial completo reportó 12 hallazgos, los 12 falsos positivos verificados manualmente (JWT_SECRET de fixtures de test en `ci.yml`/un unit test, y ejemplos decorativos de tokens JWT en `readme.md`/`docs/`/`prompts.md`) — allowlisted por fingerprint exacto (no por regla completa) en nuevo `.gitleaksignore`. Ambos steps de `ci.yml` ahora **bloqueantes de verdad**, no informativos. `HUSKY=0` + `"prepare": "husky || true"` en `package.json` raíz corrigen un efecto colateral: el `prepare` script de husky (git hooks locales) fallaba en un `pnpm install --prod` dentro de Docker porque `husky` es devDependency y no existe `.git` en la imagen.
>
> **Nota histórica (TK-045, Guard 22):** todo el trabajo de validación de TK-042/043/044 se hizo contra `docker-compose.yml`; `infrastructure/opentofu/main.tf` — el único artefacto que Guard 22 reconoce como "aprovisionamiento declarativo" — nunca se re-ejecutó tras esos cambios y quedó roto: `docker_container.frontend` mapeaba `internal = 80` (el `Dockerfile` del frontend pasó a escuchar en 8080 al endurecerse como no-root en TK-042); `docker_container.backend` no declaraba `DATABASE_URL` (obligatorio, sin default) ni `CORS_ALLOWED_ORIGINS` (Guard 14 aborta el arranque en producción sin él); y no existía ningún `docker_container.postgres` — el backend no tenía base de datos a la que conectarse. Corregido y **validado con el binario OpenTofu real** (no solo HCL escrito a mano): `tofu validate` limpio, `tofu plan` (8 recursos, 0 errores) y `tofu apply` real contra el daemon Docker — `postgres`/`backend` se crearon y arrancaron correctamente (confirma que el wiring de `DATABASE_URL`/`CORS_ALLOWED_ORIGINS`/el nuevo recurso `postgres` es correcto); `frontend` falló solo por un conflicto de puerto 80 preexistente del host de validación, no por la configuración. `restart = "unless-stopped"` añadido a los 3 contenedores (ausente hasta ahora — sin él, un crash por condición de carrera con Postgres no reiniciaba). `.gitignore` (nuevo bloque) evita que `*.tfstate` — que puede contener secretos resueltos en texto plano — se commitee por accidente.
>
> **Nota histórica (TK-046, Guard 14/16):** una auditoría de "¿está configurado profesionalmente el manejo de variables de entorno?" encontró que **dos variables se validaban rigurosamente (Fail-Fast) pero nunca se leían en el código real** — validación sin efecto, falsa sensación de control: (1) `CORS_ALLOWED_ORIGINS` — `app.use(cors())` se llamaba sin argumentos, permitiendo cualquier origen sin importar el valor configurado/validado; (2) `RATE_LIMIT_WINDOW_MS`/`RATE_LIMIT_MAX_REQUESTS` — ningún middleware las leía; la única limitación real era el limiter hardcodeado del endpoint de login. Corregido en `app.ts`: `cors({ origin: ... })` ahora parsea `CORS_ALLOWED_ORIGINS` (lista separada por comas, o `"*"` fuera de producción) y lo aplica de verdad; nuevo rate limiter global montado en `/api/v1/*` alimentado por las variables ya validadas, sin tocar el limiter específico del login (mantenerlo hardcodeado en 10/15min evita debilitar la protección anti-fuerza-bruta a los 100/15min por defecto del limiter general). Bug adicional destapado al cablear el segundo limiter: `rateLimiter.ts` guardaba su `store` a **nivel de módulo**, compartido entre todas las instancias — dos limiters activos a la vez habrían contaminado su conteo mutuamente; corregido moviendo el `store` al closure de `createRateLimiter()`. Verificado con smoke tests reales (no solo tests unitarios): origen permitido → header CORS reflejado; origen no permitido → sin header; `/api/v1/*` → 429 al superar el límite configurado; `/health` → nunca limitado (fuera del scope `/api/v1`). `docker-compose.yml`/`infrastructure/opentofu/main.tf`/`.env.example` ganan `RATE_LIMIT_WINDOW_MS`/`RATE_LIMIT_MAX_REQUESTS` con defaults seguros si se omiten.
>
> **Nota histórica (TK-085-FE, `US-023` — adopción de routing):** hasta la v1.13.0 el frontend era una sola página con paneles/modales superpuestos y **sin librería de routing** (`grep` de `react-router` sobre `apps/frontend/src/` → 0 resultados). La lámina "Aplicación" de la propuesta Sistema FEFO (artefacto de diseño validado por el humano, `US-022`) introduce una nav de nivel superior (Inventario / Estaciones / Recetas / Reportes / Ajustes) que exige rutas reales. Decisión del humano (2026-09-02): adoptar `react-router-dom@7.18.3` con data router (`createBrowserRouter` + `RouterProvider`). Se descartó `react-router@8.x` porque su `peerDependencies.react` es `>=19.2.7` — incompatible con el React 18 pineado en §4, y subir React es un bump mayor fuera del alcance de este trabajo (Guard 24). Verificado en vivo contra `registry.npmjs.org` (Guard 30): `react-router-dom@7.18.3` existe, dist-tag `version-7`, `peerDependencies.react >=18`. `TK-085-FE` migra los accesos administrativos de `AdminDropdownMenu` a rutas protegidas (`<ProtectedRoute requiredRole="ADMIN">` para Reportes y Ajustes); las operaciones transitorias (Extraer, Preparar Receta, Conciliar Turno, Descartar) siguen como modales lanzados desde su ruta padre. Las reglas de codificación viven en `docs/04_governance_and_quality/rules/react-router_rules.md` (generado por `SK-27` desde `reactrouter.com`, Guard 34 — fuente confirmada por el humano).
>
> **Nota histórica (TK-055, Plan de Gobernanza `.agents` v2.4.0):** un plan inicial de 9 mejoras de gobernanza proponía 2 scripts nuevos (`check_schema_drift.py`, `check_env_usage.py`) viviendo directo en `.agents/scripts/`, más `npx knip`/`tofu validate`/prueba de seed corriendo dentro de `validate_agents.sh` — revisado y corregido antes de implementar: `check_agnosticism.py` solo escanea `.sh` (un `.py` acoplado al stack habría evadido el propio guard que debía atraparlo), `npx` está literalmente en su lista `BLOCKED_SUBSTRINGS`, y `validate_agents.sh` audita el arnés `.agents/` en sí — nunca ha tocado la BD/IaC de un proyecto consumidor. Los 6 scripts resultantes (`check_schema_drift.sh`, `check_env_usage.sh`, `check_seed_idempotency.sh`, `check_iac_syntax.sh`, `check_dead_code.sh`, y `check_contract_drift.sh` extendido con `oasdiff`) se generaron hacia `docs/04_governance_and_quality/scripts/`, cada uno **verificado en vivo** contra este repo (incluyendo `check_seed_idempotency.sh` corriendo migrate+seed dos veces contra Postgres 15 real en un contenedor efímero, y `check_contract_drift.sh` detectando un breaking change real simulado con `oasdiff breaking --fail-on ERR`). `check_iac_syntax.sh` se probó en la rama feliz (sin binario `tofu`, sin directorio IaC), pero la corrida completa contra HCL real quedó **NO VERIFICADA** en este entorno por un límite de sandbox ajeno al script (falla la verificación de firma del proveedor OpenTofu en este entorno específico; `tofu fmt -check` sí confirma sintaxis HCL válida) — no se marca como aprobado por omisión (Antipatrón B, `rules/04_verified_implementation_standard.md`).

---

## 🚀 6. DevSecOps & Infraestructura

| Componente | Tecnología | Versión | Notas |
|:-----------|:-----------|:-------:|:------|
| **CI/CD Platform** | GitHub Actions | **@v5** | Guard 23: prohibido @v4 o menor |
| **IaC Engine** | OpenTofu | **1.6+** | MPL-2.0; Guard 22: sin scripts manuales |
| **Infraestructura Local** | Docker Compose | **2.x** | PostgreSQL 15 en contenedor |
| **Cloud Auth** | OIDC (OpenID Connect) | — | Guard 23: prohibidas llaves estáticas |
| **Container Registry** | GitHub Container Registry (GHCR) | — | Imágenes inmutables firmadas |
| **API Linter** | @stoplight/spectral-cli | **6.x** | Valida `openapi.yaml` en CI |
| **Secret Scanner** | gitleaks | **8.x** | Escaneo de secretos únicamente — no es SAST (TK-066: corregido mislabel previo, ver Semgrep abajo) |
| **SAST (Static Application Security Testing)** | Semgrep | **1.174.0** | `pip install semgrep==1.174.0` — escanea código fuente de la app (Guard 33), distinto y adicional a gitleaks |
| **Container CVE Scanner** | trivy | **0.5x** | Escaneo de imágenes Docker |
| **SBOM Generator** | cdxgen (`@cdxgen/cdxgen`) | **13.0.1** | CycloneDX; soporta `pnpm-lock.yaml` nativo (workspaces monorepo) — Guard 33 |
| **API Breaking-Change Detector** | oasdiff | **1.29.x** | `check_contract_drift.sh` (TK-055), bloqueante solo si `openapi.yaml` cambió vs. `HEAD` |
| **IaC Syntax Validator (local)** | `tofu validate` | — | `check_iac_syntax.sh` (TK-055) — valida sintaxis HCL antes del push, no reemplaza `tofu plan` contra estado real |

---

## 📋 7. Comandos Canónicos del Proyecto

> Los agentes IA DEBEN usar exclusivamente estos comandos. Prohibido inventar variantes.

```bash
# Instalar dependencias
pnpm install

# Ejecutar todos los tests (backend + frontend)
pnpm test

# Compilar TypeScript (backend + frontend)
pnpm run build

# Linter estático
pnpm run lint

# Detección de duplicación de código (umbral 3%)
pnpm run duplication

# Gate de complejidad/longitud/profundidad acotado al ticket en curso (sin commitear)
bash docs/04_governance_and_quality/scripts/check_ticket_code_quality.sh

# Servidor de desarrollo backend
pnpm --filter @restostock/backend dev

# Servidor de desarrollo frontend
pnpm --filter @restostock/frontend dev

# Levantar el stack completo local (Postgres + Backend + Frontend, imágenes reales de Docker)
docker compose up -d --build

# Bajar el stack completo local
docker compose down

# Migraciones de base de datos
npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma

# Seed de datos (idempotente, requiere SEED_ADMIN_PIN en producción — TK-051)
pnpm --filter @restostock/backend exec tsx prisma/seed.ts

# Validar integridad del framework .agents
bash .agents/scripts/validate_agents.sh

# Validar drift de contrato OpenAPI vs Zod
bash docs/04_governance_and_quality/scripts/check_contract_drift.sh

# Gate de hardening de contenedores/IaC acotado al ticket en curso (sin commitear)
bash docs/04_governance_and_quality/scripts/check_container_security.sh

# Cobertura DevSecOps: herramientas declaradas en este manifiesto vs wireadas en CI (informativo)
bash docs/04_governance_and_quality/scripts/check_devsecops_manifest_coverage.sh

# Auditoría de dependencias (bloqueante salvo riesgo residual documentado)
bash docs/04_governance_and_quality/scripts/check_dependency_audit.sh

# Validar infraestructura OpenTofu (dry-run)
tofu validate && tofu plan
```

### 🌐 URLs de Desarrollo Local (SSoT para skills que infieran un target dinámico)

> Cualquier skill que necesite una URL de servidor (ej. `SK-21`, `08_smoke_test_deploy_validation.md`) DEBE leerla de aquí primero — nunca asumir un puerto por defecto hardcodeado en la skill misma.

| Servicio | URL | Origen |
|:---------|:----|:-------|
| **Backend Dev Server** | `http://localhost:3000` | `PORT` en `apps/backend/.env` (default `3000`, ver `environment.ts`) |
| **Frontend Dev Server** | `http://localhost:5173` | `server.port` en `apps/frontend/vite.config.ts` |

---

## 🚫 8. Tecnologías Explícitamente Prohibidas

> Cualquier sugerencia de las siguientes tecnologías por parte de un agente IA  
> es una violación del Guard 24 y debe ser rechazada sin debate.

| Categoría | Prohibido | Alternativa Aprobada |
|:----------|:----------|:--------------------|
| CSS Framework | Tailwind CSS, Bootstrap | Vanilla CSS Modular |
| ORM alternativo | TypeORM, Drizzle, Sequelize | Prisma ORM 5.x |
| Test Runner | Jest, Mocha, Jasmine | Vitest 1.x |
| Runtime | Bun, Deno, Node <24 | Node 24 LTS |
| IaC | Terraform (propietario BSL), scripts manuales | OpenTofu (MPL-2.0) |
| CI auth | AWS_SECRET_ACCESS_KEY, llaves estáticas | OIDC tokens efímeros |
| Package Manager | npm, yarn | pnpm 9 |
| Routing | `react-router` v8.x (exige React 19), TanStack Router, Next.js App Router | react-router-dom 7.18.3 |

---

*Este manifiesto es aprobado por el humano responsable del proyecto. Cualquier modificación requiere revisión y aprobación explícita antes de que los agentes IA puedan aplicar los nuevos valores.*
