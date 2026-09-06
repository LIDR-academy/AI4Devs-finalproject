# Android Implementation Plan: US-M3 Intake Wizard (Client + Vehicle + Work Order)

## Overview

Wire the **Nueva orden** CTA on the US-M2 home into a **4-step intake wizard** on Android. The app **orchestrates** existing APIs (search/create client, search/create vehicle, active WO, mechanics, create WO). No composite endpoint. Happy path: **unknown plate → register client → register vehicle → create OT**. US-D9 (no owner) is secondary and implemented **last**.

**Architecture principles:** Reuse US-M1 HTTP/session; Compose wizard; Spanish UI; English code; TDD for validators and 409 JSON **before** wiring navigation; server owns uniqueness / one active OT / owner snapshot.

**User story:** [`us/movil/US-M3-ingreso-ot-cliente-vehiculo-android.md`](../../us/movil/US-M3-ingreso-ot-cliente-vehiculo-android.md)

**Prerequisites:** US-M2 Android DoD (home list + FAB placeholder); US-003 / US-004 / US-005 / US-D7 / US-D8 / US-D9 APIs already in Nest.

**Out of scope:** New API routes, web changes, OT detail/tasks/notes, camera/OCR, multi-row initial tasks (web keeps N; Android MVP = **one** task), iOS.

---

## Spike handling

`ui/intake/**`, `domain/IntakeValidators.kt`, `domain/ApiErrors.kt`, and client/vehicle/WO Retrofit methods already exist from an earlier spike and are **unwired** (home FAB still shows **Próximamente**).

**That is not DoD.** Execute this plan:

1. **Expand unit tests first** (validators + 409 `existingClient` / `existingVehicle` / `activeWorkOrderId`). Spike helpers that fail the new tests must be fixed before UI wiring.
2. Align **copy and behaviour** with the enhanced US (tables below). Do not keep spike extras that contradict the story.
3. Wire FAB → intake; **refresh home** when the wizard is closed.
4. Implement D9 (**Continuar sin propietario**) **after** the owner happy path works.
5. Do not log `nationalId` or phones.
6. Do not change `apps/api` or `apps/web`.

### Spike gaps to close (locked)

| Spike today | Required |
|-------------|----------|
| Empty plate search extra sentence | Exact: *No se encontró esa placa* + **Registrar cliente y vehículo** |
| Step 3 checkbox “Registrar sin propietario” | **Remove.** D9 only via step 2 **Continuar sin propietario** |
| Active OT short error on submit | Block submit + copy: *Este vehículo ya tiene una orden activa. No se puede crear otra hasta entregarla.* |
| `POST /work-orders` 409 | Same block if body has `activeWorkOrderId` |
| `POST /vehicles` 409 `existingVehicle` | Resolve that plate → **step 4** (same as **Seleccionar**), do not stay on step 3 duplicating |
| `readApiError` network: `throwable.message` / *Error de red* | Non-HTTP: *Error de conexión. Verifica tu red e intenta de nuevo.* HTTP 400: API `message` string or joined array |
| Home does not refresh on resume | Refresh list when returning from intake (and on home `ON_RESUME`) |

Reuse spike structure (`IntakeStep`, debounce 300 ms, Retrofit DTOs) **only** where it matches this plan.

---

## Architecture Context

### Stack

Same as US-M1/M2: Kotlin, Compose, Retrofit, `AppContainer`, JUnit. HTTP timeout already 20 s.

### API contract (consume as-is)

Auth: Bearer (US-M1 interceptor) + `X-MecaTrack-Client: mobile`. Roles: `ADMIN`, `MECHANIC`.

| Step | Method | Path |
|------|--------|------|
| 1 | `GET` | `/api/vehicles/search?q=` (`q` trim length ≥ 2) |
| 2 | `GET` | `/api/clients/search?q=` (same min length) |
| 2 | `POST` | `/api/clients` `{ fullName, nationalId, phone?, email? }` |
| 3 | `POST` | `/api/vehicles` `{ licensePlate, brand, model, year, color?, clientId? }` |
| 4 | `GET` | `/api/work-orders/active?vehicleId=` |
| 4 | `GET` | `/api/work-orders/mechanics` (includes `ADMIN` with `canActAsMechanic`) |
| 4 | `POST` | `/api/work-orders` |

**Create WO — owner present** (omit `intakeMode`; never send `OWNER` if `currentOwner == null`):

```json
{
  "vehicleId": "uuid",
  "entryReason": "Ruido en motor al frenar",
  "mileage": 12000,
  "assignedMechanicId": "uuid",
  "initialTasks": [{ "description": "Revisar frenos" }]
}
```

Omit `mileage` / `assignedMechanicId` when empty. **Third party:** add `"intakeMode": "THIRD_PARTY"`, `"broughtByName"`, optional `"broughtByPhone"`.

Empty search = `200` + `items: []` (not an error).

### Locked UI decisions

