---
name: frontend-feature
description: Implement a RunMarket frontend feature with React + TypeScript, covering the user journey, components, loading/empty/error UX states, TDD with React Testing Library, and no client-side secrets. Used by frontend-developer.
---

# Frontend Feature

Build a frontend capability for RunMarket: Next.js 14 (App Router) + React 18 +
TypeScript (strict) + Tailwind v4 + shadcn/ui, state via Context API (`sessionId` in
a server cookie, cart cached in localStorage), tested with Vitest + React Testing
Library (and Playwright for journeys).

Always combine with `.claude/skills/tdd-implementation/SKILL.md` (TDD is obligatory).

**Read first (obligatorio, en este orden):**
1. `docs/DESIGN-SYSTEM.md` — tokens de color `bg-rm-*`/`text-rm-*`, tipografía, layout,
   anatomía de componentes y mapeos dominio→etiqueta. Sin leerlo, los componentes
   divergirán visualmente del prototipo Figma Make.
2. `docs/ARCHITECTURE.md` — Server/Client Component split, estructura de directorios.
3. `docs/CODING-STANDARDS.md` — naming, Tailwind, api-client, convenciones de test.

---

## Flow

1. **Journey** — locate the step in the user journey (catalog → product → cart →
   checkout → orders) and the route/component involved.
2. **Components** — design the component tree; keep components small and typed.
   Server-first mindset: start without client state; add it only when the component
   genuinely needs state, effects, or event handlers.
3. **UX states** — handle the three explicitly plus the happy path:
   - **loading** — skeleton/spinner, layout reserved.
   - **empty** — informative message (e.g. "No se encontraron productos…").
   - **error** — non-blocking message with retry; layout must not break.
4. **TDD RTL** — failing RTL test → minimal component → refactor green.
5. **Security** — apply the client rules below.

---

## Frontend security rules (inline — from CLAUDE.md)

- [ ] **No card data in state/localStorage** — `PaymentData` lives only in the local
      state of the checkout component; discarded on completion/abandon.
- [ ] **Only** cart items and order summary may live in `CartContext`/localStorage;
      the `sessionId` lives in a server cookie, never in localStorage.
- [ ] **Sanitize URL query params** against the closed domain enums (`distance`,
      `surface`, `level`, `objective`) before using them as filters; drop unknown
      values silently — never forward them to the API.
- [ ] **`dangerouslySetInnerHTML` is forbidden** — render dynamic text via JSX, which
      escapes automatically.

---

## Naming & conventions (inline — from CODING-STANDARDS.md)

- [ ] Components **PascalCase** (`ProductCard.tsx`); hooks `useX` **camelCase**
      (`useCart.ts`); directories **kebab-case** (`catalog/`, `product/`).
- [ ] **Named exports**; explicit `interface Props` directly above the component; no
      `React.FC`. `default export` only for the page/layout files Next.js requires
      (`page.tsx`, `layout.tsx`).
- [ ] All backend calls go through `lib/api-client.ts` — **never `fetch()` directly**
      in a component; the client throws typed errors on non-2xx.
- [ ] Tailwind utility classes only; conditional variants via `cva` (no complex ternary
      class strings); no inline `style` except non-build-time dynamic values.
- [ ] `CartContext` is the only global state; form state stays local (`useState`).
- [ ] **Test files co-located** with the source they test (`product-card.tsx` →
      `product-card.test.tsx` in the same directory). Never put tests in a separate
      `__tests__/` folder. The `src/test/` directory is reserved for test
      infrastructure only (`setup.ts`, `mocks/`).

---

## RTL test guidance

- Query by role/label/text as a user would; avoid testing implementation details.
- Mock `fetch`/the API client at the boundary; assert the rendered result per state.
- Cover the three UX states as distinct tests when the task calls for it
  (e.g. `RTL: 3 estados`).
- Assert accessibility-relevant output (roles, names) where it matters.

---

## Definition of done

- Named RTL/Playwright tests green; full suite green (paste output).
- loading/empty/error states implemented and tested where applicable.
- All client security rules satisfied.
- Backlog task marked `- [x] Implementado`.
