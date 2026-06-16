# US-007 — Registro de Diagnósticos y Reparaciones

## [original] Historia de Usuario

**Como** mecánico o administrador,
**quiero** registrar el diagnóstico y el trabajo realizado dentro de una tarea u Orden de Trabajo,
**para** mantener un historial técnico detallado del vehículo consultable en visitas futuras.

## [enhanced] Historia de Usuario

**Como** mecánico o administrador,
**quiero** documentar el diagnóstico, la reparación, los repuestos y las observaciones en cada tarea (y opcionalmente a nivel de visita/OT),
**para** dejar trazabilidad técnica permanente del vehículo consultable en el historial (US-009), sin impedir completar tareas sin rellenar esos campos.

**Alcance MVP:** notas técnicas por tarea + bloque opcional a nivel OT; solo edición mientras la tarea no esté `COMPLETED` y la OT esté `EN_PROCESO`. Fuera de alcance: catálogo de repuestos/inventario (largo plazo), adjuntos/fotos, edición tras completar tarea.

**Dependencia:** US-005, US-006 (tareas y detalle OT). **Habilita:** historial técnico rico en US-009.

---

## [original] Criterios de Aceptación

- [ ] Desde una tarea dentro de la OT, el usuario puede registrar: diagnóstico (problema identificado), reparación o mantenimiento realizado, repuestos utilizados (descripción libre) y observaciones adicionales.
- [ ] Todos los campos de diagnóstico son opcionales; la tarea puede completarse sin llenarlos.
- [ ] La información registrada queda asociada permanentemente al historial del vehículo.
- [ ] Desde el historial del vehículo se puede consultar el diagnóstico y reparación de cada visita anterior.
- [ ] Los campos de diagnóstico son editables mientras la tarea no esté en estado `completada`.

## [enhanced] Criterios de Aceptación

### UI — Notas técnicas en detalle de OT

- [ ] En `/work-orders/[id]`, cada tarea con `status !== COMPLETED` muestra sección expandible **Detalles técnicos**.
- [ ] Campos por tarea (todos opcionales):

| Campo UI | Campo API | Tipo |
|----------|-----------|------|
| Diagnóstico | `diagnosis` | Texto largo |
| Reparación / mantenimiento | `repairPerformed` | Texto largo |
| Repuestos utilizados | `partsUsed` | Texto largo |
| Observaciones | `additionalNotes` | Texto largo |

- [ ] Botón **Guardar notas** por tarea (o autosave con debounce — opcional MVP: guardado explícito).
- [ ] Tarea `COMPLETED`: sección en **solo lectura** (mostrar valores guardados o *"Sin registro"*).
- [ ] Completar tarea (US-006) **no exige** ningún campo técnico.

### Notas a nivel OT (visita)

- [ ] Bloque **Notas generales de la visita** en cabecera de OT (opcional, mismo cuatro campos a nivel `WorkOrder`).
- [ ] Editables solo si OT `EN_PROCESO`.
- [ ] En OT `LISTA_PARA_ENTREGA` / `ENTREGADA`: solo lectura.

### Persistencia e historial

- [ ] Datos ligados a `WorkOrderTask` y `WorkOrder` → vehículo vía `WorkOrder.vehicleId`.
- [ ] `GET /api/vehicles/:id/history` incluye por visita: tareas con campos técnicos + notas generales OT.
- [ ] `GET /api/work-orders/:id` incluye campos técnicos en cada tarea y en cabecera OT.

### Reglas de edición

- [ ] `PATCH` notas de tarea permitido si `task.status` ∈ `{ PENDING, IN_PROGRESS }` y `workOrder.status === EN_PROCESO`.
- [ ] `PATCH` notas OT permitido si `workOrder.status === EN_PROCESO`.
- [ ] Intento de editar tarea completada → `403` con mensaje claro.
- [ ] OT `ENTREGADA` → todo solo lectura.

### Autorización

