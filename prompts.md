> Los prompts más relevantes utilizados durante la creación de Realista. El proyecto siguió Spec-Driven Development (SDD) con spec-kit, por lo que los árboles de decisión completos están documentados en los artefactos de `specs/001-realista-mvp/`. Esta sección resume los prompts que dispararon las decisiones clave, con notas sobre cómo se guió al asistente y qué ajustes humanos se aplicaron.

## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1:**
> "I want to keep brainstorming as I feel the plan it's a bit incomplete. It's meant to be delivered as AI engineer cohort final project."

**Contexto**: El proyecto partía de un plan inicial (`analysis/plan.md`) que definía la visión pero carecía de historias de usuario, modelo de datos y decisiones de arquitectura. Este prompt disparó la sesión de brainstorming que refinó todo el producto.

**Herramienta**: Claude (OpenCode, skill brainstorming)

**Ajuste humano**: El producto original se llamaba "HomePath" y era un toolkit genérico. Durante el brainstorming se refinó hacia "Realista", un posicionamiento que juega con el contraste frente a Idealista y se enfoca exclusivamente en compradores primerizos. El naming fue iterado 8+ veces rechazando opciones como "ClaveHogar", "Escritura", "Catastrofe" o "Flechazo" hasta dar con una que satisficiera al autor.

**Artefacto resultante**: `specs/001-realista-mvp/spec.md`

---

**Prompt 2:**
> "I'd go with A but then I feel I fall short in features. What else could I add? My goals is to ease the most common painpoints for the Spanish first home buyers."

**Contexto**: El producto necesitaba un flujo E2E completo que creara valor real. Este prompt llevó a identificar los puntos de dolor reales del comprador español y a diseñar el Mortgage Compass como diferenciador principal.

**Herramienta**: Claude (OpenCode)

**Ajuste humano**: El asistente propuso inicialmente un "simulador de hipotecas" genérico. El autor refinó la idea hacia un "strategy advisor" que compara amortización voluntaria vs inversión, un concepto que ningún banco o herramienta explica en España. La idea de mostrar 4 escenarios de amortización (baseline, light, moderate, aggressive) con un escenario de inversión alternativo fue un refinamiento iterativo del autor.

**Artefacto resultante**: US-02 Mortgage Compass en `specs/001-realista-mvp/spec.md`

---

**Prompt 3:**
> "I also have some ideas I've personally used as my manual algorithm for listings to assess its feasibility: manually locating the property as realtors won't give it to you..."

**Contexto**: El autor compartió su experiencia personal como comprador de vivienda — localizar manualmente propiedades usando fotos y comparar con el catastro. Esto transformó el "Desengatusador" original en Listing Lens, un análisis potenciado por IA.

**Herramienta**: Claude (OpenCode)

**Ajuste humano**: El asistente propuso un enfoque LLM + cruce catastral + triangulación de ubicación. El autor validó el enfoque desde su experiencia real como comprador, asegurando que el producto resolviera problemas auténticos y no hipotéticos.

**Artefacto resultante**: US-01 Listing Lens en `specs/001-realista-mvp/spec.md`

---

## 2. Arquitectura del Sistema

### 2.1. Diagrama de arquitectura

**Prompt 1:**
> "I want to use user stories alongside with SDD (does it make sense?). I believe that Spec-kit adapts better to my project since it's greenfield."

**Contexto**: Decisión de adoptar spec-kit (GitHub SDD toolkit) como metodología de documentación. Esto definió toda la estructura de artefactos del proyecto.

**Herramienta**: Claude (OpenCode, spec-kit CLI)

**Ajuste humano**: El autor eligió spec-kit sobre OpenSpec tras evaluar que se adaptaba mejor a proyectos greenfield. La decisión de usar `/speckit.specify` → `/speckit.clarify` → `/speckit.plan` → `/speckit.tasks` fue deliberada para alinear la documentación con los requisitos de la cohorte.

**Artefacto resultante**: `.specify/memory/constitution.md`, estructura SDD completa

