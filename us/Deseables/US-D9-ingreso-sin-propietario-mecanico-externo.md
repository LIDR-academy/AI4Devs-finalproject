# US-D9 — Ingreso sin Propietario (Vehículo Traído por Mecánico Externo)

**Fuente:** operación real del taller · **Prioridad:** V2 (deseable alta)  
**Branch de implementación:** `feature-entrega2-RFM`  
**Refinado:** enrich-us local (sin ticket Jira) — listo para plan BE/FE autónomo

## [original] Historia de Usuario

**Como** administrador o mecánico del taller,
**quiero** registrar una orden de trabajo y el vehículo cuando lo trae un mecánico de otro taller (no el dueño),
**para** poder atender la placa sin forzar un propietario inventado y, si una autoridad pregunta después, demostrar que se atendió en cierta fecha y quién lo trajo.

## [enhanced] Historia de Usuario

**Como** administrador o mecánico del taller,
**quiero** registrar vehículos **sin `clientId`**, crear OT con `intakeMode = THIRD_PARTY` (nombre de quien trae obligatorio, teléfono opcional, `ownerClientId = null`), consultar por placa el historial con fecha + “Traído por…”, asociar un cliente a esa visita **después si hace falta**, y en una visita futura volver a usar `THIRD_PARTY` aunque la placa ya tenga dueño en ficha,
**para** cubrir ingresos intertaller sin datos inventados y responder con evidencia a autoridad.

**Contexto operativo:** mecánicos de otros talleres dejan el carro; el dueño no entra. Hoy `POST /vehicles` exige `clientId` y `POST /work-orders` falla con `Vehicle has no active owner`.

**Alcance V2 (cerrado):**

| # | Capacidad |
|---|-----------|
| 1 | `POST /api/vehicles` con `clientId` opcional (sin ownership si se omite) |
| 2 | `WorkOrder.ownerClientId` → `String?` + `broughtByName` / `broughtByPhone` |
| 3 | `POST /api/work-orders` con `intakeMode: OWNER \| THIRD_PARTY` (default `OWNER`) |
| 4 | `PATCH /api/work-orders/:id/link-owner` |
| 5 | Null-safety: detalle OT, delivery list/detail, historial visita, mappers vehículo |
| 6 | UI: alta vehículo sin dueño; modo ingreso OT; link owner; D1 gated; historial “Traído por” |
| 7 | `markContacted` rechaza OT sin dueño; `deliver` permite OT sin dueño |

**Fuera de alcance:**

- Entidad `Client`/taller externo; facturación al tercero; SMS/WhatsApp al bringer
- US-D3 (transferencia de placa) — no se ejecuta en silencio desde D9
- Deshacer `link-owner` / editar `broughtBy*` tras create (nice-to-have futuro)
- Seed/demo de OT tercero

**Dependencias:** US-004, US-005, US-008, US-009, US-D1 (gate), US-D7 (mileage sigue opcional), US-D8 (mecánico asignado ≠ bringer).

**Gap actual (código):**

| Área | Hoy |
|------|-----|
| `CreateVehicleDto.clientId` | `@IsUUID()` obligatorio |
| `Vehicle` mapper | throw si no hay ownership activa |
| `WorkOrder.ownerClientId` | `String` NOT NULL |
| `WorkOrdersService.create` | exige ownership → setea dueño |
| Delivery include | `ownerClient: true` (no nullable en tipos) |
| History mapper | `ownerAtVisit` desde `ownerClient` no null |
| Campos bringer | inexistentes |

---

## [original] Criterios de Aceptación

- [ ] Se puede registrar el vehículo y la OT sin asociar un dueño.
- [ ] Se registra quién lo trajo (nombre) y opcionalmente teléfono.
- [ ] En consultas futuras por placa se ve fecha de atención y quién lo trajo.
- [ ] Se puede asociar un dueño después, de forma opcional.
- [ ] Si el mismo mecánico externo vuelve a traer el carro, se puede crear una nueva OT **sin** asociar dueño.

