---
document: technical_ticket
id: TK-060-FE
related_story: US-013
points: 2
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/stock/US-013.md
  - docs/02_architecture_design/04_technical_design.md
---

# 🎟️ TK-060-FE: Reabastecimiento de Bodega (Frontend)

> **Navegación del Framework SDD:**  
> [⬅️ Volver a US-013 (11_user_stories/stock/US-013.md)](../../../11_user_stories/stock/US-013.md) | [📖 Índice de Tickets (12_indice_tickets.md)](../../indice_tickets.md) | [Siguiente: Matriz de Trazabilidad (13_matriz_trazabilidad.md) ➡️](../../../13_matriz_trazabilidad.md)

---

## 📝 Descripción
Un Administrador ya puede reabastecer un insumo directamente desde el panel de Inventario de Bodega (`InsumoCatalogPanel.tsx`, `TK-057-FE`), consumiendo `PATCH /api/v1/stock/insumos/{id}/restock` (`TK-060`, ya implementado en backend). Sin este ticket, esa capacidad solo sería accesible vía `curl`/Swagger.

*   **ID US Relacionada:** [`US-013`](../../../11_user_stories/stock/US-013.md)
*   **Módulo / Vertical Slice:** `stock` (Frontend UI)
*   **Estimación (Story Points):** 2
*   **Prioridad MoSCoW:** Must Have
*   **Prerrequisitos:** `TK-057-FE` (`InsumoCatalogPanel.tsx` ya existe), `TK-060` (API backend ya operativa)

---

## 🔀 Alcance de Modificación (Frontend Architecture)
*   **Componentes UI (`src/features/stock/components/`):** `RestockInsumoModal.tsx` (nuevo) — mismo patrón compositivo que `WarehouseExtractionModal.tsx` (`Modal`/`ModalHeader`/`ModalFooterActions` compartidos + hook `useRestockForm`, no el patrón de backdrop inline más viejo de `CreateInsumoModal.tsx`). `InsumoCatalogPanel.tsx` gana un botón "Reabastecer" por fila (extraído junto con el resto de la tabla a un sub-componente `InsumoTable`/`InsumoTableRow` para mantener el componente principal bajo el límite de complejidad).
*   **API Service:** `StockService.restockInsumo()` nuevo en `src/features/stock/services/stock.service.ts` (mismo archivo que ya expone `createInsumo`/`getInsumos` para este panel).
*   **Componentes Reutilizados (sin duplicar):** `Modal.tsx`, `ModalHeader.tsx`, `ModalFooterActions.tsx` ya existentes.
*   **Wiring:** ningún cambio en `App.tsx` — el modal vive enteramente dentro de `InsumoCatalogPanel.tsx`, ya montado en el panel de Catálogo existente.

---

## ⚠️ Mitigación de Riesgos Técnicos
1.  **Doble Envío:** el botón de confirmación se deshabilita mientras la petición está en curso (`ModalFooterActions`, mismo patrón que el resto de modales).
2.  **Validación de Cantidad:** rechazo inline (sin llamar al backend) si la cantidad no es un número positivo — mismo criterio de UX que `CreateInsumoModal.tsx`.
3.  **Refresco de Lista:** tras un reabastecimiento exitoso, `InsumoCatalogPanel.tsx` vuelve a pedir `GET /stock/insumos` (mismo `onSuccess={fetchInsumos}` que ya usa `CreateInsumoModal`) — el stock mostrado nunca queda desincronizado del backend.

---

## ✅ Criterios de Aceptación & DoD (Definition of Done)

### Criterio de Aceptación 1: Reabastecimiento exitoso (Happy Path)
*   **Given** un Administrador viendo la tabla de Inventario de Bodega
*   **When** hace clic en "Reabastecer" sobre una fila, ingresa una cantidad positiva y confirma
*   **Then** la UI muestra el nuevo stock real devuelto por el backend, sin recargar la página completa.

### DoD Estricto:
1.  **Tests RTL:** reabastecimiento exitoso con stock actualizado visible — `apps/frontend/src/tests/CatalogManagementPanel.test.tsx`.
2.  **Complejidad:** gate ticket-scoped (`check_ticket_code_quality.sh`) en verde — ninguna función nueva ni tocada supera 60 líneas.
3.  **A11y:** botón táctil `btn-touch` (≥36px de alto en la fila, consistente con acciones secundarias existentes), input navegable por teclado con `<label htmlFor>` — cero errores en `eslint-plugin-jsx-a11y`.

---

## 🤖 Instrucciones de Ejecución Autónoma para Agente IA
1. **Fichas creadas/modificadas:**
   - `apps/frontend/src/features/stock/components/RestockInsumoModal.tsx` (nuevo)
   - `apps/frontend/src/features/stock/components/InsumoCatalogPanel.tsx`
   - `apps/frontend/src/features/stock/services/stock.service.ts`
   - `apps/frontend/src/tests/CatalogManagementPanel.test.tsx`
2. **Ejecutar Suite de Pruebas Frontend:** `pnpm --filter @restostock/frontend run test`
3. **Comando de Verificación Total:** `pnpm --filter @restostock/frontend run build && pnpm --filter @restostock/frontend run lint`

---

## 📌 Deuda Registrada
Ninguna deuda propia. Ajuste absoluto de inventario (conteo físico) y registro de proveedor/factura quedan fuera de alcance por decisión explícita — ver `US-013`.
