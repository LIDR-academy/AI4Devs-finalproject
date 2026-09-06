# US-M5 — Agregar tareas a la orden en Android

**Fuente:** conversación de producto (más tareas desde el teléfono)  
**Prioridad:** V2 / cliente nativo  
**Rama de implementación:** `finalproject-RFM` (salvo petición explícita)  
**Estado refinamiento:** Enhanced (local) — 2026-08-14; sin Jira MCP  
**Refinado:** 2026-08-14

> Implementar **solo** cuando US-M4 esté en DoD. **Sin endpoint nuevo:** `POST /api/work-orders/:workOrderId/tasks`.

---

## [original] Historia de Usuario

**Como** administrador o mecánico en la app Android,
**quiero** agregar más tareas a una orden ya creada,
**para** registrar trabajo adicional sin usar la web.

## [original] Criterios de Aceptación

- [ ] Desde el detalle de la OT se puede agregar una tarea con descripción.
- [ ] La nueva tarea aparece en la lista en estado pendiente.
- [ ] Si la orden ya no admite tareas, la acción no está disponible o muestra error claro.
- [ ] Usa la API existente de tareas.

---

## [enhanced] Historia de Usuario

**Como** `ADMIN` o `MECHANIC` en el detalle de una OT (US-M4),
**quiero** agregar tareas con descripción vía **`POST /api/work-orders/:workOrderId/tasks`** mientras la OT esté **`EN_PROCESO`**,
**para** ampliar el alcance del trabajo en patio.

**Alcance cerrado**

| Incluye | No incluye |
|---------|------------|
| Formulario / diálogo agregar tarea | Completar / avanzar estado de tarea (M6) |
| Validación UI descripción 3–300 | Notas técnicas por tarea |
| Refresco del detalle tras éxito | Reordenar tareas, editar descripción |
| Deshabilitar si `status ≠ EN_PROCESO` | Crear OT (M3) |

**Dependencia:** US-M4, US-006 (`POST tasks`). **Habilita:** US-M6.

---

## [enhanced] Criterios de Aceptación

### 1. API (existente — no modificar)

| Aspecto | Contrato |
|---------|----------|
| Método / ruta | `POST /api/work-orders/:workOrderId/tasks` |
| Auth | Bearer + `ADMIN`, `MECHANIC` |
| Body | `{ "description": string }` length **3–300** |
| Éxito | `201` + tarea (`id`, `description`, `status=PENDING`, …) |

**Reglas servidor (no reimplementar en app):**

- Solo si la OT está en `EN_PROCESO`.
- Si OT es `LISTA_PARA_ENTREGA` / otra no editable → error (p. ej. `403`/`409` según API actual).

**Errores UI:**

| Caso | Copy ES orientativo |
|------|---------------------|
| Validación 400 | *La descripción debe tener entre 3 y 300 caracteres.* |
| OT no editable | *No se pueden agregar tareas a esta orden.* |
| 404 | *Orden no encontrada.* |
| Red / 5xx | *No se pudo agregar la tarea. Intenta de nuevo.* |

### 2. Android — UI

| Elemento | Comportamiento |
|----------|----------------|
| CTA | **Agregar tarea** visible solo si `status == EN_PROCESO` |
| Form | Campo descripción; **Guardar** / **Cancelar** |
| Éxito | Cerrar form; refrescar detalle; nueva tarea en lista como *Pendiente* |
| Loading | Botón disabled / *Guardando…* |
| Si OT lista para entrega | CTA oculto o disabled; sin crash |

- [ ] No inventar `taskId` local: usar respuesta del servidor.
- [ ] Tras éxito, el home (al volver) debe poder mostrar la OT actualizada (`updatedAt`).

### 3. Archivos

```
apps/android/.../data/api/        # MOD: addTask
apps/android/.../ui/detail/       # MOD: AddTaskDialog / bottom sheet + ViewModel
apps/android/README.md
```

**No** cambiar backend.

### 4. Pruebas

| Capa | Casos |
|------|--------|
| Unit | Validación longitud descripción |
| Manual | Agregar tarea en OT `EN_PROCESO` |
| Manual | CTA ausente/disabled en `LISTA_PARA_ENTREGA` |
| Manual | Descripción corta → error |
| Regresión | Detalle M4 lectura intacta |

### 5. Definition of Done

- [ ] AC §1–2
- [ ] Tests §4
- [ ] Docs README
- [ ] Rama `finalproject-RFM`
- [ ] **No** completar tareas (M6)

---

## Roles involucrados

| Role | Responsibility |
|------|----------------|
| Android | Form + llamada API + refresh |
| QA | Verificar lista tras alta |

## Notas de producto

- Una sola tarea inicial ya existe vía M3; M5 cubre tareas adicionales.
- No se puede “reabrir” una OT lista para entrega desde el móvil en esta US.
