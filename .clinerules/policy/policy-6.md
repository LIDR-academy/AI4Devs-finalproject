---
trigger: always_on
---

## 5.2 Test Scoping Guidelines

1.  **Unit Tests**:
    *   **Focus**: Test individual functions, methods, or classes in isolation from the code base. Specifically do not test package API methods directly they should be covered by the package tests themselves.
    *   **Mocking**: Mock all external dependencies of the unit under test.
    *   **Scope**: Verify the logic within the unit, including edge cases and error handling specific to that unit.

2.  **Integration Tests**:
    *   **Focus**: Verify the interaction and correct functioning of multiple components or services working together as a subsystem.
    *   **Example**: Testing a feature that involves an API endpoint, a service layer, database interaction, and a job queue.
    *   **Mocking Strategy**:
        *   Mock external, third-party services at the boundary of your application (e.g., external APIs like Firecrawl, Gemini).
        *   For internal infrastructure components (e.g., database, message queues like pg-boss), prefer using real instances configured for a test environment rather than deep mocking of their client libraries. This ensures tests are validating against actual behavior.
    *   **Starting Point for Complex Features**: For features involving significant component interaction, consider starting with integration tests to ensure the overall flow and orchestration are correct before (or in parallel with) writing more granular unit tests for individual components.

3.  **End-to-End (E2E) Tests**:
    *   **Focus**: Test the entire application flow from the user's perspective, typically through the UI.
    *   **Scope**: Reserved for critical user paths and workflows.

## 5.3 Test Plan Documentation and Strategy

1.  **PBI-Level Testing Strategy**:
    *   The Conditions of Satisfaction (CoS) listed in a PBI detail document (`docs/delivery/<PBI-ID>/prd.md`) inherently define the high-level success criteria and scope of testing for the PBI. Detailed, exhaustive test plans are generally not duplicated at this PBI level if covered by tasks.
    *   The task list for a PBI (e.g., `docs/delivery/<PBI-ID>/tasks.md`) **must** include a dedicated task, typically named "E2E CoS Test" or similar (e.g., `<PBI-ID>-E2E-CoS-Test.md`).
    *   This "E2E CoS Test" task is responsible for holistic end-to-end testing that verifies the PBI's overall CoS are met. This task's document will contain the detailed E2E test plan, encompassing functionality that may span multiple individual implementation tasks within that PBI.

2.  **Task-Level Test Plan Proportionality**:
    *   **Pragmatic Principle**: Test plans must be proportional to the complexity and risk of the task. Avoid over-engineering test plans for simple tasks.
    *   **Simple Tasks** (constants, interfaces, configuration):
        *   Test plan should focus on compilation and basic integration
        *   Example: "TypeScript compilation passes without errors"
    *   **Basic Implementation Tasks** (simple functions, basic integrations):
        *   Test plan should verify core functionality and error handling patterns
        *   Example: "Function can be registered with system, basic workflow works, follows existing error patterns"
    *   **Complex Implementation Tasks** (multi-service integration, complex business logic):
        *   More detailed test plans with specific scenarios and edge cases
        *   Should still avoid excessive elaboration unless truly warranted by risk

3.  **Test Plan Documentation Requirements**:
    *   **Requirement**: Every individual task that involves code implementation or modification **must** include a test plan, but the detail level should match the task complexity.
    *   **Location**: The test plan must be documented within a "## Test Plan" section of the task's detail document.
    *   **Content for Simple Tasks**:
        *   Success criteria focused on basic functionality and compilation
        *   No elaborate scenarios unless complexity warrants it
    *   **Content for Complex Tasks**:
        *   **Objective(s)**: What the tests for this specific task aim to verify
        *   **Test Scope**: Specific components, functions, or interactions covered
        *   **Environment & Setup**: Relevant test environment details or setup steps
        *   **Mocking Strategy**: Definition of mocks used for the task's tests
        *   **Key Test Scenarios**: Scenarios covering successful paths, expected failure paths, and edge cases *relevant to the task's scope*
        *   **Success Criteria**: How test success/failure is determined for the task
    *   **Review**: Task-level test plans should be reviewed for appropriateness to task complexity
    *   **Living Document**: Test plans should be updated if task requirements change significantly
    *   **Task Completion Prerequisite**: A task cannot be marked as "Done" unless the tests defined in its test plan are passing

4.  **Test Distribution Strategy**:
    *   **Avoid Test Plan Duplication**: Detailed edge case testing and complex scenarios should be concentrated in dedicated E2E testing tasks rather than repeated across individual implementation tasks
    *   **Focus Individual Tasks**: Individual implementation tasks should focus on verifying their specific functionality works as intended within the broader system
    *   **Comprehensive Testing**: Complex integration testing, error scenarios, and full workflow validation belongs in dedicated testing tasks (typically E2E CoS tests)