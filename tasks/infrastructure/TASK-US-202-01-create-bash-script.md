# TASK-US-202-01: Create Bash Script

Create a Bash deployment CLI script (`deploy.sh`) for Linux/macOS with an interactive menu and core Docker deployment operations.

[Trello Card](https://trello.com/c/v0zGNdGs)

## Parent User Story
[US-202: Deployment Scripts](../../user-stories/infrastructure/US-202-deployment-scripts.md)

## Description
Implement the Bash version of the deployment CLI with robust shell practices, interactive menu flow, environment selection, and foundational command handlers.

## Priority
🟠 High

## Estimated Time
2 hours

## Detailed Steps
1. Create `deployment/scripts/deploy.sh` with `set -euo pipefail` and strict argument parsing.
2. Add prerequisite checks for `docker` and `docker compose` command availability.
3. Implement interactive numbered menu matching the user story options.
4. Add environment selection flow (`development`, `staging`, `production`) and persist current context in script state.
5. Implement base menu loop, input validation, and graceful handling for invalid entries.
6. Add colorized output helpers for info/success/warning/error messages.
7. Add interrupt trap (`Ctrl+C`) and consistent exit codes for failures.

## Acceptance Criteria
- [x] `deploy.sh` exists under `deployment/scripts/`.
- [x] Script runs on Linux/macOS and shows interactive menu.
- [x] Environment selection is implemented and visible in prompt output.
- [x] Invalid menu inputs are handled without crashing.
- [x] Colored output and graceful interrupt handling are implemented.

## Notes
- Keep shell functions small and composable for parity with PowerShell implementation.
- Prefer portable Bash constructs compatible with macOS default Bash where feasible.

## Completion Status
- [ ] 0% - Not Started
- [x] 100% - Completed
