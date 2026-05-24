## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

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

El despliegue objetivo es un stack Docker Compose sobre AWS EC2 con pipeline CI/CD en GitHub Actions. La URL objetivo es
`https://agenthub.aregall.tech`. El estado actual (Fase 2 completada) incluye CI operativo.

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

