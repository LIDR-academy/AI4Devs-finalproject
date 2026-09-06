# US-004 — Registro de Vehículos

## [original] Historia de Usuario

**Como** mecánico o administrador,
**quiero** registrar un vehículo y asociarlo a un cliente,
**para** poder crear órdenes de trabajo y mantener el historial de visitas del vehículo.

## [enhanced] Historia de Usuario

**Como** mecánico o administrador,
**quiero** buscar vehículos por placa, registrar uno nuevo vinculado a un cliente existente y consultar su ficha con el historial de visitas,
**para** crear órdenes de trabajo (US-005) sin duplicar placas y mantener trazabilidad del propietario actual y futura transferencia de dueño (D3).

**Alcance MVP:** búsqueda por placa, alta de vehículo con propietario inicial (`VehicleOwnership`), **edición de datos del vehículo** (marca, modelo, año, color y **corrección de placa**), **eliminación** si el vehículo no tiene órdenes de trabajo, ficha con historial de OT (vacío hasta US-005). Acceso `ADMIN` y `MECHANIC`. Fuera de alcance: transferencia de propietario (D3/V2).

**Dependencia:** US-001 (auth), US-003 (`Client`). **Habilita:** US-005, US-008, US-009.

---

## [original] Criterios de Aceptación

- [ ] El formulario de registro de vehículo incluye: placa, marca, modelo, año y color.
- [ ] La placa es el identificador único del vehículo; el sistema valida que no esté ya registrada.
- [ ] El vehículo debe estar asociado a un cliente registrado en el sistema (campo obligatorio).
- [ ] El sistema permite buscar un cliente existente para asociarlo sin necesidad de abandonar el flujo.
- [ ] Al guardar, el vehículo queda disponible para crear una nueva Orden de Trabajo.
- [ ] Desde la ficha del vehículo se puede consultar el historial de visitas previas (OTs anteriores).

## [enhanced] Criterios de Aceptación

### UI — Flujo búsqueda y alta

- [ ] Rutas protegidas: `/vehicles` (búsqueda), `/vehicles/new` (alta), `/vehicles/[id]` (ficha), `/vehicles/[id]/edit` (edición).
- [ ] Enlace **Vehículos** en navegación admin y mecánico.
- [ ] `/vehicles`: barra de búsqueda por **placa** (≥ 2 caracteres, debounce 300 ms).
- [ ] Botón **Nuevo vehículo** → `/vehicles/new` (acepta query `?clientId=` si viene desde US-003).

### Formulario de registro

| Campo UI | Campo API | Obligatorio | Validación |
|----------|-----------|-------------|------------|
| Placa | `licensePlate` | Sí | Normalizar: MAYÚSCULAS, sin espacios; unique |
| Marca | `brand` | Sí | 1–60 caracteres |
| Modelo | `model` | Sí | 1–60 caracteres |
| Año | `year` | Sí | Entero entre 1900 y año actual + 1 |
| Color | `color` | No | 0–40 caracteres |
| Propietario | `clientId` | Sí | UUID de `Client` existente |

- [ ] Selector de propietario embebido: reutiliza búsqueda de clientes (US-003) sin salir del flujo (modal o combobox con `ClientSearchBar`).
- [ ] Si `?clientId=` en URL, preseleccionar cliente y mostrar nombre + identificación en solo lectura.
- [ ] Tras guardar: mensaje de éxito + acciones **Crear orden de trabajo** (`/work-orders/new?vehicleId=`) y **Ver ficha**.

### Placa duplicada

- [ ] Si la placa ya existe → HTTP `409` con vehículo existente; UI muestra ficha resumida y enlace a `/vehicles/[id]` (no duplicar).
- [ ] Validación en blur de placa vía `GET /api/vehicles/search?licensePlate=ABC123`.

### Ficha del vehículo (`/vehicles/[id]`)

