# US-M3 — Crear OT aunque el vehículo no exista (alta de cliente y vehículo)

**Fuente:** conversación de producto (app Android; ingreso completo en el teléfono)  
**Prioridad:** V2 / cliente nativo  
**Rama de implementación:** `finalproject-RFM` (salvo petición explícita de otra rama)  
**Estado refinamiento:** Enhanced (local) — `/enrich-us` 2026-08-14; sin Jira MCP; listo para plan Android **después de US-M2**  
**Refinado:** `/enrich-us` 2026-08-14

> Implementar **solo** cuando US-M2 esté en DoD. **Cero endpoints nuevos:** orquestación de US-003 / US-004 / US-005 / D7 / D9.

---

## [original] Historia de Usuario

**Como** administrador o mecánico en la app Android,
**quiero** crear una orden de trabajo aunque el carro aún no esté registrado, haciendo en el mismo flujo el alta de cliente y de vehículo,
**para** ingresar una visita desde el patio sin depender de que la placa ya exista en el sistema.

## [original] Criterios de Aceptación

- [ ] El usuario puede buscar el vehículo por placa.
- [ ] Si la placa no existe, puede registrar un cliente (buscar uno existente o crear uno nuevo).
- [ ] Luego puede registrar el vehículo asociado a ese cliente.
- [ ] Con el vehículo listo, puede crear la OT (motivo, al menos una tarea inicial).
- [ ] Todo ocurre en la app Android contra la API existente (clientes, vehículos, órdenes).

---

## [enhanced] Historia de Usuario

**Como** `ADMIN` o `MECHANIC` en Android,
**quiero** un asistente de ingreso: buscar placa → si no existe, buscar o **crear cliente** → **crear vehículo** → crear OT con motivo y ≥1 tarea inicial,
**para** no bloquear el ingreso en patio cuando la placa es nueva.

**Camino feliz de producto:** placa desconocida + dueño conocido o nuevo + OT.  
**Camino secundario (US-D9):** continuar sin propietario (`THIRD_PARTY` + `broughtByName`). No es el default.

**Alcance cerrado**

| Incluye | No incluye |
|---------|------------|
| Wizard 4 pasos en Android | Endpoint compuesto “crear todo” |
| Alta cliente + vehículo + OT vía API actual | Editar ficha cliente/vehículo, US-D3 |
| 409 `existingClient` / `existingVehicle` / `activeWorkOrderId` | Detalle/tareas post-creación (US-006) |
| Mileage opcional (D7); mechanics D8 | Cámara/OCR de placa, fotos |
| Confirmación y vuelta al home M2 | iOS |

**Dependencia:** US-M1, US-M2, US-003, US-004, US-005, US-D7, US-D8, US-D9.

---

## [enhanced] Criterios de Aceptación

### 1. Principio

- [ ] El cliente **orquesta**; el servidor **autoriza y valida negocio**.
- [ ] No hay un solo `POST` que cree cliente+vehículo+OT.
- [ ] Validación de formato en UI (mismos rangos que DTOs). Unicidad, ownership, una OT activa, snapshot de dueño: API.

### 2. Navegación

- [ ] Entrada: CTA **Nueva orden** del home (US-M2).
- [ ] Atrás: paso anterior; en paso 1 o éxito: volver al home.
- [ ] Éxito: mensaje + **Volver al panel** → home M2 **refrescado** (la OT nueva debe poder listarse según rol).

### 3. Paso 1 — Buscar vehículo

- [ ] Copy: *Paso 1 — Busca por placa. Si no existe, registra cliente y vehículo.*
- [ ] Input placa; buscar con `q` trim length ≥ 2; debounce ~300 ms.
- [ ] `GET /api/vehicles/search?q=`
- [ ] Resultados: placa, `{brand} {model} {year}`, `Propietario: {fullName \| Sin propietario}`, botón **Seleccionar**.
- [ ] Cero resultados (búsqueda hecha, no loading): *No se encontró esa placa* + **Registrar cliente y vehículo**.
- [ ] Seleccionar → ir a paso 4 (no re-registrar).

