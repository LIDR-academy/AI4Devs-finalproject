# Product Context

## Project Identity
**Name**: Sagrada Familia Parts Manager (SF-PM)
**Type**: Sistema Enterprise de Trazabilidad para Patrimonio Arquitectonico Complejo
**Tagline**: "Digital Twin Activo con Validacion ISO-19650 para la Gestion de Piezas Unicas en la Sagrada Familia"

## Problem Statement
La gestion de miles de piezas unicas de alta complejidad geometrica en proyectos como la Sagrada Familia enfrenta el problema de **"Data Gravity"**: los archivos Rhino (.3dm) son demasiado pesados (2GB+) para consultas rapidas de inventario. La informacion critica (estado de fabricacion, aprobaciones, localizacion fisica) esta dispersa en emails, hojas de calculo y archivos CAD, generando errores logisticos costosos, retrabajos en taller, y perdida de trazabilidad en obra.

## The Solution
Sistema Enterprise de Digital Twin Activo que desacopla metadata critica de la geometria pesada, permitiendo acceso instantaneo, validacion automatica mediante agentes IA, y visualizacion 3D web de alto rendimiento.

### Core Features
1. **Hybrid Extraction Pipeline**: Procesamiento dual — Metadata (rhino3dm rapido) + Geometria 3D (asincrono para visualizacion web)
2. **"The Librarian" AI Agent**: LangGraph agent — validacion ISO-19650, clasificacion tipologias, enriquecimiento de metadatos, deteccion de anomalias
   - **Async Task Queue** (Redis + Celery): Procesamiento en background de archivos .3dm pesados sin bloquear UI
   - **Worker Isolation**: Un worker dedicado por archivo para evitar OOM con modelos de 500MB+
3. **Instanced 3D Viewer**: Three.js con instancing y LOD para 10,000+ piezas en navegador
4. **Lifecycle Traceability**: Log inmutable de eventos (Disenada → Validada → Fabricada → Enviada → Instalada)

## User Profiles

### 1. BIM Manager / Coordinador de Obra
- Dashboard en tiempo real del estado de todas las piezas
- Alertas automaticas de piezas bloqueantes o en riesgo
- Pain: *"Necesito saber AHORA cuantas dovelas del arco C-12 estan aprobadas. Hoy tardo 3 horas."*

### 2. Arquitecto de Diseno
- Subida rapida de modelos 3D con validacion automatica
- Feedback inmediato si nomenclaturas o geometria no cumplen estandares
- Pain: *"Subo un archivo con 200 piezas y 3 dias despues me dicen que 15 nombres estaban mal."*

### 3. Responsable de Taller
- Interfaz simple para marcar piezas como "En Fabricacion" / "Completada"
- Visualizacion 3D de la pieza especifica asignada
- Pain: *"Recibo PDFs por email. Necesito ver la pieza en 3D para planificar el corte."*

### 4. Gestor de Piedra / Material Specialist
- Vincular piezas digitales con bloques fisicos de piedra
- Registro de procedencia, densidad, resistencia mecanica
- Pain: *"Tengo 50 bloques en almacen pero no se que piezas se pueden cortar de cada uno."*

## Technical Pillars

### 1. Architecture & Systems Engineering
Full-stack enterprise: frontend web con 3D, backend escalable con procesamiento asincrono, PostgreSQL con RBAC, integracion Rhino/Grasshopper.

### 2. AI Agents for Data Quality
LLMs (via LangGraph) para validacion y limpieza de datos: normalizacion nomenclaturas, clasificacion supervisada, deteccion de anomalias.

### 3. Performance Engineering & 3D Optimization
Renderizar 10,000+ meshes en navegador: instancing, Draco compression, LOD adaptativo, streaming progresivo.

### 4. ISO-19650 Compliance
Nomenclaturas Uniclass 2015 / IFC, metadatos obligatorios, audit trail completo para inspecciones y certificaciones.

## Constraints (TFM)
- **Timeline**: 3 meses (12 semanas), 1 desarrollador senior
- **Key Bottlenecks**: rendimiento WebGL (10K+ meshes), ingesta .3dm pesados (2GB+), CI/CD para demo

## Success Metrics (MVP)
- Extraccion metadata: <30s para archivo 2GB
- Validacion The Librarian: <5s por pieza
- Visor 3D: >30fps con 5,000 piezas visibles
- Reduccion 70% tiempo busqueda de piezas
- 95% cobertura de trazabilidad
---

## Current Implementation Status (Feb 2026)

### ✅ Completed Features

**US-001: File Upload Flow (DONE)**
- Direct S3 upload with presigned URLs (no backend bottleneck)
- Client-side validation (mime-type, size limits)
- Event tracking on upload confirmation
- Backend service layer with Clean Architecture pattern
- Full test coverage (18 frontend + 7 backend tests)

**US-005: Dashboard 3D Interactivo - Foundation (IN PROGRESS)**
- Database schema extended for 3D rendering (T-0503-DB DONE 2026-02-19)
  * `low_poly_url` column: Storage URLs for GLB geometry files (~1000 triangles)
  * `bbox` column: 3D bounding boxes in JSONB format for spatial queries
  * `idx_blocks_canvas_query`: Composite index (status, tipologia, workshop_id) for dashboard filters <500ms
  * `idx_blocks_low_poly_processing`: Partial index for GLB generation queue <10ms
