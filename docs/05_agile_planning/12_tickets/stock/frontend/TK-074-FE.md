---
ticket: TK-074-FE
title: Frontend — Dynamic Storage Locations Selector & Management UI
epic: Inventario y Bodega
user_story: US-016
status: READY
points: 3
---

# 🎟️ Ticket Técnico: TK-074-FE — Frontend Storage Locations UI

## 🎯 Objetivo
`LocationsService` y `LocationsManagementModal.tsx` **ya existen**. Falta: (a) que el desplegable de **destino de cocina** del modal de extracción se pueble dinámicamente desde `GET /api/v1/locations` (`type = KITCHEN`, activos) en vez de los literales `KITCHEN_FRIDGE/PREP/LINE` hardcodeados; (b) que `LocationsManagementModal` deshabilite el toggle de actividad y el borrado de un sector con `hasStock: true` mostrando el motivo, y traduzca el `409` del backend.

---

## 🛠️ Tareas Técnicas
1. `WarehouseExtractionModal.tsx`: reemplazar el `<select>` de "Ubicación Destino en Cocina" con opciones cargadas de `LocationsService.fetchLocations()` filtradas a `type === 'KITCHEN' && isActive`. Mantener fallback a los 3 literales si la llamada falla (patrón `useAvailableInsumos`).
2. `LocationsManagementModal.tsx`: botón `Power` y `Trash2` deshabilitados (`aria-disabled`, tooltip "El sector tiene existencias asociadas") cuando `loc.hasStock`; mapear `409` vía `mapToUserFriendlyError`.
3. El selector de **sub-sector de bodega origen** en extracción y los selectores de alta/reabastecimiento se implementan en `TK-096-FE` (dependen del modelo multi-sector de US-025) — este ticket solo cubre el destino de cocina y la gestión.

---

## ✅ Criterios de Aceptación & DoD
1. **TDD:** `LocationsManagementModal.test.tsx` cubre el estado deshabilitado por `hasStock`; test de `WarehouseExtractionModal` verifica carga dinámica del destino.
2. **Guard 29:** sin `style={{}}` inline; clases desde tokens; lectura previa de `DESIGN.md`.
3. **Guard 38:** sin `window.alert/confirm`; errores vía `ErrorBanner` + `errorMessageMapper`.
4. **Accesibilidad AAA:** targets táctiles ≥ 48px, contraste validado.

## 🧪 Plan de Pruebas
- Unitario de renderizado y estados deshabilitados.
- Verificación de carga dinámica de sectores de cocina en el modal de extracción.
