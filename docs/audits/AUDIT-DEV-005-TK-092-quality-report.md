# 📊 Informe de Auditoría de Código VSDD — Ticket TK-092

* **ID Auditoría:** AUDIT-DEV-005
* **Fecha de Auditoría:** 2026-09-03
* **Reviewer:** Subagente Independiente Adversarial (Principal SWE / Lead Security Auditor / QA Architect)
* **Ticket Evaluado:** TK-092 — Resolución Fail-Safe de Rol de Usuario (cierre de AUDIT-SEC-001 F-1 Crítica / F-2 Media)
* **Alcance revisado:** working tree sin commitear (no hay commit todavía).
* **Verificación:** lectura de código + los 8 gates deterministas + verificación en vivo contra el stack Docker (`backend :3000`, `frontend :8085`, `postgres` healthy).

---

## 📋 Resumen por Fases

| Fase | Resultado |
| :-- | :-- |
| Fase 0 (Descubrimiento de Reglas + Cascada Spec-antes-que-Código) | ✅ PASÓ |
| Fase 1 (Anti-Tautología / Mutation) | ⚠️ PASÓ CON OBSERVACIONES |
| Fase 2 (Arquitectura Hexagonal / SOLID) | ✅ PASÓ |
| Fase 3 (Anti-Drift / Build / Seed) | ❌ FALLÓ (gate mandatado `check_seed_idempotency.sh` en ROJO) |
| Fase 4 (Seguridad / Entornos / Resiliencia) | ❌ FALLÓ (objetivo F-1/F-2 cumplido y verificado, pero defecto de resiliencia D-1) |
| Fase 5 (UI / WCAG) | N/A (backend-only; el formulario de rol es TK-084-FE, sin cambios) |

---

## FASE 0 — Descubrimiento Dinámico de Reglas · ✅ PASÓ

**Stack deducido de `docs/04_governance_and_quality/rules/`:** Vitest (runner), `tsc` + ESLint (static), Prisma ORM / PostgreSQL 15, Zod (sanitización), `bcrypt`/JWT, Stryker (mutation, `mutate` **excluye `src/infrastructure/**`** por diseño — `backend_rules.md §2`).

**Cascada Spec-Antes-que-Código (Guard 26):**

| Artefacto | Estado |
| :-- | :-- |
| `docs/05_agile_planning/12_tickets/shared/backend/TK-092.md` | ✅ presente, `status: approved`, `related_story: US-010 · AUDIT-SEC-001 F-1/F-2` |
| User Story enlazada | ✅ `US-010` (Gestión de Personal) + `US-015` (RBAC dinámico) — ambos ficheros existen |
| Fila en `13_matriz_trazabilidad.md` | ✅ `REQ-027` añadida (User/Role, endpoints `POST/PUT /auth/users`, TK-092 → TK-093) |
| `indice_tickets.md` | ✅ 3 entradas (tabla de prioridad, tabla backend, índice `security/`) |
| `AUDIT-SEC-001-security-posture-report.md` | ✅ presente (motiva el ticket) |
| `TK-093.md` (F-3, fuera de alcance de este ticket) | ✅ presente |

**Orden real (mtimes):** AUDIT-SEC-001 `08:46` → TK-092.md `09:09` → `PrismaUserRepository.ts` `09:11:20` → `seed.ts` `09:11:32` → `PrismaUserRepository.test.ts` `09:11:55` → `security_rules.md` `09:14`. La spec precede al código: **no es reconstrucción retroactiva**. Observación menor: el fichero de test se escribió ~35 s **después** de la implementación (no es un ciclo RED-first estricto); mitigado porque los criterios BDD del ticket estaban aprobados por humano.

---

## FASE 1 — Auditoría Anti-Tautología de Pruebas · ⚠️ PASÓ CON OBSERVACIONES

`pnpm --filter @restostock/backend test -- --run` → **36 files / 171 tests, todos verdes** (incluye los 4 nuevos y `ManageUsers.test.ts` sin tocar). Los 4 tests de `PrismaUserRepository.test.ts`:

| Test | ¿Aserción real? | Qué mutante mata |
| :-- | :-- | :-- |
| F-1a `save()` persiste `roleId` en `create` **y** `update` | ✅ | borrar `roleId` de `create`/`update`; quitar `mode:'insensitive'` (se asera explícitamente) |
| F-1a `update()` persiste `data.roleId` | ✅ | borrar `roleId` de `data` |
| F-2 rol inexistente → `EntityNotFoundException`, `upsert` NO llamado | ✅ | invertir el `if (!role)`; mover el `throw` después del `upsert` |
| F-1b fila sin rol → `UNASSIGNED_ROLE`, **NUNCA `'ADMIN'`**, `console.warn` emitido | ✅ | revertir `?? UNASSIGNED_ROLE` a `?? 'ADMIN'` (regresión directa de F-1b) |

**No son teatro** — ejercen la operación real (mock sólo en la frontera Prisma, conforme `testing_rules.md §6`) y las aserciones centrales del ticket.

**Mutation score:** no obtenible — `stryker.conf.json` excluye `src/infrastructure/**` (patrón establecido del proyecto). Argumento equivalente aceptado para los happy paths por la especificidad de las aserciones de payload.

**GAP (→ Defecto D-3):** ningún test cubre `save()` / `update()` cuando `user.role === UNASSIGNED_ROLE` — es decir, el camino real de un usuario huérfano que intenta autenticarse o que un ADMIN intenta corregir. Ese camino ahora **lanza** (ver D-1) y no está caracterizado por ningún test.

---

## FASE 2 — Arquitectura Hexagonal y SOLID · ✅ PASÓ

* **Aislamiento de dominio:** `User` sigue siendo TS puro. `UNASSIGNED_ROLE` se exporta desde infraestructura (correcto: es un detalle del mapper, no del dominio).
* **Mapper name↔id:** legítimo en la capa de persistencia. El `User` de dominio modela `role` por **nombre**; la fila Prisma guarda `roleId`. Traducir en el borde es responsabilidad del repositorio, no del caso de uso. **No** se requiere inyectar `IRoleRepository`: reutilizar `this.prisma` es coherente con el constructor de un solo `prisma`, evita una dependencia cruzada auth→security y no duplica lógica (`PrismaRoleRepository.findRoleByName` usa el mismo `where: { name: { equals, mode:'insensitive' } }`).
* **`PrismaUserRaw` perdió `roleId`:** ningún otro consumidor lo referencia (`toDomain` es file-private; sus únicos llamadores son los `find*` de este fichero). `tsc` verde → el estrechamiento estructural sobre el retorno real de Prisma (que trae más campos) es sólido.
* **`toDomain` ya no lee `raw.roleId`:** no hay ruta que dependiera de la rama `|| raw.roleId` (era el segundo eslabón del fallback roto de F-1b).
* **Gates deterministas (acotados al diff):**
  * `check_ticket_code_quality.sh` → ✅ `exit 0` (complejidad/longitud/profundidad limpias en los 3 ficheros).
  * `check_dead_code.sh` → ✅ `exit 0` ("Ningún archivo tocado por el ticket introduce código muerto nuevo"; `UNASSIGNED_ROLE` lo consume el test). 10 hallazgos preexistentes informativos.
  * `check_ticket_duplication.sh` → ✅ `exit 0` (21 clones en HEAD = 21 en working tree, 0 nuevos).
* `pnpm --filter @restostock/backend run build` → ✅ `tsc` sin errores. `pnpm run lint` → ✅ backend `Done` sin errores (13 warnings, todos frontend preexistente fuera del diff).

---

## FASE 3 — Anti-Drift Arquitectónico y Seed · ❌ FALLÓ

### 3.1 `check_seed_idempotency.sh` (mandatado por FASE 3.4 — el ticket toca `prisma/seed.ts`) → **ROJO**

```
▶ Corrida 1 de migrate + seed...
PrismaClientKnownRequestError: ... code: 'P2022', meta: { modelName: 'User' }  (DriverAdapterError: ColumnNotFound)
    at async seedProductionAdmin (apps/backend/prisma/seed.ts:111:17)
❌ La primera corrida de migrate+seed falló — el seed no es ni siquiera ejecutable.
```

