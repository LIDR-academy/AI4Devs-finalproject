# 🔐 Informe de Auditoría de Seguridad — AUDIT-SEC-001

* **ID Auditoría:** AUDIT-SEC-001
* **Fecha:** 2026-09-03
* **Auditor:** Rol "Arquitecto DevSecOps y Auditor de Seguridad" (meta-prompt aportado por el humano), ejecutado como pasada de auditoría — **no** como generador de código.
* **Alcance:** Postura de seguridad transversal de RestoStock (backend `apps/backend`, frontend `apps/frontend`), evaluada contra los 2 pilares del meta-prompt: (1) Transporte / sesión / cabeceras; (2) RBAC / default-deny / mínimo privilegio / anti-mass-assignment / multi-rol.
* **Naturaleza:** Auditoría de repo completo (no acotada a un `TK-XXX`). Origen: mensaje del humano "¿en qué puede ayudar [el prompt DevSecOps] a `.agents/` y al proyecto?".
* **Método:** Lectura de código + verificación en el stack Docker en ejecución (`docker compose`, 3 contenedores `running` en `:8085`).

---

## 📋 Resumen ejecutivo

| # | Severidad | Título | Estado |
| :-- | :-- | :-- | :-- |
| **F-1** | 🔴 **Crítica** | Todo usuario creado por API se persiste sin rol y autentica como `ADMIN` | **Confirmada en stack vivo** |
| **F-2** | 🟠 Media | Campo de privilegio `role` validado como `z.string()` abierto (no enum ni catálogo) | Confirmada |
| **F-3** | 🟠 Media | Rutas de mutación de cocina/stock autenticadas a nivel de mount, sin declaración de rol por ruta (default-deny incompleto) | Confirmada |
| **F-4** | 🟡 Baja | JWT `expiresIn: '12h'` en `localStorage` — ventana de robo por XSS de 12 h, sin trade-off documentado | Confirmada |
| **F-5** | ⚪ Informativa | RBAC estático (`requireRole('ADMIN')`) mientras `Role`/`Permission`/`RolePermission` ya existen en schema+seed; el diseño multi-rol/granular del Pilar 2 es exactamente US-015/TK-073 (BACKLOG) | — |

### ✅ Lo que ya está bien (no requiere acción)

* `helmet()` global antes de las rutas (`app.ts:252`) → HSTS, X-Content-Type-Options, Frameguard activos en `/api/v1/*`.
* `cors()` con origen resuelto de `CORS_ALLOWED_ORIGINS` (sin comodín en producción — Guard 14).
* Rate limiting global `/api/v1/*` (`app.ts:279`) + limiter estricto adicional en login.
* `assertJwtSecretConfigured()` fail-fast; entropía ≥32 chars en producción (Guard 14 / SK-33).
* PIN con `bcrypt` cost 10; JWT firmado con secreto de entorno.
* `authMiddleware` montado por defecto en todos los grupos de router (`isAuthRequired = options.requireAuth ?? true`).
* Rutas administrativas de `/users*` correctamente protegidas con `authMiddleware, requireRole('ADMIN')` (`auth.routes.ts`).
* Respuestas de error RFC 7807; Zod en todos los payloads; sin `catch {}` vacíos en el path auditado.
* Swagger UI restringido por `NODE_ENV` (security_rules.md §8).

---

## 🚨 Hallazgos detallados

### F-1 — 🔴 Crítica: escalada de privilegios en la creación de usuarios

**Path de datos:**

1. `createUserSchema` (`auth.controller.ts:33-38`) acepta `role: z.string().min(1)` y el controlador llama a `CreateUserUseCase`.
2. `CreateUserUseCase.execute()` (`CreateUserUseCase.ts:22-32`) construye el `User` de dominio con `role: dto.role` y llama a `userRepository.save(user)`.
3. `PrismaUserRepository.save()` (`PrismaUserRepository.ts:72-97`) — **el bloque `create` NO escribe `roleId`** (ni resuelve `role` name → `Role.id`). La fila queda con `roleId = NULL` (`schema.prisma:68` `roleId String?`, sin `@default`).
4. En la siguiente lectura, `mapToDomain()` (`PrismaUserRepository.ts:25`):
   ```ts
   role: (raw.role?.name || raw.roleId || 'ADMIN') as UserRole,
   ```
   Con `role` (join) `null` y `roleId` `null`, el fallback resuelve a **`'ADMIN'`**.
