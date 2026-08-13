# US-008 — Panel de Vehículos Listos para Entrega

## [original] Historia de Usuario

**Como** administrador del taller,
**quiero** ver un panel con todos los vehículos cuyas órdenes de trabajo están completadas,
**para** gestionar el proceso de contacto con el propietario y la facturación.

## [enhanced] Historia de Usuario

**Como** administrador del taller,
**quiero** un panel exclusivo con las OT en **Lista para entrega**, ver en cada fila el teléfono del propietario junto a placa, modelo y monto, consultar el detalle de cobro por tarea y marcar la visita como **Entregada** cuando el propietario retira el vehículo,
**para** contactar al cliente y cerrar la visita sin abrir otras pantallas (ficha de cliente u OT).

**Alcance MVP:** listado, detalle expandible, marcar `ENTREGADA` con `deliveredAt`. Solo `ADMIN`. Fuera de alcance MVP: marcar contacto al propietario (D1), envío de email (D2) — campos/estados previstos en modelo.

**Dependencia:** US-006 (OT en `LISTA_PARA_ENTREGA` + `totalAmount`). **Habilita:** ciclo completo de cierre de visita; nueva OT por vehículo (US-005).

---

## [original] Criterios de Aceptación

- [ ] El panel muestra únicamente OTs en estado **"Lista para entrega"**.
- [ ] Cada fila muestra: placa, marca y modelo del vehículo, nombre del propietario, **teléfono del propietario** y monto total a cobrar.
- [ ] Al seleccionar un vehículo, se despliega el detalle completo de la OT: lista de tareas realizadas, costo individual por tarea, total a cobrar, fecha de ingreso y tiempo transcurrido desde el ingreso.
- [ ] El panel se actualiza en tiempo real (o al recargar) cuando una OT nueva pasa a estado `lista_para_entrega`.
- [ ] El administrador puede marcar la OT como **"Entregada"** una vez que el propietario retire el vehículo; esto la saca del panel.
- [ ] Un mecánico no tiene acceso a este panel.

## [enhanced] Criterios de Aceptación

### UI — Panel de entrega (solo administrador)

- [ ] Ruta: `/admin/delivery` — guard `role === ADMIN`.
- [ ] Enlace **Listos para entrega** solo en layout admin (no en mecánico).
- [ ] `MECHANIC` que acceda a la URL → redirección `/403` o dashboard mecánico.

### Listado

- [ ] Solo OT con `status = LISTA_PARA_ENTREGA`.
- [ ] Tabla:

| Columna | Fuente | Notas UI |
|---------|--------|----------|
| Placa | `vehicle.licensePlate` | — |
| Modelo | `{brand} {model} {year}` | — |
| Propietario | `ownerClient.fullName` (snapshot `ownerClientId`) | — |
| **Teléfono** | `ownerClient.phone` | **Visible en la tabla principal** (no solo en detalle) |
| Monto total | `totalAmount` (suma tareas `COMPLETED`) | Formato CRC |

- [ ] El teléfono se obtiene del `Client` vinculado a `ownerClientId` (propietario al ingreso de la OT).
- [ ] Si `phone` es null o vacío → mostrar *"Sin teléfono"* en la celda (texto atenuado); no ocultar la columna.
- [ ] Si hay teléfono → enlace `tel:{phone}` (móvil/escritorio) y/o botón copiar al portapapeles (opcional MVP: enlace `tel:` basta).
- [ ] La columna **Teléfono** permanece visible sin expandir la fila, para que el administrador pueda llamar desde el listado.
- [ ] Orden por defecto: `checkedInAt` ascendente (más antiguo primero — priorizar contacto).
- [ ] Formato moneda en UI: colones CRC (ej. `₡85,000`).
- [ ] Estado vacío: *"No hay vehículos listos para entrega"*.
- [ ] Botón **Actualizar** (refetch); sin WebSockets en MVP (criterio “tiempo real” = al recargar/refetch).
- [ ] Opcional: polling cada 60 s mientras la pestaña está activa.

### Detalle al seleccionar fila

- [ ] Panel lateral o fila expandible con:
  - Datos vehículo y propietario: repetir **teléfono** (mismo valor que la tabla, con `tel:`) y correo si existe.
  - Fecha/hora de ingreso (`checkedInAt`, timezone local).
  - **Tiempo transcurrido** desde ingreso (ej. *"2 días 5 horas"* — calculado en frontend o API `elapsedLabel`).
  - Tabla de tareas: descripción, costo, `costNotes` si existe (US-006).
  - **Total a cobrar** destacado.
  - Motivo de ingreso (`entryReason`), kilometraje.
- [ ] Enlace **Ver OT completa** → `/work-orders/[id]` (solo lectura si OT ya no es `EN_PROCESO`).

### Marcar como entregada

- [ ] Botón **Marcar como entregada** en detalle.
- [ ] Diálogo de confirmación: *"¿Confirmar retiro del vehículo {placa}?"*
- [ ] Tras confirmar:
  - `status` → `ENTREGADA`
  - `deliveredAt` = timestamp servidor
  - OT desaparece del panel
  - Vehículo elegible para nueva OT (US-005)
