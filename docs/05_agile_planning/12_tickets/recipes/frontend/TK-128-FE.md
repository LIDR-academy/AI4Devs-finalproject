---
document: technical_ticket
id: TK-128-FE
related_story: US-035 (Escenarios 5 y 6)
points: 2
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/reports/US-035_recetas_aprovechamiento_ia.md
  - docs/05_agile_planning/12_tickets/recipes/backend/TK-128.md
---

# 🎟️ TK-128-FE: Mostrar la Merma Evitada como Valor Monetario en el Modal de Rescate

> **Navegación:** [⬅️ US-035](../../../11_user_stories/reports/US-035_recetas_aprovechamiento_ia.md) | [📖 Índice de Tickets](../../indice_tickets.md) | [Backend: TK-128](../backend/TK-128.md)

---

## 📝 Descripción

`TK-128` cambió el contrato: `RescueRecipeProposal.preventedWasteEstimate` (cantidad física sin sentido) → `preventedWasteCost` (`string` monetario `| null`). El frontend debe reflejarlo:

* El badge de la `ProposalCard` muestra `{currencySymbol}{preventedWasteCost} de merma evitada` cuando hay valor, y `"Valor de merma no disponible"` cuando es `null` (mismo patrón que `PreparationWasteReportPanel` / `ReportsDashboard`, US-019).
* `RescueRecipesModal` obtiene `currencySymbol` de `SettingsService.fetchSettings()` (default `"$"` si falla), igual que `ReportsDashboard`.

*   **Módulo:** `recipes` (frontend) · **2 SP** · **Should Have** · **Prerrequisitos:** TK-128.

---

## 🔀 Alcance de Modificación

*   **`apps/frontend/src/features/recipes/services/recipes.service.ts`:** interfaz `RescueRecipeProposal` — `preventedWasteEstimate: string` → `preventedWasteCost: string | null`.
*   **`apps/frontend/src/features/recipes/components/RescueRecipesModal.tsx`:**
    *   `useRescueRecipes` obtiene y expone `currencySymbol` (fetch a `SettingsService.fetchSettings`, default `"$"`).
    *   `ProposalCard` / `ProposalsGrid` reciben `currencySymbol` y renderizan el badge condicional (valor vs. "no disponible").
*   **`apps/frontend/src/tests/RescueRecipesModal.test.tsx`:** mocks (`preventedWasteEstimate` → `preventedWasteCost`, incluir un caso `null`), mock de `SettingsService.fetchSettings`.

**Fuera de alcance:** rediseño visual del badge; el CSS existente (`waste-saved-badge`) se reutiliza.

---

## ✅ Criterios de Aceptación & DoD

### Escenario 1 (US-035 Esc. 5)
*   **Given** una propuesta con `preventedWasteCost: "42.50"` y `currencySymbol: "$"`
*   **Then** el badge muestra `$42.50 de merma evitada`.

### Escenario 2 (US-035 Esc. 6)
*   **Given** una propuesta con `preventedWasteCost: null`
*   **Then** el badge muestra `Valor de merma no disponible` (sin `NaN`, sin `null`, sin `undefined`).

### DoD
1. **RTL:** los tests de `RescueRecipesModal` cubren ambos escenarios.
2. **Sin `style` inline** (Guard 29) — se reutilizan clases existentes.
3. **Verificación:** `pnpm test`, `pnpm run build`, `pnpm run lint` — 0 errores.
4. **Commit atómico:** `feat(recipes): show prevented-waste value as money in the rescue modal (TK-128-FE)`.

---

## 🤖 Instrucciones de Ejecución Autónoma
1. **Modificar:** `recipes.service.ts`, `RescueRecipesModal.tsx`, `RescueRecipesModal.test.tsx`.
2. **Verificación:** `pnpm --filter @restostock/frontend test -- RescueRecipesModal && pnpm run build && pnpm run lint`
