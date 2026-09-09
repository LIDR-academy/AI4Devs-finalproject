---
document: architecture_decision_record
id: ADR-003
version: 1.1.0
status: accepted
date: 2026-09-04
---

# ADR-003: Trazabilidad de Preparación de Recetas (Apertura, Cierre, Sobrante y Merma)

- **ID:** ADR-003
- **Título:** Trazabilidad de Preparación de Recetas
- **Estado:** `Accepted` — cascada de spec ejecutada y épica cerrada (2026-09-06)
- **Fecha:** 2026-09-04
- **Autor:** Claude (AI Pair Programmer); decisiones de negocio consultadas con el humano
- **Implementado por:** `US-026`→[`TK-102`](../../05_agile_planning/12_tickets/stock/backend/TK-102.md)/`TK-102-FE`/`TK-112-FE`, `US-027`→[`TK-103`](../../05_agile_planning/12_tickets/kitchen/backend/TK-103.md)/`TK-103-FE`, `US-028`→[`TK-104`](../../05_agile_planning/12_tickets/kitchen/backend/TK-104.md)/`TK-104-FE`, `US-029`→[`TK-105`](../../05_agile_planning/12_tickets/reports/backend/TK-105.md)/`TK-105-FE` — las 4 historias y los 9 tickets en `done`.

---

## 1. Contexto (Context)

Hoy la **extracción de bodega** con `purpose = 'RECIPE'` ([`RecordExtractionUseCase`](../../../apps/backend/src/application/stock/use-cases/RecordExtractionUseCase.ts)) y el **consumo de receta** ([`ConsumeRecipeUseCase`](../../../apps/backend/src/application/kitchen/use-cases/ConsumeRecipeUseCase.ts), `POST /kitchen/recipes/:id/consume`) son flujos **desacoplados**:

- La extracción crea un `Remanente` genérico, **sin vínculo** con la receta ni con el operario más allá del `StockMovement` `EXTRACTION_RECIPE`.
- `ConsumeRecipeUseCase` descuenta por cascada FEFO sobre **todos** los remanentes activos del ingrediente — no sabe cuál se extrajo para qué — y **no registra ningún `StockMovement`**.
- No existe: confirmación de "la receta se preparó", declaración de sobrante, registro de **dónde quedó físicamente** ese sobrante, ni merma de preparación con motivo.
- Los descartes de preparación **no notifican** a nadie (solo alimentan reportes).

Un análisis de dominio con el humano (2026-09-04) identificó este lazo abierto como una brecha de **trazabilidad e inocuidad**. El humano añadió explícitamente el requisito: *"¿qué pasó con lo que sobró, dónde se guardó, en qué área de la cocina o bodega?"*.

---

## 2. Decisiones de negocio consultadas con el humano (Guard 28)

