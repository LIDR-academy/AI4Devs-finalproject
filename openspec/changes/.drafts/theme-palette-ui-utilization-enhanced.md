# Theme palette UI utilization — Enhanced User Story

**Suggested OpenSpec change:** `theme-palette-ui-utilization`  
**Depends on:** KAN-18 (design tokens), KAN-80 (user-selectable palettes)

## Original

Los temas visuales del proyecto estan muy desaprovechados. Hay colores que solo se ven en los gráficos pero en nignun otro sitio. Haz que se utilicen más, en los elementos del menú, en los titulos de pagina, en fondos etc. Hay que tener cuidado de los colores en sitios que incluyen texto ya que el contrate podria no ser suficiente para que se lea bien.

## Enhanced

### Summary

Spread the **full semantic palette** across chrome and content UI (sidebar, page titles, backgrounds, KPI accents, soft highlights) so switching themes in Settings (KAN-80) is visibly felt beyond stats charts. Keep **WCAG 2.1 AA** contrast for all text and interactive labels; prefer soft/tinted uses of pastel slots over putting body text on saturated fills.

---

### Problem

After KAN-18 / KAN-80, five palette slots remap app-wide via `--color-*`, but most chrome still uses only **primary** (sidebar) and **neutral text/surfaces**. **`--color-highlight`** and **`--color-accent-kpi`** appear almost exclusively in pie charts, star ratings, and rarely used badges. Page titles (`ui-page-header__title`) and main background stay neutral, so palette changes feel weak outside Stats.

PRD §6 already assigns roles that are under-applied:

| Slot | Intended role (PRD) | Typical use today |
|------|---------------------|-------------------|
| primary | Nav, primary actions | Sidebar ✅, buttons ✅ |
| secondary | Secondary accents | Borders / bars / pie slice |
| surfaceCard | Cards / modals | Cards ✅ |
| highlight (Melon) | Soft highlights | Charts + badge only |
| accentKpi (Cupid pink) | KPIs and accents | Charts + stars only |

---

### Scope (in)

Frontend-only visual utilization of **existing semantic tokens** (`var(--color-*)`). No new palette presets, no backend/API changes, no hex literals in component CSS.

Target surfaces (priority order):

1. **Sidebar / menu** — richer use of secondary / highlight / accent within the primary nav chrome (active/hover indicators, optional accent mark), without breaking white-on-primary contrast.
2. **Page titles** — brand-tinted display titles (e.g. primary or a dark-enough derived tint), not raw pastel fills behind long body copy.
3. **Page / layout backgrounds** — subtle tinted background or muted wash derived from palette (`surface-muted`, soft `color-mix` of primary/highlight), still light enough for AA text.
4. **KPIs & accent moments** — KPI values / progress accents use `--color-accent-kpi` (or highlight) where contrast allows; soft tinted KPI card borders/backgrounds.
5. **Shared primitives** — prefer updating `frontend/src/components/ui/` (`Layout.css`, `Card.css`, sidebar item styles) and `layout/Sidebar.css` / `AppLayout.css` so all pages inherit the look.

### Scope (out)

- New theme presets or Settings UX changes (already KAN-80).
- Chart redesign / new chart color algorithms.
- Dark mode.
- Manual per-token color pickers.
- Hardcoded page-specific hex that would break palette switching.
- Backend or `docs/api-spec.yml` changes.

---

### Functional / visual requirements

#### Token usage rules

- Components MUST continue to use **semantic** tokens only (`--color-primary`, `--color-secondary`, `--color-highlight`, `--color-accent-kpi`, `--color-surface-*`, text tokens). See `docs/design-system-palette.md`.
- Soft tints: prefer `color-mix(in srgb, var(--color-*) N%, transparent|var(--color-background))` over placing body text on full-strength Melon / Cupid pink / secondary.
- Do **not** use `--palette-*` raw variables in components.

#### Contrast rules (NFR — accessibility)

- **Normal text** (< 18pt / < 14pt bold): contrast ≥ **4.5:1** against its background.
- **Large text** (titles ≥ 18pt or ≥ 14pt bold) and UI graphics: ≥ **3:1**.
- Saturated slots (`highlight`, `accent-kpi`, light `secondary` in some presets) are **unsafe as text color on white** and **unsafe as background under dark body text** in several of the nine presets — audit at least **veranda**, **primavera**, **ocean-deep**, and **strawberry**.
- Safe patterns:
  - **Title accent:** color the display title with `--color-primary` or `--color-text-heading` + a primary underline / decorative rule / left bar using highlight or accent.
  - **Background wash:** very light mix (e.g. 6–12%) of primary or highlight into background; keep `--color-text` / `--color-text-heading` unchanged.
  - **KPI value:** `--color-accent-kpi` only when it meets large-text contrast on the card surface; otherwise keep dark text and use accent for border, icon, or progress fill.
  - **Menu active state:** keep existing high-contrast active treatment (light pill on primary sidebar); add secondary/highlight only as non-text decoration or for hover washes that preserve label contrast.

#### Concrete UI targets

