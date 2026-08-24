## 1. Backend: comercial app and simple models

- [x] 1.1 Create `apps/comercial` Django app
- [x] 1.2 `Group` model (`nombre`) with CRUD
- [x] 1.3 `Distributor` model (`nombre`) with CRUD

## 2. Backend: Assignment model with partial unique index

- [x] 2.1 `Assignment` model: `tipo` (`empresa-cliente|empresa-grupo|empresa-dist|grupo-dist`), `origen_id`, `destino_id`, `fecha_inicio`, `fecha_fin` (nullable), `usuario` FK, `accion` (`asignar|reasignar|remover`)
- [x] 2.2 `UniqueConstraint(fields=["origen_id", "tipo"], condition=Q(fecha_fin__isnull=True))`
- [x] 2.3 `CheckConstraint`: `fecha_fin IS NULL OR fecha_fin > fecha_inicio`
- [x] 2.4 Migration; verify generated SQL contains `WHERE "fecha_fin" IS NULL`

## 3. Backend: AsignacionService

- [x] 3.1 `current_assignment(origen_id, tipo)` — latest row with `fecha_fin IS NULL`
- [x] 3.2 `asignar(tipo, origen_id, destino_id, usuario)`: validates target exists, closes previous current row, creates new one, all in one transaction
- [x] 3.3 Company-origin guard: reject if `not is_eligible_for_assignment(company)`
- [x] 3.4 R-EST-04 guard: reject `empresa-dist` assignment if the company has a current `empresa-grupo` assignment
- [x] 3.5 `distribuidor_efectivo(empresa_id)`: direct distributor if present, else the group's current distributor
- [x] 3.6 Emit audit event on every successful assign/reassign/remove

## 4. Backend: endpoints

- [x] 4.1 `PUT /api/empresas/{id}/cliente` gated by `empresa.asignar_cliente`
- [x] 4.2 `PUT /api/empresas/{id}/grupo` gated by `empresa.asignar_grupo`
- [x] 4.3 `PUT /api/empresas/{id}/distribuidor` gated by `empresa.asignar_grupo`, enforcing R-EST-04
- [x] 4.4 `Group`/`Distributor` CRUD endpoints, `PUT` for group's current distributor

## 5. Frontend

- [x] 5.1 `commercialService.ts` — assign client/group/distributor, list groups/distributors
- [x] 5.2 Assignment panel on the company detail view: current client/group/effective distributor, selectors, visible inheritance, conflict messages

## 6. Tests

- [x] 6.1 Reassignment closes previous row and opens a new one; previous row still exists
- [x] 6.2 Concurrency test: two real overlapping transactions racing for the same `(origen_id, tipo)` — one succeeds, one gets an integrity error surfaced as `409`
- [x] 6.3 Assigning company to a group with a current distributor makes `distribuidor_efectivo` return that distributor without a direct assignment
- [x] 6.4 Assigning a direct distributor to a company in a group → `409`
- [x] 6.5 Assigning to a non-existent group/distributor → `404`
- [x] 6.6 Assignment on a `baja_erp` company → `409`
- [x] 6.7 Every successful assignment emits an audit event
- [x] 6.8 Missing permission → `403` on each assignment endpoint
- [x] 6.9 Group's current distributor follows the same close-and-open, at-most-one-current rule
