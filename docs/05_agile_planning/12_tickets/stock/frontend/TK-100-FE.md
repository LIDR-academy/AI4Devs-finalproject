---
document: technical_ticket
id: TK-100-FE
related_story: US-014 · AUDIT-DEV-006 F-5/F-6
points: 3
type: frontend
status: done
inputs:
  - docs/audits/AUDIT-DEV-006-warehouse-extraction-quality-report.md
  - docs/05_agile_planning/11_user_stories/stock/US-014.md
  - docs/02_architecture_design/05_ui_ux_design_system.md
---

# 🎟️ TK-100-FE: Propagación Real de Errores y Aritmética Decimal en la Pantalla de Extracción (Frontend)

> **Navegación del Framework SDD:**
> [⬅️ Volver a US-014 (11_user_stories/stock/US-014.md)](../../../11_user_stories/stock/US-014.md) | [📖 Índice de Tickets](../../indice_tickets.md) | [Matriz de Trazabilidad ➡️](../../../13_matriz_trazabilidad.md)

---

## 📝 Descripción
Cerrar dos defectos de `AUDIT-DEV-006` en la capa de UI/servicio de extracción de bodega:

* **F-5 (Media) — El fallback "modo demo" oculta errores del backend.** El `catch` de `StockService.recordExtraction` hace `console.error` y **retorna un éxito fabricado** (mutando `mockWarehouseStocks`, con `remanenteId` falso). Un `422` (stock insuficiente en el sub-sector) o un `500` se le muestra al operario como extracción **exitosa**, con un remanente inexistente añadido al tablero FEFO local. `mapToUserFriendlyError` del modal (`WarehouseExtractionModal.tsx:457`) nunca se ejecuta porque el error jamás se propaga. El mismo patrón contamina `getInsumos` y `useAvailableInsumos` (lista demo estática al fallar). Contradice el **Guard 38** (UX de error centralizada, sin fingir estado). **Decisión del humano (2026-09-03): eliminar el fallback por completo** — el frontend de un sistema de inventario no debe operar sin backend.
* **F-6 (Baja) — Aritmética de punto flotante sobre cantidad física (Guard 17).** `QuantityStepper` y `handleIncrement`/`handleDecrement` usan `parseFloat`, `prev + 0.5`, `Math.round(x*10)/10`. `parseFloat(e.target.value) || 0.5` convierte `0` y `NaN` en `0.5` en silencio.

*   **ID US Relacionada:** `US-014`
*   **Módulo / Vertical Slice:** `stock` (Bodega UI)
*   **Estimación (Story Points):** 3
*   **Prioridad MoSCoW:** Should Have
*   **Prioridad Backlog:** 🟡 P1 - Alta
*   **Prerrequisitos:** `TK-072-FE`, `TK-096-FE`

---

## 🔀 Alcance de Modificación (UI & Components)

### `stock.service.ts` (F-5)
*   `recordExtraction`: eliminar el `try/catch` que devuelve el objeto demo. La llamada `apiRequest` propaga su error (ya normalizado a RFC 7807 por `apiClient`) al llamador.
*   `getInsumos`: eliminar el `catch` que cae a `getAvailableInsumos()`. Propaga el error.
*   Eliminar `mockWarehouseStocks`, `getAvailableInsumos()` y `mockWarehouseStocks`-dependientes si quedan sin referencias (Guard 5 — sin código muerto). Verificar todos los call-sites con grep antes de borrar.
*   `ExtractionRequest` / `ExtractionResult`: `remanenteId` pasa a `string | null` en línea con `TK-099` (coordinar; si `TK-099` aún no mergea, mantener `string` y abrir nota).

### `WarehouseExtractionModal.tsx` (F-5 + F-6)
*   `useAvailableInsumos`: sin fallback a lista estática. Estados explícitos: cargando / error (con `ErrorBanner` + reintento) / vacío / lista. Si `getInsumos` falla, el formulario no se renderiza operable.
*   `performExtraction`: el error de `StockService.recordExtraction` ya sube — confirmar que `useExtractionForm.handleSubmit` lo captura y lo pasa por `mapToUserFriendlyError` → `ErrorBanner` (ese camino ya existe, `:455-458`; hoy está muerto).
*   `QuantityStepper` / `handleIncrement` / `handleDecrement` / `onQuantityChange`: migrar a `DecimalQuantity` de `shared/domain/DecimalQuantity` para el `+ 0.5` / `- 0.5` / clamp a `0.5`. El `<input type="number">` valida contra `NaN` sin silenciar `0` (un `0` explícito debe mostrar error de validación cliente, no autocorregirse a `0.5`).
*   Sin `style={{...}}` inline nuevos (Guard 29); reutilizar `WarehouseExtractionModal.module.css` / clases del sistema.

### Diseño (Guard 29)
*   Consumir exclusivamente tokens CSS (`var(--color-*)`, escalas `--space-*` / `--fs-*`). `ErrorBanner` ya está tematizado.

---

## ✅ Criterios de Aceptación & DoD
1. **Propagación de error (F-5):**
   *   Test de `WarehouseExtractionModal.test.tsx`: `StockService.recordExtraction` rechaza con un problema RFC 7807 (`422` stock insuficiente) → el modal muestra el `ErrorBanner` con el texto de `errorMessageMapper`, **no** llama `onSuccess`, **no** añade remanente local, **no** cierra.
   *   Test: `getInsumos` rechaza → el formulario muestra estado de error, no una lista de insumos demo.
   *   `grep` en `stock.service.ts`: ningún `catch` devuelve un objeto con forma de `ExtractionResult`/`InsumoItem[]`.
2. **Aritmética (F-6):** test de que incrementar 3 veces desde `1.0` da exactamente `2.5` (sin `2.4999…`); que escribir `0` marca error de validación y no `0.5`.
3. **Sin código muerto (Guard 5):** `check_dead_code` sin hallazgos nuevos; `mockWarehouseStocks` y helpers demo eliminados o justificados si aún referenciados.
4. **Accesibilidad (Guard 7):** el `ErrorBanner` es `role="alert"`/`aria-live`; objetivos táctiles del stepper ≥ 48px (regresión).
5. **Sin regresiones:** `pnpm test` (frontend) / `pnpm run build` / `pnpm run lint` verdes.
6. **Commit atómico:** `fix(stock): propagate real backend errors and use decimal arithmetic in warehouse extraction UI (TK-100-FE)`.

## 🧪 Plan de Pruebas
- Componente: error `422` → `ErrorBanner` visible, sin `onSuccess`; error de carga de insumos → estado de error; stepper decimal exacto; `0` → validación.
- Verificación en vivo (opcional, stack Docker): extraer más de lo disponible en un sub-sector → el operario ve "stock insuficiente", no un falso éxito.

## 📌 Notas
- Candidato a Regla Permanente **C-DEV-006-3** (un `catch` de servicio HTTP nunca sintetiza un éxito de mutación; fallback de solo-lectura solo tras `VITE_DEMO_MODE`) — ver `AUDIT-DEV-006` §Sistemicidad. Requiere HITL.
- Si se quiere conservar un modo demo para el pitch, es un ticket aparte que introduce `VITE_DEMO_MODE` como enmienda al stack manifest — **fuera de alcance** de TK-100-FE por decisión del humano.
