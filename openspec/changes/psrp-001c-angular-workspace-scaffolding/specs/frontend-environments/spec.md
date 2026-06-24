## ADDED Requirements

### Requirement: Environment files configure API base URL
The frontend SHALL have environment files (`environment.ts` and `environment.prod.ts`) that configure the API base URL and other environment-specific settings.

#### Scenario: Development environment has localhost API URL
- **WHEN** environment.ts is read
- **THEN** it contains `apiBaseUrl: 'http://localhost:5000/api'` (or equivalent)

#### Scenario: Production environment has production API URL
- **WHEN** environment.prod.ts is read
- **THEN** it contains `apiBaseUrl` pointing to the production API endpoint

#### Scenario: Environment files are used in app.config.ts
- **WHEN** app.config.ts is inspected
- **THEN** it imports and uses the environment configuration
