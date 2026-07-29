# Tasks: theme-palette-ui-utilization

Frontend-only chrome theming. No Jira key assigned. Branch: `feature/theme-palette-ui-utilization`.

## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create and switch to feature branch `feature/theme-palette-ui-utilization` from the current base branch
- [x] 0.2 Verify branch creation and current branch status with `git status` / `git branch`

## 1. Shared chrome CSS

- [x] 1.1 Update `frontend/src/components/ui/Layout.css` so `.ui-page-header__title` uses brand-tinted title color and/or decorative accent (primary / highlight / accent-KPI) with WCAG AA large-text contrast
- [x] 1.2 Update `frontend/src/components/layout/Sidebar.css` (and `.ui-sidebar-item*` in `Layout.css` if needed) to add highlight / accent-KPI / secondary decoration on active or hover without reducing nav label contrast
- [x] 1.3 Update `frontend/src/components/layout/AppLayout.css` with a subtle palette background wash via `color-mix` / surface-muted tokens (keep body text on AA-safe backgrounds)
- [x] 1.4 Update `frontend/src/components/KpiCard.css` so accent-KPI and/or highlight appear on value, border, or decorative edge with AA-compliant label/value text
- [x] 1.5 Adjust `frontend/src/components/ui/Card.css` badge text/background pairs if accent/kpi badges fail contrast under audited presets
- [x] 1.6 Spot-fix page CSS only if shared primitives leave a major route unthemed; no hard-coded hex in touched files

## 2. Frontend: Review and Update Existing Unit Tests (MANDATORY)

- [x] 2.1 Review whether any frontend tests assert chrome class names or colors; update only if selectors break
- [x] 2.2 Confirm no new pure helpers require unit tests (CSS-only preferred); if a tint helper is added, add a focused Vitest case

## 3. Frontend: Run Unit Tests and Verify Database State (MANDATORY)

- [x] 3.1 Note database baseline: **N/A** for this CSS-only change (no schema or API writes); document that explicitly in the report
- [x] 3.2 Run frontend build: `cd frontend && npm run build`
- [x] 3.3 Run any existing frontend unit tests if configured (`npm test` / project script); record pass/fail
- [x] 3.4 Create report `openspec/changes/theme-palette-ui-utilization/specs/theme-palette-ui-utilization/reports/YYYY-MM-DD-step-3-unit-test-and-db-verification.md`
- [x] 3.5 Mark complete only after build (and tests if present) succeed and the report exists

## 4. Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 4.1 Confirm **no API or endpoint changes** in this change (reuse existing KAN-80 preferences only for manual theme switching in E2E)
- [x] 4.2 Document N/A curl scope in `openspec/changes/theme-palette-ui-utilization/specs/theme-palette-ui-utilization/reports/YYYY-MM-DD-step-4-curl-verification.md` (reason: frontend CSS/docs only)
- [x] 4.3 Optional smoke: if backend is up, `GET /v1/me/preferences` still returns `theme_palette_id` after login (regression check only; restore nothing)

## 5. Frontend: E2E / visual verification (MANDATORY if applicable - AGENT MUST EXECUTE)

- [x] 5.1 Ensure frontend (and backend if login required) are running
- [x] 5.2 Log in, open Home / Book Tracker / Stats / Goals; confirm highlight or accent-KPI appears outside charts (title, sidebar, background, and/or KPIs)
- [x] 5.3 In Profile Theme settings, switch among **veranda**, one pastel (`primavera` or `pastel-dream`), and one saturated (`strawberry` or `ocean-deep`); confirm chrome recolors without reload and text remains readable
- [x] 5.4 Contrast spot-check (DevTools or axe): page titles, sidebar labels (default + active), KPI labels/values
- [x] 5.5 Document outcomes in `openspec/changes/theme-palette-ui-utilization/specs/theme-palette-ui-utilization/reports/YYYY-MM-DD-step-5-e2e-visual-verification.md` (or `MANUAL-TEST-theme-palette-ui-utilization.md` at change root)
- [x] 5.6 Restore theme preference to the pre-test value if changed during testing

## 6. Update Technical Documentation (MANDATORY)

- [x] 6.1 Update `docs/design-system-palette.md` UI role mapping: chrome usage of highlight / accent-KPI / secondary and contrast-safe patterns
- [x] 6.2 Briefly note full-palette chrome utilization in `docs/standards/frontend-standards.md` if the UI section still implies chart-only accents
- [x] 6.3 Confirm no `docs/api-spec.yml` / `docs/data-model.md` changes are required
