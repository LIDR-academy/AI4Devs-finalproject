## ADDED Requirements

### Requirement: Template Selection Step
The onboarding wizard SHALL display a grid of available templates. The user MUST select a template to proceed.

#### Scenario: Selecting a template
- **WHEN** the user is on the template selection step
- **THEN** they can view available templates and click one to select it and proceed to the next step

### Requirement: Event Basics Step
The onboarding wizard SHALL provide a form to capture basic event details (name, date/time, venue name, venue address, couple names, color scheme, font family).

#### Scenario: Completing event basics
- **WHEN** the user fills out the required event details and submits
- **THEN** the data is validated and they proceed to the next step

### Requirement: Guest Import Step
The onboarding wizard SHALL provide an option to manually add initial guests or skip this step entirely.

#### Scenario: Skipping guest import
- **WHEN** the user chooses to skip the guest import step
- **THEN** the event is finalized and the user is redirected to the event dashboard

#### Scenario: Completing the wizard
- **WHEN** the user completes the final step of the wizard
- **THEN** the `POST /api/events` endpoint is called to create the event, and upon success, they are redirected to the event dashboard
