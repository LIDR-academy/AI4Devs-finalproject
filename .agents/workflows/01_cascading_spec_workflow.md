# 💡 Instrucción para el Agente de IA: Propagación de Nuevas Ideas o Funcionalidades

> [!IMPORTANT]
> **DIRECTIVA PARA EL AGENTE DE IA:**
> Cuando el usuario te pida integrar una nueva funcionalidad o requerimiento, debes leer este documento y ejecutar estrictamente el proceso de actualización en cascada detallado a continuación.
> 
> **ROLES A ASUMIR POR EL AGENTE:**
> Para la ejecución de este proceso, debes actuar bajo los siguientes roles y perspectivas técnicas:
> *   **Principal Software Architect:** Garantiza que no se violen las dependencias de la Arquitectura Hexagonal y que se respete el Vertical Slicing.
> *   **Senior Product Owner:** Redacta y valida las User Stories bajo criterios INVEST y BDD Gherkin con escenarios Happy Path y Edge Cases.
> *   **Database Administrator (DBA):** Vela por la consistencia del modelo físico de base de datos respetando la 3NF, tipos de datos correctos (Fixed-Point Decimal) y convenciones físicas.

## 🧭 Proceso de Propagación en Cascada (Cascading Update Protocol)

Dada la idea o requerimiento suministrado por el usuario, debes ejecutar de forma autónoma las siguientes fases en orden secuencial:

---

### FASE 0: Lectura y Mapeo de Contexto (Obligatorio)
Antes de proponer o realizar cualquier cambio, debes:
1. Leer los archivos de índices (`docs/05_agile_planning/11_user_stories/indice_user_stories.md` y `docs/05_agile_planning/12_tickets/indice_tickets.md`) para determinar el **siguiente identificador correlativo libre** (ej. `US-007` y `TK-008`). Está terminantemente prohibido usar placeholders como `US-XXX` o `TK-XXX`.
2. Leer el estado actual del esquema de persistencia en `docs/03_persistence_and_api/06_database_schema.md` y los documentos del core en `docs/01_product_definition/`, `docs/02_architecture_design/` y `readme.md` para mapear el impacto real.
3. Determinar el módulo/epic de la funcionalidad para guardarla en la carpeta adecuada. Si la funcionalidad pertenece a un módulo existente, debes utilizar exactamente sus carpetas ya creadas. Si es un módulo o epic completamente nuevo, debes crear una nueva carpeta bajo el mismo estándar de módulos.

### FASE 1: Análisis de Impacto (Impact Assessment)
Responde en tu primer turno con un breve reporte estructural:
1. ¿Qué Vertical Slice se ve afectado o si es necesario crear uno nuevo?
2. ¿Qué capas de la arquitectura hexagonal requieren cambios (Domain, Application, Infrastructure)?
3. ¿Afecta al modelo físico de base de datos?
4. ¿Afecta o introduce nuevos endpoints en la API?

### FASE 1.5: Interrogatorio de Reglas de Negocio (Human-in-the-Loop, Guard 28)
Antes de redactar cualquier archivo de especificación (Fase 2 en adelante), identifica toda decisión de regla de negocio que la funcionalidad introduce y que **no** esté ya resuelta por un patrón idéntico ya existente. Para cada una, formula una pregunta abierta explícita al humano (vía `AskUserQuestion` o pregunta directa) — nunca la resuelvas copiando en silencio el patrón del ticket más parecido. Ejemplos de lo que SIEMPRE requiere pregunta:
1. **Control de acceso:** ¿qué rol(es) pueden ejecutar cada operación nueva (crear/editar/eliminar/listar)?
2. **Integridad y duplicados:** ¿se permite un registro duplicado, o debe rechazarse/advertirse?
3. **Dominio de datos:** ¿los campos nuevos aceptan cualquier valor (texto libre) o deben restringirse a un conjunto cerrado?
4. **Casos límite y fallas:** ¿qué pasa si la operación falla a mitad de camino, o si un dato referenciado no existe?

**Excepción explícita:** si la funcionalidad es una extensión byte-a-byte de un patrón ya aprobado sin ninguna decisión de negocio nueva (ej. un campo idéntico en forma a otro ya existente), documenta esa equivalencia en el reporte de la Fase 1 y omite esta fase — no la conviertas en burocracia para cambios triviales.

