---
document: technical_ticket
id: TK-107-FE
related_story: US-030
points: 3
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/kitchen/US-030.md
  - docs/02_architecture_design/adr/ADR-004-consumption-reason-catalog.md
---

# 🎟️ TK-107-FE: Panel de Administración de Motivos de Consumo (Frontend)

> [⬅️ US-030](../../../11_user_stories/kitchen/US-030.md) | [📖 Índice](../../indice_tickets.md)

## 📝 Descripción
Pantalla de gestión del catálogo en `/ajustes`, mismo patrón que `RolesManagementPanel` (US-015): lista + alta + edición de etiqueta + toggle activar/desactivar. Sin botón de borrar (ADR-004 §3.1).

*   **US:** `US-030` · **Slice:** `kitchen` UI · **SP:** 3 · **MoSCoW:** Should Have · **Prioridad:** 🟡 P1
*   **Prerrequisitos:** `TK-107`

## 🔀 Alcance (UI)
*   `consumptionReasons.service.ts`: `list(includeInactive?)`, `create(label)`, `update(id, {label?, isActive?})`.
*   `ConsumptionReasonsManagementPanel.tsx` (nuevo, en `/ajustes`) — tabla/lista con motivo + estado + toggle; formulario de alta inline.
*   Guard 29 / Guard 38.

## ✅ DoD
1. Test de componente: alta agrega a la lista; toggle desactivar oculta el motivo de la vista "activos" (si aplica el filtro) o lo marca visualmente inactivo.
2. Sin regresiones frontend; sin código muerto / estilos inline nuevos.
3. **Commit:** `feat(kitchen): consumption reason catalog admin panel (TK-107-FE)`.

## 📌 Notas de implementación
*   **Nueva sub-ruta `/ajustes/motivos`:** quinta pestaña de `AjustesLayout` (junto a Configuración/Personal/Roles/Movimientos), ADMIN-only vía el `<ProtectedRoute requiredRole="ADMIN">` que ya envuelve todo `/ajustes` — no hizo falta un guard adicional por ruta.
*   **El panel siempre pide `includeInactive=true`:** a diferencia del futuro selector de motivo en el modal de consumo (`TK-108-FE`, que solo necesita los activos), este panel es de administración — necesita ver y poder reactivar los inactivos. Como el panel entero ya es ADMIN-only, el `includeInactive=true` del backend nunca choca con el guard de rol de `TK-107`.
*   **Sin botón de eliminar:** a diferencia de `LocationsManagementModal` (que sí borra), aquí solo hay alta + edición de etiqueta (inline, patrón de `UserStatusForm`) + toggle activar/desactivar — ADR-004 §3.1 es explícito en "desactivar, nunca borrar".
*   **`autoFocus` evitado (`jsx-a11y/no-autofocus`):** el foco del input de edición inline se dispara vía `useRef` + `useEffect` en su lugar.
*   DoD #1: cubierto con 4 tests de componente (listar, alta agrega a la lista, desactivar marca visualmente inactivo sin quitarlo de la lista ni mostrar botón de borrado, renombrar vía el formulario inline).
