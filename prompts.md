**Estructura de sesiones:** El proyecto atravesó dos grandes etapas. **Etapa de documentación (Sesiones 1–3):** definición del producto con el agente Analyst de BMAD, generación de la documentación técnica completa vía el agente `doc-generator`, y una revisión arquitectónica crítica que fijó el alcance del MVP y la adopción de estándares 2026. **Etapa de implementación (Sesiones 4–28):** generación de tickets por capa, scaffolding, configuración del flujo `/implement-us` y desarrollo iterativo de las User Stories (US-001 a US-014, US-017 a US-023 y US-DASH), cada una con su PR a `dev`. Este documento selecciona, por cada sección de la entrega, los prompts **más relevantes** de ambas etapas. El log cronológico íntegro vive en [docs/prompts/prompts.md](../docs/prompts/prompts.md).

> **Flujo de desarrollo (Sesiones 6–8).** A partir de la Sesión 6 se construyó el comando `/implement-us <issue>`, que orquesta el ciclo completo de una US: el agente `planning-specialist` genera `docs/changelog/US-XXX.md` (criterios de done, archivos esperados, contrato de interfaz, riesgos, scope y dependencias por ticket); luego se despachan agentes en orden **INFRA → DB → BE → FE**, con `tdd-specialist` tras cada uno y consulta a Stitch MCP antes del FE. Cada ticket genera un commit (`feat(db|be|fe):`) y la US un PR a `dev`. El board de GitHub Projects recorre Todo → In Progress → In Review → Done.

> **Decisiones de implementación que divergieron del plan original** (documentadas en los prompts de abajo): email **Resend → SMTP `aiosmtplib`** (US-004); transcripción **OpenAI `whisper-1` → Groq `whisper-large-v3`** (US-013); recordatorios **48h+24h cada 15 min → un único cron diario a las 08:00 para los turnos de mañana** (US-021); alcance IA **ampliado** para extraer diagnóstico/tratamiento *cuando el veterinario los dicta explícitamente* —sin inventarlos nunca— (US-013).

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

**Prompt 1:** *(Sesión 1 — definición inicial, rol Analyst BMAD)*

> "Quiero construir @docs/idea-inicial.md — Actuar como el agente Analyst de BMAD"

Disparó el cuestionario inicial del Analyst (10 preguntas sobre piloto, modelo SaaS, roles, notificaciones, exportación, voz, offline, validación IA, stack). Las respuestas fijaron las decisiones fundacionales: SaaS multi-clínica, 3 roles staff + portal cliente, email primero / WhatsApp después, validación IA con edición opcional, stack React + FastAPI + Postgres + Whisper + Claude.

**Prompt 2:** *(Sesión 3 — scope IA acotado al MVP)*

> "la idea que tenemos es utilizar un modelo de IA para en funcion de una historia clinica con un formato y estructura definidos, se complete la misma con la informacion transcrita de el audio/imagen/texto que carge el especialista. no se busca por ahora que el modelo genere diagnosticos o sugerencias para incluir en la historia clinica."

Cambio de alcance fundamental: la IA pasa de "genera la historia clínica" a "estructura los campos predefinidos". Se propagó a 8 archivos (features, RFs, RNFs, user stories, schema `ClinicalRecordExtraction`, Use Case 1, riesgos).

**Prompt 3:** *(Sesión 27 — ampliación del alcance IA al implementarlo)*

> "probe el flujo... me transcribio los datos del audio, pero no me seteo todos los campos de la estructura" → "si" (confirma ajustar el prompt para extraer diagnosis/treatment cuando el vet los dicta)

Al implementar US-013 se detectó que el prompt bloqueaba `diagnosis`/`treatment` aunque el vet los dictara. Se ajustó: el system prompt ahora extrae diagnóstico/tratamiento **si el vet los dicta explícitamente**, distingue `referred_medication` (lo que el dueño ya dio) de `treatment` (lo que indica el vet) y **nunca inventa**; el schema cambió esos campos de `None` fijo a `Optional[str]`. Matiz clave del MVP: la IA estructura lo dictado, no genera diagnósticos propios.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:** *(Sesión 2 — generación inicial vía doc-generator)*

> "@ia-agents/agents/doc-generator.md genera la documentacion del proyecto"

Disparó el agente `doc-generator` (rol Senior Product Manager). Produjo el PRD completo con la sección 11 (High-Level System Design) + sección 12 (C4: Context, Container, Component) usando diagramas Mermaid, base del *Figure 1* de arquitectura.

