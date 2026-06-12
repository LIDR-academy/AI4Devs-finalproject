---
name: backend-feature
description: Implement a RunMarket backend feature with clean architecture (Controller→Service→Repository→Prisma), TDD, Zod input validation, and backend OWASP rules. Tests with Jest + Supertest. Used by backend-developer.
---

# Backend Feature

Build a backend capability for RunMarket: Express 4 + TypeScript (strict) + Prisma 5
over PostgreSQL 16, validated with Zod, tested with Jest + Supertest.

Always combine with `.claude/skills/tdd-implementation/SKILL.md` (TDD is obligatory).

**Read first:** `docs/ARCHITECTURE.md` (layers, domain services, contracts) and
`docs/CODING-STANDARDS.md` (file/layer rules, naming, Zod, domain errors).

---

## Flow

1. **Use case** — restate the behaviour and the API contract (method, path,
   request/response, status codes) from the backlog task and `docs/ARCHITECTURE.md`.
2. **Layers** — design top-down, implement test-first per layer.
3. **TDD** — failing test → minimal code → refactor green at each layer.
4. **Input validation** — Zod schema at the controller boundary.
5. **Backend OWASP** — apply the rules below.
6. **Tests** — Supertest for the endpoint, Jest unit for the service (mocked repo).

---

## Clean architecture (never skip a layer)

```
Controller → Service → Repository → Prisma → PostgreSQL
```

- **Controller** — parse + validate request (Zod `.strict()`), call the service, map
  the result to an HTTP response. **Never imports Prisma.** No business logic.
- **Service** — business rules only. **Never imports Express or Prisma.** Depends on
  a repository interface. Unit-tested with a **mocked repository**.
- **Repository** — the only layer touching Prisma. **Maps Prisma rows to domain
  types**; upper layers never see Prisma-generated types.
- One file per resource per layer, kebab-case: `products.controller.ts`,
  `catalog.service.ts`, `product.repository.ts`.

Breaking this hierarchy makes unit tests impossible — it is a blocker, not a style
preference.

---

## Naming & conventions (inline — from CODING-STANDARDS.md)

- [ ] **Endpoint ↔ method naming** (§2.7): `GET /api/products` → `list()`/`getProducts()`;
      `/:id` → `getById()`/`getProductById()`; `POST /api/cart` → `addItem()`;
      `PUT|DELETE /api/cart/:productId` → `updateItem()`/`removeItem()`;
      `POST /api/checkout` → `process()`/`processCheckout()`.
- [ ] **Repository interface** co-located with its impl and `I`-prefixed
      (`export interface IProductRepository` + `export class ProductRepository`).
- [ ] **Zod schemas** in `schemas/` (never inline); derive the type with `z.infer`.
- [ ] **Domain errors** (`NotFoundError`, `StockError`, `ValidationError`) in
      `types/errors.ts`, thrown by the service, mapped to HTTP by the error handler.
- [ ] **Named exports everywhere** (`export { app }`, `export { healthRouter }`, etc.);
      `export default` only in Next.js page/layout files. No `any`. Repository returns
      domain types only.
- [ ] **Test files co-located** with the source they test: `catalog.service.test.ts`
      next to `catalog.service.ts`, `product.repository.test.ts` next to
      `product.repository.ts`, etc. Never put tests in a separate `__tests__/` folder.

---

## Backend OWASP rules (inline — from CLAUDE.md)

- [ ] **Price/total never trusted from client** — read `price` from
      `ProductRepository` at order creation; ignore any `price` in the body.
- [ ] **Zod `.strict()`** at every API boundary; never `.passthrough()`.
- [ ] **Raw SQL only via Prisma tagged templates** (`$queryRaw\`... ${id}\``); never
      string concatenation.
- [ ] **CORS** origin from `CORS_ORIGIN`; `*` only in local dev.
- [ ] **`sessionId` via `crypto.randomUUID()`** (delivered in a cookie) — never `Math.random()`/timestamps.
- [ ] **Error handler** returns generic `{ error }`; Prisma codes/stack to logger only.
- [ ] **Stock re-validated** in `CheckoutService.processCheckout()` inside a Prisma
      transaction.
- [ ] **Rate limiting** on `POST /api/checkout`, `POST /api/cart`, `PUT /api/cart/:productId`
      (≈20 req/min/IP on checkout) via `express-rate-limit`.
- [ ] **No PII in logs** — exclude `email`, `phone`, `shippingAddress`, `cardNumber`,
      `cardCVV`; custom Morgan format excludes the `/api/checkout` body.

---

## Definition of done

- Named Supertest/Jest tests green; full suite green (paste output).
- All applicable OWASP checks above satisfied.
- Layer boundaries respected; repository returns domain types.
- Backlog task marked `- [x] Implementado`.
