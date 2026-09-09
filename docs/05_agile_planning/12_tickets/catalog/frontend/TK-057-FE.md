---
document: technical_ticket
id: TK-057-FE
related_story: US-012
points: 3
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/catalog/US-012.md
  - docs/02_architecture_design/04_technical_design.md
---

# 🎟️ TK-057-FE: Panel de Gestión de Catálogo (Frontend)

> **Nota (`TK-069-FE`):** `CreateRecipeForm.tsx` y `catalog.service.ts` (recetas) se movieron a `features/recipes/` — ver [`recipes/frontend/TK-069-FE.md`](../../recipes/frontend/TK-069-FE.md). `CatalogManagementPanel.tsx` permanece en `features/catalog/` como shell de composición (Insumos de `stock` + Recetas de `recipes`), no como dueño de lógica de dominio. Este documento queda como registro histórico.

> **Navegación del Framework SDD:**  
> [⬅️ Volver a US-012 (11_user_stories/catalog/US-012.md)](../../../11_user_stories/catalog/US-012.md) | [📖 Índice de Tickets (12_indice_tickets.md)](../../indice_tickets.md) | [Siguiente: Matriz de Trazabilidad (13_matriz_trazabilidad.md) ➡️](../../../13_matriz_trazabilidad.md)

---

## 📝 Descripción
Panel de administración para que un Administrador dé de alta insumos y recetas, consumiendo `POST/GET /api/v1/stock/insumos` y `POST/GET /api/v1/catalog/recipes` (`TK-057`, ya implementados en backend). Sin este ticket, esas capacidades solo serían accesibles vía `curl`/Swagger.

*   **ID US Relacionada:** `US-012`
*   **Módulo / Vertical Slice:** `catalog` (Frontend UI)
*   **Estimación (Story Points):** 3
*   **Prioridad MoSCoW:** Should Have
*   **Prerrequisitos:** `TK-001-FE` (Core Frontend), `TK-057` (API backend ya operativa)

---

## 🔀 Alcance de Modificación (Frontend Architecture)
*   **Componentes UI (`src/features/catalog/components/`):** `CatalogManagementPanel.tsx` (shell modal + guard de rol + tabs, mismo patrón que `UserManagementPanel.tsx` de `TK-049-FE`), `CreateInsumoForm.tsx` (alta de insumo), `CreateRecipeForm.tsx` (alta de receta con filas dinámicas de ingrediente: selector de insumo + cantidad, agregar/quitar fila).
*   **API Service:** `src/features/catalog/services/catalog.service.ts` (nuevo), consumiendo el cliente HTTP compartido `src/shared/http/apiClient.ts`.
*   **Componentes Reutilizados (sin duplicar):** `src/shared/components/Modal.tsx`, `ModalHeader.tsx` y `AccessDeniedState.tsx` (ya extraído en `TK-049-FE`) — cero código nuevo de guard de rol.
*   **Wiring:** `App.tsx` gana botón "Catálogo" + estado `isCatalogManagementOpen`, mismo cableado que `onUserManagement`/`isUserManagementOpen`.

---

## ⚠️ Mitigación de Riesgos Técnicos
1.  **Doble Envío:** el botón de envío se deshabilita mientras la petición está en curso (mismo patrón que `CreateUserForm.tsx`).
2.  **Selector de Ingredientes Vacío:** si `GET /api/v1/stock/insumos` retorna una lista vacía, `CreateRecipeForm.tsx` deshabilita el botón "Agregar Ingrediente" y muestra un mensaje explícito en vez de un `<select>` vacío silencioso.
3.  **Sin fallback a datos sintéticos ante error:** igual que `UserManagementPanel`/`MovementHistoryPanel` — son acciones administrativas de catálogo, fingir éxito o datos falsos sería activamente engañoso.

---

## ✅ Criterios de Aceptación & DoD (Definition of Done)

### Criterio de Aceptación 1: Alta exitosa de insumo (Happy Path)
*   **Given** un Administrador autenticado en el panel de gestión de catálogo
*   **When** completa el formulario con nombre y unidad de medida, y confirma
*   **Then** la UI muestra un mensaje de confirmación con los datos reales devueltos por el backend, sin recargar la página completa.

### Criterio de Aceptación 2: Alta exitosa de receta con 2 ingredientes
*   **Given** un Administrador que ya ve el catálogo de insumos cargado en el selector
*   **When** completa nombre de receta, agrega 2 filas de ingrediente con cantidad, y confirma
*   **Then** la UI muestra un mensaje de confirmación con la receta creada.

### DoD Estricto:
1.  **Tests RTL:** pruebas de integración de componentes (acceso restringido con `AccessDeniedState`, alta exitosa de insumo con mensaje real del backend, alta exitosa de receta con 2 ingredientes, error de validación) — `apps/frontend/src/tests/CatalogManagementPanel.test.tsx`.
2.  **Estados Defensivos:** feedback inline de éxito/error tras cada acción; estado vacío explícito si no hay insumos para poblar el selector de ingredientes.
3.  **A11y:** botones táctiles `btn-touch` (≥48px), formularios navegables por teclado — cero errores en `eslint-plugin-jsx-a11y` (verificado con `pnpm run lint`).

---

## 🤖 Instrucciones de Ejecución Autónoma para Agente IA
1. **Fichas creadas/modificadas:**
   - `apps/frontend/src/features/catalog/components/CatalogManagementPanel.tsx`
   - `apps/frontend/src/features/catalog/components/CreateInsumoForm.tsx`
   - `apps/frontend/src/features/catalog/components/CreateRecipeForm.tsx`
   - `apps/frontend/src/features/catalog/services/catalog.service.ts`
   - `apps/frontend/src/App.tsx` (wiring del botón "Catálogo" y el modal)
   - `apps/frontend/src/tests/CatalogManagementPanel.test.tsx`, `apps/frontend/src/features/catalog/services/catalog.service.test.ts`
2. **Ejecutar Suite de Pruebas Frontend:** `pnpm --filter @restostock/frontend run test`
3. **Comando de Verificación Total:** `pnpm --filter @restostock/frontend run build && pnpm --filter @restostock/frontend run lint`

---

## 📌 Deuda Registrada
Ninguna deuda propia. Ver la deuda registrada en [`TK-057`](../backend/TK-057.md) respecto a `RecipeSelectorModal.tsx`.
