---
document: technical_ticket
id: TK-079-FE
related_story: US-020
points: 2
type: frontend
status: approved
inputs:
  - docs/05_agile_planning/11_user_stories/reports/US-020.md
  - docs/05_agile_planning/12_tickets/reports/backend/TK-079.md
---

# 🎟️ TK-079-FE: Frontend Indicador TRR Real en el Dashboard de Reportes

> **Navegación del Framework SDD:**
> [📖 Índice de Tickets](../../indice_tickets.md) | [Anterior: TK-079](../backend/TK-079.md)

---

## 📝 Descripción
Agrega una card de KPI en `ReportsDashboard.tsx`, junto al desglose de mermas ya existente (`US-009`), mostrando el TRR real promedio del periodo consultado (reutiliza el mismo filtro de rango de fechas ya presente en el dashboard) contra el umbral objetivo de 72h, con un estado visual de cumplimiento (verde si `averageTrrHours <= targetTrrHours`, alerta si lo supera).

---

## 🔀 Alcance de Modificación (Frontend)
- `reports.service.ts`: `getRotationMetrics(startDate, endDate)` → `RotationMetricsResponse`.
- `ReportsDashboard.tsx`: nueva card de KPI reutilizando el patrón visual de `metrics-grid` ya existente en la app.
- Estado vacío explícito (`sampleSize === 0`): mensaje "Sin remanentes finalizados en este periodo", nunca "0h".

---

## ✅ Criterios de Aceptación & DoD
1. **Estado Vacío:** `sampleSize: 0` renderiza el mensaje explícito, no `"0h"` (US-020 Escenario 2).
2. **Indicador Visual de Cumplimiento:** La card distingue visualmente si el TRR real está dentro o fuera del objetivo de 72h, sin hardcodear el número (usa `targetTrrHours` de la respuesta).
3. **Guard 29:** Sin estilos inline; clase nueva en `ReportsDashboard.module.css`.
4. **Verificación:** 100% pruebas pasando (`pnpm test`) y 0 errores de build (`pnpm run build`).
