## MODIFIED Requirements

### Requirement: Sidebar visual design

The sidebar SHALL be fixed on the left with a background that uses the primary brand color token, and SHALL incorporate additional semantic accents (highlight, accent-KPI, and/or secondary) for active or hover decoration without reducing nav label contrast below WCAG 2.1 AA.

#### Scenario: Primary brand background

- **WHEN** the sidebar renders
- **THEN** its background uses the primary brand color token

#### Scenario: Additional palette accents on nav

- **WHEN** the sidebar renders with the active user palette
- **THEN** at least one nav treatment (active indicator, hover wash, or decorative accent) uses highlight, accent-KPI, or secondary via semantic tokens
- **AND** nav item label text remains WCAG 2.1 AA compliant against its background in both default and active states
