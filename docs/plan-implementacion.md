# Plan de implementación — EyeMaster V2

> Plan de construcción reordenado por **dependencias reales de build** (los epics de
> `documentacion-funcional.md` §10 no están en orden de construcción). Estrategia
> **mock-first**: la implementación avanza contra fixtures sin depender de los
> webservices ERP reales.

## Estrategia base

- **Mock-first.** El `ERP_MODE=mock` se implementa primero → backend y frontend se
  desarrollan completos contra fixtures. Al existir los WS reales, se activa
  `ERP_MODE=real` y se validan contratos.
- **Backend antes que frontend por vertical.** Cada vertical entrega endpoint + pantalla.
- **Auditoría y ERP Gateway se adelantan** (cimientos transversales, aunque en la doc
  sean Epic 06 y parte del 03).

## Decisiones a cerrar ANTES de codear (bloqueantes)

Del bloque §11 *Open items*:

| PD | Tema | Por qué bloquea |
|---|---|---|
| PD-10 | Periodicidad de sync de la caché | define job Celery vs on-demand |
| PD-12 | Formato/límite de export de reportes | afecta TK-09-04 |
| — | Política de contraseñas | afecta Epic 01 |
| — | **Contrato REST de los WS ERP** (provisional) | define fixtures y mapeo TK-03-02 |

> Recomendación: definir un **contrato OpenAPI provisional de los WS ERP** ya, aunque no
> exista el servicio. Los fixtures se derivan de ese contrato y evitan retrabajo cuando
> llegue el real.

---

## Fases

### Fase 0 — Fundaciones (scaffolding)

- Estructura `backend/` (Django+DRF) y `frontend/` (React+Vite) según §2.3.
- `core/settings` por entorno: `.env`, `DATABASE_URL`, `ERP_MODE`, `ADMIN_API_URL`,
  `PEOPLE_API_URL`, tokens.
- `docker-compose` (PostgreSQL local + backend).
- CI base: lint (`ruff`/`black`, `eslint`), `pytest`, build FE.
- FE: cliente HTTP con interceptor JWT, router, componentes base.
- **DoD:** `docker-compose up` levanta backend vacío + DB + SPA "hello".

### Fase 1 — Capa de integración ERP + mock ⭐ (ruta crítica)

Desbloquea Epics 02, 03, 07.

- **TK-03-01** — Interfaz `ERPGateway` + `MockGateway` (fixtures JSON).
- **TK-03-02** — `RestGateway` (`httpx`): token, timeouts, retries, mapeo respuesta→modelos.
- Fixtures realistas para ambos ERP (identidad `proyecto+id_externo` colisionando, apps
  `SUITE_A/SUITE_B`).
- **DoD:** tests de contrato contra mock + respuestas grabadas; cambiar `ERP_MODE` no
  rompe callers.

### Fase 2 — Acceso, usuarios, RBAC (Epic 01, 23 pts)

- TK-01-01..04: user model (login email), `Role`/`Permission` + seed, JWT
  (login/refresh/me), `PermissionClass` por código.
- TK-01-05..07: CRUD usuarios y roles, login screen + route guard.
- **DoD:** `403` sin permiso, `401` genérico, guard FE por rol.

### Fase 3 — Auditoría (Epic 06, 8 pts) — adelantada

- TK-06-01/02: modelo `Bitacora` append-only + `AuditService`.
- Cableado desde ya en login, registro cliente, asignaciones.
- (TK-06-03 pantalla al final).
- **DoD:** acción sensible → registro inmutable.

### Fase 4 — Clientes (Epic 02, 19 pts)

Depende de: Gateway (F1) + Auth (F2) + Audit (F3).

- TK-02-01/03/04/05: modelo `Client` (RFC único, `estado_sync`), `POST /clientes`
  buscar-o-crear, listado, retry.
- TK-02-06: pantalla con badge de estado.
- **DoD:** Gherkin HU-02 (201 existente/creado, 202 pendiente, 409 duplicado).

### Fase 5 — Empresas / retrieval (Epic 03 resto, 8 pts)

- TK-03-03/04: modelo `Company` (espejo, `ultima_sync`), endpoints
  search/retrieve/detail, pantalla.
- **DoD:** buscar en ERP (mock), "recuperar" crea espejo, `baja_erp` bloquea.

### Fase 6 — Estructura comercial (Epics 04+05, 27 pts) ⭐

- **TK-04-01** — modelo `Assignment` con vigencias + **índice único parcial**
  `(origen_id,tipo) WHERE fecha_fin IS NULL` + CHECK fechas (test de concurrencia →
  `IntegrityError`).
