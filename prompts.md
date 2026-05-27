> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o los de corrección o adición de funcionalidades que consideres más relevantes.


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

**Prompt 1:**
```
Eres un Arquitecto de Datos Senior especializado en plataformas SSOT con asistencia de IA.

Necesito crear un framework reutilizable para proyectos de Single Source of Truth que pueda usarse con agentes de IA como Cursor o Claude Code. El framework debe:

1. Guiar el trabajo por fases secuenciales (análisis → diseño → codegen → calidad → entrega)
2. Garantizar que el diseño y la gobernanza preceden siempre a la generación de código
3. Mantener el estado del proyecto entre sesiones de trabajo mediante archivos Markdown versionados con Git
4. Forzar que el humano apruebe explícitamente cada lote de trabajo antes de avanzar

Define la estructura de carpetas canónica del proyecto, los componentes principales y las reglas de operación que los agentes deben seguir en todo momento. El idioma de trabajo es español técnico.
```

**Prompt 2:**
```
Basándote en la estructura del framework SSOT que hemos definido, necesito crear el archivo `project.config.yaml` que sea el único punto de configuración que el usuario necesita editar.

El archivo debe incluir:
- Modo del framework: "template" (plantilla) o "project-instance" (proyecto real)
- Identidad del proyecto: nombre, versión, descripción, sector, equipo
- Stack tecnológico: motor de BD, lenguaje, herramientas de ingesta, transformación y orquestación
- Modelos de IA por nivel de complejidad: alta (diseño/ADRs), media (análisis), baja (tareas mecánicas), codegen
- Configuración de revisión cross-proveedor R-17: modelo revisor vs OpenAI y vs Anthropic
- Presupuesto de tokens por iteración y por lote con umbrales soft y hard
- Parámetros de retención: días de snapshots PostgreSQL, versiones Parquet a conservar

Incluye comentarios explicativos en cada sección y valores de ejemplo realistas para un proyecto de datos con PostgreSQL + PySpark + Airflow.
```

**Prompt 3:**
```
El framework tiene un archivo `.cursorrules` que define el comportamiento del agente en cada sesión. Necesito que generes este archivo con las siguientes secciones obligatorias:

1. Paso 0.5 inviolable: declarar el modelo activo y esperar confirmación antes de cualquier acción material (anti-patrón "inercia de sesión")
2. Rol y contexto del agente como Arquitecto de Datos Senior
3. Reglas de idioma: toda respuesta y documentación en español técnico; nombres de tabla/columna en snake_case español; palabras clave SQL en inglés estándar
4. Etiquetado obligatorio de fase en cada artefacto: [MVP] [FASE 2] [FASE 3+] etc.
5. Protocolo de inicio de sesión: ejecutar sanidad_pre_sesion.py, clasificar tipo de sesión (proyecto/framework), leer estado, reportar plan y esperar confirmación
6. Protocolo de cierre: actualizar estado, verificar aprobaciones pendientes, ejecutar preflight, gate humano binario (sí/no), marcar Hecho solo tras "sí"
7. Prohibiciones absolutas: no generar DDL sin grain aprobado, no hardcodear credenciales, no mezclar evento y estado en la misma tabla, no exponer PII en capa gold sin enmascaramiento

El agente debe rechazar cualquier acción que viole estas reglas aunque el usuario lo pida explícitamente.
```

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
```
Necesito un diagrama de arquitectura para el SSOT Framework que muestre cómo se relacionan sus componentes principales.

Los componentes a representar son:
- IDE/CLI (Cursor, Claude Code) como punto de entrada del usuario
- Sistema de agentes (.ai/agents/) con 19 agentes especializados
- Motor de estado (scripts/motor/) que gestiona las fases 0 a 7
- Suite de validadores (scripts/utilidades/) con ~25 scripts
- Sistema de calidad de datos (runner_rn.py + 3 engines: GE, SQL, PySpark)
- DAGs de Airflow (dq_continuo, gc_versions_parquet, gc_snapshots_postgres)
- Base de datos PostgreSQL con esquema mart y tabla dq_metricas
- Git/LFS para gestión de evidencia documental con política PII

Genera el diagrama en formato ASCII box-drawing compatible con Markdown. Muestra las relaciones de flujo entre componentes con flechas direccionales. Incluye una nota sobre el patrón arquitectónico seguido y su justificación.
```

**Prompt 2:**
```
El framework SSOT sigue un patrón de "pipeline por fases con gates". Necesito que documentes la justificación arquitectónica de esta decisión frente a alternativas como un DAG monolítico o un sistema de tickets.

Específicamente explica:
1. Por qué Markdown como estado (en lugar de una base de datos o archivo YAML)
2. Por qué el cierre binario obligatorio (sí/no) en lugar de confirmación automática
3. Por qué el dispatcher híbrido de calidad (GE + SQL + PySpark) en lugar de un solo motor
4. Qué sacrificios implica cada decisión (parseo frágil de Markdown, disciplina de equipo requerida, etc.)
5. Qué beneficios concretos aporta al contexto de proyectos de datos asistidos por IA

Usa el formato de tabla para comparar beneficios vs compromisos de cada decisión.
```