5. `AuthenticateByPinUseCase` (`AuthenticateByPinUseCase.ts:45-52`) firma el JWT con `role: user.role` → `'ADMIN'`.
6. `requireRole('ADMIN')` (`requireRole.ts:8`) compara `req.user.role === 'ADMIN'` → **acceso total concedido**.

**Verificación en el stack en ejecución (2026-09-03):**

```
SELECT u.name, u."roleId", r.name AS role_name FROM "User" u LEFT JOIN "Role" r ON r.id = u."roleId";

     name      |   roleId   | role_name
---------------+------------+-----------
 Administrador | role-admin | ADMIN        ← usuario del seed (correcto)
 Jose          |            |              ← creado por UI "Gestión de Personal"
 Jose          |            |              ← creado por UI
 Jose David    |            |              ← creado por UI
```

Los 3 usuarios creados desde la interfaz tienen `roleId = NULL` → **todos autentican como `ADMIN`**, sin importar el rol seleccionado en el formulario.

**Impacto:** cualquier ADMIN que dé de alta a un operario de cocina le está entregando, de hecho, credenciales de administrador. Rompe el Pilar 2 (default-deny, mínimo privilegio). Explotable a través de un flujo de UI soportado (US-022), no requiere acceso a BD.

**Defectos que se combinan (ambos deben corregirse):**

* **F-1a** — `PrismaUserRepository.save()` / `.update()` no persisten el rol del usuario. Falta resolver `role` (name) → `Role.id` y escribir `roleId` (y, si el rol no existe, rechazar).
* **F-1b** — `mapToDomain()` usa `|| 'ADMIN'` como fallback: un rol ausente debe resolverse al **mínimo privilegio o lanzar**, jamás al máximo.

**Corrección recomendada:** ticket **TK-092** (abajo). Fix mínimo:
- `save()`/`update()`: resolver y persistir `roleId` (buscar `Role` por `name`; si no existe → `EntityNotFoundException`).
- `mapToDomain()`: si no hay rol resoluble → lanzar `Error('Usuario sin rol asignado')` (fail-safe), nunca `'ADMIN'`.
- Migración de datos: asignar `roleId` a los usuarios huérfanos existentes (o bloquearlos) antes de desplegar el fix.

---

### F-2 — 🟠 Media: campo de privilegio como string abierto (anti-mass-assignment)

* `auth.controller.ts:35` — `createUserSchema.role: z.string().min(1)`
* `auth.controller.ts:42` — `updateUserSchema.role: z.string().min(1).optional()`
* `domain/auth/entities/User.ts:4` — `export type UserRole = string;` (sin refinamiento)

`role` es un campo que determina el privilegio y se acepta como texto libre. No se valida contra un `z.enum(['ADMIN','KITCHEN_STAFF'])` ni contra el catálogo persistido de `Role`. Un valor con typo (`"Admin"`, `"admind"`) se acepta y persiste; combinado con F-1b, cualquier string no reconocido cae al fallback.

Aunque hoy sólo un ADMIN autenticado alcanza estas rutas, el Pilar 2 exige que **todo campo de privilegio en un payload externo se valide contra un conjunto cerrado**. Es además la clase de defecto que un futuro endpoint self-service (registro, invitaciones) convertiría en escalada directa.

**Corrección recomendada:** parte de **TK-092**. Validar `role` contra `Role.name` existentes en BD (fuente de verdad, alineado con US-015) o, como mínimo interino, `z.enum`.

---

### F-3 — 🟠 Media: default-deny incompleto en rutas de mutación

