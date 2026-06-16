# US-006 — Gestión de Tareas en la Orden de Trabajo

## [original] Historia de Usuario

**Como** mecánico o administrador,
**quiero** agregar, actualizar y completar tareas dentro de una Orden de Trabajo,
**para** reflejar el avance real del trabajo mecánico y registrar los costos de cada intervención.

## [enhanced] Historia de Usuario

**Como** mecánico o administrador,
**quiero** gestionar la lista dinámica de tareas de una OT en curso (agregar, cambiar estado y registrar costo al completar),
**para** reflejar el trabajo real del taller y que el sistema pase automáticamente la OT a **Lista para entrega** cuando todo esté terminado (habilitando US-008).

**Alcance MVP:** CRUD de tareas limitado a create + update status/costo en OT `EN_PROCESO`; transición automática de OT; total calculado. Fuera de alcance: eliminar tareas, revertir estado `COMPLETED`, editar costo tras completar (solo admin override V2).

**Dependencia:** US-005 (OT y tareas iniciales). **Habilita:** US-008 (panel con monto total), US-007 (diagnósticos por tarea).

---

## [original] Criterios de Aceptación

- [ ] Desde una OT activa, cualquier mecánico puede agregar nuevas tareas en cualquier momento.
- [ ] Cada tarea incluye: descripción y estado inicial **"pendiente"**.
- [ ] El usuario puede cambiar el estado de una tarea: `pendiente` → `en progreso` → `completada`.
- [ ] Al marcar una tarea como **completada**, el sistema solicita obligatoriamente el costo asociado (número mayor o igual a cero).
- [ ] El costo de una tarea completada puede incluir descripción libre de los conceptos cobrados (mano de obra, repuestos, etc.).
- [ ] El listado de tareas de la OT muestra: descripción, estado y costo (si ya fue completada).
- [ ] Cuando **todas** las tareas de una OT están en estado `completada`, el sistema cambia automáticamente el estado de la OT a **"Lista para entrega"**.
- [ ] No se pueden agregar tareas a una OT que ya esté en estado `lista_para_entrega` o `entregada`.

## [enhanced] Criterios de Aceptación

### UI — Detalle de OT (`/work-orders/[id]`)

- [ ] Cabecera de OT: placa, vehículo, propietario, motivo ingreso, kilometraje, mecánico asignado, estado OT, **monto total** (suma de tareas completadas).
- [ ] Listado de tareas ordenado por `sortOrder`, luego `createdAt`.
- [ ] Columnas/filas: descripción, estado (badge), costo (si `COMPLETED`), notas de costo (si existen).

### Agregar tarea

- [ ] Solo visible si OT está en `EN_PROCESO`.
- [ ] Formulario inline o modal: descripción (obligatoria).
- [ ] Nueva tarea se crea con estado `PENDING`.
- [ ] OT en `LISTA_PARA_ENTREGA` o `ENTREGADA` → sin botón agregar; API `403`/`409` si se intenta.

### Cambio de estado

Transiciones permitidas (no retroceder desde `COMPLETED`):

| Desde | Hacia | Requisitos |
|-------|-------|------------|
| `PENDING` | `IN_PROGRESS` | — |
| `IN_PROGRESS` | `COMPLETED` | `cost` obligatorio (≥ 0) |
| `PENDING` | `COMPLETED` | Permitido en MVP con `cost` obligatorio (atajo) |

- [ ] UI: selector o botones de acción según estado actual.
- [ ] Al pasar a `COMPLETED`, modal con:
  - **Costo** (número, ≥ 0, 2 decimales)
  - **Detalle del cobro** (`costNotes`, texto libre opcional)
- [ ] Tras completar última tarea pendiente/en progreso, OT pasa a `LISTA_PARA_ENTREGA` y UI muestra banner *"Lista para entrega"* (solo lectura de tareas).

### Monto total

- [ ] `totalAmount = SUM(task.cost)` donde `status = COMPLETED`.
- [ ] Mostrado en cabecera de OT y en respuesta API.
- [ ] Tareas no completadas no suman al total.

### Transición automática de OT

- [ ] Tras cada `PATCH` que deje **todas** las tareas en `COMPLETED`:
  - `WorkOrder.status` → `LISTA_PARA_ENTREGA` en la misma transacción.
- [ ] Si OT ya estaba en `LISTA_PARA_ENTREGA` y se añade tarea nueva (no permitido en MVP) — N/A porque no se pueden agregar tareas fuera de `EN_PROCESO`.
- [ ] Regla: debe existir ≥ 1 tarea en la OT para transicionar (siempre true tras US-005).

### Restricciones

- [ ] No editar descripción de tarea `COMPLETED` en MVP.
- [ ] No cambiar estado de tarea si OT es `ENTREGADA`.
- [ ] En OT `LISTA_PARA_ENTREGA`: tareas en solo lectura; no agregar ni cambiar estados.