---

**Prompt 2:**
> "forget about Vue. I'd rather use Vite instead. As for the scope, it serves a purpose of my persona as a recent home buyer who's suffered enough pain while going through the process."

**Contexto**: Cambio del stack frontend de Vue 3 a SvelteKit. La decisión se basó en empleabilidad (SvelteKit es más novedoso y diferenciador en CV) y en que ya usa Vite como build tool.

**Herramienta**: Claude (OpenCode)

**Ajuste humano**: El autor corrigió al asistente cuando este confundió Vite (build tool) con un framework. Clarificó que quería SvelteKit o Next.js por ser "más trending para hiring processes". Eligió SvelteKit por su integración nativa con Vite y su enfoque en PWA ligera.

**Artefacto resultante**: `specs/001-realista-mvp/plan.md` (Technical Context)

---

**Prompt 3:**
> "I don't think auth gives too much value at this point as it's a POC. I'd rather focus on giving the project more quality towards evaluating my knowledge for the cohort."

**Contexto**: Decisión arquitectónica de omitir autenticación en el MVP manteniendo la capacidad de añadirla después (campo `userId` nullable en el modelo de datos).

**Herramienta**: Claude (OpenCode)

**Ajuste humano**: El autor priorizó la calidad del código y la arquitectura sobre features de infraestructura. La decisión de usar sesiones anónimas con UUID fue propuesta por el asistente y validada por el autor.

**Artefacto resultante**: `specs/001-realista-mvp/spec.md` (FR-007, FR-010), `specs/001-realista-mvp/research.md` (Session UUID Management)

---

### 2.2. Descripción de componentes principales

**Prompt 1:**
> "I meant Sveltekit or next.js using react as they're more trending for hiring processes AFAIK"

**Contexto**: Justificación de la elección de SvelteKit sobre Vue 3, basada en tendencias de contratación más que en preferencia técnica.

**Herramienta**: Claude (OpenCode)

**Ajuste humano**: El autor priorizó el valor de CV sobre la familiaridad técnica. El asistente recomendó SvelteKit sobre Next.js argumentando que "elegir la herramienta correcta, no la popular" es mejor narrativa de entrevista.

**Artefacto resultante**: `specs/001-realista-mvp/plan.md` (stack decision)

---

**Prompt 2:**
> "the hidden costs thing could easily be part of the mortgage advisor as all brokers just ask you for the closing price, and then calculate the hidden costs that sum up to that."

**Contexto**: Refinamiento de la arquitectura del Mortgage Compass: integrar el cálculo de gastos ocultos dentro del flujo del simulador hipotecario en lugar de tratarlo como feature separada.

**Herramienta**: Claude (OpenCode)

**Ajuste humano**: El autor unificó tres features (perfil financiero, gastos ocultos, simulador hipotecario) en un solo módulo coherente basado en su conocimiento del proceso real de compra. Este insight de dominio simplificó la arquitectura y mejoró la UX.

**Artefacto resultante**: US-02 Mortgage Compass (unificado) en `specs/001-realista-mvp/spec.md`

---

**Prompt 3:**
> "The Mortgage Compass — Unified Financial Module. Three phases, one page, independently navigable but designed to flow."

**Contexto**: El asistente propuso consolidar el módulo financiero en tres fases (Your Numbers → Reality Pill → Strategy Playground). El autor validó y refinó esta estructura.

**Herramienta**: Claude (OpenCode, skill brainstorming)

**Ajuste humano**: La estructura de tres fases fue propuesta por el asistente y aceptada por el autor. El "Reality Pill" (gastos ocultos) como segundo paso entre el perfil y la estrategia fue un hallazgo de diseño que surgió de la colaboración.

**Artefacto resultante**: `specs/001-realista-mvp/spec.md` (US-02, Acceptance Scenarios)

---

### 2.3. Descripción de alto nivel del proyecto y estructura de ficheros

**Prompt 1:**
> "yes but I'm not into development yet. The first deliverable will be the technical documentation."