- [ ] Cabecera: placa, marca, modelo, año, color, **propietario actual** (nombre + identificación del `Client` con ownership activo).
- [ ] Sección **Historial de visitas**: lista de OT del vehículo, más reciente primero.
- [ ] Cada ítem del historial (cuando existan OT — US-005): fecha ingreso, estado, motivo, monto total (si cerrada).
- [ ] Sin visitas previas → *"Este vehículo aún no tiene visitas registradas"*.
- [ ] Botón **Nueva orden de trabajo** si no hay OT activa (regla US-005; en MVP deshabilitar o ocultar si `hasActiveWorkOrder`).
- [ ] Acciones **Editar vehículo** → `/vehicles/[id]/edit` y **Eliminar vehículo** (con confirmación) en ficha y tarjetas de búsqueda.

### Edición de vehículo (`/vehicles/[id]/edit`)

| Campo UI | Campo API | Editable | Validación |
|----------|-----------|----------|------------|
| Placa | `licensePlate` | Sí | Normalizar; unique salvo el propio vehículo |
| Marca | `brand` | Sí | 1–60 caracteres |
| Modelo | `model` | Sí | 1–60 caracteres |
| Año | `year` | Sí | Entero 1900 … año actual + 1 |
| Color | `color` | Sí | 0–40 caracteres (opcional) |
| Propietario | — | No (solo lectura) | Cambio de dueño → D3/V2 |

- [ ] Tras guardar: mensaje *"Vehículo actualizado"* + enlace **Ver ficha**.
- [ ] Placa duplicada en otro vehículo → `409` + `ExistingVehicleAlert`.

### Eliminación de vehículo

- [ ] `DELETE /api/vehicles/:id` elimina vehículo y sus `VehicleOwnership` si **no tiene órdenes de trabajo**.
- [ ] Si tiene OT asociadas → `409` con mensaje claro; UI muestra error y no elimina.
- [ ] Tras eliminar: redirigir a `/vehicles` con confirmación.

### Disponibilidad post-alta

- [ ] Vehículo searchable por placa de inmediato.
- [ ] Propietario actual resoluble vía `VehicleOwnership` con `validTo = null`.

### Autorización

- [ ] `ADMIN` y `MECHANIC` en todos los endpoints de `/api/vehicles`.
- [ ] No autenticado → `401`.

### Casos límite

- [ ] `clientId` inexistente → `400` / `404`.
- [ ] Placa con guiones/espacios en UI → normalizar antes de persistir (`ABC123`).
- [ ] Cliente sin vehículos previos: primer vehículo se registra sin error.

---

## [original] Roles involucrados

- Administrador
- Mecánico

## [enhanced] Roles involucrados

| Rol | Código | Permisos en esta US |
|-----|--------|---------------------|
| Administrador | `ADMIN` | Buscar, crear, editar, eliminar (sin OT), ver ficha e historial |
| Mecánico | `MECHANIC` | Buscar, crear, editar, eliminar (sin OT), ver ficha e historial |

---

## [original] Notas técnicas

- La relación vehículo–propietario debe modelarse con soporte de historicidad desde V1 (fecha de inicio y fin de la asociación) para soportar la funcionalidad D3 (transferencia de propietario) en V2.
- La placa debe almacenarse en formato normalizado (mayúsculas, sin espacios).

## [enhanced] Especificación técnica

### Modelo de datos (Prisma)

```prisma
model Vehicle {
  id                   String             @id @default(uuid())
  licensePlate         String             @unique
  brand                String
  model                String
  year                 Int
  color                String?
  excludeFromReminders Boolean            @default(false) // prep D4
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt

  ownerships           VehicleOwnership[]
  workOrders           WorkOrder[]        // US-005

  @@index([licensePlate])
}

model VehicleOwnership {
  id        String    @id @default(uuid())
  vehicleId String
  clientId  String
  validFrom DateTime  @default(now())
  validTo   DateTime? // null = propietario actual

  vehicle   Vehicle   @relation(fields: [vehicleId], references: [id])
  client    Client    @relation(fields: [clientId], references: [id])

  @@index([vehicleId, validTo])
  @@index([clientId])
}
```

