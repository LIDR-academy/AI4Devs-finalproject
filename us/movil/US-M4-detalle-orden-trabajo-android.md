# US-M4 — Detalle de orden de trabajo en Android

**Fuente:** conversación de producto (ver OT creadas en el teléfono)  
**Prioridad:** V2 / cliente nativo  
**Rama de implementación:** `finalproject-RFM` (salvo petición explícita)  
**Estado refinamiento:** Enhanced (local) — `/enrich-us` 2026-08-14; sin Jira MCP  
**Refinado:** 2026-08-14

> Implementar **solo** cuando US-M2/US-M3 estén en DoD. **Sin endpoint nuevo:** `GET /api/work-orders/:id`.

---

## [original] Historia de Usuario

**Como** administrador o mecánico en la app Android,
**quiero** abrir una orden de trabajo desde la lista de órdenes en curso y ver su detalle,
**para** revisar vehículo, motivo, estado y tareas sin ir a la web.

## [original] Criterios de Aceptación

- [ ] Desde el home, al tocar una fila se abre el detalle de esa OT.
- [ ] El detalle muestra placa, vehículo, estado, motivo y lista de tareas.
- [ ] Si la carga falla, se muestra error con opción de reintentar.
- [ ] Usa la API existente de detalle de OT.

---

## [enhanced] Historia de Usuario

**Como** `ADMIN` o `MECHANIC` autenticado en Android,
**quiero** que el tap de una fila del home (US-M2) navegue a una pantalla de detalle alimentada por **`GET /api/work-orders/:id`**,
**para** ver la misma información operativa que en la web y habilitar gestión de tareas (US-M5 / US-M6).

**Gap actual:** el home muestra snack *Disponible en la web*; `MecaTrackApi` no expone `GET work-orders/:id` completo con tareas.

**Alcance cerrado**

| Incluye | No incluye |
|---------|------------|
| Navegación home → detalle | Agregar / completar tareas (M5 / M6) |
| Header OT + lista de tareas (solo lectura) | Notas técnicas (US-007) |
| Loading / error / reintentar / Atrás | Panel de entrega, marcar `ENTREGADA` |
| Labels ES de estado OT y tarea | Editar kilometraje, reasignar mecánico |
| Refresh al volver a la pantalla | iOS |

**Dependencia:** US-M2 (home), US-005/US-006 (`GET :id`). **Habilita:** US-M5, US-M6.

---

## [enhanced] Criterios de Aceptación

### 1. API (existente — no modificar)

| Aspecto | Contrato |
|---------|----------|
| Método / ruta | `GET /api/work-orders/:id` |
| Auth | Bearer + `ADMIN`, `MECHANIC` |
| Path | UUID de la OT |

**Response `200` (campos mínimos para UI):**

| Campo | Uso UI |
|-------|--------|
| `id`, `status`, `entryReason` | Identidad / estado / motivo |
| `mileage` | Kilometraje o *—* |
| `checkedInAt`, `updatedAt` | Fechas |
| `vehicle.{licensePlate, brand, model}` | Vehículo |
| `owner.{fullName, nationalId} \| null` | Propietario |
| `broughtByName`, `intakeMode` | Parte interesada (mismo criterio M2) |
| `assignedMechanic.{fullName} \| null` | Mecánico o *Sin asignar* |
| `totalAmount` | Total (solo informativo en M4) |
| `tasks[]` | `id`, `description`, `status`, `cost`, `sortOrder`, `completedAt` |

**Errores:** `401` (refresh M1), `403`, `404` *Orden no encontrada.*, `400` UUID inválido.

### 2. Labels UI (ES)

**Estado OT** (igual M2/web):

| `status` | Texto |
|----------|--------|
| `EN_PROCESO` | En proceso |
| `LISTA_PARA_ENTREGA` | Lista para entrega |
| `OWNER_CONTACTED` | Propietario contactado |
| `ENTREGADA` | Entregada (si llegara a verse; no es el foco) |

**Estado tarea:**

| `status` | Texto |
|----------|--------|
| `PENDING` | Pendiente |
| `IN_PROGRESS` | En progreso |
| `COMPLETED` | Completada |

**Parte interesada:** misma regla que US-M2 (`owner` → `Traído por…` → `Sin propietario`).

### 3. Android — detalle

| Elemento | Comportamiento |
|----------|----------------|
| Entrada | Tap fila home → `WorkOrderDetail/{id}` |
| App bar | **Detalle de orden** + Atrás → home |
| Header | Placa; `{brand} {model}`; estado ES; motivo; parte interesada; mecánico; km; fechas |
| Tareas | Lista ordenada por `sortOrder`; descripción + estado ES; si `COMPLETED` y `cost != null` mostrar costo |
| Vacío tareas | *No hay tareas en esta orden.* |
| Loading | *Cargando orden…* |
| Error | Mensaje mapeado + **Reintentar** |
| Acciones M5/M6 | Pueden existir como placeholders deshabilitados o no mostrarse hasta esas US |

- [ ] Sustituir el snack *Disponible en la web* del home.
- [ ] Al volver del detalle al home, el listado puede refrescarse (recomendado).
- [ ] Sin sesión → login (M1).

### 4. Archivos a crear / modificar

```
apps/android/.../data/api/     # MOD: getById + WorkOrderDetailDto completo (tasks)
apps/android/.../data/repository/
apps/android/.../ui/detail/    # NEW: DetailScreen + ViewModel
apps/android/.../ui/nav/       # MOD: route detail
apps/android/.../ui/home/      # MOD: navigate on row tap
apps/android/README.md
```

**No** cambiar `apps/api` ni `apps/web` en esta US.

### 5. Pruebas

| Capa | Casos |
|------|--------|
| Unit | Status labels tarea/OT; party label |
| Manual | Tap fila → detalle con tareas |
| Manual | OT inexistente / 404 |
| Manual | Atrás vuelve al home |
| Regresión | Home M2 y wizard M3 intactos |

### 6. NFR

- [ ] Autorización en servidor.
- [ ] Código/docs inglés; copy ES.
- [ ] No loguear `nationalId` en logs de error.
- [ ] Reutilizar HTTP/sesión M1.

### 7. Definition of Done

- [ ] AC §1–3
- [ ] Tests §5
- [ ] README Android actualizado
- [ ] Rama `finalproject-RFM`
- [ ] **No** mutaciones de tareas (M5/M6)

---

## Roles involucrados

| Role | Responsibility |
|------|----------------|
| Android | Pantalla detalle + navegación |
| QA / PO | Comparar campos con detalle web |

## Notas de producto

- M4 es solo lectura; la edición de tareas empieza en M5.
- Si el mecánico no debería ver una OT, el servidor ya filtró el home; un `GET :id` de otra OT puede devolver 200 hoy — fuera de alcance endurecer eso salvo producto lo pida.
