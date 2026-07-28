## ADDED Requirements

### Requirement: Chrome utilization of highlight and accent tokens

The design system SHALL use `--color-highlight` and `--color-accent-kpi` (in addition to primary and secondary) in shared application chrome — navigation accents, page title decoration, layout background washes, and/or KPI presentation — not only in charts.

#### Scenario: Highlight or accent visible outside charts

- **WHEN** an authenticated user views Home or Book Tracker with the default palette
- **THEN** at least one of highlight or accent-KPI appears in shared chrome (sidebar decoration, page title accent, background wash, or KPI styling)
- **AND** that usage references semantic CSS variables (not hard-coded hex)

### Requirement: Contrast-safe brand color patterns

Documentation and chrome styling SHALL prefer soft tints and decorative accents for pastel slots so body and nav text meet WCAG 2.1 AA against their backgrounds across user-selectable presets.

#### Scenario: Saturated fill not used under body text

- **WHEN** applying highlight or accent-KPI to a surface that contains normal body text
- **THEN** the implementation uses a light tint (`color-mix` or equivalent muted surface) or keeps dark text tokens on a light background
- **AND** does not place paragraphs of normal text on full-strength highlight or accent-KPI fills

## MODIFIED Requirements

### Requirement: Documented palette mapping

The project SHALL document which semantic token applies to each UI role per PRD (primary actions, navigation, surfaces, soft highlights, KPI accents) including chrome usage outside charts, and SHALL document contrast-safe patterns for highlight and accent-KPI.

#### Scenario: Palette documentation exists

- **WHEN** a developer needs to choose a color for a primary button
- **THEN** `docs/design-system-palette.md` specifies the semantic token to use

#### Scenario: Chrome roles documented

- **WHEN** a developer needs to accent a page title, sidebar item, layout background, or KPI
- **THEN** `docs/design-system-palette.md` specifies which semantic tokens and contrast-safe patterns to use
