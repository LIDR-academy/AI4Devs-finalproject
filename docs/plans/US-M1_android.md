# Android Implementation Plan: US-M1 Login and Session

## Overview

Build the **MecaTrack Android client** (`apps/android`) so a mechanic or admin can **sign in**, **keep a session** (access + refresh without cookies), **log out**, and land on a **minimal authenticated shell**. Data comes from the US-M1 backend contract (`X-MecaTrack-Client: mobile` + refresh body).

**Architecture principles:** Kotlin + Jetpack Compose; HTTP via Retrofit; English code / Spanish UI; TDD for error mapping; no duplicated workshop rules; Bearer + mobile header on business calls.

**User story:** [`us/movil/US-M1-autenticacion-android.md`](../../us/movil/US-M1-autenticacion-android.md)

**Backend plan (done):** [`docs/plans/US-M1_backend.md`](./US-M1_backend.md)

**Prerequisites:** US-M1 **backend DoD** (`POST /api/auth/login` with header returns `refreshToken`; `POST /api/auth/refresh` accepts body). API running locally for manual smoke.

**Out of scope:** In-progress list fetch (US-M2), intake wizard (US-M3), iOS, biometrics, password recovery, changing the API.

---

## Spike handling

`apps/android` may already exist (login + home list + intake wizard).

**That is not DoD for US-M1.** Execute this plan against the enhanced US:

1. Reuse Gradle / HTTP / login **only** if they match this contract (mobile header, body refresh, no JSON refresh leak on the API side — client always sends the header).
2. **Do not** implement or expand the OT wizard or in-progress list in this story.
3. If spike home already calls `GET /in-progress`, leave it unused or replace with the placeholder shell below until US-M2.
4. Unit tests must cover **Spanish** login error mapping (`401`/`403`/`429`/network), not only raw English API `message`.
5. Login **must fail** if the mobile response has no `refreshToken`.

---

## Architecture Context

### Stack

| Layer | Technology |
|-------|------------|
| UI | Jetpack Compose + Material 3 |
| Language | Kotlin, JVM 17 |
| minSdk / compileSdk / targetSdk | 26 / 35 / 35 |
| HTTP | Retrofit 2 + OkHttp + kotlinx.serialization (`ignoreUnknownKeys`, `explicitNulls = false`) |
| Session | `SessionStore` + private SharedPreferences (`allowBackup=false`). EncryptedSharedPreferences if it adds little friction |
| DI | Simple `AppContainer` (no Hilt required) |
| Tests | JUnit 4 unit tests (no emulator required for DoD) |

### API contract (consume as-is)

Always send `X-MecaTrack-Client: mobile`.

| Call | Method | Body | Notes |
|------|--------|------|--------|
| Login | `POST /auth/login` | `{ email, password }` | Persist `accessToken` + `refreshToken` + `user` |
| Refresh | `POST /auth/refresh` | `{ refreshToken }` | Persist new access; persist new refresh if present |
| Logout | `POST /auth/logout` | — | Bearer; ignore network failure then clear local |
| Me (optional) | `GET /auth/me` | — | Cold-start validation |

Retrofit `baseUrl` must include trailing `/api/` (Nest global prefix).

**Debug emulator URL:** `http://10.0.2.2:4000/api/`  
**Physical device:** LAN IP via `BuildConfig.API_BASE_URL`  
**Release:** HTTPS only; no cleartext.

### Screens (M1 only)

| Route | Access | Purpose |
|-------|--------|---------|
| Login | Public | Email + password |
| Shell | Authenticated | `{fullName} · {role}`, placeholder copy, **Cerrar sesión** |

Start destination: shell if `SessionStore.isLoggedIn()`, else login.

### Files to add/modify

```
apps/android/
├── README.md
├── settings.gradle.kts
├── build.gradle.kts
├── gradle.properties
├── app/build.gradle.kts
└── app/src/
    ├── main/AndroidManifest.xml          # INTERNET, allowBackup=false, networkSecurityConfig
    ├── main/res/xml/network_security_config.xml
    └── main/java/com/mecatrack/mobile/
        ├── MecaTrackApp.kt
        ├── MainActivity.kt
        ├── di/AppContainer.kt
        ├── data/api/                     # DTOs, MecaTrackApi, interceptors, authenticator
        ├── data/session/                 # SessionStore
        ├── data/repository/              # login / logout / refresh
        ├── domain/ApiErrors.kt           # parse JSON errors
        ├── domain/AuthErrorMapper.kt     # NEW: Spanish UI copy (web-aligned)
        └── ui/
            ├── login/                    # LoginScreen + ViewModel
            ├── shell/                    # Authenticated placeholder + logout
            ├── nav/                      # NavHost login ↔ shell
            └── theme/
    └── test/java/com/mecatrack/mobile/domain/
        ├── ApiErrorsTest.kt
        └── AuthErrorMapperTest.kt        # NEW
```

**Do not add in this story:** `ui/intake/**`, in-progress DTOs/list UI (US-M2/M3).

**Do not modify:** `apps/api`, `apps/web`.

---

## Implementation Steps

### Step 0: Stay on `finalproject-RFM`

- **Action:** Do **not** create `feature/US-M1-android`.
- **Steps:** `git branch --show-current` → `finalproject-RFM`.
- **Notes:** Same delivery line as US-M1 backend.

---

### Step 1: Unit tests for error mapping (TDD)

- **Files:** `domain/ApiErrors.kt`, `domain/AuthErrorMapper.kt`, matching `*Test.kt`
- **Action:** Parse Nest `{ statusCode, message }` (`message` string or array). Map to **Spanish UI** like web `mapAuthError`.
- **Cases (minimum):**

