---
description: Frontend development standards for Reading Analytics Platform — React 19, Vite, TypeScript, TanStack Query, API client, and UI conventions
globs: ["frontend/src/**/*.{ts,tsx,css}", "frontend/index.html", "frontend/vite.config.ts", "frontend/tsconfig*.json", "frontend/package.json", "frontend/eslint.config.js"]
alwaysApply: true
---

# Frontend Project Standards

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [API Layer](#api-layer)
- [Routing and Auth](#routing-and-auth)
- [State Management](#state-management)
- [UI and UX](#ui-and-ux)
- [Testing](#testing)
- [Configuration](#configuration)
- [Development Workflow](#development-workflow)

---

## Overview

The frontend is a **Vite + React 19 + TypeScript** SPA for **Reading Analytics Platform**. Current MVP surfaces: **dev login**, **Home** (books in progress, monthly KPIs, annual goal, current TBR), **Book Tracker** (library list, add-book modal with catalog search and cover picker, inline reading lifecycle: status, dates, rating, completion modal on `leido`), **Reading Stats** (`/stats` — KPIs, charts, insights, period selector), **Lists / TBR** (`/lists` — monthly TBR with month navigation, empty state, **AddToTbrModal** with Library tab (pending books only) and Search tab (catalog → create pendiente book → add entry), completed styling), **Goals** (`/goals`), **Settings** (genres, formats, audiences, theme), and **Goodreads import**. Placeholder routes: `/library`, `/recap` (UC-09/UC-10 not yet implemented).

## Technology Stack

| Area | Choice |
|------|--------|
| UI | React 19 (functional components) |
| Build | Vite 8 |
| Language | TypeScript ~6 |
| Routing | React Router 7 |
| Server state | TanStack Query 5 (`QueryClientProvider` in `App.tsx`) |
| HTTP | Native `fetch` via `frontend/src/api/client.ts` |
| Styling | Co-located CSS per page/component; **design tokens** in `frontend/src/theme/` and **base UI** in `frontend/src/components/ui/` (KAN-18) |

## Project Structure

```
frontend/
├── index.html
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx              # Router + QueryClient + AuthProvider
│   ├── index.css            # App shell; imports theme/base.css
│   ├── theme/
│   │   ├── tokens.css       # PRD palette + semantic CSS variables
│   │   └── base.css         # Global typography and focus defaults
│   ├── api/
│   │   ├── client.ts        # All HTTP calls
│   │   ├── types.ts         # API types (snake_case fields)
│   │   └── errors.ts        # ApiRequestError
│   ├── auth/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── BookTrackerPage.tsx
│   │   └── ListsPage.tsx
│   └── components/
│       ├── ui/              # Shared design-system components (Button, Card, …)
│       ├── AddBookModal.tsx
│       ├── BookTrackerRow.tsx
│       ├── CompletionModal.tsx
│       ├── CoverPicker.tsx
│       ├── InlineDateField.tsx
│       ├── ReadingStatusSelect.tsx
│       └── StarRating.tsx
└── package.json
```

## Coding Standards

### Language and naming

- **English only** for code, comments, and user-facing error strings (`docs/standards/base-standards.md`).
- Components/pages: **PascalCase** files (`AddBookModal.tsx`).
- Functions/variables: **camelCase** (`listBooks`, `isAuthenticated`).
- CSS classes: **kebab-case** (`book-tracker`, `add-book-modal`).
- API types mirror backend **snake_case** (`cover_image_url`, `reading_status`).

### TypeScript

- Strict typing for props and API responses; define interfaces in `api/types.ts`.
- Avoid `any`; use discriminated unions for error handling when useful.
- Prefer explicit return types on exported API functions.

### Components

- Functional components only; hooks for state and effects.
- Keep components focused; lift server calls to `api/client.ts` or TanStack Query hooks.
- Colocate `ComponentName.css` with `ComponentName.tsx`.

**Example structure:**

```typescript
type AddBookModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export function AddBookModal({ open, onClose, onCreated }: AddBookModalProps) {
  // local UI state; call searchCatalog / createBook from api/client
}
```

## API Layer

All backend access goes through `frontend/src/api/client.ts`.

| Function | Endpoint |
|----------|----------|
| `devLogin` | POST `/auth/dev-login` |
| `listBooks` | GET `/books` |
| `createBook` | POST `/books` |
| `searchCatalog` | GET `/books/catalog/search` |
| `fetchEditionCovers` | GET `/books/catalog/covers` |

Rules:

- Base URL: `import.meta.env.VITE_API_URL` (default `http://localhost:3000/v1`).
- Attach `Authorization: Bearer <token>` when `localStorage.access_token` is set.
- Throw `ApiRequestError` on non-OK responses; surface `message` / `code` / `existingBookId` in UI.
- Helper `catalogEditionToCreatePayload` maps catalog edition + chosen cover to `CreateBookPayload`.

When adding endpoints, update **`api/types.ts`**, **`client.ts`**, and **`docs/api-spec.yml`** together.

## Routing and Auth

- `BrowserRouter` in `App.tsx`.
- `AuthProvider` stores token and user; `useAuth()` exposes `login`, `logout`, `isAuthenticated`.
- `PrivateRoute` redirects unauthenticated users to `/login`.
- Default route redirects to `/book-tracker`.

Planned routes (align with README navigation): `/`, `/reading-stats`, `/lists`, `/goals`, `/library`, etc. — add as OpenSpec tasks ship.

## State Management

| State type | Approach |
|------------|----------|
| Auth session | `AuthContext` + `localStorage` token |
| Server data | TanStack Query (`useQuery` / `useMutation`) where adopted; invalidate on book create |
| Modal/UI | `useState` in page or component |
| Forms | Controlled inputs; validate before submit |

Avoid global stores until cross-cutting client state justifies them.

## UI and UX

### Product direction (from README)

- **Desktop-first** reading analytics (not social).
- **Style:** soft feminine / coquette — warm, clean, journaling-like.
- **Palette (tokens):** see `docs/design-system-palette.md` and `frontend/src/theme/tokens.css`. Use the full semantic set in shared chrome (sidebar accents, page title decoration, layout washes, KPI edges) as well as charts — not `--color-highlight` / `--color-accent-kpi` in charts only. Prefer soft `color-mix` tints and decorative accents so text stays WCAG 2.1 AA across user presets.
- **Accessibility:** WCAG 2.1 AA — semantic HTML, labels on inputs, keyboard access for modals, sufficient contrast when applying brand colors.

Import shared primitives from `frontend/src/components/ui/` for new UI work. Page-level restyles migrate in KAN-20+.

### Patterns

- Loading: explicit spinner or disabled buttons during `fetch`.
- Errors: user-visible messages; handle `BOOK_DUPLICATE` with clear copy.
- Empty library: helpful empty state on Book Tracker.
- Images: `cover_image_url` with alt text from book title.

Gradually replace legacy page CSS with `components/ui` and semantic tokens when touching each page (Phase 3 restyle).

## Testing

No test runner is configured in `package.json` yet. When adding tests:

- Prefer **Vitest** + **React Testing Library** for units.
- **Playwright** for E2E (see OpenSpec / MCP recommendations in `ai-specs/specboot-instructions.md`).
- Test critical flows: login, search catalog, pick cover, create book, duplicate error, PATCH reading record (status, dates, rating), completion modal.

## Configuration

### Environment

```env
VITE_API_URL=http://localhost:3000/v1
```

Only `VITE_*` variables are exposed to the client bundle.

### Vite

- Dev server: port **5173** (default).
- Proxy not required if backend CORS allows `http://localhost:5173`.

### ESLint

- Flat config in `eslint.config.js`; run `npm run lint`.

## Development Workflow

```bash
cd frontend
npm install
npm run dev
```

### Git

- English commit messages; optional `KAN-*` prefix.
- Do not commit `.env` with secrets.

### When changing UI that calls the API

1. Match `docs/api-spec.yml` contracts
2. Update `api/types.ts` and `client.ts`
3. Document manual test steps in PR or feature README

## Related documentation

- `docs/development_guide.md` — setup
- `docs/api-spec.yml` — REST contracts
- `README.md` — product palette and navigation
- `ai-specs/agents/frontend-developer.md` — planning agent