**Prompt 3:**
```
Actúa como revisor adversarial (R-17) con modelo cross-proveedor. Revisa la arquitectura del SSOT Framework que hemos diseñado e identifica:

1. Puntos únicos de falla: ¿qué componente, si falla, bloquea todo el sistema?
2. Acoplamiento excesivo: ¿hay componentes demasiado acoplados entre sí?
3. Escalabilidad: ¿la arquitectura escala a equipos de 10+ personas?
4. Consistencia eventual: ¿puede el estado en proyecto-estado.md quedar inconsistente con los checkpoints de fase?
5. Dependencias críticas: ¿qué pasa si Airflow no está disponible? ¿o si PySpark no está instalado?

Para cada problema identificado, propón una mitigación concreta ya implementada en el framework o una que deberíamos implementar.
```

---

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
```
Describe los componentes principales del SSOT Framework con el nivel de detalle necesario para que un ingeniero nuevo pueda entender qué hace cada uno y cuándo usarlo.

Para cada componente incluye:
- Nombre y ubicación en el repositorio
- Tecnología utilizada y versión mínima requerida
- Propósito concreto y problema que resuelve
- Interfaz de uso (CLI, import Python, etc.)
- Dependencias con otros componentes

Componentes a documentar:
1. Motor de estado (estado_proyecto.py + transicionar.py)
2. Runner de calidad híbrido (runner_rn.py + engines/)
3. Suite de validadores (sanidad_pre_sesion.py, validar_marco_ssot.py, preflight_validacion.py)
4. Sistema de agentes (.ai/agents/)
5. DAGs de Airflow (dq_continuo.py, gc_*.py)
6. Detector PII (_pii_detector.py)
7. Hooks pre-commit (pre_commit_checks.py)
```

**Prompt 2:**
```
El motor de estado del framework SSOT necesita implementar un grafo de transiciones de fases con las siguientes características:

- 15 fases: 0, 0.5, 1, 2, 3A, 3B, 3C, 4, 4.5, 4.6, 5, 5.3, 5.5, 6, 7 y consolidacion
- Transiciones válidas definidas como diccionario: fase_origen → [fases_destino_permitidas]
- Gates de archivos requeridos por transición: (origen, destino) → [rutas relativas que deben existir]
- Gates especiales R-17: transiciones a fases 4.6 y 5.3 requieren --confirm-model con proveedor diferente al generador
- Persistencia: leer y escribir fase_actual en proyecto-estado.md usando file-locking (fcntl) para concurrencia segura
- CLI transicionar.py con flags: --a (destino), --dry-run (simular), --force (eludir gates), --confirm-model

Genera el código Python completo con type hints, dataclasses, enums y docstrings en español.
```

**Prompt 3:**
```
Necesito implementar el runner de reglas de negocio (runner_rn.py) con las siguientes especificaciones:

El runner debe:
1. Leer un archivo YAML con estructura: {rules: [{id, description, engine, severity, target, assertion}]}
2. Validar cada regla antes de ejecutar (campos requeridos, engine válido, severity válida)
3. Hacer dispatch al engine correcto: "pyspark" → PySparkEngine, "sql" → SQLEngine, "ge" → GEEngine
4. Engines soportados: pyspark (para datos a escala), sql (SQLAlchemy directo), ge (Great Expectations)
5. Severidades: blocking (fallo = error), warning (fallo = aviso), info (siempre pasa)
6. Resultado normalizado RnResult con campos: rn_id, engine, severity, passed, duration_ms, message, details
7. Salida JSON con: run_id (timestamp), total, passed, failed, results[]
8. CLI con flags: --rules (ruta YAML), --output (ruta JSON salida), --engine (filtro por motor)

Cada engine debe ser una clase independiente con métodos supports(rn) y run(rn) → EngineResult.
Implementa primero el SQLEngine usando SQLAlchemy con tipos de aserción: count_gt, not_null, custom_query.
```

---

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**
```
Genera la estructura de directorios canónica del SSOT Framework con una descripción de una línea para cada carpeta relevante.

La estructura debe reflejar estos principios:
1. Separación clara entre: cerebro operativo (.ai/), código ejecutable (scripts/), artefactos de datos (sql/, dags/), documentación (docs/) y tests (tests/)
2. Las carpetas de DAGs deben seguir arquitectura medallón: bronce/ (ingesta raw), plata/ (transformación), oro/ (serving/agregados)
3. Los scripts deben estar agrupados por responsabilidad: motor/ (estado), utilidades/ (validadores), calidad/ (DQ), despliegue/ (empaquetado), hooks/ (pre-commit)
4. El directorio .ai/ debe tener: agents/, rules/, skills/, workflows/, estado/ (con fases/ y particiones/), context/, evolucion/, historico/

Usa formato de árbol con indentación. Añade una nota sobre qué patrón arquitectónico justifica esta organización.
```