`kitchen.routes.ts:46-51` — `POST /remanentes/:id/consume`, `/discard`, `/shift-reconciliation`, `/recipes/:id/consume`: **sin `requireRole` a nivel de ruta**.
`stock.routes.ts:33` — `POST /extraction`: **sin `requireRole`** (las rutas hermanas `/movements`, `/insumos`, `/insumos/:id/restock` sí tienen `requireRole('ADMIN')`).

Todas heredan `authMiddleware` del `app.use('/api/v1/kitchen', ...guard, ...)` a nivel de mount → **están autenticadas** (no es acceso anónimo). Que un operario de cocina pueda consumir/descartar remanentes es coherente con PRD §2.2.

El gap frente al Pilar 2: el modelo es "autenticado ⇒ permitido" en vez de "cada ruta declara explícitamente sus roles". Consecuencia concreta: cuando se implemente US-015 y existan roles nuevos (p. ej. "Auditor" de sólo lectura), **tendrán acceso de escritura a estas rutas por omisión**.

**Corrección recomendada:** ticket **TK-093** — añadir `requireRole('ADMIN','KITCHEN_STAFF')` (o el `authorizePermissions(...)` de TK-073) explícito a cada ruta de mutación. Cero cambio de comportamiento hoy; cierra el default-deny.

---

### F-4 — 🟡 Baja: superficie del token de sesión

* `AuthenticateByPinUseCase.ts:52` — `jwt.sign(payload, secret, { expiresIn: '12h' })`
* Frontend — el token se guarda en `localStorage` (`restostock_jwt_token`; `auth.service.ts`, tests en `auth.service.test.ts:26`).

Cumple `security_rules.md §1` ("expiración máxima de 12 horas"), pero 12 h es el límite superior y `localStorage` es accesible a cualquier script → un XSS roba un token válido por hasta 12 h, sin posibilidad de revocación (JWT stateless). No hay en `security_rules.md` una decisión documentada sobre Bearer-en-localStorage vs cookie `HttpOnly`.

**Corrección recomendada:** decisión de producto/arquitectura, no bug. Opciones: (a) documentar el trade-off aceptado en `security_rules.md` + reducir `expiresIn` (p. ej. 1–2 h) y/o añadir refresh token; (b) migrar a cookie `Secure; HttpOnly; SameSite=Strict`. Candidato a nota en `SK-08` (ver §"Candidatos a regla permanente").

---

### F-5 — ⚪ Informativa: RBAC estático vs. el diseño multi-rol del Pilar 2

`schema.prisma` ya define `Role`, `Permission`, `RolePermission`; `seed.ts:31-80` los puebla (`role-admin`/`ADMIN`, `role-kitchen`/`KITCHEN_STAFF` + matriz de permisos). Pero la aplicación autoriza con `requireRole('<name>')` estático sobre el string del JWT; **no existe `authorizePermissions()`** y `User` tiene un único rol.

El Pilar 2 del meta-prompt (multi-rol por usuario, matriz granular de permisos, least-privilege) **es literalmente la spec de US-015 / TK-073** (`status: BACKLOG`). F-1, F-2 y F-3 deberían resolverse **dentro de, o como precursores de,** TK-073 para no hacer el trabajo dos veces.

---

## 🔁 Candidatos a Regla Permanente (Filtro de Sistemicidad — workflow 04 FASE 6.1)

> Requieren aprobación humana explícita (HITL) antes de escribirse. Se listan como propuesta.