**Prompt 2:** *(Sesión 3 — revisión crítica del stack)*

> "a partir de @docs/ que opinas de la arquitectura y stack elegidos para desarrollar este sistema, que cambiarias en funcion del alcance del proyecto y de los estandares actuales?"

Revisión en tres bloques (aciertos / cambios por alcance / estándares 2026). Identificó: Celery + Redis es overkill → ARQ + cron Railway; Vercel + Railway → Railway-solo; construir agenda/grids a mano → Schedule-X + TanStack Table; prompt caching y RLS desde el día uno.

**Prompt 3:** *(Sesión 3 — aplicación de los cambios de simplificación)*

> "de los cambios de alcance sugeridos: Celery → ARQ + cron Railway; Vercel + Railway → Railway solo; Construir agenda/grids vs librerías; no apliques el cambio de no utilizar jwt + redis"

Propagó las tres decisiones a CLAUDE.md, README.md, architecture.md, prd.md, redibujando el diagrama de arquitectura general. Mantuvo JWT + Redis.

### **2.2. Descripción de componentes principales:**

**Prompt 1:** *(Sesión 3 — profundización de cada herramienta)*

> "genera un archivo info.md dentro de @docs/ que explique y profundice en cada una de las herramientas de la primera seccion de la respuesta anterior"

Creó `docs/info.md` con 4 secciones (Backend, Frontend, patrones de datos, patrones de IA) explicando cada componente: qué es, por qué es la elección correcta **para este proyecto**, ejemplo de código aplicado al dominio veterinario, buenas prácticas y riesgos.

**Prompt 2:** *(Sesión 27 — materialización del componente de IA, US-013)*

> `/implement-us 268`

Materializó el componente diferenciador: el pipeline ARQ **Groq Whisper (`whisper-large-v3`) → Claude Haiku cleanup → Claude Sonnet tool use**. Decisiones reales de componente: Groq Whisper vía SDK de OpenAI con `base_url` override; el worker crea su propia sesión con `set_config` para RLS; subida del SDK `anthropic` a `0.111.0` y corrección de model IDs (`claude-haiku-4-5-20251001`, `claude-sonnet-4-6`).

**Prompt 3:** *(Sesión 10 — componente de email: Resend → SMTP)*

> "el correo de recuperación nunca me llega" → "que otras librerías existen para enviar mail desde una cuenta configurada?" → "vamos por la opción A: aiosmtplib"

Resend sin dominio verificado solo entrega al dueño de la cuenta. Se **migró `NotificationService` de Resend a SMTP con `aiosmtplib`** (nativo async, multipart texto+HTML): nuevas vars `SMTP_*`, `resend==2.3.0` → `aiosmtplib==3.0.2`. Los sends nunca lanzan (anti-enumeración). Cambiar de proveedor es solo configuración.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:** *(Sesión 2 — estructura documentada vía doc-generator)*

> "@ia-agents/agents/doc-generator.md genera la documentacion del proyecto"

La estructura de ficheros (monorepo frontend/backend, feature-based en el front, layered en el back) se generó como parte de las secciones 2 y 3 de `architecture.md`.

**Prompt 2:** *(Sesión 3 — Expo + Tamagui desde el día 1)*

> "11. Si la migración mobile está comprometida, usar Expo desde el día uno (Expo Router + Tamagui o React Native Web)."

Cambió la estructura de `frontend/` de "React SPA reescribible a React Native" a "Expo Router + Tamagui con build web vía React Native Web desde el primer componente". Las capas `services/` y `store/` quedan portables a móvil sin reescritura.

**Prompt 3:** *(Sesión 4 — scaffolding del proyecto)*

> "procede con el scaffolding del proyecto basandote en lo que se encuentra en @docs/architecture.md"

Generó 79 archivos que materializan la estructura documentada: raíz (`docker-compose.yml`, `.env.example`, CI), backend (FastAPI con `/auth` implementado, `deps.py` con `SET LOCAL app.clinic_id` para RLS, mixins SQLAlchemy, Alembic async, ARQ, `conftest.py`) y frontend (Expo Router + Tamagui, store Zustand, axios con refresh queue, guard de auth).

### **2.4. Infraestructura y despliegue**

**Prompt 1:** *(Sesión 3 — consolidación en Railway)*

> "Vercel + Railway → Railway solo"

