# 🌱 Instrucción para el Agente de IA: Bootstrap de Proyecto Greenfield (Idea ➔ Repositorio Operativo)

> [!IMPORTANT]
> **DIRECTIVA PARA EL AGENTE DE IA:**
> Este workflow se ejecuta **una única vez por proyecto**, cuando el usuario suministra una idea de negocio sobre un directorio **vacío o sin código previo relevante** que todavía NO tiene `docs/00_stack_manifest.md` ni `docs/01_product_definition/02_prd.md`. Resuelve el problema de "huevo y gallina" que ningún otro workflow cubre: antes de que exista un stack aprobado y un esqueleto de repositorio, ninguna otra skill de `.agents/` puede generar código (Guard 24) ni completar su Fase 0 de lectura de índices.
>
> **¿Ya existe código?** Si el directorio tiene un repositorio con código funcional (aunque no tenga `docs/`), este NO es tu workflow — usa [`00_brownfield_adoption_workflow.md`](00_brownfield_adoption_workflow.md), que descubre el stack por inspección en vez de decidirlo desde cero.
>
> **GUARDIA DE ENTRADA (verificar antes de ejecutar cualquier fase):**
> Si `docs/00_stack_manifest.md` **ya existe**, este NO es un proyecto greenfield — detente inmediatamente y redirige al usuario a [`01_cascading_spec_workflow.md`](01_cascading_spec_workflow.md). Ejecutar este workflow sobre un proyecto ya bootstrapeado arriesga sobrescribir decisiones de stack y estructura ya aprobadas por el humano.
>
> **ROLES A ASUMIR POR EL AGENTE:**
> *   **Senior Product Manager:** Ejecuta el descubrimiento de producto delegando en `SK-01`/`SK-02`.
> *   **Principal Software Architect / DevSecOps Lead:** Propone opciones de stack tecnológico y traduce la decisión humana en `docs/00_stack_manifest.md` y el esqueleto real del repositorio.
> *   **Agnosticismo estricto:** Ninguna fase de este documento asume Node.js, pnpm, React ni ninguna tecnología específica — el stack se decide en FASE 2 según las necesidades reales del producto descrito en el PRD, nunca por defecto ni por costumbre.

---

## 🧭 Proceso de Bootstrap (Fases Secuenciales)

### FASE 0: Verificación de Precondiciones
1. Confirma que `docs/00_stack_manifest.md` **no existe**. Si existe, aplica la Guardia de Entrada de arriba y detente.
2. Si el directorio no es un repositorio git, ejecuta `git init` antes de continuar.
3. Confirma con el humano el nombre de working directory / repositorio antes de escribir cualquier archivo.

### FASE 1: Descubrimiento de Producto y PRD (Delegación — sin duplicar lógica)
Este workflow **no reimplementa** la generación de PRD: delega íntegramente en las skills existentes, que ya soportan una idea vaga sin contexto previo.
1. Invoca [`SK-01: Descubrimiento de Producto`](../skills/specs/01_product_definition/SK-01_discover_product_vision.md) en **MODO B (Investigación Autónoma)** usando la idea de negocio suministrada por el usuario como `product_idea_or_research_md`. Produce `docs/01_product_definition/01_product_discovery.md` y `01_glosario_y_reglas_negocio.md`.
2. Invoca [`SK-02: Generación del PRD`](../skills/specs/01_product_definition/SK-02_generate_prd.md) sobre esos dos artefactos. Produce `docs/01_product_definition/02_prd.md`, incluyendo la confirmación humana del nombre del producto (Fase 2 de esa skill).
3. Invoca [`SK-03: Modelo Conceptual de Dominio`](../skills/specs/02_architecture_design/SK-03_design_domain_model.md) sobre el PRD y el glosario. Produce `docs/02_architecture_design/03_domain_model.md` — es una dependencia explícita de `SK-04` en FASE 2, así que debe existir antes de continuar.

### FASE 2: Decisión de Stack Tecnológico (Delegado en `SK-04` — Human-in-the-Loop OBLIGATORIO)
Esta es la fase más irreversible del bootstrap — un cambio de stack posterior es costoso. Este workflow **no reimplementa** la lógica de decisión de stack: invoca [`SK-04: Arquitectura de Sistema y Stack Tecnológico`](../skills/specs/02_architecture_design/SK-04_design_technical_architecture.md), que ya define el protocolo completo:
1. `SK-04` analiza el PRD y el Modelo de Dominio de FASE 1 y propone 2-3 combinaciones de stack completas con trade-offs y matriz de riesgos — nunca una sola opción impuesta.
2. `SK-04` ejecuta su propia **PAUSA OBLIGATORIA (Human-in-the-Loop)** esperando confirmación explícita antes de escribir nada.
3. Tras la aprobación, `SK-04` escribe tanto `docs/02_architecture_design/04_technical_design.md` (justificación completa + diagramas C4) como `docs/00_stack_manifest.md` (la tabla canónica de 8 secciones que Guard 24 exige).
4. Este workflow solo continúa a FASE 3 una vez que `docs/00_stack_manifest.md` existe con `status: approved`.