**Prompt 2:**
```
El directorio .ai/ es el cerebro operativo del framework SSOT. Necesito documentar qué vive en cada subcarpeta y por qué el orden de lectura importa.

Para cada subcarpeta explica:
- agents/: 19 agentes con roles específicos. ¿Cuál leer primero? (orquestador.md es la autoridad máxima)
- rules/: reglas globales R-XX siempre activas. ¿Cómo se numeran y cuándo se añaden nuevas?
- skills/: 26 skills por fase o transversal. ¿Cuándo un agente abre un SKILL.md?
- workflows/: 6 flujos documentados. ¿Cuál aplica en cada situación?
- estado/: proyecto-estado.md (fuente canónica de fase), fases/ (15 checkpoints), particiones/ (ejecución paralela)
- context/: project-context.md, agent-skill-registry.md, decisions-log.md
- evolucion/: lecciones-aprendidas.md vs lecciones-vigentes.md (diferencia crítica)
- historico/: archivado R-22 de iteraciones cerradas

Especifica qué archivos son de lectura obligatoria al inicio de cada sesión vs opcionales.
```

**Prompt 3:**
```
Revisa la estructura de carpetas del SSOT Framework y detecta posibles problemas de organización:

1. ¿Hay archivos que podrían estar en dos lugares lógicamente correctos? ¿Cuál es la regla de desempate?
2. ¿Qué pasa con los archivos temporales generados durante la ejecución? ¿Dónde van y cuándo se limpian?
3. ¿La estructura escala bien si el proyecto tiene 10 dominios de datos con 50+ reglas de negocio cada uno?
4. ¿Hay algún patrón de naming que debería documentarse explícitamente en repo-structure.md?
5. ¿Qué carpetas deberían estar en .gitignore y cuáles son críticas para versionar?

Para cada problema detectado, propón una solución concreta con la regla canónica que la respalda.
```

---

### **2.4. Infraestructura y despliegue**

**Prompt 1:**
```
Necesito implementar el script preparar_entregable.py para el despliegue del SSOT Framework.

El script debe:
1. Validar que existen todos los directorios canónicos requeridos: scripts/, sql/, pipelines/, dags/, docs/, config/ (error si faltan)
2. Validar directorios opcionales: infra/ (warning si falta)
3. Copiar el contenido preservando rutas relativas a dist/implementacion/
4. Excluir: __pycache__/, .pytest_cache/, .venv/, dist/, build/ y archivos .pyc, .pyo, .log
5. Incluir archivos raíz opcionales si existen: README.md, CHANGELOG.md, Makefile, .env.example
6. Retornar un PackageResult dataclass con: output_dir, included_dirs, missing_required, missing_optional, files_copied

El directorio dist/implementacion/ nunca debe convertirse en prefijo runtime de imports o rutas en el proyecto destino.

Genera el código con argparse para --output (directorio destino), --dry-run y logging detallado en español.
```

**Prompt 2:**
```
El framework usa Alembic para gestionar las migraciones de la base de datos PostgreSQL. Necesito:

1. El archivo alembic.ini configurado para que la URL de conexión se inyecte desde variable de entorno (DQ_METRICAS_DATABASE_URL o ALEMBIC_DATABASE_URL) y nunca se hardcodee en archivos versionados
2. El archivo alembic/env.py que lea la URL del entorno en tiempo de ejecución
3. La primera migración: 20260512_0001_create_mart_dq_metricas.py que cree el esquema mart y la tabla dq_metricas con todos sus campos y comentarios
4. El script validar_migraciones_reversibles.py que verifique que toda migración tiene función downgrade() implementada y no vacía

La migración debe ser reversible (incluir downgrade() que elimina la tabla y el esquema). El validador debe bloquearse con exit code 1 si encuentra alguna migración sin downgrade válido.
```

**Prompt 3:**
```
Necesito los tres DAGs de Airflow del framework SSOT:

DAG 1 — dq_continuo.py:
- Ejecuta run_dq_continuo() de scripts/calidad/dq_continuo.py
- Debe funcionar aunque Airflow no esté instalado (fallback con importlib)
- Guarda resultados en mart.dq_metricas vía DATABASE_URL del entorno
- Schedule: diario. Retries: 1. Owner: ssot-framework

DAG 2 — gc_versions_parquet.py:
- Limpia versiones Parquet antiguas bajo cada dominio manteniendo las últimas N (configurable desde project.config.yaml, default 7)
- Actualiza el puntero _current a la versión más reciente

DAG 3 — gc_snapshots_postgres.py:
- Ejecuta pg_dump periódico y elimina snapshots con más de N días (default 14, configurable)
- Registra cada snapshot con timestamp UTC

Todos los DAGs deben tener on_failure_callback y on_retry_callback definidos (prohibición absoluta del framework). Usar Python callables, no BashOperator.
```

