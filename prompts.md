# prompts.md — Prompts relevantes del proceso de diseño y documentación de LongX

> Registro de los prompts principales usados durante la sesión de trabajo que produjo el PRD (`LONGX.md`), el plan de implementación (`LONGX_IMPLEMENTATION.md`) y el `README.md` del proyecto. Se transcriben **verbatim** en su idioma original (inglés/español según el momento), numerados por fase, con una nota de qué artefacto produjo cada uno. Los prompts de decisión cortos se agrupan con su fase.

---

## Fase 1 — Kickoff: rol, contexto y panorama de features

### P1 — Prompt inicial de sesión (rol de Product Owner + contexto completo + método de trabajo por fases)

El prompt fundacional de toda la sesión. Define el rol del asistente, el contexto de negocio, las personas objetivo (bloqueadas), el objetivo de la sesión, el método de trabajo por fases con pausas de confirmación, y la primera tarea concreta:

```
ROLE & CONTEXT
You are an experienced product owner / fintech product strategist with deep,
current knowledge of the retail crypto trading and exchange market, behavioral
finance, and trading-discipline products. You understand why retail traders blow
up accounts (overtrading, revenge trading, moving stops, oversized leverage) and
how product design can counteract those behaviors.

Company context: We are LongX, building "the first exchange designed to help you
trade better — not more." Our thesis: the core problem in retail trading is not
analysis, it's discipline. Traditional exchanges monetize volume, leverage, and
overtrading; LongX monetizes consistency and retention. [...]

## Context (carry forward)
TARGET USERS (locked — do not re-derive, design for these):
- Persona 1 — "Martín," the Talented but Undisciplined Trader (CORE, ~50%) [...]
- Persona 2 — "Lucas," the Burned / Recovery Trader (~30%) [...]
- Persona 3 — "Diego," the Retail Pro (~20%) [...]

OBJECTIVE
By the end of this session we go from a blank page to a broad product + system
design for the LongX MVP, suitable to present to our CTO. [...]

HOW WE'LL WORK
- Proceed in phases. Do NOT produce the entire design at once.
- At the end of each phase, summarise the decisions and pause so I can confirm,
  correct, or redirect before you continue.
- State your assumptions explicitly and ask clarifying questions whenever a
  decision materially affects the design. [...]
- Keep a discipline-first / behavioral lens throughout [...]
- Be concrete and opinionated; when you recommend something, give a one-line
  rationale. When you recommend AGAINST a common exchange feature, say why [...]

PHASE 1 — FEATURE & MECHANISM LANDSCAPE (do this now)
Give me the 10–15 most important features/mechanisms that define a disciplined,
behavioral-first trading product, ordered from most to least important for our
core persona [...]. After the list, give a short second list: features common in
traditional exchanges that you would deliberately DE-EMPHASIZE, gate, or leave
OUT of scope for the LongX MVP [...]. Then stop and wait for my input before
moving to Phase 2.
```

**Produjo:** el landscape de 14 features priorizadas + la lista de anti-features deliberadamente excluidas. Técnicas destacables: asignación de rol experto, contexto bloqueado ("locked — do not re-derive"), trabajo por fases con checkpoints humanos, instrucción de opinar con rationale.

### P2 — Decisiones de Fase 1 (respuestas cortas que dirigen el diseño)

```
1. I would add a slight bounded range per tier just to make feel the user a bit
   of control but not too much so that discipline is not lost
2. I would like the AI coach reading users real exchange history on our platform
3. what do we want mercado pago for
```
```
1. it looks good
2. for now let's do: "only trades executed inside LongX,"
3. let's not include mercado pago for the MVP
```

**Produjo:** tiers con banda acotada + time-locks, alcance del coach a trades in-platform, MercadoPago fuera del MVP.

---

## Fase 2 — Diferenciación y priorización

### P3 — Brainstorm de diferenciación competitiva

```
based on you knowledge and experience as product manager, and deep knowledge on
the this industry and technology trends, think of some new features that could be
implemented to differentiate our product from the rest of the competitors in the
market that could stand out and give enormous value to our customers.
```

**Produjo:** 8 diferenciadores (tilt detection, intervención pre-trade, DQS, discipline staking, sabbaticals, credencial portable, accountability pods, funded pathway) filtrados por la lente de asimetría de incentivos.

### P4 — Incorporación selectiva al plan

```
ok add in the plan #3 Decision-quality score, decoupled from PnL
```
```
yes go with Sim fills against real live market prices
let's not do billing for now
```

**Produjo:** el DQS como primitiva por-trade + consistency score como agregado; fills contra precios reales; sin billing en MVP.

---

## Fase 3 — Diseño de sistema