- [ ] Solo permitido desde `LISTA_PARA_ENTREGA` (no desde `OWNER_CONTACTED` hasta implementar D1).

### Autorización API

- [ ] Todos los endpoints del módulo `delivery`: `@Roles('ADMIN')`.
- [ ] `MECHANIC` → `403 Forbidden`.

### Preparación D1 / D2 (modelo, sin UI MVP)

- [ ] Enum `WorkOrderStatus` incluye valor `OWNER_CONTACTED` (no usado en panel MVP).
- [ ] Campos opcionales en `WorkOrder`: `ownerContactedAt`, `ownerContactedById` (nullable).
- [ ] Sin botón “Contactar propietario” ni envío de email en esta US.

### Casos límite

- [ ] OT pasa a `LISTA_PARA_ENTREGA` mientras el admin tiene el panel abierto → visible tras refetch.
- [ ] `totalAmount = 0` si todas las tareas completadas con costo 0 → mostrar `₡0` (válido).
- [ ] Cliente sin teléfono registrado (US-003, campo opcional) → fila igualmente usable; admin puede localizar correo en detalle o ficha cliente si lo necesita.
- [ ] Doble clic en entregar → idempotencia: segunda llamada sobre `ENTREGADA` → `409` o `200` idempotente.

---

## [original] Roles involucrados

- Administrador (único con acceso)

## [enhanced] Roles involucrados

| Rol | Código | Permisos en esta US |
|-----|--------|---------------------|
| Administrador | `ADMIN` | Ver panel, detalle, marcar entregada |
| Mecánico | `MECHANIC` | Sin acceso |

---

## [original] Notas técnicas

- El monto total se calcula como suma de costos de todas las tareas de la OT.
- El tiempo transcurrido se calcula como diferencia entre la fecha actual y la fecha de ingreso de la OT.
- Al pasar a estado `entregada` se registra la fecha y hora de entrega.
- El estado `propietario_contactado` (D1) debe estar previsto en el modelo desde V1 aunque no se implemente la funcionalidad todavía.

## [enhanced] Especificación técnica

### Modelo de datos (extensión)

**Enum** (ampliar US-005):

```prisma
enum WorkOrderStatus {
  EN_PROCESO
  LISTA_PARA_ENTREGA
  OWNER_CONTACTED      // D1 — reservado MVP
  ENTREGADA
}
```

**`WorkOrder`** (campos adicionales):

| Campo | Tipo | MVP |
|-------|------|-----|
| `deliveredAt` | `DateTime?` | Set al marcar entregada |
| `ownerContactedAt` | `DateTime?` | Null — D1 |
| `ownerContactedById` | `String?` | Null — D1 FK `User` |

**Cálculos (servicio compartido con US-006):**

```typescript
function computeTotalAmount(tasks: WorkOrderTask[]): number {
  return tasks
    .filter((t) => t.status === 'COMPLETED' && t.cost != null)
    .reduce((sum, t) => sum + Number(t.cost), 0);
}

function formatElapsed(checkedInAt: Date, now = new Date()): string {
  // ej. implementación con differenceInHours/Days o API i18n
}
```

### API REST

Módulo `delivery`. Prefijo `/api/delivery`. **Solo `ADMIN`.**

#### `GET /api/delivery/ready`

Lista OT listas para entrega. **Obligatorio** incluir `ownerPhone` en cada ítem del listado (join `Client` por `ownerClientId`), no solo en el endpoint de detalle.

**Response `200`:**

```json
{
  "items": [
    {
      "workOrderId": "uuid",
      "licensePlate": "ABC123",
      "vehicleLabel": "Toyota Corolla 2018",
      "ownerName": "Juan Pérez",
      "ownerPhone": "88887777",
      "ownerPhoneDisplay": "8888-7777",
      "ownerEmail": "juan@email.com",
      "totalAmount": 85000,
      "checkedInAt": "2026-05-18T10:00:00.000Z",
      "elapsedLabel": "3 días 4 horas"
    }
  ],
  "total": 1
}
```

**Query opcionales (MVP):** `sort=checkedInAt|totalAmount`, `order=asc|desc`.

#### `GET /api/delivery/ready/:workOrderId`

Detalle para panel expandido.

**Response `200`:**

```json
{
  "workOrderId": "uuid",
  "status": "LISTA_PARA_ENTREGA",
  "entryReason": "Ruido en suspensión",
  "mileage": 85400,
  "checkedInAt": "2026-05-18T10:00:00.000Z",
  "elapsedLabel": "3 días 4 horas",
  "totalAmount": 85000,
  "vehicle": { "licensePlate": "ABC123", "brand": "Toyota", "model": "Corolla", "year": 2018 },
  "owner": { "fullName": "Juan Pérez", "phone": "88887777", "email": "juan@email.com" },
  "tasks": [
    {
      "id": "task-uuid",
      "description": "Cambio amortiguador",
      "status": "COMPLETED",
      "cost": 85000,
      "costNotes": "Repuesto + MO"
    }
  ]
}
```

