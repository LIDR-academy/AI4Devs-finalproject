---
document: technical_ticket
id: TK-078-FE
related_story: US-019
points: 2
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/reports/US-019.md
  - docs/05_agile_planning/12_tickets/reports/backend/TK-078.md
---

# 🎟️ TK-078-FE: Frontend Costeo de Insumos y Valorización Monetaria de Mermas

> **Navegación del Framework SDD:**
> [📖 Índice de Tickets](../../indice_tickets.md) | [Anterior: TK-078](../backend/TK-078.md)

---

## 📝 Descripción
1. `CreateInsumoModal.tsx`: agrega un campo opcional "Costo por [unidad]" (usa `unitOfMeasure` ya seleccionado como sufijo dinámico, ej. "Costo por KG").
2. `ReportsDashboard.tsx`: cada fila de merma muestra el valor monetario junto a la cantidad física, formateado con `SystemSettings.currencySymbol` (ya existente, sin consumidor hasta ahora).

---

## 🔀 Alcance de Modificación (Frontend)
- `stock.service.ts`: `createInsumo`/`listInsumos` propagan `unitCost` (string decimal opcional).
- `CreateInsumoModal.tsx`: input numérico opcional, mismo patrón de validación que `initialWarehouseStock`.
- `reports.service.ts`: `WasteReportItem` incluye `totalDiscardedCost: string | null`.
- `ReportsDashboard.tsx`: renderiza `${currencySymbol}${totalDiscardedCost}` cuando no es `null`; renderiza "Sin costo registrado" (texto secundario, no un banner de error) cuando es `null`.

---

## ✅ Criterios de Aceptación & DoD
1. **Distinción Null vs. Cero:** La UI nunca muestra `"$0.00"` para un insumo sin costo registrado — texto explícito "Sin costo registrado" (US-019 Escenario 2).
2. **Guard 29:** Sin estilos inline; clases en `ReportsDashboard.module.css`/`CreateInsumoModal.module.css` siguiendo el patrón de módulos ya establecido en la app.
3. **Formato de Moneda:** Usa `SystemSettings.currencySymbol` consistentemente, sin hardcodear `"$"`.
4. **Verificación:** 100% pruebas pasando (`pnpm test`) y 0 errores de build (`pnpm run build`).
