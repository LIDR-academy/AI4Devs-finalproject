## PROMPT 1: ChatGPT -> Meta-prompt
Refine a better prompt for this:
```text
As Full-Stack Engineer for RealSaveFooding project you need to implement the first ticket added to this context

For Architecture context get it from docs/architecture folder
For Product (functional) knowledge get it from docs/product folder

Folow the design already provided in /front

Ask me for additional details or uncertainty
```

## PROMPT 2: Prompt execution (TKT-001)
~~~markdown
You are acting as a **Senior Full-Stack Software Engineer** working on the **RealSaveFooding** project.

Your task is to **implement the first ticket provided in the current context**.

## Project Context

Before starting the implementation, gather the necessary information from the existing project documentation:

* **Architecture and technical decisions:** review all relevant documents under:

```text
docs/architecture/
```

* **Product requirements and functional specifications:** review all relevant documents under:

```text
docs/product/
```

* **Frontend implementation guidelines and design system:** analyze the existing codebase under:

```text
/front
```

The implementation must **follow the established design patterns, conventions, and coding standards already present in the project**. Avoid introducing new architectural approaches unless there is a compelling reason to do so.

---

## Objectives

1. Understand the assigned ticket and its acceptance criteria.
2. Identify the impacted layers of the application (Frontend, Backend, Database, Infrastructure).
3. Review the existing implementation to determine whether similar functionality already exists.
4. Propose an implementation plan before making changes.
5. Implement the solution following the current project architecture.
6. Ensure the implementation satisfies the ticket requirements and does not introduce unnecessary complexity.

---

## Implementation Guidelines

### General

* Follow the project's existing folder structure and conventions.
* Prioritize readability, maintainability, and consistency.
* Keep the implementation aligned with the **MVP scope** unless the ticket explicitly states otherwise.
* Do not perform speculative development or implement future requirements.

### Frontend

* Reuse existing components whenever possible.
* Follow the UI patterns already established under `/front`.
* Respect the current styling approach and component architecture.
* Avoid introducing new libraries unless absolutely necessary.

### Backend

* Follow the existing NestJS architecture and module boundaries.
* Respect separation of concerns and dependency injection principles.
* Reuse existing services, DTOs, guards, and utilities when appropriate.
* Ensure database access follows the established Prisma patterns.

### Database

* If schema changes are required:

  * Propose the necessary modifications first.
  * Explain the rationale behind them.
  * Ensure compatibility with the existing data model.
  * Follow PostgreSQL and Prisma best practices.

### Testing

* Implement or update tests that validate the new functionality.
* Reuse existing testing patterns and frameworks used by the project.
* Focus on meaningful coverage related to the ticket requirements.

---

## Expected Output

Before generating code, provide:

1. A concise summary of the ticket requirements.
2. A list of assumptions made.
3. An impact analysis describing which parts of the system will be affected.
4. A step-by-step implementation plan.

After approval (or if explicit approval is not required), provide:

1. The proposed code changes.
2. The files to be created or modified.
3. The reasoning behind significant technical decisions.
4. Any required database migrations.
5. Any updates needed to documentation or configuration files.

---

## Handling Uncertainty

If any requirement is ambiguous, conflicting, or missing, **do not make arbitrary decisions**.

Instead:

* Explicitly identify the uncertainty.
* Explain the available implementation options and their trade-offs.
* Ask targeted clarifying questions before proceeding.

The goal is to implement the ticket as an experienced engineer working within an established codebase, balancing delivery speed with sound engineering practices.
~~~

## PROMPT 3: Validation and Testing 
Run one final full backend plus frontend validation pass before you push.

## PROMPT 4: Edge Cases and Manual Validation
Run backend and frontend test all edge cases and error handling paths. Keep it running for me to manual validate the implemented feature works as expected. 

## PROMPT 5: Fixing Issues Found in Manual Testing
After manual Test:
When I open http://localhost:8080/pantry directly without being logged in (after sign out) → should redirect to /auth

Is not compliant, I can navigate without a valid login or after sign out. Please fix this and make sure to test all edge cases for protected routes.