- [ ] `ADMIN` y `MECHANIC`.

### Casos límite

- [ ] Guardar todos los campos vacíos → `200` (limpia o deja null).
- [ ] Texto muy largo → límite 5000 caracteres por campo en backend.
- [ ] Varias tareas en la misma OT pueden tener notas independientes.

---

## [original] Roles involucrados

- Administrador
- Mecánico

## [enhanced] Roles involucrados

| Rol | Código | Permisos en esta US |
|-----|--------|---------------------|
| Administrador | `ADMIN` | Registrar y consultar notas técnicas |
| Mecánico | `MECHANIC` | Registrar y consultar notas técnicas |

---

## [original] Notas técnicas

- El diagnóstico puede registrarse a nivel de tarea o como campo general de la OT (evaluar según modelo de datos).
- Los repuestos en V1 son texto libre; en versiones futuras podrían vincularse a un catálogo de inventario.

## [enhanced] Especificación técnica

### Decisión de modelo

| Nivel | Almacenamiento MVP | Motivo |
|-------|-------------------|--------|
| **Tarea** | Columnas en `WorkOrderTask` | Alineado al criterio principal; historial por intervención |
| **OT / visita** | Columnas en `WorkOrder` | "Elemento independiente de la OT" del README |

No tabla separada en V1 (evita joins innecesarios). V2 inventario: tabla `Part` + `TaskPartUsage`.

### Extensión Prisma

**`WorkOrderTask`** (añadir):

```prisma
model WorkOrderTask {
  // ... US-005 / US-006
  diagnosis        String?  @db.Text
  repairPerformed  String?  @db.Text
  partsUsed        String?  @db.Text
  additionalNotes  String?  @db.Text
}
```

**`WorkOrder`** (añadir — notas generales de visita):

```prisma
model WorkOrder {
  // ... US-005
  visitDiagnosis       String?  @db.Text
  visitRepairSummary   String?  @db.Text
  visitPartsUsed       String?  @db.Text
  visitAdditionalNotes String?  @db.Text
}
```

### API REST

Módulo `task-notes` o subruta en `work-orders`. Roles: `@Roles('ADMIN', 'MECHANIC')`.

#### `PATCH /api/work-orders/:workOrderId/tasks/:taskId/technical-notes`

Actualiza notas de una tarea.

**Request (todos opcionales):**

```json
{
  "diagnosis": "Desgaste de buje delantero izquierdo",
  "repairPerformed": "Reemplazo de buje y alineación",
  "partsUsed": "Buje MOOG x1, tornillería",
  "additionalNotes": "Recomendar revisión en 5000 km"
}
```

**Response `200`:** tarea con campos técnicos actualizados.

**Errores:** `400` longitud | `401` | `403` tarea completada u OT no editable | `404`

#### `PATCH /api/work-orders/:workOrderId/visit-notes`

Notas generales de la OT.

**Request:**

```json
{
  "visitDiagnosis": "Cliente reporta ruido en badén",
  "visitRepairSummary": null,
  "visitPartsUsed": null,
  "visitAdditionalNotes": "Vehículo entregado con limpieza básica"
}
```

**Response `200`:** fragmento de OT con campos `visit*`.

**Errores:** `403` si OT ≠ `EN_PROCESO`

#### Consulta (sin endpoints nuevos obligatorios)

- `GET /api/work-orders/:id` — incluir `visit*` + `tasks[].diagnosis|...`
- `GET /api/vehicles/:id/history` — ampliar cada `visit`:

```json
{
  "workOrderId": "uuid",
  "checkedInAt": "...",
  "visitNotes": {
    "visitDiagnosis": "...",
    "visitRepairSummary": "..."
  },
  "tasks": [
    {
      "description": "Revisión suspensión",
      "status": "COMPLETED",
      "cost": 85000,
      "diagnosis": "...",
      "repairPerformed": "...",
      "partsUsed": "...",
      "additionalNotes": "..."
    }
  ]
}
```

