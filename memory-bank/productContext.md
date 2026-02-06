# Product Context

# 🛡️ PROTOCOLO DE EJECUCIÓN (ANTIGRAVITY RULES)
*Estas reglas son inquebrantables durante la fase de desarrollo.*

**1. LEY DEL FOCO (Single Ticket Mode)**
* Solo se trabaja en **un (1) ticket** a la vez.
* Jamás se implementan funciones que no estén explícitamente pedidas en el ticket activo.

**2. LEY DEL TDD (Red -> Green -> Refactor)**
* **FASE ROJA (Test):** Antes de escribir una sola línea de código funcional (`src/`), DEBES generar un test que falle (`tests/`) validando los Criterios de Aceptación.
* **STOP:** Esperar confirmación del usuario tras generar el test.
* **FASE VERDE (Code):** Solo tras la aprobación del test, genera el código mínimo necesario para pasarlo.
* **FASE REFACTOR:** Limpia y optimiza el código.

**3. LEY DE LA CONFIRMACIÓN**
* El sistema es **secuencial**. No asumas el siguiente paso. Pregunta siempre: *"Test generado. ¿Procedo a la implementación?"* o *"Código implementado. ¿Pasamos al siguiente ticket?"*.

**4. LEY DE LA INTEGRIDAD**
* Si un cambio de código requiere cambiar la arquitectura documentada (`docs/`), se actualiza la documentación PRIMERO.

---

## Project Identity
**Name**: Sagrada Familia Parts Manager (SF-PM)
**Type**: Sistema Enterprise de Trazabilidad para Patrimonio Arquitectónico Complejo
**Tagline**: "Digital Twin Activo con Validación ISO-19650 para la Gestión de Piezas Únicas en la Sagrada Familia"

## Problem Statement
La gestión de miles de piezas únicas de alta complejidad geométrica en proyectos como la Sagrada Familia enfrenta el problema de **"Data Gravity"**: los archivos Rhino (.3dm) son demasiado pesados (2GB+) para consultas rápidas de inventario. La información crítica (estado de fabricación, aprobaciones, localización física) está dispersa en emails, hojas de cálculo y archivos CAD, generando errores logísticos costosos, retrabajos en taller, y pérdida de trazabilidad en obra.

## The Solution
**Sistema Enterprise de Digital Twin Activo** que desacopla metadata crítica de la geometría pesada, permitiendo acceso instantáneo, validación automática mediante agentes IA, y visualización 3D web de alto rendimiento. La **Oficina Técnica de la Sagrada Familia** obtiene una fuente única de verdad (Single Source of Truth) para la gestión integral del ciclo de vida de cada pieza.

### Core Features
1.  **Hybrid Extraction Pipeline**: Procesamiento dual que separa Metadata (extracción rápida con `rhino3dm`) de Geometría 3D (procesamiento asíncrono para visualización web).
2.  **"The Librarian" AI Agent**: Agente basado en LangGraph que ejecuta:
    - Validación automática de nomenclaturas según estándares ISO-19650
    - Clasificación inteligente de tipologías (Piedra/Hormigón/Metálica)
    - Enriquecimiento de metadatos faltantes mediante inferencia contextual
    - Detección de anomalías en geometría (volumen, dimensiones, integridad)
3.  **Instanced 3D Viewer**: Visor Three.js de alto rendimiento capaz de renderizar 10,000+ piezas mediante instancing y LOD (Level of Detail).
4.  **Lifecycle Traceability**: Log inmutable de eventos (Diseñada → Validada → Fabricada → Enviada → Instalada) con audit trail completo para compliance y reporting.

## User Profiles (Oficina Técnica SF)

### 1. **Usuario Principal: BIM Manager / Coordinador de Obra**
- **Responsabilidad**: Supervisión global del inventario digital y coordinación entre diseño, fabricación y montaje.
- **Necesidades**:
  - Dashboard en tiempo real del estado de todas las piezas
  - Alertas automáticas de piezas bloqueantes o en riesgo
  - Reportes de progreso para dirección y patrimonio
- **Pain Point**: *"Necesito saber AHORA cuántas dovelas del arco C-12 están aprobadas, cuántas en taller, y si hay alguna rechazada. Hoy tardo 3 horas buscando en carpetas y emails."*

