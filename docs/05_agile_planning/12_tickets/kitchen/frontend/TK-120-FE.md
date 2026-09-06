---
document: technical_ticket
id: TK-120-FE
related_story: US-033
points: 3
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/kitchen/US-033.md
  - docs/02_architecture_design/04_technical_design.md
---

# 🎟️ TK-120-FE: Registro de Temperatura de Refrigeración al Iniciar Turno (Frontend)

> **Navegación del Framework SDD:**
> [⬅️ Volver a US-033 (11_user_stories/kitchen/US-033.md)](../../../11_user_stories/kitchen/US-033.md) | [📖 Índice de Tickets (12_indice_tickets.md)](../../indice_tickets.md) | [Siguiente: Matriz de Trazabilidad (13_matriz_trazabilidad.md) ➡️](../../../13_matriz_trazabilidad.md)

---

## 📝 Descripción
Consume `POST /api/v1/kitchen/temperature-logs` y `GET /api/v1/kitchen/temperature-logs` (`TK-120`, backend ya implementado). Añade un panel de registro accesible desde el tablero de Inventario (no bloquea el acceso — es informativo/voluntario al iniciar turno, nunca un paso obligatorio que impida entrar al tablero) y un panel de histórico solo-`ADMIN` bajo Reportes.

*   **ID US Relacionada:** [`US-033`](../../../11_user_stories/kitchen/US-033.md)
*   **Módulo / Vertical Slice:** `kitchen` (Frontend UI)
*   **Estimación (Story Points):** 3
*   **Prioridad MoSCoW:** Could Have
*   **Prerrequisitos:** `TK-120` (API backend)

---

## 🔀 Alcance de Modificación (Frontend Architecture)
*   **Componentes UI (`src/features/kitchen/components/`):** `TemperatureLogModal.tsx` (nuevo) — mismo patrón compositivo que `WarehouseExtractionModal.tsx` (`Modal`/`ModalHeader`/`ModalFooterActions` + hook `useTemperatureLogForm`). Campos: `<select>` de `StorageLocation` (reutiliza `StorageSectorSelect` ya existente de `US-025`), `<select>` `REFRIGERATOR`/`FREEZER`, `<input type="number">` para la temperatura. Al confirmar con un valor fuera de rango, la respuesta `201` con `isWithinSafeRange: false` se muestra como una confirmación con acento de advertencia (`--color-warning`), nunca como un error — el registro sí se creó.
*   **Punto de Entrada:** botón secundario "Registrar Temperatura" en el panel `Acciones` del tablero (`InventarioRoute`), junto a `Extraer de Bodega`/`Preparar Receta` — mismo nivel jerárquico, sin ser obligatorio ni bloquear el resto del tablero.
*   **Reporte Histórico (`src/features/reports/components/`):** `TemperatureLogReportPanel.tsx` (nuevo), montado en `/reportes` (solo `ADMIN`, ya gateado por `ProtectedRoute` de esa ruta) — tabla `.data-table` con fecha, sub-sector, tipo, valor, y una columna de estado (`UrgencyChip`-like pero binario: dentro/fuera de rango, con marca + texto, WCAG 1.4.1).
*   **API Service:** `KitchenService.recordTemperatureLog()` y `KitchenService.fetchTemperatureLogs()`. **Ambos en `kitchen.service.ts`, no en `reports.service.ts`** como sugería el borrador de este ticket: los dos golpean `/api/v1/kitchen/temperature-logs` y comparten el mismo DTO — partirlos entre dos services habría duplicado `TemperatureLogItem`. El panel de reportes importa `KitchenService` (mismo patrón cross-feature que ya usa `WarehouseExtractionModal` con `KitchenService`).
*   **Componentes Reutilizados (sin duplicar):** `Modal.tsx`, `ModalHeader.tsx`, `ModalFooterActions.tsx`, `ErrorBanner.tsx`, `StorageSectorSelect.tsx`, `.data-table`.
*   **Extensiones a componentes compartidos (en vez de crear casi-duplicados):**
    *   `SuccessFeedbackBanner` gana `variant?: 'success' | 'warning'` — mismo criterio con el que en su día se añadieron `size` a `Modal`, `compact` a `ErrorBanner` y `danger` a `ModalHeader`.
    *   `ActionButton` gana la variante `temperature` (verde `--color-success`; `--color-info` es alias intencional de `--color-primary` y habría quedado idéntica a `add`), con su contorno de tiza en turno noche.
    *   **`useAsyncData` (nuevo, `shared/hooks/`)**: el gate de duplicación bloqueó el ticket al detectar que el bloque *loading/error/guarda-de-cancelación* del panel nuevo era idéntico al de `PreparationWasteReportPanel`. Se extrajo a un hook compartido y **se migró también el panel existente** — si no, la duplicación seguiría viva, solo que concentrada. El error siempre pasa por `mapToUserFriendlyError` (Guard 38).

---

## ⚠️ Mitigación de Riesgos Técnicos
1.  **No Bloquear el Tablero:** el botón "Registrar Temperatura" es una acción más del panel `Acciones`, nunca un modal que se auto-abre o un gate que impida ver el resto de `InventarioRoute` — consistente con la decisión de negocio de "solo advierte, nunca bloquea".
2.  **Estado Fuera de Rango No Es un Error de UI:** el banner de confirmación con `isWithinSafeRange: false` usa `--color-warning`, nunca `--color-danger`/`ErrorBanner` — la operación fue exitosa, el dato es lo que amerita atención.

---

## ✅ Criterios de Aceptación & DoD (Definition of Done)

### Criterio de Aceptación 1: Registro visible con advertencia, sin bloquear el flujo
*   **Given** un operario que registra `7.2°C` para un `REFRIGERATOR`
*   **When** el backend responde `201` con `isWithinSafeRange: false`
*   **Then** la UI muestra confirmación con acento de advertencia y el modal se cierra normalmente, dejando el tablero accesible.

### DoD Estricto:
1.  **Tests RTL:** registro dentro de rango, registro fuera de rango (confirma que no se trata como error), reporte histórico solo visible para `ADMIN`.
2.  **Complejidad:** gate ticket-scoped en verde.
3.  **A11y:** `<select>`/`<input>` con `<label htmlFor>`, target táctil ≥48px.

---

## 🤖 Instrucciones de Ejecución Autónoma para Agente IA
1. **Fichas creadas/modificadas (representativas):**
   - `apps/frontend/src/features/kitchen/components/TemperatureLogModal.tsx` (nuevo)
   - `apps/frontend/src/features/reports/components/TemperatureLogReportPanel.tsx` (nuevo)
   - `apps/frontend/src/features/kitchen/services/kitchen.service.ts`
   - `apps/frontend/src/app/routes/InventarioRoute.tsx` (botón nuevo en panel Acciones)
2. **Ejecutar Suite de Pruebas Frontend:** `pnpm --filter @restostock/frontend run test`
3. **Comando de Verificación Total:** `pnpm --filter @restostock/frontend run build && pnpm --filter @restostock/frontend run lint`

---

## 📌 Deuda Registrada
Ninguna propia. Notificación proactiva (push/alerta) cuando una lectura queda fuera de rango es una historia de reportes/alertas aparte, fuera de este alcance.