---

### **2.5. Seguridad**

**Prompt 1:**
```
El SSOT Framework maneja datos empresariales sensibles y necesita un sistema robusto de detección y gobernanza de PII (Datos Personales Identificables) para el contexto mexicano.

Implementa el módulo _pii_detector.py con:
1. Detección determinística para 10 categorías de PII mexicana:
   - Email (regex estándar RFC 5322 simplificado)
   - CURP (18 caracteres con estructura AAAA-AAMMDDH-SSCC-NN-DD)
   - RFC persona física (13 caracteres) y persona moral (12 caracteres)
   - NSS (11 dígitos con dígito verificador módulo 10)
   - CLABE interbancaria (18 dígitos con dígito verificador módulo 97)
   - INE/IFE (número de credencial 18 dígitos)
   - Número de tarjeta bancaria (Luhn válido, 13-19 dígitos)
   - Teléfono MX (10 dígitos con prefijo 55, 33, 81 u otros)
   - Fecha de nacimiento (formatos DD/MM/YYYY, YYYY-MM-DD)
2. Heurística de contexto: ventana de ±20 caracteres alrededor del match para reducir falsos positivos
3. Semántica WARN/ERROR según modo: en template=WARN, en project-instance=ERROR para PII sin allowlist

El módulo debe ser importable sin dependencias externas (solo stdlib).
```

**Prompt 2:**
```
Necesito implementar el sistema de hooks pre-commit del SSOT Framework.

El archivo pre_commit_checks.py debe exponer funciones puras testeables (sin efectos secundarios) más un orquestador que lee archivos en stage de git. Checks a implementar:

1. check_conflict_markers(content: str) → bool: detecta <<<<<<, ======, >>>>>> en cualquier archivo no binario
2. check_no_env_files(staged_files: list[Path]) → list[Path]: detecta archivos .env en stage (excepto .env.example)
3. check_spanish_comments(file_path: Path, content: str) → list[str]: verifica que comentarios # y docstrings Python están en español técnico (delega a validar_idioma_comentarios.py)

El orquestador principal main() debe:
- Leer FRAMEWORK_MODE desde entorno o project.config.yaml
- En modo project-instance: comentarios en inglés = ERROR bloqueante
- En modo template: comentarios en inglés = WARNING no bloqueante
- Retornar exit code 0 (OK), 1 (warnings), 2 (errores bloqueantes)

Añade también el shell script pre-commit-ssot.sh que invoca pre_commit_checks.py y el install-hooks.sh que configura git hooks path.
```

**Prompt 3:**
```
Necesito documentar e implementar la política de Git LFS para archivos de evidencia documental del SSOT Framework.

La política "Opción A diferenciada" establece:
- Siempre-LFS (track automático): .pdf, .doc, .docx, .xls, .xlsx, .pptx, .msg, .eml, .parquet, .orc
- LFS on-demand (según tamaño): .json, .sql
- Umbrales: 25 MB por archivo individual, 2 GB acumulado en fuentes/evidencia/

Implementa:
1. El archivo .gitattributes con las reglas de track para cada extensión
2. El check check_lfs_evidencia(repo_root) que:
   - Verifica que archivos always-LFS bajo fuentes/evidencia/ son pointers LFS (no binarios inline)
   - Alerta si algún archivo supera 25 MB sin ser LFS pointer
   - Alerta si el total de fuentes/evidencia/ supera 2 GB
   - Genera WARNING en template, ERROR en project-instance
3. El check check_pii_evidencia(repo_root) que ejecuta _pii_detector sobre todos los archivos en fuentes/evidencia/ y reporta hallazgos contra pii_allowlist.yaml

Ambos checks deben ser invocados desde preflight_validacion.py como parte del pipeline de validación.
```

---

### **2.6. Tests**

**Prompt 1:**
```
Necesito crear la suite de tests unitarios para el motor de estado del SSOT Framework (test_estado_proyecto.py).

Tests requeridos:
1. test_fase_from_str_valida: todas las fases del enum son accesibles por string
2. test_fase_from_str_invalida: string desconocido lanza ValueError con mensaje claro
3. test_transicion_valida: F0 → F0_5 se aplica correctamente en proyecto-estado.md temporal
4. test_transicion_invalida: F7 → F0 lanza GateError con mensaje "transición no permitida"
5. test_gate_archivo_faltante: transición F0 → F0_5 falla si .ai/estado/fases/fase-0-fuentes.md no existe
6. test_gate_archivo_presente: misma transición pasa si el archivo existe
7. test_gate_r17_falta_confirm_model: F4 → F4_6 sin --confirm-model lanza GateError
8. test_gate_r17_mismo_proveedor: F4 → F4_6 con modelo del mismo proveedor que el generador lanza GateError
9. test_dry_run_no_escribe: --dry-run no modifica proyecto-estado.md
10. test_force_elude_gates: --force aplica transición aunque fallen los gates de archivos

Usa pytest con tmp_path para crear repos temporales. Las fixtures deben crear la estructura mínima necesaria (project.config.yaml, proyecto-estado.md con fase actual).
```

