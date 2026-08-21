---
document: technical_ticket
id: TK-050-FE
related_story: US-011
points: 3
type: frontend
status: approved
inputs:
  - docs/05_agile_planning/11_user_stories/stock/US-011.md
  - docs/02_architecture_design/04_technical_design.md
---

# 🎟️ TK-050-FE: Panel de Auditoría de Movimientos de Stock (Frontend)

> **Navegación del Framework SDD:**  
> [⬅️ Volver a US-011 (11_user_stories/stock/US-011.md)](../../../11_user_stories/stock/US-011.md) | [📖 Índice de Tickets (12_indice_tickets.md)](../../indice_tickets.md) | [Siguiente: Matriz de Trazabilidad (13_matriz_trazabilidad.md) ➡️](../../../13_matriz_trazabilidad.md)

---

## 📝 Descripción
Panel de administración web para que un Administrador consulte el historial de movimientos de stock (extracciones, consumos, descartes) filtrado por insumo y rango de fechas, consumiendo `GET /api/v1/stock/movements` (`TK-050`, ya implementado y verificado en backend). Sin este ticket, el historial solo es accesible vía `curl`/Postman.

*   **ID US Relacionada:** `US-011`
*   **Módulo / Vertical Slice:** `stock` (Frontend UI)
*   **Estimación (Story Points):** 3
*   **Prioridad MoSCoW:** Should Have
*   **Prerrequisitos:** `TK-001-FE` (Core Frontend), `TK-050` (API backend ya operativa)
*   **Estado de Implementación:** ✅ Implementado y verificado (build + 67/67 tests frontend, gate de duplicación/complejidad en verde). Ver [`15_history.md`](../../../15_history.md) (2026-08-21).

---

## 🔀 Alcance de Modificación (Frontend Architecture) — como quedó implementado
*   **Componentes UI (`src/features/stock/components/`):** `MovementHistoryPanel.tsx` — tabla de movimientos con filtro por ID de insumo **y** rango de fechas (`input[type=date]`, convertido a ISO 8601 inicio/fin de día antes de llamar al servicio).
*   **API Service:** `src/features/stock/services/stock.service.ts` extendido con `getMovementHistory(filters)` y las interfaces `StockMovementHistoryItem`/`MovementHistoryFilters`, reutilizando `apiRequest` de `src/shared/http/apiClient.ts`.
*   **Componente Compartido Reutilizado:** `src/shared/components/AccessDeniedState.tsx` (extraído durante `TK-049-FE`, en el mismo commit) — el guard de rol `ADMIN` no se duplicó una tercera vez.

---

## ⚠️ Mitigación de Riesgos Técnicos
1.  **Volumen de Datos:** si el historial crece, paginar o limitar el rango de fechas por defecto (ej. últimos 7 días) para evitar tablas excesivamente largas en cliente.
2.  **Reuso de Filtro de Fechas:** no reimplementar el selector de rango temporal — extraerlo a `src/shared/components/` si `reports` y `stock` lo necesitan igual, en vez de duplicarlo (regla de auditoría de reuso de `SK-17`).

---

## ✅ Criterios de Aceptación & DoD (Definition of Done)

### Criterio de Aceptación 1: Consulta con filtro por insumo (Happy Path)
*   **Given** un Administrador autenticado en el panel de auditoría de movimientos
*   **When** ingresa un ID de insumo y confirma la búsqueda
*   **Then** la tabla muestra únicamente los movimientos de ese insumo, con tipo, cantidad, ubicaciones y fecha.

### Criterio de Aceptación 2: Estado vacío
*   **Given** un insumo sin movimientos registrados en el rango seleccionado
*   **When** se aplica el filtro
*   **Then** la UI muestra un estado vacío explícito ("Sin movimientos en este rango"), no una tabla en blanco ni un error.

### DoD Estricto:
1.  **Tests RTL:** 6 pruebas de integración (acceso restringido, no renderiza cerrado, listado real poblado por el backend, filtro de rango de fechas serializado a ISO 8601, estado vacío explícito, error real sin datos sintéticos) — ver `apps/frontend/src/tests/MovementHistoryPanel.test.tsx`.
2.  **Estados Defensivos:** Loading (spinner), Empty ("Sin movimientos registrados en este rango"), Error (`ErrorBanner` con el mensaje real del backend, sin fallback a datos falsos — es un registro de auditoría).
3.  **A11y:** tabla semántica (`<table>`/`<thead>`/`<tbody>`), inputs `input-touch`, cero errores `eslint-plugin-jsx-a11y`.

---

## 🤖 Instrucciones de Ejecución Autónoma para Agente IA
1. **Fichas creadas/modificadas:**
   - `apps/frontend/src/features/stock/components/MovementHistoryPanel.tsx`
   - `apps/frontend/src/features/stock/services/stock.service.ts` (extendido)
   - `apps/frontend/src/App.tsx` (wiring del botón "Movimientos" y el modal)
   - `apps/frontend/src/tests/MovementHistoryPanel.test.tsx`
2. **Ejecutar Suite de Pruebas Frontend:** `pnpm --filter @restostock/frontend run test` — 67/67 en verde.
3. **Comando de Verificación Total:** `pnpm --filter @restostock/frontend run build && pnpm --filter @restostock/frontend run lint && bash docs/04_governance_and_quality/scripts/check_ticket_code_quality.sh && pnpm run duplication` — todos en verde.