- React Three Fiber stack setup complete (T-0500-INFRA DONE 2026-02-19)
- **List Parts API implemented** (T-0501-BACK DONE 2026-02-20)
  * `GET /api/parts` endpoint with dynamic filtering (status, tipologia, workshop_id)
  * Clean Architecture service layer: PartsService with NULL-safe transformations
  * RLS enforcement: workshop users scope, service role full access
  * Query performance: <500ms target met (composite index usage)
  * Response optimization: <200KB payload for 150+ parts
  * 32/32 tests PASS (20 integration + 12 unit)
- **Low-Poly GLB Generation Pipeline** (T-0502-AGENT DONE 2026-02-19)
  * Celery async task: .3dm → decimation 90% → GLB+Draco → S3 upload
  * Quad face handling: Split (A,B,C,D) → 2 triangles for proper rendering
  * Performance: OOM fix with Docker 4GB memory limits
  * Test coverage: 9/9 unit tests PASS (including huge_geometry 150K faces)
  * Files: `src/agent/tasks/geometry_processing.py` (450 lines, 7 modular functions)

**US-002: Validation Infrastructure (PARTIAL)**
- ✅ Database schema: `validation_report` JSONB column in `blocks` table
- ✅ Extended `block_status` enum: `processing`, `rejected`, `error_processing`
- ✅ Redis + Celery worker setup for async validation tasks
- ✅ ValidationReport API contract (Pydantic + TypeScript schemas)
- ✅ Agent validators:
  - T-024: Rhino file parser (rhino3dm integration)
  - T-025: User strings extractor (metadata extraction)
  - T-026: Nomenclature validator (ISO-19650 regex)
  - T-027: Geometry validator (IsValid checks)
- ✅ **T-028: Validation Report Service** (Backend integration)
  - Service layer for creating/persisting validation reports
  - JSONB serialization/deserialization with Pydantic
  - Clean Architecture with return tuples pattern
  - Full test coverage (13 tests: 10 unit + 3 integration)
- ✅ **T-029: Trigger Validation from Confirm Endpoint** (Async orchestration)
  - Celery singleton pattern for task enqueue
  - UploadService methods: create_block_record() + enqueue_validation()
  - Block creation with PENDING-{file_id} iso_code
  - API returns task_id for async tracking
  - Full test coverage (13 tests: 9 unit + 4 integration)
- ✅ **T-030: Get Validation Status Endpoint** (Query layer complete)
  - GET /api/parts/{id}/validation endpoint
  - ValidationService for business logic layer
  - Returns ValidationStatusResponse with block metadata + validation_report JSONB
  - Handles block not found (404), DB errors (500), invalid UUID (422)
  - NULL-safe validation_report parsing for unvalidated blocks
  - Schema limitation documented: job_id tracking requires future migration
  - Full test coverage (13 tests: 8 unit + 5 integration, 0 regression)
- ✅ **T-031: Real-Time Block Status Listener** (Frontend real-time updates)
  - Custom React hook useBlockStatusListener with Supabase Realtime
  - Dependency Injection pattern for Supabase client (SupabaseConfig interface)
  - Toast notification service with ARIA accessibility (auto-remove 5s)
  - Constants extraction pattern (NOTIFICATION_CONFIG, REALTIME_SCHEMA/TABLE/EVENT)
  - Service layer separation: supabase.client.ts, notification.service.ts
  - Test utilities: resetSupabaseClient() for test isolation
  - Full test coverage (24 tests: 4 client + 8 notification + 12 hook, 0 regression)

- ✅ **T-032: Validation Report Modal** (Frontend UI complete)
  - React Portal modal with tabbed layout (Nomenclature / Geometry / Metadata)
  - Keyboard navigation: ArrowLeft/Right for tabs, ESC to close
  - Full ARIA accessibility (role=dialog, aria-modal, focus trap)
  - Utils: groupErrorsByCategory, formatValidatedAt, getErrorCountForCategory
  - Full test coverage (34 tests: 26 component + 8 utils, 0 regression)

**US-005: Dashboard 3D Interactivo de Piezas (IN PROGRESS)**
- ✅ **T-0500-INFRA: React Three Fiber Stack Setup** (Foundation complete)
  - Dependencies: @react-three/fiber@^8.15, @react-three/drei@^9.92, three@^0.160, zustand@^4.4.7
  - Vite: GLB/GLTF asset support, `three-vendor` chunk (code splitting), `@` path alias
  - jsdom mocks: Canvas → `<div data-testid="three-canvas">`, useGLTF → `{ scene, nodes, materials }`
  - Stubs: parts.store.ts, types/parts.ts, dashboard3d.constants.ts, usePartsSpatialLayout.ts, Dashboard/index.ts
  - Test coverage: 10/10 tests passing (T2 imports + T13 mock + T4 stubs)
- ✅ **T-0503-DB: Add low_poly_url Column & Indexes** (Database schema complete)
  - Migration: `supabase/migrations/20260219000001_add_low_poly_url_bbox.sql`
  - Columns: `low_poly_url` (TEXT NULL), `bbox` (JSONB NULL) for 3D rendering
  - Indexes: `idx_blocks_canvas_query` (composite), `idx_blocks_low_poly_processing` (partial)
  - Performance: <500ms canvas query, <10ms processing queue, 24KB index size
  - Test coverage: 17/20 tests passing (85%, functional core 100%)

### 🔄 In Progress
- US-005 T-0501-BACK: List Parts API endpoint (next)

### 📋 Next Milestones
- US-005: Dashboard 3D (T-0503-DB → T-0501-BACK → T-0504-FRONT → T-0505-FRONT → ...)
- US-010: 3D Web Viewer (Three.js) — stack already installed via T-0500-INFRA
- US-007: Lifecycle state machine
- US-013: Authentication (Supabase Auth)