**Reglas de ownership (V1):**

- Al crear vehículo: insertar `Vehicle` + `VehicleOwnership` con `validFrom = now()`, `validTo = null`.
- Solo un ownership activo por vehículo (`validTo IS NULL`).
- Propietario actual: join `VehicleOwnership` + `Client` donde `validTo` es null.
- **D3 (V2):** cerrar ownership anterior (`validTo = now()`), abrir uno nuevo; OT históricas conservan contexto de propietario al momento de la visita (campo snapshot o join por fecha en US-009).

**Normalización de placa en servicio:**

```typescript
function normalizeLicensePlate(raw: string): string {
  return raw.trim().replace(/\s+/g, '').toUpperCase();
}
```

### API REST

Prefijo `/api/vehicles`. Roles: `@Roles('ADMIN', 'MECHANIC')`.

#### `GET /api/vehicles/search`

| Query | Descripción |
|-------|-------------|
| `q` | Búsqueda parcial por placa (≥ 2 chars) |
| `licensePlate` | Coincidencia exacta normalizada (anti-duplicado) |

**Response `200`:**

```json
{
  "items": [
    {
      "id": "uuid",
      "licensePlate": "ABC123",
      "brand": "Toyota",
      "model": "Corolla",
      "year": 2018,
      "color": "Blanco",
      "currentOwner": {
        "id": "client-uuid",
        "fullName": "Juan Pérez",
        "nationalId": "1-2345-6789"
      }
    }
  ],
  "total": 1
}
```

#### `GET /api/vehicles/:id`

Detalle del vehículo + `currentOwner`.

**Errores:** `401` | `404`

#### `GET /api/vehicles/:id/history`

Lista de órdenes de trabajo del vehículo (todas las no borradas), orden `checkedInAt DESC`.

**Response `200` (con OT — US-005):**

```json
{
  "vehicleId": "uuid",
  "visits": [
    {
      "workOrderId": "uuid",
      "checkedInAt": "2026-04-10T08:00:00.000Z",
      "status": "ENTREGADA",
      "entryReason": "Ruido en suspensión",
      "totalAmount": 85000,
      "ownerAtVisit": { "fullName": "Juan Pérez", "nationalId": "1-2345-6789" }
    }
  ]
}
```

**MVP sin OT aún:** `{ "visits": [] }` — contrato estable desde US-004.

#### `POST /api/vehicles`

**Request body:**

```json
{
  "licensePlate": "abc 123",
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2018,
  "color": "Blanco",
  "clientId": "client-uuid"
}
```

**Response `201`:** vehículo creado + `currentOwner` (transacción: Vehicle + VehicleOwnership).

**Errores:**

| Código | Condición |
|--------|-----------|
| `400` | Validación / `clientId` inválido |
| `401` | Sin autenticación |
| `404` | Cliente no existe |
| `409` | Placa duplicada — incluye `existingVehicle` |

**Ejemplo `409`:**

```json
{
  "statusCode": 409,
  "message": "Vehicle with this license plate already exists",
  "error": "Conflict",
  "existingVehicle": {
    "id": "uuid",
    "licensePlate": "ABC123",
    "brand": "Toyota",
    "model": "Corolla",
    "year": 2018
  }
}
```

### Archivos a crear o modificar

**Backend (`apps/api`)**

```
src/modules/vehicles/
├── vehicles.module.ts
├── vehicles.controller.ts      # search, get, history, create
├── vehicles.service.ts
├── dto/
│   ├── create-vehicle.dto.ts
│   ├── search-vehicles.dto.ts
│   └── vehicle-response.dto.ts
└── vehicles.service.spec.ts

prisma/schema.prisma            # Vehicle, VehicleOwnership; update Client relations
prisma/seed.ts                  # vehículos ligados a clientes seed
```

