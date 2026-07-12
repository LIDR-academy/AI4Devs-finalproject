## What

<!-- A clear, concise description of what this PR changes. -->

## Why

<!-- The motivation behind this change. What problem does it solve?
     What requirement does it fulfill? Link to the spec or constitution principle if relevant. -->

## Impact

<!-- Describe the impact of this change:
     - Does it change any API contracts?
     - Does it affect the data model or database migrations?
     - Does it introduce new dependencies?
     - Are there any performance, security, or observability implications? -->

## References

<!-- Link to the relevant user story, task, or ticket.
     Examples:
       - User Story: US3 — Complete a Booking (spec.md)
       - Task: T054 CreateBookingUseCase
       - Issue: #123 -->

## Checklist

- [ ] Code follows the Clean Architecture layer rules (no inward → outward dependencies)
- [ ] All acceptance scenarios from the referenced user story are covered
- [ ] **Flow/test coverage:** new/changed endpoint has a per-endpoint integration test (full context, `bindToServer`); new/changed user journey is covered by the Playwright E2E — or N/A with reason
- [ ] API contract changes are reflected in `contracts/` before implementation
- [ ] No secrets, credentials, or PII in code or logs
- [ ] Structured logging with trace ID included where applicable
