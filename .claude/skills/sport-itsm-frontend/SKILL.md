---
name: sport-itsm-frontend
description: Frontend engineering standard for Sport ITSM — the Angular/TypeScript web client for the ITSM platform supporting the Sports Competition Management System (SCMS). Use this skill whenever writing, reviewing, or structuring frontend code: standalone Angular components, signals-based state, Reactive Forms, the in-house HTML + SCSS component layer (no third-party component library), hand-written accessibility, HttpClient with functional interceptors, Transloco i18n, routing, and tests. Encodes the exact stack, conventions, commands, and guardrails.
---

# Sport ITSM — Frontend Engineering Standard

You are a Senior Frontend Engineer working on **Sport ITSM**, the ITSM platform that supports the Sports Competition Management System (SCMS). This skill is the authoritative standard for **how frontend code is written** in this repository. Apply it to every frontend change.

All code, identifiers, comments, commit messages, and technical documentation are written in **English**, using standard frontend and ITSM terminology.

> This skill governs implementation ("how"). Product behavior and functional requirements live in the specifications under `openspec/` (see `CLAUDE.md`). Never encode business requirements here.
>
> **Companion skills:** apply **`sport-itsm-architecture`** for structure (contexts, layers, boundaries) and **`sport-itsm-engineering-principles`** for class/function-level craft (SOLID, clean code). This skill only adds Angular-specific rules on top of them.

---

# Technology Stack (source of truth)

## Core
- **Angular 20.3** — **standalone components only** (no NgModules), **signals**, and the built-in **control flow** (`@if`, `@for`, `@switch`).
- **TypeScript 5.9** — **strict mode** (`strict: true`); no implicit `any`.
- **Nx 21.6** — monorepo orchestration and generators. Use Nx generators to scaffold apps/libs/components.
- **RxJS 7.8** — used **sparingly**; **signals are the default for state**. Reach for RxJS only for streams and complex async, and bridge with `toSignal()` / `toObservable()`.

## Package manager
- **pnpm** — the only supported package manager (shared Nx workspace with the backend). Use `pnpm` for installs and `pnpm nx …` for Nx targets. Do not introduce `npm`/`yarn` lockfiles.

## UI Framework
- **In-house component layer — no third-party component library.** Angular Material, Angular CDK, PrimeNG, Nebular, Bootstrap components and equivalents are **not used** and must not be introduced without an approved change. Every visual building block (button, field, dialog, menu, table, tabs, toast, badge, chip…) is authored in this repository as a **standalone Angular component with `OnPush`**, a plain HTML template and a component-scoped SCSS file, using `input()` / `output()` / `model()` signal APIs. Shared primitives live in `libs/shared/ui`; context-specific presentational components live in the per-context `type:ui` libs.
- **FullCalendar 6** — calendar/scheduling view. Domain-specific library, not a generic component library — allowed.
- **Leaflet** — maps for venue locations. Domain-specific library, not a generic component library — allowed.
- **SCSS** — the only styling technology: **centralized design tokens** exposed as CSS custom properties (color, spacing, typography, radius, elevation, motion, z-index) in the app-level theme, consumed by component-scoped styles. No hardcoded colors/spacing in components, no `::ng-deep`, no global element overrides outside the theme layer.
- **Accessibility is hand-written** — native semantics first, then ARIA, keyboard handling and focus management implemented in our own components (see *HTTP, Errors & Accessibility* below). There is no CDK helper to fall back on, so a11y is part of every component's definition of done.

## State & Data
- **Angular Signals** — primary local **and** shared state. Shared state lives in injectable services exposing `signal`/`computed`; expose read-only signals (`.asReadonly()`) and mutate through methods. **Do not** add NgRx unless a genuine need is agreed via a change.
- **Reactive Forms + signals** — always. **Never** use `[(ngModel)]` with mutable objects.
- **HttpClient** — configured via `provideHttpClient(withInterceptors([...]))` with **functional interceptors** for **JWT** and **locale** (see below). Do not use the class-based `HTTP_INTERCEPTORS` provider.

## i18n
- **Transloco** — frontend i18n for all UI strings. Never hardcode user-facing text; use translation keys.
- **Locale propagation:** a **locale interceptor** sets the **`Accept-Language`** header on outgoing requests so the backend (`nestjs-i18n`) returns error messages and emails in the matching language. Frontend UI = Transloco; backend messages = driven by the header the frontend sends.

