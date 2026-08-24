## 1. Backend: auditoria app

- [x] 1.1 Create `apps/auditoria` Django app
- [x] 1.2 `Bitacora` model: `usuario` FK (nullable, `on_delete=SET_NULL`), `accion`, `entidad`, `entidad_id` (nullable), `detalle`, `ip`, `fecha` (auto_now_add)
- [x] 1.3 Migration
- [x] 1.4 `record_event(user, action, entidad=None, entidad_id=None, detalle=None, ip=None)` service function

## 2. Wire into existing audit stub

- [x] 2.1 Update `apps.accounts.audit.emit_audit_event` to call `record_event`, wrapped so persistence failures are logged, not raised
- [x] 2.2 Confirm login/user-create/role-edit call sites need no changes

## 3. Read endpoint and permission

- [x] 3.1 `GET /api/auditoria` — list, most recent first, gated by `RequiresPermission("auditoria.consultar")`
- [x] 3.2 Serializer exposing `usuario` email, `accion`, `entidad`, `entidad_id`, `detalle`, `fecha`

## 4. Frontend

- [x] 4.1 `auditService.ts` — `list()`
- [x] 4.2 `AuditLogPage.tsx` — read-only table, wired behind `RequireAuth`

## 5. Tests

- [x] 5.1 `record_event` persists a `Bitacora` row with expected fields
- [x] 5.2 Login creates a `Bitacora` row (integration, reusing `add-auth-rbac` login test setup)
- [x] 5.3 `GET /api/auditoria` returns `403` without permission, `200` with it, ordered most-recent-first
- [x] 5.4 No serializer/view exposes update or delete for `Bitacora`
- [x] 5.5 Audit persistence failure (mocked) does not raise out of `emit_audit_event`