**Causa raíz — drift PREEXISTENTE de migraciones (no introducido por TK-092):** `apps/backend/prisma/migrations/20260821001603_init/migration.sql:44-54` crea `User` **sin** la columna `mustChangePin`, y ninguna migración posterior la añade; `schema.prisma:47` sí la declara (`mustChangePin Boolean @default(true)`, añadida vía `db push` en la línea de Guard 36, nunca migrada). Por eso `prisma migrate deploy` produce un esquema incompleto y el seed revienta con `P2022`.

**Impacto sobre TK-092:** el **DoD ítem 4** ("`seed` idempotente, 0 filas `User` con `roleId IS NULL`, segunda corrida 0 filas afectadas") **NO queda verificado por el gate que el workflow obliga a ejecutar**. El stack Docker real usa `prisma db push` (no `migrate deploy`) — así que el drift no rompe producción hoy, pero el gate determinista de idempotencia es inservible mientras exista.

**Compensación manual (no sustituye el gate):**
* Ordenamiento en `main()`: `seedDefaultRoles()` hace `upsert` de `role-kitchen` **antes** de devolver `kitchenRoleId`, luego `reconcileOrphanUserRoles(roles.kitchenRoleId)`. En BD fresca `updateMany({ where:{ roleId:null } })` es no-op (0 usuarios). En segunda corrida, 0 filas con `roleId null` → 0 afectadas. **La lógica de reconcile es idempotente y correcta por inspección.**
* Stack vivo (backend reconstruido hace ~32 min): los 3 usuarios antes huérfanos de AUDIT-SEC-001 (`Jose`, `Jose`, `Jose David`) **ya figuran con `roleId = role-kitchen`** → el reconcile corrió y funcionó.

### 3.2 Otros puntos FASE 3

* Persistencia CLI (3.3): `seed.ts` usa `PrismaClient` real + `upsert` + `updateMany` (no mocks in-memory). ✅
* `check_schema_drift.sh` no se ejecuta (el ticket no toca `schema.prisma` ni su spec DDL). El drift de 3.1 es de `migrations/` vs `schema.prisma`, no de `schema.prisma` vs spec — cae fuera de ese script.
* No hay cambios "en caliente" de esquema/API sin documentar en `docs/`.

---

## FASE 4 — Seguridad, Sanitización, Entornos y Resiliencia · ❌ FALLÓ

### ✅ Objetivo primario cumplido y verificado EN VIVO

| Verificación en vivo (stack Docker) | Resultado |
| :-- | :-- |
| `POST /auth/users` con `role:"kitchen_staff"` (minúsculas) | `201` → fila persiste con `roleId = role-kitchen` (match case-insensitive OK) |
| Login de ese usuario | JWT `role` claim = **`KITCHEN_STAFF`**, NO `ADMIN` — **F-1a + F-1b cerrados extremo a extremo** |
| Ese usuario → `GET /reports/waste` y `GET /auth/users` | `403` (DoD ítem 7 ✅) |
| `POST /auth/users` con `role:"ROL_INEXISTENTE_XYZ"` | `404` RFC 7807 `EntityNotFoundException`, nada persistido — **F-2 cerrado** |
| `UNASSIGNED` frente a `requireRole(...)` | `403` (no está en la allowlist) |
| `UNASSIGNED` frente a `authorizePermissions(...)` | `403` (`findRoleByName('UNASSIGNED')` → `null`) — centinela genuinamente sin poder |

El path `onDelete: SetNull` (`schema.prisma:69`) sigue dejando huérfanos si se borra un `Role`, pero el centinela `UNASSIGNED` no concede nada en ningún middleware. `authorizePermissions.middleware.ts` además ni siquiera está montado (dead file preexistente). ✅

### ❌ D-1 (MEDIA) — El centinela `UNASSIGNED` envenena TODOS los caminos de escritura del usuario, contradiciendo el propio diseño del ticket

