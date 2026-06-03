# Markdown document content filling
_Exported on 5/25/2026 at 21:36:11 UTC from Cursor (3.5.17)_

---

**User**

Dado el fichero Markdown @readme-entrega-1.md , quiero que conserves exactamente esta estructura de documento y  rellenes cada punto con la información de los documentos @docs/prd.md  y @docs/product-backlog.md.
No debes de inventar nada.
Usa únicamente información de esos ficheros adjuntos.
Utiliza el máximo de información posible siempre y cuando tenga sentido y sea relevante para cada punto.
Utiliza también los gráficos de los ficheros.


---

**Cursor**

Now let me read the infrastructure docs and a few specific US sections from the backlog:

Let me read the specific ticket sections from the backlog:

Now I have all the information needed. Let me read the US-16 section from the backlog and the screenshots directory:

Now I have all the information needed. Let me write the completed document:

El fichero `readme-entrega-1.md` ha sido completado. Aquí tienes un resumen de lo que se ha rellenado en cada sección, usando exclusivamente información de los documentos fuente:

**Sección 0 — Ficha del proyecto:** nombre del proyecto (HabitHero) y descripción breve extraída del PRD. Los campos de nombre personal y URLs se dejan como pendientes ya que no están en los documentos.

**Sección 1 — Descripción general:**
- **1.1 Objetivo:** propuesta de valor con las tres palancas psicológicas, tabla de perfiles de usuario y tabla de ventajas competitivas (del PRD sección 1).
- **1.2 Funcionalidades:** las seis áreas funcionales del PRD sección 2 (hábitos, puntuación, recompensas, calendario, estadísticas, perfil).
- **1.3 Diseño UX:** las 4 capturas de pantalla existentes en `screenshots/` con descripción de cada vista.
- **1.4 Instalación:** paso a paso completo desde `infrastructure.md` (Docker, migraciones, seed, dos terminales).

**Sección 2 — Arquitectura:** diagrama Mermaid del PRD (sección 7.3), capas del sistema, estructura de directorios de `infrastructure.md`, diagrama de infraestructura dev/prod, prácticas de seguridad de US-21/T-21-01/T-21-02, y estrategia de tests de US-20.

**Sección 3 — Modelo de datos:** diagrama ER completo en Mermaid y tabla detallada de las 7 entidades con tipos, restricciones e índices del PRD sección 5.

**Sección 4 — API:** 3 endpoints en formato OpenAPI (GET /api/profile, GET /api/weeks/current, PATCH /api/habit-entries/:id) con ejemplos de petición y respuesta.

**Sección 5 — Historias de usuario:** US-09 (bloqueo semanal), US-10 (estados diarios) y US-11 (recompensas), con tabla INVEST y Acceptance Criteria en Gherkin del backlog.

**Sección 6 — Tickets:** T-03-01 (BD — esquema Prisma completo), T-09-02 (backend — bloqueo y transición semanal) y T-16-02 (frontend — hook `useHabitDashboard`).

**Sección 7 — Pull Requests:** se indica que el proyecto está en fase greenfield y las PRs quedan pendientes de los sprints de implementación.

