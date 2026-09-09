---
document: technical_ticket
id: TK-119-FE
related_story: US-032
points: 3
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/stock/US-032.md
  - docs/02_architecture_design/04_technical_design.md
---

# 🎟️ TK-119-FE: Escaneo de Código de Barras en Extracción de Bodega (Frontend)

> **Navegación del Framework SDD:**
> [⬅️ Volver a US-032 (11_user_stories/stock/US-032.md)](../../../11_user_stories/stock/US-032.md) | [📖 Índice de Tickets (12_indice_tickets.md)](../../indice_tickets.md) | [Siguiente: Matriz de Trazabilidad (13_matriz_trazabilidad.md) ➡️](../../../13_matriz_trazabilidad.md)

---

## ✅ Decisión de Stack Resuelta (Guard 24)
**`@zxing/browser@0.2.1`** (peer `@zxing/library@^0.23.0`, MIT), aprobada explícitamente por el humano el **2026-09-05** y declarada en `docs/00_stack_manifest.md` §4 (v1.13.0 → v1.14.0). Se eligió sobre `html5-qrcode` (capa extra sobre el mismo zxing) y sobre la `BarcodeDetector` nativa (sin soporte en Safari/iOS, obligaría a mantener 2 caminos de código). Decodifica vía `getUserMedia`+`canvas`, igual en Chrome, Safari y Firefox.

Se carga con **import dinámico** (`await import('@zxing/browser')` dentro de `createZxingBarcodeReader`): añade ~117KB gzip que quedan en un chunk aparte, descargado solo al abrir el escáner. Sin esto, el chunk principal pasaba de 135KB a 254KB gzip para TODOS los usuarios (medido con builds antes/después).

---

## 📝 Descripción
`WarehouseExtractionModal.tsx` solo permite seleccionar el insumo por nombre. Este ticket añade un modo de escaneo por cámara que consulta `GET /api/v1/stock/insumos/by-barcode/:barcode` (`TK-119`, ya implementado en backend) y preselecciona el insumo encontrado, sin reemplazar el selector manual existente.

*   **ID US Relacionada:** [`US-032`](../../../11_user_stories/stock/US-032.md)
*   **Módulo / Vertical Slice:** `stock` (Frontend UI)
*   **Estimación (Story Points):** 3
*   **Prioridad MoSCoW:** Should Have
*   **Prerrequisitos:** `TK-119` (API backend), decisión de librería (ver bloque de arriba)

---

## 🔀 Alcance de Modificación (Frontend Architecture)
*   **Componentes UI (`src/shared/components/`):** `BarcodeScannerButton.tsx` (nuevo, en `shared/` porque es reutilizable — el mismo patrón servirá para cualquier futuro punto de escaneo, no solo extracción). Renderiza un botón `.btn-touch` que abre un `<video>` con el feed de cámara (permiso `getUserMedia`) dentro de un `Modal` ya existente; al decodificar un código, invoca un callback `onScan(barcode: string)` y cierra el modal — el componente no sabe nada de insumos, solo emite el string decodificado.
*   **Integración (`src/features/stock/components/WarehouseExtractionModal.tsx`):** monta `<BarcodeScannerButton onScan={handleScan} />` junto al selector manual existente. `handleScan` (hook local `useBarcodeScan`) resuelve el match **de forma síncrona contra el catálogo ya cargado en memoria** por `useAvailableInsumos`:
    *   con match → preselecciona el insumo en el formulario, igual que si se hubiera elegido manualmente.
    *   sin match → `ErrorBanner` no bloqueante ("Código no encontrado — solicita a un Administrador que lo dé de alta"), el selector manual sigue disponible.
