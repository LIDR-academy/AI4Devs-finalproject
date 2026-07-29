# design-tokens Specification

## Purpose

Central PRD §6 brand tokens as CSS custom properties, imported app-wide at bootstrap (KAN-18).

## Requirements

### Requirement: Central design tokens

The application SHALL expose PRD §6 brand values as CSS custom properties via a single theme module imported at app bootstrap.

#### Scenario: Tokens available globally

- **WHEN** the app loads
- **THEN** semantic variables for color, typography, spacing, radius, shadow, and focus ring are defined on `:root`
- **AND** components can reference them without hard-coded hex values

#### Scenario: PRD palette preserved

- **WHEN** inspecting `frontend/src/theme/tokens.css`
- **THEN** raw palette values include Veranda blue `#6BB1AD`, Sky cloud `#A7BCBD`, white `#FFFFFF`, Lychee `#ECECDB`, Melon `#E5A9A9`, and Cupid pink `#E6748E`

### Requirement: Documented palette mapping

The project SHALL document which semantic token applies to each UI role per PRD (primary actions, navigation, surfaces, KPI accents).

#### Scenario: Palette documentation exists

- **WHEN** a developer needs to choose a color for a primary button
- **THEN** `docs/design-system-palette.md` specifies the semantic token to use

### Requirement: Typography and spacing scale

The theme SHALL define editorial display and body font families and a spacing scale based on a 4/8 px grid.

#### Scenario: Typography tokens

- **WHEN** a PageHeader renders
- **THEN** it uses the display font family token for its title

#### Scenario: Spacing tokens

- **WHEN** a Card applies padding
- **THEN** it uses spacing tokens from the 4/8 px scale (e.g. `--space-4`, `--space-8`)