**Contexto**: El autor clarificó que la primera entrega es solo documentación técnica, lo que reorientó el esfuerzo hacia los artefactos de spec-kit y el readme.md en lugar de código.

**Herramienta**: Claude (OpenCode, spec-kit)

**Ajuste humano**: Decisión de la cohorte (3 entregas progresivas). El autor adaptó el flujo de trabajo para priorizar documentación sobre implementación.

**Artefacto resultante**: Todos los artefactos SDD en `specs/001-realista-mvp/`

---

**Prompt 2:**
> "but that's superpower's output. How do I translate that to Spec-kit SDD?"

**Contexto**: Transición del brainstorming de Superpowers (skill brainstorming) a la estructura formal de spec-kit. Este fue el momento en que se instaló y configuró spec-kit.

**Herramienta**: Claude (OpenCode, spec-kit CLI, Superpowers brainstorming)

**Ajuste humano**: El autor identificó que el output del brainstorming necesitaba traducirse al formato SDD de spec-kit. El asistente investigó spec-kit (GitHub), lo instaló vía `uv`, inicializó el proyecto con integración opencode, y migró el contenido del brainstorming a los artefactos formales: constitution → spec → clarify → plan → tasks.

**Artefacto resultante**: `.specify/` directory, `specs/001-realista-mvp/` con todos los artefactos

---

**Prompt 3:**
> "let's change all naming to English plz"

**Contexto**: Decisión de mantener el código en inglés mientras que los entregables de la cohorte van en español. El modelo de datos usa nombres en inglés (User, PurchaseProcess, AnalyzedListing) pero la documentación está en español.

**Herramienta**: Claude (OpenCode)

**Ajuste humano**: El autor estableció esta convención bilingüe: código en inglés (estándar de la industria), documentación en español (requisito de la cohorte). El asistente aplicó el cambio consistentemente en todos los artefactos.

**Artefacto resultante**: `specs/001-realista-mvp/data-model.md` (Prisma schema en inglés), `specs/001-realista-mvp/spec.md` (documentación en español)

---

### 2.4. Infraestructura y despliegue

**Prompt 1:**
> "E" (Undecided — need to research options)

**Contexto**: En respuesta a la pregunta sobre target de despliegue (Vercel, Railway, Render, Fly.io), el autor indicó que necesitaba investigar. El despliegue quedó como TBD en el plan, con candidatos identificados.

**Herramienta**: Claude (OpenCode)

**Ajuste humano**: Decisión de posponer la elección de infraestructura hasta la fase de implementación. El plan documenta los candidatos (Railway/Render para backend, Vercel/Netlify para frontend) pero no compromete a uno.

**Artefacto resultante**: `specs/001-realista-mvp/plan.md` (Deployment: TBD), `specs/001-realista-mvp/quickstart.md` (CI/CD pipeline outline)

---

**Prompt 2:**
> "I don't think auth gives too much value at this point as it's a POC. Maybe plan to add it as a later step, making it future proof?"

**Contexto**: La decisión de no implementar autenticación simplifica el despliegue (sin gestión de usuarios, sin emails, sin OAuth) y permite un pipeline CI/CD más simple.

**Herramienta**: Claude (OpenCode)

**Ajuste humano**: El autor priorizó la simplicidad del despliegue sobre features de infraestructura. El `userId` nullable en el schema de Prisma es la concesión "future-proof".

**Artefacto resultante**: `specs/001-realista-mvp/data-model.md` (userId nullable), `specs/001-realista-mvp/plan.md` (Constitution Check VI)

---

**Prompt 3:**
> "maybe. how appropiate do you think it is as a scope for the cohort final project? does it make sense while not being marketable enough for anyone else to take advantage of?"

**Contexto**: Validación del scope frente a los requisitos de la cohorte. El autor quería asegurarse de que el proyecto fuera sustancial pero no explotable comercialmente por terceros.

**Herramienta**: Claude (OpenCode, skill brainstorming)

