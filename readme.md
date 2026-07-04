## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)
8. [Retrospectiva final](#8-retrospectiva-final)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

Arnau Aregall — [@ArnauAregall](https://github.com/ArnauAregall)

### **0.2. Nombre del proyecto:**

AgentHub

### **0.3. Descripción breve del proyecto:**

AgentHub nació de un problema real de mi día a día como Tech Lead: trabajo con múltiples proyectos simultáneamente, cambio de contexto constantemente, y la pregunta "¿en qué estaba yo?" es más frecuente de lo que me gustaría admitir. 

Cuando empecé a delegar trabajo a agentes de IA, el problema se multiplicó: 
- ¿qué está haciendo el agente ahora mismo? 
- ¿Ya terminó? ¿En qué repositorio? 
- ¿Aprobé esa propuesta o no?

El proyecto arrancó en febrero de 2026, cuando vi a varios referentes técnicos compartiendo sus setups de trabajo multi-agente con dashboards personalizados. 

Me pregunté: ¿por qué no existe algo así que conecte el flujo de Spec-Driven Development que aprenderemos en LIDR con herramientas reales que pueda usar en mi trabajo diario? 

AgentHub es mi respuesta a esta pregunta, además de ser mi proyecto final del master AI4Devs.

Es un panel de orquestación que conecta Linear, GitHub y agentes de codificación (Claude Code CLI, GitHub Copilot CLI) en un único pipeline supervisado: `propose → review → apply → archive → PR`. 

La pieza central es la puerta de revisión humana obligatoria — ninguna línea de código se escribe hasta que el desarrollador aprueba explícitamente la propuesta generada por el agente. El Tech Lead orquesta. El agente ejecuta. El resultado es un pull request en GitHub con el código y la especificación archivada juntos.

Lo que lo hace diferente es que AgentHub está construido usando el mismo pipeline que expone: cada funcionalidad del producto ha sido propuesta por un agente, revisada por mí, e implementada como un pull request. El producto se come su propia comida desde el primer día.


### **0.4. URL del proyecto:**

[https://github.com/ArnauAregall/aregall-agenthub](https://github.com/ArnauAregall/aregall-agenthub) *(repositorio
privado — acceso concedido a los evaluadores)*

### 0.5. URL o archivo comprimido del repositorio

[https://github.com/ArnauAregall/aregall-agenthub](https://github.com/ArnauAregall/aregall-agenthub) *(repositorio
privado — acceso concedido a los evaluadores)*

### 0.6. Evaluadores

| Rol                | Persona                                                       |
|--------------------|---------------------------------------------------------------|
| Teaching Assistant | Vick — [@Vick-lidr](https://github.com/Vick-lidr)             |
| Evaluador / Mentor | Jorge Pilo — [@soyJorgePilo](https://github.com/soyJorgePilo) |

### 0.7. Referencias del proyecto

- **Prototipo UI (Lovable — vibe coding de la idea):
  ** [https://lovable.dev/projects/79049098-9bed-476e-9c00-a122d9114d3c](https://lovable.dev/projects/79049098-9bed-476e-9c00-a122d9114d3c)
- **Proyecto Linear de ejemplo usado en las pruebas:
  ** [Micronaut PetClinic — Linear](https://linear.app/arnau-aregall/project/micronaut-petclinic-baa653442449/issues)

---

## 1. Descripción general del producto

### **1.1. Objetivo:**

Los equipos de ingeniería que adoptan agentes de IA para escribir código se enfrentan a un problema de confianza: ¿cómo
se asegura un Tech Lead de que el agente no empieza a escribir código antes de que el equipo haya revisado y aprobado el
diseño? Las herramientas actuales (Claude Code, GitHub Copilot CLI, Cursor) ejecutan propuesta e implementación en un
único paso continuo, sin una pausa de revisión forzada. El resultado es código generado sobre especificaciones ambiguas,
deuda técnica acumulada, y frustración en las revisiones de pull request.

AgentHub resuelve este problema introduciendo un pipeline `propose → review → apply → archive → PR` con una puerta de
aprobación humana explícita entre la fase de propuesta y la fase de implementación. Ninguna línea de código se escribe
hasta que el desarrollador aprueba explícitamente la propuesta OpenSpec generada por el agente. Este flujo convierte al
Tech Lead en el orquestador de la IA, en lugar de ser un corrector de código generado a ciegas.

El usuario principal es el **Tech Lead o Desarrollador Senior** que trabaja con Linear como tracker de tickets y GitHub
como repositorio de código. Con AgentHub puede delegar un ticket directamente desde el kanban board, ver en tiempo real
el output del agente vía SSE streaming, revisar la propuesta en un panel dedicado, y aprobar o rechazar antes de que
comience la implementación.

### **1.2. Características y funcionalidades principales:**

- **Autenticación con GitHub OAuth 2.0 y gestión de sesión segura.** El usuario inicia sesión con su cuenta de GitHub;
  las credenciales de integraciones de terceros (Linear) se almacenan cifradas en base de datos.
- **Creación de Work Projects vinculando repositorio GitHub y proyecto Linear.** El Tech Lead configura un workspace
  gestionado que conecta tickets y código en un único entorno.
- **Kanban board con tickets importados de Linear.** Los tickets del proyecto Linear se visualizan en columnas de estado
  con actualización en tiempo real.
- **Delegación de tickets a agentes de IA con selección de runner.** Cualquier ticket del backlog puede delegarse a uno
  de los cuatro agentes disponibles (Claude Code CLI, GitHub Copilot CLI, OpenCode CLI, Kiro CLI).
- **Streaming en tiempo real del output del agente.** Mientras el agente ejecuta la fase de propuesta, su salida se
  muestra en un terminal embebido en la UI.
- **Revisión humana de la propuesta antes de implementar.** Cuando el agente completa la fase de propuesta, el ticket
  pasa a `Awaiting Review`. El desarrollador revisa la propuesta en un panel lateral y aprueba o rechaza antes de que
  comience cualquier escritura de código.
- **Pipeline Spec-Driven Development completo.** Las fases `propose`, `apply`, y `archive` son orquestadas por el
  sistema, garantizando que los artefactos de especificación acompañan siempre al pull request final.

### **1.3. Diseño y experiencia de usuario:**

El diseño visual sigue un sistema de tokens oscuro (dark theme). El prototipo inicial fue construido con Lovable para
hacer vibe coding de la idea y validar el flujo de UX antes de la implementación
real: [https://lovable.dev/projects/79049098-9bed-476e-9c00-a122d9114d3c](https://lovable.dev/projects/79049098-9bed-476e-9c00-a122d9114d3c).

Las cuatro pantallas principales del flujo de usuario son:

1. **Pantalla de Login** — entrada al sistema via autenticación con GitHub.
2. **Wizard de onboarding / New Work Project** — configuración del workspace: selección de repositorio GitHub y proyecto
   Linear.
3. **Kanban Board** — vista principal de tickets por estado, con acceso al modal de delegación a agentes.
4. **Panel de revisión de propuesta** — slide-over lateral para revisar, aprobar o rechazar la propuesta generada por el
   agente antes de que comience la implementación.

### **1.4. Instrucciones de instalación:**

Las instrucciones completas de instalación (prerrequisitos, variables de entorno, secuencia de arranque) están
disponibles en el `README.md` del repositorio privado:

🔗 [https://github.com/ArnauAregall/aregall-agenthub](https://github.com/ArnauAregall/aregall-agenthub)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

AgentHub es un monolito Spring Boot desplegado como stack Docker Compose sobre AWS EC2, con una SPA React como frontend
servida por Nginx. Los agentes de IA son procesos del sistema operativo anfitrión invocados desde el backend. Las
integraciones externas principales son GitHub (OAuth2 + REST API), Linear (GraphQL API) y Anthropic (via Spring AI).

La arquitectura y los diagramas C4 completos (Level 1, Level 2, Level 3) están disponibles en el repositorio privado:

🔗 [`docs/architecture.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/architecture.md)

### **2.2. Descripción de componentes principales:**

El sistema está compuesto por cinco componentes principales: backend API (Spring Boot / Java), frontend SPA (React /
Vite), base de datos relacional (PostgreSQL), caché de credenciales (Redis) y los runners de agentes de IA instalados en
el host. El detalle completo del inventario de servicios está en [
`docs/architecture.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/architecture.md).

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

El proyecto es un monorepo con tres módulos: `backend/` (API Spring Boot), `frontend/` (SPA React/Vite), y `e2e/` (tests
Playwright). El backend sigue una arquitectura de vertical slices donde cada dominio de negocio es un módulo cerrado. El
frontend espeja esa misma estructura por features.

La estructura completa del proyecto y las decisiones de arquitectura están documentadas en [
`docs/architecture.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/architecture.md).

### **2.4. Infraestructura y despliegue**

El despliegue es un stack Docker Compose sobre AWS EC2 con pipeline CI/CD en GitHub Actions.

**Estado actual (Fase 2 — Junio 2026):** entorno de producción operativo sobre AWS. La infraestructura fue
aprovisionada manualmente y el proceso completo está documentado como guía reproducible en el repositorio privado. El
pipeline CI/CD ejecuta el build completo (backend + frontend + E2E Playwright) en cada PR. La URL del entorno se
comunica directamente a los evaluadores.

### **2.5. Seguridad**

Las prácticas de seguridad del proyecto incluyen autenticación OAuth 2.0 con GitHub, gestión de sesión mediante JWT,
cifrado en reposo de credenciales de terceros, y gestión de secretos exclusivamente vía variables de entorno. El detalle
está disponible en el repositorio privado.

### **2.6. Tests**

La estrategia de testing combina tests de integración con Testcontainers (base de datos real, mocks de HTTP externos),
tests de API con RestAssured, verificación de reglas de arquitectura con ArchUnit, y tests de componentes frontend con
Vitest. El detalle está en el repositorio privado:

🔗 [`backend/src/test/`](https://github.com/ArnauAregall/aregall-agenthub/tree/main/backend/src/test)

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

El modelo de datos completo con entidades, atributos, tipos, restricciones y diagrama ERD está disponible en el
repositorio privado:

🔗 [`docs/data-model.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/data-model.md)

### **3.2. Descripción de entidades principales:**

El modelo consta de 8 entidades que cubren los dominios de autenticación, gestión de proyectos, tickets, ejecuciones de
agentes, revisión de propuestas, streaming de logs y auditoría. El detalle completo de cada entidad está en [
`docs/data-model.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/data-model.md).

---

## 4. Especificación de la API

La especificación completa de la API está disponible en el repositorio privado. Para explorarla localmente, una vez
arrancado el proyecto, el Swagger UI está disponible en `http://localhost:8080/swagger-ui.html`.

La skill `/sync-openapi-spec` mantiene el archivo `docs/openapi.yaml` sincronizado con la especificación generada por SpringDoc en tiempo de ejecución, asegurando que el archivo local siempre refleja el estado actual de la API, a modo de copia y referencia rápida local para desarrolladores y agentes.

🔗 [`docs/architecture.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/architecture.md)
🔗 [`docs/openapi.yaml`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/openapi.yaml)

---

## 5. Historias de Usuario

El backlog completo de AgentHub comprende 18 historias de usuario distribuidas en 5 fases de entrega (Phase 0 a Phase
5), gestionadas en el [GitHub Projects board](https://github.com/users/ArnauAregall/projects/1) del repositorio privado
y documentadas en [
`docs/backlog/user-stories.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/backlog/user-stories.md).
Las historias fueron generadas y validadas con criterios INVEST mediante sub-agentes de IA (ver §7 — Prompts). A
continuación se muestran tres historias representativas del flujo principal.

---

**Historia de Usuario 1 — US-01: Sign in via GitHub OAuth**

- **Como** desarrollador,
- **quiero** iniciar sesión con mi cuenta de GitHub via OAuth,
- **para** que mi identidad quede verificada contra una cuenta GitHub real sin necesitar gestionar una contraseña
  separada.

Los escenarios de aceptación cubren el flujo de login exitoso, el caso de denegación de consentimiento, y la
reutilización de sesión existente.

🔗 [Historia completa en el repositorio privado](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/backlog/user-stories.md#us-01-sign-in-via-github-oauth)

---

**Historia de Usuario 2 — US-04: Delegate a Linear ticket to an AI agent**

- **Como** desarrollador,
- **quiero** delegar un ticket de Linear a un agente de IA con una única acción,
- **para** que el agente genere automáticamente una propuesta OpenSpec para ese ticket sin que yo tenga que escribir un
  prompt.

Los escenarios de aceptación cubren la delegación exitosa con arranque de la fase propose, el fallo de conexión a Linear
durante el fetch, y el intento de delegar un ticket que ya tiene un run activo.

🔗 [Historia completa en el repositorio privado](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/backlog/user-stories.md#us-04-delegate-a-linear-ticket-to-an-ai-agent)

---

**Historia de Usuario 3 — US-07: Review the agent's OpenSpec proposal before code is written**

- **Como** Tech Lead,
- **quiero** revisar la propuesta OpenSpec generada por el agente antes de que comience a escribir código,
- **para** asegurar que el diseño técnico es correcto y alineado con la arquitectura del proyecto antes de comprometer
  cualquier implementación.

Los escenarios de aceptación cubren la visualización de la propuesta en el panel de revisión, la aprobación, y el
rechazo con motivo.

🔗 [Historia completa en el repositorio privado](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/backlog/user-stories.md#us-07-review-the-agents-openspec-proposal-before-code-is-written)

---

### Historias de Usuario — Fase 2 (Mayo–Junio 2026)

**Historia de Usuario 4 — US-08: Approve, reject, or request changes to a proposal**

- **Como** Tech Lead,
- **quiero** aprobar, rechazar o solicitar cambios sobre la propuesta generada por el agente,
- **para** controlar explícitamente cuándo y bajo qué condiciones el agente puede comenzar a escribir código.

Los escenarios cubren la aprobación directa que desencadena la fase de aplicación, el rechazo con motivo que detiene el
run, y la solicitud de revisión que devuelve el agente a la fase de propuesta con contexto adicional.

🔗 [Historias completas en el repositorio privado](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/backlog/user-stories.md)

---

**Historia de Usuario 5 — US-09: Agent applies the approved spec and pushes the branch automatically**

- **Como** desarrollador,
- **quiero** que el agente implemente automáticamente la especificación aprobada y suba la rama a GitHub,
- **para** recibir código listo para revisión sin intervención manual tras aprobar la propuesta.

Los escenarios cubren la ejecución completa de la fase de aplicación, el archivado de la especificación junto al código,
la creación de un commit semántico con los co-autores del agente, y el push de la rama al repositorio remoto.

🔗 [Historias completas en el repositorio privado](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/backlog/user-stories.md)

---

**Historia de Usuario 6 — US-10: Receive a GitHub Pull Request at the end of a successful agent run**

- **Como** desarrollador,
- **quiero** recibir automáticamente un Pull Request en GitHub al finalizar la ejecución del agente,
- **para** poder iniciar la revisión de código sin ningún paso manual adicional.

Los escenarios cubren la creación del PR con el título y cuerpo generado por el agente, la persistencia de la URL del PR
en el sistema, y el caso en que el agente no produce cambios y el PR no se crea.

🔗 [Historias completas en el repositorio privado](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/backlog/user-stories.md)

---

**Historia de Usuario 7 — US-11: Monitor agent progress via real-time log streaming**

- **Como** desarrollador,
- **quiero** ver en tiempo real el output del agente mientras ejecuta,
- **para** saber en qué punto del proceso se encuentra sin necesidad de consultar herramientas externas.

Los escenarios cubren el streaming continuo del log del agente en un terminal embebido en la UI, la actualización
periódica del listado de tareas pendientes, y el cierre limpio del stream cuando el agente finaliza o falla.

🔗 [Historias completas en el repositorio privado](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/backlog/user-stories.md)

---

**Historia de Usuario 8 — US-12: View the full ticket pipeline on a kanban board**

- **Como** Tech Lead,
- **quiero** visualizar todos los tickets activos del proyecto en un kanban board de cinco columnas,
- **para** tener una vista unificada del estado de cada delegación y poder transicionar estados con drag-and-drop.

Los escenarios cubren la carga del board con las cinco columnas de estado, las transiciones por drag-and-drop que
disparan acciones contextuales, y el soporte responsive en viewport móvil.

🔗 [Historias completas en el repositorio privado](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/backlog/user-stories.md)

---

**Historia de Usuario 9 — US-13: Filter the kanban board by runner or search by ID/title**

- **Como** Tech Lead,
- **quiero** filtrar el kanban board por runner de agente o buscar tickets por ID o título,
- **para** encontrar rápidamente el estado de un ticket específico en proyectos con muchos runs activos.

Los escenarios cubren el filtrado server-side por runner, la búsqueda por ID parcial y por fragmento de título, y la
combinación de ambos filtros en una única llamada al backend.

🔗 [Historias completas en el repositorio privado](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/backlog/user-stories.md)

---

**Historia de Usuario 10 — US-14: Review proposals on mobile (≥375 px viewport)**

- **Como** Tech Lead,
- **quiero** revisar y aprobar propuestas del agente desde un dispositivo móvil,
- **para** no depender de un escritorio para tomar decisiones de aprobación cuando estoy fuera de la oficina.

Los escenarios cubren la visualización completa del panel de propuesta en viewports desde 375 px, los controles de
aprobación/rechazo accesibles sin scroll horizontal, y la carga correcta del contenido de la propuesta en conexiones
móviles.

🔗 [Historias completas en el repositorio privado](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/backlog/user-stories.md)

---

**Historia de Usuario 11 — US-15: Generate a Linear ticket from a free-text idea (Idea mode)**

- **Como** desarrollador,
- **quiero** escribir una idea en lenguaje natural y recibir un ticket de Linear estructurado generado por IA,
- **para** convertir ideas rápidas en tickets accionables sin tener que redactarlos manualmente.

Los escenarios cubren la generación de un título, descripción y criterios de aceptación a partir de la idea del usuario,
la previsualización del ticket antes de crearlo en Linear, y la validación de que la idea tiene suficiente contexto para
ser procesada.

🔗 [Historias completas en el repositorio privado](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/backlog/user-stories.md)

---

**Historia de Usuario 12 — US-16: Enrich an existing Linear ticket with AI-generated acceptance criteria**

- **Como** desarrollador,
- **quiero** enriquecer un ticket de backlog existente con criterios de aceptación generados por IA,
- **para** que el ticket tenga la especificación suficiente para ser delegado a un agente sin trabajo manual adicional.

Los escenarios cubren la generación de criterios de aceptación a partir de contexto adicional libre, la previsualización
antes de confirmar la escritura al proyecto Linear, y el caso en que el ticket ya tiene suficiente descripción.

🔗 [Historias completas en el repositorio privado](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/backlog/user-stories.md)

---

**Historia de Usuario 13 — US-17 + US-18: Onboarding wizard and architecture profile**

- **Como** nuevo usuario,
- **quiero** completar un wizard guiado al crear mi primer Work Project y configurar el perfil de arquitectura del
  repositorio,
- **para** que el agente tenga el contexto técnico del proyecto antes de generar cualquier propuesta.

Los escenarios cubren el wizard paso a paso (repositorio GitHub → proyecto Linear → perfil de arquitectura), la
validación de cada paso antes de avanzar, y la persistencia del perfil de arquitectura editable posteriormente.

🔗 [Historias completas en el repositorio privado](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/backlog/user-stories.md)

---

**Historia de Usuario 14 — US-24: Detect GitHub PR merge via webhook and transition to Done**

- **Como** Tech Lead,
- **quiero** que el sistema detecte automáticamente cuando el PR del agente es mergeado en GitHub,
- **para** que el ticket transite a Done sin necesidad de una acción manual en AgentHub.

Los escenarios cubren la recepción del webhook de GitHub al mergear el PR, la transición automática del run al estado
Done, y el comportamiento cuando el webhook llega fuera de secuencia o con retraso.

🔗 [Historias completas en el repositorio privado](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/backlog/user-stories.md)

---

**Historia de Usuario 15 — US-25: Cancel an agent run in progress**

- **Como** Tech Lead,
- **quiero** cancelar un agent run desde el kanban board en cualquier columna activa,
- **para** detener la ejecución del agente si la dirección técnica cambia o si el agente entra en un estado incorrecto.

Los escenarios cubren la cancelación desde las columnas de propuesta en progreso, de revisión y de code review, el
cierre del PR asociado si existe, y la gestión de cancelaciones concurrentes.

🔗 [Historias completas en el repositorio privado](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/backlog/user-stories.md)

---

**Historia de Usuario 16 — US-26: Delete a Work Project and clean up its GitHub webhook**

- **Como** Tech Lead,
- **quiero** eliminar un Work Project cuando ya no sea necesario,
- **para** que todos sus recursos asociados (runs activos, webhook de GitHub) queden limpios de forma automática.

Los escenarios cubren la cancelación de todos los runs activos antes del borrado, la eliminación best-effort del webhook
en GitHub, el borrado en cascada de los datos en base de datos, y la confirmación explícita en la UI.

🔗 [Historias completas en el repositorio privado](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/backlog/user-stories.md)

---

**Historia de Usuario 17 — US-27: Merge a GitHub Pull Request from the Code Review Kanban column**

- **Como** Tech Lead,
- **quiero** mergear el PR del agente directamente desde el kanban board de AgentHub,
- **para** cerrar el ciclo del pipeline sin tener que cambiar de herramienta.

Los escenarios cubren la pre-comprobación de mergeabilidad antes de intentar el merge, la transición del ticket a Done
al completarse, la gestión de errores de GitHub durante el merge, y el bloqueo de merges concurrentes sobre el mismo PR.

🔗 [Historias completas en el repositorio privado](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/backlog/user-stories.md)

---

**Historia de Usuario 18 — US-28: Establish authenticated E2E test harness with CI wiring**

- **Como** desarrollador del equipo,
- **quiero** disponer de un harness de tests E2E que se ejecute en CI con sesiones autenticadas,
- **para** poder verificar los flujos de usuario completos sin depender de cuentas reales de GitHub o Linear.

Los escenarios cubren la ejecución del suite E2E completo en GitHub Actions, la autenticación de las sesiones de test
sin OAuth real, y la cobertura de los flujos principales del producto (login, kanban board, delegación, revisión de
propuesta).

🔗 [Historias completas en el repositorio privado](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/backlog/user-stories.md)

---

## 6. Tickets de Trabajo

Los tickets de trabajo de AgentHub son generados por sub-agentes de IA a partir de las historias de usuario, siguiendo
una descomposición por capas (Database, Backend, Frontend, QA/E2E) y publicados como GitHub Issues en el repositorio
privado. El detalle completo de cada ticket — incluyendo criterios de aceptación, DoD, enfoque técnico y dependencias —
está disponible en los Issues del repositorio y en [
`docs/backlog/`](https://github.com/ArnauAregall/aregall-agenthub/tree/main/docs/backlog/).

---

**Ticket 1 — Base de datos:** `[TICKET-1][US-04] Create agent_runs schema and status enum migration`

- **Tipo:** Database
- **Fase:** Phase 2
- **GitHub Issue:** [#31](https://github.com/ArnauAregall/aregall-agenthub/issues/31)

Crea la migración Flyway que define el schema de persistencia para el seguimiento de ejecuciones de agentes, incluyendo
la máquina de estados y los índices necesarios para las consultas del kanban board.

🔗 [Ver ticket completo en GitHub Issues](https://github.com/ArnauAregall/aregall-agenthub/issues/31)

---

**Ticket 2 — Backend:**
`[TICKET-2][US-07] Implement SpecReviewService and GET /api/v1/agent-runs/{id}/proposal endpoint`

- **Tipo:** Backend
- **Fase:** Phase 2
- **GitHub Issue:** [#46](https://github.com/ArnauAregall/aregall-agenthub/issues/46)

Implementa el servicio que lee el contenido de la propuesta generada por el agente en el worktree y expone el endpoint
de consulta de propuesta para el panel de revisión del frontend.

🔗 [Ver ticket completo en GitHub Issues](https://github.com/ArnauAregall/aregall-agenthub/issues/46)

---

**Ticket 3 — Frontend:** `[TICKET-3][US-07] Build ProposalPanel slide-over component in the ticket detail view`

- **Tipo:** Frontend
- **Fase:** Phase 2
- **GitHub Issue:** [#47](https://github.com/ArnauAregall/aregall-agenthub/issues/47)

Construye el componente de revisión de propuesta como un panel lateral en la vista de detalle del ticket, con
visualización del contenido generado por el agente y controles de aprobación/rechazo. Responsive y accesible desde
móvil.

🔗 [Ver ticket completo en GitHub Issues](https://github.com/ArnauAregall/aregall-agenthub/issues/47)

---

## 7. Pull Requests

Las siguientes pull requests representan el trabajo implementado hasta la Fase 2 del proyecto. La mayoría fueron
implementadas siguiendo el pipeline OpenSpec (el agente propone, el desarrollador revisa, el agente aplica), demostrando
que AgentHub se construye con sus propias herramientas.

---

**Pull Request 1 — [US-07] Review the agent's OpenSpec proposal before code is written**

- **URL:
  ** [https://github.com/ArnauAregall/aregall-agenthub/pull/110](https://github.com/ArnauAregall/aregall-agenthub/pull/110)
- **Estado:** Merged
- **Runner:** GitHub Copilot CLI

Implementa el flujo completo de revisión de propuestas: el agente genera la propuesta en el worktree, el backend expone
el endpoint de consulta, y el frontend renderiza el panel de revisión en la vista de detalle del ticket. Esta PR es la
demostración más directa del pipeline completo: fue propuesta por un agente de IA, revisada por el desarrollador, y
aplicada por el mismo agente.

---

**Pull Request 2 — [US-04] Delegate a Linear ticket to an AI agent**

- **URL:
  ** [https://github.com/ArnauAregall/aregall-agenthub/pull/102](https://github.com/ArnauAregall/aregall-agenthub/pull/102)
- **Estado:** Merged
- **Runner:** Claude Code CLI

Implementa correcciones arquitectónicas al sistema de delegación de tickets: ajuste del modelo de integración con Linear
y eliminación del almacenamiento local del contenido del ticket. Generada por Claude Code CLI como corrección durante la
implementación del pipeline.

---

**Pull Request 3 — [US-02] Create a Work Project linking a repo and Linear team**

- **URL:
  ** [https://github.com/ArnauAregall/aregall-agenthub/pull/99](https://github.com/ArnauAregall/aregall-agenthub/pull/99)
- **Estado:** Merged
- **Runner:** GitHub Copilot CLI

Implementa el almacenamiento seguro de credenciales de terceros por usuario, habilitando la configuración multi-usuario
de integraciones externas. Propuesta y aplicada vía pipeline OpenSpec con GitHub Copilot CLI como runner.

---

### Pull Requests — Fase 2 (Mayo–Junio 2026)

**Pull Request 4 — [US-08] Approve, reject, or request changes to a proposal**

- **URL:** [https://github.com/ArnauAregall/aregall-agenthub/pull/113](https://github.com/ArnauAregall/aregall-agenthub/pull/113)
- **Estado:** Merged
- **Runner:** Claude Code CLI

Implementa las tres acciones de revisión sobre la propuesta generada por el agente: aprobación (desencadena la fase de
aplicación), rechazo con motivo (detiene el run) y solicitud de cambios (devuelve el agente a la fase de propuesta con
contexto adicional). Cierra el ciclo de la puerta de revisión humana obligatoria.

---

**Pull Request 5 — [US-09] Agent applies the approved spec and pushes the branch automatically**

- **URL:** [https://github.com/ArnauAregall/aregall-agenthub/pull/121](https://github.com/ArnauAregall/aregall-agenthub/pull/121)
- **Estado:** Merged
- **Runner:** Claude Code CLI

Completa el pipeline `apply → archive → push`: tras la aprobación, el agente implementa las tareas de la especificación,
archiva el cambio junto al código, genera un commit semántico con trazabilidad de co-autores, y sube la rama al
repositorio remoto en GitHub. Primer cierre completo del bucle de automatización de extremo a extremo.

---

**Pull Request 6 — [US-10] Receive a GitHub Pull Request at the end of a successful agent run**

- **URL:** [https://github.com/ArnauAregall/aregall-agenthub/pull/123](https://github.com/ArnauAregall/aregall-agenthub/pull/123)
- **Estado:** Merged
- **Runner:** Claude Code CLI

Añade la creación automática del Pull Request en GitHub como último paso del pipeline de ejecución del agente. El sistema
persiste la URL del PR en el registro del run, la muestra en la tarjeta del kanban board y gestiona el caso en que el
agente no produce cambios netos.

---

**Pull Request 7 — [US-11] Monitor agent progress via real-time log streaming**

- **URL:** [https://github.com/ArnauAregall/aregall-agenthub/pull/128](https://github.com/ArnauAregall/aregall-agenthub/pull/128)
- **Estado:** Merged
- **Runner:** Claude Code CLI

Implementa el streaming en tiempo real del output del agente mediante Server-Sent Events. El frontend muestra el log
del agente en un terminal embebido y actualiza periódicamente el listado de tareas mientras el agente ejecuta, sin
necesidad de polling activo desde el cliente.

---

**Pull Request 8 — [US-12] View the full ticket pipeline on a kanban board**

- **URL:** [https://github.com/ArnauAregall/aregall-agenthub/pull/158](https://github.com/ArnauAregall/aregall-agenthub/pull/158)
- **Estado:** Merged
- **Runner:** Claude Code CLI

Implementa el kanban board de cinco columnas con drag-and-drop que dispara acciones contextuales según la columna de
destino. El backend expone un endpoint que agrega el estado de runs, tickets y PRs en una única respuesta optimizada
para el board. Soporte responsive incluido en esta PR.

---

**Pull Request 9 — [US-24 + US-25] Webhook-based PR merge detection and run cancellation**

- **URL:** [https://github.com/ArnauAregall/aregall-agenthub/pull/142](https://github.com/ArnauAregall/aregall-agenthub/pull/142)
- **Estado:** Merged
- **Runner:** Claude Code CLI

Implementa la detección automática del merge de un PR vía webhook de GitHub (US-24): cuando el PR del agente es
mergeado, el run transita automáticamente a Done sin intervención manual. Añade también la cancelación de runs desde
cualquier columna activa del board (US-25), incluyendo el cierre del PR asociado si existe.

---

**Pull Request 10 — [US-27] Merge a GitHub Pull Request from the Code Review Kanban column**

- **URL:** [https://github.com/ArnauAregall/aregall-agenthub/pull/159](https://github.com/ArnauAregall/aregall-agenthub/pull/159)
- **Estado:** Merged
- **Runner:** Claude Code CLI

Añade el flujo de merge iniciado desde AgentHub: el desarrollador arrastra la tarjeta de Code Review a Done o pulsa
"Merge PR" en el panel de detalle. El sistema comprueba la mergeabilidad antes de actuar y gestiona los distintos modos
de error de la API de GitHub, evitando merges concurrentes mediante bloqueo optimista.

---

**Pull Request 11 — [US-13] Filter the kanban board by runner or search by ID/title**

- **URL:** [https://github.com/ArnauAregall/aregall-agenthub/pull/166](https://github.com/ArnauAregall/aregall-agenthub/pull/166)
- **Estado:** Merged
- **Runner:** Claude Code CLI

Añade filtrado server-side al endpoint del kanban board (por runner, por fragmento de ID y por título) y una barra de
filtros inline en la cabecera del board que refleja el estado del filtro en la URL, permitiendo compartir vistas filtradas
directamente.

---

**Pull Request 12 — [US-28] Authenticated E2E test harness with CI wiring**

- **URL:** [https://github.com/ArnauAregall/aregall-agenthub/pull/168](https://github.com/ArnauAregall/aregall-agenthub/pull/168)
- **Estado:** Merged
- **Runner:** Claude Code CLI

Implementa el harness de tests E2E autenticados de Playwright con tres niveles: sesión de test sin OAuth real, mocks de
integraciones externas, y fixtures de estado compartido entre tests. Permite la ejecución del suite E2E completo en
GitHub Actions sin cuentas reales de GitHub ni Linear.

---

**Pull Request 13 — [US-15] Generate a Linear ticket from a free-text idea (Idea mode)**

- **URL:** [https://github.com/ArnauAregall/aregall-agenthub/pull/172](https://github.com/ArnauAregall/aregall-agenthub/pull/172)
- **Estado:** Merged
- **Runner:** Claude Code CLI

Añade el modo Idea al kanban board: el desarrollador escribe una idea en lenguaje libre y Spring AI genera un ticket
estructurado (título, descripción, criterios de aceptación) con previsualización antes de crearlo en Linear. Primera
integración de Spring AI con la API de Linear en modo de creación.

---

**Pull Request 14 — [US-17 + US-18] Onboarding wizard and architecture profile**

- **URL:** [https://github.com/ArnauAregall/aregall-agenthub/pull/173](https://github.com/ArnauAregall/aregall-agenthub/pull/173)
- **Estado:** Merged
- **Runner:** Claude Code CLI

Implementa el wizard guiado de primer acceso que lleva al usuario por la selección de repositorio GitHub, proyecto Linear
y configuración del perfil de arquitectura del proyecto. El perfil de arquitectura es persistido y enviado al agente como
contexto en cada delegación, mejorando la calidad de las propuestas generadas.

---

**Pull Request 15 — [US-26] Delete a Work Project and clean up its GitHub webhook**

- **URL:** [https://github.com/ArnauAregall/aregall-agenthub/pull/177](https://github.com/ArnauAregall/aregall-agenthub/pull/177)
- **Estado:** Merged
- **Runner:** Claude Code CLI

Implementa el borrado de Work Projects con limpieza completa: cancelación de todos los runs activos, eliminación
best-effort del webhook en GitHub, borrado en cascada en base de datos y emisión de eventos de auditoría. Incluye el
diálogo de confirmación en el frontend.

---

**Pull Request 16 — [US-16] Enrich an existing Linear ticket with AI-generated acceptance criteria**

- **URL:** [https://github.com/ArnauAregall/aregall-agenthub/pull/179](https://github.com/ArnauAregall/aregall-agenthub/pull/179)
- **Estado:** Merged
- **Runner:** Claude Code CLI

Añade el modo Enriquecimiento: el desarrollador aporta contexto adicional sobre un ticket existente y Spring AI genera
criterios de aceptación estructurados que se previsualizan antes de escribirse al ticket en Linear. Demuestra la
integración bidireccional de Spring AI con la API de Linear vía el pipeline OpenSpec.

---

**Pull Request 17 — [SPIKE] AWS infrastructure deployment documentation**

- **URL:** [https://github.com/ArnauAregall/aregall-agenthub/pull/186](https://github.com/ArnauAregall/aregall-agenthub/pull/186)
- **Estado:** Merged
- **Runner:** Claude Code CLI

Documenta el proceso completo de aprovisionamiento de la infraestructura de producción en AWS, incluyendo los problemas
reales encontrados durante el despliegue live y las soluciones aplicadas. Sirve como guía reproducible para replicar el
entorno desde cero siguiendo IaC (considerando el futuro uso de AWS CDK) y buenas prácticas de seguridad.

---

## 8. Retrospectiva final

Al cierre del proyecto, reconstruí y analicé el uso de IA a lo largo de todo el ciclo de vida de AgentHub a partir del
propio rastro de auditoría del proyecto (`prompts-log.md`), y complementé ese análisis cuantitativo con una
retrospectiva humana sobre lo aprendido y los próximos pasos.

Ambos documentos, junto con un informe HTML consolidado y las capturas de pantalla de soporte, están disponibles en el
repositorio privado:

- [Informe de desarrollo asistido por IA (HTML)](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/ai4devs-final-delivery/ai4devs-arnauaregall-final-project-ai-development-report.html)
- [`docs/ai4devs-final-delivery/retrospective/ai-development-report.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/ai4devs-final-delivery/retrospective/ai-development-report.md) — métricas cuantitativas del proceso
- [`docs/ai4devs-final-delivery/retrospective/ai-development-human-retrospective.md`](https://github.com/ArnauAregall/aregall-agenthub/blob/main/docs/ai4devs-final-delivery/retrospective/ai-development-human-retrospective.md) — reflexión cualitativa: qué funcionó, qué fue más difícil de lo esperado, y qué cambiaría de cara al futuro
- [`docs/ai4devs-final-delivery/screenshots/`](https://github.com/ArnauAregall/aregall-agenthub/tree/main/docs/ai4devs-final-delivery/screenshots) — capturas de soporte

No repito aquí el contenido para no duplicar el análisis; los documentos enlazados son la fuente completa.

