# Sagrada Família Parts Manager (SF-PM)

> **Digital Twin Activo para Gestión de Inventario de Piezas CAD con Validación Inteligente**

![Estado del Proyecto](https://img.shields.io/badge/Status-In%20Development-yellow)
![Documentación](https://img.shields.io/badge/Docs-100%25-green)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 📋 Descripción del Proyecto

**Sagrada Família Parts Manager (SF-PM)** es un sistema enterprise que transforma archivos CAD estáticos (Rhino .3dm) en un **gemelo digital activo** para la gestión integral del inventario de decenas de miles de piezas únicas de la Sagrada Família de Barcelona.

El sistema desacopla metadata crítica de geometría pesada (archivos de hasta 500MB), permitiendo acceso instantáneo, validación automática mediante agentes IA ("The Librarian"), y visualización 3D web de alto rendimiento. La Oficina Técnica obtiene una **Single Source of Truth** para el ciclo de vida completo de cada pieza (Diseñada → Validada → En Fabricación → Completada → Instalada).

### 🎯 Problemas que Resuelve

- ✅ **Búsquedas en segundos vs. horas**: De 3 horas/día a 10 minutos buscando información de piezas
- ✅ **Validación automática**: Detección instantánea de nomenclaturas inválidas (ISO-19650) antes de ingresar al sistema
- ✅ **Trazabilidad completa**: Audit trail inmutable de cada cambio (quién, qué, cuándo) para compliance patrimonial
- ✅ **Visualización 3D en navegador**: Inspección interactiva de geometría compleja sin software CAD instalado
- ✅ **Eliminación de errores logísticos**: Del 40% al 0% de piezas enviadas al taller incorrecto

### 🛠️ Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Three.js + Zustand + Vite → Vercel CDN
- **Backend**: FastAPI (Python) + Celery Workers + Redis Queue → Railway
- **AI/ML**: LangGraph + OpenAI GPT-4 Turbo (Agente "The Librarian")
- **Database**: Supabase (PostgreSQL 15 + Auth + Realtime WebSockets)
- **Storage**: S3-compatible buckets (quarantine/raw/processed)
- **CAD Processing**: rhino3dm + glTF/GLB mesh conversion

---

## 📚 Documentación Completa

La documentación técnica está organizada en **7 fases** que siguen la metodología de desarrollo de producto:

### Fase 1: Análisis y Estrategia
[📘 01-strategy.md](./01-strategy.md)
- Definición del problema (Data Gravity Problem)
- Propuesta de valor cuantificada
- Visión del producto y componentes de la solución

### Fase 2: Definición del Producto (PRD)
[📘 02-prd.md](./02-prd.md)
- 4 User Personas detalladas (BIM Manager, Arquitecto, Taller, Gestora Materiales)
- Agente "The Librarian" (validación activa con IA)
- Feature Map del MVP (6 funcionalidades prioritarias)
- Wireframes conceptuales de interfaces
- Roadmap con criterios de aceptación técnicos
- 14 User Stories completas (Happy Paths + Error Paths)

### Fase 3: Modelo de Servicio
[📘 03-service-model.md](./03-service-model.md)
- Lean Canvas adaptado para producto enterprise
- Análisis de riesgos y mitigación
- Propuesta de valor por segmento de usuario

### Fase 4: Casos de Uso y Arquitectura de Flujos
[📘 04-use-cases.md](./04-use-cases.md)
- 3 Casos de Uso Maestros (CU-01 Ingesta, CU-02 Gestión, CU-03 Trazabilidad)
- Diagramas Mermaid de flujo (Flowcharts + Sequence Diagrams)
- Mapeo de 14 User Stories a casos de uso
- Matriz de dependencias críticas

### Fase 5: Modelo de Datos
[📘 05-data-model.md](./05-data-model.md)
- Esquema PostgreSQL/Supabase con 8 tablas
- Diagrama ER (Entity-Relationship) completo
- Row Level Security (RLS) policies por rol
- Estrategia JSONB híbrida para metadata flexible
- Índices optimizados (GIN, B-tree)
- Triggers y migraciones

### Fase 6: Arquitectura de Alto Nivel
[📘 06-architecture.md](./06-architecture.md)
- Diagrama C4 Container (6 capas: Client, API, Worker, Data, Storage, External)
- Definición de componentes con tech stacks
- 4 Patrones arquitectónicos aplicados (Event-Driven, Presigned URLs, Event Sourcing, CQRS)
- Flujo crítico: Ingesta de archivo (25 pasos con Sequence Diagram)
- Diagrama de Deployment con costos ($235/mes MVP)
- Decisiones técnicas justificadas
- Estrategias de resiliencia (Retry, Circuit Breaker, DLQ, Health Checks)
- Seguridad Defense-in-Depth (4 capas)

### Fase 7: Diseño en Profundidad - Agente "The Librarian"
[📘 07-agent-design.md](./07-agent-design.md)
- Diagrama C4 Component (Level 3) del agente de validación IA
- Arquitectura interna: 7 componentes (State Manager, Syntax Validator, Geometry Extractor, etc.)
- Grafo de estado LangGraph (stateDiagram-v2) con 8 nodos
- Implementación de cada nodo con código Python completo
- Manejo de errores (Circuit Breaker, Retry con backoff exponencial, Fallback graceful)
- Testing: Unit tests + Integration tests
- Observabilidad: Logs estructurados JSON + métricas

---

## � Technical Documentation by User Story

### 🟢 US-001: Upload Flow (COMPLETED ✅)
**Status:** COMPLETED & AUDITED (2026-02-11) | **Story Points:** 5 SP

Upload de archivos .3dm con drag & drop, validación client-side, y upload directo a Supabase Storage.

📂 **[US-001 Technical Docs](US-001/)** 

**Tickets Completed:**
- T-001-FRONT: UploadZone Component ✅ (14/14 tests)
- T-002-BACK: Generate Presigned URL ✅ (7/7 tests)
- T-003-FRONT: Upload Manager ✅ (4/4 tests)
- T-004-BACK: Confirm Upload Webhook ✅ (7/7 tests)
- T-005-INFRA: S3 Bucket Setup ✅

**Features Delivered:**
- Drag & drop interface with react-dropzone@14.2.3
- Client-side validation (MIME type + extension .3dm)
- 500MB file size limit
- Direct upload to Supabase Storage (presigned URLs)
- Progress tracking and error handling
- Clean Architecture pattern (service layer)

---

### 🔵 US-002: The Librarian - Validation System (IN PROGRESS 🔄)
**Status:** IN PROGRESS | **Story Points:** 13 SP | **Priority:** 🔴 CRITICAL

Validación automática de archivos .3dm con reporte detallado de errores de nomenclatura ISO-19650 y geometría.

📂 **[US-002 Technical Docs](US-002/)** - Specs, audits & implementation docs

**Tickets Completed:**
- ✅ **T-020-DB:** Add Validation Report Column ([Spec](US-002/T-020-DB-TechnicalSpec.md) | [Audit](US-002/AUDIT-T-020-DB-FINAL.md))
  - JSONB column `validation_report` in `blocks` table
  - GIN indexes for efficient error filtering
  - 4/4 integration tests passing
  - Migration: `20260211160000_add_validation_report.sql`
  - Status: APPROVED FOR CLOSURE (94.5% compliance)

**Tickets Specified (Ready for TDD):**
- 📋 **T-021-DB:** Extend Block Status Enum ([Spec](US-002/T-021-DB-TechnicalSpec.md))
  - Add 3 new values: `processing`, `rejected`, `error_processing`
  - PostgreSQL ENUM extension pattern
  - Migration: `20260212100000_extend_block_status_enum.sql`
  - 14 test cases defined, estimated 1.5 hours
  - Blocks: T-024-AGENT, T-026-AGENT, T-031-FRONT
  
- 📋 **T-025-AGENT:** User Strings Extraction ([Spec](US-002/T-025-AGENT-UserStrings-Spec.md))
  - 46 user strings documented in 9 enums
  - Pydantic schemas + TypeScript interfaces defined
  - Ready for implementation

**Tickets Pending:**
- T-022-INFRA: Redis & Celery Worker
- T-023-TEST: .3dm Test Fixtures
- T-024-AGENT: Rhino Ingestion Service
- T-026-AGENT: Nomenclature Validator
- T-027-AGENT: Geometry Auditor
- T-028-BACK: Validation Report Model
- T-029-BACK: Trigger Validation Job
- T-030-BACK: Get Validation Status
- T-031-FRONT: Real-Time Listener
- T-032-FRONT: Report Visualizer
- T-033-INFRA: Logging & Monitoring

---

## �🚀 Getting Started

> **Nota**: Esta sección será completada en la siguiente fase de desarrollo (implementación del MVP).

### Prerrequisitos
- Node.js 18+ (Frontend)
- Python 3.11+ (Backend)
- Docker (opcional, para desarrollo local)

### Instalación

> **Nota**: Esta sección será completada en la siguiente fase de desarrollo (implementación del MVP). Actualmente el proyecto se encuentra en fase de diseño y documentación.

<!--
Las instrucciones de instalación se habilitarán una vez comience el desarrollo:
- Clonar repositorio
- Instalar dependencias
- Configurar .env
-->

### Deployment

El proyecto está configurado para deployment automático:
- **Frontend**: Vercel (CDN global)
- **Backend + Workers**: Railway ($10/mes tier Starter)
- **Database**: Supabase Pro ($25/mes)
- **Storage**: Supabase Storage o Backblaze B2

Ver [06-architecture.md](./06-architecture.md#diagrama-de-deployment-infraestructura) para detalles completos de infraestructura.

---

## 🧪 Testing

```bash
# Tests unitarios frontend
cd frontend && npm test

# Tests unitarios backend
cd backend && pytest tests/

# Tests de integración del Agente "The Librarian"
pytest tests/integration/test_librarian_workflow.py

# Tests end-to-end (Playwright)
npx playwright test
```

---

## 📊 Estado del Proyecto

### Hitos Completados

- ✅ **FASE 1-7**: Documentación técnica completa (3600+ líneas)
- ✅ Arquitectura Cloud-Native diseñada
- ✅ Agente "The Librarian" especificado a nivel de código
- ✅ Modelo de datos PostgreSQL con RLS
- ✅ Wireframes de interfaces clave (Dashboard, Upload, Visor 3D)

### Siguiente Hito

- 🔲 **FASE 8**: Implementación del MVP
  - [ ] Setup de proyecto (monorepo Turborepo)
  - [ ] Backend FastAPI con endpoints básicos
  - [ ] Frontend React con Dashboard
  - [ ] Integración Supabase Auth + Database
  - [ ] Implementación de The Librarian Agent (LangGraph)
  - [ ] Visor 3D con Three.js
  - [ ] Deploy a Vercel + Railway

---

## 👥 Equipo

**Proyecto Académico - TFM (Trabajo Fin de Máster)**

- **Autor**: Pedro Cortés
- **Director**: Álvaro Viebrantz / Carlos Blé
- **Institución**: AI4Devs Academy
- **Año**: 2026

### Colaboradores Técnicos (Consultores Externos)

- **Arquitectura BIM**: Oficina Técnica Sagrada Família (Simulado)
- **Validación de UX**: BIM Manager Lead
- **Revisión de Stack**: AI4Devs Mentors

---

## 📄 Licencia

Este proyecto es un TFM académico con datos simulados de la Sagrada Família. El código será open-source (MIT License) pero los datos reales de la Basílica no están incluidos por acuerdos de confidencialidad.

**Disclaimer**: "Sagrada Família Parts Manager" es un proyecto educativo. Cualquier uso comercial requiere licencias apropiadas de geometría CAD y aprobación de la **Fundació Junta Constructora del Temple Expiatori de la Sagrada Família**.

---

## 📞 Contacto

- **Email del Proyecto**: [Ver repositorio oficial]
- **LinkedIn**: [linkedin.com/in/pedrocortes](https://linkedin.com/in/pedrocortes)
- **GitHub**: [@pedrocortesark](https://github.com/pedrocortesark)

---

## 🙏 Agradecimientos

- **Fundació Sagrada Família**: Por permitir el uso del caso de estudio (simulado)
- **McNeel (Rhino3D)**: Por la librería rhino3dm open-source
- **Comunidad LangChain/LangGraph**: Por frameworks de orquestación de agentes IA

---

<p align="center">
  <i>Construido con ❤️ para la gestión del patrimonio arquitectónico mundial</i>
</p>
