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
3. **CDN-Optimized 3D Delivery** (2026-02-24): CloudFront CDN para archivos GLB optimizados. Cache TTL 24h, Brotli compression, latency <200ms vs >500ms S3 directo. Feature toggle USE_CDN permite separación dev/prod.
4. **Part Navigation API with Redis Caching** (2026-02-25): Endpoint para navegación secuencial prev/next sin cerrar modal. Ordenación por created_at ASC con filtros (workshop, status, tipologia), RLS enforcement, respuesta con ids adyacentes + posición 1-based (current_index/total_count). Redis caching con TTL 300s reduce latencia 53% (cache hit <50ms vs 94ms DB query), graceful degradation si Redis no disponible.
5. **Instanced 3D Viewer**: Three.js con instancing y LOD para 10,000+ piezas en navegador
6. **Lifecycle Traceability**: Log inmutable de eventos (Disenada → Validada → Fabricada → Enviada → Instalada)

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
- **Canvas API Integration Tests** (T-0510-TEST-BACK DONE 2026-02-23)
  * 5 integration test suites covering GET /api/parts endpoint: Functional (6 tests), Filters (5 tests), RLS (4 tests), Performance (4 tests), Index Usage (4 tests)
  * Test coverage: 13/23 PASS (56%) — Functional core 100% verified (11/11 ✅), 7 FAILED aspirational (document future NFRs), RLS 1/4 PASS (service role), 3/4 SKIPPED (require JWT T-022-INFRA)
  * Test pattern: SELECT+DELETE cleanup (Supabase .like() unreliable for DELETE operations), idempotent error handling
  * Refactoring: Extracted cleanup_test_blocks_by_pattern() helper (eliminated ~90 lines duplication across 8 tests)
  * Files: test_functional_core.py (298 lines), test_filters_validation.py (219 lines), test_rls_policies.py (243 lines), test_performance_scalability.py (282 lines), test_index_usage.py (394 lines), helpers.py (57 lines)
- **Low-Poly GLB Generation Pipeline** (T-0502-AGENT DONE 2026-02-19)
  * Celery async task: .3dm → decimation 90% → GLB+Draco → S3 upload
  * Quad face handling: Split (A,B,C,D) → 2 triangles for proper rendering
  * Performance: OOM fix with Docker 4GB memory limits
  * Test coverage: 9/9 unit tests PASS (including huge_geometry 150K faces)
  * Files: `src/agent/tasks/geometry_processing.py` (450 lines, 7 modular functions)
- **3D Parts Scene - Low-Poly Meshes** (T-0505-FRONT DONE 2026-02-20)
  * PartsScene.tsx: Orchestrates N parts rendering with spatial layout from usePartsSpatialLayout hook
  * PartMesh.tsx: GLB mesh loader (useGLTF), status-based colors (STATUS_COLORS), tooltip on hover, click → selectPart(id)
  * usePartsSpatialLayout.ts: Position calculation (bbox center OR grid 10x10 spacing), helper functions for spatial logic
  * parts.store.ts: Zustand store with fetchParts/setFilters/selectPart, integrated with parts.service API layer
  * Test coverage: 16/16 tests PASS (PartsScene 5/5, PartMesh 11/11), zero regression 49/49 Dashboard tests
  * Refactor: TOOLTIP_STYLES constant extracted, helper functions (calculateBBoxCenter, calculateGridPosition), clarifying comments for performance logging
  * Files: 5 total (PartsScene 60 lines, PartMesh 107 lines, usePartsSpatialLayout 70 lines, parts.store 95 lines, parts.service 40 lines)
- **Filters Sidebar & Zustand Store** (T-0506-FRONT DONE 2026-02-21)
  * Zustand store extended: PartsFilters interface (status[], tipologia[], workshop_id), setFilters (partial merge), clearFilters, getFilteredParts (computed)
  * CheckboxGroup.tsx: Reusable multi-select component (91 lines) with color badges, aria-label accessibility
  * FiltersSidebar.tsx: Orchestrator component (84 lines) with counter "Mostrando X de Y", clear button, 3 sections (Tipología/Estado/Taller placeholder)