### P5 — Casos de uso como analista de software

```
now let's dive deeper into system design, what are the 10 most important use
cases (in order) the way you'd describe them to a fellow software analyst?
```

**Produjo:** los 10 casos de uso (UC-01…UC-10) con actores, flujos, excepciones y entidades tocadas. Técnica: fijar la audiencia ("a un analista de software") calibra el nivel de detalle.

### P6 — Requisito de ejecución real (giro a Option B)

```
I like, also something I wanted to mention as I dont know if you took into
account or not is that I want all trades to be effectively placed in a platform
like binance or binance futures where the funds of the user will really be, is
that taken into account? if not added to the plan
```
```
I prefer option B, I dont really care if the user then goes through binance to
use its funds or do whatever with them if the user uses our app is because he is
looking for training/discipline and is committed
```

**Produjo:** la reestructuración del roadmap (Option B: MVP = gateway no-custodial sobre Binance) y el principio "commitment device, not a prison" (observar la interferencia, no combatirla).

### P7 — Diagramas de casos de uso

```
Please make use case diagrams in plantuml for those 10 use cases you made earlier?
```

**Produjo:** `longx_use_case_diagram.puml` (11 UC, includes/extends, actores).

### P8 — ERD como arquitecto senior

```
Now acting as a Senior Software Architect, and knowing all of the use cases and
their flows render an entity-relationship diagram in mermaid.
```

**Produjo:** `longx_erd.mmd` (17→20 entidades) + `longx_erd_preview.html`, con los cambios estructurales derivados de los flujos (validación 1—N con stage, órdenes/fills, snapshots).

### P9 — Alternativas de arquitectura argumentadas

```
Keep your architect hat on. We need to decide on an architecture for this system.
Propose 3 alternatives to some reasonable level of detail and argue for the best one.
```

**Produjo:** las 3 alternativas (serverless Supabase / monolito modular + worker / microservicios) evaluadas contra los 4 problemas duros del sistema, con recomendación argumentada (Option B) y triggers de revisión.

### P10 — Análisis honesto de escalabilidad

```
with your architect hat on and being completely honest, are there any flaws in
this architecture when scaling? if so, how easy will be to adapt the code base
in the future for scalability?
```

**Produjo:** los 3 flaws reales (worker singleton con estado, precios por Postgres, tablas append-only) con costo de adaptación y decisiones día-uno (sharding-aware, particionado, NAT). Técnica: pedir honestidad explícita habilita el señalamiento de debilidades del propio diseño recomendado.

### P11 — Diagrama de sistema

```
Please generate a suggested system diagram using plantuml, assuming the selected
architecture
```

**Produjo:** `longx_system_architecture.puml` con las decisiones de escalado incorporadas como estructura.

---

## Fase 4 — Contraste con el codebase existente

### P12 — Análisis del CLAUDE.md del proyecto real

```
Before moving on with the architecture I want you to check this CLAUDE.md file
which I created for this longX project which I've been working on it for a long
time now, I want you to deeply analyze it and compare it with your proposed
architectures Keeping your architect hat on.
Check that all the functionalities of the project I've been working on are
functionalities that you have considered in your plan and be completely honest
and compare it to your proposed architectures
```

**Produjo:** el mapeo honesto plan-vs-codebase (40% shell compartido, 0% core compartido), las 2 contradicciones (coach, feed) y las 3 cosas que el codebase le enseñó al plan (PWA, i18n, entry ranges).

### P13 — Resolución de contradicciones + mandato de mejora

```
regarding the contradictions to resolve:
looks good what you say about the coach but when a user proposes a trade the
coach needs to evaluate it and if it's not good what is proposing then the
coaches proposes back a good trade in a similar style or fashion of what the
user proposed.
Same for the feed it looks good to me
in general terms I want to keep the good things of what I had but I need you to
improve it and make it more professional and better architected with all your
proposals, features and use cases
```

**Produjo:** el principio "repair, don't originate" (UC-12), el feed integrado vía chokepoint, y la tabla keep/improve/replace/add + la secuencia strangler M0–M5.

### P14 — Análisis de pantallas

```
I like it, also check the attached screens.md file which contains an explanation
of the screens and functionality of the current application I made, think about
if those make sense on our plan of application and if they should be redesigned
and think if they are compatible with our plan and also think of which one would
you add remove or adapt/modify
```
```
document this on longx.md file too
```

**Produjo:** el screen map (§10 de `LONGX.md`): veredicto por pantalla, 6 pantallas nuevas, mecánicas a retirar, impacto en navegación.

---

## Fase 5 — Consolidación del PRD

### P15 — Ensamblado del dossier LONGX.md

