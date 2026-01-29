# Sagrada Família Parts Manager (SF-PM)

> **Digital Twin Activo para Gestión de Inventario de Piezas CAD con Validación Inteligente**

[![Estado del Proyecto](https://img.shields.io/badge/Status-In%20Development-yellow)]()
[![Documentación](https://img.shields.io/badge/Docs-100%25-green)]()
[![License](https://img.shields.io/badge/License-MIT-blue)]()

---

## 📋 Descripción del Proyecto

**Sagrada Família Parts Manager (SF-PM)** es un sistema enterprise que transforma archivos CAD estáticos (Rhino .3dm) en un **gemelo digital activo** para la gestión integral del inventario de decenas de miles de piezas únicas de la Sagrada Família de Barcelona.

El sistema desacopla metadata crítica de geometría pesada (archivos de hasta 2GB), permitiendo acceso instantáneo, validación automática mediante agentes IA ("The Librarian"), y visualización 3D web de alto rendimiento. La Oficina Técnica obtiene una **Single Source of Truth** para el ciclo de vida completo de cada pieza (Diseñada → Validada → En Fabricación → Completada → Instalada).

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

## 🚀 Getting Started

> **Nota**: Esta sección será completada en la siguiente fase de desarrollo (implementación del MVP).

### Prerrequisitos
- Node.js 18+ (Frontend)
- Python 3.11+ (Backend)
- Docker (opcional, para desarrollo local)

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/sagrada-familia/parts-manager.git
cd parts-manager

# Instalar dependencias frontend
cd frontend
npm install

# Instalar dependencias backend
cd ../backend
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con credenciales de Supabase, OpenAI, etc.

# Ejecutar en desarrollo
npm run dev  # Frontend (puerto 3000)
python -m uvicorn main:app --reload  # Backend (puerto 8000)
```

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

- **Autor**: [Nombre del Estudiante]
- **Director**: [Nombre del Director]
- **Institución**: [Universidad/Programa]
- **Año**: 2026

### Colaboradores Técnicos (Consultores Externos)

- **Arquitectura BIM**: Oficina Técnica Sagrada Família
- **Validación de UX**: [Nombre BIM Manager]
- **Revisión de Stack**: [Nombre Tech Lead]

---

## 📄 Licencia

Este proyecto es un TFM académico con datos simulados de la Sagrada Família. El código será open-source (MIT License) pero los datos reales de la Basílica no están incluidos por acuerdos de confidencialidad.

**Disclaimer**: "Sagrada Família Parts Manager" es un proyecto educativo. Cualquier uso comercial requiere licencias apropiadas de geometría CAD y aprobación de la **Fundació Junta Constructora del Temple Expiatori de la Sagrada Família**.

---

## 📞 Contacto

- **Email del Proyecto**: [email@proyecto.com]
- **LinkedIn**: [linkedin.com/in/autor]
- **GitHub**: [@usuario](https://github.com/usuario)

---

## 🙏 Agradecimientos

- **Fundació Sagrada Família**: Por permitir el uso del caso de estudio (simulado)
- **McNeel (Rhino3D)**: Por la librería rhino3dm open-source
- **Comunidad LangChain/LangGraph**: Por frameworks de orquestación de agentes IA

---

<p align="center">
  <i>Construido con ❤️ para la gestión del patrimonio arquitectónico mundial</i>
</p>