`AuthenticateByPinUseCase.execute()` llama `this.userRepository.save(user)` **en cada intento de login** (`AuthenticateByPinUseCase.ts:39`, antes del check de PIN, para persistir `failedAttempts`). `SetUserStatusUseCase.ts:~30` y `UpdateUserUseCase.ts:~34` llaman `save()` / `update()`. Los tres invocan ahora `resolveRoleId(user.role)` **incondicionalmente** (`PrismaUserRepository.ts:100, 130`), que lanza `EntityNotFoundException` cuando `user.role === 'UNASSIGNED'` (no existe ningún `Role` llamado así).

**Verificado en vivo** poniendo `roleId = NULL` en una fila de prueba:

| Acción | HTTP | Detalle |
| :-- | :-- | :-- |
| Login del usuario huérfano (PIN correcto) | `404` | `"Rol con ID UNASSIGNED no fue encontrado"` — lockout total, error semánticamente equivocado en una ruta de login |
| ADMIN `PATCH /auth/users/:id/status` `{action:"BLOCK"}` | `404` | **un ADMIN no puede bloquear/contener una cuenta huérfana o sospechosa** |
| ADMIN `PUT /auth/users/:id` sólo `name` | `404` | no se puede renombrar ni resetear PIN sin re-seleccionar rol |
| ADMIN `PUT /auth/users/:id` con `role:"KITCHEN_STAFF"` | `200` | **único camino correctivo que funciona** |

El ticket promete para `UNASSIGNED`: *"permite listar/mostrar el usuario en la pantalla admin para que un ADMIN lo corrija"* y *"un administrador puede promoverlo después"*. El listado (`findAll` → `console.warn` + `UNASSIGNED`) funciona, pero **toda escritura correctiva salvo la reasignación completa de rol devuelve 404**. Es fail-safe en la dirección del privilegio, pero es un **DoS autoinfligido**: borrar cualquier `Role` bloquea en caliente a todos sus usuarios (login + gestión), sanable sólo por un redeploy-seed o un `PUT`+rol por usuario. El reconcile del seed sólo cura en el próximo despliegue, no en runtime. **Sin test.**

> Nota de matiz: AUDIT-SEC-001 recomendaba literalmente `lanzar` en `mapToDomain` — bloquear el login está dentro del espíritu. El defecto concreto y acotado es que **las acciones administrativas correctivas (BLOCK, editar nombre/PIN) sobre un usuario centinela fallan**, rompiendo la promesa explícita del ticket y retirando una capacidad de contención de seguridad.

### ⚠️ D-2 (BAJA) — Consulta extra en el hot path de login

`resolveRoleId` añade un `role.findFirst` a **cada** `save()`, y `save()` corre en cada intento de autenticación. Coste aceptable (índice por `name`), pero conviene registrarlo; una alternativa es resolver sólo cuando `user.role` cambió respecto a lo persistido.

### ⚠️ D-4 (BAJA / gobernanza) — El script y la regla no concuerdan sobre F-2

`security_rules.md §2` (modificada por este ticket) dice que `role: z.string()` es aceptable *"si la fuente de verdad es el catálogo persistido... la validación se hace en el borde de persistencia"* y que eso *"lo verifica `check_privilege_defaults.sh`"*. Pero el script **no tiene excepción** para el patrón de borde de persistencia y marca `auth.controller.ts:35` y `:42` como deuda (informativo, no bloquea porque el fichero está fuera del diff). Queda un flag permanente sobre un patrón que la regla acaba de bendecir. `createUserSchema` / `updateUserSchema` siguen con `z.string().min(1)` (decisión deliberada del ticket, alineada con US-015 roles dinámicos).

### ⚠️ D-5 (INFO) — La respuesta de creación no canonicaliza el nombre de rol

`CreateUserUseCase` / `UpdateUserUseCase` devuelven `user.role` = el string de entrada (`"kitchen_staff"`), no el `Role.name` canónico (`"KITCHEN_STAFF"`). El JWT del siguiente login sí es correcto (viene del join), así que es cosmético, pero el body `201` queda momentáneamente inconsistente con lo persistido.