| # | Defecto de origen | Destino propuesto | Verificación |
| :-- | :-- | :-- | :-- |
| **C-SEC-1** | F-1b | `security_rules.md §4` — nueva regla: *"Resolución fail-safe de rol/permiso: un rol o permiso ausente/no resoluble SIEMPRE se resuelve al mínimo privilegio (denegar / lanzar), nunca al máximo. Prohibido `x || 'ADMIN'`, `?? 'ADMIN'`, `: 'ADMIN'` como fallback."* | Script `check_privilege_defaults.sh` (SK-27) — bloqueante en el diff: regex sobre mappers/repos/middlewares por fallbacks de privilegio literales. |
| **C-SEC-2** | F-2 | `security_rules.md §2` — extender: *"Todo campo que determina privilegio (`role`, `isAdmin`, `permissions`, `scopes`) recibido en un payload externo se valida contra un conjunto cerrado (`z.enum` o catálogo persistido). Nunca `z.string()` libre."* | Cubierto por el mismo `check_privilege_defaults.sh` (detecta `role: z.string(` en `*.controller.ts`). |
| **C-SEC-3** | F-3 | `security_rules.md §4` — extender el bullet "Middleware de Autenticación Obligatorio" con: *"Cada ruta de mutación/consulta declara explícitamente sus roles/permisos permitidos a nivel de ruta (`requireRole` / `authorizePermissions`), no sólo `authMiddleware` a nivel de mount. Una ruta sin declaración de rol es un defecto de auditoría (default-deny)."* + añadir el chequeo a `04_dev_audit_workflow.md` FASE 4.1. | Manual en review (FASE 4). Opcional: script que liste rutas sin `requireRole`/`authorizePermissions`. |
| **C-SEC-4** | F-4 | `SK-08` (o `security_rules.md` nueva §9) — *"Almacenamiento de token de sesión: si el token va en `localStorage`/`sessionStorage`, documentar explícitamente el trade-off XSS y acotar `expiresIn`. Si va en cookie → `Secure; HttpOnly; SameSite` obligatorio. Verificar HSTS activo (no sólo `helmet()` presente) y redirección HTTP→HTTPS en el edge."* | Nota de skill; sin script. |
| **C-SEC-5** | F-5 | `AGENTS.md` Guard 28 (o `01_cascading_spec_workflow.md` FASE 1.5) — nota: *"Al especificar cualquier feature de RBAC/permisos, plantear como pregunta humana explícita: ¿un rol por usuario o multi-rol? ¿permisos estáticos o catálogo editable? No asumir el modelo."* | Checklist de spec. |

**Nota sobre el meta-prompt DevSecOps en sí:** NO se recomienda incorporarlo verbatim a `.agents/` como skill/workflow — es un mega-prompt one-shot "diseña+genera la capa de seguridad" que choca con el modelo descompuesto (workflow/skill/guard/cascada + HITL) del framework y saltaría Guard 26 (nada de código sin ticket) y Guard 24 (leer el manifiesto, no autodetectar el stack). Su **valor real** es como lente de auditoría recurrente: su checklist de 2 pilares es lo que produjo C-SEC-1..5. Recomendación: conservarlo como plantilla de `AUDIT-SEC-*` (este documento es la primera instancia) e invocarlo periódicamente, no cablearlo al pipeline.

---

## 🎟️ Tickets de corrección propuestos

| Ticket | Prioridad | Alcance |
| :-- | :-- | :-- |
| **TK-092** | 🔴 Must (pre-entrega) | Backend. F-1a: `PrismaUserRepository.save()/.update()` resuelven y persisten `roleId` (`Role` por `name`; inexistente → `EntityNotFoundException`). F-1b: `mapToDomain()` fail-safe (lanzar, no `'ADMIN'`). F-2: validar `role` contra catálogo `Role`. Migración de datos para los usuarios huérfanos existentes. TDD: test de integración "crear usuario KITCHEN_STAFF ⇒ el JWT resultante NO tiene rol ADMIN". |
| **TK-093** | 🟠 Should | Backend. F-3: `requireRole(...)` / `authorizePermissions(...)` explícito por ruta en `kitchen.routes.ts` y `stock.routes.ts` (rutas de mutación). Sin cambio de comportamiento observable. |
| *(US-015 / TK-073)* | Backlog | Ya existe. F-5 y el Pilar 2 completo (multi-rol, permisos granulares) viven aquí. TK-092/093 son precursores compatibles. |

---

## ⚖️ VEREDICTO

**Postura de seguridad: SÓLIDA en transporte/cabeceras/sanitización/rate-limiting; con UN defecto CRÍTICO de control de acceso (F-1) confirmado en producción-local.**

Acción inmediata recomendada antes de la entrega del proyecto: **implementar TK-092**. F-3/F-4/F-5 pueden diferirse a US-015 o post-entrega con ticket.
