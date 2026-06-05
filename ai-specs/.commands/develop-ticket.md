Please analyze and fix the Jira ticket: $ARGUMENTS.

Follow these steps:

1. Understand the problem described in the ticket
2. Read `ai-specs/specs/base-standards.mdc` and the relevant standards (`mobile-standards.mdc`, `firebase-standards.mdc`)
3. Search the codebase for relevant files under `lib/`
4. Start a new branch using the ticket ID (e.g. `feature/SCRUM-1-mobile` or `feature/SCRUM-1-firebase`)
5. Implement changes following TDD: failing tests first, then code; use `bloc_test` for BLoC logic
6. Ensure code passes `dart format`, `flutter analyze`, and `flutter test`
7. Update technical documentation in Spanish where required (`documentation-standards.mdc`)
8. Stage only files affected by the ticket. Commit message in **Spanish**
9. Push and create a PR linked to the ticket ID; PR title and body in **Spanish**

Use the GitHub CLI (`gh`) for all GitHub-related tasks.
