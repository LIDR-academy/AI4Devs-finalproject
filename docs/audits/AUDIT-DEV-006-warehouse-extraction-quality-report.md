# 📊 Informe de Análisis de Código — Módulo de Extracción de Insumo de Bodega

* **ID Auditoría:** AUDIT-DEV-006
* **Fecha:** 2026-09-03
* **Reviewer:** Agente principal (análisis solicitado por el humano — "analicemos el módulo de extracción del insumo de la bodega")
* **Alcance revisado:** flujo `POST /api/v1/stock/extraction` de punta a punta — HTTP → Application → Domain → Infra (Prisma + InMemory) + UI (`WarehouseExtractionModal.tsx`, `stock.service.ts`).
* **User Stories cubiertas:** `US-014` (trazabilidad de extracciones), `US-025` (stock multi-sub-sector de bodega).
* **Verificación:** lectura de código + revisión de la suite `RecordExtraction.test.ts` (12 tests, todos sobre `InMemoryStockRepository`). No se ejecutó stack vivo.

---

## 🗺️ Mapa del módulo

| Capa | Artefacto | Rol |
| :-- | :-- | :-- |
| HTTP | `stock.routes.ts:43` | `POST /extraction`, guard `requireRole('ADMIN','KITCHEN_STAFF')` |
| HTTP | `stock.controller.ts:10-35`, `:84-101` | `recordExtractionSchema` (Zod) + handler `recordExtraction` |
| App | `RecordExtractionUseCase.ts` | Orquesta deducción de stock, creación de remanente y registro de movimiento; rama `DIRECT_DISCARD` |
| App | `resolveWarehouseSector.ts` | Valida `type === 'WAREHOUSE'` del sub-sector origen (US-025) |
| Domain | `Insumo.ts:107-113` (`deductStockAt`) | Débito por línea `(insumo, sub-sector)` — Invariante 1 por-sector |
| Domain | `Remanente.ts:25-45` (`createNew`) | TRR 24 h, estado `ACTIVE` |
| Infra | `PrismaStockRepository.ts:71-133` | `save` / `saveRemanente` / `recordMovement` (3 transacciones separadas) |
| Front | `WarehouseExtractionModal.tsx` | Formulario táctil (sector, insumo, propósito, cantidad, receta/motivo) |
| Front | `stock.service.ts:112-144` | `recordExtraction` + fallback "modo demo" |

**Flujo:** `findById(insumo)` → `resolveWarehouseSector` → `hasSufficientStockAt(sector)` → si `DIRECT_DISCARD` ⇒ `deductStockAt` + movimiento `DISCARD_DIRECT`/`WASTE_BIN`; si no ⇒ `deductStockAt` + `Remanente.createNew` + movimiento `EXTRACTION` / `EXTRACTION_RECIPE`.

---

## 🚨 Hallazgos

