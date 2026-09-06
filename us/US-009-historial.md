# US-009 — Historial de Vehículos y Clientes

## [original] Historia de Usuario

**Como** mecánico o administrador,
**quiero** consultar el historial completo de visitas de un vehículo o cliente,
**para** tener contexto técnico antes de iniciar una nueva atención o responder consultas del propietario.

## [enhanced] Historia de Usuario

**Como** mecánico o administrador,
**quiero** consultar en solo lectura el historial de visitas de un vehículo (por placa) o los vehículos de un cliente (por nombre/identificación), con detalle de tareas, notas técnicas y montos,
**para** decidir la nueva atención con contexto completo y responder al propietario sin modificar visitas cerradas.

**Alcance MVP:** consulta consolidada vehículo + ficha cliente con vehículos e historial enlazado; entradas desde búsquedas existentes (US-003, US-004). Fuera de alcance: exportar PDF, filtros avanzados por fecha, historial de vehículos que ya no son del cliente (solo vía ficha del vehículo).

**Dependencia:** US-004 (ficha vehículo), US-005–US-008 (OT con datos), US-007 (notas técnicas). **Módulo:** `history` (orquesta queries; puede vivir en `vehicles` + `clients`).

---

## [original] Criterios de Aceptación

- [ ] Desde la ficha del vehículo se puede acceder al historial de visitas, ordenadas de la más reciente a la más antigua.
- [ ] Cada visita en el historial muestra: fecha de ingreso, motivo de ingreso, tareas realizadas, diagnósticos/reparaciones registradas y monto cobrado en esa visita.
- [ ] Desde la ficha del cliente se puede ver el listado de todos sus vehículos registrados y acceder al historial de cada uno.
- [ ] El historial es de solo lectura; no permite editar OTs cerradas.
- [ ] La búsqueda de vehículo por placa o de cliente por nombre/identificación permite llegar al historial desde cualquier punto del sistema.

## [enhanced] Criterios de Aceptación

### Alcance del historial

- [ ] **Por vehículo:** todas las OT asociadas al `vehicleId`, cualquier estado (`EN_PROCESO`, `LISTA_PARA_ENTREGA`, `OWNER_CONTACTED`, `ENTREGADA`), orden **`checkedInAt` DESC** (más reciente primero).
- [ ] **Visitas cerradas** (`ENTREGADA`): núcleo del historial histórico (nota técnica original).
- [ ] **Visitas abiertas** (estados no entregados): se listan en la misma timeline con badge de estado (ej. *En proceso*, *Lista para entrega*) para contexto antes de una nueva OT.
- [ ] **Propietario por visita:** siempre `ownerAtVisit` desde `WorkOrder.ownerClientId` (snapshot), no el propietario actual del vehículo — integridad ante cambio de dueño (D3).

### Contenido por visita (expandible)

Cada ítem del historial muestra:

| Dato | Fuente |
|------|--------|
| Fecha de ingreso | `checkedInAt` |
| Fecha de entrega | `deliveredAt` (si `ENTREGADA`) |
| Estado OT | `status` (traducido) |
| Motivo de ingreso | `entryReason` |
| Propietario en esa visita | `ownerAtVisit.fullName`, `nationalId` |
| Monto cobrado | `totalAmount` (suma tareas `COMPLETED`) |
| Tareas | `tasks[]`: descripción, estado, costo, `costNotes` |
| Notas técnicas tarea | `diagnosis`, `repairPerformed`, `partsUsed`, `additionalNotes` (US-007) |
| Notas generales visita | `visitDiagnosis`, `visitRepairSummary`, etc. (US-007) |

- [ ] Secciones vacías muestran *"Sin registro"* sin ocultar el bloque.

### Ficha vehículo (`/vehicles/[id]`)

- [ ] Sección **Historial de visitas** (timeline o acordeón).
- [ ] Enlace desde resultados de búsqueda US-004 → ficha con historial visible.
- [ ] Acción **Ver OT** → `/work-orders/[id]` en modo solo lectura si `status !== EN_PROCESO`; si `EN_PROCESO`, enlace al detalle editable (US-006).

### Ficha cliente (`/clients/[id]`)

- [ ] Nueva ruta `/clients/[id]` (detalle cliente).
- [ ] Bloque **Vehículos del cliente:** vehículos con `VehicleOwnership` activo (`validTo IS NULL`).
- [ ] Por cada vehículo: placa, marca/modelo/año, enlace **Ver historial** → `/vehicles/[id]#historial` o sección historial embebida resumida (última visita + enlace).
- [ ] Cliente sin vehículos → mensaje *"Sin vehículos registrados"*.

### Solo lectura