| Area | File(s) | Direction |
|------|---------|-----------|
| Sidebar chrome | `components/layout/Sidebar.css`, `ui/Layout.css` (`.ui-sidebar-item*`) | Accent active indicator (highlight/accent bar or soft secondary hover); keep AA for labels |
| Page header title | `ui/Layout.css` (`.ui-page-header__title`) | Primary-tinted title and/or accent underline using highlight/accent |
| App background | `layout/AppLayout.css`, optionally `theme/base.css` | Subtle palette-tinted main background via tokens / `color-mix` |
| KPI cards | `components/KpiCard.css` (+ Stats/Home consumers) | Accent value or soft highlight border/top edge |
| Progress / goal accents | `AnnualGoalCard.css`, Goals page CSS | Progress fill / accent already primary — add highlight/accent sparingly for secondary emphasis |
| Badges / chips | `ui/Card.css` (`.ui-badge--*`) | Ensure accent/kpi badges are used where product meaning fits; fix text color if contrast fails on any preset |

---

### Fields / data model

None. Preferences already store `theme_palette_id` (KAN-80).

---

### API / endpoints

None. Pure frontend CSS/token application.

---

### Files / modules to touch (expected)

| Path | Role |
|------|------|
| `frontend/src/components/ui/Layout.css` | Page titles, sidebar item base styles |
| `frontend/src/components/layout/Sidebar.css` | Nav chrome accents |
| `frontend/src/components/layout/AppLayout.css` | Main background wash |
| `frontend/src/components/KpiCard.css` | KPI accent utilization |
| `frontend/src/components/ui/Card.css` | Optional badge / card accent polish |
| `frontend/src/components/AnnualGoalCard.css` | Optional progress accent |
| `docs/design-system-palette.md` | Document expanded UI role mapping + contrast guidance |
| `docs/standards/frontend-standards.md` | Brief note: utilize full semantic palette beyond charts |

Optional if gaps remain after shared primitives: co-located page CSS (`HomePage.css`, `StatsPage.css`, `GoalsPage.css`, etc.) — prefer shared UI first.

Do **not** change `palettes.ts` slot hex values unless a contrast audit proves a derived token (e.g. `--color-secondary-text` on highlight badge) must be adjusted for a specific preset; if so, fix via palette-derived vars, not one-off page CSS.

---

### Acceptance criteria

1. With **veranda** and at least two other presets selected, the user can see **highlight** and/or **accent-kpi** outside charts (menu decoration, titles, backgrounds, and/or KPIs).
2. Page titles on major routes (`/`, `/books`, `/stats`, `/lists`, `/goals`, `/profile`, import) reflect palette branding beyond neutral heading gray.
3. Main content area background is subtly themed (not flat pure white only), still readable.
4. Sidebar remains clearly themed; active/hover states remain distinguishable and readable.
5. Manual contrast check (browser DevTools or axe): no regressions below WCAG AA for body text, nav labels, page titles, and KPI labels/values on audited presets.
6. Switching palette in Settings still recolors chrome + charts without reload; no new hard-coded hex in touched component CSS.
7. `npm run build` succeeds in `frontend`.

---

### Definition of done

1. Implement tokenized visual updates in shared layout/UI CSS (and minimal page CSS if needed).
2. Spot-check all authenticated routes + login under ≥3 palettes.
3. Contrast audit for text-on-fill and fill-under-text cases listed above.
4. Update `docs/design-system-palette.md` UI role mapping to match actual usage.
5. No API/spec changes; no OpenAPI churn.
6. Ready for OpenSpec propose/apply as a frontend-only change.

---

### Testing

- **Manual:** cycle Theme presets; verify sidebar, titles, backgrounds, KPIs, charts still coherent.
- **Manual a11y:** contrast on titles, nav, KPI values for `veranda`, one pastel preset (`primavera` or `pastel-dream`), one high-saturation preset (`strawberry` or `ocean-deep`).
- **Build:** `frontend` production build.
- Unit tests not required unless a small pure helper is introduced for tint/contrast; prefer CSS-only.

---

### Non-functional requirements

| Area | Requirement |
|------|-------------|
| Accessibility | WCAG 2.1 AA contrast; focus rings unchanged (`--color-focus-ring`) |
| Theming | All colors via semantic CSS variables so KAN-80 presets keep working |
| Performance | CSS-only; no runtime JS color computation beyond existing `applyTheme` |
| Consistency | Soft feminine / coquette PRD feel — elegant washes, not loud rainbow chrome |
| Maintainability | Prefer shared `ui/` + layout CSS over per-page one-offs |

---

### Suggested implementation notes

1. Start in `Layout.css` / `AppLayout.css` / `Sidebar.css` so one change lifts all pages.
2. For titles: `color: var(--color-primary)` often fails AA on light backgrounds for smaller sizes — display size may pass as large text; if not, keep `--color-text-heading` and add a **decorative** primary/highlight underline or left accent bar.
3. For backgrounds: `background: color-mix(in srgb, var(--color-primary) 8%, var(--color-background))` (tune %) — verify pastel presets do not become muddy.
4. Reuse existing badge patterns (`.ui-badge--accent`, `.ui-badge--kpi`) rather than inventing new token names.
5. Avoid placing Melon/Cupid as full card backgrounds under paragraphs of text.

---

### Out-of-scope follow-ups (optional later)

- Dedicated `--color-title` / `--color-canvas` derived tokens per palette if contrast math becomes too complex for CSS-only mixes.
- Automated contrast tests in CI per palette.
)
