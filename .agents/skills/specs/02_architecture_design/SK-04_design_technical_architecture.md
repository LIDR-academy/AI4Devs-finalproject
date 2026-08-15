---
name: technical-design
description: "Diseña la especificación completa de Arquitectura de Sistema (Modelo C4 con sus 4 Niveles: Contexto Nivel 1, Contenedores Nivel 2, Componentes Nivel 3 y Código Nivel 4, Screaming Architecture, Vertical Slices basados en Bounded Contexts de SK-03, Capas Hexagonales) y Selección Justificada del Stack Tecnológico con evaluación de riesgos y protocolo HitL."
version: "3.2.0"
category: "02_architecture_design"
inputs:
  - "docs/01_product_definition/02_prd.md"
  - "docs/01_product_definition/01_glosario_y_reglas_negocio.md"
  - "docs/02_architecture_design/03_domain_model.md"
outputs:
  - "docs/02_architecture_design/04_technical_design.md"
---

# 🏛️ SK-04: Arquitectura de Sistema y Stack Tecnológico (v3.2.0)

Actúa como un **Senior Software & Systems Architect** experto en Spec-Driven Development (SDD), Modelo C4, Domain-Driven Design (DDD) y Arquitecturas Limpias.

Tu objetivo es analizar el PRD (`docs/01_product_definition/02_prd.md`), el Glosario (`docs/01_product_definition/01_glosario_y_reglas_negocio.md`) y el Modelo de Dominio (`docs/02_architecture_design/03_domain_model.md`), para diseñar el **Plano de Arquitectura de Sistema** en `docs/02_architecture_design/04_technical_design.md`.

---

## 🚫 Non-Goals de Ejecución del Agente (Guards)

Durante la ejecución de este skill, el agente TIENE PROHIBIDO:
1. **No escribir código fuente:** No crear archivos `.ts`, `.tsx`, `.js`, ni código de aplicación.
2. **No modelar base de datos en detalle:** El modelado 3NF y esquemas DDL/Prisma son responsabilidad exclusiva de **`SK-06_design_database_schema.md`**.
3. **No redactar contratos de API REST:** La especificación de endpoints y payloads JSON es responsabilidad exclusiva de **`SK-07_design_api_specification.md`**.
4. **No saltarse el protocolo HitL:** No guardar el documento en disco en la Fase 1 sin la confirmación explícita del humano sobre el Stack Tecnológico.
5. **No generar sintaxis Mermaid sin escapar:** Prohibido usar paréntesis `()`, corchetes `[]` o barras `/` en las etiquetas de los nodos sin encerrar la cadena en comillas dobles (`"..."`).

---

## 🔄 Pipeline de Ejecución Secuencial por Fases

El agente debe ejecutar este skill en exactamente **2 Fases Secuenciales atómicas**:

### 📍 Fase 1: Selección de Stack Tecnológico, Evaluación de Riesgos & Protocolo HitL (5-10 min)
- **Dependencias:** PRD (`docs/01_product_definition/02_prd.md`) y Modelo de Dominio (`docs/02_architecture_design/03_domain_model.md`).
- **Acciones:**
  1. Analizar los requerimientos del PRD y las invariantes/Value Objects definidos en el Modelo de Dominio (`03_domain_model.md`).
  2. Proponer la composición del Stack Tecnológico (Core Backend, Core Frontend, Persistencia/BD, Validaciones/Zod, Precisión de Dominio, Testing e Infraestructura).
  3. Redactar la Justificación Técnica, Trade-offs y Matriz de Riesgos (al menos 2 riesgos con su estrategia de mitigación).
  4. **Propuesta HitL de Diagramas de Secuencia:** Identificar autónomamente los 2-3 Casos de Uso del Dominio de mayor complejidad/transaccionalidad y proponerlos al usuario antes de documentarlos.
- **✋ PAUSA OBLIGATORIA (Human-in-the-Loop):** Presentar al USUARIO en consola: (a) La propuesta del Stack Tecnológico, (b) La Matriz de Riesgos y (c) La lista propuesta de Diagramas de Secuencia Críticos a generar. Esperar la aprobación o sugerencias de ajuste del humano antes de proceder a la Fase 2.
- **Estado Inmutable:** No crear archivos en disco durante esta fase.

---

### 📍 Fase 2: Generación Completa de Diagramas C4 (Nivel 1 al 4) & Screaming Architecture (10-15 min)
- **Dependencias:** Aprobación explícita del humano obtenida en la Fase 1.
- **Acciones:**
  1. **C4 Nivel 1 (Diagrama de Contexto):** Generar diagrama `mermaid graph TD` detallando los actores/personas, el sistema principal y sus interacciones de alto nivel.
  2. **C4 Nivel 2 (Diagrama de Contenedores):** Generar diagrama `mermaid graph TB` separando subgrafos de Presentación (Frontend UI), Procesamiento (Backend API/Core) y Persistencia (Base de Datos). Etiquetar protocolos y seguridad.
  3. **C4 Nivel 3 (Diagrama de Componentes - Screaming Architecture):** Mapear los Bounded Contexts definidos en `03_domain_model.md` a componentes físicos y capas Hexagonales (`Domain`, `Application`, `Infrastructure`) en un diagrama `mermaid graph TD`.
  4. **C4 Nivel 4 (Diagrama de Código, Entidades & Secuencia de Casos de Uso Críticos):** Renderizar:
     - Modelo de clases y entidades puras en un diagrama `mermaid classDiagram` vinculado a `03_domain_model.md`.
     - Diagrama `mermaid graph TD` de Topología de Despliegue Físico Docker (`resto_net`, contenedores Alpine, volúmenes de almacenamiento).
     - Diagramas de Secuencia `mermaid sequenceDiagram` para los casos de uso transaccionales o de negocio más complejos (ej. Consumo en Cascada FEFO, Cierre de Turno/Conciliación, Extracción con Cálculo de Caducidad Acelerada).
  5. **Definición de Responsabilidades por Capa Hexagonal:**
     - **Capa de Dominio (Domain):** Entidades puras, Value Objects, Domain Events e interfaces de puertos 100% agnósticos.
     - **Capa de Aplicación (Application):** Casos de uso específicos que orquestan los puertos.
     - **Capa de Infraestructura (Infrastructure):** Adaptadores concretos (routes HTTP, ORM Repositories).
  6. **Guardado:** Escribir el documento final en `docs/02_architecture_design/04_technical_design.md`.

---

## 📌 Formato de Salida y Cabecera GFM

El archivo generado en `docs/02_architecture_design/04_technical_design.md` debe comenzar estrictamente con el siguiente encabezado de navegación GFM:

```markdown
---
document: technical_design
version: 1.0.0
status: approved
inputs:
  - docs/01_product_definition/02_prd.md
  - docs/02_architecture_design/03_domain_model.md
---

# 🏛️ Especificación de Arquitectura de Sistema y Stack Tecnológico

> **Navegación del Framework SDD:**  
> [⬅️ Volver al Modelo de Dominio (03_domain_model.md)](./03_domain_model.md) | [📖 Glosario & Reglas](../../../../docs/01_product_definition/01_glosario_y_reglas_negocio.md) | [Siguiente: Sistema de Diseño UI/UX (05_ui_ux_design_system.md) ➡️](./05_ui_ux_design_system.md)

---
```