**Prompt 2:**
```
Necesito tests para los tres engines de calidad de datos del SSOT Framework.

Para SQLEngine (test_sql_engine.py):
1. test_count_gt_pasa: query que devuelve 5, expected=3 → passed=True
2. test_count_gt_falla: query que devuelve 2, expected=3 → passed=False
3. test_not_null_pasa: query sin nulos → passed=True
4. test_connection_vacia: target.connection="" → passed=False con code="invalid_target"
5. test_sqlalchemy_no_disponible: mock ImportError → passed=False con code="missing_dependency"

Para GEEngine (test_ge_engine.py):
1. test_suite_vacia: target.suite="" → passed=False con code="invalid_target"
2. test_archivo_no_existe: target.path apunta a ruta inexistente → passed=False con code="missing_target"
3. test_expectation_vacia: assertion.expectation="" → passed=False con code="invalid_assertion"

Para PySparkEngine (test_pyspark_engine.py):
1. test_pyspark_no_disponible: mock ImportError → passed=False con code="missing_dependency" y mensaje informativo

Usa pytest-mock o unittest.mock para aislar dependencias externas (SQLAlchemy, PySpark, GE).
```

**Prompt 3:**
```
Los tests adversariales del SSOT Framework (probe_kit.py) deben intentar eludir las validaciones del sistema para verificar su robustez. Esto es la revisión R-17 del propio framework.

Implementa los siguientes probes:

1. probe_placeholder_bypass: crea un archivo con {{NOMBRE_PROYECTO}} literal y verifica que sanidad_pre_sesion.py lo detecta en modo project-instance
2. probe_pii_en_evidencia: escribe un archivo con un RFC válido en fuentes/evidencia/ y verifica que check_pii_evidencia lo reporta
3. probe_transicion_sin_gate: intenta transicionar F0 → F1 sin crear el checkpoint de F0 y verifica que falla con GateError
4. probe_commit_multiples_lotes: simula un mensaje de commit con referencias a LOT-A y LOT-B y verifica que el hook R-26 lo rechaza
5. probe_lfs_archivo_grande_inline: crea un archivo PDF de >25MB sin pointer LFS y verifica que check_lfs_evidencia lo detecta

Cada probe retorna ProbeResult(name, passed, message) donde passed=True significa que el framework detectó correctamente la violación. Un probe fallido (passed=False) indica una brecha de seguridad real.

El script test_probe_kit.py ejecuta todos los probes y falla el test si alguno no detectó la violación esperada.
```

---

## 3. Modelo de Datos

**Prompt 1:**
```
Necesito el DDL completo para la tabla mart.dq_metricas en PostgreSQL que almacene las métricas de calidad de datos continua producidas por el DAG dq_continuo.

Requisitos:
- Esquema: mart (crear con IF NOT EXISTS)
- Tabla: dq_metricas con los campos:
  * id: BIGSERIAL, clave primaria
  * run_id: TEXT NOT NULL — identificador lógico de la corrida (timestamp o run_id de origen)
  * metric_key: TEXT NOT NULL — nombre canónico de la métrica
  * metric_value: DOUBLE PRECISION NOT NULL — valor numérico
  * metric_status: TEXT NOT NULL — estado: ok | warn | failed
  * metric_context: JSONB NOT NULL DEFAULT '{}' — contexto técnico para trazabilidad
  * recorded_at_utc: TIMESTAMPTZ NOT NULL DEFAULT NOW() — timestamp UTC de la ejecución origen
  * created_at_utc: TIMESTAMPTZ NOT NULL DEFAULT NOW() — timestamp UTC de inserción

- COMMENT ON TABLE y COMMENT ON COLUMN para todas las columnas (regla R-05 del framework)
- El DDL debe guardarse en sql/ddl/mart_dq_metricas.sql

Prohibición absoluta del framework: NO usar FLOAT para valores monetarios (aunque aquí es métrica numérica, usar DOUBLE PRECISION es correcto). NO hardcodear nombres de schema en código Python; solo en el DDL y en las migraciones.
```