| Topic | Decision |
|-------|----------|
| Entry | Home FAB **Nueva orden** → route `intake` |
| Back | Steps 2–4: previous step. Step 1 or success: pop to home |
| Success CTA | **Volver al panel** → home **refreshed** |
| Initial tasks | **One** field only |
| Mechanic | List + **Sin asignar** (omit id). No extra UI chrome required |
| D9 | Secondary button on step 2 only; implement last |
| Debounce | 300 ms on plate and client search |
| 409 client | Continue to step 3 with `existingClient`; copy: *Ya existía un cliente con esa identificación; se usará ese registro.* |

### Screens / routes

| Route | Access | Purpose |
|-------|--------|---------|
| `login` | Public | Unchanged (US-M1) |
| `home` | Authenticated | US-M2 list; FAB opens intake |
| `intake` | Authenticated | Wizard; ViewModel scoped to this destination so a new visit starts at step 1 |

### Files to add/modify

```
apps/android/app/src/main/java/com/mecatrack/mobile/
├── data/api/Dtos.kt                 # verify create/search/409 fields
├── data/api/MecaTrackApi.kt         # clients, vehicles, active, mechanics, POST WO
├── data/api/Network.kt              # Spanish network fallback in readApiError
├── data/repository/MecaTrackRepository.kt  # already has methods; keep, no role filters
├── domain/IntakeValidators.kt       # MOD to match US ranges (tests first)
├── domain/ApiErrors.kt              # parse 409 extras (tests first)
├── ui/intake/IntakeViewModel.kt     # MOD to this plan
├── ui/intake/IntakeWizardScreen.kt  # MOD copy + D9 last
├── ui/home/HomeScreen.kt            # FAB navigates
├── ui/home/HomeViewModel.kt         # refresh on demand (already has refresh())
└── ui/nav/MecaTrackNav.kt           # intake route; pop + home refresh

apps/android/app/src/test/java/com/mecatrack/mobile/domain/
├── IntakeValidatorsTest.kt         # expand
└── ApiErrorsTest.kt                # existingVehicle + activeWorkOrderId

apps/android/README.md               # MOD: intake flow + endpoints
```

**Do not modify:** `apps/api`, `apps/web`.

---

## Implementation Steps

### Step 0: Stay on `finalproject-RFM`

- **Action:** Do **not** create `feature/US-M3-android`.
- **Steps:** `git branch --show-current` → `finalproject-RFM`.

---

### Step 1: Validators — failing tests then implementation (TDD)

- **Files:** `IntakeValidators.kt` + `IntakeValidatorsTest.kt`
- **Cover at least:**

| Helper | Cases |
|--------|--------|
| `normalizePlate` | trim, uppercase, strip spaces |
| `validatePlate` | &lt;2, &gt;15, valid 2–15 |
| `validateClient` | name 2–150; nationalId 5–20 + `^[a-zA-Z0-9-]+$`; phone optional 8–15 digits after strip non-digits; email optional format |
| `validateVehicle` | plate; brand/model 1–60; year 1900–(current+1); color max 40 |
| `validateWorkOrder` | reason 5–500; mileage empty omit / integer ≥ 0; task 3–300; `requiresBroughtBy=true` name 2–150 and optional phone digits; `false` does not require broughtBy |

- **Notes:** Return **Spanish** validation strings (UI). Test names in English. Do not proceed to wizard wiring until these tests pass.

---

### Step 2: 409 JSON parsing (TDD)

- **Files:** `ApiErrors.kt` / `ApiErrorBody` + `ApiErrorsTest.kt`
- **Action:** Keep string + array `message`. Add tests that decode:
  - `existingClient` (id, fullName, nationalId)
  - `existingVehicle` (id, licensePlate, brand, model, year)
  - `activeWorkOrderId`
- **`readApiError`:** non-`HttpException` → `AuthErrorMapper.NETWORK` (same sentence as login). Do not put `nationalId` into log statements.

---

### Step 3: Confirm API client + repository

- **Action:** Methods already listed on `MecaTrackApi` / `MecaTrackRepository` must stay; no client-side role filter.
- **Create vehicle:** send `clientId` only when an owner was chosen; omit when `withoutOwner`.
- **Create WO:** `initialTasks` length 1; `intakeMode` only `THIRD_PARTY` when `currentOwner == null`.

---

### Step 4: Wizard ViewModel — owner happy path (steps 1–4 + success)

- **File:** `IntakeViewModel.kt`
- **State:** keep a single `IntakeUiState` (step, queries, selected client/vehicle, form fields, mechanics, `activeWorkOrder`, `createdWorkOrder`, loading, error).
- **Step 1:** debounce 300 ms; `q.length < 2` clears results and does not call the API; `vehicleSearchDone` only after a completed search.
- **Seleccionar:** load `active` + `mechanics`, go to **CREATE_ORDER**.
- **Registrar cliente y vehículo:** step 2; prefill `vehiclePlate` with `normalizePlate(plateQuery)`.
- **Usar este cliente / POST client success / 409 existingClient:** step 3 with `selectedClient`, `withoutOwner = false`.
- **POST vehicle success:** same as **Seleccionar**.
- **POST vehicle 409 + existingVehicle:** search that plate (or select by id) and enter step 4; do not POST again.
- **Step 4:** if `activeWorkOrder != null`, do not submit. On 409 `activeWorkOrderId`, set blocked state + same copy.
- **Success:** `IntakeStep.SUCCESS` with placa, motivo, owner name if present.