### Resto FASE 4 (OK)

Sin `catch {}` vacíos; sin secretos hardcodeados (el diff no toca `.env`/Docker); Zod activo en todos los payloads; DIP intacto (rutas no instancian repos); RFC 7807 conforme (`errorHandler.ts` — los alias `error`/`message` son retrocompat preexistente e intencional); `decimal.js` N/A. `check_dependency_audit.sh` → ✅ (7 GHSA, todas en riesgo residual documentado; el ticket no toca dependencias). `check_privilege_defaults.sh` → ✅ `exit 0` para el diff del ticket.

---

## FASE 5 — Frontend / Accesibilidad · N/A

TK-092 es backend puro. El formulario que envía `Role.name` (`CreateUserForm`, `GET /api/v1/roles`) es TK-084-FE y no se toca. La resolución case-insensitive que ese formulario necesita **está verificada** (FASE 4, `"kitchen_staff"` → `201`).

---

## 🚨 Defectos Detectados

| ID | Sev. | Ubicación | Descripción | Corrección propuesta |
| :-- | :-- | :-- | :-- | :-- |
| **D-1** | 🟠 Media | `PrismaUserRepository.ts:100,130` (`save`/`update` → `resolveRoleId`), consumido por `AuthenticateByPinUseCase.ts:39`, `SetUserStatusUseCase.ts:~30`, `UpdateUserUseCase.ts:~34` | Un usuario con `role === UNASSIGNED_ROLE` no puede autenticarse **ni** ser bloqueado/editado por un ADMIN (todo `404`), salvo `PUT` con rol válido explícito. Contradice el diseño declarado del ticket ("visible y corregible en admin") y retira la contención por BLOCK. Verificado en vivo. Sin test. | En `save()`/`update()`: si `user.role === UNASSIGNED_ROLE`, **no** llamar `resolveRoleId` — preservar el `roleId` actual (`null`) y dejar pasar la mutación de `status`/`name`/`pin`. Alternativa: que `AuthenticateByPinUseCase` persista `failedAttempts` por una vía que no re-resuelva el rol. Añadir tests: (a) `save(user{role:UNASSIGNED})` no lanza y no toca `roleId`; (b) `SetUserStatusUseCase` BLOCK sobre huérfano → OK. |
| **D-2** | 🟡 Baja | `PrismaUserRepository.ts:56-65` + `AuthenticateByPinUseCase.ts:39` | `resolveRoleId` = una query extra en cada intento de login. | Aceptable; documentar, o resolver sólo si `user.role` difiere de lo persistido. |
| **D-3** | 🟡 Baja | `PrismaUserRepository.test.ts` | No hay test del camino de escritura con el centinela (el path realista de regresión de D-1). | Cubrir con los tests de D-1. |
| **D-4** | 🟡 Baja | `check_privilege_defaults.sh:59-61` vs `security_rules.md §2` | La regla dice que el script verifica el patrón "borde de persistencia" para F-2; el script no lo reconoce y marca `auth.controller.ts:35,42` a perpetuidad. | Añadir al script una excepción cuando el mismo campo se resuelve/rechaza en un `Prisma*Repository` (o whitelistear `auth.controller.ts` con comentario justificado), o ajustar el texto de §2 para no atribuir esa verificación al script. |
| **D-5** | ⚪ Info | `CreateUserUseCase.ts:34-38`, `UpdateUserUseCase.ts:31-36` | La respuesta HTTP devuelve el string de rol de entrada, no el `Role.name` canónico. | Re-leer el usuario tras `save`/`update`, o devolver el nombre canónico resuelto. |
| **D-6 (preexistente)** | 🟠 Media (repo) | `apps/backend/prisma/migrations/` | El árbol de migraciones no añade `mustChangePin` (ni está alineado con `schema.prisma`): `prisma migrate deploy` produce un esquema roto y **`check_seed_idempotency.sh` no puede validar el DoD-4 de TK-092**. No lo introduce este ticket. | Ticket de saneamiento aparte: `prisma migrate diff` + nueva migración que reconcilie `migrations/` con `schema.prisma` (mín. `mustChangePin`, revisar `email`/`resetToken*`). Hasta entonces, la idempotencia del seed queda **NO VERIFICADA por gate** para todo ticket que toque `seed.ts`. |

