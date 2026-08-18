---
name: backlog-map
description: "Genera el Mapa Jerárquico del Backlog en formato de diagrama Mermaid (graph TD) conectando Roadmap, Épicas, Historias de Usuario y Tickets Técnicos."
version: "3.1.0"
category: "05_agile_planning"
inputs:
  - "docs/01_product_definition/02_prd.md"
  - "docs/05_agile_planning/11_user_stories/"
  - "docs/05_agile_planning/12_tickets/"
outputs:
  - "docs/05_agile_planning/14_backlog_map.md"
---

# 🗺️ SK-14: Mapa Visual Jerárquico del Backlog (v3.1.0)

Actúa como un **System Visualization Specialist** y **Agile Architect** experto en diagramado técnico, sintaxis Mermaid (`graph TD`) y modelado gráfico de jerarquías de proyectos.

Tu objetivo es analizar la estructura del backlog en `docs/05_agile_planning/` para generar el Mapa Visual Jerárquico oficial en `docs/05_agile_planning/14_backlog_map.md`.

---

## 🚫 Non-Goals de Ejecución del Agente (Guards)

Durante la ejecución de este skill, el agente TIENE PROHIBIDO:
1. **No usar sintaxis Mermaid inválida:** Prohibido dejar caracteres especiales o paréntesis sin escapar en los nombres de los nodos.
2. **No omitir niveles de jerarquía:** El gráfico `graph TD` debe conectar obligatoriamente: `Roadmap` $\rightarrow$ `Épicas` $\rightarrow$ `Historias (US)` $\rightarrow$ `Tickets (TK Backend/Frontend)`.

---

## 🔄 Pipeline de Ejecución Secuencial en 3 Pasos

### 📍 Paso 1: Mapeo de Nodos Jerárquicos
1. Extraer los nodos del Roadmap desde `docs/01_product_definition/02_prd.md`.
2. Identificar las Épicas por módulo (`auth`, `stock`, `kitchen`, `reports`, `shared`).
3. Vincular cada Épica con sus Historias de Usuario (`US-XXX`) y Tickets Técnicos (`TK-XXX` backend/frontend).

### 📍 Paso 2: Generación del Diagrama Mermaid
1. Estructurar el código `mermaid` usando el tipo `graph TD`.
2. Aplicar estilos CSS personalizados (`classDef`) para distinguir visualmente entre Roadmap (dorado), Épicas (amarillo), Historias (azul) y Tickets (gris).

### 📍 Paso 3: Consolidación y Enlaces
1. Guardar el archivo en `docs/05_agile_planning/14_backlog_map.md`.
2. Incluir la tabla de navegación de respaldo para accesibilidad sin renderizador Mermaid.

---

## 📌 Formato de Salida y Cabecera GFM

El archivo generado en `docs/05_agile_planning/14_backlog_map.md` debe incluir:

```markdown
---
document: backlog_map
version: 1.2.0
status: approved
inputs:
  - docs/01_product_definition/02_prd.md
  - docs/05_agile_planning/11_user_stories/
  - docs/05_agile_planning/12_tickets/
---

# 🗺️ Mapa Jerárquico del Backlog (<ProjectName>)

> **Navegación del Framework SDD:**  
> [⬅️ Volver a Matriz de Trazabilidad (13_matriz_trazabilidad.md)](./13_matriz_trazabilidad.md) | [📖 Glosario & Reglas](../../../../docs/01_product_definition/01_glosario_y_reglas_negocio.md) | [Siguiente: Historial de Entregas (15_history.md) ➡️](./15_history.md)

---
```
