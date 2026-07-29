# KAN-42 — Enhanced

## Original

Implementar/verificar los gráficos de barras **libros por mes** y **páginas por mes**. En vista mensual el eje X son los meses; en vista anual/global, el eje X pasa a **años**. Consume el `period` del filtro de US-08 (KAN-38). Accesibles (ejes y etiquetas claras).

## Enhanced

### User story

**As a** reader on Reading Stats,
**I want** bar charts for books and pages over time,
**so that** I can see monthly trends within a year (month mode) or yearly trends across years (year mode).

### API

- **Month mode** (`MonthlyStatsResponse`): add `monthly_breakdown: { month: 1–12, books_read, pages_read }[]` for the response year (12 buckets, zero-filled).
- **Year mode** (`YearlyStatsResponse`): add `yearly_breakdown: { year, books_read, pages_read }[]` for all years with reads up to selected year (ascending).

### Frontend

- Shared `BarChart` (CSS bars, axis labels, `aria-label`, emphasize selected month/year).
- `BooksBarChart`, `PagesBarChart` wired into bar slots; remove placeholders when breakdown has any non-zero data (or always show with zeros).

### Definition of done

- [ ] API fields + integration tests
- [ ] Bar charts in slots 5–6 with correct axis per period mode
- [ ] Accessible labels; build + tests pass
