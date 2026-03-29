# Testing Strategy

## Backend (`apps/backend`)
*   **Approach:** TDD (Test Driven Development). **Write tests BEFORE implementation.**
*   **Framework:** Jest.
*   **Scope:** 
    *   Unit tests for Services and Utils.
    *   Integration tests for API endpoints (Supertest + Jest).

## Frontend (`apps/frontend`)
*   **Approach:** Tests written **AFTER** implementation.
*   **Unit/Component Tests:**
    *   **Framework:** Vitest.
    *   **Focus:** Logic in composables/stores and critical component interactions.
*   **End-to-End (E2E) Tests:**
    *   **Framework:** Playwright.
    *   **Focus:** Critical user journeys (Login, Upload, View Project).

## Worker (`apps/worker`)
*   **Approach:** Integration tests for job processors.
*   **Framework:** Jest.

## Code Generation Standards
*   **Mocking Strategy:** Prefer direct library mocks/stubs or dependency injection over mocking entire modules in every test file to improve performance and readability.
*   **Factories:** Implement and use the **Factory Pattern** for creating model instances (e.g., UserFactory) to ensure test data reusability and consistency.
*   **Naming Convention:** Use descriptive test names that clearly indicate the scenario and expected result (e.g., `it('should return 201 when user registers with valid data')`).
*   **Structure:** Strictly follow the **Arrange-Act-Assert** (AAA) pattern in all test cases to maintain clarity.
