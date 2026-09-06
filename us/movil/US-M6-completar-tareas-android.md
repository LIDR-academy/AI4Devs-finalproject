# US-M6 — Completar tareas (orden lista para entrega) en Android

**Fuente:** conversación de producto (cerrar tareas / completar OT en el teléfono)  
**Prioridad:** V2 / cliente nativo  
**Rama de implementación:** `finalproject-RFM` (salvo petición explícita)  
**Estado refinamiento:** Enhanced (local) — 2026-08-14; sin Jira MCP  
**Refinado:** 2026-08-14

> Implementar **solo** cuando US-M5 esté en DoD (o M4 + tareas ya existentes). **Sin endpoint nuevo de “cerrar OT”.** Completar la **última** tarea hace que el servidor pase la OT a **`LISTA_PARA_ENTREGA`** (US-006). Contacto / entrega física (`OWNER_CONTACTED` / `ENTREGADA`) **fuera de alcance**.

---

## [original] Historia de Usuario

**Como** administrador o mecánico en la app Android,
**quiero** cerrar las tareas de una orden y dejar la orden lista para entrega,
**para** terminar el trabajo de taller desde el teléfono.

## [original] Criterios de Aceptación

- [ ] Se puede marcar una tarea como completada.
- [ ] Al completar se solicita el costo si la API lo exige.
- [ ] Cuando todas las tareas están completadas, la orden queda en estado lista para entrega.
- [ ] No se puede reabrir una tarea ya completada.

---

## [enhanced] Historia de Usuario

**Como** `ADMIN` o `MECHANIC` en el detalle de una OT,
**quiero** avanzar el estado de las tareas con **`PATCH /api/work-orders/:workOrderId/tasks/:taskId`** (incluye atajo a `COMPLETED` con **costo ≥ 0**),
**para** que, al completar la última tarea, la OT quede automáticamente en **`LISTA_PARA_ENTREGA`** sin un botón aparte de “cerrar orden”.

**Decisión de producto (2026-08-14):** “Completar la orden” en móvil = taller listo (`LISTA_PARA_ENTREGA`). **No** marcar `ENTREGADA` desde Android.

**Alcance cerrado**

| Incluye | No incluye |
|---------|------------|
| `PENDING` → `IN_PROGRESS` y/o `COMPLETED` | Reabrir tarea `COMPLETED` (API no lo permite) |
| Modal costo (+ `costNotes` opcional) al completar | Notas técnicas US-007 |
| Banner / copy cuando OT pasa a *Lista para entrega* | `mark-contacted` / `deliver` (US-008) |
| Deshabilitar mutaciones si OT ≠ `EN_PROCESO` | Botón inventado “Completar orden” que llame un endpoint inexistente |

**Dependencia:** US-M4, US-M5 (o tareas ya creadas), US-006 PATCH.

---

## [enhanced] Criterios de Aceptación

### 1. API (existente — no modificar)

| Aspecto | Contrato |
|---------|----------|
| Método / ruta | `PATCH /api/work-orders/:workOrderId/tasks/:taskId` |
| Body | `{ status, cost?, costNotes? }` |
| `COMPLETED` | **`cost` obligatorio**, number ≥ 0, máx. 2 decimales; `costNotes` opcional ≤ 500 |
| Transiciones | `PENDING` → `IN_PROGRESS` \| `COMPLETED`; `IN_PROGRESS` → `COMPLETED`; `COMPLETED` → ∅ |
| Respuesta | `{ task, workOrder: { id, status, totalAmount, updatedAt } }` |

**Efecto OT:** si tras el PATCH todas las tareas están `COMPLETED`, `workOrder.status` = `LISTA_PARA_ENTREGA`.

**Errores UI:**

| Caso | Copy ES orientativo |
|------|---------------------|
| Costo faltante / inválido | *Indica un costo válido (0 o mayor).* |
| Transición ilegal / tarea completada | *No se puede cambiar el estado de esta tarea.* |
| OT no en proceso | *Esta orden ya no admite cambios en tareas.* |
| Red / 5xx | *No se pudo actualizar la tarea.* |

### 2. Android — UI

| Elemento | Comportamiento |
|----------|----------------|
| Acciones por tarea | Según estado: **Iniciar** (`IN_PROGRESS`), **Completar** (`COMPLETED`) |
| Completar | Diálogo: costo (requerido), nota de costo (opcional) → confirmar |
| Éxito | Actualizar fila; si `workOrder.status == LISTA_PARA_ENTREGA`, banner *Orden lista para entrega.* y deshabilitar altas/cambios de tareas |
| Tarea completada | Solo lectura (sin reabrir) |
| Home | Al volver, la OT puede mostrar estado *Lista para entrega* |

- [ ] No hay botón global “Completar orden”; el cierre de taller es **efecto del servidor**.
- [ ] No llamar endpoints de delivery.

### 3. Archivos

```
apps/android/.../data/api/     # MOD: updateTask + DTOs
apps/android/.../ui/detail/    # MOD: acciones tarea + CompleteTaskDialog
apps/android/.../domain/       # labels / mappers error
apps/android/README.md
```

**No** cambiar backend salvo bug descubierto (fuera de esta US).

### 4. Pruebas

| Capa | Casos |
|------|--------|
| Unit | Transiciones permitidas en UI; costo requerido al completar |
| Manual | Completar última tarea → OT *Lista para entrega* |
| Manual | Completar sin costo → error |
| Manual | Intentar editar tarea completada → no disponible |
| Manual | Tras lista para entrega, no agregar tareas (M5) |
| Regresión | M4 detalle + M5 alta |

### 5. Definition of Done

- [ ] AC §1–2
- [ ] Tests §4
- [ ] README
- [ ] Rama `finalproject-RFM`
- [ ] **No** flujo de entrega al cliente (`ENTREGADA`)

---

## Roles involucrados

| Role | Responsibility |
|------|----------------|
| Android | Acciones de tarea + costo + banner |
| QA | Verificar transición automática a lista para entrega vs web |

## Notas de producto

- “Completar la OT” en lenguaje de taller = tareas hechas → lista para entrega.
- Entregar el vehículo al dueño sigue siendo panel web / US-008 (ADMIN).
