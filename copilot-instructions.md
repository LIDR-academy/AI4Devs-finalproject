# Copilot Instructions

This project follows strict guidelines for development. Please refer to the specific sections below for detailed instructions.

## 📚 Documentation Sections

1.  **[Tech Stack & Dependencies](./.copilot/tech-stack.md)**: Details on Node.js, Vue 3, Nuxt, Express, Prisma, and infrastructure.
2.  **[Git Workflow](./.copilot/git-workflow.md)**: Git Flow model, English commits, and branching strategy.
3.  **[Coding Standards](./.copilot/coding-standards.md)**: Naming conventions, error handling, and separation of concerns.
4.  **[Testing Strategy](./.copilot/testing-strategy.md)**: TDD for Backend (Jest), Post-code tests for Frontend (Vitest/Playwright).
5.  **[Architecture](./.copilot/architecture.md)**: System design, role separation (API vs Worker), and OpenAPI specs.

## 🚀 Quick Rules for AI Assistant

*   **Role:** Expert Full Stack Developer (Node.js/Vue).
*   **Language:** Always respond and generate code using **English** for variable/function names.
*   **Testing:** 
    *   If working on **Backend**: Ask for the test case *first* or generate the test *first* (TDD).
    *   If working on **Frontend**: Implement the feature first, then offer to generate Vitest/Playwright tests.
    *   **Maintainability**: Define CSS classes and DOM values as variables at the start of tests using behavior-related names (e.g., `const errorBorderClass = 'border-red-500'`).
*   **Docs:** Update OpenAPI specs when modifying API endpoints.
*   **Refactoring:** Always prefer extracting logic to Services (Backend) or Composables (Frontend). Do not bloat Controllers or Vue Components.

## 🛠 Active Configuration & Implementation Details (Feb 2026)

### 1. API Routing & Static Files
*   **Base URL:** All backend routes are now strictly under `/api` (previously `/api/v1`).
    *   Example: `POST /api/auth/login`
    *   Example: `GET /api/projects/:id/plans/:planId`
*   **Static Assets:** The backend serves uploaded files directly from the local filesystem.
    *   **Mount Path:** `/uploads` -> `process.cwd()/uploads`
    *   **Public URL:** `http://localhost:4000/uploads/plans/...`
    *   **Transformer:** `PrismaPlanRepository` transforms absolute disk paths to public URLs before returning to client.

### 2. Frontend (Nuxt)
*   **PDF.js:** Uses dynamic import via `unpkg` to avoid SSR `DOMMatrix` errors and 404s on local workers.
    *   Worker Source: `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`
*   **State Management:** `usePlansStore` implements a **hybrid loading strategy**:
    1.  Loads cached/local plan data immediately for UX (Title, basic info).
    2.  Always performs a background fetch to `/api/projects/:pid/plans/:id` to retrieve full Layer entities.
*   **Security:** `helmet` is configured with `{ crossOriginResourcePolicy: { policy: "cross-origin" } }` to allow the Frontend (port 3000) to load images from Backend (port 4000).

### 3. Worker Service
*   **PDF Processing:** Uses `ghostscript` (via `child_process`) to rasterize specific PDF pages into PNGs.
    *   Resolution: 300 DPI (`-r300`).
    *   Device: `png16m` (24-bit color).
*   **Shared Types:** Uses `@trace/core` for `LayerProcessingJob` interface.
    *   Includes `pageNumber` for multi-page PDF support.
*   **Error Handling:** Updates Layer status to `ERROR` if `sharp` or `ghostscript` fails.

### 4. Database & Prisma
*   **Shared Schema:** The `schema.prisma` is maintained in `apps/backend` and copied to `apps/worker` during build/setup.
*   **Migrations:** Managed solely by the Backend service.
