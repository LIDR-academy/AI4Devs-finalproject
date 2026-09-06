# Android Implementation Plan: US-M6 Complete Work Order Tasks

## Overview

Enable Android users to advance tasks and complete them with a required cost. Completing the final task already transitions the OT to `LISTA_PARA_ENTREGA` on the existing API. There is no mobile “complete order” endpoint or physical delivery flow.

**Story:** [`us/movil/US-M6-completar-tareas-android.md`](../../us/movil/US-M6-completar-tareas-android.md)  
**Prerequisites:** US-M4; US-M5 or an OT that already has tasks; existing US-006 PATCH task API.  
**Out of scope:** reopen completed task, contact owner, `ENTREGADA`, technical notes, web/API changes.

## Architecture Context

```text
Task row
  → Start task or CompleteTaskDialog
    → ViewModel.updateTask(taskId, status, cost, costNotes)
      → PATCH /api/work-orders/:workOrderId/tasks/:taskId
      → response workOrder.status
        → LISTA_PARA_ENTREGA banner + read-only detail
```

### Files

```text
apps/android/app/src/main/java/com/mecatrack/mobile/
├── data/api/Dtos.kt                       # UpdateTaskRequest / mutation response
├── data/api/MecaTrackApi.kt               # PATCH task
├── data/repository/MecaTrackRepository.kt # updateTask
├── domain/                                 # task transition/cost validation helpers
├── ui/detail/WorkOrderDetailViewModel.kt  # mutation + ready state
└── ui/detail/WorkOrderDetailScreen.kt     # task actions + cost dialog + banner

apps/android/app/src/test/.../
├── domain/TaskTransitionTest.kt            # NEW
└── ui/detail/WorkOrderDetailViewModelTest.kt

apps/android/README.md
```

## Implementation Steps

### Step 0: Stay on `finalproject-RFM`

- Verify branch before work; no feature branch.

### Step 1: Add failing transition and cost tests

- Pure helper/UI tests cover:
  - `PENDING → IN_PROGRESS`;
  - `PENDING → COMPLETED` shortcut;
  - `IN_PROGRESS → COMPLETED`;
  - `COMPLETED` has no action;
  - completing requires numeric cost ≥ 0 and at most two decimals;
  - optional `costNotes` max 500.
- These helpers guide UI only. The API stays authoritative.

### Step 2: Extend Retrofit and repository

- Add `PATCH("work-orders/{workOrderId}/tasks/{taskId}")`.
- Request has `status`, required `cost` only for `COMPLETED`, optional `costNotes`.
- Model response `{ task, workOrder: { id, status, totalAmount, updatedAt } }`.
- Keep numeric cost precise enough for API serialization; do not parse UI locale formatting in the data layer.

### Step 3: Implement mutation state in detail ViewModel

- Track pending task id, completion dialog fields, validation/API error, and a one-shot *ready for delivery* event.
- Reject mutation locally if OT status is not `EN_PROCESO`.
- Call repository then refresh full detail, using response status to surface completion.
- Map errors:
  - missing/invalid cost → `Indica un costo válido (0 o mayor).`
  - 403/409 → task/order no longer editable;
  - 404/network/5xx → existing Spanish error conventions.

### Step 4: Build task actions and completion dialog

- `PENDING`: **Iniciar** and **Completar**.
- `IN_PROGRESS`: **Completar**.
- `COMPLETED`: read-only with cost and completed date.
- **Completar** opens a dialog: cost required, optional cost note, Cancelar/Confirmar.
- When returned work-order status is `LISTA_PARA_ENTREGA`:
  - show banner **Orden lista para entrega.**
  - remove/disable add and task actions;
  - do not call delivery endpoints or show an `ENTREGADA` control.

### Step 5: Refresh integration

- Returning to US-M2 home must refresh list so it presents **Lista para entrega**.
- Do not remove the OT from home: US-M2 includes ready/owner-contacted orders.

### Step 6: Tests and documentation

- Unit: allowed actions, cost validation, completion response sets ready state, mutation error mapping.
- Emulator: add/choose task → start → complete with cost → complete final task → ready banner → home shows updated status.
- Update Android README with task lifecycle and explicit non-scope delivery.

## Testing Checklist

- [ ] Cost is required only for completion.
- [ ] Completed task cannot be reopened in UI.
- [ ] Last completion shows `LISTA_PARA_ENTREGA`.
- [ ] Post-ready tasks/add actions are unavailable.
- [ ] Home refreshes and preserves ready OT.
- [ ] No delivery endpoint invoked.

## Dependencies

- US-M4, US-M5 where new tasks are required.
- Existing `PATCH /api/work-orders/:workOrderId/tasks/:taskId`.
- No new backend work or dependencies.

## Implementation Verification

- [ ] App never performs status transition business logic itself.
- [ ] `LISTA_PARA_ENTREGA` comes from the server response.
- [ ] Unit tests and full emulator happy path pass.
- [ ] README updated.
