# Android Implementation Plan: US-M5 Add Work Order Tasks

## Overview

Add a task from the US-M4 detail screen while the OT is `EN_PROCESO`. The app consumes the existing `POST /api/work-orders/:workOrderId/tasks` route and refreshes the detail after success.

**Story:** [`us/movil/US-M5-agregar-tareas-android.md`](../../us/movil/US-M5-agregar-tareas-android.md)  
**Prerequisites:** US-M4 DoD; existing US-006 tasks API.  
**Out of scope:** task completion (M6), task editing/reordering, notes, web/API changes.

## Architecture Context

```text
WorkOrderDetailScreen
  → AddTaskDialog
    → WorkOrderDetailViewModel.addTask(description)
      → Repository.addTask(workOrderId, body)
        → POST /api/work-orders/:workOrderId/tasks
      → refresh detail
```

### Files

```text
apps/android/app/src/main/java/com/mecatrack/mobile/
├── data/api/Dtos.kt                       # CreateTaskRequest / task response
├── data/api/MecaTrackApi.kt               # POST tasks
├── data/repository/MecaTrackRepository.kt # addTask
├── ui/detail/WorkOrderDetailViewModel.kt  # mutation state
└── ui/detail/WorkOrderDetailScreen.kt     # CTA + dialog

apps/android/app/src/test/.../
└── ui/detail/WorkOrderDetailViewModelTest.kt # add-task cases

apps/android/README.md
```

## Implementation Steps

### Step 0: Stay on `finalproject-RFM`

- Verify branch; do not create another branch.

### Step 1: Write failing validation tests

- Add pure validation helper or ViewModel-level validation for description.
- Cases:
  - trimmed length 3 and 300 accepted;
  - empty, 1–2, and over 300 rejected;
  - invalid data never calls repository.
- UI messages remain Spanish; test names/code remain English.

### Step 2: Extend API client and repository

- **API:** `@POST("work-orders/{workOrderId}/tasks")`.
- **Body:** `{ description: String }`.
- Reuse detail task DTO response when its shape matches; otherwise add a narrowly typed create response.
- Do not synthesize a task locally: refresh from server after `201`.

### Step 3: Add ViewModel mutation state

- Expose description, validation error, `isAddingTask`, and API error.
- `addTask()` only runs when the currently loaded OT has `status == EN_PROCESO`.
- Map:
  - 400 → description validation;
  - 403/409 → `No se pueden agregar tareas a esta orden.`;
  - 404 → `Orden no encontrada.`;
  - network/5xx → retry copy.
- On success clear dialog state and refresh detail.

### Step 4: Add Compose UI

- Show **Agregar tarea** only for `EN_PROCESO`.
- Dialog contains description input, **Cancelar**, **Guardar**.
- Disable save while invalid or pending; use *Guardando…* while posting.
- For `LISTA_PARA_ENTREGA` and later statuses, do not offer mutation.

### Step 5: Test and document

- Unit: validation, success refresh, 403/409 mapping, no call on non-editable status.
- Emulator: open an in-progress OT → add a task → verify it appears as *Pendiente*.
- Update Android README.

## Testing Checklist

- [ ] Description respects 3–300 range.
- [ ] Successful add returns a server-created `PENDING` row.
- [ ] Adding is unavailable after ready-for-delivery.
- [ ] Failure leaves dialog usable and shows Spanish error.
- [ ] M4 read-only detail still works.

## Dependencies

- US-M4 detail screen.
- Existing `POST /api/work-orders/:workOrderId/tasks`.
- No new dependency, backend endpoint, or migration.

## Implementation Verification

- [ ] Server remains source of truth for editability.
- [ ] Task is refreshed, not manually appended with fabricated fields.
- [ ] Unit tests and emulator smoke pass.
- [ ] README updated.
