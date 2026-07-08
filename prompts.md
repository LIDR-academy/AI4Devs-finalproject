# Documentación de uso de IA en Realista — Entrega 1 + 2

> Documentación del uso de IA en Realista, organizada según el formato esperado para el cohort AI4Devs: skills, subagentes, workflows, herramientas, procesos, prompts y comparativas. La Entrega 1 documentó la fase de planificación (spec-kit + brainstorming + revisión crítica). La **Entrega 2 introduce la capa de AI Engineering explícita** con agentes, comandos, skills, hooks, playbooks, prompt-runs, harness y sistema de autodocumentación — todo en `.opencode/`.

## Índice

1. [Skills utilizadas](#1-skills-utilizadas)
2. [Subagentes utilizados](#2-subagentes-utilizados)
3. [Workflows implementados](#3-workflows-implementados)
4. [Herramientas de IA](#4-herramientas-de-ia)
5. [Procesos de análisis](#5-procesos-de-análisis)
6. [Prompts clave](#6-prompts-clave)
7. [Comparativas antes/después](#7-comparativas-antesdespués)
8. [Ajustes humanos](#8-ajustes-humanos)
9. [Componentes de IA (Entrega 2)](#9-componentes-de-ia-entrega-2)

---

## 1. Skills utilizadas

Skills de **Superpowers** (paquete que extiende el comportamiento del agente) que se cargaron durante el desarrollo:

| Skill | Cuándo se usó | Output generado |
|-------|---------------|-----------------|
| **`brainstorming`** | Inicio del proyecto, refinamiento del producto | Diseño completo del producto: Listing Lens, Mortgage Compass, Dashboard |
| **`requesting-code-review`** | Revisión crítica del E2E antes de declarar Entrega 1 lista | Veredicto "With fixes" — 3 críticos + 8 importantes identificados y corregidos en commit `f1b432c` |
| **`using-superpowers`** | Carga al inicio de cada conversación | Protocolo de invocación de skills antes de responder |
| **`test-driven-development`** | Referencia para estructura de tareas | 17 tareas de test (TDD) integradas en tasks.md |
| **`verification-before-completion`** | Carga durante commits | Mensajes de commit verifican el estado antes de afirmar "completado" |
| **`writing-plans`** | Referencia conceptual para tasks.md | tasks.md con 127 tareas en 8 fases |
| **`writing-skills`** | Cargado en setup inicial (con spec-kit) | Especificaciones estructuradas en specs/001-realista-mvp/ |

**Habilidades de spec-kit (GitHub SDD toolkit)** instaladas vía `uv tool install`:

| Comando | Uso |
|---------|-----|
| `/speckit.constitution` | Crear los 6 principios de gobierno del proyecto en `docs/constitution.md` |
| `/speckit.specify` | Generar la spec inicial con 5 historias de usuario |
| `/speckit.clarify` | Resolver 5 ambigüedades (persistencia, LLM, rate limit, narrativas, HTML parsing) |
| `/speckit.plan` | Generar plan, research, data-model, contracts, quickstart |
| `/speckit.tasks` | Generar 127 tareas en 8 fases |

---

## 2. Subagentes utilizados

| Subagente | Tipo | Cuándo se usó | Output |
|-----------|------|---------------|--------|
| **Code reviewer** (de `requesting-code-review`) | General-purpose | Disponible para revisión crítica del E2E tras la implementación inicial | Identificó 3 críticos, 8 importantes y 4 menores en el diseño del flujo |
| **Agente de brainstorming** (skill `brainstorming`) | Skill-based | Sesión inicial de diseño y refinamiento del producto | Producto, arquitectura, features |
| **Comandos de spec-kit** (integración opencode) | Skill-based | Generación de artefactos SDD | spec.md, plan.md, tasks.md, data-model.md, contracts/, research.md |

**Nota**: El proyecto se ejecutó principalmente de forma interactiva con el agente principal, no con subagentes en paralelo. La decisión de dispatchar o no subagentes en paralelo se evalúa con la skill `dispatching-parallel-agents` cuando hay 2+ tareas independientes.

---

## 3. Workflows implementados

### Workflow 1: Spec-Driven Development (SDD) — principal

```
1. Brainstorming inicial (skill)
   ↓
2. /speckit.constitution → docs/constitution.md
   ↓
3. /speckit.specify → specs/001-realista-mvp/spec.md
   ↓
4. /speckit.clarify → 5 preguntas → spec.md actualizado
   ↓
5. /speckit.plan → plan.md + research.md + data-model.md + contracts/ + quickstart.md
   ↓
6. /speckit.tasks → tasks.md (127 tareas, 8 fases)
   ↓
7. /speckit.implement → (pendiente de ejecutar)
```

### Workflow 2: Feature-slice TDD (planificado para implementación)

```
Por cada historia de usuario:
1. Escribir tests primero (T023-T027 para US1, T045-T050 para US2, etc.)
2. Verificar que fallan
3. Implementar: value objects → ports → adapters → use cases → routes → UI
4. Verificar que pasan
5. Refactor
6. Commit
7. Validar la historia independientemente
```

### Workflow 3: Git + GitHub — entrega por PRs

```
1. Crear rama con iniciales: git checkout -b feature-entrega1-[iniciales]
2. Hacer commits descriptivos siguiendo convención del proyecto
3. Push: git push -u origin feature-entrega1-[iniciales]
4. Abrir PR contra main con descripción detallada
5. Documentar las PRs en readme.md sección 7
6. Rellenar Typeform con URL del PR
```

### Workflow 4: Revisión crítica de diseño

```
1. Identificar artefactos a revisar (spec, plan, data-model, contracts, tasks)
2. Análisis crítico en 3 capas: críticos (rompen lógica) / importantes (debilitan) / menores
3. Para cada crítico: diseñar fix, validar con el autor, actualizar artefactos
4. Commit por fix con mensaje descriptivo
```

---

## 4. Herramientas de IA

| Herramienta | Uso | Detalles |
|-------------|-----|----------|
| **Claude (modelo principal)** | Generación de texto, código, decisiones arquitectónicas | Modelo subyacente al agente OpenCode que ejecuta la conversación |
| **OpenCode** | Interfaz de CLI para invocar al modelo con skills, subagentes, comandos | Entorno de desarrollo local |
| **spec-kit (GitHub)** | Toolkit de SDD con comandos estructurados | Instalado vía `uv tool install specify-cli` |
| **`uv` (Astral)** | Gestor de Python para instalar spec-kit CLI | `uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v0.9.4` |
| **Superpowers (paquete de skills)** | Colección de skills cargadas en cada sesión | Cargado al inicio del proyecto via `using-superpowers` |

**Herramientas NO utilizadas pero mencionadas en los requisitos**:
- Cursor: no se usó; el trabajo se hizo con OpenCode + spec-kit
- ChatGPT: no se usó; Claude fue el modelo único
- GitHub Copilot: no se usó; OpenCode sirvió como interfaz de IA

---

## 5. Procesos de análisis

### Proceso 1: Generación del producto (Listing Lens + Mortgage Compass + Dashboard)

**Input**: Requisitos del cohort AI4Devs (dominio libre, 3-5 historias Must-Have + 1-2 Should-Have, MVP ejecutable)

**Pasos**:
1. Brainstorming iterativo con el autor para identificar pain points del comprador primerizo español
2. Refinamiento de scope: empezar con toolkit genérico → reducir a E2E flow → expandir Mortgage Compass como diferenciador
3. Naming iterativo: 8+ propuestas rechazadas (ClaveHogar, Escritura, Catastrofe, Flechazo, PrimeraLlave, etc.) antes de "Realista"
4. Validación de scope: 5 Must-Have + 2 Should-Have, coherente con ejemplos del cohort (Zalando, Revolut, Uber)

**Output**: spec.md con 5 historias de usuario priorizadas

### Proceso 2: Decisiones arquitectónicas (hexagonal, SvelteKit, OpenRouter, Cheerio)

**Input**: Stack preferido del autor (TypeScript, sin auth, PWA mobile-first)

**Pasos**:
1. Evaluación de frameworks frontend: Vue vs SvelteKit vs Next.js → SvelteKit por Vite + diferenciación
2. Decisión de persistencia: localStorage vs PostgreSQL → full stack desde día 1 (más calidad de código)
3. Selección de LLM: OpenAI vs Anthropic vs OpenRouter → OpenRouter por flexibilidad de modelo
4. Estrategia de parseo HTML: Cheerio vs Puppeteer → Cheerio + subdominio `.m.`
5. Estrategia de fallback: si el LLM falla tras reintentos, el usuario pega el texto manualmente

**Output**: 3 ADRs (hexagonal, fallback de análisis, no-scraping) + research.md con 7 decisiones

### Proceso 3: Refinamiento crítico del E2E

**Input**: Spec inicial aprobada con 5 historias y 13 FRs

**Pasos**:
1. Revisión crítica identificó 3 problemas fundamentales: (a) listing-process desconectados, (b) Mortgage Compass no conoce el listing, (c) estimación de ubicación por LLM es un agujero
2. Diseño de fix: auto-attach listing al proceso activo, pre-fill `propertyPrice` desde listing, LocationResolver chain con 3 adapters
3. Implementación: 4 artefactos actualizados (spec, contracts, data-model, tasks), 12 tareas nuevas
4. Validación: la spec explica el nuevo flujo end-to-end de forma coherente

**Output**: spec.md v2 + 4 FRs nuevos (FR-014 a FR-018) + LocationResolverPort documentado

### Proceso 4: Desglose de tareas (127 tareas en 8 fases)

**Input**: spec.md, plan.md, data-model.md, contracts/

**Pasos**:
1. Identificar fases: Setup → Foundational → US1-5 → Polish
2. Por cada historia: listar tests primero (TDD), luego value objects, puertos, adaptadores, servicios, rutas, UI
3. Marcar con [P] las tareas que pueden correr en paralelo (archivos diferentes, sin dependencias)
4. Etiquetar con [US1]-[US5] para trazabilidad
5. Verificar dependencias entre fases (ninguna historia puede empezar antes de Foundational)

**Output**: tasks.md con 127 tareas, 17 de test (TDD), oportunidades de paralelización documentadas

---

## 6. Prompts clave

Los 3 prompts más relevantes que dispararon decisiones fundamentales:

### Prompt 1 — Definición del diferenciador

> "I believe the mortgage thing could pack a punch compared to the rest"

**Contexto**: Tras enumerar las features candidatas, este prompt consolidó el Mortgage Compass como la pieza única del proyecto (comparativa amortización vs inversión, no existente en herramientas españolas).

**Resultado**: US-02 (Mortgage Compass) elevado a P1 con la misma prioridad que Listing Lens. El proyecto pivota de "analizador de listings" a "asistente financiero educativo".

**Artefacto**: `specs/001-realista-mvp/spec.md` (US-02)

---

### Prompt 2 — Selección del stack frontend

> "I meant Sveltekit or next.js using react as they're more trending for hiring processes AFAIK"

**Contexto**: El agente confundió Vite (build tool) con framework. El autor clarificó que quería SvelteKit o Next.js por ser más trendy en contratación.

**Resultado**: Elección de SvelteKit (PWA ligera, build con Vite, menos boilerplate). El agente añadió el argumento de "elegir la herramienta correcta, no la popular" como narrativa de entrevista.

**Artefacto**: `specs/001-realista-mvp/plan.md` (Technical Context)

---

### Prompt 3 — Estrategia de ubicación (tras revisión crítica)

> "el LLM extrae coordenadas" (en la spec original) → identificado como agujero técnico en la revisión crítica

**Contexto**: La spec original asumía que un LLM solo de texto podía estimar coordenadas GPS, lo cual no es técnicamente posible.

**Resultado**: Diseño de LocationResolverPort con 2 adaptadores en cadena (DeclaredLocationAdapter → GeocodingAdapter). El LLMVisionLocationAdapter se eliminó por inviabilidad técnica (ver FR-016 y research.md sección 8). La spec actualizada documenta explícitamente la cadena simplificada y el fallback honesto: sin dirección → sin verificación catastral.

**Artefacto**: `specs/001-realista-mvp/spec.md` (FR-016) + `research.md` (sección 8) + 6 tareas nuevas (T030a-b, T032a-d)

---

## 7. Comparativas antes/después

| Decisión | Antes | Después | Justificación del cambio |
|----------|-------|---------|--------------------------|
| **Stack frontend** | Vue 3 (plan original) | SvelteKit | Más trending en contratación, mejor DX con Vite |
| **Naming del proyecto** | HomePath (genérico) | Realista (contraste con Idealista, posiciona el mensaje) | El nombre debe comunicar el producto. "Idealista pero realista" |
| **Persistencia** | localStorage/IndexedDB en cliente (en duda) | PostgreSQL full stack desde día 1 | Mejor calidad de código, demostración de backend |
| **LLM provider** | OpenAI o Anthropic directo | OpenRouter como gateway | Flexibilidad de modelo, una sola API key, más barato para desarrollo |
| **Pre-rellenado de `propertyPrice` en Mortgage Compass** | No conectado a listing | Pre-rellenado del listing con link a la fuente | Elimina fricción, refuerza el flujo E2E "estoy valorando esta casa" |
| **Estimación de ubicación** | Asumida por LLM (incorrecto) | Cadena de 3 adaptadores con fallback | LLM solo no genera coordenadas; la cadena es robusta y económica |
| **Idioma de los artefactos** | Español en spec, inglés en plan/research/tasks | Español en todo, código en inglés | Recomendación del cohort: documentación funcional en español para review |

---

## 8. Ajustes humanos

Decisiones o cambios aplicados por el autor (no por el agente) durante el proyecto:

1. **Rechazo de 8+ nombres propuestos** para el proyecto. "Realista" fue la elección final del autor, no del agente. El proceso iterativo duró varias rondas.

2. **Pivote del Mortgage Compass**: el agente propuso inicialmente un simulador de hipotecas genérico. El autor lo refinó hacia un "strategy advisor" con amortización vs inversión, una idea genuinamente novedosa en el contexto español.

3. **Refinamiento de la estrategia de hipoteca**: el agente propuso 4 escenarios de duración (20/25/30). El autor insistió en 30 años como estándar y añadió la dimensión de amortización voluntaria (no duración), que es más realista para el primer comprador.

4. **Decisión de omitir auth para MVP**: el autor priorizó la calidad de código sobre features de infraestructura, aceptando la complejidad de un `userId` nullable para futura migración.

5. **Rechazo de la estimación de ubicación por LLM solo**: la crítica del propio autor al revisar el E2E identificó que el LLM no genera coordenadas. Esto llevó a un fix con 3 adaptadores y 6 tareas nuevas.

6. **Selección de la "Realidad Pill" como segundo paso** del Mortgage Compass (entre perfil y estrategia). El autor validó esta estructura del agente porque refleja el orden de descubrimiento real del comprador.

7. **Decisión de no traducir la Constitución ni el AGENTS.md**: el agente ofreció traducir todo al español. El autor limitó la traducción a artefactos del cohort (readme, prompts, ADRs, spec, plan, research, tasks) manteniendo la constitución y AGENTS.md en inglés como docs internos.

8. **Final review del E2E por el autor**: tras el flujo principal, el autor pidió revisar el E2E de forma crítica ("estoy en medio de X, esto no tiene sentido"). Este momento de auto-crítica llevó a la identificación de los 3 problemas críticos que guiaron los fixes.

9. **Nombre de la rama con iniciales DMM**: la convención del cohort `feature-entrega1-[iniciales]` fue respetada por el autor usando sus iniciales extraídas de la URL del repo (`dmiguelm` → DMM).

---

## 9. Componentes de IA (Entrega 2)

> La Entrega 2 introduce una **capa de AI Engineering explícita y versionada** que define cómo el modelo es invocado, qué puede hacer, y con qué soporte técnico cuenta. Todo el setup vive en `.opencode/` y se documenta en [`.opencode/README.md`](.opencode/README.md).

### 9.1. Catálogo de componentes

| Tipo | Cantidad | Ubicación | Propósito |
|---|---|---|---|
| **Agentes** | 4 | `.opencode/agents/` | Roles de alto nivel con system prompts, contratos entrada/salida y guardarraíles |
| **Comandos** | 8 | `.opencode/commands/` | Slash commands reutilizables para operaciones comunes |
| **Skills** | 6 | `.opencode/skills/` | Comportamientos encapsulados invocados desde los agentes |
| **Hooks** | 4 | `.opencode/hooks/` | Triggers de automatización para eventos de git y editor |
| **Playbooks** | 3 | `.opencode/playbooks/` | Flujos multi-paso que orquestan agentes |
| **Prompt-runs** | 3 | `.opencode/prompts/` | System prompts LLM y plantillas hardcoded |
| **Harness docs** | 6 + 1 | `.opencode/harness/` | Documentación del soporte técnico (stack, env, tests, run, troubleshooting, config) |
| **Self-doc** | n/a | `docs/evidence/` | Evidencia auto-generada por tarea |

### 9.2. Los 4 agentes de alto nivel

Definidos en `.opencode/agents/`:

| Agente | System prompt resume | Skills que invoca | Cuándo se usa |
|---|---|---|---|
| **implementer** | "Sigue TDD, hexagonal purity, español en UI, inglés en código. Una tarea a la vez." | `tdd-cycle`, `auto-evidence`, `prisma-migrate` | Por cada US / sub-tarea |
| **reviewer** | "Escéptico, minucioso, nunca performativo. Categoriza findings (critical/important/minor) con fixes concretos." | `hexagonal-check`, `adr-suggest` | Antes de merge, tras implementación |
| **documenter** | "Documentación first-class. Español para usuarios, inglés para código. No fluff." | `adr-suggest`, `auto-evidence` | Tras review aprobado o cambios estructurales |
| **orchestrator** | "Coordina implementer → reviewer → documenter. Trackea state vs tasks.md." | `tdd-cycle`, `hexagonal-check`, `auto-evidence` | Al inicio de cada US |

Cada agente define: rol, contratos de entrada/salida, system prompt, ejemplos de invocación, anti-patterns.

### 9.3. Las 6 skills

Encapsulan comportamientos reutilizables:

| Skill | Función | Trigger |
|---|---|---|
| **`auto-evidence`** | Genera `docs/evidence/<timestamp>-<task-id>.md` con prompt + qué se hizo + deliverables + tests | Al cerrar cada tarea |
| **`tdd-cycle`** | Impone red→green→refactor con 80% cobertura en dominio | Cada `implementer` |
| **`hexagonal-check`** | Verifica que `domain/` no importa de Express/Prisma/SvelteKit/Cheerio/fetch | Pre-commit + `reviewer` |
| **`adr-suggest`** | Detecta decisiones arquitectónicas no documentadas y propone ADR | En `reviewer` y `documenter` |
| **`pwa-shell`** | Genera manifest, service worker, icons para SvelteKit | En setup inicial |
| **`prisma-migrate`** | Crea migraciones Prisma seguras con naming convention y rollback | En cambios de schema |

### 9.4. Los 8 comandos

Operaciones de alto nivel:

| Comando | Uso |
|---|---|
| `/analyze-listing <url>` | Ejecuta el flujo Listing Lens (fetch + LLM + location + catastro + progress events) |
| `/review-pr` | Corre `reviewer` sobre el diff staged o una rama |
| `/document-task <task-id>` | Genera evidence para una tarea específica |
| `/check-architecture` | Ejecuta `hexagonal-check` sobre todo el repo |
| `/generate-adr <title>` | Redacta un ADR nuevo siguiendo plantilla |
| `/scaffold-story <us-id>` | Crea la estructura de carpetas para una US |
| `/sprint <us-id>` | Orquesta `scaffold-story` → `implementer` → `reviewer` → `documenter` → evidence |
| `/evidence-report` | Genera reporte agregado de evidence para revisión de hitos |

### 9.5. Los 4 hooks (documentados como scripts ejecutables)

OpenCode no tiene un hook runner nativo, por lo que los hooks se documentan como **intención + scripts ejecutables**:

| Hook | Trigger | Acción documentada |
|---|---|---|
| **`post-commit`** | `git commit` succeeds | `lint + typecheck + test + hexagonal-check` |
| **`pre-push`** | `git push` initiated | Full test suite + Playwright E2E (mocked) |
| **`post-merge`** | `git merge` completes | Regenera `docs/evidence/INDEX.md` |
| **`on-save-svelte`** | `.svelte` saved in editor | `svelte-check` (configuración de VS Code / Vim) |

Por ahora se ejecutan en CI (`.github/workflows/ci.yml`) en lugar de como hooks locales. Ver `.opencode/hooks/post-commit.md` para la migración a Husky si se desea ejecución local.

### 9.6. Los 3 playbooks

Flujos multi-paso que orquestan agentes:

- **`full-story.md`** — `scaffold-story` → `implementer` (con `tdd-cycle`) → `reviewer` (con `hexagonal-check`) → `documenter` (con `auto-evidence`) → commit
- **`adr-lifecycle.md`** — Detección → propuesta → revisión → commit → mención en evidence
- **`release.md`** — Verificar estado → CHANGELOG → bump de versión → tag → nota en `readme.md` → evidence report

### 9.7. Los 3 prompt-runs (LLM system prompts)

Ubicados en `.opencode/prompts/`:

- **`llm-system-listing.md`** — System prompt del LLM analyzer de Listing Lens. Devuelve JSON con `transparencyScore`, `redFlags[]` (cada uno con `flag`, `severity`, `reasoning` que cita la frase del anuncio — FR-025), `omissions`, `positiveSignals`, `summary`. Sin consejo financiero, sin juicio moral, sin markdown.
- **`llm-system-location.md`** — **DEPRECATED**. Prompt original para estimación de ubicación por visión. Reemplazado por cadena `DeclaredLocation → Geocoding` (FR-016). Conservado como referencia histórica.
- **`narrative-templates.md`** — Plantillas narrativas del Mortgage Compass indexadas por `(persona, scenario)`. **No usa LLM** (FR-013) — la salida se computa desde estas plantillas con variables sustituidas. Cada plantilla incluye disclaimer persistente.

### 9.8. Harness (documentación del soporte técnico)

`.opencode/harness/` documenta el "andamiaje" del proyecto:

| Archivo | Contenido |
|---|---|
| `README.md` | Visión general del harness |
| `stack.md` | Versiones exactas, matriz de compatibilidad, rationale |
| `env-vars.md` | Variables de entorno: requeridas, opcionales con defaults, validación con Zod |
| `test-strategy.md` | TDD workflow, cobertura 80% dominio, Vitest + Playwright, mocks |
| `run-locally.md` | Quickstart: `docker compose up -d && npm install && npm run db:migrate && npm run dev` |
| `troubleshooting.md` | Errores comunes (DB, OpenRouter, Catastro, frontend, tests) |
| `config.yaml` | Configuración machine-readable (versión, stack, cobertura, catálogo de agentes) |

### 9.9. Sistema de autodocumentación (`docs/evidence/`)

Cada tarea que completa un agente produce un evidence file con:

1. **Prompt** verbatim del usuario que disparó la tarea
2. **Qué se hizo** (acciones)
3. **Deliverables** (ficheros creados/modificados)
4. **Tests** (unit / integration / domain coverage %)
5. **Commits** (sha + mensaje conventional)
6. **Notas** (contexto, open questions, limitaciones)

El primer evidence file de Entrega 2 es `docs/evidence/2026-07-08-ENTREGA2-SETUP.md`, que documenta este scaffold inicial. El hook `post-merge` regenera automáticamente `docs/evidence/INDEX.md`.

### 9.10. Cumplimiento constitucional

Los componentes de IA refuerzan los 6 principios de la constitución (ver `docs/constitution.md`):

| Principio | Refuerzo técnico |
|---|---|
| **I. Hexagonal Architecture** | `hexagonal-check` (skill) bloquea commits con imports prohibidos en `domain/` |
| **II. Test-First** | `tdd-cycle` (skill) + coverage threshold ≥80% en `backend/vitest.config.ts` |
| **III. Educational, Not Commercial** | `narrative-templates.md` (prompt-run) usa plantillas, no LLM, para Mortgage Compass (FR-013) |
| **IV. Privacy & Legal Compliance** | User-Agent `Realista/1.0 (analizador educativo)` configurado en `env-vars.md`; FR-011 verificado por `reviewer` |
| **V. Mobile-First PWA** | `pwa-shell` (skill) genera manifest + service worker + icons + meta iOS |
| **VI. YAGNI & Future-Proof** | Agentes y skills documentan anti-patterns explícitos en sus system prompts |

### 9.11. Decisiones tomadas en Entrega 2

| Decisión | Elección | Rationale |
|---|---|---|
| **Granularidad de agentes** | 4 de alto nivel (no 10-12) | Cada agente tiene contrato claro; menos overhead |
| **Ubicación de componentes** | `.opencode/` (no `ai/`) | Nativo al entorno OpenCode que usa el autor |
| **Sistema de autodocumentación** | Skill + `docs/evidence/` (no en commits) | Indexable, navegable, separado del flujo de commits |
| **Hooks** | Documentados como scripts (no nativos) | OpenCode no tiene hook runner; CI cubre la intención |
| **Harness** | Documentado en markdown (no codegen) | Documentación-as-código, versionada, fácil de mantener |
| **Plantillas narrativas** | Hardcoded en Markdown (no generador) | Predecible, auditable, sin LLM cost (FR-013) |
| **Tools externas para spec** | Mantener `spec-kit` (no OpenSpec/BeMac) | Ya usado en Entrega 1; sin valor de migración |

### 9.12. Prompts de Entrega 2 (los más relevantes)

**Prompt 1 — Definición del setup de AI engineering**

> "Comencemos por definir la estructura de carpetas y los primeros agentes para la Épica 1."

**Contexto:** El autor pidió empezar con la estructura. Esto llevó a una sesión de brainstorming que clarificó:
- Scope: las 6 US a nivel MVP (no solo Épica 1)
- Granularidad: 4 agentes de alto nivel
- Ubicación: `.opencode/`
- Sistema de autodocumentación: skill + `docs/evidence/`
- Mantener `spec-kit` (no OpenSpec/BeMac)

**Resultado:** Diseño completo aprobado, ejecutado en este commit.

**Prompt 2 — Resolviendo ambigüedad de herramientas de especificación**

> "Mencionas 'OpenSpec o BeMac' como herramientas de especificación para documentar el harness. No tengo conocimiento fiable de herramientas con esos nombres exactos. ¿A qué te refieres?"

**Contexto:** El agente clarificó con el autor que no reconocía "OpenSpec" ni "BeMac" como herramientas establecidas.

**Resultado:** El autor decidió mantener `spec-kit` (ya usado en Entrega 1) y no añadir nuevas herramientas de especificación.

**Prompt 3 — Alcance de implementación**

> "Olvída la referencia a épica 1. Hay que implementar todas las US a nivel MVP"

**Contexto:** Inicialmente se asumió "Épica 1" como alcance; el autor lo aclaró.

**Resultado:** Scope ampliado a 6 US a nivel MVP (implementación mínima funcional completa), secuenciadas story-by-story TDD.

### 9.13. Próximos pasos

1. Activar el hook `post-commit` vía Husky (`.opencode/hooks/post-commit.md`)
2. Empezar US1 (Listing Lens) con `/sprint US1` — TDD, tests first, commit por tarea
3. Generar evidence por cada tarea cerrada con `auto-evidence`
4. Primer PR `feature-entrega2-DMM-us1` cuando US1 esté verde
5. Generar `/evidence-report` al cerrar cada US para revisión de hitos
