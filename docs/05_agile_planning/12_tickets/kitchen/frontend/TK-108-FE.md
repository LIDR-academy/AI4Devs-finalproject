---
document: technical_ticket
id: TK-108-FE
related_story: US-004
points: 3
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/kitchen/US-004.md
  - docs/02_architecture_design/adr/ADR-004-consumption-reason-catalog.md
---

# 🎟️ TK-108-FE: Modal de Motivo al Consumir un Remanente (Frontend)

> [⬅️ US-004](../../../11_user_stories/kitchen/US-004.md) | [📖 Índice](../../indice_tickets.md)

## 📝 Descripción
Hoy `ActiveRemanentesList` consume con un solo toque (`onConsume(id, qty)` directo, sin confirmación). Pasa a abrir un modal liviano — mismo patrón que `DiscardModal` — con la cantidad ya elegida, un selector de motivo (catálogo `TK-107-FE`) y un texto libre opcional, antes de confirmar.

*   **US:** `US-004` v1.1.0 · **Slice:** `kitchen` UI · **SP:** 3 · **MoSCoW:** Should Have · **Prioridad:** 🟡 P1
*   **Prerrequisitos:** `TK-108`, `TK-107-FE`

## 🔀 Alcance (UI)
*   `kitchen.service.ts.consumeRemanente`: gana `reasonId` (obligatorio) + `notes?`.
*   Nuevo `ConsumeReasonModal.tsx` — recibe `{remanenteId, quantity}`, carga motivos activos, selector + texto libre opcional, confirmar/cancelar.
*   `ActiveRemanentesList` / `InventarioRoute`: los botones rápidos de cantidad abren el modal en vez de llamar `onConsume` directo.
*   Guard 29 / Guard 38.

## ✅ DoD
1. Test de componente: sin motivo elegido, el submit se bloquea (ErrorBanner, no popup nativo); con motivo, envía `reasonId` + `notes` correctamente.
2. Sin regresiones frontend; sin código muerto / estilos inline nuevos.
3. **Commit:** `feat(kitchen): reason modal on remanente consumption (TK-108-FE)`.

## 📌 Notas de implementación
*   **`ActiveRemanentesList.onConsume` → `onRequestConsume`:** los 3 botones rápidos de cantidad (`-0.25`/`-0.5`/`-1.0` o su equivalente discreto) ya no llaman `KitchenService.consumeRemanente` directo — llaman `onRequestConsume(item, qty)`, que en `InventarioRoute` solo abre `ConsumeReasonModal` con `{remanente: item, quantity: qty}` (mismo patrón que `onDiscard(item)` → `discardTarget`). El propio modal es quien llama al servicio, igual que `DiscardModal`.
*   **`consumeValidationError` sin `required` nativo (Guard 38):** mismo patrón que `extractionValidationError` de `WarehouseExtractionModal` — sin motivo elegido, el submit se bloquea con `ErrorBanner`, nunca con el popup de validación del navegador.
*   **`ConsumptionReasonsService.list()` reutilizado tal cual de `TK-107-FE`:** sin `includeInactive`, así que solo trae motivos activos — correcto para el selector de consumo (cualquier autenticado, no solo `ADMIN`).
*   **`kitchen.service.ts.consumeRemanente` mantiene su fallback offline preexistente** (captura el error de red/backend y actualiza un mock local en memoria) — deuda ya documentada (`C-DEV-006-3`), fuera de alcance de este ticket; el modal solo ve el `catch` cuando la promesa realmente rechaza.
*   DoD #1 cubierto con 3 tests de componente: sin motivo → bloqueado con `ErrorBanner`, sin `POST` al backend, `<select>` sin `required`; con motivo → `POST` con `reasonId`+`notes` correctos; `target=null` no renderiza nada.
