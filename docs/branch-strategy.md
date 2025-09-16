# Git Branch Strategy

## Overview

This document outlines our Git branch strategy for the Couple's Financial Management System project. We follow a hierarchical branching model that ensures code quality through multiple stages of testing and review.

## Branch Hierarchy

```
production (main branch)
├── uat (User Acceptance Testing)
├── dev (Development integration)
    ├── epic/<epic-name>
        ├── story/<story-id>
            └── task/<task-id>
```

## Branch Types and Purpose

### 1. Production Branch (`production`)

- **Purpose**: Contains production-ready code
- **Formerly**: `main` branch (to be renamed)
- **Merges from**: `uat` branch only
- **Protected**: Yes - requires PR approval and passing tests

### 2. UAT Branch (`uat`)

- **Purpose**: User Acceptance Testing environment
- **Created from**: `production`
- **Merges from**: `dev` branch only
- **Merges to**: `production`
- **Testing**: Integration and acceptance testing

### 3. Development Branch (`dev`)

- **Purpose**: Development integration and testing
- **Created from**: `production`
- **Merges from**: Epic branches
- **Merges to**: `uat`
- **Testing**: Developer integration testing

### 4. Epic Branches (`epic/<epic-name>`)

- **Purpose**: Contains all work for a specific epic
- **Created from**: `dev`
- **Merges from**: User story branches
- **Merges to**: `dev`
- **Naming convention**: `epic/epic-0-development-environment`
- **Lifecycle**: Lives until all user stories in the epic are complete

### 5. User Story Branches (`story/<story-id>`)

- **Purpose**: Implementation of a specific user story
- **Created from**: Parent epic branch
- **Merges from**: Task branches
- **Merges to**: Parent epic branch
- **Naming convention**: `story/US1.1-account-registration`
- **Lifecycle**: Lives until all tasks for the story are complete

### 6. Task Branches (`task/<task-id>`)

- **Purpose**: Implementation of specific tasks
- **Created from**: Parent user story branch
- **Merges to**: Parent user story branch
- **Naming convention**: `task/US1.1-T1-create-user-model`
- **Lifecycle**: Short-lived, deleted after merge

## Git Flow Process

### 1. Starting New Work

```bash
# Starting a new epic from dev
git checkout dev
git pull origin dev
git checkout -b epic/epic-1-user-management

# Starting a new user story from epic
git checkout epic/epic-1-user-management
git pull origin epic/epic-1-user-management
git checkout -b story/US1.1-account-registration

# Starting a new task from user story
git checkout story/US1.1-account-registration
git pull origin story/US1.1-account-registration
git checkout -b task/US1.1-T1-create-user-model
```

### 2. Completing Work

#### Task Completion

```bash
# Complete work on task branch
git add .
git commit -m "feat: implement user model with validation"

# Merge to user story branch
git checkout story/US1.1-account-registration
git pull origin story/US1.1-account-registration
git merge task/US1.1-T1-create-user-model
git push origin story/US1.1-account-registration

# Delete task branch
git branch -d task/US1.1-T1-create-user-model
```

#### User Story Completion

```bash
# After all tasks are complete
git checkout epic/epic-1-user-management
git pull origin epic/epic-1-user-management
git merge story/US1.1-account-registration
git push origin epic/epic-1-user-management

# Delete story branch
git branch -d story/US1.1-account-registration
git push origin --delete story/US1.1-account-registration
```

#### Epic Completion

```bash
# After all user stories are complete
git checkout dev
git pull origin dev
git merge epic/epic-1-user-management
git push origin dev

# Delete epic branch
git branch -d epic/epic-1-user-management
git push origin --delete epic/epic-1-user-management
```

### 3. Promotion Flow

#### Dev → UAT

```bash
# After testing in dev environment
git checkout uat
git pull origin uat
git merge dev
git push origin uat
```

#### UAT → Production

```bash
# After UAT approval
git checkout production
git pull origin production
git merge uat
git push origin production
```

## Merge Strategy

### Pull Requests Required For:

1. Epic → Dev
2. Dev → UAT
3. UAT → Production

### Direct Merges Allowed For:

1. Task → User Story (with code review)
2. User Story → Epic (with code review)

## Pull Request Template

### PR Title Format

Use Jira issue format:

- `AI4DFP-123: [Ticket description]`

### PR Description Template

```markdown
## Jira

- **Epic**: [AI4DFP-1](https://your-jira-instance.atlassian.net/browse/AI4DFP-1) - Epic Name
- **Story**: [AI4DFP-124](https://your-jira-instance.atlassian.net/browse/AI4DFP-124) - Story Name
- **Issue**: [AI4DFP-123](https://your-jira-instance.atlassian.net/browse/AI4DFP-123)

## Summary

Brief description of what this PR accomplishes.

## Changes

- List of key changes made
- Files added/modified/deleted
- New features or fixes implemented

## Testing

- [ ] Manual testing completed
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] No regressions introduced

## Coverage

| File         | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines |
| ------------ | ------- | -------- | ------- | ------- | --------------- |
| path/to/file | 100%    | 100%     | 100%    | 100%    | -               |
| path/to/file | 94.11%  | 100%     | 50%     | 94.11%  | 39              |

## Screenshots/Demo

Include screenshots or demo links for UI changes.

## Deployment Notes

Any special deployment considerations or environment variables needed.

## Self-Review Checklist

- [ ] I have tested this code locally
- [ ] I have added/updated tests for new functionality
- [ ] I have reviewed my own code line-by-line
- [ ] I have checked for potential security issues
- [ ] I have updated documentation as needed
- [ ] I have considered edge cases and error handling
- [ ] I have removed all debug code and console logs

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No console.log or debug statements
```