**Prompt 2:**
```
Necesito la migración Alembic que crea la tabla mart.dq_metricas a partir del DDL ya definido.

El archivo debe ubicarse en: alembic/versions/20260512_0001_create_mart_dq_metricas.py

Requisitos de la migración:
1. revision = "0001" con down_revision = None (es la primera migración)
2. upgrade(): crear esquema mart y tabla dq_metricas con todos sus campos y restricciones
3. downgrade(): eliminar tabla y esquema de forma ordenada (tabla primero, esquema después)
4. La migración debe ser completamente reversible sin pérdida de datos de otras tablas
5. Usar op.execute() para los COMMENT ON que Alembic no gestiona con helpers nativos

Adicionalmente, genera el test unitario test_migration_20260512_0001_create_mart_dq_metricas.py que:
- Usa SQLite en memoria como BD de prueba
- Verifica que upgrade() crea la tabla sin excepción
- Verifica que downgrade() elimina la tabla sin excepción
- Verifica que upgrade() + downgrade() + upgrade() es idempotente
```

**Prompt 3:**
```
Necesito documentar el modelo de datos completo del SSOT Framework en formato Mermaid para incluir en el README.

El diagrama debe mostrar:

1. mart.dq_metricas (PostgreSQL): tabla real con todos sus campos, tipos, restricciones PK y comentarios
2. RnResult (estructura en memoria/JSON): campos rn_id, engine, severity, passed, duration_ms, message, details
3. BDT — Backlog de Deuda Técnica (Markdown): campos bdt_id, scope, origen, severidad, fase_detectada, descripcion, estado, trace_origen, trace_cierre
4. ProyectoEstado (Markdown): campos fase_actual, lot_abierto, itr_vigente, updated_at

Relaciones a mostrar:
- mart.dq_metricas persiste resultados de RnResult (1 a muchos)
- ProyectoEstado acumula BDT durante su ciclo de vida

Usa la sintaxis completa de Mermaid erDiagram con tipos de dato, PK/FK explícitos y etiquetas en las relaciones. Añade una tabla descriptiva por entidad con todos sus campos, tipos, restricciones y descripción breve.
```

---

## 4. Especificación de la API

**Prompt 1:**
```
El motor de estado del SSOT Framework expone una interfaz CLI que funciona como API de línea de comandos. Documenta el endpoint de transición de fase (transicionar.py) en formato equivalente a OpenAPI.

Documenta:
1. Descripción del comando y su propósito
2. Todos los parámetros con nombre, tipo, si es requerido y descripción
3. Validaciones que se ejecutan antes de aplicar el cambio (gates de archivos, gates R-17)
4. Códigos de salida: 0 (éxito), 1 (gate fallido o argumento inválido)
5. Ejemplos de invocación con respuesta esperada (stdout) para:
   - Transición válida con gate cumplido
   - Transición fallida por gate de archivo faltante
   - Transición a fase R-17 sin --confirm-model
   - Dry-run exitoso

Incluye también el contrato de efectos secundarios: qué archivos modifica, qué no toca y bajo qué condiciones.
```

**Prompt 2:**
```
Documenta la CLI del runner de reglas de negocio (runner_rn.py) como si fuera un endpoint REST, con el formato YAML de OpenAPI 3.0.

El "endpoint" recibe:
- --rules: ruta a archivo YAML con estructura {rules: [{id, description, engine, severity, target, assertion}]}
- --output: ruta de salida para el reporte JSON (opcional, default stdout)
- --engine: filtrar por motor (pyspark | sql | ge | all)

Documenta:
1. El schema del archivo de entrada (rules.yaml) con todos los campos y sus tipos
2. El schema de la respuesta JSON: run_id, total, passed, failed, results[]
3. El schema de cada elemento en results[]: rn_id, engine, severity, passed, duration_ms, message, details
4. Los errores posibles y sus códigos de salida

Añade un ejemplo completo de rules.yaml con una regla de cada engine y el JSON de respuesta esperado para ese ejemplo.
```

**Prompt 3:**
```
Documenta la CLI de sanidad_pre_sesion.py como API con soporte para salida JSON.

Actualmente el script emite texto plano legible. Necesito:
1. Documentar la interfaz actual (--mode, --repo, flags existentes)
2. Especificar el nuevo flag --json que debe emitir un JSON estructurado con:
   - mode: string ("template" | "project-instance")
   - fase_actual: string (fase activa del proyecto)
   - summary: objeto con contadores {ok: int, warn: int, error: int}
   - checks: array de {id: string, status: string, message: string}
3. Documentar que el exit code no cambia con --json: 0=OK, 1=WARN, 2=ERROR
4. Mostrar un ejemplo de salida JSON completo con al menos 5 checks reales del script

Esta documentación servirá para que otros scripts (como el hook de CI/CD) puedan parsear el resultado de sanidad programáticamente.
```

---

## 5. Historias de Usuario