### 4. Paso 2 — Cliente (placa nueva)

Camino principal = con dueño.

**Buscar**

| Campo UI | API |
|----------|-----|
| Buscar cliente (nombre o cédula) | `GET /api/clients/search?q=` (mín. 2 chars, US-003) |

- [ ] Hits: nombre + `nationalId` + **Usar este cliente** → paso 3 con `clientId`.

**Crear** (`POST /api/clients`)

| Campo UI | API | Obligatorio | Validación |
|----------|-----|-------------|------------|
| Nombre completo | `fullName` | Sí | trim 2–150 |
| Identificación | `nationalId` | Sí | 5–20, `^[a-zA-Z0-9-]+$` |
| Teléfono | `phone` | No | 8–15 dígitos (normalizar quitando no-dígitos) |
| Correo | `email` | No | email si no vacío |

- [ ] CTA **Crear cliente y continuar**.
- [ ] `409` + `existingClient`: usar ese objeto y continuar al paso 3 (aviso: *Ya existía un cliente con esa identificación; se usará ese registro.*).
- [ ] Secundario: **Continuar sin propietario** → paso 3 con `clientId` omitido (`withoutOwner = true`).

### 5. Paso 3 — Vehículo nuevo

| Campo UI | API | Obligatorio | Validación |
|----------|-----|-------------|------------|
| Placa | `licensePlate` | Sí | 2–15; normalizar mayúsculas sin espacios (como API) |
| Marca | `brand` | Sí | 1–60 |
| Modelo | `model` | Sí | 1–60 |
| Año | `year` | Sí | int 1900–(año actual+1) |
| Color | `color` | No | máx. 40 |
| (dueño) | `clientId` | Sí si hay dueño | UUID; **omitir** si sin propietario |

- [ ] Placa prellenada con la búsqueda del paso 1.
- [ ] Mostrar dueño seleccionado o *Sin propietario*.
- [ ] `POST /api/vehicles`. `409` + `existingVehicle`: buscar/seleccionar esa placa y pasar a paso 4 (no duplicar).
- [ ] Éxito → mismo camino que **Seleccionar** (paso 4).

### 6. Paso 4 — Orden de trabajo

Al entrar:

- [ ] `GET /api/work-orders/active?vehicleId=`
- [ ] `GET /api/work-orders/mechanics` (incluye `ADMIN` con `canActAsMechanic`, US-D8)
- [ ] Si `activeWorkOrder != null`: **bloquear** submit. Copy: *Este vehículo ya tiene una orden activa. No se puede crear otra hasta entregarla.*

**Campos**

| Campo UI | API | Obligatorio | Validación |
|----------|-----|-------------|------------|
| Motivo de ingreso | `entryReason` | Sí | 5–500 |
| Kilometraje | `mileage` | No | entero ≥ 0 si se envía; omitir/`null` si vacío (D7) |
| Tarea inicial | `initialTasks[0].description` | Sí | 3–300; array min 1. MVP: **una** fila (no editor multi-fila web) |
| Mecánico | `assignedMechanicId` | No | UUID de la lista o omitir (*Sin asignar*) |
| Quién trajo | `broughtByName` | Sí si sin `currentOwner` | 2–150 |
| Teléfono quien trae | `broughtByPhone` | No | 8–15 dígitos si se envía |
| Modo | `intakeMode` | Condicional | Omitir/`OWNER` si hay dueño activo; `THIRD_PARTY` si no hay `currentOwner` |

- [ ] Nunca mandar `OWNER` si `currentOwner == null` (la API rechaza).
- [ ] `POST /api/work-orders` → `201` detalle. `409` `activeWorkOrderId`: mismo bloqueo.
- [ ] `400`: mostrar `message` string o array.
- [ ] Éxito: pantalla confirmación (placa + motivo + dueño si hay).

### 7. Endpoints (todos existentes)

