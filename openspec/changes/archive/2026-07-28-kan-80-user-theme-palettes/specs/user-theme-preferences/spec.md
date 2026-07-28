# user-theme-preferences

Per-user visual theme palette selection (KAN-80).

## ADDED Requirements

### Requirement: User profile preferences storage

The system SHALL store `preferences.theme_palette_id` in `user_profiles.preferences` JSONB for each user.

#### Scenario: Default for new user

- **WHEN** a user has no profile row
- **THEN** `GET /v1/me/preferences` returns `{ theme_palette_id: "veranda" }`

### Requirement: Preferences API

The system SHALL expose authenticated `GET` and `PATCH` on `/v1/me/preferences`.

#### Scenario: Persist palette choice

- **WHEN** the user PATCHes `{ theme_palette_id: "strawberry" }`
- **THEN** subsequent GET returns `strawberry`

#### Scenario: Reject unknown palette

- **WHEN** PATCH includes an unknown `theme_palette_id`
- **THEN** the API returns HTTP 400

### Requirement: Settings theme picker

The Profile / Settings page SHALL let the user select one of nine preset palettes with a visual preview and persist the choice.

### Requirement: App-wide theme application

The application SHALL apply the selected palette by updating semantic CSS custom properties on the document root without a full page reload.

### Requirement: Centralized colors

Component styles SHALL use semantic CSS variables from the theme module; hardcoded hex values outside `theme/tokens.css` are not allowed.
