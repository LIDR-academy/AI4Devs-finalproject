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

Marcos Ernesto Campos Ramire<>

### **0.2. Nombre del proyecto:**

SSOT Framework

### **0.3. Descripción breve del proyecto:**

Marco reutilizable para diseñar e implementar proyectos de **Single Source of Truth (SSOT)** con asistencia de agentes de IA (Cursor, Claude Code, GPT Codex). Actúa simultáneamente como plantilla de proyecto y como cerebro operativo: reglas, agentes, skills y workflows viven bajo `.ai/`. El framework guía el trabajo por fases con gate checks automáticos, trazabilidad completa de decisiones y calidad de datos continua.

### **0.4. URL del proyecto:**

No aplica

### **0.5. URL o archivo comprimido del repositorio**

Se proporcionara en la entrega final
---

## 1. Descripción general del producto

### **1.1. Objetivo:**

El SSOT Framework resuelve un problema recurrente en proyectos de datos asistidos por IA: la pérdida de contexto entre sesiones de trabajo, la falta de trazabilidad en decisiones de diseño y la tendencia a generar código antes de que la arquitectura y los requisitos estén aprobados.

Su propósito es proporcionar a equipos de datos, arquitectos e ingenieros un marco estructurado que garantice que:

- El diseño y la gobernanza **siempre preceden** a la generación de código.
- Cada decisión queda **trazada** con un identificador único vinculado al lote que la originó.
- El estado del proyecto **persiste entre sesiones** en archivos Markdown versionados con Git.
- Los agentes de IA **ejecutan**, pero el humano **aprueba** con cierre binario explícito (`sí/no`).

### **1.2. Características y funcionalidades principales:**

**Motor de estado por fases**
Sistema ejecutable (`scripts/motor/estado_proyecto.py`) que modela el ciclo de vida del proyecto en 15 fases (0 → 7) con un grafo de transiciones válidas. Cada transición requiere la existencia de artefactos gate antes de avanzar. El CLI `transicionar.py` permite avanzar, simular (`--dry-run`) o forzar (`--force`) transiciones.

**Sistema de agentes especializados (19 agentes)**
Agentes por fase (fuentes, modelo, DDL, blueprint, gobernanza, codegen, documentador) más agentes transversales (orquestador, sesión, revisor, archivador, corrector de deuda). Cada agente tiene instrucciones y skills definidos bajo `.ai/`.

**Validaciones automáticas**
Suite de ~25 scripts de validación en `scripts/utilidades/` que comprueban integridad estructural, trazabilidad de reglas de negocio, consistencia entre artefactos, detección de contradicciones, idioma de comentarios y referencias rotas. El script principal `sanidad_pre_sesion.py` (~80 KB) ejecuta un chequeo completo antes de cada sesión.

**Calidad de datos continua**
Runner híbrido (`scripts/calidad/runner_rn.py`) que ejecuta reglas de negocio (`RN-*`) sobre tres motores: **Great Expectations**, **SQL puro** y **PySpark**. Los resultados se persisten en `mart.dq_metricas` en PostgreSQL, orquestados por un DAG de Airflow.

**Gobernanza PII**
Detección determinística de datos personales mexicanos en 10 categorías (RFC, CURP, CLABE, NSS, INE, tarjeta, teléfono, email, fecha de nacimiento). Incluye política LFS para archivos de evidencia, allowlist por sha256 y validación pre-commit.

**Revisión adversarial cross-proveedor (R-17)**
Regla que obliga a que el revisor de código sea de un proveedor de IA diferente al generador. Configuración por modelo en `project.config.yaml`.

**Trazabilidad completa DEC ↔ LOT ↔ ITR**
Cada decisión de diseño tiene un `DEC-YYYYMMDD-XXX` vinculado al lote (`LOT`) que la originó y a la iteración (`ITR`) contenedora. Permite auditar cualquier cambio en ambas direcciones.

**Presupuesto y observabilidad de tokens IA**
Umbrales configurables por iteración y lote con alertas `WARN`/`ERROR`. El script `estimacion_tokens_fase.py` proyecta el costo antes de ejecutar una fase.

### **1.3. Diseño y experiencia de usuario:**

El framework no tiene interfaz gráfica propia — opera desde el IDE (Cursor) o la terminal. El flujo típico de usuario es:

1. **Copiar y configurar:** el usuario edita `project.config.yaml` con los datos de su proyecto (nombre, stack, modelos de IA, presupuesto de tokens) y ejecuta `inicializar_proyecto.py` que sustituye todos los `{{PLACEHOLDER}}` en el repo.
2. **Arrancar sesión:** el agente `agente-sesion` ejecuta `sanidad_pre_sesion.py`, reporta el estado actual y propone el próximo lote de trabajo.
3. **Trabajar por fases:** el orquestador guía al agente por las fases secuenciales; cada transición valida los gates automáticamente.
4. **Aprobar y cerrar:** al final de cada lote, el agente pregunta `¿Confirmo cierre del LOTE X? (sí/no)`. Solo con `sí` explícito el lote avanza a _Hecho_.
5. **Retomar sesiones:** el estado persiste en `proyecto-estado.md`; la próxima sesión arranca exactamente donde se dejó.

### **1.4. Instrucciones de instalación:**

**Requisitos previos:**
- Python 3.11+
- Git
- Editor con soporte de agentes (Cursor recomendado) o Claude Code / Codex CLI