Reescritura de la sección de infraestructura: todos los servicios (frontend estático, backend, ARQ worker, cron, Postgres, Redis) viven en un único proyecto Railway. El reverse proxy interno elimina CORS frontend-backend; se removieron las referencias a Vercel y a Render como alternativas.

**Prompt 2:** *(Sesión 24 — recordatorios: del plan a la decisión real)*

> *(US-021, AskUserQuestion sobre el schedule del cron)* el usuario simplificó a **una corrida diaria que avisa los turnos de mañana** y **un solo recordatorio** (se descarta el de 48h)

El plan original (recordatorios 48h y 24h, cron cada 15 min) se simplificó a un cron diario `0 8 * * *` (`backend/railway.cron.json`) con `trigger_hours_before=24`. Idempotencia en dos capas: guard `has_sent` + índice UNIQUE parcial `(appointment_id, trigger_hours_before) WHERE status='sent'`. El cron corre sin JWT → bypassa RLS (`app_admin`). La hora se localiza a `clinics.timezone` (se agregó `tzdata` para resolver zonas IANA en Windows/contenedores).

**Prompt 3:** *(Sesión — estimación de billing)*

> "en funcion de las herramientas y tecnologias elegidas, realizame una estimacion de billing para el proyecto como un mvp funcional de pocos usuarios"

Produjo una tabla detallada por servicio. Total para un MVP de pocos usuarios: **~U$ 55–70/mes** en Railway-solo (la transcripción usa la capa gratuita de Groq; Claude con prompt caching es marginal a este volumen). Identificó que el cuello de botella económico no es la infraestructura sino el tiempo de los founders.

### **2.5. Seguridad**

**Prompt 1:** *(Sesión 3 — RLS como defensa en profundidad)*

> "de los cambios sugeridos para estándares 2026... 8. Defensa en profundidad para multi-tenancy: PostgreSQL Row-Level Security (RLS) además del filtro en queries; tests de regresión que validen aislamiento entre clínicas."

Incorporó RLS (setup `ENABLE/FORCE ROW LEVEL SECURITY`, policy por tabla, usuarios `app_runtime`/`app_admin`) + suite de aislamiento bloqueante en CI.

**Prompt 2:** *(Sesión 3 — entidades de auditoría append-only)*

> "es buena idea/practica incorporar al modelo de datos una entidad que registre los logs/historial de las consultas, transacciones, etc a la DB?" → "si, aplicame los cambios"

Incorporó dos tablas append-only: `audit_log` (mutaciones con diff JSONB, auto-poblada vía SQLAlchemy `after_flush`) y `clinical_record_access_log` (lecturas de historias clínicas, Ley 25.326). Append-only enforced en motor (`REVOKE UPDATE, DELETE`).

**Prompt 3:** *(Sesión 9a — bug raíz de RLS al ejercerlo contra Postgres real)*

> "cuando se quiere crear un nuevo usuario... al darle al boton crear muestra un mensaje de error inesperado"

`get_current_user` usaba `text("SET LOCAL app.clinic_id = :cid")` y PostgreSQL no acepta parámetros vinculados en `SET` → 500 en toda request autenticada (no detectado por los tests, que mockean sobre SQLite). **Fix:** `SELECT set_config('app.clinic_id', :cid, true)`. US-003 fue la primera feature que ejerció ese camino contra Postgres.

### **2.6. Tests**

**Prompt 1:** *(Sesión 3 — Playwright + syrupy)*

> "10. Testing E2E mínimo del flujo IA con Playwright; snapshot tests del prompt enviado a Claude."

Stack de testing base: pytest + pytest-asyncio (engine aiosqlite, rollback por test) + **Playwright** (E2E del flujo IA) + **syrupy** (snapshot del prompt + schema enviado a Claude, bloquea merges).

**Prompt 2:** *(Implementación — TDD por capa en `/implement-us`)*

> El flujo `/implement-us` despacha al agente `tdd-specialist` tras cada capa (DB → BE → FE), ejecutando RED→GREEN→REFACTOR.

En implementación se sumó **Jest + React Native Testing Library** para el frontend (mock de Tamagui/Expo Router/Zustand/TanStack Query). Al cierre del MVP la suite backend supera los 570 tests y la de frontend los 400.

**Prompt 3:** *(Implementación — aislamiento multi-tenant + append-only bloqueante)*

> Suite custom de pytest que verifica el aislamiento entre clínicas y que `UPDATE`/`DELETE` sobre `audit_log` desde `app_runtime` falle con `permission denied`.

