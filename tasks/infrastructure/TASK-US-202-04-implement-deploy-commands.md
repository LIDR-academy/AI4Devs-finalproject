# TASK-US-202-04: Implement Deploy Commands

Implement deployment and runtime operations in CLI scripts (compose deploy, single-container run, logs, stop/restart).

[Trello Card](https://trello.com/c/FfyFN3JN)

## Parent User Story
[US-202: Deployment Scripts](../../user-stories/infrastructure/US-202-deployment-scripts.md)

## Description
Provide operational commands that deploy the application stack, run one-off containers, inspect logs, and control service lifecycle for each environment.

## Priority
🟠 High

## Estimated Time
1.5 hours

## Detailed Steps
1. Implement `Deploy Application` command using environment-aware compose files.
2. Implement `Run Single Container` command in detached mode with configurable image/name/port/env options.
3. Implement `View Logs` command for global stack logs and per-service logs.
4. Implement `Stop Services` command with optional volume/network cleanup flags.
5. Implement `Restart Services` command with service-level and full-stack scope.
6. Ensure command output clearly reports environment and selected compose profile.

## Acceptance Criteria
- [x] Deploy command launches correct compose stack per selected environment.
- [x] Single-container run command supports detached mode with input validation.
- [x] Logs command supports both stack and service-level views.
- [x] Stop and restart commands work consistently.
- [x] Commands include clear success/failure feedback.

## Notes
- Reuse environment-selection state to avoid duplicated prompts.
- Keep defaults safe for development; require confirmation for production-destructive operations.

## Completion Status
- [ ] 0% - Not Started
- [x] 100% - Completed
