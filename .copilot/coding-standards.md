# Coding Standards

## General
*   **Language:** English (Variable names, function names, comments).
*   **Naming Convention:** 
    *   `camelCase` for variables and functions.
    *   `PascalCase` for Classes and Components.
    *   `UPPER_SNAKE_CASE` for constants.
*   **Principle:** Focus on code reusability and modularity. DRY (Don't Repeat Yourself).
*   **Documentation:** 
    *   No automatic JSDoc for every function.
    *   Brief, clear comments explaining *WHY* complex logic exists.

## Error Handling
*   **Method:** `try/catch` blocks.
*   **Typing:** Use typed custom errors where possible.
*   **Backend:** Global error handler middleware in Express.
*   **Frontend:** Error boundaries or global notification store for UI feedback.

## Frontend Specifics (Vue/Nuxt)
*   **Components:** Focus on "Dumb" visual components (Presentational).
*   **Logic:** Extract business logic into composables (`useSomething.ts`), services, or Pinia stores.
*   **Templates:** Clean and readable, avoiding complex logic inside `<template>`.
*   **Styling & Design:**
    *   **Tailwind Theme:** All styles must be generated using the Tailwind configuration. Use semantic names for colors (e.g., `primary`, `secondary`, `accent`) instead of arbitrary hex codes.
    *   **Corporate Identity:** Maintain a dedicated stylesheet or config section for corporate colors and typography variables.
    *   **Responsive Design:** Mandatory support for Tablet (md) and Desktop (lg/xl) breakpoints. Mobile-first approach.

## Backend Specifics (Express)
*   **Router:** Clean route definitions delegating to Controllers.
*   **Controllers:** Parse input, call Services, handle HTTP response.
*   **Services:** Contain all business logic.
*   **Repository Pattern:** Use Prisma Client through an abstraction if needed, or directly in services but consistent.