### Autorización

- [ ] `ADMIN` y `MECHANIC` en todos los endpoints de tareas.
- [ ] Cualquier mecánico autenticado puede operar sobre OT de otro mecánico asignado (taller compartido).

### Concurrencia (nota técnica original)

- [ ] Usar `updatedAt` de OT en respuesta; frontend puede refrescar tras cada mutación.
- [ ] Servicio revalida estado OT dentro de transacción al completar tarea (evitar doble transición).

---

## [original] Roles involucrados

- Administrador
- Mecánico

## [enhanced] Roles involucrados

| Rol | Código | Permisos en esta US |
|-----|--------|---------------------|
| Administrador | `ADMIN` | Gestionar tareas en OT `EN_PROCESO` |
| Mecánico | `MECHANIC` | Gestionar tareas en OT `EN_PROCESO` |

---

## [original] Notas técnicas

- El cálculo del monto total de la OT es la suma de los costos de todas sus tareas completadas.
- El cambio automático de estado de la OT debe ejecutarse cada vez que una tarea se marca como completada.
- Considerar lock optimista si múltiples mecánicos pueden editar la misma OT simultáneamente.

## [enhanced] Especificación técnica

### Extensión del modelo (Prisma)

Añadir a `WorkOrderTask` (definido en US-005):

| Campo | Tipo | Notas |
|-------|------|-------|
| `costNotes` | `String?` | Conceptos cobrados (mano de obra, repuestos); opcional |
| `completedAt` | `DateTime?` | Set al pasar a `COMPLETED` |

```prisma
model WorkOrderTask {
  // ... campos US-005
  costNotes   String?
  completedAt DateTime?
}
```

**Campo calculado (no persistido):** `totalAmount` en respuestas de OT.

### Máquina de estados

**Tarea (`WorkOrderTaskStatus`):**

```
PENDING ──► IN_PROGRESS ──► COMPLETED
   └────────────────────────► COMPLETED (atajo MVP, requiere cost)
```

**OT (`WorkOrderStatus`) — fragmento US-006:**

```
EN_PROCESO ──(todas las tareas COMPLETED)──► LISTA_PARA_ENTREGA
```

Implementar en `WorkOrderTasksService.completeTask()` + `maybeTransitionWorkOrder()`.

### API REST

Prefijo `/api/work-orders/:workOrderId/tasks`. Roles: `@Roles('ADMIN', 'MECHANIC')`.

#### `GET /api/work-orders/:id` (ampliar US-005)

Incluir `tasks[]`, `totalAmount`, `status`.

**Fragmento response:**

```json
{
  "id": "uuid",
  "status": "EN_PROCESO",
  "totalAmount": 45000,
  "tasks": [
    {
      "id": "task-uuid",
      "description": "Revisión de suspensión",
      "status": "IN_PROGRESS",
      "cost": null,
      "costNotes": null,
      "sortOrder": 0
    }
  ]
}
```

#### `POST /api/work-orders/:workOrderId/tasks`

Agrega tarea. Solo si OT `EN_PROCESO`.

**Request:**

```json
{
  "description": "Cambio de amortiguador delantero izquierdo"
}
```

**Response `201`:** tarea con `status: PENDING`.

**Errores:** `400` | `401` | `403` OT no editable | `404`

#### `PATCH /api/work-orders/:workOrderId/tasks/:taskId`

Actualiza estado y, si aplica, costo.

**Request (completar):**

```json
{
  "status": "COMPLETED",
  "cost": 85000,
  "costNotes": "Repuesto amortiguador + mano de obra"
}
```

**Request (en progreso):**

```json
{
  "status": "IN_PROGRESS"
}
```

**Response `200`:** tarea actualizada + objeto `workOrder` con `status` y `totalAmount` actualizados.

```json
{
  "task": { "id": "...", "status": "COMPLETED", "cost": 85000, "costNotes": "..." },
  "workOrder": {
    "id": "uuid",
    "status": "LISTA_PARA_ENTREGA",
    "totalAmount": 85000
  }
}
```

**Errores:**

| Código | Condición |
|--------|-----------|
| `400` | Transición inválida; `COMPLETED` sin `cost`; `cost` < 0 |
| `403` | OT `LISTA_PARA_ENTREGA` o `ENTREGADA` |
| `404` | OT o tarea no existe |
| `409` | Tarea ya `COMPLETED` y se intenta cambiar estado |

#### `GET /api/work-orders/:workOrderId/tasks` (opcional)

Listado de tareas si se prefiere endpoint dedicado; en MVP puede bastar `GET /work-orders/:id`.

### Lógica de servicio (pseudocódigo)