**Ajuste humano**: El asistente validó que el scope era apropiado (5 Must-Have + 2 Should-Have) y que el dominio (compra de vivienda en España) es demasiado nicho y especializado para ser explotado comercialmente, especialmente como proyecto open source MIT sin modelo de negocio.

**Artefacto resultante**: Scope final en `specs/001-realista-mvp/spec.md`

---

### 2.5. Seguridad

**Prompt 1:**
> "Session UUID — server issues a UUID on first visit, stored in browser, sent with every request. Rate limit per UUID."

**Contexto**: Durante la clarificación del spec (/speckit.clarify), el autor eligió UUID de sesión como mecanismo de identificación sin autenticación.

**Herramienta**: Claude (OpenCode, spec-kit)

**Ajuste humano**: El autor eligió la opción B (UUID) sobre IP-based (frágil en redes móviles) y Combined (complejidad innecesaria). El asistente recomendó UUID como la opción más robusta para el contexto mobile-first.

**Artefacto resultante**: `specs/001-realista-mvp/spec.md` (FR-010), `specs/001-realista-mvp/research.md` (Session UUID Management)

---

**Prompt 2:**
> "I don't think auth gives too much value at this point as it's a POC"

**Contexto**: La seguridad del MVP se basa en sesiones anónimas sin datos personales, eliminando la superficie de ataque de autenticación y gestión de contraseñas.

**Herramienta**: Claude (OpenCode)

**Ajuste humano**: El autor aceptó que sin auth y sin PII, el perfil de riesgo es mínimo. Las únicas medidas de seguridad necesarias son rate limiting, User-Agent honesto, y no almacenar contenido de terceros.

**Artefacto resultante**: `specs/001-realista-mvp/spec.md` (FR-010, FR-011, FR-012), `readme.md` (Sección 2.5 Seguridad)

---

**Prompt 3:**
> "No storage of third-party content — only analysis results stored"

**Contexto**: Principio de privacidad establecido desde el plan original y reforzado durante el brainstorming. El HTML de los anuncios se procesa y se descarta; solo se persisten los resultados del análisis.

**Herramienta**: Claude (OpenCode)

**Ajuste humano**: Este principio venía del `analysis/plan.md` original y se mantuvo sin cambios por ser una decisión acertada. El asistente lo incorporó como FR-011 y como principio constitucional IV.

**Artefacto resultante**: `specs/001-realista-mvp/spec.md` (FR-011), `.specify/memory/constitution.md` (Principle IV)

---

### 2.6. Tests

**Prompt 1:**
> "Sería mucho pedir añadir TDD al proyecto?"

**Contexto**: El autor preguntó si era viable añadir TDD. La respuesta fue que ya estaba integrado como Principio II (NON-NEGOTIABLE) de la constitución desde el inicio.

**Herramienta**: Claude (OpenCode)

**Ajuste humano**: El TDD se estableció durante la fase de constitution como requisito no negociable. El autor no necesitó "añadirlo" porque ya estaba. Las 91 tareas en tasks.md incluyen 17 tareas de test escritas antes de la implementación.

**Artefacto resultante**: `.specify/memory/constitution.md` (Principle II), `specs/001-realista-mvp/tasks.md` (17 test tasks across all user stories)

---

**Prompt 2:**
> "For the E2E test that the cohort requires — which test scenario best demonstrates the full flow?"

**Contexto**: El autor eligió el flujo combinado como test E2E principal: paste URL → score → financial profile → mortgage strategy → dashboard.

**Herramienta**: Claude (OpenCode, skill brainstorming)

**Ajuste humano**: El autor eligió la opción C (Combined) sobre tests individuales por feature. Esta decisión garantiza que el test E2E cubra exactamente el "flujo E2E prioritario que cree valor completo" requerido por la cohorte.

**Artefacto resultante**: `specs/001-realista-mvp/tasks.md` (T088), `e2e/flows/full-flow.spec.ts`

---