### Archivos a crear o modificar

**Backend (`apps/api`)**

```
src/modules/work-orders/
├── work-order-technical-notes.controller.ts
├── work-order-technical-notes.service.ts
├── dto/
│   └── update-technical-notes.dto.ts
├── work-order-technical-notes.service.spec.ts
└── vehicles.service.ts              # ampliar history (US-004)

# Alternativa arquitectura readme:
src/modules/task-notes/
├── task-notes.module.ts             # re-export / wrap work-orders service
```

**Frontend (`apps/web`)**

```
src/features/work-orders/
├── components/
│   ├── TaskTechnicalNotesForm.tsx
│   ├── TaskTechnicalNotesReadOnly.tsx
│   └── WorkOrderVisitNotesForm.tsx
├── hooks/
│   ├── useTaskTechnicalNotes.ts
│   └── useVisitNotes.ts
└── services/
    └── workOrdersApi.ts           # patchTechnicalNotes, patchVisitNotes

src/features/vehicles/
└── components/VehicleVisitHistory.tsx   # mostrar notas en historial
```

### Flujo de implementación (orden sugerido)

1. Migración: columnas en `WorkOrderTask` y `WorkOrder`.
2. Tests: edit OK en PENDING; edit forbidden en COMPLETED; visit notes forbidden en LISTA_PARA_ENTREGA.
3. Servicio + endpoints PATCH.
4. Ampliar serializers de `GET work-orders/:id` y `GET vehicles/:id/history`.
5. UI formularios en detalle OT + solo lectura en tareas completadas.
6. UI historial vehículo con detalle técnico expandible.
7. Verificar completar tarea sin notas (US-006) sigue funcionando.

### Tests requeridos

| Capa | Escenarios mínimos |
|------|-------------------|
| **Unit** | update task notes; reject when COMPLETED; update visit notes; reject visit notes when not EN_PROCESO; empty body clears nulls |
| **Integration** | PATCH task 200; PATCH task 403 completed; history includes technical fields |
| **E2E (opcional)** | Registrar diagnóstico → completar tarea → ver en historial vehículo solo lectura |

Cobertura objetivo servicio de notas técnicas: ≥ 85 % (prioridad media).

### Requisitos no funcionales

| Área | Requisito |
|------|-----------|
| **Integridad** | Notas persistidas con la tarea/OT; visibles tras `ENTREGADA` |
| **UX** | Textareas con contador de caracteres; labels en español |
| **V2** | Catálogo de repuestos — no alterar columnas; añadir relación N:M después |
| **Rendimiento** | PATCH < 300 ms; historial no degradar query (eager load tasks) |

### Definition of Done

- [ ] Migración aplicada.
- [ ] Edición de notas por tarea en OT `EN_PROCESO` y tarea no completada.
- [ ] Notas generales de visita editables en OT `EN_PROCESO`.
- [ ] Solo lectura cuando corresponde.
- [ ] Historial de vehículo muestra datos técnicos por visita.
- [ ] Completar tarea sin notas técnicas sigue válido.
- [ ] Tests unitarios e integración en verde.

### Dependencias

| Relación | Detalle |
|----------|---------|
| **Depende de** | US-005, US-006 |
| **Alimenta** | US-009 (consulta historial con detalle técnico) |
| **No bloquea** | US-008 (panel entrega) |

---

## [original] Prioridad

Media — complementa el flujo principal pero no lo bloquea.

## [enhanced] Prioridad

**Media (P1)** — puede desarrollarse en paralelo tras US-006; recomendable antes de US-009 para historial completo.

**Estimación orientativa:** 2–3 días (1 dev full-stack).

---

## Metadatos

| Campo | Valor |
|-------|-------|
| **ID** | US-007 |
| **Módulo** | `task-notes` (implementación en `work-orders` + `vehicles` history) |
| **Estado refinamiento** | Enhanced (local) — pendiente sincronización Jira si aplica |
