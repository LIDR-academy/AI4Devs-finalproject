# 🏚️ Instrucción para el Agente de IA: Adopción de Proyecto Brownfield (Código Existente ➔ `.agents/` Operativo)

> [!IMPORTANT]
> **DIRECTIVA PARA EL AGENTE DE IA:**
> Este workflow se ejecuta **una única vez por proyecto**, cuando un repositorio con código existente y **sin `docs/00_stack_manifest.md`** adopta `.agents/` por primera vez. Es el equivalente brownfield de [`00_greenfield_bootstrap_workflow.md`](00_greenfield_bootstrap_workflow.md): ambos resuelven el mismo problema de origen (no existe `docs/` gobernante todavía), pero aquí el punto de partida es código real, no una idea en blanco.
>
> **GUARDIA DE ENTRADA:**
> Si `docs/00_stack_manifest.md` **ya existe**, este NO es un proyecto sin adoptar — detente y redirige a [`01_cascading_spec_workflow.md`](01_cascading_spec_workflow.md) para nuevas features o a [`03_spec_audit_workflow.md`](03_spec_audit_workflow.md) si lo que se necesita es auditar la suficiencia de una documentación ya existente.
>
> **DIFERENCIA CLAVE CON GREENFIELD:** en greenfield el stack se **decide** con el humano (2-3 opciones, trade-offs). Aquí el stack ya existe en el código — se **descubre** por inspección y se **confirma** con el humano. Nunca proponer alternativas a algo que ya está en producción.
>
> **ROLES A ASUMIR POR EL AGENTE:**
> *   **Reverse Engineer / Principal Software Architect:** Reconstruye arquitectura, modelo de dominio y stack a partir de evidencia real de código, nunca por inferencia especulativa.
> *   **Senior Product Manager:** Reconstruye la intención de negocio combinando evidencia de código con entrevista estructurada al humano — el código dice el "qué", el humano dice el "por qué".
> *   **Lead Technical Governance Officer:** Traduce lo descubierto en reglas de gobernanza (`SK-27`) y deuda técnica priorizada (`SK-31`) accionable por el resto del framework.

---

## 🧭 Proceso de Adopción (Fases Secuenciales)

### FASE 0: Verificación de Precondiciones
1. Confirma que `docs/00_stack_manifest.md` **no existe**. Si existe, aplica la Guardia de Entrada de arriba y detente.
2. Confirma con el humano el alcance de la adopción: ¿todo el repositorio, o un módulo/subdirectorio específico? Los pasos siguientes operan sobre ese `codebase_path`.

### FASE 1: Extracción Técnica desde Código (no depende de `docs/` previo)
Estos dos pasos leen código directamente, no documentación — pueden ejecutarse aunque `docs/` esté vacío.
1. Invoca [`SK-30: Extractor de Diagramas Legacy`](../skills/development/01_rules_extraction/SK-30_legacy_diagram_extractor.md) sobre `codebase_path`. Produce diagramas C4/ERD en `docs/02_architecture_design/`.
2. Invoca [`SK-33: Auditoría de Configuración de Entorno`](../skills/development/01_rules_extraction/SK-33_environment_configuration_auditor.md) sobre los `.env`/`.env.example` existentes. Produce el esquema de validación Fail-Fast y una plantilla `.env.example` saneada.

### FASE 2: Reconstrucción del Producto (Ingeniería Inversa + Entrevista Humana OBLIGATORIA)
El código revela comportamiento, no intención de negocio — esta fase existe específicamente para no asumir esa intención en silencio.
1. Invoca [`SK-01: Descubrimiento de Producto`](../skills/specs/01_product_definition/SK-01_discover_product_vision.md) en **MODO C (Reconstrucción Retroactiva)**, usando `codebase_path` y los diagramas de FASE 1 como evidencia. Esta skill **debe** entrevistar al humano antes de escribir nada — nunca infiere el "por qué" de negocio solo del código. Produce `docs/01_product_definition/01_product_discovery.md` y `01_glosario_y_reglas_negocio.md`.
2. Invoca [`SK-02: Generación del PRD`](../skills/specs/01_product_definition/SK-02_generate_prd.md) sobre esos artefactos. Produce `docs/01_product_definition/02_prd.md`.
3. Invoca [`SK-03: Modelo Conceptual de Dominio`](../skills/specs/02_architecture_design/SK-03_design_domain_model.md) sobre el PRD reconstruido. Produce `docs/02_architecture_design/03_domain_model.md` — es una dependencia explícita de `SK-04` en FASE 3.