**Paso 1 — Clonar o copiar el framework:**
```bash
cp -r ssot-framework/ mi-proyecto/
cd mi-proyecto/
git init
```

**Paso 2 — Crear el entorno virtual e instalar dependencias:**
```bash
python3 -m venv .venv
source .venv/bin/activate          # Linux/macOS
# .venv\Scripts\activate           # Windows
pip install -r requirements.txt
```

Las dependencias principales son:
| Paquete | Versión mínima | Propósito |
|---------|---------------|-----------|
| `pytest` | 7.4 | Suite de tests |
| `pytest-cov` | 4.1 | Cobertura de tests |
| `ruff` | 0.4 | Linting y formateo |
| `pyyaml` | 6.0 | Parseo de YAML |
| `pyspark` | 3.5 | Procesamiento distribuido |
| `pandas` | 2.2 | Análisis de datos |
| `great_expectations` | 0.18 | Calidad de datos |
| `sqlalchemy` | 2.0 | ORM y conexiones BD |
| `pdfplumber` | latest | Extracción PII de PDFs |
| `python-docx` | latest | Extracción PII de DOCX |
| `openpyxl` | latest | Extracción PII de XLSX |

**Paso 3 — Configurar el proyecto:**
```bash
# Editar con los datos reales del proyecto
nano project.config.yaml
# Cambiar FRAMEWORK_MODE: "template" → "project-instance"
# Completar: NOMBRE_PROYECTO, MOTOR_BD, STACK, IDIOMA_NEGOCIO, etc.
```

**Paso 4 — Inicializar placeholders:**
```bash
python3 scripts/setup/inicializar_proyecto.py
# Verificar que no queden {{ sueltos:
grep -r "{{" . --include="*.md" --include="*.py" --include="*.yaml" | grep -v ".venv"
```

**Paso 5 — Activar hooks Git:**
```bash
git config core.hooksPath .githooks
```

**Paso 6 — Configurar base de datos (opcional, para calidad continua):**
```bash
# Copiar variables de entorno
cp .env.example .env
# Editar .env con la URL de PostgreSQL:
# DQ_METRICAS_DATABASE_URL=postgresql://user:pass@localhost:5432/ssot_db

# Ejecutar migración inicial
alembic upgrade head
```

**Ejecutar tests para verificar la instalación:**
```bash
pytest tests/unit/ -v
pytest tests/integration/ -v
```

**Sincronizar modelos de IA (opcional):**
```bash
# Solo validar disponibilidad
python3 scripts/setup/sincronizar_modelos_api.py --validate-only
```

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

