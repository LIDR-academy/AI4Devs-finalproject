# Sagrada Familia Parts Manager (SF-PM)

> **Digital Twin Activo para Gestion de Inventario de Piezas CAD con Validacion Inteligente**

![Estado del Proyecto](https://img.shields.io/badge/Status-In%20Development-yellow)
![Documentacion](https://img.shields.io/badge/Docs-100%25-green)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## Descripcion del Proyecto

**SF-PM** transforma archivos CAD estaticos (Rhino .3dm) en un **gemelo digital activo** para la gestion integral del inventario de piezas unicas de la Sagrada Familia de Barcelona. Desacopla metadata critica de geometria pesada (archivos de hasta 500MB), validacion automatica via agentes IA ("The Librarian"), y visualizacion 3D web.

### Stack Tecnologico
- **Frontend**: React 18 + TypeScript + Three.js + Zustand + Vite
- **Backend**: FastAPI (Python) + Celery Workers + Redis Queue
- **AI/ML**: LangGraph + OpenAI GPT-4 Turbo
- **Database**: Supabase (PostgreSQL 15 + Auth + Realtime WebSockets)
- **Storage**: S3-compatible buckets (quarantine/raw/processed)
- **CAD Processing**: rhino3dm + glTF/GLB mesh conversion

---

## Documentacion Tecnica

La documentacion esta organizada en **7 fases** de desarrollo de producto:

| Fase | Documento | Contenido |
|---|---|---|
| 1. Estrategia | [01-strategy.md](01-strategy.md) | Problema, propuesta de valor, vision |
| 2. PRD | [02-prd.md](02-prd.md) | 4 personas, 14 user stories, feature map, wireframes |
| 3. Servicio | [03-service-model.md](03-service-model.md) | Lean Canvas, riesgos, metricas |
| 4. Casos de Uso | [04-use-cases.md](04-use-cases.md) | 3 CU maestros, diagramas Mermaid, dependencias |
| 5. Datos | [05-data-model.md](05-data-model.md) | 8 tablas PostgreSQL, RLS, JSONB, indices |
| 6. Arquitectura | [06-architecture.md](06-architecture.md) | C4 Container, 4 patrones, deployment |
| 7. Agente | [07-agent-design.md](07-agent-design.md) | The Librarian: LangGraph, 7 componentes, testing |

### Backlog
- [08-roadmap.md](08-roadmap.md) — Roadmap de 4 sprints
- [09-mvp-backlog.md](09-mvp-backlog.md) — Tickets con specs y acceptance criteria

---

## User Stories

| US | Nombre | Status | Docs |
|---|---|---|---|
| US-001 | Upload Flow | COMPLETED (2026-02-11) | [US-001/](US-001/) |
| US-002 | The Librarian | IN PROGRESS (2/14) | [US-002/](US-002/) |

---

## Equipo

**Proyecto Academico - TFM (Trabajo Fin de Master)**

- **Autor**: Pedro Cortes
- **Director**: Alvaro Viebrantz / Carlos Ble
- **Institucion**: AI4Devs Academy
- **Ano**: 2026

---

## Licencia

Proyecto TFM academico con datos simulados de la Sagrada Familia. Codigo open-source (MIT License). Los datos reales de la Basilica no estan incluidos por acuerdos de confidencialidad.

---

<p align="center">
  <i>Construido para la gestion del patrimonio arquitectonico mundial</i>
</p>
