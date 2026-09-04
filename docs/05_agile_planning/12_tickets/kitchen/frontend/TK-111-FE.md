---
document: technical_ticket
id: TK-111-FE
related_story: US-007
points: 3
type: frontend
status: draft
inputs:
  - docs/05_agile_planning/11_user_stories/kitchen/US-007.md
---

# 🎟️ TK-111-FE: Vista Previa de Disponibilidad en "Preparar Receta" (Frontend)

> [⬅️ US-007](../../../11_user_stories/kitchen/US-007.md) | [📖 Índice](../../indice_tickets.md)

## 📝 Descripción
`RecipeSelectorModal`: al elegir receta y/o cambiar las porciones, consulta `GET /kitchen/recipes/:id/availability?portions=N` (`TK-111`) y muestra, por ingrediente, requerido vs. disponible. Si falta algo, lo marca visualmente y deshabilita "Confirmar Preparación" — hoy el cocinero solo se entera del quiebre de stock cuando el envío falla con `422`.

*   **US:** `US-007` v1.1.0 · **Slice:** `kitchen` UI · **SP:** 3 · **MoSCoW:** Should Have · **Prioridad:** 🟡 P1
*   **Prerrequisitos:** `TK-111`

## 🔀 Alcance (UI)
*   `kitchen.service.ts`: `fetchRecipeAvailability(recipeId, portions)`.
*   `RecipeSelectorModal.tsx`: re-consulta la disponibilidad cuando cambia la receta seleccionada o las porciones; por ingrediente muestra `requerido / disponible` con marca visual si `!isSufficient`; "Confirmar Preparación" se deshabilita si `!isFullyAvailable` **una vez la consulta respondió** — un fallo de red en la vista previa no bloquea indefinidamente (el propio `ConsumeRecipeUseCase` sigue siendo la autoridad final, con su `422` si de verdad falta stock).
*   Guard 29 / Guard 38.

## ✅ DoD
1. Test de componente: receta con todos los ingredientes disponibles → confirmar habilitado; algún ingrediente insuficiente → marcado visualmente y confirmar deshabilitado; cambiar porciones vuelve a consultar y puede habilitar/deshabilitar en consecuencia.
2. Sin regresiones frontend; sin código muerto / estilos inline nuevos.
3. **Commit:** `feat(kitchen): ingredient availability preview in recipe selector (TK-111-FE)`.