## [enhanced] Criterios de Aceptación

### 1. Reglas de negocio (fuente de verdad)

#### 1.1 Modos de ingreso OT

| `intakeMode` | Condición vehículo | `ownerClientId` | `broughtByName` | `broughtByPhone` |
|--------------|--------------------|-----------------|-----------------|------------------|
| `OWNER` (default si se omite) | **Debe** existir ownership `validTo = null` | = `ownership.clientId` | debe ser `null` | debe ser `null` |
| `THIRD_PARTY` | Ownership **irrelevante** (puede existir o no) | siempre `null` | **obligatorio** tras trim | opcional → `null` si vacío |

- `THIRD_PARTY` **no lee ni muta** `VehicleOwnership`.
- `assignedMechanicId` = mecánico **interno** (US-005/D8). Independiente de `broughtByName`.

#### 1.2 Vehículo sin propietario

- `POST /api/vehicles` **sin** `clientId` (omitido o `null`): crea `Vehicle` **sin** fila `VehicleOwnership`.
- Con `clientId`: comportamiento actual (ownership activa).
- `GET` detalle/lista/search: `currentOwner: null` permitido (sin throw).

#### 1.3 `link-owner` (asociación posterior) — decisión única

`PATCH /api/work-orders/:id/link-owner` con `{ "clientId": "<uuid>" }`.

Precondiciones:

1. OT existe; si no → `404` `Work order not found`
2. Cliente existe; si no → `404` `Client not found`
3. `workOrder.ownerClientId === null`; si no → `409` `Owner already linked`
4. Cliente activo implícito (si el dominio no tiene soft-delete de clientes, N/A)

Efectos **atómicos** (una transacción):

| Estado ownership del vehículo | Acción |
|-------------------------------|--------|
| Sin ownership activa | `WorkOrder.ownerClientId = clientId` **y** crear `VehicleOwnership` (`validFrom = now`, `validTo = null`, ese `clientId`) |
| Ownership activa con **mismo** `clientId` | Solo `WorkOrder.ownerClientId = clientId` |
| Ownership activa con **otro** `clientId` | Solo `WorkOrder.ownerClientId = clientId` (**no** transferir placa; no tocar ownership). Response incluye hint booleano `vehicleOwnerUnchanged: true` |

- **Nunca** borrar/alterar `broughtByName` / `broughtByPhone`.
- Permitido en cualquier status: `EN_PROCESO` \| `LISTA_PARA_ENTREGA` \| `OWNER_CONTACTED` \| `ENTREGADA`.

#### 1.4 Visitas futuras

Nueva OT `THIRD_PARTY` sobre la misma placa: **siempre permitida** (si no hay OT activa US-005), aunque:

- el vehículo ya tenga dueño, o
- una OT anterior ya tenga `ownerClientId` linkeado.

#### 1.5 Delivery + D1

| Acción | Sin `ownerClientId` | Con `ownerClientId` |
|--------|---------------------|---------------------|
| Listar/detalle ready | Visible; dueño null + bringer | Como hoy |
| `PATCH .../mark-contacted` | `409` `Work order has no owner to contact` | US-D1 |
| `PATCH .../deliver` | Permitido | Permitido |

UI: ocultar/deshabilitar “Marcar propietario contactado” si no hay dueño; mostrar *Sin propietario — Traído por {name}*.

#### 1.6 Autoridad (lectura)

`GET /api/vehicles/:id/history` (o contrato US-009 vigente): cada visita incluye `checkedInAt`, `deliveredAt`, `status`, `mileage`, `ownerAtVisit: null \| object`, `broughtByName`, `broughtByPhone`.

### 2. Modelo / migración

```prisma
model WorkOrder {
  ownerClientId    String?
  broughtByName    String?
  broughtByPhone   String?
  ownerClient      Client?  @relation(fields: [ownerClientId], references: [id], onDelete: Restrict)
  // ...resto igual
}
```

