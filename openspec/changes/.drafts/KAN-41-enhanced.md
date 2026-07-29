# KAN-41 — Enhanced

## Original

Implementar los gráficos tipo quesito que falten: **formato**, **audiencia** (depende de KAN-35) y **puntuaciones** (medias estrellas si KAN-31 está hecho). Verificar que el de **géneros** ya existe. Datos desde `GET /v1/stats`. Accesibles (leyendas + no solo color).

## Enhanced

### User story

**As a** reader using Reading Stats,
**I want** pie charts for genre, format, audience and rating distributions,
**so that** I can compare proportions at a glance with accessible legends.

### Scope

**In scope**
- Extend `GET /v1/stats` (year + month) with `audience_distribution` and `rating_distribution`.
- Shared accessible SVG `PieChart` component (no new chart library; CSS tokens for slice colors).
- Replace format list + audience/rating placeholders with pie charts; convert genre bar chart to pie for slot consistency.
- Update `docs/api-spec.yml`, `api/types.ts`, integration tests.

**Out of scope**
- Bar charts (KAN-42).
- Backend persistence changes.

### API additions

```typescript
audience_distribution: { audience: string; count: number }[]  // young_adult | new_adult | adult | unknown
rating_distribution: { rating: number; count: number }[]    // rated books only, 0.5–5 step
```

### Frontend

- `PieChart` + legend (text labels + counts, not color-only).
- `GenrePieChart`, `FormatPieChart`, `AudiencePieChart`, `RatingPieChart` in `frontend/src/components/stats/`.
- Wire `StatsPage` slots 1–4; remove `ChartSlotPlaceholder` for those when data exists.

### Definition of done

- [ ] API returns new distributions; empty period returns `[]`.
- [ ] Four pie slots render real charts when data exists; placeholders when empty.
- [ ] Legends keyboard-accessible; chart has `role="img"` + descriptive `aria-label`.
- [ ] Integration + unit tests updated; `npm test` / build pass.
- [ ] `docs/api-spec.yml` synced.
