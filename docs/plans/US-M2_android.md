# Android Implementation Plan: US-M2 In-Progress Work Orders

## Overview

Replace the US-M1 authenticated **placeholder shell** with the real home screen: a list of **active work orders** from **`GET /api/work-orders/in-progress`**. Same visibility rules as US-D10 (admin = all active; mechanic = assigned only). No new API. No intake wizard (US-M3).

**Architecture principles:** Reuse US-M1 HTTP/session; Compose list; Spanish UI; English code; TDD for party/status labels; **do not** re-filter by role on the client.

**User story:** [`us/movil/US-M2-ordenes-en-curso-android.md`](../../us/movil/US-M2-ordenes-en-curso-android.md)

**Prerequisites:** US-M1 Android DoD (login/session); US-D10 backend (`GET /api/work-orders/in-progress`).

**Out of scope:** Work-order detail, tasks, notes, delivery panel, infinite pagination, intake wizard, changing the API.

---

## Spike handling

`ui/home/HomeScreen.kt`, `HomeViewModel.kt`, and in-progress DTOs may already exist from an earlier spike and are **unwired** (nav still shows `AuthenticatedShellScreen`).

**That is not DoD.** Execute this plan:

1. Write **label unit tests first** (party + status). Spike home must use those helpers, not inline copy.
2. Wire home as the post-login destination; remove the M1 placeholder from the nav graph.
3. **Do not** wire `ui/intake/**`. FAB may exist but must **not** open the wizard.
4. Confirm Retrofit call uses `limit=50`, `offset=0` (API max 50).
5. Load errors: Spanish *No se pudieron cargar las órdenes.* + **Reintentar**. Do not show raw English API bodies on this screen.
6. Do not log `nationalId`.

---

## Architecture Context

### Stack

Same as US-M1: Kotlin, Compose, Retrofit, `AppContainer`, JUnit unit tests.

### API contract (consume as-is)

`GET /api/work-orders/in-progress?limit=50&offset=0`

Auth: Bearer (US-M1 interceptor) + `X-MecaTrack-Client: mobile`.

Role filtering is **server-side**. The app must not hide rows by `assignedMechanicId`.

```kotlin
data class InProgressResponse(
    val items: List<InProgressItemDto>,
    val total: Int,
    val limit: Int,
    val offset: Int,
)
```

Item fields (locked, match D10): `id`, `status`, `entryReason`, `checkedInAt`, `updatedAt`, `vehicle { id, licensePlate, brand, model }`, `owner { fullName, nationalId }?`, `broughtByName`, `intakeMode`, `assignedMechanic { id, fullName, role }?`.

Empty list = `200` + `items: []`, `total: 0` (not an error).

### Locked UI decisions

| Topic | Decision |
|-------|----------|
| Row tap | Snackbar **Disponible en la web** (no detail screen) |
| FAB **Nueva orden** | Visible. On click: snackbar **Próximamente** (US-M3 will navigate). Do **not** open intake. |
| `total > 50` | Show the 50 items + footer *Hay más órdenes en la web.* |
| Refresh | Load on enter; **Reintentar** on error. Pull-to-refresh optional. |
| Logout | Keep US-M1 app-bar action |

### Screens

| Route | Access | Purpose |
|-------|--------|---------|
| Login | Public | Unchanged (US-M1) |
| Home (`shell` or `home`) | Authenticated | In-progress list |

Start destination if logged in: **home list**, not the M1 placeholder.

### Files to add/modify

```
apps/android/app/src/main/java/com/mecatrack/mobile/
├── data/api/Dtos.kt                 # verify InProgress* matches D10 (vehicle.id)
├── data/api/MecaTrackApi.kt         # GET in-progress limit=50
├── data/repository/MecaTrackRepository.kt  # inProgress(limit=50, offset=0)
├── domain/InProgressPartyLabel.kt   # NEW
├── domain/WorkOrderStatusLabel.kt   # NEW
├── ui/home/HomeViewModel.kt         # loading / items / total / error / retry / logout
├── ui/home/HomeScreen.kt            # list UI
├── ui/nav/MecaTrackNav.kt           # home instead of AuthenticatedShellScreen
└── ui/shell/AuthenticatedShellScreen.kt  # stop using in nav (may delete or leave unused)

apps/android/app/src/test/java/com/mecatrack/mobile/domain/
├── InProgressPartyLabelTest.kt      # NEW
└── WorkOrderStatusLabelTest.kt      # NEW

apps/android/README.md               # MOD: home + GET in-progress
```

**Do not modify:** `apps/api`, `apps/web`, intake wizard files (except not wiring them).

---

## Implementation Steps