Es un test **bloqueante en CI**: materializa la garantía de RLS (una clínica no ve filas de otra) y la inmutabilidad append-only directamente contra el motor Postgres, no solo en la capa ORM.

---

## 3. Modelo de Datos

**Prompt 1:** *(Sesión 2 — generación inicial del ERD)*

> "@ia-agents/agents/doc-generator.md genera la documentacion del proyecto"

Generó el ERD inicial en `data-model.md` con las entidades principales (clinics, users, clients, pets, appointments, clinical_records, clinical_records_ai, vaccinations + tablas de auditoría).

**Prompt 2:** *(Sesión — justificación de separar users vs clients)*

> "se indica la creacion de dos entidades, 'usuarios' y 'clientes'... Que justificacion encontras para tener esas 2 entidades y no unificarlas?"

Justificación: distintos FKs, distintos ciclos de vida, distintos modelos de auth (JWT staff vs JWT portal en Fase 1.5), RLS más simple con tablas separadas.

**Prompt 3:** *(Sesiones 15, 18, 19, 21 — materialización incremental en migraciones)*

> *(US-009)* `/implement-us 264` — migración `0005` crea `clinical_records` + `audit_log` + listener. *(US-023)* `0006` crea `vaccinations`. *(US-019)* `0007` agrega `cancellation_reason`. *(US-011)* `0008` crea `clinical_record_access_log`. *(US-013)* `0011` crea `clinical_records_ai` append-only.

El modelo se materializó incrementalmente en migraciones Alembic `0001`–`0011`, cada tabla dentro del ticket de la US que la necesita primero. Hallazgo recurrente: el `head` de Alembic debía confirmarse con `alembic heads` antes de encadenar `down_revision` (varias US en paralelo colgaban de la misma migración).

---

## 4. Especificación de la API

**Prompt 1:** *(Sesión 3 — endpoint `/ai/extract-record` con alcance acotado)*

> "la idea que tenemos es utilizar un modelo de IA para que, en funcion de una historia clinica con un formato y estructura definidos, se complete la misma con la informacion transcrita... necesito que modifiques los archivos del proyecto para reflejar esta decision."

El endpoint pasó de `/ai/generate-record` (genera todo) a un contrato de estructuración de los campos extraíbles.

**Prompt 2:** *(Sesión 27 — implementación del flujo IA real, US-013)*

> `/implement-us 268`

Materializó el flujo IA: `POST /ai/transcribe-voice` (202 + task_id), `GET /ai/tasks/{task_id}` (polling), y el pipeline ARQ **Groq Whisper (`whisper-large-v3`) → Claude Haiku cleanup → Claude Sonnet tool use**. Decisiones reales: Groq Whisper vía SDK de OpenAI con `base_url` override; el worker crea su propia sesión con `set_config` para RLS; subida del SDK `anthropic` a `0.111.0` y corrección de model IDs (`claude-haiku-4-5-20251001`, `claude-sonnet-4-6`).

**Prompt 3:** *(Sesión 28 — segundo endpoint del flujo IA, US-014)*

> `/implement-us 269`

`POST /ai/transcribe-upload` para subir un archivo de audio externo: valida formato (MIME con fallback a extensión) y tamaño (413 para > 20 MB), reutiliza el mismo pipeline ARQ con `input_type="upload"`. Reutilización masiva de US-013 (tabla, schema y polling sin cambios).

> **Otros endpoints implementados** a lo largo del MVP: `/auth/*` (register/login/refresh/logout/forgot-password/reset-password), `/users`, `/clients`, `/pets` (+ perfil agregado), `/search`, `/appointments` (crear/listar/reprogramar/cancelar/marcar-atendido/notifications), `/clinical-records` (crear/ver/editar/borrar/by-appointment/attachments), `/pets/{id}/vaccinations`, e internos (`/internal/notifications/send-reminders`).

---

## 5. Historias de Usuario

**Prompt 1:** *(Sesión 2 — generación inicial)*

> "@ia-agents/agents/doc-generator.md genera la documentacion del proyecto"

Generó 32 historias de usuario distribuidas en módulos.

**Prompt 2:** *(Sesión 3 — ajuste de US-013/014/015 por scope IA)*

> "no se busca por ahora que el modelo genere diagnosticos ni sugerencias terapeuticas. reescribí las historias de usuario del módulo de historia clínica asistida por IA para reflejar este alcance acotado."