### 2. **Arquitecto de Diseño**
- **Responsabilidad**: Generación de geometría paramétrica y documentación técnica en Rhino/Grasshopper.
- **Necesidades**:
  - Subida rápida de modelos 3D con validación automática
  - Feedback inmediato si nomenclaturas o geometría no cumplen estándares
  - Historial de versiones y trazabilidad de cambios
- **Pain Point**: *"Subo un archivo con 200 piezas y 3 días después me dicen que 15 nombres de capas estaban mal. Necesito saberlo en el momento de la subida."*

### 3. **Responsable de Taller / Industrial Partner**
- **Responsabilidad**: Fabricación física de piezas en piedra, hormigón o metal.
- **Necesidades**:
  - Interfaz simple para marcar piezas como "En Fabricación" / "Completada" / "Requiere Revisión"
  - Visualización 3D de la pieza específica asignada
  - Notificaciones de nuevas piezas asignadas a su taller
- **Pain Point**: *"Recibo PDFs y capturas de pantalla por email. Necesito ver la pieza en 3D para planificar el corte y verificar medidas antes de empezar."*

### 4. **Gestor de Piedra / Material Specialist**
- **Responsabilidad**: Trazabilidad del material físico (cantera de origen, certificados, localización en almacén).
- **Necesidades**:
  - Vincular piezas digitales con bloques físicos de piedra
  - Registro de procedencia, densidad, resistencia mecánica
  - Consulta rápida de stock disponible por tipo de material
- **Pain Point**: *"Tengo 50 bloques de Montjuïc en almacén pero no sé qué piezas se pueden cortar de cada uno sin abrir todos los archivos CAD."*

## Technical Pillars

### 1. **Architecture & Systems Engineering**
Demostración de capacidad full-stack enterprise integrando:
- Frontend web moderno con visualización 3D de alto rendimiento
- Backend escalable con procesamiento asíncrono de archivos pesados
- Base de datos relacional con control de acceso granular (RBAC)
- Integración bidireccional con ecosistema Rhino/Grasshopper

### 2. **AI Agents for Data Quality**
Uso pragmático de LLMs (vía LangGraph) para tareas estructuradas de validación y limpieza de datos:
- Normalización de nomenclaturas (no generación libre)
- Clasificación supervisada con human-in-the-loop
- Detección de anomalías mediante reglas + ML

### 3. **Performance Engineering & 3D Optimization**
Resolución del desafío técnico de renderizar 10,000+ meshes en navegador:
- Estrategias de instancing y batching en Three.js
- Compresión de geometría (Draco, quantization)
- LOD adaptativo y frustum culling
- Streaming progresivo de assets

### 4. **ISO-19650 Compliance**
Alineación con estándares internacionales de gestión BIM para proyectos patrimoniales:
- Nomenclaturas basadas en Uniclass 2015 / IFC
- Metadatos obligatorios (Responsible Party, Status, Approval Date)
- Audit trail completo para inspecciones y certificaciones

## Development Constraints (TFM)
- **Timeline**: 3 Meses (12 semanas)
- **Resource**: 1 Desarrollador Senior
- **Key Bottlenecks**: 
  1. Rendimiento WebGL (10K+ meshes)
  2. Velocidad de ingesta de archivos .3dm pesados (2GB+)
  3. Configuración de CI/CD para despliegue demo

## Current Project Phase
**Status**: 🚧 **Phase: Implementation - MVP Scope**
**Stage**: Building Core Features (The Golden Path)
**Documentation**: Phase 9 (MVP Backlog) Defined.
**Current Focus**: Sprint 2 - Frontend Development. ✅ **Sprint 1 Completed:** T-002-BACK (Upload endpoint), T-005-INFRA (Bucket setup), Testing infrastructure, Repository refactor. 🔧 **Sprint 2 Active (FASE ROJA):** T-003-FRONT File Upload Integration. Frontend structure initialized with React 18 + TypeScript + Vitest. Comprehensive test suite created for `FileUploader` component covering upload flow, validation, progress tracking, and error handling. Component implementation pending (TDD Red Phase).
**MVP Scope**:
- CRITICAL: US-001, US-002, US-005, US-010, US-007
- HIGH: US-013, US-009
**Icebox**: All other User Stories (e.g. US-003, US-012) are deferred.

## Success Metrics (MVP)
- **Técnicas**:
  - Tiempo de extracción metadata: <30s para archivo 2GB
  - Tiempo de validación The Librarian: <5s por pieza
  - FPS en visor 3D: >30fps con 5,000 piezas visibles
