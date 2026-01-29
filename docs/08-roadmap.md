# FASE 8: Roadmap de Implementación Técnica

**Documento**: Roadmap Técnico - Sagrada Familia Parts Manager  
**Versión**: 1.0  
**Fecha**: 28 de Enero de 2026  
**Autor**: Tech Lead - AI4Devs Team  

---

## 📋 Tabla de Contenidos

1. [Visión General del Roadmap](#visión-general-del-roadmap)
2. [Sprint 0: Walking Skeleton](#sprint-0-walking-skeleton)
3. [Sprint 1: The Core (Ingesta)](#sprint-1-the-core-ingesta)
4. [Sprint 2: The Librarian (Agente)](#sprint-2-the-librarian-agente)
5. [Sprint 3: The Viewer (Visualización)](#sprint-3-the-viewer-visualización)
6. [Definition of Done (DoD)](#definition-of-done-dod)
7. [Estrategia de Testing](#estrategia-de-testing)
8. [Métricas de Progreso](#métricas-de-progreso)

---

## Visión General del Roadmap

### Objetivo
Transformar la documentación técnica (Fases 1-7) en un sistema funcional desplegable en **4 Sprints incrementales** de 2 semanas cada uno, siguiendo la filosofía de **"Working Software over Comprehensive Documentation"**.

### Principios de Implementación
1. **Incremental Value**: Cada sprint entrega funcionalidad desplegable end-to-end.
2. **Risk First**: Los componentes más críticos y complejos se implementan primero (Walking Skeleton → Agent → Viewer).
3. **Testability**: Cada sprint incluye tests automatizados (unit + integration).
4. **Feedback Loops**: Deploy a staging al finalizar cada sprint para validación temprana.

### Stack Tecnológico (Confirmado)
- **Backend**: FastAPI (Python 3.11+), Poetry, Pydantic v2
- **Frontend**: React 18, TypeScript, Vite, TanStack Query, Zustand
- **Agent**: LangGraph, LangChain, OpenAI GPT-4, rhino3dm (Python)
- **Database**: Supabase (PostgreSQL + Storage + Auth)
- **3D Rendering**: Three.js (r160+), React Three Fiber, GLB format
- **Infrastructure**: Docker Compose (dev), Docker (prod), GitHub Actions (CI/CD)
- **Monitoring**: Sentry (errors), Supabase Analytics

---

## Sprint 0: Walking Skeleton
**Duración**: 2 semanas  
**Goal**: Infraestructura desplegable con conectividad probada entre todos los componentes (Frontend → Backend → Database → Agent).

### 🎯 Objetivos
Implementar el "esqueleto andante" del sistema: una arquitectura mínima funcional que conecte todos los componentes sin lógica de negocio real. Esto permite validar la configuración de infraestructura antes de añadir complejidad.

### 📦 Entregables

#### 1. **Setup de Repositorio**
- [ ] Crear estructura de carpetas del monorepo (backend/, frontend/, agent/, shared/)
- [ ] Configurar `.gitignore` multi-proyecto (Python, Node, IDE, Docker)
- [ ] Configurar `.editorconfig` y `.prettierrc` para consistencia de código
- [ ] Configurar GitHub Actions workflows (lint, test, build)

#### 2. **Backend - FastAPI Base**
- [ ] Inicializar proyecto Poetry (`pyproject.toml`)
  - Dependencias: `fastapi`, `uvicorn`, `supabase`, `pydantic`, `python-dotenv`
- [ ] Crear `app/main.py` con FastAPI app base
- [ ] Configurar CORS middleware
- [ ] Implementar health check endpoint: `GET /health`
  ```json
  {
    "status": "ok",
    "service": "sagrada-familia-backend",
    "version": "0.1.0",
    "timestamp": "2026-01-28T10:00:00Z"
  }
  ```
- [ ] Crear `app/config.py` para variables de entorno
- [ ] Configurar logging estructurado (structlog)
- [ ] Crear Dockerfile multi-stage (dev + prod)

#### 3. **Frontend - React + Vite Base**
- [ ] Inicializar proyecto Vite con template React-TS
- [ ] Configurar `package.json` con scripts (dev, build, test, lint)
  - Dependencias: `react`, `react-dom`, `@tanstack/react-query`, `zustand`, `axios`
- [ ] Crear layout básico (Header + Sidebar + Content)
- [ ] Implementar componente `HealthCheck.tsx` que llame a `/health`
- [ ] Configurar cliente API con Axios (`src/services/api.ts`)
- [ ] Configurar variables de entorno (`.env.example`)
- [ ] Crear Dockerfile con Nginx para servir build estático

#### 4. **Agent - Python Worker Base**
- [ ] Inicializar proyecto Poetry independiente
  - Dependencias: `langgraph`, `langchain`, `openai`, `supabase`
- [ ] Crear `librarian/main.py` con función dummy de validación
- [ ] Implementar logging y error handling básico
- [ ] Crear Dockerfile

#### 5. **Supabase - Setup Database**
- [ ] Crear proyecto en Supabase Cloud (o instancia local con Docker)
- [ ] Configurar autenticación (deshabilitada temporalmente para MVP)
- [ ] Crear esquema inicial con tabla `health_check`:
  ```sql
  CREATE TABLE health_check (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checked_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL
  );
  ```
- [ ] Configurar Storage bucket: `parts-uploads`
- [ ] Guardar credenciales en `.env` de cada servicio

#### 6. **Docker Compose - Orquestación Local**
- [ ] Crear `docker-compose.yml` con servicios:
  - `backend` (puerto 8000)
  - `frontend` (puerto 5173)
  - `agent` (sin puerto, solo worker)
  - `supabase-db` (PostgreSQL local opcional)
- [ ] Crear `docker-compose.dev.yml` con hot-reload volumes
- [ ] Documentar comandos en `README.md`:
  ```bash
  docker-compose up --build
  ```

#### 7. **Testing End-to-End**
- [ ] Test manual: `curl http://localhost:8000/health`
- [ ] Test manual: Abrir `http://localhost:5173` y ver dashboard vacío
- [ ] Test automatizado: Script que valide conectividad entre servicios
  ```bash
  ./infrastructure/scripts/test-connectivity.sh
  ```

### ✅ Criterios de Aceptación (DoD)
- [ ] `docker-compose up` levanta todos los servicios sin errores
- [ ] Frontend renderiza y llama al backend exitosamente
- [ ] Backend responde a `/health` con JSON válido
- [ ] Backend se conecta a Supabase (consulta a `health_check` tabla)
- [ ] Agent puede ejecutar una tarea dummy y loguear resultado
- [ ] CI/CD pipeline pasa (lint + build)
- [ ] Documentación actualizada en `README.md` con instrucciones de setup

### 🛠️ Tareas Técnicas Detalladas

#### Backend (Tareas)
1. `poetry init` y añadir dependencias base
2. Crear `app/main.py`:
   ```python
   from fastapi import FastAPI
   from app.config import settings
   
   app = FastAPI(title="SF Parts Manager API", version="0.1.0")
   
   @app.get("/health")
   async def health_check():
       return {"status": "ok", "service": "backend"}
   ```
3. Crear `app/config.py` usando `pydantic-settings`
4. Configurar cliente Supabase en `app/services/db_service.py`
5. Test: `pytest tests/test_health.py`

#### Frontend (Tareas)
1. `pnpm create vite frontend --template react-ts`
2. Instalar dependencias: `pnpm add @tanstack/react-query zustand axios`
3. Crear `src/services/api.ts`:
   ```typescript
   import axios from 'axios';
   
   export const api = axios.create({
     baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000'
   });
   ```
4. Crear componente `HealthCheck.tsx` con fetch a `/health`
5. Test: `pnpm test` (Vitest)

#### Agent (Tareas)
1. `poetry init` en `agent/`
2. Crear `librarian/main.py`:
   ```python
   from langgraph.graph import Graph
   
   def validate_dummy(state):
       return {"status": "validated"}
   
   graph = Graph()
   graph.add_node("validate", validate_dummy)
   ```
3. Test: `pytest tests/test_graph.py`

---

## Sprint 1: The Core (Ingesta)
**Duración**: 2 semanas  
**Goal**: Implementar la funcionalidad completa de carga de archivos `.3dm`, extracción de metadata básica, y almacenamiento en Supabase.

### 🎯 Objetivos
Permitir que un usuario suba un archivo Rhino (`.3dm`), extraer su metadata (nombre de capas, cantidad de objetos), y almacenar tanto el archivo como los metadatos en Supabase. Esta es la funcionalidad core del sistema sin validación inteligente aún.

### 📦 Entregables

#### 1. **Backend - Upload Endpoint**
- [ ] Crear endpoint `POST /api/v1/parts/upload`
  - Acepta `multipart/form-data` con archivo `.3dm`
  - Validaciones: tamaño máximo (500MB), extensión `.3dm`
  - Retorna ID de pieza creada y URL de archivo
- [ ] Implementar servicio `StorageService`:
  ```python
  async def upload_file(file: UploadFile) -> str:
      """Sube archivo a Supabase Storage y retorna URL pública."""
  ```
- [ ] Implementar servicio `GeometryService` (wrapper de `rhino3dm`):
  ```python
  def extract_metadata(file_path: str) -> dict:
      """Extrae metadata básica del archivo .3dm sin cargar geometría completa."""
      # - Nombre de archivo
      # - Número de capas
      # - Número de objetos
      # - Dimensiones del bounding box
      # - Fecha de creación (si está en metadata)
  ```
- [ ] Implementar modelo `Part` (SQLAlchemy/Pydantic):
  ```python
  class PartCreate(BaseModel):
      original_filename: str
      file_url: str
      metadata: dict
  
  class PartResponse(PartCreate):
      id: UUID
      status: Literal["uploaded", "validating", "validated", "rejected"]
      created_at: datetime
  ```
- [ ] Guardar registro en tabla `parts` de Supabase
- [ ] Implementar error handling (archivo corrupto, timeout, etc.)

#### 2. **Frontend - Upload UI**
- [ ] Crear componente `UploadZone.tsx` (drag & drop)
  - Librería: `react-dropzone`
  - Indicador de progreso de subida
  - Preview de archivo seleccionado (nombre, tamaño)
- [ ] Crear hook `useUpload.ts`:
  ```typescript
  const { upload, progress, error } = useUpload();
  
  const handleUpload = async (file: File) => {
    const result = await upload(file);
    // Actualiza store con nueva pieza
  };
  ```
- [ ] Integrar con `partsStore` (Zustand) para actualizar lista en tiempo real
- [ ] Mostrar notificación de éxito/error (componente `Toast`)
- [ ] Validaciones frontend: tamaño de archivo, extensión

#### 3. **Database - Schema Parts**
- [ ] Crear migración de Supabase:
  ```sql
  CREATE TABLE parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_filename TEXT NOT NULL,
    file_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'uploaded',
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  
  CREATE INDEX idx_parts_status ON parts(status);
  CREATE INDEX idx_parts_created_at ON parts(created_at DESC);
  ```
- [ ] Configurar Storage bucket policies (público para lectura, autenticado para escritura)

#### 4. **Backend - List Parts Endpoint**
- [ ] Crear endpoint `GET /api/v1/parts`
  - Paginación: `?page=1&limit=20`
  - Filtros: `?status=uploaded`
  - Ordenamiento: `?sort=created_at:desc`
  - Retorna lista de piezas con metadata resumida

#### 5. **Frontend - Parts List View**
- [ ] Crear componente `PartsList.tsx` (tabla o grid)
- [ ] Mostrar:
  - Nombre de archivo
  - Estado (badge con color)
  - Fecha de subida
  - Número de objetos (desde metadata)
- [ ] Implementar paginación
- [ ] Implementar filtro por estado

#### 6. **Testing**
- [ ] **Backend**:
  - Test unitario: `test_extract_metadata()` con archivo `.3dm` de prueba
  - Test integración: `test_upload_endpoint()` con mock de Supabase
- [ ] **Frontend**:
  - Test unitario: `UploadZone.test.tsx` simula drag & drop
  - Test E2E (Playwright): Subir archivo y verificar que aparece en lista

### ✅ Criterios de Aceptación (DoD)
- [ ] Usuario puede arrastrar un archivo `.3dm` a la UI
- [ ] Archivo se sube a Supabase Storage correctamente
- [ ] Metadata se extrae y guarda en tabla `parts`
- [ ] Lista de piezas muestra el archivo recién subido
- [ ] Endpoint `/api/v1/parts` retorna datos paginados
- [ ] Tests automatizados pasan (coverage >80%)
- [ ] Documentación API actualizada (OpenAPI/Swagger)

### 🛠️ Tareas Técnicas Detalladas

#### Backend (Estimaciones)
| Tarea | Horas | Responsable |
|-------|-------|-------------|
| Implementar `StorageService` | 4h | Backend Dev |
| Implementar `GeometryService` (rhino3dm) | 8h | Backend Dev |
| Crear endpoint `/upload` | 4h | Backend Dev |
| Crear endpoint `/parts` (list) | 3h | Backend Dev |
| Tests unitarios + integración | 6h | Backend Dev |
| **TOTAL** | **25h** | |

#### Frontend (Estimaciones)
| Tarea | Horas | Responsable |
|-------|-------|-------------|
| Componente `UploadZone` | 5h | Frontend Dev |
| Hook `useUpload` | 3h | Frontend Dev |
| Componente `PartsList` | 4h | Frontend Dev |
| Integración Zustand store | 2h | Frontend Dev |
| Tests E2E (Playwright) | 4h | Frontend Dev |
| **TOTAL** | **18h** | |

---

## Sprint 2: The Librarian (Agente)
**Duración**: 2 semanas  
**Goal**: Integrar el agente de validación inteligente basado en LangGraph. Las piezas subidas deben pasar por validación automática.

### 🎯 Objetivos
Implementar el componente más diferenciador del sistema: **The Librarian**. El agente debe procesar archivos subidos, validar nomenclaturas según ISO-19650, analizar geometría, y enriquecer metadatos usando LLMs. El resultado es un cambio de estado de la pieza: `uploaded` → `validated` o `rejected`.

### 📦 Entregables

#### 1. **Agent - LangGraph Implementation**
- [ ] Diseñar grafo de estados según `docs/07-agent-design.md`
- [ ] Implementar nodos del grafo:
  - **Node 1: Metadata Validation** (`metadata_validation.py`)
    - Verifica que existan campos obligatorios
    - Valida formato de nombres de capas
  - **Node 2: Nomenclature Check** (`nomenclature_check.py`)
    - Aplica reglas ISO-19650 (regex)
    - Llama a LLM para validación semántica de nombres
    - System Prompt:
      ```
      You are an ISO-19650 compliance validator for the Sagrada Familia construction project.
      
      Task: Validate if the layer name follows ISO-19650 naming conventions.
      
      Layer name: {layer_name}
      
      Rules:
      1. Must follow pattern: [Building]-[Floor]-[Element]-[Number]
      2. Building codes: SF-NAV (Nave), SF-FAC (Fachada), SF-TOR (Torre)
      3. Element codes: DOV (Dovela), BLO (Bloque), COL (Columna)
      
      Return JSON:
      {
        "valid": true/false,
        "error_message": "...",
        "suggested_fix": "..."
      }
      ```
  - **Node 3: Geometry Analysis** (`geometry_analysis.py`)
    - Carga archivo `.3dm` con `rhino3dm`
    - Extrae volumen, dimensiones, número de vértices
    - Valida que geometría no esté corrupta
  - **Node 4: Enrichment** (`enrichment.py`)
    - Llama a LLM para clasificar tipología (Piedra/Hormigón/Metal)
    - Infiere peso estimado basado en volumen y material
    - System Prompt:
      ```
      You are a construction materials expert for the Sagrada Familia.
      
      Task: Classify this architectural element and estimate its properties.
      
      Metadata:
      - Layer name: {layer_name}
      - Volume: {volume_m3} m³
      - Dimensions: {width} x {height} x {depth} cm
      
      Return JSON:
      {
        "tipologia": "PIEDRA" | "HORMIGON" | "METAL",
        "peso_estimado_kg": 1500,
        "material_especifico": "Piedra de Montjuïc",
        "confidence": 0.95
      }
      ```
  - **Node 5: Final Verdict** (`final_verdict.py`)
    - Compila resultados de nodos anteriores
    - Decide estado final: `validated` o `rejected`
    - Genera report JSON con detalles de validación

- [ ] Implementar state management:
  ```python
  from typing import TypedDict, Literal
  
  class ValidationState(TypedDict):
      part_id: str
      file_path: str
      metadata: dict
      nomenclature_valid: bool
      geometry_valid: bool
      enriched_data: dict
      errors: list[str]
      final_status: Literal["validated", "rejected"]
  ```

- [ ] Implementar `graph/builder.py`:
  ```python
  from langgraph.graph import StateGraph
  
  def build_validation_graph():
      graph = StateGraph(ValidationState)
      
      graph.add_node("metadata_validation", metadata_validation_node)
      graph.add_node("nomenclature_check", nomenclature_check_node)
      graph.add_node("geometry_analysis", geometry_analysis_node)
      graph.add_node("enrichment", enrichment_node)
      graph.add_node("final_verdict", final_verdict_node)
      
      # Edges condicionales
      graph.add_conditional_edges(
          "metadata_validation",
          lambda state: "nomenclature_check" if state["metadata"] else "final_verdict"
      )
      
      graph.set_entry_point("metadata_validation")
      graph.set_finish_point("final_verdict")
      
      return graph.compile()
  ```

#### 2. **Backend - Integration con Agent**
- [ ] Crear endpoint `POST /api/v1/validation/trigger`
  - Recibe `part_id`
  - Encola tarea de validación (Redis Queue o similar)
  - Retorna `job_id`
- [ ] Implementar `AgentService` (`services/agent_service.py`):
  ```python
  async def trigger_validation(part_id: UUID) -> str:
      """Encola tarea de validación para el agente."""
      job = queue.enqueue('librarian.main.validate_part', part_id)
      return job.id
  ```
- [ ] Implementar worker que ejecuta el grafo:
  ```python
  # agent/workers/validation_worker.py
  def validate_part(part_id: str):
      # 1. Descargar archivo .3dm desde Supabase Storage
      # 2. Ejecutar grafo LangGraph
      # 3. Actualizar estado en DB con resultado
      # 4. Guardar report en Storage
  ```
- [ ] Crear tabla `validation_events` para audit trail:
  ```sql
  CREATE TABLE validation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_id UUID REFERENCES parts(id),
    event_type TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

#### 3. **Frontend - Validation Status UI**
- [ ] Añadir badge de estado en `PartCard.tsx`:
  - `uploaded`: Badge azul
  - `validating`: Badge amarillo (spinner)
  - `validated`: Badge verde (checkmark)
  - `rejected`: Badge rojo (X)
- [ ] Crear componente `ValidationReport.tsx`:
  - Muestra detalles del reporte de validación
  - Errores encontrados
  - Sugerencias de corrección
  - Datos enriquecidos (tipología, peso)
- [ ] Implementar polling o WebSocket para actualizar estado en tiempo real

#### 4. **Agent - Error Handling**
- [ ] Implementar retry logic para llamadas a LLM (max 3 intentos)
- [ ] Timeouts: 60s por nodo
- [ ] Fallback: Si LLM falla, marcar como `requires_manual_review`
- [ ] Logging estructurado con contexto (part_id, node_name, timestamp)

#### 5. **Testing**
- [ ] **Agent**:
  - Test unitario de cada nodo con estado mock
  - Test integración: Ejecutar grafo completo con archivo `.3dm` de prueba
  - Test de manejo de errores (archivo corrupto, LLM timeout)
- [ ] **Backend**:
  - Test endpoint `/validation/trigger`
  - Mock de agent service

### ✅ Criterios de Aceptación (DoD)
- [ ] Al subir un archivo, se dispara validación automáticamente
- [ ] Agente procesa archivo y actualiza estado en DB
- [ ] Frontend muestra estado de validación en tiempo real
- [ ] Report de validación es accesible desde UI
- [ ] Piezas rechazadas muestran razón específica
- [ ] Tests de integración pasan (grafo completo)
- [ ] Agent maneja errores sin crashear

### 🛠️ Tareas Técnicas Detalladas

#### Agent (Estimaciones)
| Tarea | Horas | Responsable |
|-------|-------|-------------|
| Implementar grafo LangGraph | 12h | AI Engineer |
| Nodo 1: Metadata Validation | 4h | AI Engineer |
| Nodo 2: Nomenclature Check (LLM) | 6h | AI Engineer |
| Nodo 3: Geometry Analysis (rhino3dm) | 8h | AI Engineer |
| Nodo 4: Enrichment (LLM) | 6h | AI Engineer |
| Nodo 5: Final Verdict | 3h | AI Engineer |
| Error handling + retry logic | 5h | AI Engineer |
| Tests unitarios + integración | 8h | AI Engineer |
| **TOTAL** | **52h** | |

#### Backend (Estimaciones)
| Tarea | Horas | Responsable |
|-------|-------|-------------|
| Endpoint `/validation/trigger` | 3h | Backend Dev |
| Integración con queue (Redis/RQ) | 4h | Backend Dev |
| Worker implementation | 5h | Backend Dev |
| Tabla `validation_events` | 2h | Backend Dev |
| Tests | 4h | Backend Dev |
| **TOTAL** | **18h** | |

---

## Sprint 3: The Viewer (Visualización)
**Duración**: 2 semanas  
**Goal**: Implementar el visor 3D interactivo con Three.js para visualizar piezas individuales y conjunto completo.

### 🎯 Objetivos
Permitir que usuarios visualicen modelos 3D de piezas directamente en el navegador. Incluye conversión de `.3dm` a `.glb` (formato optimizado), renderizado con Three.js usando instancing para alto rendimiento, y controles de cámara (orbit, zoom, pan).

### 📦 Entregables

#### 1. **Backend - Conversión 3DM → GLB**
- [ ] Implementar servicio de conversión geométrica:
  ```python
  # app/services/geometry_converter.py
  async def convert_3dm_to_glb(input_path: str, output_path: str):
      """
      Convierte archivo .3dm a .glb usando rhino3dm.
      
      Optimizaciones:
      - Reducción de polígonos (LOD)
      - Compresión Draco
      - Tamaño máximo: 10MB
      """
  ```
- [ ] Ejecutar conversión como tarea asíncrona (Celery/RQ)
- [ ] Almacenar `.glb` en Supabase Storage:
  - Bucket: `parts-glb`
  - Estructura: `{part_id}/model.glb`
- [ ] Añadir campo `glb_url` a tabla `parts`
- [ ] Crear endpoint `GET /api/v1/parts/{id}/preview`
  - Retorna URL del archivo `.glb`

#### 2. **Frontend - Three.js Viewer**
- [ ] Instalar dependencias:
  ```bash
  pnpm add three @react-three/fiber @react-three/drei
  ```
- [ ] Crear componente `ThreeViewer.tsx`:
  ```typescript
  interface ThreeViewerProps {
    modelUrl: string;
    enableControls?: boolean;
    backgroundColor?: string;
  }
  
  export const ThreeViewer: React.FC<ThreeViewerProps> = ({
    modelUrl,
    enableControls = true,
    backgroundColor = '#f0f0f0'
  }) => {
    return (
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={<Loader />}>
          <GLBModel url={modelUrl} />
        </Suspense>
        {enableControls && <OrbitControls />}
      </Canvas>
    );
  };
  ```
- [ ] Crear componente `GLBModel.tsx`:
  ```typescript
  import { useGLTF } from '@react-three/drei';
  
  export const GLBModel = ({ url }: { url: string }) => {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
  };
  ```
- [ ] Añadir controles:
  - Orbit (rotar con mouse)
  - Zoom (rueda del mouse)
  - Pan (click derecho + arrastrar)
  - Reset cámara (botón)

#### 3. **Frontend - Part Detail View**
- [ ] Crear vista `PartDetailPage.tsx`:
  - Header con nombre de pieza y estado
  - Visor 3D (ocupa 70% del viewport)
  - Panel lateral con metadata:
    - Tipología
    - Dimensiones
    - Peso estimado
    - Estado de validación
    - Botón "Descargar .3dm original"
- [ ] Integrar con router:
  ```typescript
  <Route path="/parts/:id" element={<PartDetailPage />} />
  ```

#### 4. **Frontend - Instanced Scene Viewer (Bonus)**
- [ ] Crear vista de conjunto (opcional para MVP):
  - Renderiza múltiples piezas simultáneamente
  - Usa `InstancedMesh` de Three.js para optimizar rendimiento
  - Permite seleccionar pieza individual (raycast)

#### 5. **Backend - Batch Conversion**
- [ ] Crear script para convertir piezas existentes:
  ```bash
  python scripts/batch_convert.py --status=validated
  ```
- [ ] Progress tracking en DB (tabla `conversion_jobs`)

#### 6. **Testing**
- [ ] **Backend**:
  - Test unitario: `test_convert_3dm_to_glb()` con archivo de prueba
  - Validar que `.glb` generado es válido
- [ ] **Frontend**:
  - Test visual: Screenshot testing con Playwright
  - Test de rendimiento: Medir FPS con 100+ piezas instanciadas

### ✅ Criterios de Aceptación (DoD)
- [ ] Usuario puede hacer clic en una pieza y ver modelo 3D
- [ ] Visor carga `.glb` en <3 segundos
- [ ] Controles de cámara funcionan correctamente
- [ ] Conversión `.3dm` → `.glb` se ejecuta automáticamente
- [ ] Metadata se muestra junto al visor
- [ ] Visor funciona en Chrome, Firefox, Safari
- [ ] Performance >30 FPS con modelos de 5MB

### 🛠️ Tareas Técnicas Detalladas

#### Backend (Estimaciones)
| Tarea | Horas | Responsable |
|-------|-------|-------------|
| Implementar `geometry_converter.py` | 10h | Backend Dev |
| Configurar Celery para conversión async | 4h | Backend Dev |
| Endpoint `/preview` | 2h | Backend Dev |
| Batch conversion script | 3h | Backend Dev |
| Tests | 4h | Backend Dev |
| **TOTAL** | **23h** | |

#### Frontend (Estimaciones)
| Tarea | Horas | Responsable |
|-------|-------|-------------|
| Componente `ThreeViewer` | 8h | Frontend Dev |
| Componente `GLBModel` + loader | 4h | Frontend Dev |
| Controles de cámara | 3h | Frontend Dev |
| Vista `PartDetailPage` | 5h | Frontend Dev |
| Integración con API | 3h | Frontend Dev |
| Performance optimization | 4h | Frontend Dev |
| Tests (screenshot + E2E) | 4h | Frontend Dev |
| **TOTAL** | **31h** | |

---

## Definition of Done (DoD)

### Para Cada Sprint
- [ ] **Funcional**: Todas las historias de usuario están implementadas y funcionando
- [ ] **Testeable**: Tests automatizados pasan (coverage mínimo 80%)
- [ ] **Documentado**: README actualizado con nuevas instrucciones
- [ ] **Deployable**: Puede desplegarse a staging sin errores
- [ ] **Revisado**: Code review aprobado por al menos 1 reviewer
- [ ] **Memoria Actualizada**: Memory Bank actualizado (systemPatterns.md, progress.md, decisions.md)

### Para Todo el Proyecto (Final Sprint 3)
- [ ] **Performance**: Backend responde <500ms (P95)
- [ ] **Performance**: Frontend carga inicial <2s
- [ ] **Security**: Variables sensibles en `.env` (no hardcoded)
- [ ] **Monitoring**: Sentry configurado y enviando eventos
- [ ] **CI/CD**: GitHub Actions ejecuta tests en cada PR
- [ ] **Documentación Técnica**: OpenAPI/Swagger actualizado
- [ ] **Documentación Usuario**: Manual de uso básico

---

## Estrategia de Testing

### Pirámide de Testing
```
       /\
      /  \  E2E Tests (10%)
     /----\ Integration Tests (30%)
    /------\ Unit Tests (60%)
```

### Por Capa

#### Backend
- **Unit Tests** (pytest):
  - Servicios (StorageService, GeometryService)
  - Validadores (ISO-19650 regex)
  - Conversión `.3dm` → metadata
- **Integration Tests** (pytest + testcontainers):
  - Endpoints API con DB real (PostgreSQL test instance)
  - Supabase Storage (mock o test bucket)
- **E2E Tests** (Playwright):
  - Flow completo: Upload → Validación → Visualización

#### Frontend
- **Unit Tests** (Vitest):
  - Componentes aislados (UploadZone, PartCard)
  - Hooks (useUpload, useParts)
  - Utilidades (formatters, validators)
- **Integration Tests** (React Testing Library):
  - Flujos de usuario (subir archivo, ver lista)
- **Visual Tests** (Playwright + Percy):
  - Screenshots de visor 3D
  - Regression visual en componentes

#### Agent
- **Unit Tests** (pytest):
  - Cada nodo del grafo de forma aislada
  - Tools (iso_validator, geometry_analyzer)
- **Integration Tests**:
  - Grafo completo con archivo `.3dm` de prueba
  - Manejo de errores (LLM timeout, archivo corrupto)

### Fixtures de Prueba
- Archivo `.3dm` de prueba (10MB, geometría simple)
- Archivo `.3dm` corrupto (para tests de error handling)
- Archivo `.3dm` grande (500MB, para tests de performance)

---

## Métricas de Progreso

### Métricas Técnicas
| Métrica | Sprint 0 | Sprint 1 | Sprint 2 | Sprint 3 |
|---------|----------|----------|----------|----------|
| **API Endpoints** | 1 | 4 | 6 | 8 |
| **Test Coverage (Backend)** | 50% | 70% | 80% | 85% |
| **Test Coverage (Frontend)** | 40% | 65% | 75% | 80% |
| **Agent Nodes** | 0 | 0 | 5 | 5 |
| **DB Tables** | 1 | 3 | 5 | 6 |
| **Docker Services** | 3 | 3 | 4 | 4 |

### Métricas de Valor
| Métrica | Sprint 0 | Sprint 1 | Sprint 2 | Sprint 3 |
|---------|----------|----------|----------|----------|
| **User Stories Completadas** | 1 | 3 | 5 | 8 |
| **% Funcionalidad Core** | 10% | 40% | 80% | 100% |
| **Piezas Procesadas (Demo)** | 0 | 10 | 50 | 100 |

### Burn-Down Chart (Horas Estimadas)
```
Sprint 0: 60h (Setup)
Sprint 1: 80h (Core Features)
Sprint 2: 100h (Agent Implementation)
Sprint 3: 80h (Visualization)
---
TOTAL: 320h (~2 meses con equipo de 2-3 devs)
```

---

## Notas Finales

### Riesgos Identificados
1. **Rhino3dm Performance**: Conversión de archivos grandes puede ser lenta.
   - **Mitigación**: Implementar queue y procesamiento asíncrono desde Sprint 1.
2. **LLM Costs**: Llamadas a GPT-4 pueden ser costosas con alto volumen.
   - **Mitigación**: Cachear resultados de validación, usar GPT-3.5 donde sea posible.
3. **Three.js Performance**: Renderizar 1000+ piezas puede saturar GPU.
   - **Mitigación**: Implementar LOD (Level of Detail) y culling agresivo.

### Dependencias Externas
- **Supabase Cloud**: Requiere cuenta y proyecto configurado antes de Sprint 0.
- **OpenAI API Key**: Necesaria para Sprint 2 (agent).
- **Rhino3dm Library**: Validar compatibilidad con versiones recientes de archivos `.3dm`.

### Próximos Pasos (Post-Sprint 3)
- **Autenticación**: Integrar Supabase Auth (roles: Admin, Architect, Worker).
- **Notificaciones**: WebSockets para updates en tiempo real.
- **Reporting**: Dashboards con métricas de producción (piezas validadas/día).
- **Mobile**: Versión responsive optimizada para tablets en taller.

---

**Fin del Roadmap Técnico - Listo para Sprint 0** 🚀