Las historias del Módulo 4 se reescribieron: "que la app complete los campos predefinidos a partir de lo dictado".

**Prompt 3:** *(Sesión 22 — US emergente durante la implementación: nace US-020b)*

> "estaria bien que si ya tiene una consulta cargada, al clickear te la muestre y puedas modificarla, no seguir cargando otras" → "Si, crea la US-020-b asi se sabe que continua a esta"

Probando US-020 (marcar atendido) se detectó que se podían cargar historias duplicadas por turno y no había forma de ver la ya cargada. El `user-story-agent` redactó **US-020b** (issues #402/#403/#404): `GET /clinical-records/by-appointment/{id}` + `PATCH` de edición auditada + guard 409 anti-duplicado, y modo edición en el modal. Ejemplo de cómo el testing manual de una US generó la siguiente.

---

## 6. Tickets de Trabajo

**Prompt 1:** *(Sesión de generación — estrategia modular)*

> "genera los tickets de trabajo para cada historia de usuario en @docs/user-stories.md, aplicando el formato BDD con criterios Dado que / Cuando / Entonces, evaluación INVEST y estimación de talla S/M/L"

El `user-story-agent` procesó los módulos uno por uno con ediciones quirúrgicas (límite de tokens de output). Resultado inicial: 82 tickets (41 BE + 41 FE).

**Prompt 2:** *(Sesión 4 — modelo de 5 capas)*

> "@.claude/agents/user-story-agent.md indica al agente que se debe generar user story y tickets de todo el espectro de desarrollo, no solo backend y frontend"

Se definió el modelo de 5 capas (`-BE`, `-FE`, `-DB`, `-INFRA`, `-AI`), creando ticket de capa separado solo cuando ese trabajo puede asignarse a otra persona, tiene criterios propios y se testea de forma autónoma. Aplicado retroactivamente: total **91 tickets**, importados a GitHub Issues con `scripts/import_to_github.py` (labels por capa).

**Prompt 3:** *(Sesión 7 — planificación por US con el agente `planning-specialist`)*

> "Bien, faltaria que el plan de implementacion sea un poco mas detallado. Que se podria agregar?" + "porque se crea un agente y no una skill?"

Se creó el agente `planning-specialist`, invocado en el Paso 0 de `/implement-us`: lee el issue padre + cada ticket con sus criterios BDD + el codebase, y genera `docs/changelog/US-XXX.md` con seis componentes por ticket (criterios de done, archivos esperados, contrato de interfaz, riesgos, scope explícito y dependencias). El aislamiento de contexto del agente evita inflar el del orquestador. Cada US implementada (US-001 a US-014, US-017 a US-023, US-DASH) tiene su `docs/changelog/US-XXX.md`.

---

## 7. Pull Requests

**Prompt 1:** *(Sesión 6 — definición del flujo git/board)*

> "como seria el flujo de manejo de git?" + "las issues de github issues y del project como las manejas?"

Se definió el flujo: rama `feat/us-XXX` desde `dev` actualizado; un commit por ticket (conventional commits); `gh pr create --base dev` con `Closes #N`; integración con GitHub Projects v2 (Todo → In Progress al iniciar → In Review al crear el PR → Done **manual** tras el merge, porque el PR apunta a `dev`, no a `main`).

**Prompt 2:** *(Sesión 23 — cierre y limpieza de una US)*

> "si, arranca. Ya hice el pr y me movi a dev haciendo pull"

Patrón de cierre real por US: mergear el PR a `dev`, mover los issues (padre + tickets) a Done manualmente, limpiar la rama (`git push origin --delete`, `git fetch --prune`), y actualizar `prompts.md`/`README.md`/`CLAUDE.md` cuando la feature cambia el comportamiento documentado.

**Prompt 3:** *(Sesiones 9–28 — síntesis del resultado)*

> Convención sostenida durante toda la implementación: un PR por User Story sobre `dev`, con changelog por ticket y testing manual contra Postgres real antes de cerrar.

Se completaron **24 PRs mergeados a `dev`** (`#388`–`#418`): US-001 a US-014, US-017 a US-023, US-DASH y un fix de UX de adjuntos. Cada PR cierra su issue padre y sus tickets, con la suite de tests (backend > 570, frontend > 400) y, para los flujos críticos, specs de Playwright. Los PRs a `main` quedan para el cierre de Fase 1.