```sql
ALTER TABLE "WorkOrder" ALTER COLUMN "ownerClientId" DROP NOT NULL;
ALTER TABLE "WorkOrder" ADD COLUMN "broughtByName" TEXT;
ALTER TABLE "WorkOrder" ADD COLUMN "broughtByPhone" TEXT;
```

- Datos existentes: dueño conservado; `broughtBy*` = NULL.
- Prisma: `ownerClient` relation opcional; queries delivery/history usan `include: { ownerClient: true }` con tipo `Client | null`.

### 3. Validaciones de campos (API)

| Campo | Reglas |
|-------|--------|
| `intakeMode` | enum `OWNER` \| `THIRD_PARTY`; default `OWNER` si omitido |
| `broughtByName` | `THIRD_PARTY`: `@IsString() @Length(2, 150)` tras trim; espacios solo → `400` |
| `broughtByPhone` | Opcional; si presente: `@Matches(/^[0-9]{8,15}$/)` (igual clientes) o omitir/null; string vacío → persistir `null` |
| `OWNER` + cualquier `broughtBy*` no-null | `400` `broughtBy fields are only valid for THIRD_PARTY intake` |
| `clientId` en create vehicle | `@IsOptional() @IsUUID()`; si se envía debe existir |

### 4. Contratos API detallados

Prefijo `/api`. JWT. Mensajes de error en **inglés** (estándar proyecto).

#### 4.1 `POST /api/vehicles` (cambio)

Roles: `ADMIN`, `MECHANIC`.

**Sin dueño:**

```json
{
  "licensePlate": "BPX-999",
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2019,
  "color": "Gris"
}
```

**Response `201`:** `currentOwner: null` (o campo equivalente del mapper actual en null).

**Errores existentes** (duplicado placa, etc.) sin cambio.

#### 4.2 `POST /api/work-orders` (cambio)

Roles: `ADMIN`, `MECHANIC`.

**THIRD_PARTY:**

```json
{
  "vehicleId": "vehicle-uuid",
  "intakeMode": "THIRD_PARTY",
  "broughtByName": "Carlos Jiménez",
  "broughtByPhone": "88881234",
  "entryReason": "Diagnóstico motor — referido Taller Norte",
  "mileage": null,
  "assignedMechanicId": "internal-mechanic-uuid",
  "initialTasks": [{ "description": "Scanner OBD" }]
}
```

**OWNER (compat):** omitir `intakeMode` o `"OWNER"`; sin `broughtBy*`.

**Response `201` (fragmento):**

```json
{
  "id": "wo-uuid",
  "ownerClientId": null,
  "owner": null,
  "broughtByName": "Carlos Jiménez",
  "broughtByPhone": "88881234",
  "intakeMode": "THIRD_PARTY",
  "vehicle": { "licensePlate": "BPX-999", "brand": "Toyota", "model": "Corolla" },
  "mileage": null
}
```

> `intakeMode` en response puede ser campo derivado (`broughtByName != null ? THIRD_PARTY : OWNER`) si se prefiere no persistir columna extra. **Decisión V2:** **no** añadir columna `intakeMode` en DB; derivar en mapper: `broughtByName != null` → `THIRD_PARTY`, else `OWNER`.

**Errores create OT:**

| Código | Condición | Message |
|--------|-----------|---------|
| `400` | `THIRD_PARTY` sin nombre válido | `broughtByName is required for THIRD_PARTY intake` |
| `400` | `OWNER` + broughtBy* | `broughtBy fields are only valid for THIRD_PARTY intake` |
| `400` | `OWNER` sin ownership | `Vehicle has no active owner` |
| `400` | phone inválido | validation pipe default / `broughtByPhone must be…` |
| `404` | vehículo inexistente | `Vehicle not found` |
| `409` | OT activa | mensaje US-005 existente |

#### 4.3 `PATCH /api/work-orders/:id/link-owner` (**nuevo**)

