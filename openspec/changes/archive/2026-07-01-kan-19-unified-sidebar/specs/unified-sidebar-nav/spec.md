## ADDED Requirements

### Requirement: Unified application layout

The authenticated SPA SHALL wrap all private routes in a shared layout that renders a fixed left sidebar and a main content region.

#### Scenario: Layout on every private page

- **WHEN** an authenticated user visits Home, Book Tracker, Reading Stats, or Lists
- **THEN** the same sidebar component is visible on the left
- **AND** page content renders in the main area to the right

#### Scenario: Login without sidebar

- **WHEN** an unauthenticated user visits `/login`
- **THEN** the sidebar is not shown

### Requirement: Complete sitemap links

The sidebar SHALL list all PRD navigation destinations: Home, Book Tracker, Reading Stats, Lists, Goals, Library, Recap/Insights, Import/Export, and Profile/Settings.

#### Scenario: All links on Book Tracker

- **WHEN** the user is on Book Tracker
- **THEN** the sidebar includes links to Goals, Library, Recap/Insights, Import/Export, and Profile/Settings in addition to core modules

### Requirement: Active route indication

The sidebar SHALL visually indicate the current page.

#### Scenario: Active Home link

- **WHEN** the user is on `/`
- **THEN** the Home sidebar item is styled as active

### Requirement: Sidebar visual design

The sidebar SHALL be fixed on the left with Veranda blue (`#6BB1AD`) background per PRD.

#### Scenario: Primary brand background

- **WHEN** the sidebar renders
- **THEN** its background uses the primary brand color token

### Requirement: Sidebar accessibility

The sidebar navigation SHALL be keyboard operable with visible focus and correct landmark semantics (WCAG 2.1 AA).

#### Scenario: Navigation landmark

- **WHEN** assistive technology reads the page
- **THEN** the sidebar is exposed as a navigation landmark with an accessible name

#### Scenario: Keyboard focus

- **WHEN** the user tabs through the sidebar links
- **THEN** each link receives a visible focus indicator