- **Negocio**:
  - Reducción 70% tiempo de búsqueda de información de piezas
  - Reducción 90% emails de "¿Dónde está X pieza?"
  - 95% cobertura de trazabilidad
  - *Risks / Assumptions*: Lograr >30fps con 5,000 piezas requiere estrategias avanzadas de LOD/instancing (Three.js) y validación temprana.


---

## Estructura de Fases del Proyecto

El desarrollo de SF-PM siguió una metodología estructurada de ingeniería de sistemas, dividida en 7 fases secuenciales que garantizan solidez arquitectónica antes de escribir código. **TODAS LAS FASES HAN SIDO COMPLETADAS.**

### **FASE 1: Análisis y Estrategia** ✅ COMPLETADA
**Objetivo:** Definir el problema, la visión del producto y la propuesta de valor.

**Entregables:**
- Definición del problema "Data Gravity" y pain points de usuarios
- Visión del Digital Twin Activo con validación ISO-19650
- Análisis de mercado y comparativa con competidores (Speckle, BIM360)
- Propuesta de valor única (The Librarian Agent)

**Ubicación**: [docs/01-strategy.md](../docs/01-strategy.md) (100 líneas)

---

### **FASE 2: Definición del Software (PRD)** ✅ COMPLETADA
**Objetivo:** Especificar qué se va a construir desde la perspectiva del usuario.

**Entregables:**
- 4 User Personas completas (BIM Manager, Arquitecto, Responsable Taller, Gestor de Piedra)
- Definición de The Librarian Agent (validación activa con IA)
- Feature Map del MVP (6 funcionalidades prioritarias P0)
- Wireframes conceptuales de 3 interfaces clave (Dashboard, Upload, Visor 3D)
- Roadmap detallado con criterios de aceptación técnicos
- 14 User Stories completas con formato Given/When/Then (Happy Paths + Error Paths)
- Stack tecnológico conceptual justificado

**Ubicación**: [docs/02-prd.md](../docs/02-prd.md) (874 líneas)

---

### **FASE 3: Modelo de Negocio/Servicio** ✅ COMPLETADA
**Objetivo:** Definir cómo el sistema genera valor operativo para la Oficina Técnica.

**Entregables:**
- Lean Canvas adaptado a Enterprise/B2B (cliente: Oficina Técnica SF)
- Análisis de riesgos y estrategias de mitigación
- Propuesta de valor por segmento de usuario
- Métricas de éxito del MVP

**Ubicación**: [docs/03-service-model.md](../docs/03-service-model.md) (102 líneas)

---

### **FASE 4: Casos de Uso Críticos** ✅ COMPLETADA
**Objetivo:** Definir flujos de trabajo detallados con diagramas de secuencia.

**Entregables:**
- 3 Casos de Uso Maestros con diagramas Mermaid:
  - **CU-01**: Ingesta y Validación (P0 - Bloqueante)
  - **CU-02**: Gestión y Visualización (P1 - Dependiente)
  - **CU-03**: Trazabilidad y Auditoría (P1 - Dependiente)
- Mapeo de 14 User Stories a casos de uso
- 6 Diagramas Mermaid (3 Flowcharts + 3 Sequence Diagrams)
- Matriz de dependencias críticas con orden de implementación

**Ubicación**: [docs/04-use-cases.md](../docs/04-use-cases.md) (420 líneas)

---

### **FASE 5: Modelo de Datos** ✅ COMPLETADA
**Objetivo:** Diseñar el esquema de base de datos relacional y estructura JSONB.

**Entregables:**
- Diagrama Entidad-Relación (ERD) completo con Mermaid
- Definición de 8 tablas SQL:
  - `profiles`, `zones`, `blocks`, `events`, `attachments`, `workshops`, `notifications`, `parts_snapshots`
- Row Level Security (RLS) policies por rol (Arquitecto, BIM Manager, Taller, Dirección)
- Estrategia JSONB híbrida para `rhino_metadata` flexible
- Índices optimizados (GIN para JSONB, B-tree para status/zone)
- Triggers automáticos (`updated_at`, `log_status_change`)
- 8 archivos de migración SQL documentados
- Diccionario de datos completo

**Ubicación**: [docs/05-data-model.md](../docs/05-data-model.md) (671 líneas)

---

