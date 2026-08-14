# MecaTrack Android

Native Android client for the MecaTrack workshop API. The app does **not** duplicate workshop business logic: it calls the existing NestJS REST API with header `X-MecaTrack-Client: mobile` so login/refresh return a `refreshToken` in JSON (the web client still uses the httpOnly cookie).

## Current scope (US-M1 + US-M2 + US-M3)

| Flow | Endpoints |
|------|-----------|
| Login / refresh | `POST /api/auth/login`, `POST /api/auth/refresh` |
| Logout | `POST /api/auth/logout` |
| Home — in-progress orders | `GET /api/work-orders/in-progress?limit=50&offset=0` |
| Search plate | `GET /api/vehicles/search?q=` |
| Search / create client | `GET /api/clients/search?q=`, `POST /api/clients` |
| Create vehicle | `POST /api/vehicles` |
| Active OT / mechanics | `GET /api/work-orders/active?vehicleId=`, `GET /api/work-orders/mechanics` |
| Create work order | `POST /api/work-orders` |

After login the home screen lists active work orders (same visibility as the web US-D10 list: admin sees all active; mechanic sees assigned only — **server-side**).

**Nueva orden** opens a 4-step intake wizard. There is no composite “create everything” endpoint: the app orchestrates the APIs above.

### Intake happy path (unknown plate)

1. Search plate (`q` ≥ 2 characters, 300 ms debounce). If none: *No se encontró esa placa* → **Registrar cliente y vehículo**.
2. Search or **create client** (name + national id; phone/email optional). `409` with `existingClient` reuses that record.
3. Register the vehicle (plate prefilled, linked to the selected client).
4. Create the work order (reason, optional mileage, **one** initial task, optional mechanic). Success → confirmation → **Volver al panel** (home refreshes).

Existing plate: **Seleccionar** skips to step 4. If the vehicle already has an active order, submit is blocked.

Secondary path (US-D9): step 2 **Continuar sin propietario**, then `intakeMode=THIRD_PARTY` + who brought the vehicle.

Row tap on the home list does not open detail (snackbar: available on the web). If `total > 50`, the app shows the first 50 plus a footer pointing to the web.

## Run locally

1. Start the API (`apps/api`, default `http://localhost:4000`).
2. Open `apps/android` in Android Studio.
3. Use an emulator (API 26+). Debug `API_BASE_URL` is `http://10.0.2.2:4000/api/` (`10.0.2.2` is the host machine from the emulator). Cleartext HTTP is allowed in **debug** only.
4. Seed users: `mechanic@taller.com` / `MechanicPass123` or `admin@taller.com` / `AdminPass123`.

Physical device: set `API_BASE_URL` in `app/build.gradle.kts` to your computer’s LAN IP, for example `http://192.168.1.20:4000/api/`, and keep the API reachable on that network.

Release builds must use HTTPS (cleartext disabled).

## Tests

From Android Studio: run the `app` unit test configuration, or:

```bash
cd apps/android
./gradlew test
```

If the Gradle wrapper JAR is missing, Android Studio will generate it on first sync (`File > Sync Project with Gradle Files`).

Covered by unit tests: login error mapping (US-M1); in-progress party/status labels (US-M2); intake validators and 409 JSON (`existingClient`, `existingVehicle`, `activeWorkOrderId`) (US-M3).
