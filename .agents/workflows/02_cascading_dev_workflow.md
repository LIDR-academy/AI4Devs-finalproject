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
4. **Guarda nueva descubierta a mitad de proyecto:** si este ticket agrega una guarda nueva de "prohibir/mandatar patrón X" a la sección 6 de `AGENTS.md` (el patrón `"Discovered in TK-XXX"` ya usado por la mayoría de las guardas existentes), el mismo ticket DEBE también agregar el bullet correspondiente a la lista enumerada del paso "Generación de Scripts de Gobernanza Ejecutable" de `SK-27` — nunca dejar la guarda solo en prosa. Un `AGENTS.md` con una regla nueva y ningún script que la verifique es, en sí mismo, deuda de gobernanza sin cerrar: la próxima vez que alguien corra `SK-27` en este proyecto (o lo instale en uno nuevo vía `install.sh`), esa guarda debe generarse como script ejecutable, no solo copiarse como texto.

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
> 5. Todo defecto encontrado aquí (o cualquier corrección que el humano haya hecho sobre una propuesta del agente en fases anteriores) se evalúa en FASE 5.C antes del commit — no toda corrección amerita una regla permanente, ver el filtro de sistemicidad ahí.

---

### FASE 5: Verificación Visual QA (`SK-20_browser_qa` - Para Frontend)
Si el ticket es de Frontend o interfaz de usuario:
1. Ejecuta la skill [SK-20 Visual QA](../skills/development/06_visual_qa/SK-20_execute_browser_qa.md).
2. Inicia el subagente del navegador (`browser_subagent`), renderiza la interfaz localmente y verifica que los componentes cumplan con la accesibilidad táctil, contraste y estados defensivos. Guarda evidencias en artefactos.

---

### FASE 5.B: Verificación en Vivo del Stack Completo (TK-055, para tickets de integración full-stack)
Si el ticket toca integración full-stack real (un endpoint nuevo consumido por UI, un flujo de autenticación, o cambios en el arranque/seed/migraciones del backend), ejecuta [09_live_stack_verification_workflow.md](09_live_stack_verification_workflow.md) — levanta la infraestructura real declarada en `docs/00_stack_manifest.md`, recorre el flujo crítico del ticket con el motor E2E declarado, y limpia el entorno de prueba por completo al terminar. No sustituye a `SK-20`/TDD, es la capa que verifica que las piezas ya probadas por separado funcionan juntas con infraestructura real — el mecanismo concreto detrás del Antipatrón B de `rules/04_verified_implementation_standard.md`.

---

### FASE 5.C: Promoción de Correcciones a Reglas Permanentes (Retrospectiva de Ticket)
Antes del commit final, revisa las correcciones reales que ocurrieron durante este ticket: rechazos del Reviewer Independiente en FASE 4.B, y cualquier corrección explícita que el humano haya hecho sobre una propuesta del agente en cualquier fase anterior (código, diseño, o el texto de cualquier artefacto de `docs/`). Para cada una:

1. **Filtro de sistemicidad (obligatorio antes de proponer nada):** pregúntate explícitamente *"¿esta corrección podría repetirse en un archivo o ticket distinto si no queda codificada en algún lado?"* Si la respuesta es no — fue un error puntual, un typo, una preferencia de una sola vez — NO propongas ninguna regla nueva. La mayoría de las correcciones de un ticket normal no deben pasar este filtro; si todas terminan proponiendo una regla, el filtro no se está aplicando con criterio real.
2. **Si pasa el filtro, clasifica el destino** (nunca todo termina en `AGENTS.md`):
   - Patrón de código prohibido/obligatorio y verificable de forma determinista → nueva Guard en la Sección 6 de `AGENTS.md` (formato `"Discovered in TK-XXX"`, igual que las guardas existentes) + evalúa si amerita también un bullet nuevo en la lista de generación de scripts de `SK-27_extract_project_rules.md` (ver FASE 1, punto 4 de este mismo workflow).
   - Regla de negocio/dominio (ej. un rango válido, una invariante) → el archivo de reglas correspondiente en `docs/04_governance_and_quality/rules/` o el PRD en `docs/01_product_definition/`, nunca una Guard de código.
   - Corrección de proceso/flujo de trabajo del propio agente → un paso nuevo o una aclaración en el workflow relevante (`01`-`09`), no una Guard de código.
3. **Redacta la propuesta completa antes de presentarla**: texto exacto de la regla, archivo destino, y si aplica, si el script de verificación se genera ahora o queda explícitamente pendiente para una sesión de auditoría posterior (no todo requiere el costo de un script inmediato; sí requiere quedar registrado para que no se pierda — la Guard 29 vivió solo en prosa entre `TK-057-FE` y la auditoría que la cerró, precisamente por no quedar registrada como pendiente en ningún lado).
4. **Presenta al humano para aprobación explícita** — reutiliza el gate HITL ya existente en `.agents/README.md` ("ningún cambio a `rules/`, `skills/` o `workflows/` gobierna nada sin confirmación explícita del humano"). No se escribe nada de este paso sin esa confirmación.
5. Solo con aprobación, escribe el/los archivo(s) correspondiente(s).

Si esta fase no encuentra ninguna corrección que pase el filtro del punto 1, repórtalo explícitamente como "Sin hallazgos sistémicos en este ticket" en el resumen de cierre — el silencio no debe interpretarse como que la fase no se ejecutó.

---

### FASE 6: Registro de Commit Atómico (Git Rule)
1. Revisa las directivas en `docs/04_governance_and_quality/rules/git_rules.md`.
2. Realiza un **único commit atómico por ticket** utilizando la convención `feat(modulo): ... [TK-XXX]` o `fix(modulo): ... [TK-XXX]`. Queda prohibido mezclar múltiples tickets en un solo commit.

---

## 🚫 REGLAS DE EJECUCIÓN INNEGOCIABLES:
1. **No Vibe-Coding (Guard 26):** Jamás comiences a escribir clases o controladores sin haber leído las reglas en `docs/04_governance_and_quality/rules/` y el ticket específico — y si ese ticket no existe todavía, el primer paso es crearlo vía la Etapa 1 (`01_cascading_spec_workflow.md`), nunca escribir el código primero y documentarlo después.
2. **InMemory Fakes:** Nunca uses mocks complejos de bases de datos para tests unitarios. Utiliza repositorios falsos en memoria (`InMemoryRepository`).
3. **Commit por Ticket:** No consolides el trabajo de varios tickets en un solo commit. Mantén la trazabilidad git impecable.
