# Angular Workspace

## Purpose
TBD

## Requirements

### Requirement: Angular 22 workspace with standalone components and strict mode
The frontend SHALL be an Angular 22 workspace configured with standalone components (no NgModules), signals for reactive state, and TypeScript strict mode enabled.

#### Scenario: Angular workspace builds without errors
- **WHEN** `cd frontend && npm run build -- --configuration production` is executed
- **THEN** exit code is 0 and `dist/` directory is produced

#### Scenario: Workspace uses standalone components
- **WHEN** app.component.ts is inspected
- **THEN** it has `standalone: true` and no NgModule references

#### Scenario: TypeScript strict mode is enabled
- **WHEN** tsconfig.json is inspected
- **THEN** `"strict": true` is set

### Requirement: Workspace structure follows conventions
The workspace SHALL follow the directory structure defined in conventions: `src/app/core/`, `src/app/features/`, `src/app/shared/`, `src/environments/`, `src/assets/`.

#### Scenario: Required directories exist
- **WHEN** the frontend directory is inspected
- **THEN** it contains: src/app/core/, src/app/features/, src/app/shared/, src/environments/, src/assets/

#### Scenario: App routes file exists
- **WHEN** the frontend directory is inspected
- **THEN** src/app/app.routes.ts exists (even if empty)