Do **not** implement `skipClientAndRegisterVehicle` / `withoutOwner` in this step (leave D9 for Step 7). Hide or disable the secondary button until then.

---

### Step 5: Wizard UI copy (owner path)

- **File:** `IntakeWizardScreen.kt`
- **Step 1 copy:** *Paso 1 — Busca por placa. Si no existe, registra cliente y vehículo.*
- Results: plate; `{brand} {model} {year}`; `Propietario: {fullName \| Sin propietario}`; **Seleccionar**.
- Zero results (search done, not loading): *No se encontró esa placa* + **Registrar cliente y vehículo**.
- Step 2: search + create fields; CTA **Crear cliente y continuar**. No D9 button yet.
- Step 3: placa prefilled; show *Propietario: {name}*; fields per US table; **Registrar vehículo y continuar** (or equivalent). **No** without-owner checkbox.
- Step 4: vehicle summary; block banner if active; form fields; **Crear orden de trabajo**.
- Success: confirmation + **Volver al panel**.
- Back affordance as locked table.

---

### Step 6: Navigation + home refresh

- **Files:** `MecaTrackNav.kt`, `HomeScreen.kt`
- **FAB:** `navController.navigate(Routes.INTAKE)` (replace snackbar **Próximamente**).
- **Close intake:** `popBackStack` to `home`.
- **Refresh:** `HomeScreen` / `HomeViewModel.refresh()` on `Lifecycle.Event.ON_RESUME` (covers return from wizard and US-M2 “refresh when entering home”).
- Intake `ViewModel` must **not** be shared with Home (default nav-scoped factory is enough).

---

### Step 7: US-D9 last

- **Action:** Enable **Continuar sin propietario** on step 2 → step 3 with `clientId` omitted, label *Sin propietario*.
- Step 4: show broughtBy fields; POST `intakeMode=THIRD_PARTY` + `broughtByName` (+ phone if present).
- Never send `OWNER` when `currentOwner == null`.
- Validators already require broughtBy when `requiresBroughtBy`.

---

### Step 8: README + smoke

- Document wizard steps and the seven endpoints.
- Manual: unknown plate + new client + vehicle + OT appears on home (admin, or mechanic if assigned to self).
- Manual: existing plate → step 4; active OT blocks; D9 third party.
- Regression: M1 login/logout; M2 list.
- Mark `us/movil/README.md` M3 **Implemented** only after DoD.

---

## Implementation Order

1. Step 0 — Branch
2. Step 1 — Validator tests + helpers
3. Step 2 — 409 parse + network copy
4. Step 3 — API/repository check
5. Step 4 — ViewModel owner path
6. Step 5 — Wizard UI
7. Step 6 — Nav + home refresh
8. Step 7 — D9
9. Step 8 — README + smoke

---

## Testing Checklist

- [x] Unit: plate / client / vehicle / WO ranges
- [x] Unit: broughtBy required only without owner
- [x] Unit: 409 `existingClient`, `existingVehicle`, `activeWorkOrderId`
- [ ] Manual happy path (new plate + client + vehicle + OT → home)
- [ ] Manual existing plate
- [ ] Manual active OT block
- [ ] Manual D9
- [ ] M1/M2 regression
- [x] FAB no longer shows only **Próximamente**

---

## Error Response Format

| Case | UI |
|------|-----|
| Local validation | Spanish strings from `IntakeValidators` |
| `400` | API `message` (string or array joined) |
| `409` existing client | Fixed Spanish sentence (above) + continue |
| `409` existing vehicle | Continue to step 4; optional short notice |
| `409` active WO | Block copy (above) |
| Network / 5xx | *Error de conexión. Verifica tu red e intenta de nuevo.* |
| Empty search | Not an error |

---

## Dependencies

| Dependency | Required? |
|------------|-----------|
| New npm / API change | **No** |
| US-M1 session/HTTP | **Yes** |
| US-M2 home + FAB | **Yes** |
| US-003/004/005/D7/D8/D9 APIs | **Yes** |

---

## Notes

- Branch: **`finalproject-RFM` only**.
- Client orchestrates; server authorizes.
- Demo first: **unknown plate with owner**. D9 is the inter-workshop escape, not the default.
- One initial task on Android; web still allows N.

---

## Next Steps After Implementation

1. No further native story in `us/movil/` after M3 unless product adds one.
2. Commit when the user requests.

---

## Implementation Verification

- [x] AC §1–7 of enhanced US-M3
- [x] Tests §9 (unit; manual smoke in Android Studio)
- [x] Docs §11
- [x] D9 last, not default
- [x] No API/web edits
- [x] Branch still `finalproject-RFM`
