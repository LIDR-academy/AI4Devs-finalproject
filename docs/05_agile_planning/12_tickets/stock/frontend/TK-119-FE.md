---
document: technical_ticket
id: TK-119-FE
related_story: US-032
points: 3
type: frontend
status: approved
inputs:
  - docs/05_agile_planning/11_user_stories/stock/US-032.md
  - docs/02_architecture_design/04_technical_design.md
---

# 🎟️ TK-119-FE: Escaneo de Código de Barras en Extracción de Bodega (Frontend)

> **Navegación del Framework SDD:**
> [⬅️ Volver a US-032 (11_user_stories/stock/US-032.md)](../../../11_user_stories/stock/US-032.md) | [📖 Índice de Tickets (12_indice_tickets.md)](../../indice_tickets.md) | [Siguiente: Matriz de Trazabilidad (13_matriz_trazabilidad.md) ➡️](../../../13_matriz_trazabilidad.md)

---

## ⚠️ Decisión de Stack Pendiente (Guard 24 — bloqueante antes de codificar)
Este ticket requiere una librería de decodificación de código de barras vía cámara del navegador (`getUserMedia` + un decoder JS, ej. `@zxing/browser` o `html5-qrcode`). **Ninguna está aún declarada en `docs/00_stack_manifest.md`.** Antes de escribir código, el agente que implemente este ticket DEBE preguntar explícitamente al humano cuál usar (o confirmar una de las 2 sugeridas) y registrarla en el manifiesto — nunca asumirla en silencio. Este ticket especifica el comportamiento esperado, no la librería.

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
*   **Integración (`src/features/stock/components/WarehouseExtractionModal.tsx`):** monta `<BarcodeScannerButton onScan={handleScan} />` junto al selector manual existente. `handleScan` llama a `StockService.findInsumoByBarcode(barcode)`:
    *   `200` → preselecciona el insumo en el formulario, igual que si se hubiera elegido manualmente.
    *   `404` → `ErrorBanner` no bloqueante ("Código no encontrado — solicita a un Administrador que lo dé de alta"), el selector manual sigue disponible.
*   **API Service:** `StockService.findInsumoByBarcode()` nuevo en `stock.service.ts`.
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
