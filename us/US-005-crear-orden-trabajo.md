# US-005 — Crear Orden de Trabajo

## [original] Historia de Usuario

**Como** mecánico o administrador,
**quiero** crear una Orden de Trabajo al ingresar un vehículo al taller,
**para** registrar formalmente la visita y comenzar a gestionar las tareas de esa atención.

## [enhanced] Historia de Usuario

**Como** mecánico o administrador,
**quiero** localizar un vehículo por placa (o registrarlo si no existe), abrir una Orden de Trabajo con motivo de ingreso y al menos una tarea inicial,
**para** documentar la visita en el momento del ingreso y continuar el trabajo en la OT (US-006) sin permitir dos visitas abiertas simultáneas para el mismo vehículo.

**Alcance MVP:** creación de OT + tarea(s) inicial(es) en una transacción; búsqueda de vehículo integrada; snapshot del propietario al ingreso. Fuera de alcance: editar OT cerrada, cancelar OT, reabrir OT entregada.

**Dependencia:** US-001, US-003, US-004. **Habilita:** US-006, US-007, US-008, US-009 (historial con visitas reales).

---

## [original] Criterios de Aceptación

- [ ] El usuario puede buscar el vehículo por placa antes de crear la OT; si no existe, puede registrarlo en el mismo flujo.
- [ ] Al crear la OT se registra automáticamente la fecha y hora de ingreso.
- [ ] El formulario de creación incluye: motivo de ingreso, kilometraje actual y mecánico asignado (opcional).
- [ ] Se debe registrar al menos una tarea inicial en el momento de crear la OT.
- [ ] La OT creada tiene el estado inicial **"En proceso"**.
- [ ] Una vez creada, la OT queda asociada al vehículo y visible en su historial.
- [ ] No se puede crear más de una OT activa para el mismo vehículo simultáneamente.

## [enhanced] Criterios de Aceptación

### UI — Flujo de ingreso

- [ ] Ruta principal: `/work-orders/new` (protegida `ADMIN` + `MECHANIC`).
- [ ] Acepta query `?vehicleId=` (desde US-004) para preseleccionar vehículo.
- [ ] **Paso 1 — Vehículo:** búsqueda por placa (reutiliza `VehicleSearchBar` / API US-004).
- [ ] Si no hay resultados: CTA **Registrar vehículo** → `/vehicles/new` con retorno a `/work-orders/new?vehicleId=` tras crear.
- [ ] Vehículo seleccionado muestra: placa, marca/modelo/año, propietario actual.
- [ ] Si el vehículo ya tiene OT activa → bloquear formulario y mostrar enlace a OT existente (`/work-orders/[id]`).

### Formulario de creación de OT

| Campo UI | Campo API | Obligatorio | Validación |
|----------|-----------|-------------|------------|
| Motivo de ingreso | `entryReason` | Sí | 5–500 caracteres |
| Kilometraje actual | `mileage` | Sí | Entero ≥ 0 |
| Mecánico asignado | `assignedMechanicId` | No | UUID de `User` con `role=MECHANIC`, `active=true` |
| Tareas iniciales | `initialTasks` | Sí | Array ≥ 1 elemento |
| Descripción tarea | `initialTasks[].description` | Sí | 3–300 caracteres c/u |

- [ ] UI permite agregar/quitar filas de tareas iniciales (mínimo 1).
- [ ] Listado de mecánicos: solo usuarios activos con rol `MECHANIC` (y opción *Sin asignar*).

### Comportamiento al guardar

- [ ] `checkedInAt` = timestamp servidor (no editable por usuario en MVP).
- [ ] Estado inicial OT: `EN_PROCESO`.
- [ ] Cada tarea inicial se crea con estado `PENDING`.
- [ ] Redirección a `/work-orders/[id]` tras éxito (pantalla de detalle / US-006).
- [ ] La OT aparece en `GET /api/vehicles/:id/history` de US-004.

### Regla — una OT activa por vehículo

- [ ] **OT activa** = estados `EN_PROCESO` o `LISTA_PARA_ENTREGA` (vehículo aún no retirado).
- [ ] Intento de crear segunda OT activa → HTTP `409` con `activeWorkOrderId`.
- [ ] Tras marcar OT como `ENTREGADA` (US-008), se puede crear nueva OT para el mismo vehículo.

### Snapshot de propietario

- [ ] Al crear OT, persistir `ownerClientId` con el propietario actual (`VehicleOwnership.validTo IS NULL`).
- [ ] Garantiza integridad del historial si el vehículo cambia de dueño (D3).

### Autorización

- [ ] `ADMIN` y `MECHANIC` pueden crear OT.
- [ ] Sin autenticación → `401`.

### Casos límite

- [ ] `vehicleId` inexistente → `404`.
- [ ] `assignedMechanicId` de usuario inactivo o no mecánico → `400`.
- [ ] `initialTasks` vacío → `400`.
- [ ] Kilometraje menor que el de la última OT del mismo vehículo: **advertencia en UI** (no bloqueante en MVP) o campo informativo.