**Esta fase NO se satisface con el gate genérico de Human-in-the-Loop de `.agents/README.md`** (presentar un diseño ya cerrado para aprobación sí/no, ej. `EnterPlanMode`/`ExitPlanMode`): ese gate aprueba una decisión ya tomada, no expone al humano las alternativas de negocio subyacentes. Las respuestas obtenidas aquí se documentan explícitamente en la User Story y/o el Ticket Técnico resultante (sección dedicada, ej. "Decisiones de negocio consultadas con el humano"), citando pregunta y respuesta — nunca como una decisión silenciosa del agente.

### FASE 2: Modificación de Requisitos y Modelo
1. **PRD (`docs/01_product_definition/`):** Integra la funcionalidad en la descripción de alcance o flujos alternativos.
2. **Diseño de Arquitectura y Base de Datos:**
   * Si requiere cambios de base de datos, edita el esquema declarativo oficial (convención snake_case en BD, camelCase en código, uso estricto de Decimal para montos/cantidades físicas, uso de Enums nativos para campos cerrados e índices de búsqueda).
   * Actualiza el modelo lógico en `docs/02_architecture_design/` y `docs/03_persistence_and_api/`.
3. **Contrato de API (`docs/03_persistence_and_api/`):** Agrega o modifica las firmas de endpoints, payloads de esquemas de validación y códigos de respuesta.

### FASE 3: Gestión del Backlog y Trazabilidad
1. **User Story:**
   * Crea el archivo `docs/05_agile_planning/11_user_stories/{modulo}/US-NNN.md` (donde `{modulo}` es la subcarpeta del Epic/Módulo correspondiente, y NNN es el correlativo correcto) bajo el formato INVEST.
   * Redacta al menos 2 escenarios BDD Gherkin (Happy Path y Edge Case).
   * Enlaza esta historia en `docs/05_agile_planning/11_user_stories/indice_user_stories.md`.
2. **Tickets Técnicos (Backend/Frontend):**
   * **Garantía de Core:** Asegura que en `docs/05_agile_planning/12_tickets/shared/` existan siempre los tickets habilitadores de infraestructura base: `shared/backend/TK-001.md` (Core Backend Workspace & DB) y `shared/frontend/TK-001-FE.md` (Core Frontend Workspace & Design System Base).
   * Desglosa las historias de usuario en tickets atómicos y guárdalos en las subcarpetas de Epic/Módulo correspondientes de `docs/05_agile_planning/12_tickets/` (ej. `12_tickets/{modulo}/backend/TK-NNN.md` y `12_tickets/{modulo}/frontend/TK-NNN-X.md`).
   * Para cada ticket, indica la estimación en Story Points, prioridad MoSCoW, capas de código afectadas y Definition of Done (DoD) estricto (exigiendo TDD y cumplimiento de estrategias de seguridad/ergonomía).
   * Enlaza los tickets creados en el archivo `docs/05_agile_planning/12_tickets/indice_tickets.md`.
3. **Mapa del Backlog (docs/05_agile_planning/14_backlog_map.md):** Actualiza el diagrama Mermaid para incluir el nuevo nodo de la Epic (si corresponde), la nueva User Story (`US-NNN`) y sus respectivos Tickets Técnicos de Backend y Frontend, definiendo sus relaciones. Agrega la fila correspondiente en la **Tabla de Navegación del Backlog (Alternativa)** inferior para garantizar la navegabilidad.

### FASE 4: Consolidación del README y Estructura
1. **README y Estructura:** Si el cambio altera la estructura de directorios, modifica la sección de mapa de ficheros en el `readme.md` y en `docs/02_architecture_design/`.
2. **Descripción de Componentes:** Si se introducen nuevos componentes, capas u responsabilidades técnicas, actualiza `docs/02_architecture_design/` para mantener la consistencia arquitectónica.
3. **README Características:** Actualiza la lista de características principales en el `readme.md` de la raíz del proyecto.

---

**REGLAS DE EJECUCIÓN (INNEGOCIABLES):**
*   **Ediciones no destructivas:** Mantén intactos todos los comentarios, explicaciones y estructuras de los documentos preexistentes. Realiza únicamente ediciones localizadas y quirúrgicas.
*   **Convenciones:** Redacta todas las explicaciones de negocio en español profesional, dejando los términos técnicos de programación (nombres de variables, tipos de datos, consultas de persistencia) en inglés. Muestra el diff de los cambios realizados.
*   **Interrogatorio Obligatorio (Guard 28):** No avances a la Fase 2 sin haber resuelto la Fase 1.5 — ninguna decisión de regla de negocio queda implícita en la spec o el código sin haber sido primero una pregunta explícita respondida por el humano.
