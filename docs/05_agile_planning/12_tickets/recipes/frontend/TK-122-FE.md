---
document: technical_ticket
id: TK-122-FE
related_story: US-035
points: 3
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/reports/US-035_recetas_aprovechamiento_ia.md
  - docs/05_agile_planning/12_tickets/recipes/backend/TK-122.md
  - DESIGN.md
---

# 🎟️ TK-122-FE: Modal y Visualización de Recetas Anti-Desperdicio (Frontend)

> **Navegación del Framework SDD:**
> [⬅️ Volver a US-035](../../11_user_stories/reports/US-035_recetas_aprovechamiento_ia.md) | [📖 Índice de Tickets](../../indice_tickets.md) | [Matriz de Trazabilidad ➡️](../../13_matriz_trazabilidad.md)

---

## 📝 Descripción
Implementar el componente de visualización de recetas de aprovechamiento (`RescueRecipesModal.tsx`) accesible desde `/reportes` (sección Mermas) y `/recetas`, permitiendo solicitar sugerencias al backend, visualizar las tarjetas de platos con los ingredientes en riesgo destacados, y accionar el botón "Guardar en Catálogo" para convertir la propuesta en una receta utilizable en cocina.

*   **ID US Relacionada:** [`US-035`](../../11_user_stories/reports/US-035_recetas_aprovechamiento_ia.md)
*   **Módulo / Vertical Slice:** `recipes` / `reports` (frontend)
*   **Estimación (Story Points):** 3
*   **Prioridad MoSCoW:** Should Have
*   **Prerrequisitos:** `TK-122` (Backend API) y componentes de recetas existentes.

---

## 🔀 Alcance de Modificación (Frontend)
*   **Componentes:**
    *   `RescueRecipesModal.tsx` y su módulo `RescueRecipesModal.module.css`.
    *   Botón táctil de acción rápida: *"Generar Recetas Anti-Desperdicio"* en la barra de herramientas de `/recetas` y en el panel de mermas de `/reportes`.
    *   Tarjetas de propuesta con:
        *   Título de la preparación y raciones estimadas.
        *   Lista de ingredientes requeridos y badge de caducidad inminente en los remanentes aprovechados.
        *   Indicador de origen (`IA (Gemini/OpenAI)` vs `Motor Heurístico Local`).
        *   Botón táctil *"Guardar en Catálogo"* (mínimo 48px).
*   **Integración con API:**
    *   Llamada a `POST /api/v1/recipes/rescue-suggestions`.
    *   Al guardar, llamada a `POST /api/v1/catalog/recipes` persistiendo la receta con sus ingredientes.
    *   Feedback visual de éxito mediante `Toast` o `InfoBanner`.

---

## ✅ Criterios de Aceptación & DoD (Definition of Done)
1. El modal se abre desde `/recetas` y carga sugerencias sin bloquear la UI.
2. Si la respuesta contiene `source: "HEURISTIC"`, se muestra una insignia clara informando que se utilizó el motor local.
3. Al pulsar "Guardar en Catálogo", la receta se persiste y aparece inmediatamente en el listado de recetas.
4. Cumplimiento de WCAG 2.1 AAA (targets >=48px, contraste de color, sin estilos inline).
5. Pruebas de componente React Testing Library con cobertura completa.