## Best Practices

### 1. Branch Naming Conventions

- **Epic branches**: `epic/<epic-name-kebab-case>`
- **Story branches**: `story/<story-id-description>`
- **Task branches**: `task/<story-id-task-number-description>`

### 2. Commit Messages

Follow conventional commits specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Build process or auxiliary tool changes

### 3. Branch Protection Rules (Single Developer)

> **Note**: These rules are adapted for a single developer workflow, focusing on automated checks and self-review processes rather than peer approvals.

#### Production Branch

- **No approval requirements** (since self-approval isn't possible)
- Require status checks to pass:
  - All tests must pass
  - Code coverage thresholds met (e.g., 80% minimum)
  - Linting and code quality checks pass
- Require branches to be up to date before merging
- Enforce linear history (optional but recommended)
- **Mandatory PR process** with self-review checklist
- Block direct pushes (force all changes through PRs)

#### UAT Branch

- **No approval requirements**
- Require status checks to pass:
  - All tests must pass
  - Build must succeed
- Require branches to be up to date before merging
- **Mandatory PR process** for audit trail
- Consider adding deployment preview checks

#### Dev Branch

- **No approval requirements**
- Require status checks to pass:
  - Unit tests must pass
  - Linting checks pass
- **Optional PR process** (direct merges allowed for epic → dev)

#### Additional Solo Developer Safeguards

Since peer review isn't available, implement these practices:

1. **Mandatory Self-Review Checklist** in PR descriptions:

   ```markdown
   ## Self-Review Checklist

   - [ ] I have tested this code locally
   - [ ] I have added/updated tests for new functionality
   - [ ] I have reviewed my own code line-by-line
   - [ ] I have checked for potential security issues
   - [ ] I have updated documentation as needed
   - [ ] I have considered edge cases and error handling
   - [ ] I have removed all debug code and console logs
   ```

2. **Automated Code Review Tools**:

   - Set up CodeQL or similar security scanning
   - Use SonarQube or similar for code quality metrics
   - Implement dependency vulnerability scanning

3. **Time-Delayed Merges** (optional):

   - Consider implementing a "cooling-off" period where PRs must be open for at least 24 hours before merging to production
   - This allows for second thoughts and catching issues after a break

4. **Regular Code Review Sessions**:
   - Schedule weekly self-review sessions to look at recent merges
   - Consider getting periodic external code reviews for critical features

### 4. Keeping Branches Updated

```bash
# Regularly sync child branches with parent
git checkout task/current-task
git pull origin story/parent-story
git rebase story/parent-story
```

## Emergency Hotfix Process

For critical production issues:

```bash
# Create hotfix from production
git checkout production
git pull origin production
git checkout -b hotfix/critical-bug-fix

# After fix
git checkout production
git merge hotfix/critical-bug-fix
git push origin production

# Backport to uat and dev
git checkout uat
git merge hotfix/critical-bug-fix
git push origin uat

git checkout dev
git merge hotfix/critical-bug-fix
git push origin dev
```

## Initial Setup

### Rename main to production

```bash
# Rename locally
git branch -m main production

# Update remote
git push origin -u production

# Delete old main branch on remote (after updating default branch in GitHub/GitLab)
git push origin --delete main
```

### Create UAT and Dev branches

```bash
# Create UAT from production
git checkout production
git checkout -b uat
git push origin -u uat

# Create Dev from production
git checkout production
git checkout -b dev
git push origin -u dev
```

## Visual Flow Diagram

```
┌─────────────┐
│ Production  │ ← Stable, deployed code
└─────┬───────┘
      │
      ├─────────────┐
      │             │
┌─────▼─────┐ ┌────▼────┐
│    UAT    │ │   Dev   │ ← Integration testing
└─────┬─────┘ └────┬────┘
      │            │
      │       ┌────▼────┐
      │       │  Epic   │ ← Feature collection
      │       └────┬────┘
      │            │
      │       ┌────▼────┐
      │       │  Story  │ ← User story implementation
      │       └────┬────┘
      │            │
      │       ┌────▼────┐
      │       │  Task   │ ← Individual tasks
      │       └─────────┘
      │
      └─── Merge after UAT approval
```

## FAQ

### Q: Can I merge directly from epic to UAT?

A: No. All code must go through dev branch first for integration testing.

### Q: What if I need to work on multiple epics simultaneously?

A: Each epic should have its own branch from dev. Coordinate merges to avoid conflicts.

### Q: How often should we merge to production?

A: After each successful UAT cycle, typically aligned with sprint or release schedules.

### Q: What happens to completed branches?

A: Delete task branches immediately after merge. Delete story and epic branches after their completion and successful merge.

---

_Last Updated: September 2025_
_Version: 1.0_
