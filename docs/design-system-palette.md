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
| Primary actions, nav, header (future) | `--color-primary` | Veranda blue background; white text |
| Secondary controls | `--color-secondary` | Sky cloud accents |
| Page background | `--color-background` | White |
| Cards, modals | `--color-surface-card` | Lychee |
| Soft highlights | `--color-highlight` | Melon |
| KPIs, star ratings | `--color-accent-kpi` | Cupid pink |
| Body text | `--color-text` | `#2D4A4A` on white — **7.8:1** (AA) |
| Headings | `--color-text-heading` | `#1A3333` on white — **10.5:1** (AA) |
| Primary button | `--color-primary-text` on `--color-primary` | White on `#6BB1AD` — **3.2:1** large text / UI; use semibold label |
| Focus ring | `--color-focus-ring` | 2px outline, 2px offset |

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