---

## [original] Roles involucrados

- Administrador
- Mecánico

## [enhanced] Roles involucrados

| Rol | Código | Permisos en esta US |
|-----|--------|---------------------|
| Administrador | `ADMIN` | Crear OT, buscar vehículo, asignar mecánico |
| Mecánico | `MECHANIC` | Crear OT, buscar vehículo, asignar mecánico (incl. compañeros) |

---

## [original] Notas técnicas

- La OT es la entidad central del sistema; vincula vehículo, cliente, tareas y costos.
- El estado de la OT es: `en_proceso` | `lista_para_entrega` | `entregada`.
- La transición a `lista_para_entrega` ocurre automáticamente cuando todas las tareas están completadas.

## [enhanced] Especificación técnica

### Modelo de datos (Prisma)

```prisma
enum WorkOrderStatus {
  EN_PROCESO
  LISTA_PARA_ENTREGA
  ENTREGADA
}

enum WorkOrderTaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}

model WorkOrder {
  id                  String           @id @default(uuid())
  vehicleId           String
  ownerClientId       String           // snapshot propietario al ingreso
  status              WorkOrderStatus  @default(EN_PROCESO)
  entryReason         String
  mileage             Int
  assignedMechanicId  String?
  checkedInAt         DateTime         @default(now())
  deliveredAt         DateTime?
  createdById         String
  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt

  vehicle             Vehicle          @relation(fields: [vehicleId], references: [id])
  ownerClient         Client           @relation(fields: [ownerClientId], references: [id])
  assignedMechanic    User?            @relation("AssignedMechanic", fields: [assignedMechanicId], references: [id])
  createdBy           User             @relation("CreatedBy", fields: [createdById], references: [id])
  tasks               WorkOrderTask[]

  @@index([vehicleId, status])
  @@index([checkedInAt])
}

model WorkOrderTask {
  id           String              @id @default(uuid())
  workOrderId  String
  description  String
  status       WorkOrderTaskStatus @default(PENDING)
  cost         Decimal?            @db.Decimal(12, 2)
  sortOrder    Int                 @default(0)
  createdAt    DateTime            @default(now())
  updatedAt    DateTime            @updatedAt

  workOrder    WorkOrder           @relation(fields: [workOrderId], references: [id], onDelete: Cascade)

  @@index([workOrderId])
}
```

**Índice / constraint recomendado (aplicación + BD):**

- A nivel servicio: antes de `create`, consultar OT con `vehicleId` y `status IN (EN_PROCESO, LISTA_PARA_ENTREGA)`.
- Opcional Prisma/raw: índice parcial único documentado en migración SQL si el motor lo soporta.

**Transición `LISTA_PARA_ENTREGA`:** implementada en US-006 al completar todas las tareas; no forma parte del create de US-005.

### API REST

Prefijo `/api/work-orders`. Roles: `@Roles('ADMIN', 'MECHANIC')`.

#### `GET /api/work-orders/mechanics`

Lista mecánicos activos para el selector.

**Response `200`:**

```json
[
  { "id": "uuid", "fullName": "Carlos Méndez" }
]
```

#### `GET /api/work-orders/active`

| Query | Descripción |
|-------|-------------|
| `vehicleId` | UUID del vehículo |

**Response `200`:** OT activa o `null`.

```json
{
  "activeWorkOrder": {
    "id": "uuid",
    "status": "EN_PROCESO",
    "checkedInAt": "2026-05-21T09:00:00.000Z"
  }
}
```

#### `POST /api/work-orders`

Crea OT + tareas iniciales en transacción.

**Request body:**

```json
{
  "vehicleId": "vehicle-uuid",
  "entryReason": "Ruido en suspensión delantera",
  "mileage": 85400,
  "assignedMechanicId": "user-uuid",
  "initialTasks": [
    { "description": "Revisión de suspensión por ruido" }
  ]
}
```

**Response `201`:**

```json
{
  "id": "uuid",
  "vehicleId": "vehicle-uuid",
  "ownerClientId": "client-uuid",
  "status": "EN_PROCESO",
  "entryReason": "Ruido en suspensión delantera",
  "mileage": 85400,
  "assignedMechanicId": "user-uuid",
  "checkedInAt": "2026-05-21T09:15:00.000Z",
  "tasks": [
    {
      "id": "task-uuid",
      "description": "Revisión de suspensión por ruido",
      "status": "PENDING",
      "cost": null
    }
  ],
  "vehicle": {
    "licensePlate": "ABC123",
    "brand": "Toyota",
    "model": "Corolla"
  },
  "owner": {
    "fullName": "Juan Pérez",
    "nationalId": "1-2345-6789"
  }
}
```

**Errores:**

| Código | Condición |
|--------|-----------|
| `400` | Validación / sin tareas / mecánico inválido |
| `401` | Sin autenticación |
| `404` | Vehículo no existe |
| `409` | Ya existe OT activa para el vehículo |

