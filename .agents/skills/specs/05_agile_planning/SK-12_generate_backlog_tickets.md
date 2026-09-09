---
name: backlog-tickets
description: "Desglosa las Historias de Usuario en tickets técnicos atómicos de backend y frontend (máximo 5 SP), Definition of Done (DoD), Matriz Multidimensional de Priorización Cualitativa e instrucciones de ejecución autónoma para agentes IA."
version: "3.1.0"
category: "05_agile_planning"
inputs:
  - "docs/01_product_definition/02_prd.md"
  - "docs/05_agile_planning/11_user_stories/"
  - "docs/02_architecture_design/04_technical_design.md"
  - "docs/03_persistence_and_api/06_database_schema.md"
  - "docs/03_persistence_and_api/07_api_specification.md"
outputs:
  - "docs/05_agile_planning/12_tickets/{modulo}/backend/TK-XXX.md"
  - "docs/05_agile_planning/12_tickets/{modulo}/frontend/TK-XXX-FE.md"
  - "docs/05_agile_planning/12_tickets/indice_tickets.md"
---

# 🎟️ SK-12: Desglose de Tickets Técnicos, Priorización Cualitativa e Instrucciones para IA (v3.1.0)

Actúa como un **Principal Software Architect** y **Technical Lead** experto en descomposición de tareas ágiles, evaluación de prioridades de negocio, arquitectura hexagonal en slices verticales y preparación de tickets listos para ejecución autónoma por agentes de IA codificadores.

Tu objetivo es analizar las Historias de Usuario (`docs/05_agile_planning/11_user_stories/`), la Arquitectura (`docs/02_architecture_design/04_technical_design.md`) y la Persistencia (`docs/03_persistence_and_api/06_database_schema.md`) para estructurar los Tickets Técnicos Atómicos ($\le 5\text{ SP}$) y generar el Índice del Sprint Backlog en `docs/05_agile_planning/12_tickets/12_indice_tickets.md` con su **Matriz Multidimensional de Criterios de Priorización Cualitativa**.

---

## 🚫 Non-Goals de Ejecución del Agente (Guards)

Durante la ejecución de este skill, el agente TIENE PROHIBIDO:
1. **No exceder 5 Story Points por ticket:** Prohibido crear tickets gigantes o monolíticos; si una tarea supera 5 SP, debe dividirse obligatoriamente en submódulos atómicos.
2. **No mezclar Backend y Frontend en un mismo ticket:** Separar estrictamente los tickets de Backend (persistencia, dominio, API REST, validación de esquemas) de los tickets de Frontend (componentes UI, ergonomía 48px, estado offline).
3. **No omitir las capas Hexagonales:** Cada ticket debe declarar explícitamente qué capas (`Domain`, `Application`, `Infrastructure`) afectará la solución.
4. **No omitir el Guard de Precisión Decimal:** Todo ticket que trate con saldos, pesos o cantidades debe exigir la librería de precisión de punto fijo declarada en `docs/00_stack_manifest.md` (nunca `Float`/`Double` nativo).
5. **Cabecera Frontmatter YAML y Navegación GFM Obligatorias:** Todo ticket DEBE comenzar con bloque Frontmatter YAML y barra de navegación lineal.
6. **Bloque de Autonomía IA Obligatorio:** Todo ticket DEBE incluir la sección final `🤖 Instrucciones de Ejecución Autónoma para Agente IA` indicando archivos a editar, comandos TDD y comandos de verificación declarados en `AGENTS.md`.

---

## 🔄 Pipeline de Ejecución Secuencial en 4 Pasos

### 📍 Paso 0: Tickets Habilitadores de Core e Infraestructura Monorepo
Antes de desglosar historias de usuario de negocio, generar en `docs/05_agile_planning/12_tickets/shared/`:
- `shared/backend/TK-001.md`: Ticket de infraestructura Core Backend (Estructura de proyecto, runtime, ORM/persistencia, middlewares de validación y runner de pruebas unitarias declarados en `04_technical_design.md`).
- `shared/frontend/TK-001-FE.md`: Ticket de infraestructura Core Frontend (Estructura de UI, sistema de estilos/tokens, diseño responsivo/táctil y runner de pruebas de interfaz declarados en `04_technical_design.md`).

