# ⚙️ Instrucción para el Agente de IA: Protocolo de Desarrollo en Cascada

> [!IMPORTANT]
> **DIRECTIVA PARA EL AGENTE DE IA:**
> Cuando el usuario te pida implementar un ticket técnico (`TK-XXX`), resolver una tarea de codificación o realizar un refactor en la aplicación, debes leer este documento y ejecutar strictly el proceso de desarrollo en cascada detallado a continuación.
> 
> **ROLES A ASUMIR POR EL AGENTE:**
> Para la ejecución de este proceso, debes actuar bajo los siguientes roles técnicos:
> *   **Lead Architect & Governance Officer:** Verifica que las reglas del proyecto registradas en `docs/04_governance_and_quality/rules/` se cumplan sin desvíos.
> *   **Senior Fullstack Software Engineer:** Implementa la solución con enfoque TDD (RED-GREEN-REFACTOR) respetando la Arquitectura Hexagonal y Vertical Slicing.
> *   **QA & Visual Verifier Specialist:** Garantiza que el código pase todos los linters, compiladores y pruebas visuales táctiles de interfaz en el navegador.

---

## 🧭 Proceso de Desarrollo en Cascada (Cascading Development Protocol)

Dado el ticket técnico (`TK-XXX`) o requerimiento de codificación suministrado por el usuario, debes ejecutar de forma autónoma las siguientes fases en orden secuencial:

---

### FASE 0: Lectura del Ticket y Mapeo del Entorno
Antes de escribir cualquier línea de código:
1. **Analizar el Ticket:** Lee detalladamente la especificación del ticket (ubicada en `docs/05_agile_planning/12_tickets/{modulo}/{backend|frontend}/TK-XXX.md`). Identifica los Criterios de Aceptación y el Definition of Done (DoD).
   - **Fail-Fast Obligatorio (Guard 26):** si ese archivo `TK-XXX.md` **no existe** — porque el usuario pidió implementar una capacidad nueva en lenguaje natural, sin ticket previo — **DETENTE aquí**. No improvises la implementación y reconstruyas la especificación después: invoca primero la Etapa 1 completa de [01_cascading_spec_workflow.md](01_cascading_spec_workflow.md) (`SK-02` → PRD, `SK-11` → User Story, `SK-12` → Ticket Técnico, `SK-13` → Matriz de Trazabilidad, `SK-14` → Backlog Map) y solo entonces vuelve a esta FASE 0 con el `TK-XXX.md` ya creado. Programar primero y especificar después viola este Guard aunque se corrija en la misma sesión.
2. **Identificar la Naturaleza de la Tarea:**
   - **Ticket de Backend:** Involucra dominio, casos de uso, repositorios y controladores REST.
   - **Ticket de Frontend:** Involucra componentes UI, hooks de estado, llamadas a la API y ruteo.
   - **Ticket de BD / Persistencia:** Involucra cambios en la capa de persistencia o esquema del ORM.

---

### FASE 1: Extracción / Sincronización de Reglas (`SK-27_extract_rules`)
1. Revisa la carpeta `docs/04_governance_and_quality/rules/`.
2. Ejecuta `bash .agents/scripts/check_rules_freshness.sh` para verificar de forma determinista (vía timestamps de git, no inferencia) si algún doc fuente cambió después que su regla derivada.
3. Ejecuta la skill [SK-27 Extracción de Reglas](../skills/development/01_rules_extraction/SK-27_extract_project_rules.md) para sincronizar las reglas de gobernanza técnica solo si: (a) los archivos de reglas (`domain_rules.md`, `backend_rules.md`, `frontend_rules.md`, `database_rules.md`, `testing_rules.md`, `security_rules.md`, `git_rules.md`) no existen, o (b) el script reportó `⚠️ Posible drift` para algún archivo relevante al ticket en curso.

---

### FASE 2: Migración de Persistencia y ORM (`SK-18_db_migration` - Si Afecta BD)
Si el ticket modifica o crea modelos de base de datos:
1. Aplica los cambios en el esquema del ORM o motor de persistencia indicado en `docs/02_architecture_design/04_technical_design.md`.
2. Ejecuta la skill [SK-18 Migraciones de Base de Datos](../skills/development/04_persistence_and_db/SK-18_execute_db_migration.md) para generar la migración física local, sincronizar la BD y regenerar el cliente de base de datos usando los comandos de `AGENTS.md`.

