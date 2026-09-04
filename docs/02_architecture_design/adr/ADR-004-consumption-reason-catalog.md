# ADR-004: Catálogo de Motivos de Consumo (Consumo Manual y Varianza de Conciliación)

- **ID:** ADR-004
- **Título:** Catálogo de Motivos de Consumo, configurable por Administrador
- **Estado:** Accepted — decisiones de negocio confirmadas por el humano (2026-09-04)
- **Fecha:** 2026-09-04
- **Autor:** Claude (AI Pair Programmer); decisiones de negocio consultadas con el humano

---

## 1. Contexto (Context)

El principio de producto es explícito: *"la idea general de la app es tener un control sobre el ingrediente desde que entra hasta que es consumido o descartado en su totalidad, con el fin de mitigar la incertidumbre o pérdida de un insumo."*

Un relevamiento de todos los flujos que mutan un `Remanente` mostró que la mayoría ya cumple ese principio (`DiscardRemanenteUseCase` exige `reason`; `RecipePreparationItem` exige `wasteReason` si hay merma; la extracción con `purpose=DIRECT_DISCARD` exige `reason`), pero **dos huecos reales**:

1. **`POST /kitchen/remanentes/:id/consume`** (`ConsumeRemanenteUseCase`, US-004) — el consumo manual más usado del día a día en cocina. El payload es literalmente `{ quantity }`: no registra *para qué* se consumió, ni motivo, ni vínculo con receta/plato. Es la vía de consumo menos trazable de toda la app.
2. **`PerformShiftReconciliationUseCase`** (US-008) — cuando el conteo físico de cierre de turno da **menos** que lo esperado, el sistema ajusta el remanente en silencio (`SHIFT_RECONCILIATION_VARIANCE`), sin preguntar por qué. Es justo el punto donde la "incertidumbre o pérdida" del principio de producto se materializa, y hoy no se audita.

De paso se encontró un bug de correctitud en el mismo caso de uso: cuando el conteo físico da **más** que lo esperado (superávit), el código calcula la varianza para el reporte pero nunca actualiza `Remanente.currentQuantity` — el remanente queda desincronizado del conteo físico que el operario acaba de confirmar.

---

## 2. Decisiones de negocio consultadas con el humano (Guard 28)

| # | Decisión | Resolución |
| :-- | :-- | :-- |
| 1 | Forma del motivo en `consume` | **Estructurado** (catálogo) **+ texto libre**, ambos en el mismo evento. |
| 2 | ¿Quién administra el catálogo? | El **Administrador**, vía CRUD dedicado (crear, editar etiqueta, activar/desactivar) — mismo patrón que la gestión de roles (US-015). |
| 3 | ¿El texto libre es obligatorio? | **No, siempre opcional.** El motivo estructurado ya cubre la trazabilidad mínima; el texto es aclaración adicional. |
| 4 | Varianza negativa en conciliación de turno | **Exige motivo por línea**, del mismo catálogo que `consume` — cierra el hueco de "pérdida silenciosa" en el cierre de turno. |
| 5 | Varianza positiva (superávit) | No exige motivo (no es una pérdida) — solo se corrige el bug: el remanente debe reflejar el conteo físico real. |
| 6 | Alcance del catálogo | **Solo `consume` y la varianza de conciliación**, por ahora. Los descartes existentes (bodega, cocina, merma de preparación) siguen con texto libre — no se tocan. |
| 7 | ¿Arranca vacío o con semilla? | **Semilla editable**: motivos típicos precargados (`Preparación de plato`, `Degustación / prueba`, `Cortesía a cliente`, `Error de manipulación`, `Otro`), que el admin puede editar, desactivar o ampliar. |

---

## 3. Decisión (Design)

### 3.1 Nueva entidad `ConsumptionReason`
Catálogo simple: `id`, `label`, `isActive` (default `true`), `createdAt`/`updatedAt`. Sin jerarquía ni categorías en v1. **Desactivar, nunca borrar** — un motivo ya usado en un movimiento histórico no puede desaparecer (rompería la trazabilidad que se busca); `isActive = false` lo saca del selector sin afectar el pasado.

