# Subtask Templates — Backlog Generator

Templates are selected automatically based on the story type and the detected stack.

---

## Frontend Subtask

### ST-{story}-FE-{n}: {title}
> Category: Frontend
> Size: {XS/S/M/L}
> Estimated Time: {range}
> Depends On: {subtask-ids or "none"}

**Description**: {what needs to be built or changed}

**Scope**:
- Components: {list of UI components}
- State: {state management changes}
- Styling: {CSS/design token changes}
- Responsive: {breakpoint-specific work}

**Definition of Done**:
- [ ] Component renders correctly in all states (loading, empty, error, success)
- [ ] Responsive layout works at mobile, tablet, and desktop breakpoints
- [ ] Keyboard navigation and screen reader tested
- [ ] Unit tests written and passing
- [ ] Visual regression test added (if applicable)
- [ ] Code reviewed and approved

---

## Backend Subtask

### ST-{story}-BE-{n}: {title}
> Category: Backend
> Size: {XS/S/M/L}
> Estimated Time: {range}
> Depends On: {subtask-ids or "none"}

**Description**: {what needs to be built or changed}

**Scope**:
- Endpoints: {API endpoints affected}
- Business Logic: {domain rules to implement}
- Data Model: {entities/fields to add or modify}
- Integrations: {external services involved}

**Definition of Done**:
- [ ] API endpoint implemented and documented
- [ ] Business logic validated against acceptance criteria
- [ ] Database migration created and tested (if applicable)
- [ ] Input validation and error handling implemented
- [ ] Unit tests written and passing (≥80% coverage for new code)
- [ ] Integration tests written for external dependencies
- [ ] API documentation updated (OpenAPI/Swagger)
- [ ] Code reviewed and approved

---

## Testing Subtask

### ST-{story}-QA-{n}: {title}
> Category: Testing
> Size: {XS/S/M/L}
> Estimated Time: {range}
> Depends On: {subtask-ids or "none"}

**Description**: {what needs to be tested}

**Scope**:
- Unit Tests: {components/modules to test}
- Integration Tests: {flows/endpoints to test}
- E2E Tests: {user scenarios to automate}
- Edge Cases: {specific edge cases to cover}

**Definition of Done**:
- [ ] Test plan documented with scenarios
- [ ] Unit tests cover all new business logic
- [ ] Integration tests cover API contracts
- [ ] E2E tests cover the happy path + critical error paths
- [ ] Edge cases from AC scenarios covered
- [ ] Test results documented
- [ ] No critical/high bugs remaining

---

## Infrastructure Subtask

### ST-{story}-INFRA-{n}: {title}
> Category: Infrastructure
> Size: {XS/S/M/L}
> Estimated Time: {range}
> Depends On: {subtask-ids or "none"}

**Description**: {what needs to be set up or changed}

**Scope**:
- Resources: {cloud resources to provision}
- Pipeline: {CI/CD changes}
- Config: {environment variables, secrets}
- Monitoring: {alerts, dashboards}

**Definition of Done**:
- [ ] Infrastructure provisioned and accessible
- [ ] CI/CD pipeline updated and validated
- [ ] Environment variables and secrets configured
- [ ] Monitoring and alerting configured
- [ ] Rollback procedure documented
- [ ] Security review completed (if applicable)
- [ ] Code reviewed and approved

---

## UX/Design Subtask

### ST-{story}-UX-{n}: {title}
> Category: UX/Design
> Size: {XS/S/M/L}
> Estimated Time: {range}
> Depends On: {subtask-ids or "none"}

**Description**: {what needs to be designed or prototyped}

**Scope**:
- Screens: {screens/views to design}
- Flows: {user flows to map}
- Components: {design system components to create/update}
- Assets: {icons, illustrations, images needed}

**Definition of Done**:
- [ ] User flow documented and validated
- [ ] Wireframes/mockups created for all screens
- [ ] Interactive prototype built (if applicable)
- [ ] Design tokens defined and documented
- [ ] Usability review completed
- [ ] Developer handoff ready (specs, assets exported)
- [ ] Reviewed and approved by stakeholder