### Alcance / bundling (perspectiva FASE 6)

El working tree mezcla el fix F-1/F-2 con gobernanza C-SEC-1..5: `security_rules.md §9` (C-SEC-4 / F-4, almacenamiento de token), el bullet C-SEC-3 en §4 (F-3 — que **este mismo ticket declara fuera de alcance** y difiere a TK-093), la edición de Guard 28 (C-SEC-5 / F-5) y `docs/00_stack_manifest.md §7`. Landing del informe `AUDIT-SEC-001` + las 2 reglas que el fix aplica directamente (C-SEC-1 §4 fail-safe, C-SEC-2 §2) es defendible junto a TK-092. **C-SEC-3, C-SEC-4 y Guard 28 no son concerns de F-1/F-2** y el commit del DoD (`fix(auth): ...`) no los describirá. **Recomendación:** separar los cambios de gobernanza no-F-1/F-2 a un commit `docs:` propio (o un TK de gobernanza), y dejar en TK-092 sólo: código + tests + `security_rules.md §2/§4` + matriz/índice + `AUDIT-SEC-001` + `TK-092.md`.

---

## Estado de los Criterios de Aceptación / DoD del ticket

| # | DoD | Estado |
| :-- | :-- | :-- |
| 1 | F-1a: usuario `KITCHEN_STAFF` persiste `roleId` (test unitario) | ✅ test + verificado en vivo |
| 2 | F-1b: `toDomain` sin rol → `'UNASSIGNED'`, jamás `'ADMIN'` (test de regresión) | ✅ test + verificado en vivo |
| 3 | F-2: rol fuera de catálogo → `404` RFC 7807 | ✅ verificado en vivo |
| 4 | Reconciliación: `seed` idempotente, 0 filas `roleId IS NULL`, 2ª corrida 0 afectadas | ❌ **NO VERIFICADO por gate** (`check_seed_idempotency.sh` ROJO por drift preexistente D-6); lógica correcta por inspección + estado vivo consistente |
| 5 | Suite completa verde (incl. `ManageUsers.test.ts` sin tocar) | ✅ 171/171 |
| 6 | Gates (`build`, `lint`, `check_ticket_code_quality`, `check_dead_code`, `check_ticket_duplication`) 0 errores nuevos | ✅ los 5 verdes |
| 7 | Stack real: crear KITCHEN_STAFF por UI, login, `/reportes` y `/ajustes` denegados, `roleId` no nulo | ✅ verificado por API (`403` en `/reports/waste` y `/auth/users`; `roleId=role-kitchen`) |
| 8 | Commit atómico `fix(auth): ...(TK-092)` | ⏳ pendiente; ver nota de bundling (los cambios de gobernanza no encajan en `fix(auth)`) |
| — | Gestión huérfano por ADMIN (implícito en la descripción de `UNASSIGNED`) | ❌ BLOCK / edición-solo-nombre sobre huérfano → `404` (D-1) |

---

## 🔁 Candidatos a Regla Permanente (Filtro de Sistemicidad, FASE 6.1)

> Requieren aprobación humana explícita (HITL) antes de escribirse. Se listan como propuesta.