```
Write a half-page introduction to LongX followed by a list of how it stands out
in the competition and what value it adds. After that, a list of the main
functionality, basically the features and use cases we discussed before. Put it
on a markdown file named LONGX.md

also expand a bit more on each of the features we have made use cases for but
also add the ones we did not make use cases for

* Generate a top-level C4 diagram (the "first C") for the system. Use PlantUML
  with the built-in C4 library.
* Generate a C4 "container" diagram for the system. Use PlantUML with the
  built-in C4 library.

and add in that document all of the artifacts we've created.
as a summary I need:
Description of LTI software, added value and competitive advantages. Explanation
of the main functions. Add a Lean Canvas diagram to understand the business model
Description of the 3 main use cases, with the diagram associated with each one
Data model that covers entities, attributes (name and type) and relationships
High-level system design, both explained and attached diagram
C4 diagram that goes in depth to one of the system components
```

**Produjo:** `LONGX.md` completo (11 secciones): intro, diferenciación, funcionalidades, Lean Canvas, 12 UC con secuencias de los 3 principales, modelo de datos, diseño de sistema, C4 (Context/Container/Component), roadmap, screen map, índice de artefactos.

---

## Fase 6 — Del PRD a la implementación

### P16 — Historias de usuario, backlog, tickets y estimación (rol PM/BA)

```
Act as a Senior Product Manager and Business Analyst.
Using the documents you created, which make up a basic PRD (key features, use
cases, data model...), your task is to prepare the necessary documentation to
start implementing [el proyecto]:
Generate User Stories: [...] minimum of 5 [...] use a common template for all.
All User Stories must meet the INVEST criteria. For each one include:
- Descriptive title
- Story in the format "As a [role], I want [action], so that [benefit]"
- 3 acceptance criteria in BDD format (Given/When/Then)
- Complexity estimation (S/M/L)
- Brief evaluation against INVEST
Build the Product Backlog: [...] prioritizing them as you see fit according to a
specific methodology. Experiment with different ways to generate a prompt that
can create your backlog based on the documentation [...]
User Story: For all user stories generate the work tickets. Detail them
technically, as done in planning meetings.
(Extra) Estimate the Effort: [...] (Fibonacci, Planning Poker, T-shirt sizes) [...]
Document everything in a single markdown (.md) file
```

**Produjo:** `LONGX_IMPLEMENTATION.md` — 12 US con INVEST/BDD, backlog WSJF (con el meta-prompt de scoring documentado dentro), ~70 tickets por capas, estimación Fibonacci y trazabilidad. Meta-prompt WSJF embebido en el documento:

```
"You are a BA applying WSJF. For each story, score Business Value, Time
Criticality, and Risk-Reduction/Enablement from 1–10 from the perspective of the
LongX discipline-first thesis, where a feature that prevents account destruction
or unblocks other work scores higher [...]. Then divide the summed Cost of Delay
by the story's Fibonacci size and sort descending."
```

### P17 — Decisión adapt-vs-rebuild

```
given this implementation plan I need you to analyze how to adapt it to the
current project I made specified on the attached claude.md file or if instead is
a better idea to start from scratch
I need you to think which is the best option and in case you would recommend to
take the current longx project and start adapting it [...] then tell me how to do it
```

**Produjo:** el veredicto argumentado (adaptar: el codebase y el trabajo restante son casi disjuntos) + la secuencia strangler M0–M5 mapeada al repo.

### P18 — Fase de adaptación con los mismos artefactos

```
ok so in the Longx implementation plan that you wrote modify it to contain this
adaptation you are planning also take into account that we already have a
database in supabase and step functions in there, as done with the user stories
and the creation of the product backlog do the same for this adaptation phase
```

**Produjo:** §7 de `LONGX_IMPLEMENTATION.md` — 7 historias AD-xx con INVEST/BDD, backlog WSJF de migración (con su meta-prompt propio), tickets referenciando artefactos reales del repo, estimación y trazabilidad doble (hacia el repo y hacia las US).

### P19 — Deep-dive del AI Coach

```
on this plan, can you explain me how are you planning to build the AI coach?
```

**Produjo:** la explicación de las 3 capas (análisis determinista / scoring DQS / orquestador LLM) y el principio "el LLM narra, nunca decide".

---

## Fase 7 — Políticas de calidad (documentos de reglas propios)

### P20 — Incorporación de las prácticas de Testing/TDD

```
ahora necesito que incorpores a longx Implementation plan las mejores practicas
y convenciones de testing para obtener software de alta calidad especificado en
este documento adjunto, cada implementacion de codigo a traves de cada ticket y
user story necesita desarrollarse llevando a cabo las mejores practicas
mencionadas en el documento adjunto, incorpora eso
```
*(adjunto: `testing-ia-buenas-practicas.md`)*