**Prompt 3:**
> "Feature-slice TDD: each feature slice (Listing Lens, Mortgage Compass, Dashboard) follows the full red-green-refactor cycle."

**Contexto**: La estrategia de testing se definió como feature-slice TDD: cada historia de usuario sigue el ciclo completo de TDD de forma independiente.

**Herramienta**: Claude (OpenCode, skill brainstorming)

**Ajuste humano**: El autor validó el enfoque. El asistente estructuró las 91 tareas para que cada user story tuviera sus tests primero (marcados [P] para paralelización), seguidos de la implementación.

**Artefacto resultante**: `specs/001-realista-mvp/tasks.md` (Phases 3-7, test tasks first per story)

---

## 3. Modelo de Datos

**Prompt 1:**
> "let's change all naming to English plz"

**Contexto**: El modelo de datos usa nombres en inglés (User, PurchaseProcess, AnalyzedListing, Checklist) mientras que la documentación está en español. Esta decisión afecta a todo el schema de Prisma y los value objects del dominio.

**Herramienta**: Claude (OpenCode)

**Ajuste humano**: El autor estableció la convención bilingüe. El asistente renombró consistentemente todas las entidades y atributos al inglés en el modelo de datos, manteniendo la documentación explicativa en español.

**Artefacto resultante**: `specs/001-realista-mvp/data-model.md` (Prisma schema, value objects), `specs/001-realista-mvp/spec.md` (Key Entities)

---

**Prompt 2:**
> "Full stack from day 1 — all data in PostgreSQL via API, including checklist progress and dashboard state."

**Contexto**: Durante /speckit.clarify, el autor decidió que todos los datos se persisten en PostgreSQL desde el día 1, en lugar de usar localStorage/IndexedDB en el cliente.

**Herramienta**: Claude (OpenCode, spec-kit)

**Ajuste humano**: El autor eligió la opción C (Full stack from start) sobre client-first o server-only. Esta decisión implica que el backend con PostgreSQL es necesario desde el inicio, encareciendo el setup pero garantizando una arquitectura más robusta.

**Artefacto resultante**: `specs/001-realista-mvp/spec.md` (FR-007), `specs/001-realista-mvp/data-model.md` (Prisma schema)

---

**Prompt 3:**
> "PerfilFinanciero stored as JSON value object in PurchaseProcess (no separate table needed for MVP)."

**Contexto**: Decisión de modelar el perfil financiero como JSON dentro de PurchaseProcess en lugar de una tabla separada. Esto simplifica el schema para el MVP sin perder flexibilidad.

**Herramienta**: Claude (OpenCode, skill brainstorming)

**Ajuste humano**: El autor aceptó la recomendación del asistente de usar JSON para el perfil financiero. Si en el futuro se necesita consultar por atributos financieros, se puede migrar a una tabla separada.

**Artefacto resultante**: `specs/001-realista-mvp/data-model.md` (financialProfile: Json?)

---

## 4. Especificación de la API

**Prompt 1:**
> "OpenRouter — single API key, provider-agnostic, model switching, cheaper for development."

**Contexto**: Durante /speckit.clarify, el autor eligió OpenRouter como gateway LLM en lugar de OpenAI directo o Anthropic directo. Esta decisión afecta al diseño del adapter y a la gestión de secretos.

**Herramienta**: Claude (OpenCode, spec-kit)

**Ajuste humano**: El autor eligió la opción D (OpenRouter) sobre las recomendaciones del asistente (Anthropic). OpenRouter permite cambiar de modelo sin cambiar código, lo que es más flexible para un proyecto educativo.

**Artefacto resultante**: `specs/001-realista-mvp/spec.md` (FR-002), `specs/001-realista-mvp/contracts/api.md`, `specs/001-realista-mvp/research.md` (OpenRouter LLM Gateway)

---

**Prompt 2:**
> "Cheerio — lightweight server-side HTML parsing. .m. mobile subdomain fallback for JS-rendered pages. No headless browser."