| ID | Sev. | Ubicación | Descripción | Ticket |
| :-- | :-- | :-- | :-- | :-- |
| **F-1** | 🔴 Crítica | `RecordExtractionUseCase.ts:67-88`, `:115-128` | **Secuencia de persistencia NO atómica.** `insumoRepository.save` → `saveRemanente` → `recordMovement` son 3 `await` independientes; en `PrismaStockRepository` cada uno es su propia transacción. Un fallo tras `save` deja stock descontado **sin remanente y sin movimiento** → pérdida silenciosa de inventario y ruptura de la trazabilidad que US-014 justifica. No hay Unit of Work ni compensación. La rama `handleDirectDiscard` tiene el mismo patrón (deduct + movement). | **TK-098** |
| **F-2** | 🔴 Crítica | `RecordExtractionUseCase.ts:52-59` + `PrismaStockRepository.ts:83-92` | **Race condition / lost update.** Patrón read-modify-write sin bloqueo optimista (`version`) ni `SELECT … FOR UPDATE` ni decremento atómico. `warehouseStock.upsert({ update: { quantity } })` escribe el **valor absoluto**. Dos extracciones concurrentes del mismo sub-sector leen `X`, ambas pasan `hasSufficientStockAt`, ambas escriben `X - q` → sobreventa de inventario. Escenario real: varias tablets de cocina. | **TK-098** |
| **F-3** | 🟠 Media | `RecordExtractionUseCase.ts:70,78`, `Remanente.ts:31-33` | **IDs y reloj generados en la capa de aplicación.** `mov-${Date.now()}` **sin sufijo aleatorio** → dos movimientos en el mismo ms (reintento, doble submit) colisionan en PK → 500. `rem-${Date.now()}-${random(1000)}` no-UUID, colisión por cumpleaños plausible. `Date.now()` / `new Date()` en la capa de aplicación/dominio rompe la pureza hexagonal (AGENTS §4) y roza el Guard 3 (timezone). | **TK-099** |
| **F-4** | 🟠 Media | `RecordExtractionUseCase.ts:111-113` | **`throw new Error` crudo** para "motivo obligatorio en descarte directo". No es excepción de dominio, no mapea a RFC 7807 (Guard 19 / Guard 2). Hoy lo enmascara el Zod `.refine`, pero si el caso de uso se invoca desde otra ruta (recetas, cocina) devuelve **500 en vez de 400/422**. | **TK-099** |
| **F-5** | 🟠 Media | `stock.service.ts:112-144`, `:99-110`, `:156-162` | **El fallback "modo demo" oculta errores del backend.** El `catch` de `recordExtraction` hace `console.error` y **retorna un éxito fabricado** mutando `mockWarehouseStocks`, con `remanenteId` falso. Un `422` (stock insuficiente) o `500` se presenta al operario como extracción exitosa. Contradice el Guard 38 (UX de error centralizada) y es peligroso en un sistema de inventario. `mapToUserFriendlyError` del modal (`:457`) nunca se ejecuta porque el error jamás sube. Igual `useAvailableInsumos` → `getAvailableInsumos()` y `getInsumos` → lista demo. **Decisión del humano (2026-09-03): eliminar el fallback por completo.** | **TK-100-FE** |
| **F-6** | 🟡 Baja | `WarehouseExtractionModal.tsx:197`, `:434-435` | **Aritmética de punto flotante sobre cantidad física (Guard 17).** `parseFloat`, `prev + 0.5`, `Math.round(x*10)/10`. Debe usar el VO compartido `shared/domain/DecimalQuantity` (ya importado en el service). `parseFloat(e.target.value) || 0.5` convierte `0` y `NaN` en `0.5` en silencio. | **TK-100-FE** |
| **F-7** | 🟡 Baja | `RecordExtractionUseCase.ts:83,124` | **El movimiento guarda el `name` del sector, no el `id`** (`fromLoc: sector.name`). Renombrar un `StorageLocation` desincroniza el histórico y rompe cualquier filtrado por id. Guardar `storageLocationId` (o ambos). | **TK-099** |
| **F-8** | 🟡 Baja | `stock.controller.ts:87-88`, schema `:19` | **`operatorId` aceptado desde el body.** `userObj?.id || parsedBody.operatorId`. US-014 §Decisiones exige que la autoría venga **solo** del token Bearer. Con auth activa no debería llegar, pero el schema sigue aceptando el campo → riesgo de suplantación de autoría en la auditoría. | **TK-099** |
| **F-9** | ⚪ Info | `RecordExtractionUseCase.ts:131`, DTO `:24` | **`remanenteId: ''` como centinela** para el descarte directo. El front se protege con `result.remanenteId &&` (`modal:374`) — dependencia frágil. Preferible `string \| null` o unión discriminada por `status`. | **TK-099** |
| **F-10** | ⚪ Info | `RecordExtraction.test.ts` | **Gaps de cobertura:** los 12 tests cubren happy-path, `422` por sector, `404`, `RECIPE`, `DIRECT_DISCARD` y validación US-025 — **todo sobre `InMemoryStockRepository`**. Sin cobertura de: concurrencia (F-2), fallo parcial / rollback (F-1), colisión de id de movimiento (F-3), ni el camino real `PrismaStockRepository`. Relevante para el Guard 11 (mutation score ≥ 70 %). | **TK-098** |

---

## ✅ Aspectos correctos (no requieren acción)

* RBAC explícito por ruta (`role('ADMIN','KITCHEN_STAFF')`) alineado con US-014 y cierre de AUDIT-SEC-001 F-3 (TK-093).
* Invariante por sub-sector bien modelado: `deductStockAt` no toca otras líneas y re-valida (defensa en profundidad) — `RecordExtraction.test.ts:181-232`.
* `decimal.js` vía `DecimalQuantity` en toda la capa backend del flujo.
* Zod con `.refine` para la regla condicional `DIRECT_DISCARD ⇒ reason`.
* `resolveWarehouseSector` valida `type === 'WAREHOUSE'` en producción (wiring real en `composition.ts:36`).

---

## 🎟️ Tickets de remediación generados

| Ticket | Sev. | Alcance | Hallazgos | Estado |
| :-- | :-- | :-- | :-- | :-- |
| **TK-098** | 🔴 Crítica | backend | F-1 (Unit of Work transaccional), F-2 (decremento atómico condicional), F-10 (tests de concurrencia + rollback + camino Prisma) | ✅ Done `878ff7b` |
| **TK-099** | 🟠 Media | backend | F-3 (puertos `Clock` / `IdGenerator`), F-4 (excepción de dominio), F-8 (ignorar `operatorId` de body con auth), F-9 (`remanenteId: null`) | ✅ Done `c2fdf24` |
| **TK-100-FE** | 🟠 Media | frontend | F-5 (eliminar fallback modo demo), F-6 (`DecimalQuantity` en el stepper de cantidad) | ✅ Done `8edc4b4` |
| **TK-101** | 🟢 Baja | backend | F-7 (`fromLoc` = id de sector, diferido de TK-099 — requiere migración Prisma) | 📝 Draft |

Los tres tickets se enmarcan en `US-014` + `US-025` (capacidades ya existentes) — no introducen reglas de negocio nuevas, por lo que aplica el patrón "N/A (Técnico)" (precedente `TK-091` / `TK-094` / `TK-097`). Guard 28: la única decisión de negocio abierta (destino del fallback modo demo, F-5) fue consultada con el humano y resuelta ("eliminar por completo").