### Step 0: Stay on `finalproject-RFM`

- **Action:** Do **not** create `feature/US-M2-android`.
- **Steps:** `git branch --show-current` → `finalproject-RFM`.

---

### Step 1: Unit tests for labels (TDD)

- **Files:** `domain/InProgressPartyLabel.kt`, `domain/WorkOrderStatusLabel.kt` + tests.
- **Party** (`inProgressPartyLabel(ownerFullName, broughtByName)` or equivalent on the DTO):

| owner.fullName | broughtByName | Label |
|----------------|---------------|--------|
| `"Ana"` | anything | `Ana` |
| null / blank | `"Carlos"` | `Traído por Carlos` |
| null / blank | null / blank | `Sin propietario` |

- **Status:**

| API | UI |
|-----|-----|
| `EN_PROCESO` | En proceso |
| `LISTA_PARA_ENTREGA` | Lista para entrega |
| `OWNER_CONTACTED` | Propietario contactado |
| unknown / `ENTREGADA` (should not appear) | return the raw status or `En proceso` — pick **raw status** so a leak is visible |

- **Notes:** Run unit tests → red if helpers missing. Home rows **must** call these helpers.

---

### Step 2: API client + repository

- **Action:** Ensure `GET work-orders/in-progress?limit=50&offset=0`.
- **Repository:** `suspend fun inProgress(): InProgressResponse` — do not accept client role filters.
- **Errors:** Let `HttpException` bubble; ViewModel maps to the load-error copy. `401` refresh is US-M1 authenticator.

---

### Step 3: HomeViewModel

- **State:** `user`, `items`, `total`, `isLoading`, `errorMessage`.
- **Actions:** `refresh()`, `logout(onLoggedOut)`.
- **Load:** set loading; on success clear error and set items/total; on failure `errorMessage = "No se pudieron cargar las órdenes."` (keep previous items if any, optional).
- **Call `refresh()` in `init`.**
- **Implementation Notes:** Do not parse `nationalId` into logs. Do not filter `items` by mechanic id.

---

### Step 4: Home UI + navigation

- **Title:** **Órdenes en curso**
- **Subtitle:** `{fullName} · {role}`
- **Row:** plate (emphasized), `{brand} {model}`, party label, status label, entry reason (max ~2 lines)
- **Empty:** *No hay órdenes en curso.*
- **Loading:** *Cargando órdenes…* or indicator
- **Error:** banner + **Reintentar**
- **FAB:** snackbar **Próximamente**
- **Row click:** snackbar **Disponible en la web**
- **Nav:** post-login and cold start → Home. Drop `AuthenticatedShellScreen` from the graph.
- **Logout:** existing repository logout + navigate to login (pop home).

---

### Step 5: README + smoke

- Document `GET /api/work-orders/in-progress` on the home screen.
- Manual: login admin vs mechanic (compare with web `/work-orders/in-progress`); empty list; airplane mode → error + retry; logout still works.
- Mark `us/movil/README.md` M2 Implemented only after DoD.

---

## Implementation Order

1. Step 0 — Branch
2. Step 1 — Label tests + helpers
3. Step 2 — API `limit=50`
4. Step 3 — ViewModel
5. Step 4 — Home UI + nav
6. Step 5 — README + smoke

---

## Testing Checklist

- [x] Unit: party label (owner / broughtBy / none)
- [x] Unit: status labels
- [ ] Manual admin sees unassigned/other mechanics’ active OTs (if data exists)
- [ ] Manual mechanic does not see another mechanic’s OT
- [ ] Empty copy, no crash
- [ ] Error + retry
- [ ] M1 login/logout regression
- [ ] FAB does not open intake

---

## Error Response Format

List load failures → single Spanish sentence (above). Login errors stay on `AuthErrorMapper` (US-M1). Empty `200` is not an error.

---

## Dependencies

| Dependency | Required? |
|------------|-----------|
| New npm / API change | **No** |
| US-M1 session/HTTP | **Yes** |
| US-D10 `GET in-progress` | **Yes** |

---

## Notes

- Branch: **`finalproject-RFM` only**.
- Home **is** the D10 list (not a 5-row widget). No “Ver todas”.
- US-M3 will change FAB from snackbar to the intake wizard.

---

## Next Steps After Implementation

1. Write **`docs/plans/US-M3_android.md`** only after this DoD.
2. Commit when the user requests.

---

## Implementation Verification

- [x] Home list matches enhanced US-M2 §1–3
- [x] Labels unit-tested and used in rows
- [x] No role filter on the client
- [x] No wizard
- [x] README updated
- [x] Branch still `finalproject-RFM`