### **FASE 6: Arquitectura de Alto Nivel** ✅ COMPLETADA
**Objetivo:** Definir componentes del sistema y patrones de comunicación.

**Entregables:**
- Diagrama C4 Container (Level 2) con Mermaid: 6 capas (Client, API, Worker, Data, Storage, External)
- Definición de 6 componentes con tech stacks:
  1. Client Layer (React SPA - Vercel)
  2. API Layer (FastAPI - Railway)
  3. Worker Layer (Celery + The Librarian - Railway)
  4. Data Layer (Supabase PostgreSQL + Auth + Realtime)
  5. Storage Layer (S3-compatible buckets)
  6. External Services (OpenAI GPT-4)
- 4 Patrones arquitectónicos aplicados:
  1. Event-Driven Architecture (async processing)
  2. Presigned URLs (direct upload)
  3. Event Sourcing (immutable audit log)
  4. CQRS Ligero (optimized queries)
- Flujo crítico: Ingesta de archivo (Sequence Diagram con 25 pasos)
- Diagrama de Deployment con infraestructura y costos ($235/mes MVP)
- 4 Decisiones técnicas justificadas (Celery vs Lambda, Supabase vs self-hosted, etc.)
- Estrategias de resiliencia (Retry policies, Circuit breaker, DLQ, Health checks)
- Seguridad Defense-in-Depth (4 capas: Frontend, API, Database, Storage)

**Ubicación**: [docs/06-architecture.md](../docs/06-architecture.md) (706 líneas)

---

### **FASE 7: Diseño en Profundidad (C4 Level 3)** ✅ COMPLETADA
**Objetivo:** Detallar componentes críticos con diagramas de componentes y código.

**Entregables:**
- **Agente "The Librarian" (Validación Inteligente):**
  - Diagrama C4 Component (Level 3) con Mermaid: 7 componentes internos
  - Tabla de responsabilidades por módulo (State Manager, Syntax Validator, Geometry Extractor, Geometry Validator, Semantic Validator, Report Generator, Error Handler)
  - Grafo de estado LangGraph (stateDiagram-v2) con 8 nodos y edges condicionales
  - Implementación completa de 6 nodos con código Python:
    1. `validate_nomenclature` (Regex ISO-19650)
    2. `extract_geometry` (rhino3dm File3dm.Read())
    3. `validate_geometry` (topological checks)
    4. `classify_tipologia` (LLM GPT-4 con JSON mode)
    5. `fallback_classification` (regex backup)
    6. `generate_report` (compilación de resultados)
  - Definición del LangGraph workflow (nodos + edges + StateGraph)
  - Manejo de errores y resiliencia:
    - Circuit Breaker para OpenAI API (threshold=5, recovery=60s)
    - Retry con backoff exponencial (Tenacity)
    - Fallback graceful a clasificación regex
  - Testing: Unit tests + Integration test del workflow completo
  - Observabilidad: Logs estructurados JSON + métricas de performance
  - Ejemplo de invocación desde Celery task

**Ubicación**: [docs/07-agent-design.md](../docs/07-agent-design.md) (724 líneas)

---

## Reglas de Ejecución

### ⚠️ REGLA DE ORO: Prohibición de Trabajo en Fases Futuras

> **El LLM tiene terminantemente PROHIBIDO generar contenido, código o decisiones arquitectónicas que pertenezcan a una fase futura a la actual.**
> 
> **Solo se puede trabajar en la FASE ACTIVA designada por el usuario.**
> 
> **Si el usuario pide algo de una fase futura, el LLM debe:**
> 1. **Rechazar educadamente** la solicitud
> 2. **Explicar** en qué fase nos encontramos actualmente
> 3. **Listar** qué entregables de la fase actual faltan por completar
> 4. **Sugerir** volver a la fase actual y completarla antes de avanzar

**Mecanismo de Ejecución:**
Antes de cerrar cada fase, se debe ejecutar una **checklist de revisión humana** obligatoria para confirmar que todos los entregables cumplen con el estándar de calidad.


### Ejemplos de Aplicación

**❌ PROHIBIDO (Fase Actual = 2, Solicitud = Fase 5):**
```text
Usuario: "Genera el esquema SQL de la tabla `parts` con todos los campos."

Respuesta del LLM:
"⚠️ No puedo generar el esquema SQL todavía.

Fase Actual: FASE 2 (Definición del Software - PRD)
Fase Solicitada: FASE 5 (Modelo de Datos)

Para llegar a FASE 5, primero debemos completar:
- ✅ FASE 2: Roadmap de features detallado (80% completado)
- 📋 FASE 3: Modelo de Negocio/Lean Canvas (pendiente)
- 📋 FASE 4: Casos de Uso con diagramas de secuencia (pendiente)

¿Quieres que continuemos completando la FASE 2 actual?"
```

