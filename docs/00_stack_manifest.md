---
document: stack_manifest
version: 1.4.0
status: approved
approved_by: "Jose Lacruz <lacruzjd@gmail.com>"
approved_at: "2026-08-19"
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

---

## 🗄️ 3. Persistencia y Base de Datos

| Componente | Tecnología | Versión | Notas |
|:-----------|:-----------|:-------:|:------|
| **Base de Datos** | PostgreSQL | **15** | Decimal(12,4) para cantidades físicas |
| **ORM** | Prisma ORM | **5.x** | Migrations en `apps/backend/prisma/` |
| **Repositorios de Test** | InMemory Fakes | — | Nunca mocks; siempre fakes tipados |
| **Seeds** | `prisma/seed.ts` | — | Idempotente con `upsert` |

---

## 🎨 4. Frontend

| Componente | Tecnología | Versión | Notas |
|:-----------|:-----------|:-------:|:------|
| **Framework UI** | React | **18** | Hooks + Functional Components |
| **Bundler** | Vite | **5.x** | Dev server + production build |
| **Estilos** | Vanilla CSS Modular | — | Sin Tailwind ni CSS-in-JS |
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

> **Nota histórica (TK-033):** hasta esta versión, `pnpm run lint` era un alias de `tsc --noEmit` sin ningún linter real detrás — el gate de calidad reportaba "0 errores" sin poder detectar duplicación de estilos, `any` inseguros, ni violaciones de accesibilidad. Corregido instalando ESLint real en ambos workspaces.
>
> **Nota histórica (TK-036):** `complexity`, `max-lines-per-function` (≤60) y `max-depth` (≤4) están activas en ambos `eslint.config.*` pero en severidad `warn` — **informativas a nivel de repositorio completo**, por deuda preexistente: 8 advertencias reales en backend (`runSeed`, `ConsumeRecipeUseCase.execute`, `PerformShiftReconciliationUseCase.execute`, `createApp`, `InMemoryRemanenteQueryRepository.findActiveRemanentes`) y 15 en frontend (sobre todo componentes React donde JSX infla el conteo de líneas). La duplicación de código (`jscpd`), en cambio, es bloqueante desde ya a nivel repositorio: el baseline real (1.68%) ya cumple el umbral con margen.
>
> **Nota histórica (TK-037):** activar `complexity`/`max-lines-per-function`/`max-depth` como bloqueantes a nivel repositorio rompería `pnpm run lint` para cualquier ticket futuro sin relación con la deuda existente. En su lugar, `docs/04_governance_and_quality/scripts/check_ticket_code_quality.sh` las hace **bloqueantes acotadas al diff del ticket en curso** (archivos sin commitear — working tree + staged): deuda preexistente en archivos no tocados nunca bloquea, pero código nuevo/modificado sí se exige limpio. Wireado en `SK-16`, `SK-17`, `SK-19` y `04_dev_audit_workflow.md`. En una regeneración completa del proyecto desde cero, todo archivo es "nuevo" en el ticket que lo crea — este mecanismo, aplicado ticket a ticket, produce un repositorio limpio por construcción sin exigir pagar deuda retroactiva.
>
> **Nota histórica (TK-038):** `check_contract_drift.sh`, `profile_test_suite.sh` y `check_ticket_code_quality.sh` viven en `docs/04_governance_and_quality/scripts/`, no en `.agents/scripts/` — están acoplados al stack de este proyecto (TypeScript, ESLint, Vitest) y `.agents/scripts/` es el payload que `install.sh` copia verbatim a cualquier proyecto nuevo sin importar su stack. Son generados por `SK-27` a partir de este manifiesto; regenerar tras un cambio de stack, no editar a mano asumiendo que sean portables.

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
| **Secret Scanner** | gitleaks | **8.x** | SAST en CI pipeline |
| **Container CVE Scanner** | trivy | **0.5x** | Escaneo de imágenes Docker |

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

# Migraciones de base de datos
npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma

# Seed de datos
npx ts-node apps/backend/prisma/seed.ts

# Validar integridad del framework .agents
bash .agents/scripts/validate_agents.sh

# Validar drift de contrato OpenAPI vs Zod
bash docs/04_governance_and_quality/scripts/check_contract_drift.sh

# Validar infraestructura OpenTofu (dry-run)
tofu validate && tofu plan
```

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

---

*Este manifiesto es aprobado por el humano responsable del proyecto. Cualquier modificación requiere revisión y aprobación explícita antes de que los agentes IA puedan aplicar los nuevos valores.*