### FASE 3: Descubrimiento de Stack Tecnológico (Delegado en `SK-04`, Modo Brownfield — Human-in-the-Loop OBLIGATORIO)
Invoca [`SK-04: Arquitectura de Sistema y Stack Tecnológico`](../skills/specs/02_architecture_design/SK-04_design_technical_architecture.md) en su **Modo Brownfield**: inspecciona manifiestos reales del proyecto (`package.json`, lockfiles, `requirements.txt`, Dockerfiles, etc.), presenta el inventario detectado al humano para confirmación — nunca propone alternativas a tecnología ya en producción — y tras la aprobación escribe tanto `docs/02_architecture_design/04_technical_design.md` como `docs/00_stack_manifest.md` (con las 8 secciones canónicas, poblado con lo realmente detectado, no con valores por defecto).

### FASE 4: Contrato Operativo Raíz
La mayoría de las skills invocadas de aquí en adelante (incluyendo `SK-27` a continuación) asumen que `AGENTS.md` existe para leer comandos canónicos — en un proyecto que nunca usó `.agents/`, casi siempre no existe todavía, aunque el proyecto ya tenga código funcionando.
1. Invoca [`SK-35: Generación del Contrato Operativo Raíz`](../skills/specs/04_governance_and_quality/SK-35_generate_root_contract.md) usando los comandos reales ya presentes en el `package.json`/manifiesto de build existente y `docs/00_stack_manifest.md` recién escrito. Genera `AGENTS.md` y los entrypoints `CLAUDE.md`/`GEMINI.md`. **Si el proyecto ya tenía convenciones de comandos distintas a lo que el inventario de FASE 3 detectó, resuelve la discrepancia con el humano antes de guardar** — mismo principio de FASE 2: nunca asumir en silencio.

### FASE 5: Gobernanza y Deuda Técnica
Ahora que `docs/01_product_definition/`, `docs/02_architecture_design/` y `AGENTS.md` tienen contenido real, estas dos skills pueden operar (antes de esta fase, sus dependencias no existían):
1. Invoca [`SK-27: Extracción de Reglas de Gobernanza`](../skills/development/01_rules_extraction/SK-27_extract_project_rules.md) sobre `docs/`. Produce `docs/04_governance_and_quality/rules/`.
2. Invoca [`SK-31: Indexador de Deuda Técnica`](../skills/development/01_rules_extraction/SK-31_technical_debt_indexer.md) sobre `codebase_path`. Produce `docs/05_agile_planning/technical_debt.md`.

### FASE 6: Inicialización del Esqueleto de Backlog Restante
Igual que en greenfield, [`01_cascading_spec_workflow.md`](01_cascading_spec_workflow.md) asume en su FASE 0 que estos índices existen:
1. `docs/05_agile_planning/11_user_stories/indice_user_stories.md` (índice vacío, o poblado si el humano quiere documentar retroactivamente historias ya implementadas).
2. `docs/05_agile_planning/12_tickets/indice_tickets.md` (índice vacío).
3. `docs/05_agile_planning/14_backlog_map.md` (diagrama Mermaid raíz).

### FASE 7: Traspaso al Ciclo Cascada Estándar
1. Presenta al humano un resumen ejecutivo: qué se reconstruyó (producto, dominio, stack), qué deuda técnica se detectó (priorizada por `SK-31`) y qué reglas de gobernanza quedaron activas.
2. Pregunta si desea convertir los hallazgos de mayor severidad de `technical_debt.md` en tickets `TK-XXX` de inmediato (vía una primera pasada de `01_cascading_spec_workflow.md`) o dejar la matriz de deuda como referencia para priorización posterior.
3. A partir de este punto, este workflow **no vuelve a invocarse** para el mismo proyecto — el ciclo de vida continúa exclusivamente por [`00_master_vsdd_workflow.md`](00_master_vsdd_workflow.md), igual que un proyecto nacido greenfield.

---

**REGLAS DE EJECUCIÓN (INNEGOCIABLES):**
*   **El código nunca se reescribe durante este workflow:** todas las fases son de lectura/documentación. Ningún archivo bajo `codebase_path` se modifica — solo se generan artefactos nuevos en `docs/`.
*   **Discrepancia código-vs-humano se documenta, no se resuelve en silencio:** si `SK-01` (MODO C) detecta que el comportamiento real del código contradice lo que el humano describe como intención, ambas versiones quedan registradas explícitamente — la resolución es una decisión de negocio, no de la IA.
*   **Un solo bootstrap por proyecto:** igual que en greenfield, si `docs/00_stack_manifest.md` existe, este documento no aplica.
