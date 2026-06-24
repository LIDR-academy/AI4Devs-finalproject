## ADDED Requirements

### Requirement: CI workflow triggers on push and PR
The CI workflow SHALL trigger on push to `main` branch and on pull requests targeting `main`.

#### Scenario: Push to main triggers CI
- **WHEN** a commit is pushed to the `main` branch
- **THEN** the CI workflow executes

#### Scenario: Pull request triggers CI
- **WHEN** a pull request is opened or updated targeting `main`
- **THEN** the CI workflow executes

### Requirement: CI workflow has a validation job
The CI workflow SHALL include a `validate` job that runs on `ubuntu-latest` and confirms the pipeline is functional.

#### Scenario: Validate job passes
- **WHEN** the CI workflow runs
- **THEN** the `validate` job completes with exit code 0

### Requirement: CI workflow grows incrementally
Each subsequent PSRP-001 phase SHALL add jobs to the same CI workflow file. The pipeline SHALL remain green on main after every merge.

#### Scenario: Phase B adds dotnet build
- **WHEN** PSRP-001B merges
- **THEN** the CI workflow includes `dotnet-build` job and passes

#### Scenario: Phase C adds angular build
- **WHEN** PSRP-001C merges
- **THEN** the CI workflow includes `angular-build` job and passes