- [ ] En vistas de historial: sin botones editar OT/tareas/notas para visitas `ENTREGADA` o `LISTA_PARA_ENTREGA`.
- [ ] OT `EN_PROCESO`: enlace *"Continuar OT"* (edición en US-006), no desde componente historial.
- [ ] API de historial: solo métodos `GET` (sin mutaciones en módulo `history`).

### Puntos de entrada (búsqueda)

- [ ] **Vehículo:** `/vehicles` búsqueda por placa → seleccionar → `/vehicles/[id]`.
- [ ] **Cliente:** `/clients` búsqueda (US-003) → seleccionar → `/clients/[id]`.
- [ ] Opcional MVP: campo **Buscar historial** en nav con tabs Placa / Cliente (reutiliza APIs search).

### Autorización

- [ ] `ADMIN` y `MECHANIC` en todos los endpoints de historial.

### Casos límite

- [ ] Vehículo sin visitas → timeline vacío con CTA *"Crear orden de trabajo"* (US-005).
- [ ] Cliente con teléfono/email opcionales: mostrar en cabecera de ficha para consultas del propietario.
- [ ] OT con `totalAmount = 0` → mostrar `₡0`.

---

## [original] Roles involucrados

- Administrador
- Mecánico

## [enhanced] Roles involucrados

| Rol | Código | Permisos en esta US |
|-----|--------|---------------------|
| Administrador | `ADMIN` | Consultar historial vehículo y cliente |
| Mecánico | `MECHANIC` | Consultar historial vehículo y cliente |

---

## [original] Notas técnicas

- Las OTs en estado `entregada` forman el historial histórico del vehículo.
- El historial debe mantenerse intacto incluso si el vehículo cambia de propietario (D3).

## [enhanced] Especificación técnica

### Reglas de datos

1. **Historial por vehículo** = todas las `WorkOrder` donde `vehicleId = :id`, sin filtrar por propietario actual.
2. **Propietario mostrado** = `Client` join por `WorkOrder.ownerClientId` (snapshot al crear OT — US-005).
3. **Vehículos del cliente** = `Vehicle` con ownership activo para `clientId` (no incluye vehículos vendidos a otro dueño salvo que se implemente listado histórico en D3).
4. **Inmutabilidad:** datos de OT `ENTREGADA` no se modifican desde esta US; consultas idempotentes.

### API REST

Roles: `@Roles('ADMIN', 'MECHANIC')`.

#### `GET /api/vehicles/:id/history`

Consolida y **amplía** el contrato iniciado en US-004 / US-007.

**Response `200`:**

```json
{
  "vehicleId": "uuid",
  "licensePlate": "ABC123",
  "vehicleLabel": "Toyota Corolla 2018",
  "currentOwner": {
    "id": "client-uuid",
    "fullName": "María López",
    "nationalId": "2-3456-7890"
  },
  "visits": [
    {
      "workOrderId": "uuid",
      "checkedInAt": "2026-05-10T08:00:00.000Z",
      "deliveredAt": "2026-05-12T17:00:00.000Z",
      "status": "ENTREGADA",
      "statusLabel": "Entregada",
      "entryReason": "Ruido en suspensión",
      "mileage": 82000,
      "totalAmount": 85000,
      "ownerAtVisit": {
        "id": "owner-snapshot-uuid",
        "fullName": "Juan Pérez",
        "nationalId": "1-2345-6789"
      },
      "visitNotes": {
        "visitDiagnosis": "Cliente reporta ruido en badén",
        "visitRepairSummary": "Suspensión delantera reparada",
        "visitPartsUsed": null,
        "visitAdditionalNotes": null
      },
      "tasks": [
        {
          "id": "task-uuid",
          "description": "Cambio amortiguador",
          "status": "COMPLETED",
          "cost": 85000,
          "costNotes": "Repuesto + MO",
          "diagnosis": "Amortiguador gastado",
          "repairPerformed": "Reemplazo DL",
          "partsUsed": "Amortiguador x1",
          "additionalNotes": null
        }
      ]
    }
  ],
  "total": 1
}
```

**Errores:** `401` | `404` vehículo no existe

#### `GET /api/clients/:id`

Ficha cliente para historial agregado.

**Response `200`:**

```json
{
  "id": "uuid",
  "fullName": "Juan Pérez",
  "nationalId": "1-2345-6789",
  "phone": "88887777",
  "email": "juan@email.com",
  "vehicles": [
    {
      "id": "vehicle-uuid",
      "licensePlate": "ABC123",
      "brand": "Toyota",
      "model": "Corolla",
      "year": 2018,
      "lastVisitAt": "2026-05-10T08:00:00.000Z",
      "lastVisitStatus": "ENTREGADA"
    }
  ]
}
```

