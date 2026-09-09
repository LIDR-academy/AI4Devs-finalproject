---
document: technical_ticket
id: TK-080-FE
related_story: US-021
points: 3
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/stock/US-021.md
  - docs/05_agile_planning/12_tickets/stock/backend/TK-080.md
---

# 🎟️ TK-080-FE: Frontend Advertencia de Apertura Duplicada en Extracción

> **Navegación del Framework SDD:**
> [📖 Índice de Tickets](../../indice_tickets.md) | [Anterior: TK-080](../backend/TK-080.md)

---

## 📝 Descripción
En `WarehouseExtractionModal.tsx`, al seleccionar un insumo a extraer, consulta `GET /api/v1/kitchen/remanentes?insumoId=X`. Si la respuesta no está vacía, muestra una advertencia visual no bloqueante (mismo patrón "Soft Limit" ya usado para saturación de almacenes) indicando ubicación y cantidad del remanente existente, sin impedir que el operario confirme la extracción.

---

## 🔀 Alcance de Modificación (Frontend)
- `kitchen.service.ts` / `locations.service.ts`: método `checkActiveRemanente(insumoId: string)`.
- `WarehouseExtractionModal.tsx`: dispara la consulta al cambiar el insumo seleccionado (debounced si aplica); renderiza banner de advertencia no bloqueante con ubicación + cantidad.

---

## ✅ Criterios de Aceptación & DoD
1. **No Bloqueante:** El botón de confirmar extracción permanece habilitado con la advertencia visible (US-021 Escenario 1, decisión de negocio confirmada).
2. **Cualquier Ubicación:** La advertencia aparece sin importar en qué heladera/área esté el remanente existente, no solo la ubicación de destino seleccionada.
3. **Sin Falsos Positivos:** Sin remanentes activos del insumo, no se muestra ninguna advertencia (US-021 Escenario 2).
4. **Guard 29 / Guard 38:** Sin estilos inline, sin `window.alert`/`window.confirm` — banner integrado en el modal.
5. **Verificación:** 100% pruebas pasando (`pnpm test`) y 0 errores de build (`pnpm run build`).