```typescript
async function updateTask(workOrderId, taskId, dto) {
  return prisma.$transaction(async (tx) => {
    const wo = await tx.workOrder.findUniqueOrThrow({ include: { tasks: true } });
    assert(wo.status === 'EN_PROCESO', 'Work order is not editable');

    const task = wo.tasks.find(t => t.id === taskId);
    validateTransition(task.status, dto.status);

    if (dto.status === 'COMPLETED') {
      assert(dto.cost != null && dto.cost >= 0);
      // update task: cost, costNotes, completedAt
    }

    await tx.workOrderTask.update({ ... });

    const allCompleted = await allTasksCompleted(tx, workOrderId);
    if (allCompleted) {
      await tx.workOrder.update({
        where: { id: workOrderId },
        data: { status: 'LISTA_PARA_ENTREGA' },
      });
    }

    return buildResponse(workOrderId);
  });
}
```

### Archivos a crear o modificar

**Backend (`apps/api`)**

```
src/modules/work-orders/
├── work-order-tasks.controller.ts   # POST, PATCH tasks
├── work-order-tasks.service.ts
├── dto/
│   ├── create-task.dto.ts
│   └── update-task.dto.ts
├── work-order-tasks.service.spec.ts
└── work-orders.service.ts           # totalAmount, maybeTransition

src/app/work-orders/[id]             # frontend
```

**Frontend (`apps/web`)**

```
src/features/work-orders/
├── components/
│   ├── WorkOrderDetailHeader.tsx    # totalAmount, status badge
│   ├── TaskList.tsx
│   ├── TaskRow.tsx                  # status actions
│   ├── AddTaskForm.tsx
│   └── CompleteTaskModal.tsx        # cost + costNotes
├── hooks/
│   ├── useWorkOrder.ts
│   ├── useAddTask.ts
│   └── useUpdateTask.ts
└── services/
    └── workOrdersApi.ts             # addTask, updateTask
```

### Flujo de implementación (orden sugerido)

1. Migración: `costNotes`, `completedAt` en `WorkOrderTask`.
2. Tests unitarios: transiciones válidas/inválidas; complete sin cost → error; all completed → OT `LISTA_PARA_ENTREGA`.
3. `WorkOrderTasksService` + endpoints.
4. Ampliar `GET /work-orders/:id` con `totalAmount`.
5. UI detalle OT: listado, agregar, modal completar.
6. Banner y modo solo lectura cuando OT `LISTA_PARA_ENTREGA`.
7. Prueba manual: 2 tareas → completar una → OT sigue `EN_PROCESO` → completar segunda → `LISTA_PARA_ENTREGA`.

### Tests requeridos

| Capa | Escenarios mínimos |
|------|-------------------|
| **Unit** | add task on EN_PROCESO; reject add on LISTA_PARA_ENTREGA; PENDING→IN_PROGRESS; IN_PROGRESS→COMPLETED with cost; auto transition when all completed; totalAmount sum; reject COMPLETED without cost |
| **Integration** | POST task 201; PATCH complete 200 + workOrder.status; PATCH on closed OT 403; concurrent complete last two tasks → single LISTA_PARA_ENTREGA |
| **E2E (opcional)** | Crear OT → agregar tarea → completar todas → ver banner lista para entrega |

Cobertura objetivo `work-order-tasks.service`: ≥ 90 %.

### Requisitos no funcionales

| Área | Requisito |
|------|-----------|
| **Transaccionalidad** | Update tarea + transición OT atómicas |
| **Precisión monetaria** | `Decimal(12,2)`; mostrar en UI con formato local (CRC sin decimales opcional) |
| **Concurrencia** | Re-leer tareas dentro de transacción antes de transicionar OT |
| **UX** | Confirmación al completar con costo; estados traducidos (Pendiente / En progreso / Completada) |
| **Rendimiento** | PATCH p95 < 400 ms |

### Definition of Done

- [ ] Agregar tareas en OT `EN_PROCESO` funcional.
- [ ] Flujo de estados y costo obligatorio al completar verificado en tests.
- [ ] OT pasa a `LISTA_PARA_ENTREGA` automáticamente cuando corresponde.
- [ ] `totalAmount` correcto en API y UI.
- [ ] OT cerrada/lista no permite mutaciones de tareas.
- [ ] Pantalla `/work-orders/[id]` operativa para mecánico y admin.

### Dependencias

| Relación | Detalle |
|----------|---------|
| **Depende de** | US-005 |
| **Habilita** | US-008 (panel filtra `LISTA_PARA_ENTREGA` + total) |
| **Relacionado** | US-007 edita diagnósticos en tarea no `COMPLETED` |

---

## [original] Prioridad

Alta.

## [enhanced] Prioridad

**Alta (P0)** — núcleo operativo diario del mecánico junto con US-005.

**Estimación orientativa:** 3–4 días (1 dev full-stack) por estados, transición OT y UI de detalle.

---

## Metadatos

| Campo | Valor |
|-------|-------|
| **ID** | US-006 |
| **Módulo** | `work-orders` (subdominio tasks) |
| **Estado refinamiento** | Enhanced (local) — pendiente sincronización Jira si aplica |