*   **API Service:** ninguno nuevo. `GET /stock/insumos` (`ListInsumosUseCase`) ya devuelve `barcode` por insumo — mismo `insumoOutputMapper` que el endpoint dedicado de `TK-119` — así que basta con propagar ese campo en el mapeo local de `useAvailableInsumos`. **Desviación deliberada respecto de la especificación original de este ticket** (que proponía llamar a `StockService.findInsumoByBarcode()` por cada escaneo): la revisión adversarial mostró que la segunda llamada de red introducía carreras de respuesta desordenada y `setState` sobre componente desmontado, y que además podía devolver un id ausente del catálogo ya renderizado (dejando el selector en un estado inconsistente). El endpoint backend `GET /insumos/by-barcode/:barcode` (`TK-119`) sigue existiendo, probado y disponible para futuros consumidores.
*   **Alta de Insumo con Barcode:** `CreateInsumoModal.tsx` gana un campo opcional "Código de barras" (`input-touch`), consumido por `StockService.createInsumo()` ya existente (solo extiende el payload).
*   **Componentes Reutilizados (sin duplicar):** `Modal.tsx`, `ErrorBanner.tsx` ya existentes.

---

## ⚠️ Mitigación de Riesgos Técnicos
1.  **Permiso de Cámara Denegado:** si `getUserMedia` rechaza el permiso, `BarcodeScannerButton` muestra un mensaje inline explicando que el escaneo requiere acceso a la cámara — nunca falla en silencio ni bloquea el resto del modal.
2.  **Cierre Limpio del Stream:** el componente DEBE detener todos los tracks de `MediaStream` (`track.stop()`) al cerrar el modal o desmontar — un stream de cámara sin liberar es una fuga de recursos real en un dispositivo táctil de uso continuo por turnos de 8h.
3.  **Fallback Siempre Disponible:** el selector manual de insumo nunca se oculta ni se deshabilita mientras el escaneo está activo — el escaneo es un atajo, no un reemplazo obligatorio.

---

## ✅ Criterios de Aceptación & DoD (Definition of Done)

### Criterio de Aceptación 1: Escaneo exitoso preselecciona el insumo
*   **Given** un operario con `WarehouseExtractionModal` abierto
*   **When** activa el escaneo y enfoca un código que existe en el catálogo
*   **Then** el insumo queda preseleccionado en el formulario sin que el operario tenga que buscarlo manualmente.

### DoD Estricto:
1.  **Tests RTL:** escaneo exitoso preselecciona insumo; código sin match muestra `ErrorBanner` sin bloquear el selector manual; cierre del modal detiene el `MediaStream` (mock de `getUserMedia`).
2.  **Complejidad:** gate ticket-scoped en verde.
3.  **A11y:** botón de escaneo `≥48px`, foco visible, anuncio por lector de pantalla del resultado del escaneo (`aria-live="polite"` en el banner de resultado).

---

## 🤖 Instrucciones de Ejecución Autónoma para Agente IA
1. **Fichas creadas/modificadas (representativas):**
   - `apps/frontend/src/shared/components/BarcodeScannerButton.tsx` (nuevo)
   - `apps/frontend/src/features/stock/components/WarehouseExtractionModal.tsx`
   - `apps/frontend/src/features/stock/components/CreateInsumoModal.tsx`
   - `apps/frontend/src/features/stock/services/stock.service.ts`
   - `docs/00_stack_manifest.md` (nueva librería declarada, tras aprobación humana)
2. **Ejecutar Suite de Pruebas Frontend:** `pnpm --filter @restostock/frontend run test`
3. **Comando de Verificación Total:** `pnpm --filter @restostock/frontend run build && pnpm --filter @restostock/frontend run lint`

---

## 📌 Deuda Registrada
Ninguna propia. Escaneo de lote/fecha de vencimiento vía código de barras (Roadmap §7.2 del PRD) queda fuera de alcance — este ticket solo resuelve identificación del insumo, no captura de lote.

**Anotado sin corregir (fuera de alcance, blast radius desproporcionado):** `Modal.tsx` no usa un portal de React, así que el modal del escáner se renderiza anidado dentro del `.modal-card` de `WarehouseExtractionModal` (que tiene `overflow-y: auto`). Se verificó leyendo el CSS real que **no es un defecto accionable hoy**: el único `transform` de `.modal-card` viene de su animación de montaje de 0.25s sin `fill-mode: forwards`, así que deja de ser containing-block para descendientes `position: fixed` mucho antes de que un usuario pueda abrir el escáner anidado. Si en el futuro aparece otro caso de modal-dentro-de-modal, o si se le añade un `transform`/`will-change` permanente a `.modal-card`, conviene migrar `Modal.tsx` a `createPortal` — cambio que afecta a ~10 modales y merece su propio ticket.