Roles: `ADMIN`, `MECHANIC`.

```json
{ "clientId": "client-uuid" }
```

**Response `200`:**

```json
{
  "id": "wo-uuid",
  "ownerClientId": "client-uuid",
  "owner": { "fullName": "…", "nationalId": "…" },
  "broughtByName": "Carlos Jiménez",
  "broughtByPhone": "88881234",
  "vehicleOwnerUnchanged": false
}
```

(`vehicleOwnerUnchanged: true` solo en el caso ownership distinta.)

| Código | Message |
|--------|---------|
| `404` | `Work order not found` / `Client not found` |
| `409` | `Owner already linked` |

#### 4.4 Delivery shapes (null-safe)

**List item / detail:**

```typescript
ownerName: string | null;
ownerPhone: string | null;
ownerPhoneDisplay: string | null;
ownerEmail: string | null;
broughtByName: string | null;
broughtByPhone: string | null;
owner: DeliveryReadyOwnerDto | null; // detail
```

**`markContacted`:** si `ownerClientId == null` → `409` `Work order has no owner to contact` (antes de validar status ready).

#### 4.5 History visit

```typescript
ownerAtVisit: OwnerAtVisitDto | null;
broughtByName: string | null;
broughtByPhone: string | null;
```

Prisma include: `ownerClient: true` con tipo nullable; mapper: si `!ownerClient` → `ownerAtVisit: null`.

#### 4.6 Work order detail DTO

```typescript
ownerClientId: string | null;
owner: WorkOrderOwnerSummaryDto | null;
broughtByName: string | null;
broughtByPhone: string | null;
intakeMode: 'OWNER' | 'THIRD_PARTY'; // derivado
```

### 5. UI / UX

| Superficie | Comportamiento |
|------------|----------------|
| `/vehicles/new` (`VehicleForm`) | Toggle **Registrar sin propietario**; si ON → no exigir `ClientPicker` / `clientId`; ayuda en español |
| `/work-orders/new` | Radio/tabs: **Dueño / cliente** \| **Traído por tercero**; campos nombre* + teléfono; si vehículo sin dueño + modo Dueño → bloquear con CTA a modo tercero; si vehículo con dueño + tercero → aviso soft |
| Detalle OT | Bloque ingreso; CTA **Asociar propietario** si `ownerClientId == null` (`LinkOwnerDialog` + `ClientPicker`) |
| `/admin/delivery` | Sin dueño: copy bringer; sin botón D1 |
| Historial vehículo | *Sin propietario* + *Traído por {name}* (+ tel si hay) |

Textos UI en **español**; códigos/API en inglés.

### 6. Autorización

| Acción | ADMIN | MECHANIC |
|--------|-------|----------|
| Crear vehículo sin dueño | Sí | Sí |
| OT `THIRD_PARTY` / `OWNER` | Sí | Sí |
| `link-owner` | Sí | Sí |
| Entregar sin dueño | Sí | No |
| `mark-contacted` | Sí (solo con dueño) | No |

### 7. Casos límite (checklist)

- [ ] Placa nueva sin dueño → OT `THIRD_PARTY` → 201
- [ ] Placa con dueño → OT `THIRD_PARTY` → visita `ownerClientId` null; ownership intacta
- [ ] Placa sin dueño → OT `OWNER` → 400
- [ ] `link-owner` crea ownership si faltaba
- [ ] `link-owner` con ownership distinta → OT linkeada, ownership igual, `vehicleOwnerUnchanged: true`
- [ ] Segunda OT `THIRD_PARTY` tras link en la primera → 201 sin dueño en la nueva
- [ ] Double `link-owner` → 409
- [ ] `mark-contacted` sin dueño → 409
- [ ] `deliver` sin dueño → 200 `ENTREGADA`
- [ ] Nombre `"   "` → 400
- [ ] Phone `""` → null persistido

---

## [original] Roles involucrados