| # | Defecto de origen | Destino propuesto | Verificación |
| :-- | :-- | :-- | :-- |
| **C-DEV-005-1** | D-1 | `backend_rules.md §2` — nueva regla: *"Valor centinela/tombstone que un repositorio produce en lectura (`UNASSIGNED`, `DELETED`, `ANONYMOUS`, …) DEBE tratarse como caso de primera clase en TODO camino de escritura de esa misma entidad: si el valor de dominio es el centinela, la escritura no debe re-resolverlo contra su catálogo (no debe lanzar) — debe preservar el estado persistido y permitir mutar los demás campos. Un centinela que sólo es seguro en lectura pero envenena `save()`/`update()`/`patch` es un lockout autoinfligido."* | Test obligatorio en el PR: `save(entity{campo:CENTINELA})` no lanza y no altera la FK; más un test de la acción admin de contención (BLOCK/disable) sobre esa entidad. |
| **C-DEV-005-2** | D-6 | `AGENTS.md` Guard 27 / `04_dev_audit_workflow.md` FASE 3.4 — aclarar: *"Si `check_seed_idempotency.sh` falla porque `prisma migrate deploy` produce un esquema divergente de `schema.prisma` (drift `migrations/` ↔ `schema.prisma`), es un FALLO de FASE 3 bloqueante para el repo aunque el ticket en curso no toque `migrations/` — porque deja el gate de idempotencia inservible para toda la clase de tickets que tocan `seed.ts`. Debe abrirse TK de saneamiento antes de aprobar cualquier ticket que dependa de ese gate."* Además: añadir `check_migration_schema_parity.sh` (`prisma migrate diff --from-migrations --to-schema-datamodel` debe ser vacío). | Script nuevo `check_migration_schema_parity.sh` (siempre-on, no diff-scoped). |
| **C-DEV-005-3** | D-4 | `security_rules.md §2` (ajuste de redacción) **o** `check_privilege_defaults.sh` (excepción de borde de persistencia) | Alinear el texto de la regla con lo que el script realmente puede verificar; sin ambigüedad de "lo verifica X" cuando X no distingue el patrón permitido. |

Los defectos D-2, D-3 y D-5 **no pasan** el filtro de sistemicidad (son puntuales de este ticket, no patrón repetible).

---

## ⚖️ VEREDICTO FINAL

# RECHAZADO CON DEFECTOS

**Fundamento:** el objetivo central del ticket — cerrar la escalada de privilegios Crítica AUDIT-SEC-001 F-1 y la validación abierta F-2 — **está correctamente implementado y verificado extremo a extremo en el stack vivo** (usuario creado como `KITCHEN_STAFF` autentica como `KITCHEN_STAFF` y recibe `403` en rutas ADMIN; rol fuera de catálogo → `404`; centinela `UNASSIGNED` sin poder en ningún middleware). La arquitectura, los 5 gates de calidad acotados al diff, el build y el lint están verdes.

Se rechaza por:

1. **FASE 3 — gate mandatado en ROJO:** `check_seed_idempotency.sh` no puede validar el **DoD ítem 4** (idempotencia del nuevo `reconcileOrphanUserRoles`) por un drift preexistente `migrations/` ↔ `schema.prisma` (falta `mustChangePin`). El workflow prohíbe aprobar por omisión un gate que el ticket obliga a correr. Requiere TK de saneamiento de migraciones **o** una decisión humana explícita de aceptar la verificación sólo-por-inspección + estado-vivo.
2. **FASE 4 — Defecto D-1 (Media), verificado en vivo:** un usuario con rol centinela `UNASSIGNED` no puede ser **bloqueado ni editado** por un ADMIN (todo `404`), contradiciendo la promesa explícita del ticket ("visible y corregible en la pantalla admin") y retirando la contención por BLOCK. Borrar cualquier `Role` produce un lockout en caliente de todos sus usuarios, sanable sólo por redeploy o `PUT`+rol. Sin test (D-3).
3. **Alcance:** los cambios de gobernanza C-SEC-3 / C-SEC-4 / Guard 28 corresponden a F-3/F-4/F-5 — que este ticket declara fuera de alcance — y no encajan en el commit `fix(auth):` del DoD-8. Separar a un commit `docs:`.

**Camino a APROBADO (esfuerzo bajo — la dirección del fix es correcta):**
- (a) D-1: en `save()`/`update()` cortocircuitar `resolveRoleId` cuando `user.role === UNASSIGNED_ROLE` (preservar `roleId` actual, permitir mutar `status`/`name`/`pin`); + tests D-1/D-3.
- (b) D-6: abrir TK de reconciliación de `migrations/`; hasta entonces, aprobación humana explícita del DoD-4 verificado sólo por inspección + stack vivo.
- (c) Split del diff de gobernanza no-F-1/F-2.
- (d) Opcional: D-2, D-4, D-5.

