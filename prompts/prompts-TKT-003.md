## PROMPT 1: Prompt execution (TKT-003)
~~~markdown
You are acting as a **Senior Full-Stack Software Engineer** working on the **RealSaveFooding** project.

Your task is to **implement the third ticket provided in the current context**.

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

## PROMPT 2: Fix DATABASE_URL and validate Prisma
I want you to fix the issue withDATABASE_URL, remember that is in Docker Compose and it should point to the correct database service. After fixing that, validate that Prisma can connect to the database and run migrations successfully. Provide the updated Docker Compose configuration and any relevant logs from the Prisma validation process.

## PROMPT 3: After Manual validation, I want to switch from local adapters to S3/TextExtract
After successfully validating the Prisma connection and running migrations, the next step is to switch from local file storage adapters while preserving the same ports and endpoints to using S3 for file storage and TextExtract for OCR processing. This involves updating the backend services to integrate with S3 for storing files and TextExtract for OCR processing. Please provide the updated code snippets for the backend services, any necessary configuration changes, and instructions on how to test the new integrations to ensure they are working correctly. 

## MANUAL: Creating IAM user and S3 bucket for RealSaveFooding
Region: eu-west-1
Bucket: realsavefooding-s3-test-202982075698-eu-west-1-an

## PROMPT 4: Guide for Safe IAM User Creation
When creating an IAM user for S3 access, it is crucial to follow best practices to ensure security. Here are the steps to create a minimal IAM user with upload permissions only.

## MANUAL: IAM User Creation Steps
ACCESS_KEY: AKIA........UTNAQ2
Secret: aweT6EZ................4iSxjHEM

## PROMPT 4: Validating S3 and TextExtract Integration
After updating the backend services to integrate with S3 and TextExtract, it is essential to validate the integration by testing the full flow of uploading a receipt, storing it in S3, and processing it with TextExtract. Please provide a step-by-step guide on how to perform this validation, including any necessary API calls, expected responses, and how to verify that the receipt is correctly stored in S3 and that TextExtract is processing it as expected. Additionally, include any relevant logs or outputs that should be monitored during this validation process to ensure that the integration is functioning correctly.
Use ticket located at: tests/e2e/Test-Ticket.png and keep the system running for manual validation.