---
name: traceability-matrix
description: "Audita la trazabilidad biyectiva End-to-End del sistema (regla de cero orfandad) y autogenera la Matriz de Trazabilidad SDD."
version: "3.1.0"
category: "05_agile_planning"
inputs:
  - "docs/01_product_definition/02_prd.md"
  - "docs/03_persistence_and_api/06_database_schema.md"
  - "docs/03_persistence_and_api/07_api_specification.md"
  - "docs/05_agile_planning/11_user_stories/"
  - "docs/05_agile_planning/12_tickets/"
outputs:
  - "docs/05_agile_planning/13_matriz_trazabilidad.md"
---

# 📊 SK-13: Matriz de Trazabilidad End-to-End (v3.1.0)

Actúa como un **Lead Quality & Governance Architect** experto en trazabilidad documental, gestión de requerimientos y auditoría de alineación entre especificaciones de negocio, esquemas de BD, contratos de API y tickets de trabajo.

Tu objetivo es cruzar verticalmente los artefactos del sistema para generar la Matriz de Trazabilidad oficial en `docs/05_agile_planning/13_matriz_trazabilidad.md`.

---

## 🚫 Non-Goals de Ejecución del Agente (Guards)

Durante la ejecución de este skill, el agente TIENE PROHIBIDO:
1. **Regla de Cero Orfandad:** Prohibido dejar tickets o requerimientos sueltos. Todo ticket técnico debe tener asignada al menos 1 Historia de Usuario (`US-XXX`) y 1 Endpoint REST o entidad de persistencia correspondiente.
2. **Prohibición de Datos Inconsistentes:** Toda entidad/tabla citada en la columna *Entidad de Persistencia* debe existir exactamente en `06_database_schema.md`.

---

## 🔄 Pipeline de Ejecución Secuencial en 3 Pasos

### 📍 Paso 1: Auditoría de Trazabilidad Vertical (Cross-Check)
1. Cruzar los Requerimientos (`REQ-XXX`) del PRD con las Historias de Usuario (`11_user_stories/`), los Tickets Técnicos (`12_tickets/`), los Modelos de Persistencia (`06_database_schema.md`) y los Endpoints REST (`07_api_specification.md`).
2. Verificar el estado de desarrollo de cada componente (`Done`, `In Progress`, `Pending`).

### 📍 Paso 2: Construcción de la Matriz End-to-End
1. Generar el archivo `docs/05_agile_planning/13_matriz_trazabilidad.md` con las columnas: `ID Req.`, `Módulo / Slice`, `Entidad de Persistencia`, `Endpoint REST`, `Historia de Usuario`, `Ticket Backend`, `Ticket Frontend`, `Estado` y `Skill de IA Asociada`.

### 📍 Paso 3: Validación de Cobertura
1. Confirmar que el 100% de los requerimientos del MVP tengan cobertura completa en backend y frontend.

---

## 📌 Formato de Salida y Cabecera GFM

El archivo generado en `docs/05_agile_planning/13_matriz_trazabilidad.md` debe incluir:

```markdown
---
document: matriz_trazabilidad
version: 1.2.0
status: approved
inputs:
  - docs/01_product_definition/02_prd.md
  - docs/02_architecture_design/04_technical_design.md
  - docs/03_persistence_and_api/06_database_schema.md
  - docs/03_persistence_and_api/07_api_specification.md
  - docs/05_agile_planning/11_user_stories/
  - docs/05_agile_planning/12_tickets/
---

# 📊 Matriz de Trazabilidad End-to-End (Verified Spec-Driven Development - VSDD)

> **Navegación del Framework SDD:**  
> [⬅️ Volver a Índice de Tickets (12_tickets/12_indice_tickets.md)](./12_tickets/12_indice_tickets.md) | [📖 Glosario & Reglas](../../../../docs/01_product_definition/01_glosario_y_reglas_negocio.md) | [Siguiente: Mapa Jerárquico del Backlog (14_backlog_map.md) ➡️](./14_backlog_map.md)

---
```