---

## 📌 Addendum de Resolución (post-veredicto, 2026-09-03)

Autor del fix: agente principal. Cambios aplicados sobre el mismo working tree en respuesta al RECHAZO:

| Defecto | Estado | Resolución |
| :-- | :-- | :-- |
| **D-1** (Media) | ✅ RESUELTO | `PrismaUserRepository.roleIdPatchForWrite(user)`: si `user.role === UNASSIGNED_ROLE` devuelve `{}` — `save()`/`update()` hacen spread `...rolePatch`, por lo que **no se llama `resolveRoleId`, no se lanza `404` y `roleId` se preserva** (NULL en el huérfano). Un ADMIN puede ahora BLOQUEAR/editar al huérfano; se corrige el rol con un `PUT` que trae rol válido explícito. |
| **D-3** (Baja) | ✅ RESUELTO | 2 tests nuevos en `PrismaUserRepository.test.ts`: (a) `save(user{role:UNASSIGNED})` no invoca `role.findFirst` y el payload no lleva `roleId`; (b) un ADMIN BLOQUEA (update) a un huérfano `UNASSIGNED` → resuelve sin `404`, `data.status === 'BLOCKED'`, sin `roleId`. Total del archivo: **6 tests**. |
| **D-4** (Baja/gov) | ✅ RESUELTO | `security_rules.md §2` reescrito: el script **bloquea** fallbacks literales y **señala como informativo** `role: z.string()` — sin afirmar que "verifica" el patrón de borde de persistencia. |
| **D-6 / FASE 3** (Media, preexistente) | ✅ RESUELTO vía **TK-094** | `check_seed_idempotency.sh` ahora en **verde**. Migración `20260903100000_sync_schema_drift` añade `User.mustChangePin` (Guard 36) y `SystemSettings.idleTimeoutMinutes` (Guard 37) — las 2 únicas columnas en drift (derivadas de `prisma migrate diff`; `User.email` ya estaba cubierto). Nuevo gate siempre-on `check_migration_schema_parity.sh` (C-DEV-005-2). DoD-4 de TK-092 ahora **sí** verificado por el gate: 5 migraciones aplican limpio + seed idempotente x2. |
| **D-2, D-5** (Baja/Info) | ⏳ ANOTADOS | D-2: `resolveRoleId` añade 1 query por intento de login — aceptado, coste marginal. D-5: la respuesta HTTP eco del `role` de entrada, no el `Role.name` canónico — cosmético, candidato a limpieza en TK-093/US-015. |
| **Bundling** | ✅ APLICADO | Plan de commits: (1) `docs(security): AUDIT-SEC-001 + TK-092/093/094 spec cascade [skip-tk]`; (2) `feat(governance): fail-safe privilege rules + check_privilege_defaults gate [skip-tk]` (C-SEC-1..5); (3) `fix(auth): resolve user role fail-safe, persist roleId, reject unknown roles (TK-092)`. |

**Candidatos a Regla Permanente (C-DEV-005-1..3):** aprobados por el humano y escritos:
- **C-DEV-005-1** → `backend_rules.md §2` — "Valores Centinela / Tombstone de Primera Clase en Escritura".
- **C-DEV-005-2** → `AGENTS.md` Guard 27 (g) + nuevo `docs/04_governance_and_quality/scripts/check_migration_schema_parity.sh` (siempre-on) + `docs/00_stack_manifest.md §7`.
- **C-DEV-005-3** → resuelto como parte de D-4 (reescritura de `security_rules.md §2`).

**Re-verificación tras el fix:** `PrismaUserRepository.test.ts` 6/6 · suite backend 173/173 · `build` + `lint` (0 errores) · `check_ticket_code_quality` / `check_dead_code` / `check_ticket_duplication` / `check_privilege_defaults` verdes · stack Docker: alta KITCHEN_STAFF → `roleId=role-kitchen`, JWT `role=KITCHEN_STAFF`, `403` en ruta ADMIN, rol desconocido → `404`.