---

### FASE 3: Implementación Guiada por Pruebas - TDD (`SK-16` / `SK-17` & `05_test_runner_workflow`)
Ejecuta la skill correspondiente ([SK-16 Backend](../skills/development/02_backend_development/SK-16_develop_backend_ticket.md) o [SK-17 Frontend](../skills/development/03_frontend_development/SK-17_develop_frontend_ticket.md)) delegando el bucle determinista de pruebas al subagente [05_test_runner_workflow.md](05_test_runner_workflow.md):
1. **RED:** Escribir primero el test unitario o de integración usando `InMemoryRepository` fakes, confirmando el estado de fallo explícito.
2. **GREEN:** Implementar el código mínimo en capas Hexagonales (`Domain` ➔ `Application` ➔ `Infrastructure`) hasta pasar el test.
3. **REFACTOR & MUTATION:** Limpiar código e invocar la verificación de mutación según el umbral definido en `docs/04_governance_and_quality/rules/testing_rules.md`.

---

### FASE 4: Quality Gate & Inspección Linter (`SK-19_refactor_lint`)
Antes de dar por terminado el desarrollo:
1. Ejecuta la skill [SK-19 Refactorización y Lints](../skills/development/05_quality_and_lint/SK-19_refactor_and_lint.md).
2. Valida la compilación de tipos y el análisis estático ejecutando los comandos CLI autorizados en `AGENTS.md`.
3. **Quality Gate:** Se exige estricto **0 errores y 0 advertencias**. Si hay lints, deben ser resueltos antes de avanzar.

---

### FASE 4.B: Validación Cruzada (Reviewer Independiente Adversarial)
> [!IMPORTANT]
> **REGLA DE SEPARACIÓN DE ROLES:**
> El agente desarrollador (`SK-16`/`SK-17`) no puede auto-aprobar las Quality Gates. Se debe invocar a un **Reviewer Independiente** (subagente aislado) que realice una revisión adversarial sobre la rama de características:
> 1. Inspecciona el diff del código buscando ausencia de tipos inseguros, cumplimiento de SOLID y sanitización de entradas HTTP.
> 2. Verifica la ejecución exitosa de pruebas TDD y linter (`SK-19`).
> 3. En tickets UI, verifica la auditoría de accesibilidad WCAG 2.1 y ergonomía de componentes (`SK-21`).
> 4. Emite un veredicto formal (**APROBADO** / **RECHAZADO**). Solo con veredicto APROBADO se procede al commit.

---

### FASE 5: Verificación Visual QA (`SK-20_browser_qa` - Para Frontend)
Si el ticket es de Frontend o interfaz de usuario:
1. Ejecuta la skill [SK-20 Visual QA](../skills/development/06_visual_qa/SK-20_execute_browser_qa.md).
2. Inicia el subagente del navegador (`browser_subagent`), renderiza la interfaz localmente y verifica que los componentes cumplan con la accesibilidad táctil, contraste y estados defensivos. Guarda evidencias en artefactos.

---

### FASE 6: Registro de Commit Atómico (Git Rule)
1. Revisa las directivas en `docs/04_governance_and_quality/rules/git_rules.md`.
2. Realiza un **único commit atómico por ticket** utilizando la convención `feat(modulo): ... [TK-XXX]` o `fix(modulo): ... [TK-XXX]`. Queda prohibido mezclar múltiples tickets en un solo commit.

---

## 🚫 REGLAS DE EJECUCIÓN INNEGOCIABLES:
1. **No Vibe-Coding (Guard 26):** Jamás comiences a escribir clases o controladores sin haber leído las reglas en `docs/04_governance_and_quality/rules/` y el ticket específico — y si ese ticket no existe todavía, el primer paso es crearlo vía la Etapa 1 (`01_cascading_spec_workflow.md`), nunca escribir el código primero y documentarlo después.
2. **InMemory Fakes:** Nunca uses mocks complejos de bases de datos para tests unitarios. Utiliza repositorios falsos en memoria (`InMemoryRepository`).
3. **Commit por Ticket:** No consolides el trabajo de varios tickets en un solo commit. Mantén la trazabilidad git impecable.
