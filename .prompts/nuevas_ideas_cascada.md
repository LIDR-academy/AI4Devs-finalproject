# 💡 Instrucción para el Agente de IA: Propagación de Nuevas Ideas o Funcionalidades

> [!IMPORTANT]
> **DIRECTIVA PARA EL AGENTE DE IA:**
> Cuando el usuario te pida integrar una nueva funcionalidad o requerimiento, debes leer este documento y ejecutar estrictamente el proceso de actualización en cascada detallado a continuación.
> 
> **ROLES A ASUMIR POR EL AGENTE:**
> Para la ejecución de este proceso, debes actuar bajo los siguientes roles y perspectivas técnicas:
> *   **Principal Software Architect:** Garantiza que no se violen las dependencias de la Arquitectura Hexagonal y que se respete el Vertical Slicing.
> *   **Senior Product Owner:** Redacta y valida las User Stories bajo criterios INVEST y BDD Gherkin con escenarios Happy Path y Edge Cases.
> *   **Database Administrator (DBA):** Vela por la consistencia del modelo físico de base de datos (`schema.prisma`) respetando la 3NF, tipos de datos correctos (`Decimal`) y convenciones físicas.

## 🧭 Proceso de Propagación en Cascada (Cascading Update Protocol)

Dada la idea o requerimiento suministrado por el usuario, debes ejecutar de forma autónoma las siguientes fases en orden secuencial:

---

### FASE 0: Lectura y Mapeo de Contexto (Obligatorio)
Antes de proponer o realizar cualquier cambio, debes:
1. Leer los archivos de índices (`docs/user_stories/indice_user_stories.md` y `docs/tickets/indice_tickets.md`) para determinar el **siguiente identificador correlativo libre** (ej. `US-007` y `TK-008`). Está terminantemente prohibido usar placeholders como `US-XXX` o `TK-XXX`.
2. Leer el estado actual del `schema.prisma` y los documentos del core (`docs/02_restostock_prd.md`, `docs/03_restostock_design.md` y `readme.md`) para mapear el impacto real.

### FASE 1: Análisis de Impacto (Impact Assessment)
Responde en tu primer turno con un breve reporte estructural:
1. ¿Qué Vertical Slice se ve afectado o si es necesario crear uno nuevo?
2. ¿Qué capas de la arquitectura hexagonal requieren cambios (Domain, Application, Infrastructure)?
3. ¿Afecta al modelo físico de base de datos (schema.prisma)?
4. ¿Afecta o introduce nuevos endpoints en la API?

### FASE 2: Modificación de Requisitos y Modelo
1. **PRD (docs/02_restostock_prd.md):** Integra la funcionalidad en la descripción de alcance o flujos alternativos.
2. **Diseño de Arquitectura y Base de Datos:**
   * Si requiere cambios de base de datos, edita `prisma/schema.prisma` (convención snake_case en BD, camelCase en código, uso estricto de Decimal para montos/cantidades físicas, uso de Enums de Prisma para campos cerrados y declaración de índices de búsqueda).
   * Actualiza el modelo lógico en `docs/03_restostock_design.md` y `docs/09_restostock_database_schema.md`.
3. **Contrato de API (docs/10_restostock_api_specification.md):** Agrega o modifica las firmas de endpoints, payloads (JSON Zod) y códigos de respuesta.

### FASE 3: Gestión del Backlog y Trazabilidad
1. **User Story:** Crea el archivo `docs/user_stories/US-NNN.md` (donde NNN es el correlativo correcto) bajo el formato INVEST y redacta al menos 2 escenarios BDD Gherkin (Happy Path y Edge Case). Enlaza esta historia en `docs/user_stories/indice_user_stories.md`.
2. **Ticket técnico:** Crea el archivo `docs/tickets/TK-NNN.md` (donde NNN es el correlativo correcto) indicando la estimación en Story Points, prioridad MoSCoW, capas de código afectadas y Definition of Done (DoD) estricto. **Exige el cumplimiento de la estrategia de pruebas TDD** (`docs/08_restostock_testing_strategy.md`) y las validaciones de seguridad (`docs/07_restostock_security_strategy.md`). Enlaza este ticket en `docs/tickets/indice_tickets.md`.
3. **Mapa del Backlog (docs/backlog_map.md):** Actualiza el diagrama Mermaid para incluir el nuevo nodo de la Epic (si corresponde), la nueva User Story (`US-NNN`) y su respectivo Ticket Técnico (`TK-NNN`), definiendo sus relaciones de forma puramente descriptiva. Asimismo, agrega la fila correspondiente con los hipervínculos Markdown en la **Tabla de Navegación del Backlog (Alternativa)** inferior para garantizar la navegabilidad.

### FASE 4: Consolidación del README y Estructura
1. **README y Estructura:** Si el cambio altera la estructura de directorios, modifica la sección de mapa de ficheros en el `readme.md` y en `docs/06_restostock_folder_structure.md`.
2. **Descripción de Componentes:** Si se introducen nuevos componentes, capas u responsabilidades técnicas, actualiza `docs/05_restostock_components_description.md` para mantener la consistencia arquitectónica.
3. **README Características:** Actualiza la lista de características principales en el `readme.md` de la raíz del proyecto.

---

**REGLAS DE EJECUCIÓN (INNEGOCIABLES):**
*   **Ediciones no destructivas:** Mantén intactos todos los comentarios, explicaciones y estructuras de los documentos preexistentes. Realiza únicamente ediciones localizadas y quirúrgicas.
*   **Convenciones:** Redacta todas las explicaciones de negocio en español profesional, dejando los términos técnicos de programación (nombres de variables, tipos de datos, consultas Prisma) en inglés. Muestra el diff de los cambios realizados.