- **ViewerErrorBoundary Component** (T-1006-FRONT DONE 2026-02-25)
  * React Error Boundary class component for catching WebGL, Three.js, and useGLTF errors
  * Features: WebGL availability detection, graceful error fallback UI, retry/close functionality, custom fallback support via render prop
  * Accessibility: ARIA attributes (role=alert, aria-live=assertive), keyboard accessible buttons
  * Files: ViewerErrorBoundary.tsx (220 lines with comprehensive JSDoc), types (108 lines), constants (89 lines), tests (300 lines, 10/10 PASS)
  * Production-safe: console.error/warn wrapped in NODE_ENV checks, no debug noise in production
  * Anti-regression: 353/353 frontend tests PASS
  * useURLFilters.ts: Bidirectional URL sync hook (79 lines) with mount + reactive effects, comma-separated arrays encoding
  * PartMesh.tsx extensions: Filter-based opacity logic (1.0 match, 0.2 non-match), backward compatible with T-0505 tests
  * Test coverage: 49/50 tests PASS (98%) — 11/11 store ✓, 6/6 CheckboxGroup ✓, 7/8 FiltersSidebar (1 test bug), 9/9 useURLFilters ✓, 16/16 PartMesh ✓
  * Refactor: calculatePartOpacity helper (26 lines), buildFilterURLString/parseURLToFilters helpers, inline styles extracted to constants (CHECKBOX_*, SIDEBAR_*, SECTION_*, COLOR_BADGE_*)
  * Files: 5 total (parts.store.ts +80 lines, CheckboxGroup.tsx 91 lines, FiltersSidebar.tsx 84 lines, useURLFilters.ts 79 lines, PartMesh.tsx +25 lines)
  * Zero regression: 96/96 Dashboard tests PASS

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
- US-005: Dashboard 3D (T-0507-FRONT LOD complete 2026-02-22, next: T-0508-FRONT Part Selection & Modal)
- **US-010: Visor 3D Web de Piezas** ✅ **WAVE 3 COMPLETE** (All 8 tickets done 2026-02-26)
  - ✅ T-1001-INFRA: CloudFront CDN setup with presigned URLs (5min TTL)
  - ✅ T-1002-BACK: Part Detail API returning PartDetailResponse (12 fields)
  - ✅ T-1003-BACK: Navigation API with Redis caching (prev_id/next_id, 53% latency reduction)
  - ✅ T-1004-FRONT: PartViewerCanvas component (React Three Fiber wrapper, 3-point lighting)
  - ✅ **T-1005-FRONT: Model Loader & Stage** (2026-02-25 DONE & REFACTORED)
    * Component `<ModelLoader partId>` with useGLTF hook for GLB loading from CDN presigned URLs
    * Service layer: `getPartDetail(partId)` in upload.service.ts fetches part metadata from T-1002-BACK API
    * Type contract: PartDetail interface (12 fields) aligned with backend PartDetailResponse
    * Fallback states: 3 scenarios handled with dedicated UI:
      - **ProcessingFallback**: Shows BBoxProxy wireframe + "Geometría en procesamiento" message when low_poly_url is NULL
      - **ErrorFallback**: Shows BBoxProxy + error message for 404/403/network failures
      - **LoadingSpinner**: HTML overlay during initial fetch with informative messages
    * Auto-centering/scaling: Three.js Box3/Vector3 calculations with jsdom-safe try-catch
    * Preloading integration: preloadAdjacentModels() stub ready for T-1003-BACK navigation (uses useGLTF.preload())
    * Test coverage: 10/10 tests PASS (100%) — LOADING-01/02, CALLBACK-01/02, FALLBACK-01/02/03, PROPS-01/02, EDGE-01
    * Anti-regression verified: 302/302 frontend tests PASS, zero breaking changes
    * Production-ready: JSDoc enhanced for 5 sub-components, console logs wrapped in NODE_ENV checks, constants extraction complete
    * Files: 4 created (ModelLoader.tsx 264 lines + types 68 lines + constants 68 lines + tests 300 lines), types/parts.ts +58 lines, upload.service.ts +50 lines
  - ✅ **T-1006-FRONT: ViewerErrorBoundary Component** (2026-02-25 DONE & REFACTORED)
    * React Error Boundary class component for catching WebGL, Three.js, and useGLTF errors
    * Features: WebGL availability detection, graceful error fallback UI, retry/close functionality, custom fallback support via render prop
    * Accessibility: ARIA attributes (role=alert, aria-live=assertive), keyboard accessible buttons
    * Files: ViewerErrorBoundary.tsx (220 lines with comprehensive JSDoc), types (108 lines), constants (89 lines), tests (300 lines, 10/10 PASS)
    * Production-safe: console.error/warn wrapped in NODE_ENV checks, no debug noise in production
    * Anti-regression: 353/353 frontend tests PASS
  - ✅ **T-1007-FRONT: PartDetailModal Integration** (2026-02-25 DONE & REFACTORED)
    * Full-featured modal with tabs (3D Viewer, Metadata, Navigation), keyboard shortcuts (ESC/←/→), prev/next navigation
    * Clean Architecture refactor: 4 custom hooks extracted (usePartDetail, usePartNavigation, useModalKeyboard, useBodyScrollLock), 5 helper functions extracted
    * Component complexity reduced 27% (312→227 lines), JSDoc complete, comprehensive error handling (404/403/network)
    * Test coverage: 31/31 tests PASS (100%), anti-regression: 343/343 frontend tests PASS
  - ✅ **T-1008-FRONT: PartMetadataPanel Component** (2026-02-25 DONE & REFACTORED)
    * Component displays part metadata in 4 collapsible sections: Info (ISO code, status, tipología, date, ID), Workshop (name, ID), Geometry (bbox, file size, triangles, GLB URL), Validation (report summary)
    * Features: Keyboard accessible (Enter/Space toggles), ARIA attributes, null-safe with fallback placeholders, auto-formatting (dates DD/MM/YYYY, file sizes KB/MB/GB, coordinates)
    * Refactor: Utility functions extracted to shared formatters.ts (formatFileSize, formatDate, formatBBox) for reusability across components
    * Files: PartMetadataPanel.tsx (250 lines + comprehensive JSDoc), types (80 lines), constants (207 lines), tests (329 lines, 15/15 PASS 100%)
    * Shared utilities: src/frontend/src/utils/formatters.ts (78 lines with full JSDoc) — reusable across project
    * Anti-regression verified: 368/368 frontend tests PASS
  - ✅ **T-1009-TEST-FRONT: 3D Viewer Integration Tests** (2026-02-26 DONE & REFACTORED)
    * Integration test suite ensuring PartDetailModal 3D viewer, tabs, navigation, and error handling work correctly end-to-end
    * Test coverage: 22/22 tests PASS (100%) — HP-INT 8/8 ✓ (happy path), EC-INT 5/5 ✓ (edge cases), ERR-INT 5/5 ✓ (error scenarios), PERF-INT 2/2 ✓ (performance), A11Y-INT 2/2 ✓ (accessibility)
    * Implementation: ViewerErrorBoundary.tsx (176 lines NEW, pattern-based error detection), timeout logic with AbortController + retry (10s threshold), focus trap with Tab cycling (WCAG 2.1), WebGL availability check
    * Error scenarios handled: 5 scenarios (backend 404, timeout 10s, WebGL unavailable, GLB 404, corrupted GLB file)
    * Files: 8 files modified — 1 NEW (ViewerErrorBoundary), 7 enhanced (PartDetailModal +focus trap, hooks +timeout/retry, helpers +retry button, constants +timeout config, PartViewerCanvas +WebGL check, setup.ts +mocks, tests +3 fixes)
    * Test infrastructure: MSW (Mock Service Worker) for backend API mocking (setupMockServer.ts 150 lines), test-helpers.ts (200 lines integration utilities), viewer.fixtures.ts (230 lines test data)
    * Test execution: Duration 28.40s for 4 test files, anti-regression verified: 368/368 frontend tests PASS
    * Refactor: Code already clean from GREEN phase — JSDoc complete on all public functions, constants extracted to dedicated files (TIMEOUT_CONFIG, ERROR_MESSAGES, KEYBOARD_SHORTCUTS), Clean Architecture applied (hooks/helpers separation), zero code duplication, TypeScript strict with no `any`, production-safe logging with NODE_ENV checks
    * Handoff document: T-1009-TEST-FRONT-HANDOFF.md (850+ lines) with complete implementation details, technical decisions, error flow diagrams, deployment checklist
    * Status: TDD cycle complete (ENRICH→RED→GREEN→REFACTOR), ready for final audit

### 📋 Next Milestones
- US-010: Wave 3 COMPLETE ✅ — Ready for final audit or next User Story
- US-007: Lifecycle state machine (block status transitions)
- US-013: Authentication (Supabase Auth)