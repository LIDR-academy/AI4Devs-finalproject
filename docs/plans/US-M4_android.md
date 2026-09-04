# Android Implementation Plan: US-M4 Work Order Detail

## Overview

Replace the US-M2 home-row *Disponible en la web* behavior with a native read-only work-order detail screen. It consumes the existing `GET /api/work-orders/:id` endpoint; no API or web changes.

**Story:** [`us/movil/US-M4-detalle-orden-trabajo-android.md`](../../us/movil/US-M4-detalle-orden-trabajo-android.md)  
**Prerequisites:** US-M1–M3 DoD; API work-order detail endpoint.  
**Out of scope:** task mutations (M5/M6), notes, mileage edits, delivery, iOS.

## Architecture Context

```text
HomeScreen row tap
  → Routes.WORK_ORDER_DETAIL/{id}
    → WorkOrderDetailViewModel
      → MecaTrackRepository.workOrderDetail(id)
        → MecaTrackApi.getWorkOrder(id)
```

### Files

```text
apps/android/app/src/main/java/com/mecatrack/mobile/
├── data/api/Dtos.kt                    # expand full detail/task fields
├── data/api/MecaTrackApi.kt            # GET work-orders/{id}
├── data/repository/MecaTrackRepository.kt # workOrderDetail(id)
├── ui/detail/WorkOrderDetailScreen.kt  # NEW
├── ui/detail/WorkOrderDetailViewModel.kt # NEW
├── ui/nav/MecaTrackNav.kt              # route + factory
└── ui/home/HomeScreen.kt               # row callback

apps/android/app/src/test/.../
├── domain/WorkOrderStatusLabelTest.kt  # extend if needed
└── ui/detail/WorkOrderDetailViewModelTest.kt # NEW, if ViewModel test setup is available

apps/android/README.md
```

## Implementation Steps

### Step 0: Stay on `finalproject-RFM`

- Verify `git branch --show-current`.
- Do not create a feature branch.

### Step 1: Define the complete detail contract

- **Files:** `Dtos.kt`, `MecaTrackApi.kt`, `MecaTrackRepository.kt`
- Add Retrofit `@GET("work-orders/{id}")`.
- Model all fields needed by M4:
  - OT: id, status, entryReason, mileage, checkedInAt, updatedAt, totalAmount, intakeMode, broughtByName.
  - Vehicle, nullable owner, nullable assigned mechanic.
  - Tasks: id, description, status, cost, sortOrder, completedAt.
- Preserve nullable API fields; do not use placeholder values in the data layer.
- Write failing DTO/mapping tests first if the project has direct serialization test coverage.

### Step 2: Add route and home navigation

- **Files:** `MecaTrackNav.kt`, `HomeScreen.kt`
- Add `Routes.WORK_ORDER_DETAIL = "work-order-detail/{workOrderId}"` plus a helper route builder.
- On a home row tap, navigate with the selected item id.
- Pass `onBack` to pop the detail destination.
- Replace the existing web-only snackbar; no fallback navigation to web.

### Step 3: Implement ViewModel state

- **File:** `ui/detail/WorkOrderDetailViewModel.kt`
- State: `isLoading`, `detail`, `errorMessage`.
- `refresh()` calls repository detail endpoint and maps:
  - 404 → `Orden no encontrada.`
  - network/5xx → generic Spanish retry message.
- Load once on screen entry; expose explicit retry.
- Never log owner national ID or other PII.

### Step 4: Build Compose detail UI

- **File:** `WorkOrderDetailScreen.kt`
- Render:
  - app bar **Detalle de orden** and back.
  - plate, vehicle, OT status, reason, party, mechanic, mileage, dates, total.
  - ordered task list with Spanish status labels, completion date, and cost only when present.
- States: loading, error with **Reintentar**, and no-tasks empty copy.
- Keep task rows read-only. M5/M6 own actions.

### Step 5: Tests and documentation

- Unit: detail state success, error, retry; null owner/assigned mechanic; task labels.
- Emulator smoke: login → tap active OT → detail → back.
- Update `apps/android/README.md` with M4 route and `GET /work-orders/:id`.

## Testing Checklist

- [ ] Home row opens the correct detail id.
- [ ] Detail handles ownerless/third-party OT without crash.
- [ ] Tasks render in server order.
- [ ] 404 and network failures expose Spanish retry UI.
- [ ] Back returns to home.

## Dependencies

- Existing Retrofit, Compose, session interceptors, and `GET /api/work-orders/:id`.
- No new package or backend route.

## Implementation Verification

- [ ] API contract fully typed.
- [ ] No task mutation UI included.
- [ ] Android unit tests and emulator smoke pass.
- [ ] README updated.