| Input | UI string |
|-------|-----------|
| `statusCode` 401 or 403 | `Correo o contraseña incorrectos` |
| `statusCode` 429 | `Demasiados intentos. Intenta de nuevo más tarde.` |
| `statusCode` 400 + `"email must be an email"` | show API validation text (or array joined) |
| No HTTP / timeout / parse failure | `Error de conexión. Verifica tu red e intenta de nuevo.` |

- **Implementation Notes:** Run `./gradlew :app:test` (or Android Studio unit test) → red if mapper missing. Do **not** show English `"Invalid email or password"` on login.

---

### Step 2: Gradle module + manifest

- **Action:** Application module `com.mecatrack.mobile` if missing; `buildConfigField API_BASE_URL`; Compose + serialization + Retrofit + OkHttp logging.
- **Manifest:** `INTERNET`; `android:allowBackup="false"`; debug cleartext via `network_security_config` / `usesCleartextTraffic` **debug only** if possible (or document that release must use HTTPS).
- **Notes:** If the wrapper JAR is missing, Android Studio sync generates it. Do not commit `local.properties` or keystores.

---

### Step 3: Session store + HTTP client

- **SessionStore:** `get/save/clear` access, refresh, `UserSession(id, email, fullName, role)`. `isLoggedIn()` = access present **and** user present.
- **Interceptors:**
  1. Always `X-MecaTrack-Client: mobile`
  2. `Authorization: Bearer` except `auth/login` and `auth/refresh`
- **Authenticator:** on `401` of a business call, `POST auth/refresh` with stored refresh on a **client without authenticator** (avoid loops). Retry **once**. If refresh fails, return null (UI will send user to login).
- **Json:** `ignoreUnknownKeys = true`, `explicitNulls = false`.
- **Logging:** OkHttp `BASIC` in debug; **never** log Authorization or bodies in release.

---

### Step 4: Repository login/logout

- **login:** `POST auth/login`. If `refreshToken` is null/blank → fail (do not persist a cookie-only session). Save tokens + user.
- **logout:** `POST auth/logout` (catch errors) then `sessionStore.clear()`.
- **Implementation Notes:** Email trim; password as typed. No client-side min-length beyond “not blank” + email format (API owns password rules).

---

### Step 5: Login UI

Copy from enhanced US-M1 §3:

- Title **MecaTrack**, subtitle **Ingreso de taller**, fields **Correo** / **Contraseña**, CTA **Entrar**
- Disable CTA or show spinner while loading
- Local: both fields required; email format
- Errors via `AuthErrorMapper`
- Success → navigate to shell, pop login (no back to login)

---

### Step 6: Authenticated shell + navigation

- Show `{fullName} · {role}` and **Cerrar sesión**
- Placeholder: *Las órdenes en curso estarán en una próxima versión.* (or equivalent). **No** `GET /work-orders/in-progress` in this story
- Cold start: if logged in → shell; else login
- Optional: `GET /auth/me` on shell start; on unrecoverable 401 → clear + login

---

### Step 7: README + smoke

- **`apps/android/README.md`:** open in Android Studio, emulator URL `10.0.2.2`, seed users `mechanic@taller.com` / `MechanicPass123`, `admin@taller.com` / `AdminPass123`, physical-device IP note
- **Manual:** login, kill app, reopen (still in shell), logout, bad password generic error
- Do **not** mark `us/movil/README.md` M1 fully Implemented until this DoD (backend already done)

---

## Implementation Order

1. Step 0 — Branch
2. Step 1 — Failing mapper tests
3. Step 2 — Gradle + manifest
4. Step 3 — Session + HTTP
5. Step 4 — Repository
6. Step 5 — Login UI
7. Step 6 — Shell + nav
8. Step 7 — README + smoke

---

## Testing Checklist

- [ ] Unit: 401/403 → generic Spanish; 429; 400 validation; network fallback
- [ ] Unit: parse string vs array `message`
- [ ] Manual: valid login; invalid password; inactive account looks the same as invalid; logout; process death keeps session
- [ ] Login without `refreshToken` in JSON does not persist session
- [ ] No instrumented Espresso required for this DoD

---

## Error Response Format

Client parses API JSON:

```json
{ "statusCode": 401, "message": "Invalid email or password", "error": "Unauthorized" }
```

UI never displays that English login message; it uses the Spanish table above. `400` may show the API validation `message`.

---

## Dependencies

| Dependency | Required? |
|------------|-----------|
| New npm in `apps/api` / `apps/web` | **No** |
| AndroidX Compose, Retrofit, OkHttp, kotlinx.serialization | **Yes** (app module) |
| Hilt / Room / DataStore | **No** for M1 |

---

## Notes

- Branch: **`finalproject-RFM` only**.
- CORS is irrelevant; do not change `CORS_ORIGIN` for this app.
- Rate limit is per API (5 / 15 min in production/test); UI must handle `429`.
- US-M2 will replace the shell placeholder with `GET /work-orders/in-progress`.

---

## Next Steps After Implementation

1. Smoke on emulator against local API.
2. Write **`docs/plans/US-M2_android.md`** only after this DoD.
3. Commit when the user requests.

---

## Implementation Verification

- [ ] Login + session + logout match enhanced US-M1 §3–5
- [ ] Mobile header on all HTTP; refresh uses JSON body
- [ ] Unit mapper tests green
- [ ] README documents emulator URL and seed users
- [ ] No M2 list / M3 wizard in this story’s DoD
- [ ] Branch still `finalproject-RFM`