- Administrador
- Mecánico

## [enhanced] Roles involucrados

| Rol | Código | Permisos |
|-----|--------|----------|
| Administrador | `ADMIN` | Ingreso, link-owner, delivery sin dueño, D1 solo con dueño, consulta historial |
| Mecánico | `MECHANIC` | Ingreso y link-owner; sin panel delivery |

---

## [original] Notas técnicas

- Quitar la obligatoriedad de propietario al ingresar en ciertos casos.
- Guardar quién trajo el vehículo.

## [enhanced] Especificación técnica

### Archivos a crear o modificar

**Backend (`apps/api`)**

```
prisma/schema.prisma
prisma/migrations/<timestamp>_work_order_optional_owner_brought_by/migration.sql

src/modules/vehicles/
├── dto/create-vehicle.dto.ts
├── vehicles.service.ts
├── mappers/vehicle.mapper.ts
├── vehicles.service.spec.ts
└── (test/vehicles.e2e-spec.ts)

src/modules/work-orders/
├── dto/create-work-order.dto.ts              # intakeMode + broughtBy* + IsEnum
├── dto/link-work-order-owner.dto.ts          # NEW
├── dto/link-work-order-owner-response.dto.ts # NEW (optional; or reuse detail)
├── dto/work-order-detail-response.dto.ts     # nullables + broughtBy + intakeMode
├── mappers/work-order.mapper.ts
├── work-orders.controller.ts                 # PATCH :id/link-owner
├── work-orders.service.ts                    # create branch + linkOwner
└── work-orders.service.spec.ts

src/modules/delivery/
├── dto/delivery-ready-item.dto.ts            # owner* nullable + broughtBy*
├── dto/delivery-ready-detail.dto.ts          # owner nullable
├── delivery.service.ts                       # null-safe map + markContacted guard
└── delivery.service.spec.ts

src/modules/history/
├── dto/vehicle-history-visit.dto.ts          # ownerAtVisit null + broughtBy*
├── mappers/visit-history.mapper.ts
└── history.service.ts                        # include tipado nullable

test/work-orders.e2e-spec.ts
test/vehicles.e2e-spec.ts
test/delivery.e2e-spec.ts
README.md                                     # snippet create OT / vehicles
```

**OpenAPI (si aplica en repo):** `docs/api-spec.work-orders.yml`, `docs/api-spec.vehicles.yml`, `docs/api-spec.delivery.yml` (o archivos equivalentes existentes).

**Frontend (`apps/web`)**

```
src/features/vehicles/
├── components/VehicleForm.tsx
├── utils/createVehicleSchema.ts
├── types/vehicle.types.ts
└── e2e paths / vehicles.spec.ts

src/features/work-orders/
├── components/WorkOrderCreateForm.tsx
├── components/WorkOrderDetailHeader.tsx
├── components/LinkOwnerDialog.tsx            # NEW
├── hooks/useLinkOwner.ts                     # NEW
├── utils/createWorkOrderSchema.ts
├── services/workOrdersApi.ts
├── types/work-order.types.ts
└── e2e/work-orders.spec.ts

src/features/delivery-panel/
├── components/DeliveryReadyDetail.tsx
├── components/DeliveryReadyTable.tsx
├── components/MarkContactedDialog.tsx        # hide/disable sin dueño
└── types/delivery.types.ts

src/features/history/
├── components/VisitCard.tsx
├── types/history.types.ts
└── utils/normalizeHistoryVisit.ts
```

### Pseudocódigo create OT

```typescript
const mode = dto.intakeMode ?? 'OWNER';
normalizeBroughtBy(dto, mode); // trim; empty phone → undefined

if (mode === 'THIRD_PARTY') {
  assertBroughtByName(dto.broughtByName);
  ownerClientId = null;
} else {
  assertNoBroughtBy(dto);
  const ownership = vehicle.ownerships[0];
  if (!ownership) throw new BadRequestException('Vehicle has no active owner');
  ownerClientId = ownership.clientId;
}
// active WO check + assignedMechanic + create as today
```