## Change Detection
- **`ChangeDetectionStrategy.OnPush` is the default for every component**, paired with signals. Do not rely on default (Zone.js) change detection for component updates; drive the view from signals and immutable inputs.

## Testing
- **Jest** + **`jest-preset-angular`** — unit/component tests.
- **Cypress 15** + **Cucumber preprocessor** (`@badeball/cypress-cucumber-preprocessor`) — E2E and acceptance tests (Gherkin).
- **Cypress component tests** — for shared UI components (where set up).
- **Coverage target: 80%** lines/branches/functions/statements for changed libraries — matches the backend standard. Enforced wherever a `coverageThreshold` is configured; treat 80% as the minimum bar for new/changed code.

## Dev Tools
- **ESLint 9** + **`angular-eslint`** — linting plus Angular-specific rules; also enforces Nx **module boundaries**. Never disable boundary rules to work around a bad dependency — fix the dependency.
- **Prettier 3** — single quotes, semicolons. Formatting is Prettier's job; do not hand-format or add stylistic ESLint rules that conflict with Prettier.
- **Angular Language Service** — IDE template intelligence.

---

# Angular Conventions (Angular 20 idiomatic)

- **Standalone only** — no `NgModule`s. Bootstrap with `bootstrapApplication` and `provide*` functions (`provideRouter`, `provideHttpClient`, `provideAnimations`, Transloco providers, etc.).
- **Control flow** — use `@if` / `@for` / `@switch`, never the legacy `*ngIf` / `*ngFor` / `*ngSwitch`. Always provide `track` in `@for`.
- **Signal APIs** — use `input()` / `output()` / `model()` and `viewChild()`/`contentChild()` signal queries instead of the decorator forms. Derive state with `computed()`; run side effects with `effect()` sparingly.
- **Dependency injection** — prefer the **`inject()`** function over constructor injection.
- **Components** — keep them presentational and thin; put orchestration/data access in injectable services (feature/data-access libs). One responsibility per component.

# Architecture & Monorepo Conventions

> **Cross-cutting architecture (DDD + Hexagonal + Nx tags/boundaries) is defined by the `sport-itsm-architecture` skill — defer to it for bounded contexts, tag scheme, and the dependency-constraint matrix.** This section only maps those rules to Angular.

- **Nx monorepo** shared with the backend. Frontend code is organized by **bounded context** and **type** — **`type:feature`**, **`type:ui`** (presentational components), **`type:data-access`** (HttpClient + signals state), and **`type:util`** — under `libs/<context>/…`, with the app shell in `apps/web/`.
- **Hexagonal → Angular mapping:** the web app is an **inbound adapter** to the backend. `data-access` libs are the outbound edge (HttpClient calls typed by the shared `contracts` lib); `feature` libs orchestrate; `ui` libs are pure presentation. Keep components thin; no cross-context deep imports.
- Consume the shared **`libs/shared/contracts`** types for all HTTP calls so frontend and backend stay in lockstep.
- Respect **module boundaries** enforced by ESLint. Import across projects only through each library's public `index.ts` barrel; never deep-import internals.
- Use **Nx generators** to scaffold libs/components so structure and tags stay consistent.

# HTTP, Errors & Accessibility (baseline — mandatory)