| Uso | Método | Ruta |
|-----|--------|------|
| Buscar placa | `GET` | `/api/vehicles/search?q=` |
| Crear vehículo | `POST` | `/api/vehicles` |
| Buscar cliente | `GET` | `/api/clients/search?q=` |
| Crear cliente | `POST` | `/api/clients` |
| OT activa | `GET` | `/api/work-orders/active?vehicleId=` |
| Mecánicos | `GET` | `/api/work-orders/mechanics` |
| Crear OT | `POST` | `/api/work-orders` |

Auth: Bearer (M1) + `X-MecaTrack-Client: mobile`. Roles: `ADMIN` y `MECHANIC`. `401` sin token.

**Create WO body (dueño):**

```json
{
  "vehicleId": "uuid",
  "entryReason": "Ruido en motor al frenar",
  "mileage": 12000,
  "assignedMechanicId": "uuid",
  "initialTasks": [{ "description": "Revisar frenos" }]
}
```

**Create WO body (tercero):** igual + `"intakeMode": "THIRD_PARTY"`, `"broughtByName": "Carlos Taller Norte"`, `"broughtByPhone"` opcional. Sin `mileage` si vacío.

### 8. Archivos a crear / modificar

```
apps/android/.../ui/intake/     # NEW: wizard + ViewModel
apps/android/.../domain/        # MOD: validadores placa/cliente/vehículo/OT
apps/android/.../data/api/      # MOD: clients, vehicles, work-orders create/active/mechanics
apps/android/.../ui/home/       # MOD: FAB navega al wizard; refresh al volver
apps/android/app/src/test/...   # NEW: validadores + parseo 409
apps/android/README.md          # MOD: flujo de ingreso
```

**No** cambiar API ni web, salvo bug de contrato descubierto (entonces US aparte o fix documentado).

### 9. Pruebas

| Capa | Casos |
|------|--------|
| Unit | Rangos placa/cliente/vehículo/OT; broughtBy obligatorio solo sin dueño |
| Unit | Parseo JSON `existingClient`, `existingVehicle`, `activeWorkOrderId` |
| Manual feliz | Placa nueva → cliente nuevo → vehículo → OT → aparece en home (si el usuario es el asignado o es admin) |
| Manual existente | Placa conocida → OT (si no hay activa) |
| Manual 409 OT | Vehículo con OT activa → bloqueo |
| Manual D9 | Sin propietario + broughtBy → OT `THIRD_PARTY` |
| Regresión | M1 sesión; M2 lista |

### 10. NFR

- [ ] Código/docs inglés; copy ES.
- [ ] Debounce búsqueda para no martillar el API.
- [ ] Timeouts HTTP iguales a M1 (~20 s).
- [ ] No loguear `nationalId`/teléfonos en claro en logs de producción.
- [ ] Una tarea inicial en MVP (simplifica patio); la web sigue permitiendo N tareas.
- [ ] TDD validadores **antes** de cablear el wizard.

### 11. Documentación

- [ ] `apps/android/README.md` — wizard y endpoints
- [ ] `us/movil/README.md` — M3 Implemented al cerrar DoD

### 12. Pasos de implementación (orden)

1. Validadores + tests.
2. Paso 1 búsqueda/selección.
3. Pasos 2–3 cliente + vehículo + 409.
4. Paso 4 OT + active + mechanics.
5. Camino D9 al **final**.
6. Éxito → home refresh.
7. README + smoke.

### 13. Definition of Done

- [ ] AC §1–7
- [ ] Tests §9
- [ ] Docs §11
- [ ] Rama `finalproject-RFM`
- [ ] Camino feliz placa nueva documentado en README

---

## Roles involucrados

| Role | Responsibility |
|------|----------------|
| Android | Wizard, orquestación, validación UI |
| QA / PO | Patio: placa nueva con dueño; placa existente; sin dueño; OT activa |

## Notas de producto

- El original exige **cliente y vehículo** cuando el carro no existe: ese es el camino que se demuestra primero.
- D9 es escape para intertaller, no el onboarding por defecto.
