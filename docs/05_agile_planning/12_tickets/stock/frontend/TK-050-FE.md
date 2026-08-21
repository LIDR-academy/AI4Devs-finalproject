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
*   **Estado de Implementación:** ⚠️ Spec aprobada, **sin implementar**. Ver decisión de alcance en [`15_history.md`](../../../15_history.md) (2026-08-21).

---

## 🔀 Alcance de Modificación (Frontend Architecture)
*   **Componentes UI (`src/features/stock/components/`):** `MovementHistoryPanel.tsx` (tabla de movimientos con filtros de insumo y rango de fechas), reutilizando el mismo patrón visual de `ReportsDashboard.tsx` (selector de rango temporal ya existente en `reports`).
*   **State & API Service (`src/features/stock/services/`):** extender el servicio de stock existente con `getMovementHistory(filters)`, reutilizando el cliente HTTP compartido de `src/shared/http/`.
*   **Control de Acceso:** el panel solo debe renderizarse/navegarse para sesiones con rol `ADMIN`.

---

## ⚠️ Mitigación de Riesgos Técnicos
1.  **Volumen de Datos:** si el historial crece, paginar o limitar el rango de fechas por defecto (ej. últimos 7 días) para evitar tablas excesivamente largas en cliente.
2.  **Reuso de Filtro de Fechas:** no reimplementar el selector de rango temporal — extraerlo a `src/shared/components/` si `reports` y `stock` lo necesitan igual, en vez de duplicarlo (regla de auditoría de reuso de `SK-17`).

---

## ✅ Criterios de Aceptación & DoD (Definition of Done)

### Criterio de Aceptación 1: Consulta con filtro por insumo (Happy Path)
*   **Given** un Administrador autenticado en el panel de auditoría de movimientos
*   **When** selecciona un insumo específico y un rango de fechas
*   **Then** la tabla muestra únicamente los movimientos de ese insumo dentro del rango, con tipo, cantidad, ubicaciones y fecha.

### Criterio de Aceptación 2: Estado vacío
*   **Given** un insumo sin movimientos registrados en el rango seleccionado
*   **When** se aplica el filtro
*   **Then** la UI muestra un estado vacío explícito ("Sin movimientos en este rango"), no una tabla en blanco ni un error.

### DoD Estricto:
1.  **Tests RTL:** pruebas de integración cubriendo listado poblado, filtro aplicado y estado vacío.
2.  **Estados Defensivos:** Loading, Empty, Error (con reintento) y Offline, según `frontend_rules.md`.
3.  **A11y:** tabla navegable por teclado, contraste WCAG 2.2 AA en los filtros.

---

## 🤖 Instrucciones de Ejecución Autónoma para Agente IA
1. **Fichas a crear/modificar:**
   - `apps/frontend/src/features/stock/components/MovementHistoryPanel.tsx`
   - `apps/frontend/src/features/stock/services/stock.service.ts` (extender)
2. **Ejecutar Suite de Pruebas Frontend:** `pnpm test apps/frontend/src/features/stock`
3. **Comando de Verificación Total:** `pnpm run build && pnpm run lint`