### 3.2 `StockMovement` gana `reasonId` (FK opcional, `onDelete: SetNull`)
Además del `reason` (texto libre) que ya existe — ahora usado también para las notas opcionales de `consume`/varianza, no solo para descartes. `reasonId` es la referencia estructurada y queryable; `reason` es la aclaración humana. Ambos son opcionales a nivel de columna (movimientos históricos y de otros tipos no los tienen), pero la **capa de aplicación** los exige donde corresponde (§3.3/§3.4).

### 3.3 `ConsumeRemanenteUseCase` (US-004)
`reasonId` pasa a ser **obligatorio**; `notes` (texto libre) opcional. Valida que el motivo exista y esté activo (`EntityNotFoundException` / nueva `InactiveConsumptionReasonException`, ambas RFC 7807). El `StockMovement` `CONSUMPTION` queda con `reasonId` + `reason` (= `notes`).

### 3.4 `PerformShiftReconciliationUseCase` (US-008)
- Por cada línea con varianza **negativa** (`physicalQuantity < theoreticalQuantity`), el input exige `reasonId`; si falta, `ConsumptionReasonRequiredException` (400) y **no se cierra nada** de esa línea (falla explícita, no un ajuste silencioso a medias).
- Por cada línea con varianza **positiva** (`physicalQuantity > theoreticalQuantity`), se corrige el bug: `Remanente.increaseQuantity(delta)` (nuevo método de dominio) sincroniza `currentQuantity` con el conteo físico real. Sin motivo — no es una pérdida.
- El `StockMovement` `SHIFT_RECONCILIATION_VARIANCE` de una línea negativa queda con `reasonId` + `reason` (notas opcionales).

### 3.5 Endpoints nuevos (`kitchen` / catálogo)
- `GET /api/v1/consumption-reasons` — lista los motivos **activos** (cualquier autenticado); `?includeInactive=true` solo `ADMIN`.
- `POST /api/v1/consumption-reasons` — crea (`ADMIN`).
- `PUT /api/v1/consumption-reasons/:id` — edita `label`/`isActive` (`ADMIN`).

---

## 4. Consecuencias (Consequences)

### Positivas
- Cierra el hueco de trazabilidad más transitado de la app (el consumo manual) y el punto exacto donde hoy se pierde inventario sin explicación (varianza de cierre de turno).
- El catálogo administrable evita motivos en texto libre inconsistentes ("se usó", "consumo", "uso normal"...) que no sirven para analítica.
- El bug de superávit no aplicado se corrige de paso, en el mismo caso de uso que ya se está tocando.

### Negativas / costos
- Fricción adicional en la acción más frecuente de la pantalla de cocina (`consume`, hoy de un solo toque) — mitigada con un modal liviano de motivo (selector + texto opcional), mismo patrón ya usado en `DiscardModal`.
- Un movimiento `CONSUMPTION` o `SHIFT_RECONCILIATION_VARIANCE` histórico (anterior a esta migración) no tiene `reasonId` — es una limitación aceptada, no se backfillea retroactivamente (no hay forma de inferir el motivo real de datos ya perdidos).

---

## 5. Plan de cascada de spec

1. **US-030** (nueva) — Catálogo de Motivos de Consumo, gestión por Administrador.
2. **US-004** (amendada) — el consumo manual exige motivo estructurado + texto libre opcional.
3. **US-008** (amendada) — la varianza negativa de conciliación exige motivo; corrección del bug de superávit.
4. Tickets: `TK-107`/`TK-107-FE` (catálogo + admin UI), `TK-108`/`TK-108-FE` (`consume` + modal de motivo), `TK-109`/`TK-109-FE` (conciliación de turno: motivo en varianza negativa + fix de superávit).