```
┌─────────────────────────────────────────────────────────────────┐
│                        SSOT FRAMEWORK                           │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │  IDE / CLI   │───▶│   Agentes    │───▶│  Motor de Estado │  │
│  │ (Cursor /    │    │   (.ai/)     │    │  (scripts/motor) │  │
│  │  Claude Code)│    │  19 agentes  │    │  estado_proyecto │  │
│  └──────────────┘    └──────┬───────┘    └────────┬─────────┘  │
│                             │                     │             │
│                    ┌────────▼────────┐            │             │
│                    │  Validadores    │            │             │
│                    │ (scripts/util.) │   Fases 0→7│             │
│                    │  sanidad,       │   con gates│             │
│                    │  trazabilidad,  │            │             │
│                    │  PII, LFS...    │            │             │
│                    └────────┬────────┘            │             │
│                             │                     │             │
│         ┌───────────────────┼─────────────────────┘             │
│         │                   │                                   │
│  ┌──────▼──────┐   ┌────────▼────────┐   ┌──────────────────┐  │
│  │  Git / LFS  │   │  Calidad Datos  │   │  PostgreSQL      │  │
│  │  (evidencia │   │  runner_rn.py   │   │  mart.dq_metricas│  │
│  │   PII-safe) │   │  GE + SQL +     │   │  Alembic         │  │
│  └─────────────┘   │  PySpark        │   └──────────────────┘  │
│                    └────────┬────────┘                          │
│                             │                                   │
│                    ┌────────▼────────┐                          │
│                    │  Airflow DAGs   │                          │
│                    │  dq_continuo    │                          │
│                    │  gc_parquet     │                          │
│                    │  gc_snapshots   │                          │
│                    └─────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

**Patrón arquitectónico:** El framework sigue una arquitectura de **pipeline por fases con gates** (similar a un pipeline CI/CD pero para proyectos de datos), combinada con el patrón **Markdown-as-State** donde el estado del sistema vive en archivos de texto versionados.

**Justificación:**
- Markdown como estado permite auditoría humana sin tooling adicional y `git diff` comprensible.
- Las fases con gates evitan el anti-patrón de "codegen primero, diseño después".
- El dispatcher híbrido de calidad (GE + SQL + PySpark) permite escalar desde proyectos pequeños a distribuidos sin cambiar la interfaz de reglas.

**Compromisos del diseño:**
- El parseo de Markdown es más frágil que YAML; se mitiga con errores explícitos en los validadores.
- Requiere disciplina del equipo para mantener la trazabilidad DEC/LOT/ITR actualizada.

### **2.2. Descripción de componentes principales:**

| Componente | Tecnología | Descripción |
|------------|-----------|-------------|
| **Motor de estado** | Python 3.11 | Grafo de fases con transiciones válidas, gates de archivos y gates R-17. Persiste estado en `proyecto-estado.md` con file-locking para concurrencia segura. |
| **Agentes** | Markdown + reglas | 19 definiciones de agentes especializados con instrucciones en `.ai/agents/`. Operan desde el IDE o CLI de IA. |
| **Runner de calidad** | Python + YAML | Dispatcher que ejecuta reglas `RN-*` en tres motores: Great Expectations (expectativas declarativas), SQL puro (validaciones en BD) y PySpark (escala distribuida). |
| **Validadores** | Python 3.11 | Suite de ~25 scripts para sanidad, trazabilidad, PII, LFS, contradicciones y referencias. El principal (`sanidad_pre_sesion.py`) se ejecuta al inicio de cada sesión. |
| **DAGs Airflow** | Apache Airflow | Tres DAGs: calidad continua (`dq_continuo`), gestión de versiones Parquet (`gc_versions_parquet`) y snapshots PostgreSQL (`gc_snapshots_postgres`). Siguen arquitectura medallón bronce/plata/oro. |
| **Base de datos** | PostgreSQL + Alembic | Esquema `mart` con tabla `dq_metricas` para persistir resultados de calidad. Migraciones versionadas con Alembic. |
| **Detector PII** | Python + regex | Motor determinístico para 10 categorías de PII mexicana con checksums oficiales y heurística de contexto ±20 caracteres. |
| **Hooks pre-commit** | Python + bash | Validaciones automáticas en cada commit: marcadores de conflicto, archivos `.env`, idioma de comentarios y un lote por commit (R-26). |

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

```
ssot-framework/
│
├── .ai/                        # Cerebro operativo del framework
│   ├── agents/                 # 19 definiciones de agentes (.md)
│   ├── rules/                  # Reglas globales R-XX
│   ├── skills/                 # 26 skills por fase o transversal
│   ├── workflows/              # 6 flujos de trabajo documentados
│   ├── estado/                 # Estado del proyecto
│   │   ├── proyecto-estado.md  # ← fuente canónica de fase actual
│   │   ├── fases/              # 15 checkpoints por fase
│   │   └── particiones/        # Estado por agente en paralelo
│   ├── context/                # Contexto de negocio, inventario fuentes
│   ├── evolucion/              # Lecciones aprendidas y controles vigentes
│   └── historico/              # Archivado de gobernanza (R-22)
│
├── scripts/
│   ├── motor/                  # Motor de estado ejecutable
│   │   ├── estado_proyecto.py  # Grafo de fases, gates, transiciones
│   │   └── transicionar.py     # CLI de transición de fases
│   ├── utilidades/             # ~25 validadores y utilidades
│   ├── calidad/                # Runner de reglas de negocio
│   │   ├── engines/            # GE, SQL y PySpark engines
│   │   ├── runner_rn.py        # Dispatcher híbrido
│   │   └── dq_continuo.py      # Orquestador calidad continua
│   ├── setup/                  # Inicialización del proyecto
│   ├── despliegue/             # Empaquetado y rollback
│   ├── hooks/                  # Hooks pre-commit
│   └── perfilado/              # Perfilado con PySpark
│
├── dags/                       # DAGs Apache Airflow
│   ├── bronce/                 # Ingesta raw
│   ├── plata/                  # Transformación
│   ├── oro/                    # Serving / agregados
│   ├── dq_continuo.py          # DAG calidad continua
│   ├── gc_versions_parquet.py  # DAG GC versiones Parquet
│   └── gc_snapshots_postgres.py # DAG snapshots PostgreSQL
│
├── sql/
│   └── ddl/                    # DDL por capa (bronce/plata/oro/control)
│       └── mart_dq_metricas.sql
│
├── alembic/                    # Migraciones de base de datos
│   └── versions/               # Versiones de migración numeradas
│
├── tests/
│   ├── unit/                   # ~50 tests unitarios
│   ├── integration/            # Smoke tests de onboarding
│   ├── adversarial/            # Probe kit R-17
│   └── fixtures/               # Datos de prueba (CSV)
│
├── docs/
│   ├── framework/prompts/      # 11 prompts reutilizables
│   ├── requisitos/             # BRDs, catálogo de reglas de negocio
│   └── gobernanza/             # PII, LFS, ADRs, runbooks
│
├── project.config.yaml         # ← único archivo que el humano edita
├── requirements.txt
├── alembic.ini
└── README.md
```

La estructura sigue el patrón **separación por responsabilidad**: el código de infraestructura operativa (`.ai/`), el código ejecutable (`scripts/`), los artefactos de datos (`sql/`, `dags/`), la documentación (`docs/`) y los tests (`tests/`) tienen carpetas raíz independientes.

### **2.4. Infraestructura y despliegue**

```
┌─────────────────────────────────────────────────────┐
│                ENTORNO LOCAL / CI                   │
│                                                     │
│  git push ──▶ hooks pre-commit                      │
│               (conflictos, .env, idioma, R-26)      │
│                      │                              │
│                       ▼                             │
│              pytest tests/unit/                     │
│              pytest tests/integration/              │
│                      │                              │
│                       ▼                             │
│           scripts/despliegue/preparar_entregable.py │
│           → dist/implementacion/                    │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              ENTORNO DE PRODUCCIÓN                  │
│                                                     │
│  alembic upgrade head  (migración BD)               │
│         │                                           │
│          ▼                                          │
│  PostgreSQL                                         │
│  └── mart.dq_metricas                               │
│                                                     │
│  Airflow                                            │
│  ├── DAG dq_continuo      (calidad continua)        │
│  ├── DAG gc_versions_parquet (GC Parquet)           │
│  └── DAG gc_snapshots_postgres (backups)            │
└─────────────────────────────────────────────────────┘
```

**Proceso de despliegue:**
1. `preparar_entregable.py` valida la presencia de todos los directorios canónicos (`scripts/`, `sql/`, `pipelines/`, `dags/`, `docs/`, `config/`) y empaqueta el contenido en `dist/implementacion/`.
2. Las migraciones de base de datos se aplican con `alembic upgrade head`. Las migraciones son reversibles (`downgrade`) por diseño y se validan automáticamente con `validar_migraciones_reversibles.py`.
3. Los DAGs se despliegan copiando la carpeta `dags/` al servidor Airflow.
4. Los snapshots de PostgreSQL se retienen 14 días (`RETENCION_SNAPSHOTS_POSTGRES_DIAS`).

### **2.5. Seguridad**

**No se hardcodean credenciales en ningún archivo versionado.** La URL de base de datos se inyecta exclusivamente desde variables de entorno (`DQ_METRICAS_DATABASE_URL`, `ALEMBIC_DATABASE_URL`).

**Detección de secretos en pre-commit:** el hook `pre_commit_checks.py` bloquea commits que contengan archivos `.env` (excepto `.env.example`).

**Gobernanza PII:**
- El detector `_pii_detector.py` analiza archivos de evidencia con regex determinístico para 10 categorías de PII mexicana (RFC, CURP, CLABE bancaria, NSS, INE, tarjeta, teléfono, email, fecha de nacimiento).
- Los archivos con PII confirmada se registran en `pii_allowlist.yaml` con hash sha256 y requieren aprobación explícita.
- En modo `project-instance`, la detección de PII no-allowlisteada es un **ERROR** que bloquea el commit.

**Política Git LFS diferenciada:**
- Siempre-LFS: `pdf`, `docx`, `xlsx`, `pptx`, `msg`, `eml`, `parquet`, `orc`.
- LFS on-demand: `json`, `sql` (según tamaño).
- Umbrales instrumentados: 25 MB por archivo, 2 GB acumulado.
- El check `check_lfs_evidencia` bloquea commits que violen la política.

**Regla R-17 (revisión cross-proveedor):** todo código generado por un modelo de OpenAI debe ser revisado por un modelo de Anthropic y viceversa, eliminando puntos ciegos sistémicos de un solo proveedor.

**Cierre binario obligatorio:** ningún lote de trabajo avanza a _Hecho_ sin una confirmación `sí` explícita del humano en el chat, evitando que los agentes declaren avance no aprobado.

### **2.6. Tests**

El framework incluye ~50 tests unitarios, tests de integración y tests adversariales.

**Tests del motor de estado (`test_estado_proyecto.py` — 27 KB):**
Valida el grafo de transiciones, la aplicación correcta de gates, el comportamiento ante fases desconocidas, el file-locking concurrente y la persistencia en `proyecto-estado.md`.

```python
# Ejemplo: transición inválida debe lanzar excepción
def test_transicion_invalida_lanza_error():
    with pytest.raises(ValueError, match="transición no permitida"):
        transicionar(Fase.F7, Fase.F0, repo_root=tmp_path)