---

## 🔁 Candidatos a Regla Permanente (Filtro de Sistemicidad)

| # | Hallazgo de origen | Destino | Estado |
| :-- | :-- | :-- | :-- |
| **C-DEV-006-1** | F-1 | `backend_rules.md §4` — *"Frontera Transaccional Inyectada en Casos de Uso Multi-Agregado"*: un caso de uso que muta ≥ 2 agregados / tablas DEBE ejecutar todas sus escrituras dentro de una única frontera transaccional inyectada por puerto (`IUnitOfWork` / `withTransaction`). Encadenar `await repo.a()` + `await repo.b()` sin transacción común es un defecto de integridad. | ✅ Aprobado (humano, 2026-09-03) y escrito |
| **C-DEV-006-2** | F-2 | `backend_rules.md §4` — *"Deducción de Saldo por UPDATE Condicional Atómico"*: `UPDATE … SET quantity = quantity - :q WHERE quantity >= :q` (o lock optimista con reintento); `rowsAffected === 0` → `InsufficientStockException`. Nunca read-check-then-write del valor absoluto. | ✅ Aprobado y escrito |
| **C-DEV-006-3** | F-5 | `frontend_rules.md §9.5` — *"Prohibido Sintetizar un Éxito Falso en el `catch` de un Servicio"*: un `catch` en `*.service.ts` nunca devuelve un objeto con forma de respuesta de éxito de una mutación. Fallback de solo-lectura solo tras `VITE_DEMO_MODE`. | ✅ Aprobado y escrito |
| **C-DEV-006-4** | Encuadre de estos 3 tickets | `AGENTS.md` Guard 26 (carve-out) + `.agents/workflows/04_dev_audit_workflow.md` FASE 0.4 — criterio explícito *"ticket de remediación técnica vs. cascada de spec completa"*: la prueba es *"¿el dueño de producto o un usuario notaría una diferencia en las reglas de negocio o en el comportamiento de cara al usuario?"*. Sí → cascada. No → `TK-XXX` técnico vía `SK-12`, sin reabrir el ticket original. | ✅ Aprobado y escrito |

Los gates deterministas asociados (`check_usecase_transaction_boundary`, verificación grep del `catch` sintético) quedan como deuda de tooling: los tickets **TK-098** y **TK-100-FE** los incluyen como tests obligatorios en su DoD; su promoción a script `docs/04_governance_and_quality/scripts/` es un candidato separado a evaluar tras la implementación.

---

## 📌 Addendum de Resolución (2026-09-03 → 2026-09-04)

Decisión del humano: **resolver los puntos A + B + C**.

* **C (commit `8e1c6fb`):** reglas permanentes C-DEV-006-1..4 escritas (tabla de arriba). `.agents/` — `04_dev_audit_workflow.md` FASE 0.4 (carve-out `N/A (Técnico)` ampliado), `README.md` 2.10.0 → 2.11.0.
* **A/B:** los 3 tickets implementados en el orden acordado, 1 commit atómico por ticket, TDD.

| Ticket | Commit | Hallazgos | Verificación |
| :-- | :-- | :-- | :-- |
| **TK-098** | `878ff7b` | F-1, F-2, F-10 | 213 tests backend · mutation 100 % en `RecordExtractionUseCase.ts` · **verificado contra Postgres 15 real** (rollback de `$transaction` + 2 `execute()` concurrentes → 1×201 + 1×422, sin sobreventa) |
| **TK-100-FE** | `8edc4b4` | F-5, F-6 | 139 tests frontend · fallback demo eliminado · `DecimalQuantity` en el stepper |
| **TK-099** | `c2fdf24` | F-3, F-4, F-8, F-9 | mutation ≥ 70 % por archivo · `Clock`/`IdGenerator` inyectados · `openapi.yaml` `remanenteId` nullable |
| **TK-101** | 📝 Draft | **F-7** (diferido de TK-099) | necesita columna `StockMovement.fromStorageLocationId` + migración Prisma (aprobación humana, AGENTS §3) + cambio del contrato de `GET /stock/movements`; + barrido `IdGenerator` en `RestockInsumoUseCase`/`CreateLocationUseCase` (misma clase que F-3, fuera del alcance de TK-099) |

**No verificado en este entorno (declarado):** `oasdiff` (breaking-change check de `check_contract_drift.sh`) — binario ausente; el cambio `remanenteId` nullable queda documentado en TK-099 y en el `description` del schema.

---

## ⚖️ Conclusión

El módulo cumple funcionalmente los criterios BDD de US-014 y US-025 (verificado por la suite existente). Los defectos **F-1 y F-2 son de integridad de datos** y deben priorizarse: en un sistema de inventario en tiempo real con varias tablets, la ausencia de frontera transaccional y de decremento atómico produce pérdida o sobreventa de stock silenciosas — exactamente lo que el sistema existe para evitar. **F-5** degrada la confianza operativa al fingir éxitos. El resto son deuda de calidad acotada.

**Prioridad recomendada:** TK-098 (P0) → TK-100-FE (P1) → TK-099 (P2).
