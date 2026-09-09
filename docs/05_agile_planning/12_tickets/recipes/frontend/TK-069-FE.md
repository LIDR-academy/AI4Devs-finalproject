---
document: technical_ticket
id: TK-069-FE
related_story: US-012
points: 3
type: frontend
status: done
inputs:
  - docs/05_agile_planning/12_tickets/recipes/backend/TK-069.md
  - docs/05_agile_planning/12_tickets/catalog/frontend/TK-057-FE.md
---

# 🎟️ TK-069-FE: Extracción del Feature `recipes` (independiente de `catalog`)

> **Navegación del Framework SDD:**
> [⬅️ Volver a US-012 (11_user_stories/catalog/US-012.md)](../../../11_user_stories/catalog/US-012.md) | [📖 Índice de Tickets (12_indice_tickets.md)](../../indice_tickets.md) | [Siguiente: Matriz de Trazabilidad (13_matriz_trazabilidad.md) ➡️](../../../13_matriz_trazabilidad.md)

---

## 📝 Descripción
Contraparte frontend de `TK-069`. `features/catalog/` mezclaba dos cosas: el panel compositor de administración (`CatalogManagementPanel.tsx`, que embebe la pestaña de Insumos de `stock` + la de Recetas) y la lógica propia de Recetas (`CreateRecipeForm.tsx`, `catalog.service.ts`). Este ticket mueve la lógica de Recetas a un nuevo `features/recipes/`, dejando `features/catalog/` como lo que realmente es: un shell de composición administrativa, sin lógica de dominio propia. De paso cierra dos hallazgos del análisis de módulos: `catalog.service.ts` duplicaba dos endpoints de insumos ya expuestos por `stock.service.ts` (tipos casi idénticos `InsumoListItem`/`InsumoItem`), y `CatalogService.createInsumo` era código muerto en producción (solo lo invocaba su propio test).

*   **ID US Relacionada:** [`US-012`](../../../11_user_stories/catalog/US-012.md)
*   **Módulo / Vertical Slice:** `recipes` (nuevo); `catalog` queda como shell de composición; `kitchen` actualiza su import
*   **Estimación (Story Points):** 3
*   **Prioridad MoSCoW:** Should Have
*   **Prerrequisitos:** `TK-069` (backend ya sirve `/api/v1/recipes`)

---

## 🔀 Alcance de Modificación (Frontend Architecture)
*   **Nuevo `features/recipes/components/CreateRecipeForm.tsx`** (movido de `features/catalog/`), **`features/recipes/services/recipes.service.ts`** (renombrado de `catalog.service.ts`).
*   **`recipes.service.ts`:** `listRecipes`/`createRecipe` apuntan a `/recipes` (no `/catalog/recipes`). `listInsumos` se mantiene (`CreateRecipeForm` la usa para poblar el selector de ingredientes) pero **sin fallback silencioso** — llamada estricta a `apiRequest('/stock/insumos')`, tipada con `InsumoItem` importado de `stock.service.ts` en vez de redeclarar `InsumoListItem` (elimina la duplicación de tipo real). **`createInsumo` eliminado** (código muerto confirmado; solo lo llamaba su propio test, ajustado junto con esto).
    *   **Decisión deliberada documentada:** NO se reutiliza `StockService.getInsumos()` tal cual — esa tiene fallback silencioso a datos mock pensado para el modo offline de cocina; usarlo aquí permitiría crear recetas contra insumos falsos si el backend falla. No "simplificar" esto en el futuro sin leer esta nota.
*   **`features/catalog/components/CatalogManagementPanel.tsx`** (queda donde está, es el shell administrativo — no dominio de ningún módulo): actualiza el import de `CreateRecipeForm` a `../../recipes/components/CreateRecipeForm.js`.
*   **`features/kitchen/services/kitchen.service.ts`:** actualiza el import de `CatalogService` a `RecipesService` desde `../../recipes/services/recipes.service.js`; su tipo propio `RecipeItem` (vista aplanada con `ingredientsSummary`) se mantiene igual — es una transformación de vista legítima para el selector de cocina, no duplicación a resolver.
*   **`apps/frontend/src/tests/RecipeSelectorModal.test.tsx`:** dos mocks de fetch que matcheaban `url.includes('/catalog/recipes')` pasan a `url.endsWith('/recipes')` — `includes('/recipes')` a secas hubiera colisionado con la URL de consumo (`.../kitchen/recipes/:id/consume`), que también contiene la subcadena `/recipes`.
*   **Bug real encontrado en la verificación en vivo de este ticket (`CreateRecipeForm.tsx`):** `useCreateRecipeForm(onCreated, insumos[0]?.id ?? '')` fija el `insumoId` de la primera fila vía `useState` en el primer render, cuando `insumos` todavía es `[]` (carga asíncrona) — ese valor `''` nunca se resincroniza cuando los insumos llegan, aunque el `<select>` ya muestre visualmente el primer insumo real como seleccionado (quirk de `<select>` controlado con `value` que no matchea ninguna `<option>`). Con un backend real (latencia real, no un mock síncrono) esto hacía fallar el alta de receta con 400 "El ID de insumo es obligatorio" en la fila por defecto, a menos que el usuario reabriera el dropdown manualmente. Preexistente a este ticket, no introducido por el rename — encontrado porque el DoD de este ticket exige un smoke test en vivo contra el backend real. Corregido con un `useEffect` que resincroniza la fila cuando sigue vacía y ya hay un `defaultInsumoId` real; test de regresión agregado en `CatalogManagementPanel.test.tsx` con un mock de fetch con delay real (los tests preexistentes con mocks síncronos nunca lo hubieran detectado).