- TK-04-02/03: `PUT /empresas/{id}/cliente` (cierra/abre vigencia) + UI.
- TK-05-01..04: `Group`/`Distributor` + `AsignacionService` (exclusividad, herencia
  distribuidor↔grupo), endpoints, UI.
- **DoD:** Gherkin HU-05 (herencia, 409 conflicto, sin borrado físico).

### Fase 7 — Caché financiera (Epic 07, 26 pts)

- TK-07-01/02: modelos caché `Plan`, `Complemento`, `EmpresaPlan`, `Pago`, `CortePlan`.
- **TK-07-03** — `ERPFinanceService`: lee planes/pagos/cortes de ADMIN y PEOPLE vía
  Gateway → puebla caché con `ultima_sync`.
- TK-07-04/05: endpoints + pantalla perfil financiero.
- **DoD:** caché poblada desde mock; job de sync según PD-10.

### Fase 8 — Estatus y adeudo (Epic 08, 16 pts)

- TK-08-01 `EstatusPlanService` (vigente/vencido/bloqueado, reglas R-PLN).
- **TK-08-02** `AdeudoService`: `Σ pago.total WHERE estatus=2` por empresa +
  agregaciones cliente/grupo/distribuidor, con variante `a_fecha`. `Decimal`, no `float`.
- TK-08-03/04: endpoints + `empresas/con-adeudo`, UI badges/semáforo.
- **DoD:** adeudo distribuidor 1000 empresas < 500 ms; cobertura ≥90% servicio.

### Fase 9 — Motor de reportes (Epic 09, 26 pts)

- TK-09-01 capa "as of date".
- **TK-09-02** motor flexible `POST /reportes/consulta`
  (`medida × dimensiones × filtros × a_fecha`).
- TK-09-03 catálogo de 9–11 reportes predefinidos.
- TK-09-04 UI (selector, tabla dinámica, export según PD-12).
- **DoD:** Gherkin HU-11; planes cortesía (`tipo=3`) reportados aparte.

### Fase 10 — Endurecimiento y despliegue

- ✅ Circuit breaker en el ERP Gateway (`RestGateway`), por ERP, con cooldown configurable.
- ✅ `docs/getting-started.md` y `docs/deployment.md` (runbook de despliegue).
- ⬜ **Diferido explícitamente (no descartado):** E2E Playwright (login → recuperar
  empresa → asignar grupo → consultar reporte) — requiere binarios de navegador no
  disponibles en el entorno de desarrollo de este proyecto.
- ⬜ **Diferido explícitamente:** aprovisionamiento real de infraestructura
  (Render/Railway/Vercel) — no existen cuentas para este proyecto; el runbook en
  `docs/deployment.md` deja los pasos listos para cuando existan.
- ⬜ Job de sync periódico (Celery beat) — sigue abierto como PD-10.
- Pantallas pendientes (TK-06-03), PRs de entrega.

---

## Camino crítico

```
F0 → F1 (Gateway+mock) → F2 (Auth) → F6 (Assignment/índice único)
                       ↘ F7 (Caché) → F8 (Adeudo) → F9 (Reportes)
```

F3–F5 corren en paralelo tras F2. **F1 y F6 son los mayores riesgos técnicos**
(contrato WS + concurrencia de vigencias) → abórdalos temprano.

## PRs de entrega (los 3 que pide la plantilla)

1. **DB** → TK-04-01 (`Asignacion` + índice único parcial).
2. **Backend** → TK-08-02 (`AdeudoService`).
3. **Frontend** → TK-09-04 (UI reportes).

---

## Mapa Fase → OpenSpec change

La implementación se conduce con OpenSpec (`openspec/changes/`). Ver
`openspec/changes/README.md` para el estado de cada change.

| Fase | Change OpenSpec | Capability | Estado |
|---|---|---|---|
| F0 | `bootstrap-project` | `project-scaffold` | ✅ archivado |
| F1 | `add-erp-gateway` | `erp-integration` | ✅ archivado |
| F2 | `add-auth-rbac` | `auth` | ✅ archivado |
| F3 | `add-audit-log` | `audit` | ✅ archivado |
| F4 | `add-client-registration` | `clients` | ✅ archivado |
| F5 | `add-company-retrieval` | `companies` | ✅ archivado |
| F6 | `add-commercial-structure` | `commercial-structure` | ✅ archivado |
| F7 | `add-financial-cache` | `financial-cache` | ✅ archivado |
| F8 | `add-status-and-balance` | `financial-status` | ✅ archivado |
| F9 | `add-reporting-engine` | `reporting` | ✅ archivado |
| F10 | `harden-and-deploy` | `erp-integration` (modified) | ✅ archivado |
