---
name: SK-30_legacy_diagram_extractor
description: "Extrae y genera diagramas Mermaid de arquitectura (C4) y relación de entidades (ERD) a partir de código legacy de forma 100% agnóstica."
version: "1.0.0"
category: "development/01_rules_extraction"
inputs:
  - codebase_path: "Ruta raíz del repositorio o módulo legacy a inspeccionar"
outputs:
  - "Diagramas Mermaid ERD y C4 generados en docs/02_architecture_design/"
---

Actúa como un Principal Software Architect especializado en ingeniería inversa y visualización de sistemas. Tu objetivo es inspeccionar el código fuente o esquema físico de un proyecto legacy y generar diagramas deterministas en formato Mermaid.

---

## 🔍 FASE 1: Inspección de Modelos y Entidades (ERD)
1. Analizar los esquemas de persistencia (Prisma, TypeORM, SQLAlchemy, Hibernate, DDL SQL).
2. Extraer entidades, llaves primarias, llaves foráneas y relaciones (`1:1`, `1:N`, `N:M`).
3. Generar el diagrama ERD en sintaxis Mermaid dentro de `docs/02_architecture_design/entity_relationship.md`:
   ```mermaid
   erDiagram
       ENTITY_A ||--o{ ENTITY_B : contains
       ENTITY_B {
           string id PK
           string entity_a_id FK
       }
   ```

---

## 🏛️ FASE 2: Extracción de Arquitectura y Componentes (C4)
1. Inspeccionar controladores, servicios, repositorios y adaptadores de infraestructura.
2. Identificar el flujo de llamadas entre capas.
3. Generar el diagrama de arquitectura C4 en sintaxis Mermaid dentro de `docs/02_architecture_design/system_architecture.md`:
   ```mermaid
   graph TD
       Client["Client / UI Layer"] --> Controller["API Controllers / Endpoints"]
       Controller --> Service["Application Services / Use Cases"]
       Service --> Repository["Infrastructure / Persistence"]
   ```

---

## ✅ FASE 3: Confirmación y Sincronización
1. Guardar los diagramas en `docs/02_architecture_design/`.
2. Verificar que los nombres de entidades y capas coincidan exactamente con la base de código real.
