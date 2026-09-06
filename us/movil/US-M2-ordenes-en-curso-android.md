# US-M2 — Órdenes en curso en el teléfono

**Fuente:** conversación de producto (app Android sobre la API existente)  
**Prioridad:** V2 / cliente nativo  
**Rama de implementación:** `finalproject-RFM` (salvo petición explícita de otra rama)  
**Estado refinamiento:** Enhanced (local) — `/enrich-us` 2026-08-14; sin Jira MCP; listo para plan Android **después de US-M1**  
**Refinado:** `/enrich-us` 2026-08-14

> Implementar **solo** cuando US-M1 esté en DoD. Sin endpoint nuevo.

---

## [original] Historia de Usuario

**Como** administrador o mecánico autenticado en la app Android,
**quiero** ver las órdenes de trabajo que están en curso,
**para** saber qué hay en el taller sin abrir la web.

## [original] Criterios de Aceptación

- [ ] Tras el login, la app muestra un listado de OT en curso.
- [ ] Cada ítem muestra al menos placa y motivo de ingreso.
- [ ] Si no hay OT en curso, se muestra un estado vacío claro.
- [ ] El listado usa la misma API que el dashboard web.

---

## [enhanced] Historia de Usuario

**Como** `ADMIN` o `MECHANIC` autenticado en Android (US-M1),
**quiero** que la pantalla principal liste las OT activas de **`GET /api/work-orders/in-progress`** con las **mismas reglas de visibilidad** que US-D10,
**para** retomar el trabajo del taller en el teléfono.

**Gap:** US-D10 cubre widget (máx. 5) + página web `/work-orders/in-progress`. Esta US es el **home móvil** = lista operativa, no el widget de 5.

**Alcance cerrado**

| Incluye | No incluye |
|---------|------------|
| Home = lista in-progress | Detalle OT, tareas (US-006), notas (US-007) |
| Estados vacío / loading / error + reintentar | Panel entrega, historial, filtros placa/mecánico |
| Logout (ya US-M1) | Paginación infinita (un `limit` fijo basta) |
| CTA **Nueva orden** (navega en US-M3; aquí puede ser visible) | KPIs, pull-to-refresh obligatorio (sí recomendado) |
| Labels ES de estado y parte interesada | Cambiar el API D10 |

**Dependencia:** US-M1 DoD, US-D10 API (`GET /in-progress`). Compatible US-D9 (`owner` null). **Habilita:** US-M3 (entrada al wizard).

---

## [enhanced] Criterios de Aceptación

### 1. API (existente — no modificar)

| Aspecto | Contrato (US-D10) |
|---------|-------------------|
| Método / ruta | `GET /api/work-orders/in-progress` |
| Auth | Bearer + roles `ADMIN`, `MECHANIC` |
| Query | `limit` 1–50 default 20; `offset` ≥ 0 default 0 |

**App usa:** `limit=50`, `offset=0` (un page; si `total > 50` mostrar las 50 + texto “Hay más en la web” — no paginar en MVP).

**Visibilidad**

| Rol | Filtro servidor |
|-----|-----------------|
| `ADMIN` | Todas con `status ∈ { EN_PROCESO, LISTA_PARA_ENTREGA, OWNER_CONTACTED }` |
| `MECHANIC` | Activas **y** `assignedMechanicId === currentUser.userId` |

Orden: `updatedAt DESC`, `id DESC`. No incluir `ENTREGADA`.

**Response `200` (shape D10):** `items[]` con `id`, `status`, `entryReason`, `checkedInAt`, `updatedAt`, `vehicle { id, licensePlate, brand, model }`, `owner { fullName, nationalId } \| null`, `broughtByName`, `intakeMode`, `assignedMechanic { id, fullName, role } \| null`, más `total`, `limit`, `offset`.

**Errores:** `401` (M1 refresh), `403` rol, `400` query. Vacío = `200` + `items: []`, `total: 0`.

### 2. Labels UI (ES)

**Estado** (igual web):

| `status` | Texto |
|----------|--------|
| `EN_PROCESO` | En proceso |
| `LISTA_PARA_ENTREGA` | Lista para entrega |
| `OWNER_CONTACTED` | Propietario contactado |

**Parte interesada** (igual `getInProgressPartyLabel`):

1. Si `owner.fullName` → ese nombre  
2. Si no, y `broughtByName` → `Traído por {broughtByName}`  
3. Si no → `Sin propietario`

### 3. Android — home

| Elemento | Comportamiento |
|----------|----------------|
| Título | **Órdenes en curso** |
| Subtítulo | `{fullName} · {role}` |
| Fila | Placa destacada; `{brand} {model}`; parte interesada; motivo (1–2 líneas); estado ES |
| Vacío | *No hay órdenes en curso.* + CTA Nueva orden (si el botón ya existe) |
| Loading | Indicador o *Cargando órdenes…* |
| Error | *No se pudieron cargar las órdenes.* + **Reintentar** |
| Logout | Acción en app bar (US-M1) |
| Nueva orden | FAB o botón **+** / **Nueva orden**. Hasta M3: puede no navegar o ir a placeholder; **no** implementar el wizard aquí |

- [ ] Al entrar al home (post-login y al volver del wizard M3) se refresca el listado.
- [ ] Tap en fila: **fuera de alcance** detalle; no crash. MVP: tap no-op o snack “Disponible en la web” (plan Android elige uno y se queda).
- [ ] Sin sesión → login (M1).

### 4. Archivos a crear / modificar

```
apps/android/app/src/main/java/com/mecatrack/mobile/
  data/api/          # MOD: GET in-progress DTO + método
  ui/home/           # NEW: HomeScreen + ViewModel
  ui/nav/            # MOD: startDestination home si hay sesión
  domain/            # NEW: party label + status label (unit test)
apps/android/README.md   # MOD: pantalla home
```

**No** cambiar `apps/api` ni `apps/web` en esta US.

### 5. Pruebas

| Capa | Casos |
|------|--------|
| Unit Android | Party label: owner / broughtBy / sin propietario; status labels |
| Manual admin | Ve OT no asignadas a él (si existen) |
| Manual mechanic | No ve OT de otro mecánico |
| Manual vacío | Copy de vacío, sin crash |
| Regresión M1 | Login/logout siguen funcionando |

### 6. NFR

- [ ] Autorización en servidor (no filtrar solo en UI).
- [ ] `limit` ≤ 50.
- [ ] Código/docs inglés; copy ES.
- [ ] No loguear PII (nacionalId) en logs de error.
- [ ] Reutilizar cliente HTTP/sesión de M1.

### 7. Documentación

- [ ] `apps/android/README.md` — home + `GET in-progress`
- [ ] `us/movil/README.md` — M2 Implemented al cerrar DoD

### 8. Pasos de implementación (orden)

1. DTO + método API + labels con tests unitarios.
2. HomeViewModel: loading / data / error / retry.
3. Home UI + vacío + FAB placeholder.
4. README + smoke admin vs mechanic.

### 9. Definition of Done

- [ ] AC §1–3
- [ ] Tests §5 (unit + smoke manual)
- [ ] Docs §7
- [ ] Rama `finalproject-RFM`
- [ ] **No** wizard cliente/vehículo/OT (US-M3)

---

## Roles involucrados

| Role | Responsibility |
|------|----------------|
| Android | Home list, labels, estados UI |
| QA / PO | Comparar recorte admin vs mecánico con la web D10 |

## Notas de producto

- El dolor web era el dashboard vacío; en móvil el home **es** esa lista.
- “Ver todas” de D10 no aplica: no hay widget de 5.
