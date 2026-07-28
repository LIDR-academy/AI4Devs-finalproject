# Design system palette — KAN-18

Semantic mapping from PRD §6 raw colors to CSS tokens. Components MUST use **semantic** tokens (`--color-*`), not raw palette variables.

## Raw palette → semantic tokens

| PRD name | Hex | CSS raw token | Semantic token(s) |
|----------|-----|---------------|-------------------|
| Veranda blue | `#6BB1AD` | `--palette-veranda-blue` | `--color-primary`, `--color-focus-ring` |
| Sky cloud | `#A7BCBD` | `--palette-sky-cloud` | `--color-secondary`, `--color-border-strong` |
| White | `#FFFFFF` | `--palette-white` | `--color-background`, `--color-surface` |
| Lychee | `#ECECDB` | `--palette-lychee` | `--color-surface-card` |
| Melon | `#E5A9A9` | `--palette-melon` | `--color-highlight` |
| Cupid pink | `#E6748E` | `--palette-cupid-pink` | `--color-accent-kpi` |

## UI role mapping (PRD)

| UI role | Token | Notes |
|---------|-------|-------|
| Primary actions, nav fill | `--color-primary` | Sidebar background; primary buttons; white/`--color-primary-text` labels |
| Secondary controls / borders | `--color-secondary` | Secondary buttons, strong borders, chart slices |
| Page canvas | `--color-background` + soft mixes | Base white; layout uses light `color-mix` of primary/highlight for a themed wash |
| Cards, modals | `--color-surface-card` | Lychee (or preset surface card) |
| Soft highlights (chrome + charts) | `--color-highlight` | Sidebar hover accent bar, KPI card tint, title gradient, pie slices — prefer tints, not full fills under body text |
| KPIs and strong accents | `--color-accent-kpi` | KPI top edge, active nav accent bar, star ratings, title gradient, pie slices |
| Page titles | `--color-text-heading` + decorative accent | Keep dark heading text for AA; brand via gradient underline (`primary` → `highlight` → `accent-kpi`) |
| Body text | `--color-text` | `#2D4A4A` on white — **7.8:1** (AA) |
| Headings | `--color-text-heading` | `#1A3333` on white — **10.5:1** (AA) |
| Primary button | `--color-primary-text` on `--color-primary` | White on `#6BB1AD` — **3.2:1** large text / UI; use semibold label |
| Focus ring | `--color-focus-ring` | 2px outline, 2px offset |

## Contrast-safe chrome patterns

Across the nine user presets, Melon/Cupid-equivalents are often **unsafe** as normal text on white or as full backgrounds under paragraphs. Prefer:

1. **Decorative accents** — left bars, top edges, short underlines/gradients using `--color-highlight` / `--color-accent-kpi` / `--color-primary`.
2. **Light washes** — `color-mix(in srgb, var(--color-*) ~6–14%, var(--color-background|surface-card))` behind dark text tokens.
3. **Soft badges** — tinted `highlight` / `accent-kpi` mixes with `--color-text-heading`, not white-on-saturated fills.
4. **KPI values** — keep `--color-text-heading` for the number; put brand color on the card edge or soft background tint.

Do **not** place body copy on full-strength highlight or accent-KPI fills.

## Typography

| Role | Token |
|------|-------|
| Display / page titles | `--font-display` (Cormorant Garamond) |
| Body / UI | `--font-body` (Nunito) |

## Spacing and shape

- Grid: `--space-1` (4px) through `--space-12` (48px) in 4/8 px steps
- Radius: `--radius-sm` … `--radius-xl`, `--radius-full`
- Shadows: `--shadow-sm`, `--shadow-md`, `--shadow-lg`

## Source files

- Tokens: `frontend/src/theme/tokens.css`
- Palette registry: `frontend/src/theme/palettes.ts`
- Runtime apply: `frontend/src/theme/applyTheme.ts`, `ThemeProvider`
- Shared chrome: `frontend/src/components/ui/Layout.css`, `layout/Sidebar.css`, `layout/AppLayout.css`, `KpiCard.css`
- Components: `frontend/src/components/ui/`

## User-selectable palettes (KAN-80)

Nine preset palettes map five raw slots to semantic tokens. Default: **veranda** (PRD §6). Users change palette in Profile / Settings; choice persists in `user_profiles.preferences.theme_palette_id` and applies via CSS variables on `document.documentElement`.

| Slug | UI label (es) |
|------|----------------|
| `veranda` | Veranda |
| `primavera` | Primavera |
| `strawberry` | Fresa |
| `lotus-pond` | Estanque de loto |
| `ocean-deep` | Océano profundo |
| `pool-party` | Fiesta en la piscina |
| `sunset` | Atardecer |
| `pastel-dream` | Sueño pastel |
| `fresh-green` | Verde fresco |

Component CSS MUST use `var(--color-*)` only; hex literals belong in `tokens.css` defaults and `palettes.ts`.

Palette switches must visibly recolor shared chrome (sidebar accents, title decoration, layout wash, KPI edges) as well as charts — not charts alone.
