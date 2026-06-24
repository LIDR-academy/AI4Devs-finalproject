<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at specs/001-guest-search-booking/plan.md
<!-- SPECKIT END -->

## Branch Protection & PR Workflow

**REQUIRED: All code changes must go through PRs on feature branches, NOT direct commits to main.**

- Create feature branch: `git checkout -b issue-22-t025-search-adapter`
- Commit and push to feature branch
- Create PR via: `gh pr create --title "..." --body "..."`
- Wait for CI to pass (Backend + Frontend tests)
- Get human approval if applicable
- Merge PR to main (do NOT force-push or commit directly)

**GitHub Branch Protection Rules (configured on main):**
- Require status checks: Backend (Gradle), Frontend (Vitest) — both must pass
- Require 1 PR review — **MUST be enabled** (currently missing; see issue #TODO)
- Dismiss stale reviews on new commits
- Require branches to be up to date before merge

**Why:** Ensures code review, test validation, and audit trail for all changes. Protects against accidental bugs, security issues, and unreviewed refactors.

**Agent/Subagent Instruction:** When dispatched, create a feature branch BEFORE any commits. Use `git checkout -b issue-XX-tYYZ-feature-name`. Push branch, create PR, do NOT commit to main.

**Close GitHub Issues:** When a task is complete and all tests pass:
```bash
gh issue close {issue-number} --comment "Completed: [summary]. Commits: [SHA list]. Tests: [results]."
```
This keeps GitHub issues synchronized with actual completed work. Include the issue reference in commit messages (e.g., `(#22-T025)`) so issues auto-link.

## Backend Architecture (Clean / Hexagonal)

**Dependency direction (only inward):**

```
presentation  ──►  application  ──►  domain
infrastructure ──►  application  ──►  domain
```

- `domain/` — pure Kotlin, no framework imports, no Spring annotations. Contains entities, value objects, and repository/service interfaces (ports).
- `application/` — use cases, depend only on domain. Includes `application/error/` for exception classes thrown by use cases.
- `infrastructure/` — outbound adapters (repos, external API clients). Implement domain ports.
- `presentation/` — inbound adapters (controllers, DTOs, error response shape). Maps HTTP ↔ application.

**Enforced by ArchUnit:** `backend/src/test/kotlin/com/stayhub/architecture/CleanArchitectureTest.kt` runs on every build and fails if:
- domain depends on any outer layer
- application imports from infrastructure or presentation
- infrastructure imports from presentation
- domain classes carry Spring stereotypes
- `@RestController` lives outside presentation
- `@Repository` lives outside infrastructure

**Common mistake to avoid:** When a use case needs to throw a validation/not-found error, import from `com.stayhub.application.error.*`, NOT `com.stayhub.presentation.error.*`. Exception classes live in application; HTTP error response shape (`ErrorResponse`) lives in presentation.

If ArchUnit fails the build with a layering violation, the fix is almost always to **move the type to a lower layer**, not to relax the rule.
