---
name: domain-model
description: "Diseña el Modelo Conceptual de Dominio Agnóstico (DDD Aggregates, Bounded Contexts, Value Objects, Domain Events, Transiciones de Estado y Diagrama de Clases Mermaid) antes de la arquitectura física."
version: "3.1.0"
category: "02_architecture_design"
inputs:
  - "docs/01_product_definition/02_prd.md"
  - "docs/01_product_definition/01_glosario_y_reglas_negocio.md"
outputs:
  - "docs/02_architecture_design/03_domain_model.md"
---

# 🧠 SK-03: Modelo Conceptual de Dominio Agnóstico (v3.1.0)

Actúa como un **Domain-Driven Design (DDD) Specialist** y **Domain Architect**.

Tu objetivo es analizar el PRD (`docs/01_product_definition/02_prd.md`) y el Glosario de Dominio (`docs/01_product_definition/01_glosario_y_reglas_negocio.md`) para modelar las entidades puras, objetos de valor (Value Objects), agregados (Aggregates) y diagramas en `docs/02_architecture_design/03_domain_model.md`.

---

## 🚫 Non-Goals de Ejecución del Agente (Guards)

Durante la ejecución de este skill, el agente TIENE PROHIBIDO:
1. **No mencionar librerías o frameworks:** Prohibido hacer referencia a cualquier framework, ORM, motor de base de datos o lenguaje concreto (ej. Express, React, Node.js, Prisma, PostgreSQL, SQL) — el modelo de dominio es 100% agnóstico a la implementación, incluso antes de que el stack se decida en `SK-04`.
2. **No incluir detalles de transporte:** No definir endpoints HTTP, JSON payloads ni cabeceras REST.
3. **No escribir código de implementación:** No crear archivos `.ts` ni clases ejecutables en disco.
4. **No generar sintaxis Mermaid sin escapar:** Prohibido usar paréntesis `()`, corchetes `[]` o barras `/` en las etiquetas de los nodos sin encerrar la cadena en comillas dobles.
5. **Exigencia de Precisión Decimal en Value Objects:** Prohibido usar tipos primitivos de coma flotante (`number` o `float`) para representar cantidades físicas o dinero; exigir definición explícita de precisión de 4 decimales (`Decimal(12,4)`) para evitar errores de redondeo IEEE 754.

---

## 🔄 Pipeline de Ejecución Secuencial por Fases

### 📍 Fase 1: Bounded Contexts, Aggregates, Value Objects & Eventos (5-10 min)
- **Acciones:**
  1. **Límites de Contexto (Bounded Contexts):** Agrupar el modelo de negocio en sus contextos operativos (ej. *Auth Context*, *Inventory Context*, *Kitchen Context*).
  2. **Entidades & Raíces de Agregado (*Aggregate Roots*):** Mapear las entidades usando estrictamente el Lenguaje Ubicuo del Glosario de Negocio.
  3. **Value Objects:** Definir conceptos numéricos con precisión explícita (`Decimal` a 4 decimales para cantidades y montos) e invariantes inmutables.
  4. **Eventos de Dominio (Domain Events):** Listar los sucesos críticos emitidos por el negocio (ej. `StockDescontadoEvent`, `RemanenteExpiradoEvent`).

---

### 📍 Fase 2: Diagramado de Clases, Transiciones de Estado & Guardado GFM (5-10 min)
- **Acciones:**
  1. **Diagrama de Clases (`mermaid classDiagram`):** Dibujar el modelo de clases conceptual con sus relaciones de agregación y asociación.
  2. **Máquinas de Estado (`mermaid stateDiagram-v2`):** Dibujar el ciclo de vida de los agregados clave con estados prohibidos.
  3. **Guardado:** Escribir el documento final en `docs/02_architecture_design/03_domain_model.md`.

---

## 📌 Formato de Salida y Cabecera GFM

El archivo generado en `docs/02_architecture_design/03_domain_model.md` debe comenzar estrictamente con:

```markdown
---
document: domain_model
version: 1.0.0
status: approved
inputs:
  - docs/01_product_definition/02_prd.md
  - docs/01_product_definition/01_glosario_y_reglas_negocio.md
---

# 🧠 Modelo Conceptual de Dominio Agnóstico

> **Navegación del Framework SDD:**  
> [⬅️ Volver al PRD (02_prd.md)](../../../../docs/01_product_definition/02_prd.md) | [📖 Glosario & Reglas](../../../../docs/01_product_definition/01_glosario_y_reglas_negocio.md) | [Siguiente: Diseño Técnico (04_technical_design.md) ➡️](./04_technical_design.md)

---
```
