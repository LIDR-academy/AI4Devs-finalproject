# PROMPT 1: Prompt execution (TKT-002)
You are acting as a **Senior Full-Stack Software Engineer** working on the **RealSaveFooding** project.

Your task is to **implement the second ticket provided in the current context**.

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

PROMPT 2: Edge Cases and Manual Validation
Run backend and frontend test all edge cases and error handling paths. Keep it running for me to manual validate the implemented feature works as expected. 

PROMPT 3: Fixing Issues Found in Manual Testing
After manual Test:
The Manual entry button is not working so Add-item form is not being shown.
I got this error
~~~
react-dom_client.js?v=f31b247e:3920 Uncaught Error: Hydration failed because the server rendered HTML didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

https://react.dev/link/hydration-mismatch

  ...
    <OutletImpl>
      <Suspense fallback={null}>
        <MatchImpl matchId="/add/add">
          <MatchView router={{...}} matchId="/add/add" resetKey={0} matchState={{routeId:"/add", ...}}>
            <SafeFragment>
              <SafeFragment fallback={null}>
                <SafeFragment getResetKey={function getResetKey} errorComponent={function ErrorComponent} ...>
                  <SafeFragment fallback={function fallback}>
                    <MatchInnerImpl matchId="/add/add">
                      <Lazy>
                        <AddPage>
                          <AppShell title="Add">
+                           <div className="min-h-screen bg-background">
              ...
~~~