**Prompt 1:**
```
Soy product owner del SSOT Framework. Necesito definir historias de usuario para las 3 funcionalidades más críticas del sistema.

Para cada historia usa el formato:
"Como [rol], quiero [acción], para [beneficio]"

Y añade:
- Criterios de aceptación en formato Dado/Cuando/Entonces (mínimo 3 por historia)
- Estimación de complejidad (S/M/L/XL)
- Dependencias con otras historias
- Escenarios de error que deben manejarse

Las funcionalidades a cubrir:
1. Inicialización del proyecto (copiar framework, configurar placeholders, activar hooks)
2. Cierre binario de lote (el agente pregunta sí/no, solo sí avanza el lote)
3. Calidad de datos continua (definir reglas RN-* en YAML, ejecutar automáticamente en Airflow, ver resultados en mart.dq_metricas)

El lenguaje de las historias debe ser accesible para stakeholders no técnicos pero con criterios de aceptación técnicamente verificables.
```

**Prompt 2:**
```
Revisa estas historias de usuario del SSOT Framework y mejóralas aplicando las mejores prácticas de producto:

Historia 1 (borrador): "El usuario puede configurar el proyecto"
Historia 2 (borrador): "El agente pide confirmación antes de cerrar"
Historia 3 (borrador): "Se pueden ejecutar validaciones de calidad"

Para cada historia:
1. Reescríbela con el rol correcto (no "usuario" genérico — ¿es un arquitecto? ¿un data engineer? ¿un manager?)
2. Asegúrate de que el "para" expresa valor de negocio, no una funcionalidad técnica
3. Convierte los criterios de aceptación a formato BDD (Dado/Cuando/Entonces) verificable automáticamente
4. Identifica qué criterio es el más crítico (el que si falla, la historia falla entera)
5. Añade un escenario de usuario avanzado ("extensión") para cada historia

Justifica cada cambio que hagas en relación con las buenas prácticas de producto.
```

**Prompt 3:**
```
El SSOT Framework necesita una historia de usuario para el flujo de retoma de sesión entre días de trabajo.

Contexto: un data engineer trabaja en el proyecto el lunes, cierra la sesión con el protocolo correcto, y el martes necesita retomar exactamente donde lo dejó sin perder contexto.

Crea la historia completa con:
1. Roles involucrados: data engineer (usuario) + agente de IA (sistema)
2. Precondiciones: qué debe existir en el repo para que la retoma sea posible
3. Flujo principal: los pasos exactos desde que el usuario abre el IDE hasta que está trabajando de nuevo
4. Flujo alternativo 1: qué pasa si el lote anterior no se cerró correctamente (sin "sí" de confirmación)
5. Flujo alternativo 2: qué pasa si han pasado más de 7 días (umbral de loop del framework)
6. Criterios de aceptación técnicos: qué comprueba sanidad_pre_sesion.py para validar que la retoma es posible

Esta historia es clave porque justifica por qué el estado vive en Markdown versionado y no en memoria del agente.
```

---

## 6. Tickets de Trabajo

**Prompt 1:**
```
Crea un ticket de trabajo técnico completo para implementar el gate R-17 como validación ejecutable en el motor de estado del SSOT Framework.

El ticket debe incluir:
1. Título descriptivo y tipo (backend / motor de estado)
2. Contexto: por qué existe esta tarea y qué problema resuelve
3. Descripción técnica detallada de la implementación requerida:
   - Añadir conjunto R17_TRANSITIONS en estado_proyecto.py con las transiciones que requieren revisión cross-proveedor
   - Implementar _validate_r17_model(confirm_model, repo_root) que verifica que el modelo pertenece a un proveedor diferente al dominante
   - Añadir --confirm-model al CLI de transicionar.py
   - Bloquear la transición con GateError si no se pasa el argumento o si el proveedor coincide
4. Criterios de aceptación verificables (con ejemplos de comandos)
5. Referencias a archivos afectados
6. Estimación y dependencias
7. Definición de Done: qué debe estar verde para considerar el ticket cerrado

Sigue el formato de ticket que usaría un equipo de ingeniería de plataforma con buenas prácticas.
```

**Prompt 2:**
```
Crea un ticket de trabajo para añadir el flag --json a sanidad_pre_sesion.py del SSOT Framework.

Este es un ticket de mejora de interfaz (frontend/CLI). El script actualmente emite solo texto plano; necesitamos salida JSON para integración con dashboards de CI/CD.

El ticket debe incluir:
1. User story de origen (quién lo pide y por qué)
2. Especificación técnica de la salida JSON esperada con schema completo
3. Regla de retrocompatibilidad: la salida de texto existente NO debe cambiar
4. Casos edge: ¿qué pasa si un check falla con excepción? ¿se incluye en el JSON con status "error"?
5. Tests requeridos:
   - test_json_output_parseable: json.loads() no lanza excepción
   - test_json_campos_requeridos: mode, fase_actual, summary, checks presentes
   - test_retrocompatibilidad: sin --json, stdout es texto plano como antes
6. Cómo verificar que la implementación está completa

Nivel de detalle: suficiente para que un ingeniero que no conozca el proyecto pueda implementarlo sin preguntas adicionales.
```