**✅ PERMITIDO (Fase Actual = 2, Solicitud = Fase 2):**
```text
Usuario: "Define los criterios de aceptación del MVP para inversores."

Respuesta del LLM:
"Perfecto, eso pertenece a FASE 2 (PRD). Aquí están los criterios..."
```

### Mecanismo de Cambio de Fase

**Solo el usuario puede autorizar el paso a la siguiente fase mediante confirmación explícita:**

```
Usuario: "He revisado todos los entregables de FASE 2. Apruebo el paso a FASE 3."

LLM: "✅ Fase aprobada. Actualizando estado en Memory Bank:
- FASE 2: ✅ COMPLETADA
- FASE 3: 🚧 EN PROGRESO

Comenzaré con el Lean Canvas adaptado a Enterprise..."
```

**Sin aprobación explícita, el LLM permanece en la fase actual.**

### Beneficios de las Reglas de Contención

1. **Evita "Alucinaciones" Prematuras de Código**: No se genera código sin arquitectura sólida.
2. **Garantiza Documentación Completa**: Cada fase deja rastro en Memory Bank.
3. **Permite Pivots Sin Reescribir Código**: Cambiar decisiones en FASE 3 es barato; en FASE 7 con código escrito, es costoso.
4. **Trazabilidad de Decisiones**: Cada fase está documentada en `productContext.md`, `decisions.md`, y `prompts.md`.
5. **Metodología Auditable**: Útil para presentación de TFM (demostrar proceso riguroso).

---

## Estado Actual del Proyecto

**TODAS LAS FASES COMPLETADAS** ✅

### Fases Completadas (Documentación Técnica Final)

- ✅ **FASE 1**: Análisis y Estrategia - [docs/01-strategy.md](../docs/01-strategy.md)
- ✅ **FASE 2**: PRD (Product Requirements Document) - [docs/02-prd.md](../docs/02-prd.md)
- ✅ **FASE 3**: Modelo de Servicio (Lean Canvas) - [docs/03-service-model.md](../docs/03-service-model.md)
- ✅ **FASE 4**: Casos de Uso y Arquitectura de Flujos - [docs/04-use-cases.md](../docs/04-use-cases.md)
- ✅ **FASE 5**: Modelo de Datos (PostgreSQL/Supabase) - [docs/05-data-model.md](../docs/05-data-model.md)
- ✅ **FASE 6**: Arquitectura de Alto Nivel (C4 Level 2) - [docs/06-architecture.md](../docs/06-architecture.md)
- ✅ **FASE 7**: Diseño en Profundidad - Agente "The Librarian" (C4 Level 3) - [docs/07-agent-design.md](../docs/07-agent-design.md)

### Arquitectura Final Confirmada

**Stack Tecnológico:**
- **Frontend**: React 18 + TypeScript + Three.js + TanStack Query + Zustand + Vite → Vercel CDN
- **Backend**: FastAPI (Python 3.11) + Pydantic 2.x + python-jose + httpx → Railway
- **Worker Layer**: Celery Workers + Redis Queue + The Librarian Agent (LangGraph + GPT-4)
- **Data Layer**: Supabase (PostgreSQL 15 + Auth JWT + Realtime WebSockets)
- **Storage**: S3-compatible buckets (quarantine → raw → processed)
- **AI/ML**: LangGraph (stateful workflows) + OpenAI GPT-4 Turbo (JSON mode)
- **CAD Processing**: rhino3dm library + glTF/GLB mesh conversion

**Arquitectura Cloud-Native:**
- **Patrón Event-Driven**: Upload S3 → Redis Queue → Celery Workers → DB Update → WebSocket Notification
- **Presigned URLs**: Upload directo desde cliente a S3 (evita backend bottleneck)
- **Event Sourcing**: Tabla `events` append-only para audit trail inmutable
- **CQRS Ligero**: Queries optimizadas para dashboard con índices específicos
- **RLS Policies**: Row Level Security en PostgreSQL por rol (Arquitecto, BIM Manager, Taller, Dirección)