### FASE 3: Scaffolding del Repositorio
Usando exclusivamente las tecnologías ya confirmadas en `docs/00_stack_manifest.md`:
1. Crea la configuración raíz del gestor de paquetes/workspace declarado (ej. `package.json` + workspaces, `pyproject.toml`, `go.work`, según corresponda al stack elegido — nunca asumas un ecosistema no confirmado en FASE 2).
2. Crea el esqueleto de carpetas `apps/<backend>` y `apps/<frontend>` (o la topología que declare el manifiesto) vacíos, listos para recibir el primer ticket de infraestructura.
3. Crea `.gitignore` acorde al stack, y pregunta al humano qué licencia usar para el código del proyecto (MIT por defecto si no hay preferencia) antes de escribir `LICENSE`.
4. Invoca [`SK-35: Generación del Contrato Operativo Raíz`](../skills/specs/04_governance_and_quality/SK-35_generate_root_contract.md) para generar `AGENTS.md` (a partir del `package.json`/manifiesto real recién creado y `docs/00_stack_manifest.md`) y los entrypoints `CLAUDE.md`/`GEMINI.md`. **Este paso es obligatorio antes de continuar** — todas las skills invocadas de aquí en adelante (incluyendo las de este mismo workflow) asumen que `AGENTS.md` existe para leer comandos canónicos.
5. Invoca en secuencia [`SK-08: Estrategia de Seguridad`](../skills/specs/04_governance_and_quality/SK-08_define_security_strategy.md) y [`SK-09: Estrategia de Pruebas`](../skills/specs/04_governance_and_quality/SK-09_define_testing_strategy.md) — son dependencias explícitas de `SK-10` (su `inputs:` las exige) y todavía no existen en un proyecto greenfield.
6. Invoca [`SK-10: Pipeline CI/CD & OpenTofu IaC`](../skills/specs/04_governance_and_quality/SK-10_configure_cicd_pipeline.md) para generar el workflow de CI inicial, ahora que existen tanto el `package.json`/manifiesto de build como `08_security_strategy.md`/`09_testing_strategy.md` sobre los cuales `SK-10` pueda operar.
7. **Gobernanza recomendada (opcional, presenta la opción al humano, no la apliques en silencio):** un hook `commit-msg` que exija referenciar un ticket `TK-XXX` en cada commit, análogo al usado en otros proyectos gobernados por este mismo `.agents/` — solo si el humano lo confirma.

### FASE 4: Inicialización del Esqueleto de `docs/`
[`01_cascading_spec_workflow.md`](01_cascading_spec_workflow.md) asume en su FASE 0 que estos archivos ya existen para poder leerlos — créalos vacíos/mínimos ahora para que el traspaso de FASE 5 no falle:
1. `docs/05_agile_planning/11_user_stories/indice_user_stories.md` (índice vacío).
2. `docs/05_agile_planning/12_tickets/indice_tickets.md` (índice vacío).
3. `docs/05_agile_planning/14_backlog_map.md` (diagrama Mermaid raíz vacío, listo para su primer nodo).
4. `docs/03_persistence_and_api/06_database_schema.md` (esqueleto vacío — se poblará en la primera pasada de `01_cascading_spec_workflow.md`).
5. `readme.md` de la raíz del proyecto, con el nombre confirmado en FASE 1 y una sección de estructura de carpetas mínima (FASE 4 de `01_cascading_spec_workflow.md` la mantiene actualizada después).

### FASE 5: Traspaso al Ciclo Cascada Estándar
1. Presenta al humano un resumen ejecutivo: stack confirmado, estructura creada, artefactos de `docs/` generados.
2. Pregunta explícitamente si desea continuar de inmediato con la primera pasada de [`01_cascading_spec_workflow.md`](01_cascading_spec_workflow.md) (usando el propio PRD de FASE 1 como la "idea" a propagar, generando `US-001` y el ticket core `TK-001` de infraestructura) o detenerse aquí para revisión manual.
3. A partir de este punto, este workflow **no vuelve a invocarse** para el mismo proyecto — el ciclo de vida continúa exclusivamente por [`00_master_vsdd_workflow.md`](00_master_vsdd_workflow.md).

---

**REGLAS DE EJECUCIÓN (INNEGOCIABLES):**
*   **Nada de decisiones de stack por defecto:** FASE 2 no puede completarse sin una elección humana explícita entre opciones reales — nunca "porque es lo más común" o "porque es lo que ya conozco".
*   **Un solo bootstrap por proyecto:** si `docs/00_stack_manifest.md` existe, este documento no aplica; usa `01_cascading_spec_workflow.md` para cualquier cambio posterior, incluyendo cambios de stack (que además requieren aprobación explícita adicional al modificar un archivo `status: approved`).
*   **Cero artefactos huérfanos:** cada archivo creado en FASE 3 y FASE 4 debe quedar enlazado desde `readme.md` o el índice correspondiente — no se dejan archivos sin referenciar.