**Errores:** `401` | `403` | `404` (OT no está en `LISTA_PARA_ENTREGA`)

#### `PATCH /api/delivery/ready/:workOrderId/deliver`

Marca OT como entregada.

**Request:** body vacío o `{ "confirm": true }`.

**Response `200`:**

```json
{
  "workOrderId": "uuid",
  "status": "ENTREGADA",
  "deliveredAt": "2026-05-21T16:30:00.000Z"
}
```

**Errores:**

| Código | Condición |
|--------|-----------|
| `403` | No admin |
| `404` | OT no existe |
| `409` | OT no está en `LISTA_PARA_ENTREGA` (ya entregada u otro estado) |

### Archivos a crear o modificar

**Backend (`apps/api`)**

```
src/modules/delivery/
├── delivery.module.ts
├── delivery.controller.ts
├── delivery.service.ts
├── dto/
│   └── delivery-list-item.dto.ts
└── delivery.service.spec.ts

src/modules/work-orders/work-orders.service.ts   # computeTotalAmount export
prisma/schema.prisma                             # enum OWNER_CONTACTED, campos D1
```

**Frontend (`apps/web`)**

```
src/features/delivery-panel/
├── components/
│   ├── DeliveryReadyTable.tsx      # columnas incl. Teléfono + tel: link
│   ├── OwnerPhoneCell.tsx          # valor, "Sin teléfono", enlace tel:
│   ├── DeliveryReadyDetail.tsx
│   └── MarkDeliveredDialog.tsx
├── hooks/
│   ├── useDeliveryReadyList.ts
│   └── useMarkDelivered.ts
├── services/
│   └── deliveryApi.ts
└── types/
    └── delivery.types.ts

src/app/admin/delivery/page.tsx
src/app/admin/layout.tsx                         # nav "Listos para entrega"
```

### Flujo de implementación (orden sugerido)

1. Migración: enum `OWNER_CONTACTED`, campos `ownerContacted*`, asegurar `deliveredAt`.
2. Tests: list solo `LISTA_PARA_ENTREGA`; deliver → `ENTREGADA` + `deliveredAt`; mechanic 403.
3. `DeliveryService` + controller admin-only.
4. UI tabla + detalle + confirmación entregar.
5. Refetch manual + documentar ausencia de WebSocket.
6. Verificar vehículo puede crear nueva OT tras entregar (test integración US-005).
7. Placeholder en código/comentarios para D1 endpoint `PATCH .../mark-contacted` (V2).

### Tests requeridos

| Capa | Escenarios mínimos |
|------|-------------------|
| **Unit** | list filters status; totalAmount correct; deliver sets deliveredAt; reject deliver from EN_PROCESO |
| **Integration** | GET ready 200 admin con `ownerPhone` poblado; `ownerPhone` null si cliente sin teléfono; 403 mechanic; PATCH deliver 200; OT absent from list after deliver; 409 double deliver |
| **E2E (opcional)** | Completar todas las tareas → aparece en panel → marcar entregada → desaparece |

Cobertura objetivo módulo `delivery`: ≥ 90 %.

### Requisitos no funcionales

| Área | Requisito |
|------|-----------|
| **Seguridad** | Endpoints exclusivos `ADMIN`; no filtrar datos sensibles extra |
| **Rendimiento** | Listado < 500 ms con ≤ 50 OT en panel |
| **UX** | Tabla legible con teléfono en vista principal; total destacado; tiempo transcurrido claro; contacto sin cambiar de pantalla |
| **i18n** | Etiquetas en español; montos CRC |
| **Evolución D1** | Panel futuro filtra `LISTA_PARA_ENTREGA` + `OWNER_CONTACTED` en misma vista |

### Definition of Done

- [ ] Panel `/admin/delivery` operativo solo para admin.
- [ ] Listado con columnas requeridas, **incluida Teléfono del propietario** visible sin expandir fila.
- [ ] API `GET /delivery/ready` devuelve `ownerPhone` en todos los ítems.
- [ ] Marcar entregada registra `deliveredAt` y quita OT del panel.
- [ ] Mecánico bloqueado en UI y API.
- [ ] Modelo preparado para D1 (`OWNER_CONTACTED`, campos contacto).
- [ ] Refetch actualiza lista tras nueva OT lista para entrega.
- [ ] Tests en verde.

### Dependencias

| Relación | Detalle |
|----------|---------|
| **Depende de** | US-006 (estado `LISTA_PARA_ENTREGA`, costos) |
| **Relacionado** | US-007 (detalle tareas en panel), US-005 (nueva OT tras entregar) |
| **V2** | D1 contacto, D2 email desde este panel |

---

## [original] Prioridad

Alta.

## [enhanced] Prioridad

**Alta (P0)** — cierre del ciclo operativo junto con US-006; única US exclusiva de administrador en el flujo principal.

**Estimación orientativa:** 2–3 días (1 dev full-stack).

---

## Metadatos

| Campo | Valor |
|-------|-------|
| **ID** | US-008 |
| **Módulo** | `delivery` |
| **Estado refinamiento** | Enhanced (local) — pendiente sincronización Jira si aplica |
