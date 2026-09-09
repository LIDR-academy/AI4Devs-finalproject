---
document: technical_ticket
id: TK-131-FE
related_story: US-037
points: 3
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/catalog/US-037_edicion_baja_receta.md
  - docs/05_agile_planning/12_tickets/recipes/backend/TK-131.md
---

# 🎟️ TK-131-FE: Edición y Baja de Recetas en el Recetario — US-037

> **Navegación:** [⬅️ US-037](../../../11_user_stories/catalog/US-037_edicion_baja_receta.md) | [Backend: TK-131](../backend/TK-131.md)

---

## 📝 Descripción

Acciones **"Editar"** / **"Dar de baja"** en cada receta del recetario (`canManage` / ADMIN).
"Editar" abre `EditRecipeModal` (nombre, categoría, descripción, ingredientes) y envía un
`PUT /recipes/:id` **parcial**; si el backend responde `409` (composición congelada por una
preparación cerrada) el mensaje se muestra en un `ErrorBanner`. "Dar de baja" pide
confirmación (`ConfirmModal`, Guard 38) y llama a `DELETE /recipes/:id` (soft-delete).

*   **Módulo:** `recipes` (frontend) · **3 SP** · **Should Have** · **Prerrequisitos:** TK-131.

---

## 🔀 Alcance de Modificación

*   **`services/recipes.service.ts`:** `UpdateRecipeRequest` + `RecipesService.updateRecipe(id, patch)` + `RecipesService.deleteRecipe(id)`.
*   **`components/EditRecipeModal.tsx`** (nuevo): precarga desde la receta, `buildPatch` (solo lo que cambió; descripción vaciada → `null`; `ingredients` solo si cambian), `ErrorBanner` para `409`/`400`/`404`.
*   **`components/RecipeManageActions.tsx`** (nuevo): botones "Editar" / "Dar de baja".
*   **`components/RecipeIngredientRows.tsx`** + **`recipeIngredientRow.ts`** (nuevos): `IngredientRowsEditor` compartido entre `CreateRecipeForm` y `EditRecipeModal` (elimina el clon del `<select>` de insumos + filas). `CreateRecipeForm` migra a este componente.
*   **`shared/components/RowActionButtons.tsx`** + **`rowActionPresets.tsx`** (nuevos): barra de botones de fila + preset `editRowAction` — fuente única de las acciones de gestión de `InsumoManageActions` y `RecipeManageActions` (elimina el clon entre ambos). `InsumoManageActions` migra a ellos.
*   **`components/RecipeCatalogPanel.tsx`:** `useRecipeList` + `useRecipeManagement` (fetch/estado/modales) extraídos; columna "Acciones" cuando `canManage`; `<EditRecipeModal>` + `<ConfirmModal>` de baja.

---

## ✅ DoD

1. RTL de `EditRecipeModal` (`EditRecipeModal.test.tsx`, 6): precarga, `PUT` parcial, descripción → `null`, "sin cambios cierra sin llamar", banner de error `409`.
2. `pnpm test` (frontend 243) / `pnpm run build` / `pnpm run lint` — 0 errores; gates ticket-scoped verdes (duplicación repo 17 → 17, sin clones nuevos; código muerto y complejidad/longitud limpios).
3. Sin `style` inline (Guard 29); confirmación de baja con `ConfirmModal`, no `window.confirm` (Guard 38).
4. **Commit atómico:** `feat(recipes): edit and soft-delete recipes in the catalog (TK-131-FE)`.
