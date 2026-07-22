> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o los de corrección o adición de funcionalidades que consideres más relevantes.
> Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras.
>
> Fuente Notion: [Para la entrega del projecto a LIDR](https://app.notion.com/p/3909dccf4e1880008971ebefe0b51484)

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

**Prompt 1** — Origen del producto: perfil del Lead y qué pedir a Claude primero.

```markdown
Soy Lead Engineer de un equipo de programación movil en nativo en eDreams. Mi trabajo se suele separar en 3 partes: people management (que me lleva la mayoría del tiempo), business (asegurar que estamos trabajando en la parte de producto adecuada y el impacto que generará nuestro trabajo en usuario) y tech excellence (la parte en la que me tengo que asegurar de la excelencia técnica de los desarrollos del equipo).
El equipo tiene 3 desarrolladores android, 3 iOS y un backend, de diferentes niveles de experiencia en cada campo. Además trabajamos con una Product Manager y un Product Designer.

Me gustaría saber para mi tipo de perfil y con el contexto qeu te he dado, qué me puede ofrecer Claude, qué es lo primero en lo que podría trabajar contigo.
```

**Prompt 2** — Discovery formal del problema, actores y flujos (base del PRD / Lean Canvas).

```markdown
Actúa como experto en management de equipos tech.
Necesito hacer el discovery de una aplicación para self-management y
para diseñar su primera versión.

Respóndeme estas preguntas de discovery:
1. ¿Qué problema resuelve y por qué hacerlo custom?
2. ¿Qué actores intervienen en un ecosistema asi? (roles, sistemas externos)
3. ¿Cuáles son los flujos críticos que esta implementación debe soportar?
5. ¿Qué herramientas así existen hoy y cuál es su propuesta de valor?
6. ¿Qué pain points tienen los usuarios
   con las integraciones actuales?

Sé específico y técnico. Quiero información real, no genérica.
```

**Prompt 3** — *(no hay un tercer prompt de “descripción de producto” distinto; la formalización en user stories y el `product-agent` están en [§5](#5-historias-de-usuario).)*

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura**

**Prompt 1** — Encargo inicial de Architecture.md (Clean por feature, SOLID, TDD).

```markdown
Eres arquitecto Senior de Android.
Tenemos la definicion del project en el PRD en notion "PRD — LeadKit MVP v1: "Feedback in 20 Seconds""
Quiero qeu definamos la parte técnica de Android.
En cuanto a la arquitectura quiero que tenga separacion de capas por feature y dentro por capas Clean.
Define buenas prácticas como uso de SOLID principles, de patrones de diseño , y usaremos siempre TDD.
Genera un fichero MD con lo más importante de esto. El fichero queiero que sea conciso pero también quiero ejemplos de uso de cada cosa para guiar a la IA.
```

**Prompt 2** — Recorte de alcance modular (un `core`, features) y clarificación P0/P1/P2.

```markdown
Me parece demasiado esa arquitectura, pongamos solamente un core.
A priori veo qeu feature-capture-feedback podría ir junto . La de feature-team la dejamos como modo de ejemplo aunque no forma parte del v1.
Sobre elo de TDD que me dices , pone esto en el documento: "No UI test required for P1/P2 items until they're built.", que es P1/P2? a qué te refieres con P0?
```

**Prompt 3** — *(la decisión “un módulo + paquetes + capas” es de estructura de ficheros → [§2.3 Prompt 1](#23-descripción-de-alto-nivel-del-proyecto-y-estructura-de-ficheros).)*

### **2.2. Descripción de componentes principales**

**Prompt 1** — Design system → bases de UI (tokens/componentes) vía tickets, sin sobre-ingeniería.

```markdown
Actúa como senior android developer especializado en design system.
El product designer te ha mandado esto.
  @/Users/anaaguilar/Library/Application Support/Claude/local-agent-mode-sessions/5af9702f-4d0b-4435-8716-a289659c2854/55c0942d-6e6c-4fc1-a8e5-5f1ddcf89d8e/local_33b17249-fef2-49d0-b628-a5207031ad32/outputs/design-principles.md
Con estas especificaciones, vamos a cambiar el diseño de la aplicación. Te paso algunos ficheros generados por si fueran de ayuda, pero no metas cosas qeu no son necesarias. No hagas sobre-ingeniería, keep it simple
@/Users/anaaguilar/Library/Application Support/Claude/local-agent-mode-sessions/5af9702f-4d0b-4435-8716-a289659c2854/55c0942d-6e6c-4fc1-a8e5-5f1ddcf89d8e/local_33b17249-fef2-49d0-b628-a5207031ad32/outputs/Color.kt @/Users/anaaguilar/Library/Application Support/Claude/local-agent-mode-sessions/5af9702f-4d0b-4435-8716-a289659c2854/55c0942d-6e6c-4fc1-a8e5-5f1ddcf89d8e/local_33b17249-fef2-49d0-b628-a5207031ad32/outputs/Dimens.kt @/Users/anaaguilar/Library/Application Support/Claude/local-agent-mode-sessions/5af9702f-4d0b-4435-8716-a289659c2854/55c0942d-6e6c-4fc1-a8e5-5f1ddcf89d8e/local_33b17249-fef2-49d0-b628-a5207031ad32/outputs/Shape.kt @/Users/anaaguilar/Library/Application Support/Claude/local-agent-mode-sessions/5af9702f-4d0b-4435-8716-a289659c2854/55c0942d-6e6c-4fc1-a8e5-5f1ddcf89d8e/local_33b17249-fef2-49d0-b628-a5207031ad32/outputs/Theme.kt @/Users/anaaguilar/Library/Application Support/Claude/local-agent-mode-sessions/5af9702f-4d0b-4435-8716-a289659c2854/55c0942d-6e6c-4fc1-a8e5-5f1ddcf89d8e/local_33b17249-fef2-49d0-b628-a5207031ad32/outputs/Type.kt
Discute/trabaja con el diseñador (@/Users/anaaguilar/Library/Application Support/Claude/local-agent-mode-sessions/5af9702f-4d0b-4435-8716-a289659c2854/55c0942d-6e6c-4fc1-a8e5-5f1ddcf89d8e/local_33b17249-fef2-49d0-b628-a5207031ad32/outputs/leadkit_design_agent.md  ) para llegar a un acuerdo en los requisitos pedidos y la complejidad técnica que pueda suponer.
El outcome quiero que sea un ticket (o más de uno si lo ves necesario) donde se pongan las bases del diseño para empezar a iterar la aplicación con en base al diseño propuesto por el diseñador.
```

**Prompt 2** — Slim del sistema de color para alinear código con `design-principles.md`.

```markdown
## Goal
Slim LeadKit’s color system so code matches `docs/design-principles.md` (“deliberately small”) — keep the app compiling and visually equivalent for current screens, remove unused / speculative tokens.

Do NOT expand scope. Do NOT restyle screens. Do NOT add components. Do NOT invent new hex values.

## Product constraints (from AGENTS.md / design-principles.md)
- Single-user Android MVP; warm coral system; dark mode via `isSystemInDarkTheme()`.
- Screens must keep using `MaterialTheme.colorScheme` + `LeadKitExtras.extendedColors` — never raw hex in UI.
- Update `docs/design-principles.md` in the same change if the public token table changes.
- English only for code, comments, docs, commits.

## What to KEEP (public semantic roles)

### MaterialTheme.colorScheme (map these; leave unused M3 slots at safe defaults or omit if builder allows)
- primary / onPrimary
- primaryContainer / onPrimaryContainer
- background / onBackground
- surface / onSurface / onSurfaceVariant
- outline
- error / onError
- errorContainer / onErrorContainer  (keep — OutlinedTextField / M3 can consume these)

### LeadKitExtras.extendedColors — slim to ONLY:
- textMuted
- success
- warning

Remove from `LeadKitExtendedColors`:
- onSuccess, successContainer, onSuccessContainer
- onWarning, warningContainer, onWarningContainer

If any call site used those (unlikely — grep first), migrate to the nearest kept role or leave a TODO only if impossible without UI redesign (prefer migrate).

## What to DELETE from Color.kt palette objects
Dead steps with no role (grep to confirm unused outside Color.kt):
- CoralPalette.Coral400
- WarmNeutral.Neutral200
- WarmNeutral.Neutral800

Also delete Semantic teal/amber container steps that only fed the removed extended fields:
- Teal50, Teal800 (keep TealFill + Teal100 for light/dark success)
- Amber50, Amber800 (keep AmberFill + Amber100 for light/dark warning)
- Keep RedFill, Red50, Red100, Red800 as needed for error / errorContainer / onErrorContainer

After deletions, every remaining hex in Color.kt must map to at least one scheme or extended role.

## Internal structure preference
- Prefer making palette objects `private` (or nested private vals) so feature code cannot import CoralPalette/WarmNeutral/Semantic directly — only ColorScheme + LeadKitExtras.
- If making them private is a large churn, at minimum stop exporting unused vals; document that screens must not reference palette objects.

## surfaceVariant / outlineVariant
- Today light `surfaceVariant` == Coral50 (== primaryContainer). That duplicates brand tint.
- Change light `surfaceVariant` to a warm neutral (e.g. Neutral50 or the same as outlineVariant’s source) so M3 secondary surfaces stay neutral, not coral.
- Keep `outlineVariant` mapped to a subtle neutral border (already Neutral50 / dark border strong) — no visual hunt required if unused in app code.
- Do not change primaryContainer (still coral tint for badge/avatar).

## textMuted
- Keep the role in extended colors (documented for hints/timestamps).
- Do not invent new UI to “use” it in this ticket.
- Optionally add one sentence in design-principles.md: prefer `onSurfaceVariant` for secondary body; reserve `textMuted` for hints/timestamps when those exist.

## Docs
Update `docs/design-principles.md`:
- Color token table must match code after the slim-down.
- Remove or amend the Coral400 “no assigned role yet” paragraph — token is gone.
- Extended colors section: only textMuted, success, warning (no on*/container pairs).
- Keep the “deliberately small / do not add a token for a single case” rules.

Update `docs/Progress.md` briefly if you touch design-system status (one short note).

## Verification
1. Grep: no references to deleted symbols.
2. `cd android && ./gradlew assembleDebug testDebugUnitTest ktlintCheck`
3. Spot-check: PrimaryButton still coral; ContextBadge/Avatar still primaryContainer; RecordingIndicator success still teal; FeedbackTypeVisual Strength/Growth still success/warning; TokenEntry OutlinedTextField still themed.

## Out of scope
- Restyling capture/auth screens
- Wiring LeadKitAvatar into screens
- Changing typography, spacing, shapes
- Adding success/warning filled chips “for later”
- Committing unless I explicitly ask

## Done when
- Public color API is deliberately small and matches design-principles.md
- App builds green
- Current UI roles still resolve (no visual redesign intended)
```

**Prompt 3** — *(el subagente de code review no describe componentes de la app; vive en [§7](#7-pull-requests) / seguridad en [§2.5](#25-seguridad).)*

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1** — Un módulo, paquetes por capa, y dónde viven los tests (no en `src/main/.../core`).

```markdown
si, prefiero todo en el mismo módulo y separado por packetes. Me gustaría qeu la IA también estuviera pendiente de no saltarnos las capas.
testing tiene sentido qeu esté en src/main/java/.../core/? no tendria que estar si acaso en el package de test?
```

**Prompt 2** — Fragmento de [§2.1 Prompt 2](#21-diagrama-de-arquitectura) (consolidación de features / `core`):

```markdown
… pongamos solamente un core.
A priori veo qeu feature-capture-feedback podría ir junto . La de feature-team la dejamos como modo de ejemplo aunque no forma parte del v1.
```

**Prompt 3** — *(Architecture.md completo en [§2.1 Prompt 1](#21-diagrama-de-arquitectura); no se repite aquí.)*

### **2.4. Infraestructura y despliegue**

**Prompt 1** — Fragmento de [§6 Prompt 1](#6-tickets-de-trabajo) (setup Notion + token fuera del repo; sin CI/CD ni store en v1):

```markdown
2. El token lo podemos poner en un .env local, actualiza el ticket en JIRA, deberías tener permiso
3. Solo tengo un workspace en notion, si hay ambiguedad preguntame antes de hacer nada
4. Sobre el criterio de Done, en este caso podria ser token creado y database creada en el caso qeu las hagamos.
```

**Prompt 2** — Fragmento de [§1 Prompt 1](#1-descripción-general-del-producto) (origen del enfoque “app personal + Notion/Claude como infra”, sin backend propio):

```markdown
… qué me puede ofrecer Claude, qué es lo primero en lo que podría trabajar contigo.
```

**Prompt 3** — *(sin prompt dedicado a CI/CD o store — despliegue = `assembleDebug` / `installDebug` local.)*

### **2.5. Seguridad**

**Prompt 1** — Fragmento de [§7 Prompt 1](#7-pull-requests) (checklist de seguridad Android en el agente de review; prioridad seguridad > arquitectura):

```markdown
3. Busca si existe alguna política de seguridad explícita en el repo (SECURITY.md, reglas
   de lint de seguridad, …). Si no existe nada, dilo, y aplica de todos modos el checklist
   de seguridad Android estándar (secretos hardcodeados, SharedPreferences en claro,
   componentes exportados sin permisos, PendingIntent mutable, WebView con JS habilitado
   sin necesidad, cleartext traffic, logs con PII, deep links sin validar, permisos excesivos).
…
- Una instrucción explícita de … NO rebajar la severidad de un hallazgo de seguridad
  "porque es un MVP".
```

**Prompt 2** — Fragmento de [§6 Prompt 1](#6-tickets-de-trabajo) (token fuera del código):

```markdown
2. El token lo podemos poner en un .env local, actualiza el ticket en JIRA, deberías tener permiso
```

**Prompt 3** — *(Keystore / no `SharedPreferences` en claro: cubierto por el checklist del Prompt 1 y las Closed Decisions del repo; no hay un tercer prompt distinto.)*

### **2.6. Tests**

**Prompt 1** — Fragmento de [§2.1 Prompt 2](#21-diagrama-de-arquitectura) (política TDD / UI tests por prioridad):

```markdown
Sobre elo de TDD que me dices , pone esto en el documento: "No UI test required for P1/P2 items until they're built.", que es P1/P2? a qué te refieres con P0?
```

**Prompt 2** — Fragmento de [§2.3 Prompt 1](#23-descripción-de-alto-nivel-del-proyecto-y-estructura-de-ficheros) (ubicación de tests):

```markdown
testing tiene sentido qeu esté en src/main/java/.../core/? no tendria que estar si acaso en el package de test?
```

**Prompt 3** — Fragmento de [§2.1 Prompt 1](#21-diagrama-de-arquitectura) (TDD como regla de arquitectura):

```markdown
… y usaremos siempre TDD.
```

---

## 3. Modelo de Datos

**Prompt 1** — Fragmento de [§6 Prompt 1](#6-tickets-de-trabajo) (decisión de DB centralizada de feedback en Notion):

```markdown
1. No tengo uma centralized database aún. Tengo cada persona del equipo en una página de notion y dentro de esa página está la database de feedback.
…
Tendría que crear una nueva database para que esté centralizado todo el feedback. Lo podemos hacer en este mismo ticket. No hace falta migrar los datos de feedback que tengo ahora.
Añade al ticket lo necesario para hacer esto
…
5. Elimina del ticket lo de la feedback database
```

**Prompt 2** — *(el prompt de Architecture.md no define el esquema Notion; no pertenece a esta sección. Schema = Closed Decisions + DB creada en el ticket de [§6](#6-tickets-de-trabajo).)*

**Prompt 3** — *(la nomenclatura ✅/❌ es de seguimiento de historias/progreso → [§5 Prompt 3](#5-historias-de-usuario), no del modelo de datos.)*

---

## 4. Especificación de la API

**Prompt 1** — Fragmento de [§6 Prompt 1](#6-tickets-de-trabajo) (Notion como API externa del MVP; no hay backend propio ni OpenAPI):

```markdown
1. No tengo uma centralized database aún. …
Tendría que crear una nueva database para que esté centralizado todo el feedback. …
2. El token lo podemos poner en un .env local …
```

**Prompt 2** — Fragmento de [§7 Prompt 1](#7-pull-requests) / [§2.5](#25-seguridad) (restricciones que condicionan clientes Notion/Claude: Keystore, sin secretos en claro, cleartext, PII en logs):

```markdown
… checklist de seguridad Android estándar (secretos hardcodeados, SharedPreferences en claro,
… cleartext traffic, logs con PII, …).
```

**Prompt 3** — *(sin prompt dedicado a OpenAPI — los contratos del README se documentaron a partir del código Retrofit.)*

---

## 5. Historias de Usuario

**Prompt 1** — Formalizar el agente de producto y continuar con user stories.

```markdown
Wow, no sabía que podia hacer esto me encanta.
Podríamos tener un product-agent.md con este agente de producto para LeadKit, para que lo pueda usar en otras plataformas?
Por cierto, para seguir con las user stories, tiene sentido qeu el agente sea mejor un developer o leader tech sobre todo porqeu la primera fase son tareas más tecnicas verdad?
```

**Prompt 2** — Referencia a [§1 Prompt 2](#1-descripción-general-del-producto) (discovery → insumos de las historias). Fragmento:

```markdown
Necesito hacer el discovery de una aplicación para self-management y
para diseñar su primera versión.
…
3. ¿Cuáles son los flujos críticos que esta implementación debe soportar?
```

**Prompt 3** — Mejorar el tracking de estado de historias/progreso (notación ✅/❌/-).

```markdown
Se te ocurre una manera de hacerlo más eficiente que con mi nomenclatura propia de ✅ ❌ y -? La veo muy rudimentaria
```

---

## 6. Tickets de Trabajo

**Prompt 1** — Enriquecer / corregir un ticket real (KAN-2): DB Notion + token + DoD + limpieza de alcance.

```markdown
Actúa como Senior Software Engineer de Android.
Dada la especificación del ticket KAN-2
1. No tengo uma centralized database aún. Tengo cada persona del equipo en una página de notion y dentro de esa página está la database de feedback.
Mira lo que tengo ahora en notion en la página uqe se llama XXXXXX como ejemplo, y su database de feedback es https://www.notion.so/16ed20e64c2642cab56e3cb65c89e248?v=72e75e5e53904b56b3af91ed17b3d49c&source=copy_link
Tendría que crear una nueva database para que esté centralizado todo el feedback. Lo podemos hacer en este mismo ticket. No hace falta migrar los datos de feedback que tengo ahora.
Añade al ticket lo necesario para hacer esto
2. El token lo podemos poner en un .env local, actualiza el ticket en JIRA, deberías tener permiso
3. Solo tengo un workspace en notion, si hay ambiguedad preguntame antes de hacer nada
4. Sobre el criterio de Done, en este caso podria ser token creado y database creada en el caso qeu las hagamos.
5. Elimina del ticket lo de la feedback database
```

**Prompt 2** — Fragmento de [§2.2 Prompt 1](#22-descripción-de-componentes-principales) (outcome explícito = tickets de design system):

```markdown
El outcome quiero que sea un ticket (o más de uno si lo ves necesario) donde se pongan las bases del diseño para empezar a iterar la aplicación con en base al diseño propuesto por el diseñador.
```

**Prompt 3** — Fragmento de [§2.2 Prompt 2](#22-descripción-de-componentes-principales) (ticket de implementación acotado; el cuerpo completo está allí):

```markdown
## Goal
Slim LeadKit’s color system so code matches `docs/design-principles.md` (“deliberately small”) …
## Done when
- Public color API is deliberately small and matches design-principles.md
- App builds green
…
```

---

## 7. Pull Requests

**Prompt 1** — Subagente de code review Android (validación contra diff/PR real).

```markdown
Quiero que crees un subagente de Claude Code para hacer code review de cambios Android,
guardado en .claude/agents/android-code-reviewer.md. Antes de escribir el fichero, haz esto:

1. Localiza y lee Architecture.md (o el documento equivalente si tiene otro nombre) y
   extrae explícitamente: patrón de presentación (MVVM/MVI/otro), dirección permitida de
   dependencias entre capas y módulos, convención de inyección de dependencias, convención
   de threading/corrutinas, convención de manejo de errores, convención de nombrado, y
   reglas de testing obligatorias. Si algo de esto no está documentado, anótalo como
   "no definido" en vez de inventarlo.

2. Inspecciona la estructura real de módulos del repo (build.gradle.kts / settings.gradle.kts,
   carpetas de módulos) para saber qué módulos existen y qué dependencias declara cada uno
   entre sí. Compáralo con lo que dice Architecture.md y anota cualquier discrepancia que
   encuentres — puede ser deuda de documentación o puede ser una violación ya existente.

3. Busca si existe alguna política de seguridad explícita en el repo (SECURITY.md, reglas
   de lint de seguridad, configuración de detekt/ktlint con reglas custom, proguard rules).
   Si no existe nada, dilo, y aplica de todos modos el checklist de seguridad Android
   estándar (secretos hardcodeados, SharedPreferences en claro, componentes exportados sin
   permisos, PendingIntent mutable, WebView con JS habilitado sin necesidad, cleartext
   traffic, logs con PII, deep links sin validar, permisos excesivos).

4. Con todo lo anterior, escribe el fichero .claude/agents/android-code-reviewer.md con:
   - Frontmatter: name, description (debe funcionar como regla de disparo automático:
     "Usa este agente PROACTIVAMENTE cada vez que se pida revisar un PR, diff o cambio de
     código Kotlin/Java, o tras escribir/modificar código Android" — sé explícito, no vago),
     tools: Read, Grep, Glob, Bash (solo lectura, sin Write/Edit — este agente audita,
     no parchea), model: el que tengas configurado por defecto para revisión de código.
   - Cuerpo (system prompt) que incluya, en este orden de prioridad: seguridad > cumplimiento
     de arquitectura (citando la regla concreta incumplida de Architecture.md) > correctitud
     de plataforma (coroutines, lifecycle, memory leaks, Compose si aplica) > mantenibilidad.
   - Formato de salida obligatorio en tabla con severidad (Crítico/Alto/Sugerencia), no un
     texto libre.
   - Una instrucción explícita de NO inventar reglas de arquitectura que no estén en el
     documento, y de NO rebajar la severidad de un hallazgo de seguridad "porque es un MVP".

5. Antes de darlo por terminado, valídalo: coge el diff de mi último PR mergeado (o pídeme
   uno si no tienes acceso a git log) y ejecútalo contra el agente recién creado. Enséñame
   el resultado para que yo decida si el nivel de ruido/señal es el correcto antes de que el
   equipo lo use.

No me expliques la teoría de subagentes, ve directo a inspeccionar el repo y hacer las
preguntas que necesites si algo no está claro (p.ej. dónde está Architecture.md si no lo
encuentras, o qué modelo usar).
```

**Prompt 2** — *(Architecture.md y “un módulo + paquetes” no son prompts de PR; ver [§2.1](#21-diagrama-de-arquitectura) y [§2.3](#23-descripción-de-alto-nivel-del-proyecto-y-estructura-de-ficheros).)*

**Prompt 3** — *(sin segundo/tercer prompt dedicado a crear o mergear PRs; el flujo de review queda cubierto por Prompt 1.)*

---

*Prompts tomados de la página Notion «Para la entrega del projecto a LIDR» (22 jul 2026). Se preserva el texto original (incl. typos) como evidencia del uso real de asistentes. Reorganizado: cada prompt completo aparece una sola vez; el resto son fragmentos + referencia a la sección canónica.*