**Prompt 3:**
```
Crea un ticket de base de datos para añadir un índice compuesto en mart.dq_metricas que optimice las consultas de dashboards de calidad de datos.

Contexto: las consultas de monitoreo filtran habitualmente por metric_key + metric_status + recorded_at_utc en rangos de tiempo decrecientes. Sin índice, los full scans crecen linealmente con los registros del DAG diario.

El ticket debe incluir:
1. Análisis del problema: query de ejemplo que se beneficia del índice y su plan EXPLAIN actual (hipotético)
2. Solución propuesta: índice compuesto con CONCURRENTLY para no bloquear producción
3. DDL exacto de la migración Alembic (upgrade y downgrade)
4. Consideraciones de producción:
   - Usar CREATE INDEX CONCURRENTLY para evitar lock exclusivo en tabla activa
   - El downgrade debe usar DROP INDEX IF EXISTS (no DROP INDEX a secas)
5. Cómo validar que el índice se creó y está siendo usado (EXPLAIN ANALYZE ejemplo)
6. Script de validación: validar_migraciones_reversibles.py debe pasar sobre la nueva migración
7. Tests unitarios requeridos con SQLite en memoria

Incluye la estimación de tiempo de creación del índice para una tabla con 1M de filas como referencia.
```

---

## 7. Pull Requests

**Prompt 1:**
```
Necesito escribir la descripción completa de un Pull Request para la implementación del gate R-17 en el motor de estado del SSOT Framework.

La PR debe documentar:
1. Título en formato convencional (feat/fix/refactor + scope + descripción)
2. Contexto: qué problema existía antes de esta PR y por qué era un riesgo
3. Cambios incluidos: lista de archivos modificados con descripción de qué cambia en cada uno
4. Cómo probar localmente: comandos exactos para verificar el comportamiento
5. Checklist de revisión:
   - [ ] Tests unitarios pasan
   - [ ] Sin regresiones en tests existentes
   - [ ] Revisión adversarial R-17 completada con modelo cross-proveedor
   - [ ] Decisión registrada en decisions-log.md con DEC-ID
6. Impacto en usuarios del framework: ¿alguien que use el CLI nota el cambio?
7. Referencia al lote y la iteración que originó esta PR

Usa un tono técnico pero directo, como lo haría un equipo de plataforma con buenas prácticas de revisión de código.
```

**Prompt 2:**
```
Genera la descripción de Pull Request para la implementación del runner híbrido de reglas de negocio (runner_rn.py) con sus tres engines.

Esta es la PR más grande de la iteración ITR-20260511-03 y necesita comunicar claramente:

1. El valor de negocio: antes no había forma de ejecutar reglas RN-* automáticamente; esta PR lo habilita end-to-end
2. Las decisiones de diseño tomadas:
   - Por qué tres engines separados en lugar de uno genérico
   - Por qué el resultado es siempre RnResult normalizado independientemente del engine
   - Por qué el DAG Airflow tiene fallback de importación sin mutación de sys.path
3. Lo que NO está incluido en esta PR (diferido para la siguiente iteración):
   - Integración con Slack/PagerDuty para alertas
   - Dashboard visual de métricas
4. Riesgos identificados durante la implementación y cómo se mitigaron
5. Checklist de revisión específica para una PR de infraestructura de datos

El revisor R-17 para esta PR fue Claude (modelo Anthropic) revisando código generado con Codex (OpenAI). Incluye una línea confirmando esto.
```

**Prompt 3:**
```
Genera la descripción de Pull Request para la corrección del detector PII que no procesaba archivos DOCX correctamente y que añade la categoría CLABE bancaria.

Esta es una PR de fix + feature combinados. La descripción debe:

1. Separar claramente el fix (bug en DOCX) del feature (nueva categoría CLABE):
   - Bug: el encoding UTF-8 en python-docx no se especificaba, causando falsos negativos en documentos con caracteres especiales
   - Feature: regex CLABE con validación de dígito verificador mediante módulo 97

2. Incluir el before/after del comportamiento:
   - Antes: DOCX con RFC en el cuerpo → no detectado (falso negativo)
   - Después: DOCX con RFC en el cuerpo → detectado correctamente con categoría "rfc"
   - Nuevo: CLABE 032180000118359719 → detectado como "clabe" (válido)
   - Nuevo: CLABE 032180000118359718 → no detectado (dígito verificador inválido)

3. Impacto en usuarios que tienen archivos en pii_allowlist.yaml: ¿necesitan actualizar algo?

4. Tests de regresión añadidos y por qué cubren los casos que fallaban

5. Enlace a la especificación oficial de CLABE (Banco de México) como evidencia de la implementación del dígito verificador

La decisión DEC-20260520-012 registra esta categoría como canónica para PII mexicana.
```
