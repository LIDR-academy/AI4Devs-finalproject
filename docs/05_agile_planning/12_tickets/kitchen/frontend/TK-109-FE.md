---
document: technical_ticket
id: TK-109-FE
related_story: US-008
points: 3
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/kitchen/US-008.md
  - docs/02_architecture_design/adr/ADR-004-consumption-reason-catalog.md
---

# 🎟️ TK-109-FE: Selector de Motivo por Línea en el Cierre de Turno (Frontend)

> [⬅️ US-008](../../../11_user_stories/kitchen/US-008.md) | [📖 Índice](../../indice_tickets.md)

## 📝 Descripción
`ShiftReconciliationWizard`: cuando una línea del conteo físico da una varianza negativa (`diff < 0`), muestra un selector de motivo (catálogo `TK-107-FE`) inline en esa fila; obligatorio para poder enviar el cierre.

*   **US:** `US-008` v1.1.0 · **Slice:** `kitchen` UI · **SP:** 3 · **MoSCoW:** Should Have · **Prioridad:** 🟡 P1
*   **Prerrequisitos:** `TK-109`, `TK-107-FE`

## 🔀 Alcance (UI)
*   `reconciliation.service.ts`: `items[].reasonId` opcional en el payload (obligatorio solo si hay varianza negativa, validado en cliente antes de enviar).
*   `ShiftReconciliationWizard.tsx`: `ReconciliationItemRow` — si `diff < 0`, selector de motivo inline; `canSubmit` pasa a exigir motivo en todas las líneas con varianza negativa (además de la autorización de varianza crítica ya existente).
*   Guard 29 / Guard 38.

## ✅ DoD
1. Test de componente: línea con varianza negativa sin motivo bloquea el envío; con motivo, lo incluye en el payload; varianza positiva no pide nada.
2. Sin regresiones frontend; sin código muerto / estilos inline nuevos.
3. **Commit:** `feat(kitchen): reason selector on negative reconciliation variance rows (TK-109-FE)`.

## 📌 Notas de implementación
*   **`useActiveConsumptionReasons` extraído a `shared/hooks/`:** el hook de carga del catálogo activo (`ConsumeReasonModal`, `TK-108-FE`) se generalizó para reutilizarse aquí — evita duplicar el mismo `useEffect`/`useState` dos veces.
*   **`ConsumptionReasonSelect` extraído a `shared/components/`:** jscpd marcó como clon nuevo el `<select>` + `<option>` map entre `ConsumeReasonModal` y este ticket — se extrajo el `<select>` en sí (sin `<label>` propio, cada consumidor pone el suyo con texto distinto) a un componente compartido, con `className` configurable para que el compacto del wizard (`input-touch input-touch-compact`) y el normal del modal de consumo (`input-touch`) convivan.
*   **`canSubmit` extendido, no reemplazado:** `(!hasCriticalVariance || isCriticalAuthChecked) && !hasMissingReason` — autorizar la varianza crítica y elegir motivo son dos bloqueos independientes; el test cubre explícitamente que autorizar la crítica sin elegir motivo sigue bloqueado.
*   **`useShiftReconciliationForm` refactorizado para no superar `max-lines-per-function` (60):** al sumar `reasonIds`/`handleReasonChange`/`hasMissingReason` la función superó el límite — se extrajeron `initialCounts`, `computeVarianceFlags` y `buildItemsPayload` como funciones puras fuera del hook.
*   **Tests existentes de `ShiftReconciliationWizard.test.tsx` actualizados:** el escenario de varianza crítica (>50%) del conteo físico usado en el fixture es también varianza negativa — el test de "autorizar y habilitar envío" ahora también elige un motivo antes de esperar el botón habilitado; se añadieron 3 tests nuevos (varianza negativa no crítica también bloquea, varianza positiva no muestra el selector, el payload enviado incluye `reasonId`).
*   DoD #1 cubierto: sin motivo en línea negativa bloquea (botón `disabled`, sin `ErrorBanner` — mismo patrón que la autorización de varianza crítica ya existente, un botón deshabilitado, no un popup); con motivo, el payload lo incluye; varianza positiva no muestra el selector ni lo exige.