**Ejemplo `409`:**

```json
{
  "statusCode": 409,
  "message": "Vehicle already has an active work order",
  "error": "Conflict",
  "activeWorkOrderId": "existing-uuid"
}
```

#### `GET /api/work-orders/:id`

Detalle de OT (cabecera + tareas) — base para US-006.

**Errores:** `401` | `404`

### Archivos a crear o modificar

**Backend (`apps/api`)**

```
src/modules/work-orders/
├── work-orders.module.ts
├── work-orders.controller.ts    # POST, GET :id, GET active, GET mechanics
├── work-orders.service.ts
├── dto/
│   ├── create-work-order.dto.ts
│   └── work-order-response.dto.ts
└── work-orders.service.spec.ts

src/modules/vehicles/vehicles.service.ts   # poblar GET :id/history con WorkOrder
prisma/schema.prisma                       # WorkOrder, WorkOrderTask, enums
prisma/seed.ts                             # 1 OT de ejemplo opcional
```

**Frontend (`apps/web`)**

```
src/features/work-orders/
├── components/
│   ├── WorkOrderCreateForm.tsx
│   ├── InitialTasksEditor.tsx
│   ├── VehicleStepPicker.tsx
│   ├── MechanicSelect.tsx
│   └── ActiveWorkOrderBanner.tsx
├── hooks/
│   ├── useCreateWorkOrder.ts
│   ├── useActiveWorkOrder.ts
│   └── useMechanics.ts
├── services/
│   └── workOrdersApi.ts
└── types/
    └── work-order.types.ts

src/app/work-orders/
├── new/page.tsx
└── [id]/page.tsx                 # detalle mínimo; US-006 amplía tareas

src/app/vehicles/[id]/page.tsx    # botón Nueva OT + validación activa
```

### Flujo de implementación (orden sugerido)

1. Enums y modelos Prisma + migración.
2. Tests unitarios: create OK; sin tareas → error; OT activa → 409; snapshot `ownerClientId`.
3. `WorkOrdersService.create` con `$transaction` (OT + tasks).
4. Endpoints controller + `GET active` + `GET mechanics`.
5. Actualizar `VehiclesService.getHistory` para devolver visitas reales.
6. UI wizard: vehículo → formulario → redirect a detalle.
7. Integrar enlaces desde `/vehicles/[id]` y `/vehicles/new` → `/work-orders/new`.
8. Placeholder `/work-orders/[id]` listo para US-006.

### Tests requeridos

| Capa | Escenarios mínimos |
|------|-------------------|
| **Unit** | create with 1+ tasks; reject empty tasks; reject active duplicate; ownerClientId from current ownership; assignedMechanic validation |
| **Integration** | POST 201; POST 409; GET active; GET :id; history includes new OT; mechanic list only MECHANIC active |
| **E2E (opcional)** | Buscar placa → crear OT → ver en historial vehículo |

Cobertura objetivo módulo `work-orders` (create paths): ≥ 90 %.

### Requisitos no funcionales

| Área | Requisito |
|------|-----------|
| **Transaccionalidad** | OT + tareas atómicas; rollback si falla cualquier insert |
| **Concurrencia** | Validar OT activa dentro de la transacción (o `Serializable`) si dos usuarios ingresan el mismo vehículo a la vez |
| **Auditoría** | `createdById` = usuario autenticado |
| **Rendimiento** | Create p95 < 600 ms |
| **UX** | Flujo ≤ 3 pasos; mensajes en español; estados enum mostrados traducidos en UI |

### Definition of Done

- [ ] Migración `WorkOrder` / `WorkOrderTask` aplicada.
- [ ] Crear OT con ≥ 1 tarea inicial funcional end-to-end.
- [ ] Regla una OT activa por vehículo verificada en tests.
- [ ] `checkedInAt` automático; estado `EN_PROCESO`.
- [ ] Historial de vehículo (US-004) muestra la nueva visita.
- [ ] Flujo “vehículo no existe → registrar → crear OT” documentado y probado manualmente.
- [ ] Redirección a detalle de OT tras crear.

### Dependencias

| Relación | Detalle |
|----------|---------|
| **Depende de** | US-001, US-003, US-004 |
| **Habilita** | US-006 (tareas), US-007 (diagnósticos), US-008 (panel entrega), US-009 (historial) |
| **Transiciones** | A `LISTA_PARA_ENTREGA`: US-006; a `ENTREGADA`: US-008 |

---

## [original] Prioridad

Alta — es el flujo operativo principal del sistema.

## [enhanced] Prioridad

**Alta (P0)** — flujo operativo central del taller; sin OT no hay tareas ni panel de entrega.

**Estimación orientativa:** 4–5 días (1 dev full-stack) por modelo, transacción, flujo vehículo integrado y tests.

---

## Metadatos

| Campo | Valor |
|-------|-------|
| **ID** | US-005 |
| **Módulo** | `work-orders` |
| **Estado refinamiento** | Enhanced (local) — pendiente sincronización Jira si aplica |
