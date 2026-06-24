## Why

PSRP-001 bundles Angular workspace creation alongside .NET, Docker, K8s, and CI/CD. This change isolates the frontend foundation so it can be built, validated, and merged in parallel with the backend scaffolding (PSRP-001B). Once merged, the frontend team can start PSRP-005 (auth UI) without waiting for backend or infrastructure.

## What Changes

- Creates Angular 22 workspace with standalone components, signals, and strict mode
- Configures Tailwind CSS with Aura design tokens (colors, typography, spacing from style guide)
- Scaffolds minimal app shell with empty routes
- Sets up environment files (development and production) with API base URL configuration
- Configures nginx.conf for SPA routing in production Docker image
- CI pipeline adds `ng build` step

## Capabilities

### New Capabilities
- `angular-workspace`: Angular 22 workspace with standalone components, signals, strict TypeScript, and new control flow syntax (@if, @for, @switch).
- `design-tokens`: CSS custom properties derived from the Aura style guide (colors, typography, spacing, border-radius, shadows) configured via Tailwind.
- `frontend-environments`: Environment-specific configuration (API URL, feature flags) for development and production builds.

### Modified Capabilities
- `ci-pipeline`: Adds Node.js setup, npm ci, and ng build steps to the CI workflow.

## Impact

- **New directory**: `frontend/` with Angular workspace, Tailwind config, environment files
- **CI**: Adds Node.js 22 setup, npm install, and Angular build steps to GitHub Actions
- **Dependencies**: PSRP-005 (Angular scaffolding and auth UI) can now start
- **No breaking changes**: Purely additive