**Contexto**: Decisión sobre la estrategia de parseo HTML durante /speckit.clarify. El autor aceptó la recomendación del asistente (Cheerio).

**Herramienta**: Claude (OpenCode, spec-kit)

**Ajuste humano**: El autor aceptó la recomendación (opción A). El asistente argumentó que Cheerio es suficiente para el 95% de los portales inmobiliarios españoles que renderizan en servidor, y el subdominio .m. cubre la mayoría de edge cases.

**Artefacto resultante**: `specs/001-realista-mvp/spec.md` (FR-001), `specs/001-realista-mvp/research.md` (Cheerio HTML Parsing Strategy)

---

**Prompt 3:**
> "The API design section with REST endpoints for listings, purchase processes, checklist, and session."

**Contexto**: El diseño de la API se definió durante la fase de brainstorming y se formalizó en /speckit.plan. El autor aprobó cada endpoint incrementalmente.

**Herramienta**: Claude (OpenCode, skill brainstorming)

**Ajuste humano**: El autor aprobó la estructura de endpoints sección por sección. La API sigue un diseño REST estándar con recursos claros: listings, purchase-processes, checklist, session.

**Artefacto resultante**: `specs/001-realista-mvp/contracts/api.md` (9 endpoints documentados)

---

## 5. Historias de Usuario

**Prompt 1:**
> "I'd go with A but then I feel I fall short in features. What else could I add? My goals is to ease the most common painpoints for the Spanish first home buyers."

**Contexto**: El autor rechazó un scope reducido (3 historias) y pidió expandirlo manteniendo el foco en puntos de dolor reales del comprador español.

**Herramienta**: Claude (OpenCode, skill brainstorming)

**Ajuste humano**: El autor conocía los pain points por experiencia personal. El asistente propuso varias opciones; el autor refinó y priorizó basándose en su conocimiento de dominio.

**Artefacto resultante**: 5 historias de usuario en `specs/001-realista-mvp/spec.md`

---

**Prompt 2:**
> "I believe the mortgage thing could pack a punch compared to the rest"

**Contexto**: El autor identificó el Mortgage Compass como la feature más fuerte del proyecto, diferenciándola del Listing Lens (más derivativo) y el Dashboard (más utilitario).

**Herramienta**: Claude (OpenCode, skill brainstorming)

**Ajuste humano**: El autor priorizó el Mortgage Compass como P1 (mismo nivel que Listing Lens) y como el "core differentiator" del proyecto. Esta decisión de producto es 100% criterio humano basado en conocimiento del mercado español.

**Artefacto resultante**: US-02 Mortgage Compass (P1) en `specs/001-realista-mvp/spec.md`

---

**Prompt 3:**
> "even if an E2E flow entirely, I believe each feature should be independently accesible if the user wants."

**Contexto**: El autor rechazó un wizard secuencial forzado y pidió que cada herramienta fuera accesible independientemente desde el dashboard.

**Herramienta**: Claude (OpenCode, skill brainstorming)

**Ajuste humano**: Decisión de UX basada en el principio de que el usuario no debería estar obligado a seguir un flujo lineal. El dashboard actúa como hub de navegación, no como paso obligatorio.

**Artefacto resultante**: `specs/001-realista-mvp/spec.md` (User Story 3 Dashboard), `specs/001-realista-mvp/plan.md` (Project Structure)

---

## 6. Tickets de Trabajo

**Prompt 1:**
> "/speckit.tasks"

**Contexto**: El comando de spec-kit que generó las 91 tareas organizadas por fase y user story, con dependencias, tests, y oportunidades de paralelización.

**Herramienta**: Claude (OpenCode, spec-kit)

**Ajuste humano**: El autor validó la estructura general. Las tareas de test se incluyeron como obligatorias (no opcionales) porque el Constitution Principle II establece TDD como non-negotiable.

**Artefacto resultante**: `specs/001-realista-mvp/tasks.md` (91 tareas, 8 fases)

---

**Prompt 2:**
> "Would it be too much to add TDD to the project?"