### Flujo de implementación (orden)

1. Migración + Prisma generate  
2. Null-safe mappers vehículo / OT detail / history / delivery (tests rojos → verdes en OWNER)  
3. Create vehicle sin `clientId`  
4. Create OT `THIRD_PARTY` + default `OWNER` (TDD)  
5. `link-owner` + matriz ownership  
6. Delivery guards D1 + shapes  
7. Frontend vehículo + OT + detalle + delivery + historial  
8. E2E + DoD manual “autoridad pregunta por placa”

### Tests requeridos

| Capa | Escenarios mínimos |
|------|-------------------|
| **Unit vehicles** | create sin/con clientId; detail `currentOwner` null |
| **Unit work-orders** | matriz §7 create + link-owner (3 ownership cases) + double link |
| **Unit delivery** | map sin owner; markContacted sin owner → 409; deliver sin owner OK |
| **Unit history** | visit con `ownerAtVisit` null + broughtBy |
| **E2E API** | flujo placa nueva tercero + history + link + segunda OT tercero |
| **E2E web** | toggle sin dueño; modo tercero; CTA asociar; delivery sin D1 |

Cobertura objetivo paths nuevos ≥ 90 % en servicios tocados.

### Requisitos no funcionales

| Área | Requisito |
|------|-----------|
| **Integridad** | No cliente genérico; `broughtBy*` inmutables en `link-owner`; no transfer ownership silencioso |
| **Auditoría** | Historial por placa suficiente para autoridad (fecha + bringer + dueño visita opcional) |
| **UX** | Español UI; inglés errores API; no confundir mecánico asignado vs bringer |
| **Seguridad** | JWT + `RolesGuard`; sin loguear teléfono en claro más de lo ya hecho en delivery |
| **Compatibilidad** | Clientes API sin `intakeMode` = `OWNER` |
| **Migración** | Non-destructive; downtime solo recreate contenedor API |
| **Rendimiento** | Sin N+1 nuevo; p95 create/link &lt; 300 ms en local |

### Definition of Done

- [ ] Migración en DEV aplicada  
- [ ] Vehículo + OT sin dueño E2E  
- [ ] Historial muestra fecha + Traído por  
- [ ] `link-owner` opcional + segunda visita `THIRD_PARTY` OK  
- [ ] D1 bloqueado sin dueño; deliver OK  
- [ ] Tests matriz verdes  
- [ ] `docs/plans/US-D9_backend.md` + `US-D9_frontend.md` creados al iniciar implementación  
- [ ] README API + `us/Deseables/README.md` alineados  

### Dependencias

| Relación | Detalle |
|----------|---------|
| **Depende de** | US-004, US-005, US-008, US-009, US-D1, US-D7 |
| **Coordina con** | US-D3 (transfer explícito); US-D8 (assignee interno) |
| **No bloquea** | US-D2/D4/D5/D6 |

---

## [original] Prioridad

Alta prioridad V2 (deseable).

## [enhanced] Prioridad

**Alta (V2 P1)** — ingreso real intertaller + trazabilidad legal/operativa; cambio de modelo transversal (nullable owner) + 4 superficies UI.

**Estimación orientativa:** 3–4 días full-stack (migración, null-safety delivery/historial, UI modos, tests).

---

## Metadatos

| Campo | Valor |
|-------|-------|
| **ID** | US-D9 |
| **Deseable** | D9 |
| **Módulos** | `vehicles`, `work-orders`, `delivery`, `history` |
| **Branch** | `feature-entrega2-RFM` |
| **Decisiones cerradas** | Nombre obligatorio; teléfono opcional 8–15 dígitos; `intakeMode` no se persiste (derivado); `link-owner` no transfiere ownership ajena; D1 409 sin dueño; deliver sin dueño OK |
| **Jira** | N/A — historia local en `us/Deseables/` |
