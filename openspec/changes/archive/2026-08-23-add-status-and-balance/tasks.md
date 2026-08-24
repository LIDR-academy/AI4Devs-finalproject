## 1. Backend: EstatusPlanService

- [x] 1.1 `estado_derivado(empresa_plan, today=None)` implementing R-PLN-03/04/05 exactly
- [x] 1.2 `GET /api/empresas/{id}/estado` gated by `financiero.consultar`, returns derived status per current subscription

## 2. Backend: AdeudoService — per-company

- [x] 2.1 `adeudo_por_empresa(empresa_id, a_fecha=None)` — `Decimal`, rounded to 2 places, 0 when no payments
- [x] 2.2 `GET /api/empresas/{id}/adeudo`

## 3. Backend: AdeudoService — aggregations

- [x] 3.1 Shared helper: resolve current (or as-of-date) company ids for a given `(destino_id, tipo)`
- [x] 3.2 `adeudo_por_cliente(cliente_id, a_fecha=None)`
- [x] 3.3 `adeudo_por_grupo(grupo_id, a_fecha=None)`
- [x] 3.4 `adeudo_por_distribuidor(distribuidor_id, a_fecha=None)` — direct + group-inherited companies, single aggregate query
- [x] 3.5 `GET /api/clientes/{id}/adeudo`, `GET /api/grupos/{id}/adeudo`, `GET /api/distribuidores/{id}/adeudo`
- [x] 3.6 All endpoints accept optional `?a_fecha=YYYY-MM-DD`

## 4. Frontend

- [x] 4.1 `statusService.ts` — `getStatus(empresaId)`, `getBalance(kind, id)`
- [x] 4.2 Status badge (vigente/vencido/bloqueado) and outstanding-balance figure on `CompanyDetailPage.tsx`

## 5. Tests

- [x] 5.1 `estado_derivado`: vigente within grace, vencido by flag, vencido by date past grace, bloqueado
- [x] 5.2 `adeudo_por_empresa`: sums only `estatus=2`, `Decimal("0.00")` when none
- [x] 5.3 `adeudo_por_cliente`/`_grupo` sum current companies correctly
- [x] 5.4 `adeudo_por_distribuidor` includes direct + group-inherited companies
- [x] 5.5 `a_fecha` variant uses historical assignment state (company reassigned before/after the date)
- [x] 5.6 Omitting `a_fecha` matches current-assignment result
- [x] 5.7 Performance: aggregate distributor balance over ~1000 companies executes with a bounded, small number of queries (assert query count, not wall-clock)
- [x] 5.8 Missing `financiero.consultar` permission → `403` on each endpoint
- [x] 5.9 No `float` used anywhere in the balance calculation path (code-level check or type assertion on results)