#### `GET /api/clients/:id/vehicles` (opcional)

Solo listado de vehículos activos del cliente; puede fusionarse en `GET /clients/:id`.

#### `GET /api/history/search` (opcional MVP)

| Query | Acción |
|-------|--------|
| `licensePlate` | Redirige/resuelve a `vehicleId` + history |
| `clientId` | Devuelve ficha cliente |

Reutilizar `GET /api/vehicles/search` y `GET /api/clients/search` si se prefiere no duplicar.

### Archivos a crear o modificar

**Backend (`apps/api`)**

```
src/modules/history/
├── history.module.ts
├── history.controller.ts          # opcional agregador
├── history.service.ts               # getVehicleHistory, getClientProfile
└── history.service.spec.ts

src/modules/vehicles/vehicles.service.ts   # delegar o mover getHistory aquí
src/modules/clients/clients.service.ts     # findById con vehicles activos
src/modules/clients/clients.controller.ts  # GET :id
```

**Frontend (`apps/web`)**

```
src/features/history/
├── components/
│   ├── VisitTimeline.tsx
│   ├── VisitCard.tsx
│   ├── VisitTasksList.tsx
│   └── ClientVehiclesList.tsx
├── hooks/
│   ├── useVehicleHistory.ts
│   └── useClientProfile.ts
└── services/
    └── historyApi.ts

src/app/vehicles/[id]/page.tsx      # integrar VisitTimeline
src/app/clients/[id]/page.tsx       # nueva ficha + ClientVehiclesList
src/features/vehicles/...           # enlace desde búsqueda
src/features/clients/...            # enlace desde búsqueda a /clients/[id]
```

### Flujo de implementación (orden sugerido)

1. Tests de `HistoryService`: orden DESC; `ownerAtVisit` distinto de propietario actual; tareas y notas incluidas.
2. Implementar `getVehicleHistory` con includes Prisma (workOrders → tasks, ownerClient).
3. `GET /clients/:id` con vehículos de ownership activo.
4. UI `VisitTimeline` en `/vehicles/[id]`.
5. UI `/clients/[id]` con listado de vehículos y enlaces.
6. Modo solo lectura: ocultar acciones de edición en `VisitCard` según `status`.
7. Verificar navegación desde búsquedas US-003/US-004.

### Tests requeridos

| Capa | Escenarios mínimos |
|------|-------------------|
| **Unit** | visits ordered DESC; ownerAtVisit from ownerClientId; totalAmount per visit; empty history |
| **Integration** | GET vehicle history 200 con tasks técnicas; GET client 200 con vehicles; 404; 403 no aplica (mechanic allowed) |
| **E2E (opcional)** | Buscar placa → ver 2 visitas → abrir cliente → ir a historial de vehículo |

Cobertura objetivo `history.service`: ≥ 85 %.

### Requisitos no funcionales

| Área | Requisito |
|------|-----------|
| **Rendimiento** | Historial con ≤ 50 visitas y tareas eager-loaded: p95 < 800 ms |
| **UX** | Timeline clara; estados con color/badge; montos CRC; solo lectura evidente |
| **Integridad D3** | Nunca sustituir `ownerAtVisit` por propietario actual en ítems pasados |
| **Accesibilidad** | Acordeón con `aria-expanded`; fechas en locale `es-CR` |

### Definition of Done

- [ ] `GET /vehicles/:id/history` devuelve visitas completas (tareas + notas US-007).
- [ ] Ficha `/vehicles/[id]` muestra historial ordenado DESC.
- [ ] Ficha `/clients/[id]` lista vehículos activos con enlace a historial.
- [ ] Historial sin acciones de edición en visitas cerradas/listas para entrega.
- [ ] Búsqueda placa/cliente lleva al historial sin pasos extra.
- [ ] Tests unitarios e integración en verde.

### Dependencias

| Relación | Detalle |
|----------|---------|
| **Depende de** | US-004, US-005, US-006, US-007 (contenido); US-008 opcional (`deliveredAt`) |
| **Complementa** | US-004 ficha vehículo; US-003 búsqueda clientes |
| **D3** | Snapshot `ownerClientId` validado en consultas de historial |

---

## [original] Prioridad

Media.

## [enhanced] Prioridad

**Media (P1)** — alto valor operativo; recomendable tras US-006/007 y en paralelo con US-008.

**Estimación orientativa:** 3–4 días (1 dev full-stack) por API consolidada, timeline UI y ficha cliente.

---

## Metadatos

| Campo | Valor |
|-------|-------|
| **ID** | US-009 |
| **Módulo** | `history` (+ `vehicles`, `clients`) |
| **Estado refinamiento** | Enhanced (local) — pendiente sincronización Jira si aplica |
