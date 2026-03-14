# TASK-US-202-03: Implement Build Commands

Implement Docker image listing, build, and tagging/retagging commands used by the deployment CLI scripts.

[Trello Card](https://trello.com/c/Ts2wQ3ml)
[Pull Request](https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/pull/30)

## Parent User Story
[US-202: Deployment Scripts](../../user-stories/infrastructure/US-202-deployment-scripts.md)

## Description
Add reusable command handlers in Bash and PowerShell scripts for listing images, building version-tagged images, and renaming/retagging images for release workflows.

## Priority
🟠 High

## Estimated Time
1.5 hours

## Detailed Steps
1. Implement `List Images` command wrapper around `docker images` with optional filtering.
2. Implement `Build Images` flow supporting version tag inputs and dry-run mode.
3. Add tagging strategy (`latest`, semantic version, environment suffix) with validation.
4. Implement `Tag/Rename Image` command using `docker tag` and input checks.
5. Add optional registry prefix support for tagged outputs.
6. Ensure command failures are logged and surfaced with clear error messages.

## Acceptance Criteria
- [x] Both scripts can list existing Docker images.
- [x] Both scripts can build images with version tags.
- [x] Both scripts can retag images safely with validation.
- [x] Dry-run mode shows intended commands without executing.
- [x] Errors are handled and logged consistently.

## Notes
- Keep tagging logic centralized to avoid divergence between script variants.
- Validate image references before executing mutation commands.

## Completion Status
- [ ] 0% - Not Started
- [x] 100% - Completed
