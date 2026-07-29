## Original

**KAN-16 — US-06 · Generación automática de insights de lectura**

Como lectora que disfruta analizando patrones, quiero recibir insights automáticos sobre mis lecturas, para descubrir tendencias y progreso de forma rápida.

**Acceptance criteria:**
- At least 3 automatic insights when viewing Reading Stats with current month data
- One insight reflects percentage increase vs previous month when applicable
- One highlights dominant genre as main trend

**Technical notes:** Deterministic rules in StatsService (no LLM); `insights` array on stats API; Insights section on Reading Stats.

## Enhanced

**Jira:** KAN-16 · **Change:** `kan-16-stats-insights` · **Branch:** `feature/KAN-16-stats-insights`

### API

Add `insights: StatsInsight[]` to monthly and yearly stats responses:

```json
{
  "id": "uuid",
  "kind": "volume_delta | genre_trend | format_mix | pages_milestone | rating_pattern | other",
  "title": "string",
  "body": "string",
  "data": { }
}
```

- Empty when `books_read === 0`
- At least 3 when `books_read >= 1`
- Month mode compares to previous calendar month; year mode to previous year

### Backend

- `backend/src/stats/stats-insights.ts` — pure `generateStatsInsights()`
- Wire in `getMonthlyStats` / `getYearlyStats` with previous-period book count
- Unit tests `stats-insights.spec.ts`; integration tests in `stats.integration-spec.ts`
- `docs/api-spec.yml` — `StatsInsight` schema

### Frontend

- `InsightsList` component below KPIs, above charts on `StatsPage`
- Spanish copy from API `title`/`body`

### Definition of done

- [ ] Stats API returns `insights` for month and year modes
- [ ] Reading Stats shows insights section with ≥3 cards when data exists
- [ ] Tests and frontend build pass
