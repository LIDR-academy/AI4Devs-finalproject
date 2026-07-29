# Manual test — KAN-40 Stats charts grid

**Branch:** `feature/KAN-40-stats-charts-grid`

## Layout

- [ ] Open `/stats` with at least one book read in the selected period
- [ ] **First row:** four chart slots (genre, format, audiencia, puntuaciones)
- [ ] **Second row:** two bar chart slots (libros, páginas)
- [ ] Genre and format slots show existing data when distributions exist

## Placeholders

- [ ] Audiencia, puntuaciones, and both bar slots show titled cards with dashed placeholder area
- [ ] Placeholder cards have accessible names (inspect with screen reader or devtools)

## Responsive

- [ ] At ~1200px width: pie row becomes 2×2
- [ ] At mobile width: all slots stack in one column; no horizontal page scroll

## Regression

- [ ] KPI cards unchanged
- [ ] Year/month period filter still works
- [ ] Empty period still shows empty-state message (no chart grid)
