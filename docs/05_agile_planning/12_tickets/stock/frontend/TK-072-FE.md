---
document: technical_ticket
id: TK-072-FE
related_story: US-014
points: 3
type: frontend
status: approved
inputs:
  - docs/05_agile_planning/11_user_stories/stock/US-014.md
  - docs/02_architecture_design/05_ui_ux_design_system.md
---

# 🎟️ TK-072-FE: Interfaz Táctil para Extracciones con Responsable y Motivo (Frontend)

> **Navegación del Framework SDD:**  
> [⬅️ Volver a US-014 (11_user_stories/stock/US-014.md)](../../../11_user_stories/stock/US-014.md) | [📖 Índice de Tickets (12_indice_tickets.md)](../../indice_tickets.md) | [Siguiente: Matriz de Trazabilidad (13_matriz_trazabilidad.md) ➡️](../../../13_matriz_trazabilidad.md)

---

## 📝 Descripción
Actualizar la pantalla táctil de extracción de bodega (`WarehouseExtractionModal.tsx`) para permitir al operario seleccionar el propósito de la extracción (`Uso General en Cocina`, `Preparación de Receta` o `Descarte Directo desde Bodega`). Desplegar selectores condicionales para recetas activas del catálogo o campo obligatorio de motivo descriptivo para mermas directas, consumiendo los nuevos campos en `StockService.recordExtraction`.

*   **ID US Relacionada:** `US-014`
*   **Módulo / Vertical Slice:** `stock` (Bodega UI)
*   **Estimación (Story Points):** 3
*   **Prioridad MoSCoW:** Must Have
*   **Prerrequisitos:** `TK-007-F`, `TK-072`

---

## 🔀 Alcance de Modificación (UI & Components)
*   **UI Components:** Actualizar `WarehouseExtractionModal.tsx` con selectores táctiles (min 48px), radio buttons o dropdown para `purpose`, selector de `recipeId` y textarea para `reason`.
*   **Services:** Extender `StockService.recordExtraction` en `stock.service.ts` para enviar `purpose`, `reason`, `recipeId`.
*   **Design System Compliance (Guard 29):** Consumir exclusivamente variables CSS (`var(--color-primary)`, `var(--color-bg-card)`, etc.).

---

## ✅ Criterios de Aceptación & DoD
1. **Ergonomía Táctil:** Botones y selecciones con objetivo táctil de al menos 48px x 48px.
2. **Validación en Cliente:** Bloquear envío si `purpose === 'DIRECT_DISCARD'` y el motivo está vacío.
3. **Tests de Componente:** Actualizar `WarehouseExtractionModal.test.tsx` verificando renderizado condicional de campos.
