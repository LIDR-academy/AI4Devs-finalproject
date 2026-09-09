---
document: technical_ticket
id: TK-070-FE
related_story: US-012
points: 3
type: frontend
status: done
inputs:
  - docs/05_agile_planning/12_tickets/recipes/frontend/TK-069-FE.md
---

# 🎟️ TK-070-FE: Recetario — pestaña de recetas con lista, búsqueda y alta en modal

> **Navegación del Framework SDD:**
> [⬅️ Volver a US-012 (11_user_stories/catalog/US-012.md)](../../../11_user_stories/catalog/US-012.md) | [📖 Índice de Tickets (12_indice_tickets.md)](../../indice_tickets.md) | [Siguiente: Matriz de Trazabilidad (13_matriz_trazabilidad.md) ➡️](../../../13_matriz_trazabilidad.md)

---

## 📝 Descripción
El humano comparó capturas de las dos pestañas del panel de Catálogo (`TK-069-FE`) y notó una asimetría real: "Inventario de Bodega" muestra una lista con botón de alta, buscador y tabla de insumos existentes, mientras "Alta de Receta" solo mostraba el formulario de creación — sin lista, sin forma de ver las recetas ya cargadas. Pidió renombrar la pestaña a "Recetario" y replicar la estructura de Inventario de Bodega 1:1.

*   **ID US Relacionada:** [`US-012`](../../../11_user_stories/catalog/US-012.md)
*   **Módulo / Vertical Slice:** `recipes` (frontend); `catalog` (shell, `CatalogManagementPanel.tsx`)
*   **Estimación (Story Points):** 3
*   **Prioridad MoSCoW:** Should Have
*   **Prerrequisitos:** `TK-069-FE` (módulo `recipes` ya extraído; `RecipesService.listRecipes()` ya existente y sin consumidor propio hasta este ticket)

---

## 🔀 Alcance de Modificación (Frontend Architecture)
*   **Nuevo `features/recipes/components/RecipeCatalogPanel.tsx`:** componente autocontenido (sin props), mirror exacto de `features/stock/components/InsumoCatalogPanel.tsx` — header (título "📖 Recetario" + descripción + botón "+ Nueva Receta") + buscador (filtro cliente por `name`, substring case-insensitive) + tabla (Nombre, Categoría, Ingredientes — solo conteo, `RecipeListItem` no trae nombres de insumo) + estado vacío/carga/error (usa `ErrorBanner` compartido, no repite el `<div>` inline que `InsumoCatalogPanel` tiene por ser anterior a esa extracción). Sin columna de acciones por fila: el backend de `recipes` solo soporta crear+listar, no hay editar/borrar.
*   **Nuevo `features/recipes/components/CreateRecipeModal.tsx`:** wrapper delgado usando el patrón correcto de modal compartido (`Modal`/`ModalHeader`, igual que `RestockInsumoModal.tsx` — no el hand-rolled de `CreateInsumoModal.tsx`, deuda ya conocida y no replicada aquí). Envuelve `CreateRecipeForm.tsx` sin modificarlo.
*   **`features/catalog/components/CatalogManagementPanel.tsx`:** label de tab "Alta de Receta" → "Recetario"; `<CreateRecipeForm onCreated={handleUpdated} />` → `<RecipeCatalogPanel />` (sin props). Eliminado el estado `feedback`/`handleUpdated`/`<SuccessFeedbackBanner>` a nivel de panel — quedaba sin uso simétrico (Insumos nunca lo usó) y ahora Recetario maneja su propio feedback localmente, igual que Insumos maneja el suyo. El panel queda como shell puro de composición de tabs, sin estado de negocio.
*   **`apps/frontend/src/tests/CatalogManagementPanel.test.tsx`:** 3 tests existentes actualizados (matcher de tab `/Alta de Receta/i` → `/Recetario/i` + clic adicional en "+ Nueva Receta" antes de esperar los campos del formulario; mocks de fetch ahora distinguen `GET /recipes` de `GET /stock/insumos` por URL, ya que ahora ambos endpoints se llaman en la misma pantalla). Test nuevo: filtra recetas por nombre en la lista.

---

## ⚠️ Mitigación de Riesgos Técnicos y Decisión de Alcance
1.  **Sin columna de acciones por fila:** verificado contra `apps/backend/src/infrastructure/recipes/http/routes/recipes.routes.ts` — solo `POST /` y `GET /`, sin editar/borrar. No se inventan botones deshabilitados; se documenta como límite real del backend, no como olvido.
2.  **`CreateRecipeForm.tsx` no se toca:** cero riesgo de regresión sobre el fix de `insumoId` de `TK-069-FE` (el `useEffect` de resincronización sigue intacto) — solo cambia dónde se monta el formulario (modal en vez de tab plano).
3.  **Columna "Ingredientes" solo con conteo, no nombres:** `RecipeListItem` no trae nombres de insumo; cruzarlos requeriría un segundo fetch a `/stock/insumos` solo para esta tabla — no se justifica el costo/complejidad extra para un dato que además ya se ve al abrir el modal de alta. Documentado para no "arreglarlo" sin evaluar el tradeoff de nuevo.

---

## ✅ Criterios de Aceptación & DoD (Definition of Done)

### Criterio de Aceptación 1: Recetario simétrico a Inventario de Bodega
*   **Given** un Administrador en el panel de Catálogo
*   **When** hace clic en la pestaña "Recetario"
*   **Then** ve una lista de recetas existentes con buscador y botón "+ Nueva Receta", en vez de un formulario de alta directo.

### Criterio de Aceptación 2: Alta de receta actualiza la lista sin recargar
*   **Given** el Recetario abierto con 0 o más recetas
*   **When** hace clic en "+ Nueva Receta", completa el formulario en el modal y confirma
*   **Then** el modal se cierra, aparece un banner de confirmación, y la nueva receta aparece en la tabla sin recargar la página.

### DoD Estricto:
1.  **Tests:** `pnpm --filter @restostock/frontend run test` — 19/19 archivos, 88/88 tests en verde.
2.  **Build/Lint:** `pnpm --filter @restostock/frontend run build && pnpm --filter @restostock/frontend run lint` — 0 errores (1 warning preexistente ajeno en `CreateInsumoModal.tsx`).
3.  **Smoke test en vivo (ejecutado):** login `bootstrap-admin`/`1234` contra el backend real en Docker + dev server, pestaña Recetario muestra las recetas ya creadas en sesiones previas, el buscador filtra correctamente, y crear una receta nueva ("Ensalada Caprese Recetario") la agrega a la lista visible tras el cierre automático del modal.

---

## 🤖 Instrucciones de Ejecución Autónoma para Agente IA
1. **Ficheros creados/modificados:**
   - `apps/frontend/src/features/recipes/components/RecipeCatalogPanel.tsx` (nuevo)
   - `apps/frontend/src/features/recipes/components/CreateRecipeModal.tsx` (nuevo)
   - `apps/frontend/src/features/catalog/components/CatalogManagementPanel.tsx`
   - `apps/frontend/src/tests/CatalogManagementPanel.test.tsx`
2. **Ejecutar Suite de Pruebas Frontend:** `pnpm --filter @restostock/frontend run test`
3. **Comando de Verificación Total:** `pnpm --filter @restostock/frontend run build && pnpm --filter @restostock/frontend run lint`

---

## 📌 Deuda Registrada
Ninguna deuda propia. La ausencia de acciones de editar/borrar receta por fila queda como límite conocido del backend (`recipes` module), no de este ticket — un futuro ticket de backend debería agregar esos endpoints antes de que el frontend pueda ofrecerlos.
