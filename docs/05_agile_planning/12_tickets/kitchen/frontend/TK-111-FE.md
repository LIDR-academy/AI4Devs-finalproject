---
document: technical_ticket
id: TK-111-FE
related_story: US-007
points: 3
type: frontend
status: done
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

## 📌 Notas de implementación
*   **`ModalFooterActions` gana `disabled?: boolean`:** el footer compartido (`DiscardModal`/`RecipeSelectorModal`/`WarehouseExtractionModal`) solo tenía `isSubmitting` como causa de deshabilitado — se agregó `disabled` como una causa independiente (se combinan con OR), sin romper a los otros 2 consumidores (default `false`). Enhebrar el nuevo prop subió la complejidad ciclomática del componente sobre el límite de ESLint — se extrajo `ConfirmButton` como subcomponente.
*   **`fetchRecipeAvailability` NO cae a datos mock offline**, a diferencia del resto de `kitchen.service.ts`: mostrar una disponibilidad inventada sería activamente engañoso. Si la consulta falla, `availability` queda `null` y el modal no bloquea el envío (falla-abierto) — `consumeRecipe` sigue siendo la autoridad final con su `422`.
*   **`disabled={availability?.isFullyAvailable === false}` (no `!availability.isFullyAvailable`):** deliberadamente defensivo — un `availability` `null`/`undefined`/con forma inesperada nunca bloquea, solo un `false` explícito y confirmado por el backend.
*   **`IngredientAvailabilityList` con guard `!availability?.ingredients`:** un test preexistente (`RecipeSelectorModal.test.tsx`) tenía un mock de `fetch` genérico que devolvía `[]` para cualquier URL no reconocida, incluida la nueva `/availability` — sin el guard, el componente tumbaba el modal completo (`.map` sobre `undefined`). Corregido con el guard defensivo + el mock del test actualizado para devolver una forma realista.
*   DoD #1 cubierto con 3 tests dedicados (`RecipeAvailabilityPreview.test.tsx`): ingrediente insuficiente bloquea, todos suficientes habilita, cambiar porciones re-consulta y puede pasar de habilitado a deshabilitado.