**Produjo:** §8 — regla de oro (humano define el QUÉ), Red→Green→Refactor por ticket, fronteras de mocking, testing trophy, mutation testing, anti-patrones de IA, Definition of Done de 11 puntos, gobernanza en `CLAUDE.md`.

### P21 — Incorporación de las reglas de Backend/Refactor (R1–R19)

```
ahora necesito que incorpores a longx Implementation plan las mejores practicas
y convenciones de desarrollo de backend y refactoring para obtener software de
alta calidad especificado en este documento adjunto, cada implementacion de
codigo a traves de cada ticket y user story necesita desarrollarse llevando a
cabo las mejores practicas mencionadas en el documento adjunto, incorpora eso.
```
*(adjunto: `backend-refactorizacion-buenas-practicas.md`)*

**Produjo:** §9 — reglas de refactor con invariantes de LongX nombrados, mapa DDD de invariantes→objetos de dominio, catálogo de ports hexagonales, casos de falso-DRY decididos, lista cerrada de patrones, checklist bloqueante.

### P22 — Incorporación de las reglas de QA/Integración/E2E/IA (R1–R34)

```
ahora necesito que incorpores a longx Implementation plan las mejores practicas
y convenciones de automated tests y QA para obtener software de alta calidad
especificado en este documento adjunto, cada implementacion de codigo a traves
de cada ticket y user story necesita desarrollarse llevando a cabo las mejores
practicas mencionadas en el documento adjunto, incorpora eso.
```
*(adjunto: `automated-tests-qa-ia-buenas-practicas.md`)*

**Produjo:** §10 — entornos con versiones fijadas, selectores semánticos con el matiz bilingüe, estabilización 5x de tests generados por IA, Gherkin con anti-patrones, lista de elementos que nunca se auto-reparan, prohibición de PII a IA externa, prompts versionados. Prompt de referencia embebido para generación de Gherkin:

```
Genera escenarios Gherkin (Feature + Scenarios) para: "<US-xx>".
Cubre: caso feliz, caso límite exacto (borde de regla), entrada inválida,
y combinación de condiciones. Reglas: un único When por escenario, lenguaje
del dominio LongX (trader, intent, session lock, DQS — nunca UI ni payloads),
Scenario Outline si los casos comparten estructura. Dominio: trading crypto
disciplinado; idioma: español; locale: es-AR. Esto es un borrador para
revisión humana, no una especificación final.
```

---

## Fase 8 — Entregables finales

### P23 — README con la estructura del template AI4Devs

```
ahora necesito que armes un README.MD que disponga de la siguiente estructura
con el contenido siguiente (https://github.com/LIDR-academy/AI4Devs-finalproject):
0. Ficha del proyecto [...]
1. Descripción general del producto [...]
2. Arquitectura del Sistema [...]
3. Modelo de Datos [...]
4. Especificación de la API [...]
5. Historias de Usuario [...] 3 de las historias principales [...]
6. Tickets de Trabajo [...] uno de backend, uno de frontend, y uno de bases de
   datos [...]
```

**Produjo:** `README.md` (~840 líneas) con diagramas convertidos a mermaid para render nativo en GitHub, OpenAPI de 3 endpoints, y los tickets/historias seleccionados.

### P24 — Este documento

```
guarda todos los prompts mas relevantes de esta conversación en un documento
llamado prompts.md
```

---

## Apéndice — Técnicas de prompting recurrentes en la sesión

1. **Asignación de rol experto por fase** ("product owner fintech", "Senior Software Architect", "Senior PM/BA") para calibrar perspectiva y nivel.
2. **Contexto bloqueado** ("locked — do not re-derive") para impedir que el modelo re-abra decisiones ya tomadas.
3. **Trabajo por fases con checkpoints humanos** ("stop and wait for my input") — el patrón estructural de toda la sesión.
4. **Petición explícita de honestidad** ("being completely honest") en los análisis de escalabilidad y de adapt-vs-rebuild, habilitando la crítica del propio diseño.
5. **Audiencia como calibrador de detalle** ("the way you'd describe them to a fellow software analyst").
6. **Exigir alternativas argumentadas antes de decidir** ("propose 3 alternatives and argue for the best one") en vez de pedir directamente "la" arquitectura.
7. **Meta-prompting documentado**: los prompts de scoring del backlog (WSJF) y de generación de Gherkin quedaron versionados dentro de los propios documentos, como pide la política §10 R31.
8. **Incorporación de documentos de reglas propios** ("cada implementación... necesita desarrollarse llevando a cabo las mejores prácticas del documento adjunto") — inyectar estándares del equipo como políticas vinculantes, no como sugerencias.