**Contexto**: El autor verificó que TDD estuviera cubierto. El asistente confirmó que ya estaba integrado desde la constitución.

**Herramienta**: Claude (OpenCode)

**Ajuste humano**: El autor no necesitó añadir nada — TDD ya era un principio fundacional. La pregunta sirvió como verificación de que el proyecto cumplía con las buenas prácticas esperadas por la cohorte.

**Artefacto resultante**: `.specify/memory/constitution.md` (Principle II), `specs/001-realista-mvp/tasks.md` (17 test tasks)

---

**Prompt 3:**
> "Creo que debería crear un .gitignore ahora que evita committear archivos versionados innecesarios"

**Contexto**: Configuración de .gitignore para excluir node_modules, .env, .opencode/, y archivos de build. El spec-kit advirtió que .opencode/ podría almacenar credenciales en el futuro.

**Herramienta**: Claude (OpenCode)

**Ajuste humano**: El autor decidió versionar .specify/ (templates, scripts, memory) pero ignorar .opencode/ por seguridad. El asistente implementó la configuración.

**Artefacto resultante**: `.gitignore`

---

## 7. Pull Requests

**Prompt 1:**
> "rename: HomePath -> Realista + spec translated to Spanish"

**Contexto**: PR conceptual que representa el renombrado del proyecto y la traducción de la especificación al español. Este fue el cambio más significativo en la identidad del producto.

**Herramienta**: Claude (OpenCode, git)

**Ajuste humano**: El autor rechazó 8+ nombres propuestos por el asistente antes de decidirse por "Realista". El naming fue la decisión más iterada de todo el proyecto.

**Commit**: `0fc9f69 rename: HomePath -> Realista + spec translated to Spanish`

---

**Prompt 2:**
> "plan: implementation plan + research + data model + contracts + quickstart"

**Contexto**: PR que representa la generación de todos los artefactos de la fase de planificación: plan de implementación, investigación, modelo de datos, contratos API y guía de inicio rápido.

**Herramienta**: Claude (OpenCode, spec-kit)

**Ajuste humano**: El autor revisó y aprobó cada artefacto. El research.md documenta 7 decisiones técnicas con rationale, alternativas consideradas y consecuencias.

**Commit**: `e6fe3c5 plan: implementation plan + research + data model + contracts + quickstart`

---

**Prompt 3:**
> "tasks: 91 tasks across 8 phases, TDD per user story"

**Contexto**: PR que representa la generación del desglose de tareas. 91 tareas organizadas por user story, con tests primero, dependencias claras y oportunidades de paralelización.

**Herramienta**: Claude (OpenCode, spec-kit)

**Ajuste humano**: El autor aprobó la estructura de 8 fases y la asignación de tareas por user story. La decisión de incluir 17 tareas de test como obligatorias refleja el principio constitucional de TDD.

**Commit**: `a8fd5d7 tasks: 91 tasks across 8 phases, TDD per user story`

---

## Nota sobre SDD y prompts

El proyecto siguió Spec-Driven Development con spec-kit de GitHub. Esto significa que los árboles de decisión completos están documentados en los artefactos SDD:

- `specs/001-realista-mvp/spec.md` — requerimientos e historias de usuario
- `specs/001-realista-mvp/plan.md` — decisiones de arquitectura y stack
- `specs/001-realista-mvp/research.md` — 7 decisiones técnicas con rationale y alternativas
- `specs/001-realista-mvp/data-model.md` — schema Prisma y value objects
- `specs/001-realista-mvp/contracts/api.md` — 9 endpoints REST documentados
- `specs/001-realista-mvp/tasks.md` — 91 tareas con dependencias y tests
- `.specify/memory/constitution.md` — 6 principios de gobierno del proyecto
- `docs/adr/` — 3 Architecture Decision Records

Los prompts listados arriba son los que dispararon las decisiones clave. La documentación completa de cada decisión (contexto, alternativas, consecuencias) está en los artefactos SDD correspondientes.