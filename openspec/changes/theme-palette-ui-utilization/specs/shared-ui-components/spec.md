## ADDED Requirements

### Requirement: PageHeader brand accent

`PageHeader` titles SHALL reflect the active palette through a brand-tinted title color and/or a decorative accent (underline or bar) using semantic tokens, while meeting WCAG 2.1 AA contrast for the title text against its background.

#### Scenario: Title reflects palette

- **WHEN** `PageHeader` renders on an authenticated page
- **THEN** the title uses a brand semantic token for text color and/or a decorative accent using primary, highlight, or accent-KPI
- **AND** title text contrast against the page background meets WCAG 2.1 AA for large text

### Requirement: KPI presentation uses accent tokens

Shared KPI card styling SHALL use `--color-accent-kpi` and/or `--color-highlight` for value color, border, or decorative edge when contrast requirements are met; otherwise it SHALL keep dark text tokens and apply accent only as non-text decoration.

#### Scenario: KPI accent visible

- **WHEN** a KPI card renders with the active palette
- **THEN** accent-KPI or highlight is visible on the card (value, border, or decorative edge)
- **AND** label and value text meet WCAG 2.1 AA against the card background

## MODIFIED Requirements

### Requirement: WCAG contrast for base components

Base components SHALL use token pairs documented in `docs/design-system-palette.md` that meet WCAG 2.1 AA contrast for normal text and focus indicators, including PageHeader titles and KPI labels/values when brand accents are applied.

#### Scenario: Primary button contrast documented

- **WHEN** reviewing the palette documentation
- **THEN** primary button foreground/background pair is listed with AA compliance noted

#### Scenario: Accented chrome contrast holds across presets

- **WHEN** the user switches among audited presets (including veranda and at least one pastel and one saturated palette)
- **THEN** PageHeader title text and KPI label/value text remain WCAG 2.1 AA compliant against their backgrounds