**Frontend (`apps/web`)**

```
src/features/vehicles/
├── components/
│   ├── VehicleSearchBar.tsx
│   ├── VehicleSearchResults.tsx
│   ├── VehicleForm.tsx
│   ├── ClientPicker.tsx          # envuelve US-003 search
│   ├── VehicleDetailHeader.tsx
│   └── VehicleVisitHistory.tsx
├── hooks/
│   ├── useVehicleSearch.ts
│   ├── useVehicle.ts
│   └── useCreateVehicle.ts
├── services/
│   └── vehiclesApi.ts
└── types/
    └── vehicle.types.ts

src/app/vehicles/
├── page.tsx
├── new/page.tsx
└── [id]/page.tsx

src/features/clients/...        # exportar ClientSearchBar para ClientPicker
```

### Flujo de implementación (orden sugerido)

1. Migración `Vehicle` + `VehicleOwnership`; ajustar relación en `Client`.
2. Tests unitarios: normalización placa, create con ownership, 409 duplicado, `clientId` inválido.
3. Controller + transacción Prisma `$transaction` en create.
4. `GET /history` devuelve `[]` hasta integrar `WorkOrder` (US-005).
5. UI búsqueda + formulario + `ClientPicker`.
6. Ficha `/vehicles/[id]` con historial (vacío o poblado).
7. Enlace desde US-003: `/vehicles/new?clientId=`.
8. Enlace hacia US-005: `/work-orders/new?vehicleId=` (stub si aún no existe).

### Tests requeridos

| Capa | Escenarios mínimos |
|------|-------------------|
| **Unit** | normalizeLicensePlate; create + ownership activo; duplicate plate 409; invalid clientId |
| **Integration** | POST 201; POST 409 body; GET search; GET :id; GET history empty array; transacción rollback si falla ownership |
| **E2E (opcional)** | Crear cliente → crear vehículo → buscar por placa → abrir ficha |

Cobertura objetivo módulo `vehicles`: ≥ 90 % en service.

### Requisitos no funcionales

| Área | Requisito |
|------|-----------|
| **Integridad** | Create vehículo + ownership en una transacción BD |
| **Rendimiento** | Búsqueda por placa indexada; p95 < 400 ms |
| **Preparación V2** | `VehicleOwnership` para D3; `excludeFromReminders` para D4 (sin UI en MVP) |
| **UX** | Mensajes en español; placa mostrada siempre normalizada |
| **Seguridad** | Solo usuarios autenticados del taller |

### Definition of Done

- [ ] Modelos migrados con ownership histórico (un activo por vehículo).
- [ ] Alta y búsqueda por placa operativas.
- [ ] Selector de cliente integrado en formulario.
- [ ] Ficha con propietario actual e historial (contrato API, aunque vacío).
- [ ] 409 muestra vehículo existente en UI.
- [ ] Tests unitarios e integración en verde.
- [ ] Enlace desde flujo de clientes (US-003) verificado.

### Dependencias

| Relación | Detalle |
|----------|---------|
| **Depende de** | US-001, US-003 |
| **Habilita** | US-005 (OT por vehículo), US-008 (panel por placa), US-009 (historial) |
| **Relacionado V2** | D3 transferencia propietario; D4 recordatorios (`excludeFromReminders`) |

---

## [original] Prioridad

Alta.

## [enhanced] Prioridad

**Alta (P0)** — prerequisito directo de US-005 (ingreso de vehículo al taller).

**Estimación orientativa:** 3–4 días (1 dev full-stack) por ownership, picker de cliente e ficha con historial.

---

## Metadatos

| Campo | Valor |
|-------|-------|
| **ID** | US-004 |
| **Módulo** | `vehicles` |
| **Estado refinamiento** | Enhanced (local) — pendiente sincronización Jira si aplica |
