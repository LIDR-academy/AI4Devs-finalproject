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