| # | Decisión | Resolución |
| :-- | :-- | :-- |
| 1 | Modelo de deducción de stock | **Conciliación** (1 fase + cierre). La extracción debita y crea remanentes YA; el cierre concilia. **No reabre** el débito atómico de `TK-098`. |
| 2 | Áreas de cocina | Pasan a ser filas de `StorageLocation` con `type = KITCHEN` (completa la deuda de `TK-074-FE`). |
| 3 | ¿Sobrante puede volver a bodega? | **Solo si el remanente está "intacto"** (ver #6). Si no → queda en un área de cocina o se descarta. |
| 4 | ¿Cuándo se abre la preparación? | **Automática** al confirmar una extracción `purpose = RECIPE`. `recipeId` pasa a ser **obligatorio** en ese modo (hoy es opcional). |
| 5 | Consumo real por ingrediente | **Asumido = teórico** (`cantidad de receta × porciones reales`). El operario declara solo **sobrante** y **merma**; `consumido = extraído − sobrante − merma`. |
| 6 | "Intacto / sin manipular" | **Ambas condiciones**: cero consumo registrado contra ese remanente (`currentQuantity == initialQuantity`) **Y** el operario marca "envase sin abrir" al cerrar. |
| 7 | ¿Cierre obligatorio? | **Opcional.** Una preparación que queda `OPEN` al cierre de turno la absorbe la conciliación de turno (US-008) por conteo físico. |
| 8 | ¿Quién puede cerrar? | Cualquier `KITCHEN_STAFF` o `ADMIN` (no solo quien abrió). Se registra `closedByOperatorId`. |
| 9 | Cuadre `extraído = consumido + sobrante + merma` | **Exacto** (aritmética Decimal, Guard 17). |
| 10 | Reloj FEFO del sobrante al reubicarlo | **Se conserva** el vencimiento original (el frío no "renueva" un insumo abierto). |
| 11 | Distinción solicitante / preparador | **Un solo actor** en v1 (`openedByOperatorId` = extractor, `closedByOperatorId` = quien cierra). |
| 12 | Notificación de mermas sobre umbral | **Fuera de v1** — se cubre por reporte (US-028, diferible). |
| 13 | `actualPortions` vs `plannedPortions` | Se registran **ambas**, sin regla de bloqueo por diferencia. |

---

## 3. Decisión (Design)

### 3.1 Nuevo agregado `RecipePreparation`

```
RecipePreparation
  id                    uuid
  recipeId              uuid  (FK Recipe)
  plannedPortions       int
  actualPortions        int?          -- al cerrar
  status                OPEN | CLOSED | ABANDONED
  openedByOperatorId    uuid  (FK User)
  openedAt              datetime (UTC)
  closedByOperatorId    uuid?
  closedAt              datetime?
  notes                 string?

RecipePreparationItem            -- materializado al cerrar (uno por ingrediente extraído)
  id                    uuid
  preparationId         uuid
  insumoId              uuid
  extractedQty          Decimal(12,4)
  consumedQty           Decimal(12,4)   -- calculado = extractedQty − leftoverQty − wastedQty
  leftoverQty           Decimal(12,4)
  leftoverLocationId    uuid?           -- StorageLocation (KITCHEN, o WAREHOUSE si "intacto")
  leftoverRemanenteId   uuid?           -- el Remanente que queda ACTIVE con el sobrante
  wastedQty             Decimal(12,4)
  wasteReason           string?         -- obligatorio si wastedQty > 0
```

### 3.2 Cambios en entidades existentes

- **`Remanente`:**
  - `+ recipePreparationId uuid?` — se setea al extraer con `purpose = RECIPE`; se **libera** (→ `null`) al cerrar la preparación, devolviendo el remanente al pool FEFO compartido.
  - `location: String` → `storageLocationId uuid` (FK a `StorageLocation` `type = KITCHEN`). **Migración de datos**: literales `KITCHEN_FRIDGE / KITCHEN_PREP / KITCHEN_LINE` → filas semilla de `StorageLocation`.
  - `+ isPristine Boolean @default(true)` — pasa a `false` en el primer `consumeQuantity`. Junto con el marcado manual del operario (#6), habilita "devolver a bodega".
- **`StorageLocation`:** se empiezan a administrar filas `type = KITCHEN` (el modelo ya lo permite — US-016 — hoy sin uso).

### 3.3 Nuevos tipos de `StockMovement`

| Tipo | Cuándo |
| :-- | :-- |
| `EXTRACTION_RECIPE` *(ya existe)* | ahora también referencia `recipePreparationId` |
| `CONSUMPTION_RECIPE` | consumo real conciliado al cerrar — hoy el consumo de receta **no registra nada** |
| `DISCARD_RECIPE_PREP` | merma de preparación, con motivo |
| `RETURN_TO_WAREHOUSE` | sobrante **intacto** reingresado a un sub-sector de bodega → re-incrementa `WarehouseStock` |
| `TRANSFER_KITCHEN` | sobrante que queda en un área de cocina distinta a la de extracción |

### 3.4 Nuevos endpoints (`kitchen`)

- `GET  /api/v1/kitchen/recipe-preparations?status=OPEN` — tablero "preparaciones en curso".
- `GET  /api/v1/kitchen/recipe-preparations/:id` — detalle.
- `POST /api/v1/kitchen/recipe-preparations/:id/close` — `{ actualPortions, items: [{ insumoId, leftoverQty, leftoverLocationId?, markedUnopened?, wastedQty, wasteReason? }] }`.
- `POST /api/v1/kitchen/recipe-preparations/:id/abandon` — cierra sin conciliar; remanentes quedan `ACTIVE` y pierden el tag de preparación.
- La **apertura no tiene endpoint propio**: ocurre dentro de `RecordExtractionUseCase` cuando `purpose = RECIPE`.

### 3.5 Atomicidad del cierre

`POST /close` muta varios agregados (varios `Remanente` + `RecipePreparation` + `RecipePreparationItem[]` + `StockMovement[]` + potencial `WarehouseStock`). **DEBE** ejecutarse dentro de una única frontera transaccional inyectada (`IUnitOfWork` / `withTransaction`), conforme a **C-DEV-006-1** (`backend_rules.md §4`). Reusa la infraestructura `IStockUnitOfWork` introducida en `TK-098`.

---

## 4. Consecuencias (Consequences)

### Positivas
- Trazabilidad completa: cada extracción para receta se sigue hasta consumo / sobrante / merma, con operario y ubicación física.
- El consumo de receta pasa a dejar `StockMovement` (hoy invisible en la auditoría).
- Áreas de cocina administrables — cierra deuda de `TK-074-FE`.
- Base para el reporte de merma de preparación (US-028) y el KPI de eficiencia FEFO.

### Negativas / costos
- **Migración Prisma grande**: `Remanente.location` `String` → FK + backfill a filas semilla `StorageLocation`. Requiere **aprobación humana del archivo de migración** (AGENTS §3).
- Paso operativo nuevo (cerrar preparación) — mitigado: es opcional (#7) y el consumo es asumido, no declarado (#5) ⇒ el cierre son ~3 campos por ingrediente.
- `ConsumeRecipeUseCase` / `POST /kitchen/recipes/:id/consume` **se conserva** (decisión del humano, opción B) para **consumo ad-hoc**: usar una receta contra ingredientes que ya estaban abiertos en cocina, sin extracción ni preparación previa. Queda como camino secundario. **Deuda a cerrar en el mismo alcance:** hoy ese use case **no registra ningún `StockMovement`** — debe pasar a emitir `CONSUMPTION_RECIPE` por cada remanente afectado y ejecutarse dentro de una frontera transaccional (C-DEV-006-1), igual que el cierre de preparación.
- Depende de: `TK-074-FE` (áreas de cocina), `TK-101` (`fromStorageLocationId` en movimientos).

---

## 5. Alternativas descartadas

- **Modelo de reserva (2 fases)** — descartado (#1): reabre el débito atómico recién blindado en `TK-098` y añade fricción operativa.
- **Sobrante siempre libre de volver a bodega** — descartado (#3): inocuidad.
- **Consumo declarado explícito por ingrediente** — descartado (#5): fricción; se prefiere asumido + declaración solo de las excepciones.

---

## 6. Cascada de spec — ejecutada y cerrada (2026-09-06)

1. **PRD** (`02_prd.md`): flujo alternativo "Preparación de recetas". ✅
2. **User Stories** (las 4 en `done`):

   | US | Alcance | Tickets |
   | :-- | :-- | :-- |
   | `US-026` | Áreas de cocina como `StorageLocation` (`type = KITCHEN`) + destino dinámico en extracción *(prerrequisito — cerró la deuda de `TK-074-FE`)* | `TK-102`, `TK-102-FE`, `TK-112-FE` |
   | `US-027` | Apertura automática de preparación al extraer para receta (`recipeId` obligatorio, remanentes etiquetados) | `TK-103`, `TK-103-FE` |
   | `US-028` | Cierre de preparación: porciones reales + sobrante (cantidad + ubicación) + merma (cantidad + motivo) + regla "intacto" para devolución a bodega | `TK-104`, `TK-104-FE` |
   | `US-029` | Reporte de mermas de preparación; `ConsumeRecipeUseCase` legacy emite `CONSUMPTION_RECIPE` | `TK-105`, `TK-105-FE` |

3. `03_domain_model.md`, `schema.prisma`, `openapi.yaml`, `07_api_specification.md` actualizados. ✅
4. Tickets (9, todos `done`), matriz de trazabilidad y backlog map actualizados. ✅

> Nota de auditoría (2026-09-09): este ADR figuró como `Proposed — pendiente de aprobación` hasta esta fecha, cuando la épica llevaba cerrada desde el 2026-09-06. Misma clase de deriva de estado que el saneamiento retroactivo de `indice_tickets.md`; corregida contra la evidencia real (`status` de las 4 US y de los 9 tickets).
