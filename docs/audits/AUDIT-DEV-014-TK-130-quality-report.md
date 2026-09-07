# 📊 Informe de Auditoría de Código VSDD — Ticket TK-130

* **ID Auditoría:** AUDIT-DEV-014
* **Fecha:** 2026-09-07
* **Reviewer:** Agente principal en rol de Reviewer Independiente Adversarial
* **Ticket:** [TK-130](../05_agile_planning/12_tickets/stock/backend/TK-130.md) — `PUT /api/v1/stock/insumos/:id` (US-036)

---

## 📋 Resumen por Fases

| Fase | Resultado |
| :-- | :-- |
| 0 — Reglas / cascada | PASÓ |
| 1 — Mutation ≥ 70% | PASÓ (scoped) |
| 2 — Arquitectura / SOLID | PASÓ |
| 3 — Anti-Drift / Build | PASÓ (contrato **aditivo**, sin breaking) |
| 4 — Seguridad / Sanitización | PASÓ |
| 5 — UI / WCAG | N/A (backend) |

## FASE 0

* Cascada completa ejecutada: **US-036** (`catalog/`, INVEST + 6 escenarios BDD + decisión Guard 28 documentada), `openapi.yaml` (`PUT /stock/insumos/{id}` + `UpdateInsumoRequest`), `TK-130` (backend) + `TK-130-FE` (frontend). `related_story: US-036`. Cierra deuda explícita de `US-012` §[N]egociable y `AUDIT-DEV-012` C-1.
* Guard 28: la decisión "`name`/`unitCost`/`barcode` sí, `unitOfMeasure` no" está en `US-036` §Decisiones y se refleja en el `.strict()` del schema.

## FASE 1 — Mutation (scoped)

| Archivo | Score |
| :-- | :-- |
| `UpdateInsumoUseCase.ts` | **77.59%** |
| `Insumo.withDetails` | cubierto por `Insumo.test.ts` (2 tests dedicados) |

Tests: `UpdateInsumoUseCase.test.ts` (7 — edición parcial, `null` limpia, 404, 409 nombre, 409 barcode, no-colisión-consigo-mismo, no-cambio-real), `Insumo.test.ts` (+2 `withDetails`), `ManageCatalogInsumos.test.ts` (+8 integración = los 6 escenarios de US-036 + 401 + barcode-clash). **PASÓ.**

## FASE 2 — Arquitectura

* **Dominio:** `Insumo.withDetails(patch)` sigue el patrón inmutable de `withStockLines` — copia **exhaustiva** de todos los campos, preserva `id`/`unitOfMeasure`/`stockLines`. Test que verifica que el stock y la unidad sobreviven a la edición (misma clase de bug que motivó `withStockLines` en TK-119).
* **Application:** `UpdateInsumoUseCase` depende solo de puertos (`IInsumoRepository`, `IStorageLocationRepository?`). Reutiliza `mapInsumoToOutputDTO` / `buildLocationNameMap` (sin duplicar el ensamblado del DTO). `execute` dividida en `assertNameFree` / `assertBarcodeFree` para no exceder complejidad 10.
* **Infra:** el `save()` del `PrismaStockRepository` ya hacía `upsert` con `update: { name, unitCost, barcode }` — el use case no necesitó tocar el repo. El `P2002` de barcode ya estaba manejado como red de seguridad.
* **Duplicación (`check_ticket_duplication.sh`):** la primera pasada detectó un clon nuevo entre `stock.controller.ts` y `stock.routes.ts` (el bloque de imports de casos de uso, que mi 7º import empujó sobre el umbral). Resuelto con un **barrel** `application/stock/use-cases/index.ts` — ambos archivos importan de un solo `from`. Clones 19 → **19**.
* **Complejidad (`check_ticket_code_quality.sh`):** verde tras extraer los asserts.
* **Código muerto:** verde. El barrel es consumido por 2 archivos; knip no lo marca.

## FASE 3 — Anti-Drift / Build

* **Contrato:** `PUT /stock/insumos/{id}` + `UpdateInsumoRequest` (`additionalProperties: false`, `minProperties: 1`, patrones alineados a `Decimal(12,2)` y ≤64). `oasdiff` → **sin breaking changes** (ruta y schema nuevos, aditivo). `check_contract_drift.sh` verde. Spectral 0 errores.
* **Build:** `pnpm run build` Done. Sin cambio de `schema.prisma` (los 3 campos ya existen).

## FASE 4 — Seguridad

* **RBAC:** `router.put('/insumos/:id', ...role('ADMIN'), ...)` — mismo guard que el alta (`US-036` §NFR). Test de `403` para `KITCHEN_STAFF`.
* **Sanitización:** `updateInsumoSchema` — `name` `min(1).max(120)`; `unitCost` regex `^\d{1,10}(\.\d{1,2})?$` (escala `Decimal(12,2)`, `backend_rules.md §3`); `barcode` `.trim().min(1).max(64)`; `.strict()` → una clave desconocida (`unitOfMeasure`) responde `400` (Escenario 2 de US-036), no se ignora en silencio.
* **Precisión:** `unitCost` como `DecimalQuantity`; `mapInsumoToOutputDTO` serializa a `.toFixed(2)`.
* **Integridad:** check-then-write de unicidad de `name` y `barcode` (excluyendo el propio `id`) + `P2002` como red de seguridad ante carrera.
* Sin secreto hardcodeado, sin `catch` vacío, sin dependencia nueva.

## FASE 5 — N/A (backend puro). `TK-130-FE` cubre la UI.

---

## 🚨 Defectos Detectados

Ninguno bloqueante.

* **O-1 (Info):** `updateInsumoUseCase` se inyecta como parámetro **opcional** (`?`) al `StockController` con un `throw new Error('...no configurado')` en el handler — `backend_rules.md §3` lo desaconseja, pero es el patrón **preexistente** de los otros 5 use cases de ese controller. Uniformidad > divergencia de un solo parámetro; el saneamiento del controller entero es un ticket aparte.
* **O-2 (Info):** cambiar `unitCost` no recalcula valorizaciones históricas — es la decisión de negocio explícita (US-036 §Decisiones: "afecta solo valorizaciones futuras").

## 🔁 Candidatos a Regla Permanente

Ninguno nuevo.

---

## ⚖️ VEREDICTO FINAL

**APROBADO PARA COMMIT**

`PUT /stock/insumos/:id` cierra la brecha de CRUD de mayor impacto (`AUDIT-DEV-012` C-1): un insumo creado sin `unitCost` — que `TK-128` acaba de hacer visible en la pantalla de rescate — ya se puede corregir. `unitOfMeasure` queda protegido por `.strict()`. Contrato aditivo, gates verdes, mutation ≥ 70.