- **Functional interceptors** via `withInterceptors([...])`: a **JWT interceptor** (attaches the bearer token) and a **locale interceptor** (sets `Accept-Language`).
- **Global error handling**: a global **`ErrorHandler`** plus an **HTTP error interceptor** that maps failures to user-facing, Transloco-translated messages. Views expose explicit **loading / error / empty** states — never leave the UI in an undefined state on failure.
- **Accessibility — implemented by hand, target WCAG 2.1 AA.** No CDK a11y helpers are available, so each component owns its own accessible behavior:
  - **Native semantics first** — `<button>`, `<a href>`, `<input>`/`<label>`, `<table>`, `<dialog>`, headings and landmarks before any `role`. Only add ARIA when no native element expresses the pattern.
  - **Correct roles and states** — `role`, `aria-expanded`, `aria-selected`, `aria-current`, `aria-controls`, `aria-describedby`, `aria-invalid`/`aria-errormessage` on form controls, `aria-disabled` (never a bare `disabled` on something that must stay focusable).
  - **Keyboard interaction per the WAI-ARIA Authoring Practices** for each pattern (menu, listbox, combobox, tabs, dialog, tree, grid): arrow-key navigation with **roving `tabindex`**, `Home`/`End`, `Enter`/`Space` activation, `Escape` to dismiss. Nothing is mouse-only.
  - **Focus management written explicitly** — overlays (dialog, drawer, menu, popover) implement their own **focus trap** (cycle `Tab`/`Shift+Tab` across the focusable set), move focus to the overlay on open, **restore focus to the invoking element on close**, and mark background content `inert`/`aria-hidden`. Visible `:focus-visible` styling everywhere.
  - **Async announcements** — a shared, hand-written live-region service in `libs/shared/ui` renders `aria-live="polite"` (and `assertive` for errors) regions so loading, save, validation and SLA-breach state changes reach assistive tech.
  - Verify with keyboard-only walkthroughs and automated axe checks in Cypress.

# Styling
- **SCSS only, token-driven.** A single centralized theme layer declares the **design tokens** as CSS custom properties (color roles, spacing scale, typography scale, radii, elevation, motion durations, z-index layers) plus SCSS mixins/functions for reuse; components consume tokens (`var(--…)`) and never hardcode raw values.
- **Component-scoped styles** — one `.scss` per component, default view encapsulation. **Never** use `::ng-deep`; expose customization points as tokens or `input()`-driven classes instead. Global CSS is limited to the reset/base and the token layer.
- **Responsive layout** with CSS Grid/Flexbox and container/media queries driven by token breakpoints — no layout utility library.
- Support light/dark and high-contrast by re-declaring token values, not by branching component styles.

---

# Common Commands (pnpm + Nx)

> Exact target names live in `project.json`/`package.json`. Canonical forms:

- Install: `pnpm install`
- Serve the web app (dev): `pnpm nx serve <app>`
- Build: `pnpm nx build <app>`
- Unit/component tests (Jest): `pnpm nx test <project>`
- Lint: `pnpm nx lint <project>`
- E2E (Cypress + Cucumber): `pnpm nx e2e <app>-e2e`
- Affected checks: `pnpm nx affected -t lint test build`
- Scaffold: `pnpm nx g @nx/angular:library …` / `@nx/angular:component …`

---

# What NOT to do (guardrails)

- **Do NOT** create `NgModule`s — standalone components and `provide*` only.
- **Do NOT** use legacy structural directives (`*ngIf`/`*ngFor`/`*ngSwitch`) — use `@if`/`@for`/`@switch` (with `track`).
- **Do NOT** use `[(ngModel)]` with mutable objects — use Reactive Forms + signals.
- **Do NOT** default to RxJS for state — signals first; bridge with `toSignal`/`toObservable` when needed.
- **Do NOT** use class-based `HTTP_INTERCEPTORS` — use functional interceptors with `withInterceptors`.
- **Do NOT** hardcode user-facing strings — use Transloco keys.
- **Do NOT** ship components without `OnPush`.
- **Do NOT** swallow HTTP errors or leave undefined loading/error states.
- **Do NOT** ship inaccessible UI (missing keyboard support, focus management, or ARIA).
- **Do NOT** introduce a third-party component library — Angular Material, Angular CDK, PrimeNG, Nebular, Bootstrap components, Tailwind UI kits or equivalents — without an approved change. Build the component in `libs/shared/ui` or the context's `type:ui` lib instead. (`FullCalendar` and `Leaflet` are domain-specific and stay.)
- **Do NOT** use `::ng-deep`, hardcode colors/spacing/typography in component styles, or add global CSS outside the reset/token layer — style through the centralized design tokens.
- **Do NOT** deep-import across Nx projects or disable ESLint module-boundary rules.
- **Do NOT** hand-format against Prettier, or add stylistic ESLint rules that conflict with it.
- **Do NOT** introduce `npm`/`yarn` lockfiles or a second package manager.
- **Do NOT** add NgRx or another state library without an approved change.
- **Do NOT** bump pinned majors (Angular 20, RxJS 7, Nx 21, etc.) without an approved change.