### 📍 Paso 1: Desglose por Slice Vertical (Backend vs. Frontend)
Para cada Historia de Usuario (`US-XXX`), generar:
- **Ticket Backend (`TK-XXX.md`):** Persistencia, entidades de dominio, DTOs con el validador declarado en el stack manifest y endpoints REST.
- **Ticket Frontend (`TK-XXX-FE.md`):** Componentes visuales táctiles, 4 estados de UI (*Loading*, *Ready*, *Empty*, *Error*), resiliencia local e integración API.

### 📍 Paso 2: Evaluación Multidimensional Cualitativa
Para cada ticket, evaluar los 4 Criterios de Priorización:
1. **Impacto en Usuario y Valor Negocio:** *Muy Alto*, *Alto*, *Medio*, *Bajo*.
2. **Urgencia de Mercado y Feedback:** *Muy Alta*, *Alta*, *Media*, *Baja*.
3. **Complejidad y Esfuerzo Estimado:** Story Points (1, 2, 3, 5, 8).
4. **Riesgos y Dependencias Técnicas Críticas:** Nivel de prioridad (*P0 - Bloqueante*, *P0 - Crítica*, *P1 - Alta*, *P2 - Media*).

### 📍 Paso 3: Publicación del Índice y Fichas Técnicas
1. Generar la **Matriz Multidimensional de Priorización Cualitativa** e Índice General en `docs/05_agile_planning/12_tickets/12_indice_tickets.md`.
2. Incluir en cada ticket la estructura completa con el bloque de ejecución autónoma para la IA.

---

## 📌 Formato Estándar Homologado de Ticket Técnico (`TK-XXX.md`)

```markdown
---
document: technical_ticket
id: TK-XXX
related_story: US-XXX
points: 3
type: backend | frontend
status: approved
inputs:
  - docs/05_agile_planning/11_user_stories/{modulo}/US-XXX.md
  - docs/02_architecture_design/04_technical_design.md
---

# 🎟️ TK-XXX: [Título Descriptivo del Ticket Técnico]

> **Navegación del Framework SDD:**  
> [⬅️ Volver a US-XXX (11_user_stories/{modulo}/US-XXX.md)](../../11_user_stories/{modulo}/US-XXX.md) | [📖 Índice de Tickets (12_indice_tickets.md)](../12_indice_tickets.md) | [Siguiente: Matriz de Trazabilidad (13_matriz_trazabilidad.md) ➡️](../../13_matriz_trazabilidad.md)

---

## 📝 Descripción
[Descripción clara y concisa de la solución técnica a implementar]

*   **ID US Relacionada:** `US-XXX`
*   **Módulo / Vertical Slice:** `{modulo}`
*   **Estimación (Story Points):** X SP
*   **Prioridad MoSCoW:** Must Have | Should Have | Could Have
*   **Prerrequisitos:** `TK-001`, etc.

---

## 🔀 Alcance de Modificación (Hexagonal Layers)
*   **Domain:** [Entidades, Value Objects e Interfaces de Repositorio]
*   **Application:** [Casos de Uso e Intermediarios de Negocio]
*   **Infrastructure:** [Endpoints REST, esquemas de validación, ORM/persistencia / componentes UI — usando la librería/framework que declare `docs/00_stack_manifest.md`]

---

## ⚠️ Mitigación de Riesgos Técnicos
1. [Riesgo 1]: [Estrategia de Mitigación]
2. [Riesgo 2]: [Estrategia de Mitigación]

---

## ✅ Criterios de Aceptación & DoD (Definition of Done)
### Escenario 1 (Happy Path)
*   **Given** ...
*   **When** ...
*   **Then** ...

### DoD Estricto:
1. **TDD Compliance:** Desarrollar los tests con el runner/librería de testing declarado en `docs/00_stack_manifest.md` antes de la implementación.
2. **Precisión Aritmética:** Utilizar la librería de precisión de punto fijo declarada en el stack manifest en todas las cantidades físicas (nunca `Float`/`Double` nativo).
3. **Verificación Total:** Zero errores en los comandos de test, build y lint declarados en `AGENTS.md`.

---

## 🤖 Instrucciones de Ejecución Autónoma para Agente IA
1. **Fichas a crear/modificar:**
   - `apps/backend/src/modules/{modulo}/domain/...`
   - `apps/backend/src/modules/{modulo}/application/...`
   - `apps/backend/src/modules/{modulo}/infrastructure/...`
2. **Ejecutar TDD Suite:** comando de test declarado en `AGENTS.md`, acotado al módulo `{modulo}`.
3. **Comando de Verificación Total:** comandos de build y lint declarados en `AGENTS.md`.
```