---

## ⚠️ Mitigación de Riesgos Técnicos y Decisión de Alcance
1.  **Cero cambio de comportamiento visible:** mismo flujo de "Alta de Receta" dentro de `CatalogManagementPanel`, mismos mensajes de error, mismo selector de ingredientes. Verificado con la suite completa (86/86 frontend, -1 respecto a antes por eliminar 2 tests de código muerto y agregar 1 test del nuevo comportamiento estricto de `listInsumos`).
2.  **`InsumoItem` vs `InsumoListItem`:** estructuralmente idénticos salvo `unitOfMeasure` (`string` en `stock`, unión literal en `catalog`) — `CreateRecipeForm` solo usa ese campo para mostrarlo, nunca para lógica, así que adoptar el tipo de `stock` es seguro.
3.  **`CatalogManagementPanel` no se mueve:** sigue viviendo en `features/catalog/`, ahora explícitamente como composición (Insumos de `stock` + Recetas de `recipes`), no como dueño de dominio — evita forzar una reorganización de UI que nadie pidió.

---

## ✅ Criterios de Aceptación & DoD (Definition of Done)

### Criterio de Aceptación 1: Alta de receta funcional contra el nuevo endpoint
*   **Given** un Administrador en el panel de Catálogo, pestaña "Alta de Receta"
*   **When** completa el formulario y confirma
*   **Then** la receta se crea contra `POST /api/v1/recipes` (ya no `/api/v1/catalog/recipes`) y el selector de insumos se pobló vía `RecipesService.listInsumos()`.

### DoD Estricto:
1.  **Tests:** `pnpm --filter @restostock/frontend run test` — 19/19 archivos en verde.
2.  **Cero Referencias Residuales:** `grep -rn "catalog.service\|CatalogService\|InsumoListItem" apps/frontend/src` retorna vacío.
3.  **Build/Lint:** `pnpm --filter @restostock/frontend run build && pnpm --filter @restostock/frontend run lint` — 0 errores (1 warning preexistente de complejidad en `CreateInsumoModal.tsx`, ajeno a este ticket).
4.  **Smoke test en vivo (ejecutado):** login `bootstrap-admin`/`1234` contra Docker (`docker compose build backend frontend && docker compose up -d`, imágenes reconstruidas para reflejar `TK-069`/`TK-069-FE`), Catálogo → Alta de Receta con el dev server (`localhost:5173`, hot-reload) apuntando al backend real (`localhost:3000`) — `POST /api/v1/recipes` respondió `201` con `recipeId` real, sin tocar el selector de insumos manualmente (justo el caso que exponía el bug de arriba antes del fix).

---

## 🤖 Instrucciones de Ejecución Autónoma para Agente IA
1. **Ficheros movidos/modificados:**
   - `apps/frontend/src/features/recipes/components/CreateRecipeForm.tsx` (movido; además corrige el bug de resincronización de `insumoId` por defecto, ver arriba)
   - `apps/frontend/src/features/recipes/services/recipes.service.ts`, `recipes.service.test.ts` (movidos/reescritos)
   - `apps/frontend/src/features/catalog/components/CatalogManagementPanel.tsx`
   - `apps/frontend/src/features/kitchen/services/kitchen.service.ts`
   - `apps/frontend/src/tests/RecipeSelectorModal.test.tsx`
   - `apps/frontend/src/tests/CatalogManagementPanel.test.tsx` (test de regresión nuevo para el bug de `insumoId`)
2. **Ejecutar Suite de Pruebas Frontend:** `pnpm --filter @restostock/frontend run test`
3. **Comando de Verificación Total:** `pnpm --filter @restostock/frontend run build && pnpm --filter @restostock/frontend run lint`

---

## 📌 Deuda Registrada
Ninguna deuda propia. El side-channel `WarehouseExtractionModal.tsx → KitchenService.addLocalRemanente` (hallazgo del mismo análisis de módulos que originó este ticket) queda explícitamente fuera de alcance — pendiente de un ticket futuro si se decide atacarlo.
