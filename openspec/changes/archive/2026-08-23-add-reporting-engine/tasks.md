## 1. Backend: reportes app and measure registry

- [x] 1.1 Create `apps/reportes` Django app
- [x] 1.2 Measure registry: `adeudo`, `pagado`, each declaring supported dimensions
- [x] 1.3 `adeudo` measure: rows for `cliente`/`grupo`/`distribuidor`/`empresa`, `a_fecha`-aware
- [x] 1.4 `pagado` measure: aggregate `Pago` by dimension fields, `estatus=1`

## 2. Backend: flexible engine endpoint

- [x] 2.1 `POST /api/reportes/consulta`: validate medida×dimensiones, apply filtros, compute rows + total
- [x] 2.2 `400` on unsupported medida×dimension combination
- [x] 2.3 `400` on malformed filter value
- [x] 2.4 `200` with empty rows + `total=0` when no matches
- [x] 2.5 `proyecto`/`app` filters applied to source rows; `adeudo_min` applied post-aggregation

## 3. Backend: catalog

- [x] 3.1 Catalog data structure: client/group/distributor → companies+balance, "which companies owe me"
- [x] 3.2 `GET /api/reportes/catalogo` listing catalog entries
- [x] 3.3 Catalog entries execute via the same engine function used by `/consulta`

## 4. Frontend

- [x] 4.1 `reportsService.ts` — `catalogo()`, `consultar(payload)`
- [x] 4.2 `ReportsPage.tsx`: catalog shortcuts + custom builder (measure, dimensions multi-select, filters, `a_fecha`) + results table with total

## 5. Tests

- [x] 5.1 `adeudo` by distribuidor+empresa returns expected rows and total
- [x] 5.2 `pagado` by empresa aggregates only `estatus=1` payments
- [x] 5.3 Unsupported medida×dimension → `400`
- [x] 5.4 Malformed filter (non-numeric `adeudo_min`) → `400`
- [x] 5.5 No matches → `200`, empty rows, `total=0`
- [x] 5.6 `a_fecha` reconstructs historical distributor/group membership (reuse the F8 fixture scenario)
- [x] 5.7 Every catalog entry executes and returns the same shape as calling `/consulta` with its payload directly
- [x] 5.8 Reporting performs no writes (no migrations touched, no `.save()`/`.create()` calls in the engine module — spot-check via code inspection test or mock)
- [x] 5.9 Missing `reportes.consultar` permission → `403` on both endpoints