```

**Tests de validadores (`test_validar_marco_ssot.py` — 82 KB):**
Cobertura de los ~30 checks del validador principal, incluyendo detección de placeholders, trazabilidad DEC/LOT, estructura de backlog y gates de calidad continua.

**Tests de hooks (`test_pre_commit_checks.py`, `test_cost_guard_hook.py`, `test_context_guard_hook.py`):**
Verifican que los hooks bloquean correctamente commits con conflictos de merge, archivos `.env`, PII y excesos de presupuesto de tokens.

**Tests de calidad de datos (`test_dq_continuo.py`, `test_runner_rn.py`):**
Prueban el dispatcher de engines con reglas mock en los tres motores (GE, SQL, PySpark), incluyendo casos de error y resultados parciales.

**Tests adversariales (`tests/adversarial/probe_kit.py`):**
Suite de caja negra que intenta eludir las validaciones del framework para verificar su robustez, usada como revisión R-17 del propio marco.

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

```mermaid
erDiagram
    MART_DQ_METRICAS {
        bigint id PK "Autoincremental, clave primaria"
        text run_id FK "Identificador lógico de corrida"
        text metric_key "Nombre canónico de la métrica"
        double_precision metric_value "Valor numérico de la métrica"
        text metric_status "Estado: ok | warn | failed"
        jsonb metric_context "Contexto técnico serializado"
        timestamptz recorded_at_utc "Timestamp UTC de la ejecución origen"
        timestamptz created_at_utc "Timestamp UTC de inserción"
    }

    RN_ASSERTION_RESULT {
        text rn_id PK "Identificador de la regla RN-*"
        text engine "Motor: pyspark | sql | ge"
        text severity "Severidad: blocking | warning | info"
        boolean passed "Resultado de la validación"
        int duration_ms "Duración en milisegundos"
        text message "Mensaje descriptivo del resultado"
        jsonb details "Detalles técnicos del resultado"
    }

    PROYECTO_ESTADO {
        text fase_actual PK "Fase activa del proyecto (0-7)"
        text lot_abierto "LOT-ID del lote en curso o null"
        text itr_vigente "ITR-ID de la iteración activa"
        timestamptz updated_at "Última actualización"
    }

    BACKLOG_DEUDA_TECNICA {
        text bdt_id PK "Identificador BDT-YYYYMMDD-XXX"
        text scope "Alcance del ítem de deuda"
        text origen "Origen que lo generó"
        text severidad "BLOQUEANTE | CRÍTICO | ADVERTENCIA"
        text fase_detectada "Fase en que se detectó"
        text descripcion "Descripción del ítem"
        text estado "pendiente | en_correccion | cerrado"
        text trace_origen "LOT-ID o ITR-ID de origen"
        text trace_cierre "LOT-ID de cierre (si aplica)"
    }

    MART_DQ_METRICAS ||--o{ RN_ASSERTION_RESULT : "persiste resultados de"
    PROYECTO_ESTADO ||--o{ BACKLOG_DEUDA_TECNICA : "acumula durante"
```

### **3.2. Descripción de entidades principales:**

#### `mart.dq_metricas` (PostgreSQL)
Tabla central de métricas de calidad de datos continua. Producida por el DAG `dq_continuo` y consultable para dashboards y alertas.

| Columna | Tipo | Restricciones | Descripción |
|---------|------|--------------|-------------|
| `id` | `BIGSERIAL` | PK, NOT NULL | Identificador técnico autoincremental |
| `run_id` | `TEXT` | NOT NULL | Identificador lógico de corrida (timestamp o ID de origen) |
| `metric_key` | `TEXT` | NOT NULL | Nombre canónico de la métrica calculada |
| `metric_value` | `DOUBLE PRECISION` | NOT NULL | Valor numérico de la métrica |
| `metric_status` | `TEXT` | NOT NULL | Estado operativo: `ok`, `warn`, `failed` |
| `metric_context` | `JSONB` | NOT NULL, DEFAULT `'{}'` | Contexto técnico para trazabilidad |
| `recorded_at_utc` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `NOW()` | Timestamp de la ejecución origen |
| `created_at_utc` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `NOW()` | Timestamp de inserción en tabla |

#### `RnResult` (en memoria / JSON)
Estructura de resultado normalizado del runner de reglas de negocio. Se serializa a JSON para persistencia y evidencia de gates.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `rn_id` | `str` | Identificador único de la regla (ej. `RN-001`) |
| `engine` | `str` | Motor usado: `pyspark`, `sql` o `ge` |
| `severity` | `str` | Severidad: `blocking`, `warning`, `info` |
| `passed` | `bool` | `True` si la regla pasó, `False` si falló |
| `duration_ms` | `int` | Tiempo de ejecución en milisegundos |
| `message` | `str` | Mensaje descriptivo del resultado |
| `details` | `dict` | Detalles técnicos adicionales del resultado |

#### `BDT` (Backlog de Deuda Técnica — Markdown)
Estructura canónica de cada ítem del backlog de deuda técnica en `.ai/estado/backlog-deuda-tecnica.md`.

| Campo | Descripción |
|-------|-------------|
| `bdt_id` | Identificador `BDT-YYYYMMDD-XXX` |
| `scope` | Alcance del ítem (proceso / documentacion / tooling) |
| `origen` | Qué generó el ítem (agente, fase, revisión) |
| `severidad` | `BLOQUEANTE`, `CRÍTICO` o `ADVERTENCIA` |
| `fase_detectada` | Fase del framework en que se detectó |
| `descripcion` | Descripción técnica del problema |
| `estado` | `pendiente`, `en_correccion` o `cerrado` |
| `trace_origen` | `LOT-ID` o `ITR-ID` que lo originó |
| `trace_cierre` | `LOT-ID` de cierre (cuando aplique) |

---

## 4. Especificación de la API

El framework no expone una API HTTP convencional; su interfaz de programación es la **CLI del motor de estado** y el **runner de reglas de negocio**. A continuación se documentan los tres puntos de entrada principales en formato equivalente a OpenAPI.

---

### **Endpoint 1: Transición de fase**

```yaml
# CLI: scripts/motor/transicionar.py
operationId: transicionar_fase
summary: Ejecuta una transición de fase en el motor de estado
parameters:
  - name: --a
    in: cli_arg
    required: true
    schema:
      type: string
      enum: ["0", "0.5", "1", "2", "3A", "3B", "3C", "4", "4.5", "4.6", "5", "5.3", "5.5", "6", "7", "consolidacion"]
    description: Fase destino de la transición
  - name: --dry-run
    in: cli_flag
    required: false
    description: Simular la transición sin escribir cambios
  - name: --force
    in: cli_flag
    required: false
    description: Forzar transición ignorando gates
  - name: --confirm-model
    in: cli_arg
    required: false
    description: Confirmación de modelo para gates R-17 (requerido en fases 4.6 y 5.3)
```

**Ejemplo de invocación:**
```bash
python3 scripts/motor/transicionar.py --a 3A
```

**Respuesta exitosa (stdout):**
```
Fase actual: 2 — Modelo semántico
✓ Gate verificado: .ai/estado/fases/fase-2-modelo.md existe
✓ Transición aplicada: 2 → 3A
Fase actual: 3A — DDL físico
```

**Respuesta con gate fallido:**
```
Fase actual: 2 — Modelo semántico
✗ Gate fallido: .ai/estado/fases/fase-2-modelo.md no encontrado
ERROR: no se puede transicionar a 3A hasta completar los gates requeridos
Exit code: 1
```

---

### **Endpoint 2: Ejecutar reglas de negocio**

```yaml
# CLI: scripts/calidad/runner_rn.py
operationId: ejecutar_reglas_negocio
summary: Ejecuta el conjunto de reglas RN-* definidas en un YAML de reglas
parameters:
  - name: --rules
    in: cli_arg
    required: true
    schema:
      type: string
    description: Ruta al archivo YAML con las reglas a ejecutar
  - name: --output
    in: cli_arg
    required: false
    schema:
      type: string
    description: Ruta de salida para el reporte JSON de resultados
  - name: --engine
    in: cli_arg
    required: false
    schema:
      type: string
      enum: ["pyspark", "sql", "ge", "all"]
    description: Filtrar por motor de ejecución
```

**Ejemplo de archivo de reglas (`rules.yaml`):**
```yaml
rules:
  - id: "RN-001"
    description: "El campo RFC no debe tener valores nulos"
    engine: "sql"
    severity: "blocking"
    target:
      connection: "postgresql://..."
      table: "mart.clientes"
    assertion:
      type: "not_null"
      column: "rfc"
```

**Ejemplo de respuesta JSON:**
```json
{
  "run_id": "2026-05-26T18:31:00Z",
  "total": 1,
  "passed": 1,
  "failed": 0,
  "results": [
    {
      "rn_id": "RN-001",
      "engine": "sql",
      "severity": "blocking",
      "passed": true,
      "duration_ms": 142,
      "message": "0 filas con RFC nulo encontradas",
      "details": { "rows_checked": 15420, "nulls_found": 0 }
    }
  ]
}
```

---

### **Endpoint 3: Sanidad pre-sesión**

```yaml
# CLI: scripts/utilidades/sanidad_pre_sesion.py
operationId: sanidad_pre_sesion
summary: Ejecuta el chequeo completo de salud del proyecto
parameters:
  - name: --mode
    in: cli_arg
    required: false
    schema:
      type: string
      enum: ["template", "project-instance"]
    description: Modo del framework (por defecto lee project.config.yaml)
  - name: --repo
    in: cli_arg
    required: false
    schema:
      type: string
    description: Raíz del repositorio (por defecto directorio actual)
  - name: --json
    in: cli_flag
    required: false
    description: Emitir salida en formato JSON estructurado
```

**Ejemplo de respuesta (stdout):**
```
═══════════════════════════════════════════
  SANIDAD PRE-SESIÓN — SSOT Framework
  Modo: project-instance | Fase: 3A
═══════════════════════════════════════════
✓ [1/12] project.config.yaml — sin placeholders pendientes
✓ [2/12] Fase actual legible: 3A — DDL físico
✓ [3/12] Backlog de deuda técnica — 0 ítems BLOQUEANTES
⚠ [4/12] Token budget: 87,000 / 180,000 tokens (LOT_SOFT)
✓ [5/12] Trazabilidad DEC ↔ LOT — 3 decisiones verificadas
✓ [6/12] Sin marcadores de conflicto detectados
✓ [7/12] Idioma comentarios: español técnico ✓
...
Resumen: 11 OK | 1 WARNING | 0 ERROR
```

---

## 5. Historias de Usuario

### Historia de Usuario 1

**Como** arquitecto de datos que adopta el framework por primera vez,  
**quiero** poder configurar el proyecto con mis datos reales y arrancar la primera fase en menos de 15 minutos,  
**para** no perder tiempo en setup manual y poder enfocarme en el diseño del SSOT.

**Criterios de aceptación:**
- Dado que ejecuto `inicializar_proyecto.py` tras editar `project.config.yaml`, cuando reviso el repositorio, entonces no deben existir `{{PLACEHOLDER}}` sin resolver en ningún archivo `.md`, `.py` o `.yaml`.
- Dado que activo los hooks con `git config core.hooksPath .githooks`, cuando hago un commit con un archivo `.env`, entonces el hook debe rechazar el commit con mensaje explicativo.
- Dado que ejecuto `sanidad_pre_sesion.py` tras la inicialización, cuando el proyecto está en modo `project-instance`, entonces el resultado debe ser 0 errores.

---

### Historia de Usuario 2

**Como** ingeniero de datos trabajando con un agente de IA,  
**quiero** que cada lote de trabajo requiera mi confirmación explícita antes de cerrarse,  
**para** mantener el control sobre el avance real del proyecto y evitar que el agente declare éxitos no verificados.

**Criterios de aceptación:**
- Dado que un agente termina un conjunto de cambios, cuando me pregunta `¿Confirmo cierre del LOTE X? (sí/no)`, entonces solo con `sí` literal el lote avanza a estado _Hecho_ en el backlog.
- Dado que respondo `no`, cuando el agente procesa la respuesta, entonces el lote permanece en estado `en_progreso` y el agente propone un plan de corrección.
- Dado que cierro sesión sin responder, cuando retomo la sesión, entonces `sanidad_pre_sesion.py` detecta el lote abierto y lo informa como primer punto de retoma.

---

### Historia de Usuario 3

**Como** data engineer responsable de la calidad de datos,  
**quiero** definir reglas de negocio en YAML y ejecutarlas automáticamente en un DAG de Airflow,  
**para** tener visibilidad continua del estado de calidad sin intervención manual.

**Criterios de aceptación:**
- Dado que defino una regla `RN-001` en `rules.yaml` con engine `sql` y severity `blocking`, cuando ejecuto `runner_rn.py --rules rules.yaml`, entonces el resultado JSON debe incluir `rn_id`, `passed`, `duration_ms` y `details` con filas chequeadas.
- Dado que el DAG `dq_continuo` se ejecuta según su schedule, cuando completa la corrida, entonces los resultados deben persistirse en `mart.dq_metricas` con `run_id` y `recorded_at_utc`.
- Dado que una regla `blocking` falla, cuando el DAG reporta el resultado, entonces `metric_status` debe ser `failed` y el agente de calidad debe generar un ítem en el backlog de deuda técnica.

---

## 6. Tickets de Trabajo

### Ticket 1 — Backend: Implementar gate R-17 en transición a Fase 4.6

**ID:** `LOT-20260513-04`  
**Tipo:** Backend — Motor de estado  
**Prioridad:** Alta  
**Fase:** 4 → 4.6

**Descripción:**
Añadir al motor de estado la validación de confirmación de modelo cross-proveedor (Regla R-17) como gate obligatorio en las transiciones `F4 → F4.6` y `F4.5 → F4.6`. La transición debe bloquearse si no se pasa `--confirm-model` con el nombre del modelo revisor.

**Criterios de aceptación:**
- [ ] La transición a `F4.6` sin `--confirm-model` devuelve exit code 1 con mensaje `"Gate R-17: se requiere --confirm-model para entrar a revisión de código"`.
- [ ] La transición a `F4.6` con `--confirm-model claude-opus-4-7` cuando el generador es OpenAI pasa el gate correctamente.
- [ ] La transición a `F4.6` con `--confirm-model gpt-5-4` cuando el generador es Anthropic pasa el gate correctamente.
- [ ] El conjunto `R17_TRANSITIONS` en `estado_proyecto.py` incluye `(F4, F4_6)` y `(F4_5, F4_6)`.
- [ ] Test unitario `test_gate_r17.py` cubre los 3 escenarios anteriores.

**Implementación sugerida:**
```python
# En estado_proyecto.py, dentro de la función transicionar()
if (actual, destino) in R17_TRANSITIONS:
    if not confirm_model:
        raise GateError("Gate R-17: se requiere --confirm-model")
    _validate_r17_model(confirm_model, repo_root)
```

**Referencias:** `scripts/motor/estado_proyecto.py`, `tests/unit/test_gate_r17.py`, `.ai/rules/global-rules.md` (R-17)

---

### Ticket 2 — Frontend / CLI: Añadir flag `--json` a `sanidad_pre_sesion.py`

**ID:** `LOT-20260515-02`  
**Tipo:** Frontend/CLI — Interfaz de usuario  
**Prioridad:** Media  
**Fase:** 5.5

**Descripción:**
El script `sanidad_pre_sesion.py` actualmente emite salida en texto plano legible por humanos. Se requiere añadir un flag `--json` que emita la misma información como JSON estructurado, para permitir integración con dashboards de CI/CD y parseo programático desde otros scripts.

**Criterios de aceptación:**
- [ ] `python3 scripts/utilidades/sanidad_pre_sesion.py --json` emite JSON válido a stdout.
- [ ] El JSON incluye los campos: `mode`, `fase_actual`, `summary` (contadores `ok`, `warn`, `error`), `checks` (array con `id`, `status`, `message` por cada check).
- [ ] Sin el flag `--json`, la salida existente en texto plano no cambia (retrocompatibilidad garantizada).
- [ ] El exit code sigue siendo 0 para OK/WARN y 1 para ERROR, independientemente del flag.
- [ ] Test unitario verifica que el JSON es parseable con `json.loads()` y contiene los campos requeridos.

**Ejemplo de salida esperada:**
```json
{
  "mode": "project-instance",
  "fase_actual": "3A",
  "summary": { "ok": 11, "warn": 1, "error": 0 },
  "checks": [
    { "id": "1", "status": "ok", "message": "project.config.yaml — sin placeholders" },
    { "id": "4", "status": "warn", "message": "Token budget: 87,000 / 180,000 (LOT_SOFT)" }
  ]
}
```

**Referencias:** `scripts/utilidades/sanidad_pre_sesion.py`, `tests/unit/test_sanidad_pre_sesion.py`

---

### Ticket 3 — Base de datos: Añadir índice compuesto en `mart.dq_metricas`

**ID:** `LOT-20260520-01`  
**Tipo:** Base de datos — Migración  
**Prioridad:** Media-Alta  
**Fase:** 5.5

**Descripción:**
La tabla `mart.dq_metricas` crece continuamente con cada corrida del DAG de calidad. Las consultas de dashboards filtran habitualmente por `metric_key` + `metric_status` + `recorded_at_utc`. Se requiere una migración Alembic que añada un índice compuesto para optimizar estas consultas.

**Criterios de aceptación:**
- [ ] Nueva migración Alembic en `alembic/versions/` con nombre `20260520_0002_add_index_dq_metricas.py`.
- [ ] La migración crea el índice: `CREATE INDEX CONCURRENTLY idx_dq_metricas_key_status_date ON mart.dq_metricas (metric_key, metric_status, recorded_at_utc DESC)`.
- [ ] La migración incluye función `downgrade()` que elimina el índice (`DROP INDEX IF EXISTS idx_dq_metricas_key_status_date`).
- [ ] `validar_migraciones_reversibles.py` pasa sin errores sobre la nueva migración.
- [ ] Test unitario `test_migration_0002_add_index.py` verifica que `upgrade()` y `downgrade()` ejecutan sin excepción con una BD SQLite en memoria.

**DDL de la migración:**
```python
# alembic/versions/20260520_0002_add_index_dq_metricas.py
def upgrade() -> None:
    op.create_index(
        "idx_dq_metricas_key_status_date",
        "dq_metricas",
        ["metric_key", "metric_status", sa.text("recorded_at_utc DESC")],
        schema="mart",
        postgresql_concurrently=True,
    )

def downgrade() -> None:
    op.drop_index(
        "idx_dq_metricas_key_status_date",
        table_name="dq_metricas",
        schema="mart",
    )
```

**Referencias:** `alembic/versions/20260512_0001_create_mart_dq_metricas.py`, `scripts/utilidades/validar_migraciones_reversibles.py`, `tests/unit/test_migration_*.py`

---

## 7. Pull Requests

### Pull Request 1

**Título:** `feat(motor): añadir gate R-17 obligatorio en transiciones a fases de revisión`  
**Rama:** `feature/gate-r17-revision-fases` → `main`  
**ID de iteración:** `ITR-20260513-01`

**Descripción:**
Implementa la Regla R-17 como gate ejecutable en el motor de estado. Antes de esta PR, las transiciones a Fase 4.6 (revisión de código) y Fase 5.3 (revisión arquitectónica) no validaban que se usara un modelo reviewer de proveedor diferente al generador.

**Cambios incluidos:**
- `scripts/motor/estado_proyecto.py`: Añadido conjunto `R17_TRANSITIONS` y función `_validate_r17_model()`.
- `scripts/motor/transicionar.py`: Nuevo argumento `--confirm-model`.
- `tests/unit/test_gate_r17.py`: 6 tests cubriendo transiciones válidas, inválidas y mismo-proveedor.
- `project.config.yaml`: Documentados los campos `MODEL_REVISOR_VS_OPENAI` y `MODEL_REVISOR_VS_ANTHROPIC`.

**Checklist:**
- [x] Tests unitarios pasan (`pytest tests/unit/test_gate_r17.py -v`)
- [x] Sin regresiones en `test_estado_proyecto.py`
- [x] Revisión adversarial con modelo cross-proveedor completada (LOT-20260513-04)
- [x] Decisión registrada: `DEC-20260513-007` — Implementación gate R-17

---

### Pull Request 2

**Título:** `feat(calidad): implementar runner híbrido RN con soporte PySpark + SQL + GE`  
**Rama:** `feature/runner-rn-hibrido` → `main`  
**ID de iteración:** `ITR-20260511-03`

**Descripción:**
Implementa el dispatcher de reglas de negocio `runner_rn.py` con soporte para tres motores de ejecución. Antes de esta PR, no existía un mecanismo ejecutable para validar reglas `RN-*` de forma automatizada; la validación era manual.

**Cambios incluidos:**
- `scripts/calidad/runner_rn.py`: Runner canónico con dispatcher por engine.
- `scripts/calidad/engines/ge_engine.py`: Motor Great Expectations.
- `scripts/calidad/engines/sql_engine.py`: Motor SQL con SQLAlchemy.
- `scripts/calidad/engines/pyspark_engine.py`: Motor PySpark para escala distribuida.
- `dags/dq_continuo.py`: DAG Airflow que orquesta el runner periódicamente.
- `sql/ddl/mart_dq_metricas.sql`: DDL de la tabla de persistencia de métricas.
- `alembic/versions/20260512_0001_create_mart_dq_metricas.py`: Migración inicial.
- `tests/unit/test_runner_rn.py`, `test_dq_continuo.py`: Tests unitarios.

**Checklist:**
- [x] Tests pasan en los tres engines con datos fixture
- [x] La migración es reversible (`alembic downgrade -1` sin error)
- [x] DAG se importa sin error en entorno sin Airflow instalado (fallback implementado)
- [x] Revisión R-17 completada (generador: Codex / revisor: Claude)

---

### Pull Request 3

**Título:** `fix(hooks): corregir detección de PII en archivos DOCX y añadir categoría CLABE`  
**Rama:** `fix/pii-detector-docx-clabe` → `main`  
**ID de iteración:** `ITR-20260520-02`

**Descripción:**
El detector PII `_pii_detector.py` no procesaba correctamente archivos `.docx` (retornaba falsos negativos por encoding incorrecto) y no incluía detección de CLABE bancaria (18 dígitos con dígito verificador). Esta PR corrige ambos problemas y añade tests de regresión.

**Cambios incluidos:**
- `scripts/utilidades/_pii_detector.py`: Corrección de encoding UTF-8 en extracción DOCX + regex CLABE con validación de dígito verificador.
- `scripts/hooks/pre_commit_checks.py`: Actualización para usar el nuevo campo `clabe` en el reporte.
- `docs/gobernanza/pii_evidencia.md`: Documentada la categoría CLABE (18 dígitos, módulo 97).
- `tests/unit/test_check_pii_evidencia.py`: 4 tests nuevos: CLABE válida detectada, CLABE inválida ignorada, DOCX con PII detectado, DOCX sin PII correcto.

**Checklist:**
- [x] Todos los tests PII pasan (`pytest tests/unit/test_check_pii_evidencia.py -v`)
- [x] Sin regresiones en `test_pre_commit_checks.py`
- [x] Allowlist actualizada para archivos de ejemplo en tests (`pii_allowlist.yaml`)
- [x] Decisión registrada: `DEC-20260520-012` — Añadir CLABE como categoría PII canónica MX
