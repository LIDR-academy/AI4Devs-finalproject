## Context

KAN-18 introduced semantic CSS tokens; KAN-80 lets users pick one of nine palettes that remap `--color-*` on `document.documentElement`. Charts already cycle primary, secondary, highlight, and accent-KPI as pie slices. Authenticated chrome (sidebar, `PageHeader`, `AppLayout` background, `KpiCard`) still leans on primary + neutrals, so Melon/Cupid-style slots barely appear outside Stats. This change is frontend CSS and documentation only.

Constraints: components MUST use `var(--color-*)` only (no component hex); soft feminine / coquette PRD feel; WCAG 2.1 AA for text and interactive labels across audited presets.

## Goals / Non-Goals

**Goals:**

- Make highlight and accent-KPI (and secondary accents) visible in shared chrome: sidebar decoration, page titles, main background wash, KPI presentation.
- Apply changes primarily in shared `ui/` and `layout/` CSS so all pages inherit theming.
- Keep nav labels, body text, and titles readable under at least veranda + two other presets (one pastel, one saturated).
- Update `docs/design-system-palette.md` UI role mapping to match real usage.

**Non-Goals:**

- New palette presets or Settings picker changes.
- Chart redesign or new slice algorithms.
- Dark mode, custom color pickers, backend/API work.
- Per-page visual redesigns beyond what shared primitives cover.

## Decisions

### 1. Shared CSS first, page CSS last

**Choice:** Update `Layout.css`, `Sidebar.css`, `AppLayout.css`, and `KpiCard.css` before touching individual page stylesheets.

**Rationale:** One inheritance path for Home, Book Tracker, Stats, Lists, Goals, Profile, Import. Avoids divergent hex and keeps KAN-80 swaps consistent.

**Alternatives considered:** Restyle each page independently — rejected (duplication, drift).

### 2. Decorative accents over saturated text fills

**Choice:** Prefer (a) title color via `--color-primary` only when large-text contrast passes, else keep `--color-text-heading` plus a primary/highlight underline or left bar; (b) background washes via `color-mix(in srgb, var(--color-primary|highlight) ~6–12%, var(--color-background))`; (c) KPI accent as value color only when contrast passes, else border/top edge / progress fill.

**Rationale:** Several presets make Melon/Cupid unsafe as body-text backgrounds or as small text on white. Decorative/tint patterns stay on-brand without AA failures.

**Alternatives considered:** Always set titles to `--color-accent-kpi` — rejected (fails AA on multiple presets). Add new derived tokens (`--color-title`, `--color-canvas`) per palette — deferred; CSS mixes are enough for this change.

### 3. Sidebar: keep high-contrast active pill; add non-text accent

**Choice:** Preserve light active pill on primary sidebar; add a left accent bar or soft hover wash using highlight/secondary/accent without reducing label contrast.

**Rationale:** Active state already meets contrast; stacking saturated fills under white/primary text risks regressions when presets change.

### 4. No `palettes.ts` hex edits unless audit forces it

**Choice:** Do not change preset slot values unless a badge/KPI pattern cannot meet AA without a derived token tweak (e.g. badge text on highlight). If needed, fix via palette `vars` (derived), not page CSS.

**Rationale:** Preset identity is product-owned from KAN-80; utilization should not silently recolor brands.

### 5. Docs as part of the contract

**Choice:** Expand `docs/design-system-palette.md` with chrome roles and contrast-safe patterns; keep OpenSpec deltas on `design-tokens`, `shared-ui-components`, and `unified-sidebar-nav`.

**Rationale:** Proposal modifies those three capabilities; docs are the developer-facing mapping already required by design-tokens.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Pastel presets make washes muddy or low-contrast | Cap mix %; verify primavera / pastel-dream / ocean-deep |
| `--color-primary` titles fail AA at display size on some presets | Fall back to heading text + decorative rule |
| Over-coloring chrome feels noisy vs soft PRD aesthetic | One accent motif per region (title rule OR KPI edge OR nav bar — not all at full strength) |
| Page-specific CSS still hardcodes neutrals that ignore washes | Spot-check major routes after shared CSS; fix only blockers |

## Migration Plan

1. Implement shared CSS on a feature branch.
2. Manual visual + contrast pass under ≥3 palettes.
3. Update palette docs.
4. No data migration; rollback = revert CSS/docs commits.

## Open Questions

- None blocking implementation. Optional follow-up: derived `--color-canvas` / `--color-title` tokens if mix logic becomes hard to maintain.
