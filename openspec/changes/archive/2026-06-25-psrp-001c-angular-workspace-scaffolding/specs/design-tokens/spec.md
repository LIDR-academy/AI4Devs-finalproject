## ADDED Requirements

### Requirement: Tailwind CSS configured with Aura design tokens
The frontend SHALL have Tailwind CSS configured with CSS custom properties derived from the Aura style guide, including colors, typography, spacing, border-radius, and shadows.

#### Scenario: Tailwind config references Aura color tokens
- **WHEN** tailwind.config.js is inspected
- **THEN** it defines theme colors matching the Aura palette: primary, primary-dark, accent, bg-cream, text-primary, etc.

#### Scenario: Tailwind config references Aura spacing tokens
- **WHEN** tailwind.config.js is inspected
- **THEN** it defines spacing tokens: spacing-1 (4px) through spacing-16 (64px)

#### Scenario: Tailwind config references Aura typography
- **WHEN** tailwind.config.js is inspected
- **THEN** it configures font families: Playfair Display (heading) and Inter (body)

#### Scenario: CSS custom properties are defined in global styles
- **WHEN** styles.scss is inspected
- **THEN** it defines `:root` CSS custom properties for all Aura design tokens

### Requirement: Design tokens match the style guide
All design token values SHALL match the specifications in `conventions/style-guide.md`.

#### Scenario: Primary color matches style guide
- **WHEN** the `--color-primary` CSS variable is inspected
- **THEN** its value is `#7C9A72`

#### Scenario: Spacing unit matches style guide
- **WHEN** the `--spacing-4` CSS variable is inspected
- **THEN** its value is `16px`
