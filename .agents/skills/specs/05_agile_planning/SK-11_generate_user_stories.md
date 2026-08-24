---
name: user-stories
description: "Redacta el backlog de Historias de Usuario bajo la estructura de las 4 Preguntas Clave (Como/Cuando/Quiero/Para), Precondiciones, BDD Gherkin (Happy Path, Error Path, QA Edge Case), NFRs y checklist INVEST."
version: "3.1.0"
category: "05_agile_planning"
inputs:
  - "docs/01_product_definition/02_prd.md"
  - "docs/02_architecture_design/04_technical_design.md"
outputs:
  - "docs/05_agile_planning/11_user_stories/{modulo}/US-XXX.md"
  - "docs/05_agile_planning/11_user_stories/indice_user_stories.md"
---

# 📖 SK-11: Historias de Usuario Profesional INVEST y Criterios BDD (v3.1.0)

Actúa como un **Lead Agile Product Owner** y **Senior QA Automation Specialist** experto en marcos ágiles (Scrum/Kanban), especificación por comportamiento (BDD Gherkin) y análisis de casos borde (Edge Cases).

Tu objetivo es analizar minuciosamente el PRD (`docs/01_product_definition/02_prd.md`) y la Especificación Técnica (`docs/02_architecture_design/04_technical_design.md`) para estructurar el backlog de Historias de Usuario del MVP en `docs/05_agile_planning/11_user_stories/` siguiendo el estándar profesional de 4 Preguntas Clave, Precondiciones, Criterios BDD y Criterios No Funcionales (NFRs).

---

## 🚫 Non-Goals de Ejecución del Agente (Guards)

Durante la ejecución de este skill, el agente TIENE PROHIBIDO:
1. **No usar descripciones genéricas de usuario:** Prohibido usar "Como usuario...", exigir roles específicos con contexto operativo (ej. "Como Cocinero de Turno", "Como Administrador de Inventario").
2. **Estructura Obligatoria de 4 Preguntas:** Toda narrativa DEBE incluir la estructura completa:
   - **Como** `[rol específico de usuario]`
   - **Cuando** `[situación o trigger específico en el flujo de trabajo]`
   - **Quiero** `[realizar una acción o experimentar un comportamiento funcional]`
   - **Para** `[obtener un beneficio o valor medible para el negocio]`
3. **No omitir sintaxis BDD Gherkin:** Prohibido definir criterios de aceptación en texto informal; exigir strictly `Given` (Dado), `When` (Cuando), `Then` (Entonces).
4. **Mínimo 3 Escenarios BDD Obligatorios:** Toda Historia de Usuario DEBE incluir obligatoriamente 3 escenarios: Happy Path, Flujo de Error y QA Edge Case.
5. **Sección de Precondiciones (`🚦`) y NFRs (`🔒`) Obligatorios:** Toda ficha debe incluir precondiciones explícitas y requisitos no funcionales de Rendimiento ($<500\text{ms}$) y Ergonomía Táctil ($\ge 48\text{px}$).

---

## 🔄 Pipeline de Ejecución Secuencial en 3 Pasos

### 📍 Paso 1: Identificación y Estructuración INVEST de 4 Preguntas
1. Extraer las capacidades prioritarias del MVP desde `docs/01_product_definition/02_prd.md`.
2. Para cada historia, asignar un ID correlativo único (`US-001`, `US-002`...) y redactar la narrativa de 4 preguntas.
3. Validar cada historia frente al checklist **INVEST**.

### 📍 Paso 2: Especificación de Precondiciones, BDD Gherkin (3 Escenarios) y NFRs
1. Declarar la sección `🚦 Precondiciones`.
2. Definir los 3 escenarios BDD Gherkin con etiquetado (`@critical`, `@smoke`, `@edge`) y soporte de `Scenario Outline` con tablas `Examples:` para lógica combinatoria.
3. Exigir contrato **RFC 7807** en las cláusulas `Then` de todos los escenarios de error.
4. Declarar la sección `🔒 Criterios de Aceptación No Funcionales` (Rendimiento $<300\text{ms}$ y Ergonomía Táctil $\ge 48\text{px}$).

### 📍 Paso 3: Organización Documental por Módulos
1. Guardar cada historia en `docs/05_agile_planning/11_user_stories/{modulo}/US-XXX.md`.
2. Consolidar el índice general del backlog en `docs/05_agile_planning/11_user_stories/indice_user_stories.md`.

---

## 📌 Formato Estándar Homologado de Historia de Usuario (`US-XXX.md`)

```markdown
---
document: user_story
id: US-XXX
version: 1.1.0
status: approved
inputs:
  - docs/01_product_definition/02_prd.md
  - docs/02_architecture_design/04_technical_design.md
---

# 📖 US-XXX: [Título Descriptivo de la Historia]

> **Navegación del Framework SDD:**  
> [⬅️ Volver a CI/CD Pipeline (10_cicd_pipeline.md)](../../../../docs/04_governance_and_quality/10_cicd_pipeline.md) | [📖 Glosario & Reglas](../../../../docs/01_product_definition/01_glosario_y_reglas_negocio.md) | [Siguiente: Desglose de Tickets (12_tickets/indice_tickets.md) ➡️](../12_tickets/indice_tickets.md)

---

## 🗣️ Narrativa (Comportamiento y Negocio)
**Como** [rol específico de usuario],  
**Cuando** [situación o trigger específico en el flujo de trabajo],  
**Quiero** [realizar una acción o experimentar un comportamiento],  
**Para** [obtener un beneficio o valor medible para el negocio/usuario].

---

## 🚦 Precondiciones
- [Precondición 1: Sesión activa, PIN, permisos...]
- [Precondición 2: Estado del catálogo o almacén...]

---

## 🧪 Criterios de Aceptación (BDD Gherkin)

@critical @smoke
### Escenario 1: [Flujo Principal de Valor - Happy Path]
*   **Given** [contexto inicial de dominio]
*   **When** [acción ejecutada]
*   **Then** [resultado esperado verificable]
*   **And** [aserciones secundarias]

@critical
### Escenario 2: [Flujo de Error / Excepción con RFC 7807]
*   **Given** [contexto inicial]
*   **When** [intento inválido o fallo de infraestructura]
*   **Then** el sistema responde con error de status [HTTP STATUS]
*   **And** la respuesta cumple el formato RFC 7807 con code "[ERROR_CODE]"

@edge
### Escenario 3 / Scenario Outline: [Caso Borde / QA Edge Case Senior]
*   **Given** que se evalúa la regla con el parámetro <Entrada>
*   **When** se procesa la transacción
*   **Then** el resultado debe ser <ResultadoEsperado>

  **Examples:**
    | Entrada  | ResultadoEsperado |
    | "Caso A" | "Resultado A"     |
    | "Caso B" | "Resultado B"     |

---

## 🔒 Criterios de Aceptación No Funcionales (NFRs)
*   **Rendimiento:** El procesamiento del caso de uso y respuesta de la API debe ser menor a 300 ms.
*   **Accesibilidad / Ergonomía Táctil:** El 100% de los elementos interactivos en pantalla debe tener una dimensión mínima de 48px x 48px.

---

## 📊 Evaluación INVEST
*   **[I]ndependiente:** Sí ...
*   **[N]egociable:** Sí ...
*   **[V]aliosa:** Sí ...
*   **[E]stimable:** Sí ...
*   **[S]mall (Pequeña):** Sí ...
*   **[T]estable:** Sí ...
```
