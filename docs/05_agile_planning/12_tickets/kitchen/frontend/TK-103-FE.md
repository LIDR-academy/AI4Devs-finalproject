---
document: technical_ticket
id: TK-103-FE
related_story: US-027
points: 5
type: frontend
status: draft
inputs:
  - docs/05_agile_planning/11_user_stories/kitchen/US-027.md
  - docs/02_architecture_design/adr/ADR-003-recipe-preparation-tracking.md
---

# 🎟️ TK-103-FE: Extracción para Receta con Preparación + Tablero "Preparaciones en Curso" (Frontend)

> [⬅️ US-027](../../../11_user_stories/kitchen/US-027.md) | [📖 Índice](../../indice_tickets.md)

## 📝 Descripción
En el modal de extracción: receta obligatoria en modo RECIPE, campo "porciones planificadas", y opción "añadir a preparación en curso". Nueva vista/tablero de preparaciones abiertas.

*   **US:** `US-027` · **Slice:** `kitchen` UI · **SP:** 5 · **MoSCoW:** Should Have · **Prioridad:** 🟢 P2
*   **Prerrequisitos:** `TK-103`, `TK-072-FE`, `TK-102-FE`

## 🔀 Alcance (UI)
*   `WarehouseExtractionModal.tsx`: `RecipeDestinationField` deja de tener opción vacía (receta obligatoria cuando `purpose = RECIPE`); `+ input "porciones planificadas"`; `+ selector opcional "añadir a preparación en curso"` (lista de `GET /recipe-preparations?status=OPEN` de esa receta). Envía `plannedPortions` / `recipePreparationId`. Validación cliente.
*   Nuevo `features/kitchen/components/OpenPreparationsPanel.tsx` — lista de preparaciones `OPEN` (receta, porciones, quién/cuándo, ingredientes vinculados, botón "Cerrar preparación" → abre `TK-104-FE`). Ruta `/estaciones` o sub-vista.
*   `kitchen.service.ts` / nuevo `recipePreparations.service.ts`.
*   Guard 29 / Guard 38.

## ✅ DoD
1. Test de componente: receta obligatoria en RECIPE bloquea submit; `plannedPortions` viaja en el POST; el tablero lista solo `OPEN`.
2. Sin regresiones frontend; sin código muerto / estilos inline nuevos.
3. **Commit:** `feat(kitchen): recipe extraction with preparation + open-preparations board (TK-103-FE)`.