**Agente "The Librarian" (Validación Inteligente):**
- **Orquestación**: LangGraph con 8 nodos (ValidateNomenclature → ExtractGeometry → ValidateGeometry → ClassifyTipologia → EnrichMetadata → GenerateReport → END)
- **Componentes Internos**:
  1. State Manager (LangGraph StateGraph)
  2. Syntax Validator (Regex ISO-19650)
  3. Geometry Extractor (rhino3dm parser)
  4. Geometry Validator (topological checks)
  5. Semantic Validator (GPT-4 client con JSON mode)
  6. Report Generator (Jinja2 templates)
  7. Error Handler (retry policies, circuit breaker, fallback regex)
- **Resiliencia**: Circuit Breaker (OpenAI), Retry con backoff exponencial, Fallback graceful a regex
- **Observabilidad**: Logs estructurados JSON, métricas de performance, agent execution timeline

**Costos Estimados (MVP):**
- Vercel (Frontend): $0 (Hobby tier)
- Railway (Backend + Workers): $10/mes (512MB RAM × 2 services)
- Supabase Pro: $25/mes (1GB DB, 100GB storage, Realtime WebSockets)
- Redis Cloud: $0 (30MB free tier)
- OpenAI API: $200/mes (10k clasificaciones/mes)
- **Total MVP**: $235/mes

### Próxima Fase: Implementación del MVP

**FASE 8: Desarrollo e Implementación** (EN PROGRESO)

**Estado Actual de Implementación (Sprint 1-2):**

✅ **Backend (FastAPI):**
- Endpoint `POST /api/upload/url` operacional (T-002-BACK)
- Pydantic schemas para upload flow (`UploadRequest`, `UploadResponse`)
- Integración con Supabase Storage mediante presigned URLs
- Tests de integración pasando (pytest)

✅ **Infraestructura (Supabase + Docker):**
- Bucket `raw-uploads` configurado con políticas CORS (T-005-INFRA)
- Docker Compose con services: backend (FastAPI), db (PostgreSQL), frontend (Node.js)
- Imagen base: node:20-bookworm (Debian) para estabilidad de tests jsdom

✅ **Frontend (React + TypeScript):**
- **FileUploader Component** completamente funcional (T-003-FRONT)
  - Validación client-side (.3dm extensión, 500MB max size)
  - Upload flow con progress tracking
  - Manejo de errores y estados (idle → requesting-url → uploading → success/error)
  - Accessibility completa (aria-label, aria-busy, aria-live regions)
- **Upload Service Layer** (`upload.service.ts`)
  - Separación de responsabilidades (UI vs API logic)
  - Funciones: `getPresignedUrl()`, `uploadToStorage()`, `uploadFile()`
  - JSDoc completo para reutilización
- **TypeScript Interfaces** alineadas con backend schemas Pydantic
- Tests automatizados (Vitest + Testing Library): 4/4 pasando

**Tickets Completados:**
- ✅ T-002-BACK: Generate Presigned URL
- ✅ T-003-FRONT: Upload Manager (Client) + Refactor
- ✅ T-005-INFRA: S3 Bucket Setup

**En Progreso:**
- ⏳ T-004-BACK: Confirm Upload Webhook

**Objetivos:**
1. Setup de proyecto (monorepo Turborepo o Nx)
2. Implementación de backend FastAPI con endpoints CRUD
3. Implementación de frontend React con Dashboard + Visor 3D
4. Integración Supabase (Auth + Database + Realtime)
5. Implementación de The Librarian Agent (LangGraph workflow)
6. Deploy automático (Vercel + Railway + GitHub Actions)
7. Testing E2E (Playwright) + Unit tests (Pytest + Vitest)

**Criterios de Completitud:**
- [ ] Usuario puede hacer login con email/password (Supabase Auth)
- [ ] Usuario puede subir archivo .3dm y recibir validación en <10s
- [ ] Dashboard muestra todas las piezas con filtros funcionales
- [ ] Visor 3D renderiza geometría .glb con >30 FPS
- [ ] BIM Manager puede cambiar estado de piezas
- [ ] Responsable Taller puede marcar piezas como completadas con foto
- [ ] Deploy funcional en Vercel + Railway con CI/CD

**Timeline Estimado**: 4-6 semanas (asumiendo 1 desarrollador full-time)

**Bloqueadores Actuales**: Ninguno. Documentación completa y arquitectura validada.
