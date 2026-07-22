# Code Constitution — TypeScript (Bun)

> Extends [`CONSTITUTION.md`](./CONSTITUTION.md). Read that first — its rules always apply.
> This file adds TypeScript-specific conventions. **Bun is the runtime, package manager, test runner, and bundler** for all TS projects (e.g. QuickChat Portal).

## 1. Bun Is the Toolchain

- Use Bun for everything it covers: `bun install`, `bun run`, `bun test`, `bun build`. Do not introduce npm/yarn/pnpm, Jest, or ts-node.
- Commit `bun.lock`. Never delete the lockfile to "fix" an install problem — escalate instead (Common §7).
- Prefer Bun's built-in APIs (`Bun.file`, `Bun.serve`, `bun:test`) over third-party equivalents when they do the job.

## 2. Strict TypeScript, No Escape Hatches

- `tsconfig.json` runs in **strict mode** (`strict: true`, plus `noUncheckedIndexedAccess`). Loosening compiler options to make code pass is forbidden.
- **`any` is banned.** Use `unknown` at boundaries and narrow it explicitly.
- `as` casts and non-null assertions (`!`) are last resorts; each one needs a comment justifying it. `@ts-ignore` / `@ts-expect-error` require a comment and a linked reason.
- Model data with plain `type` aliases and discriminated unions. No classes for pure data; no decorator magic.
- Let inference work: annotate public function signatures and module boundaries; don't annotate obvious locals.

## 3. Project Layout & Modules

- ES modules only (`"type": "module"`). No CommonJS.
- Structure by feature, not by kind: `src/login/`, `src/rooms/`, `src/streamings/` — each feature folder contains its logic, its types, and its tests.
- **No `utils/`, `helpers/`, or `misc/` dumping grounds.** Shared code gets a named module with a single clear purpose.
- Named exports only; no default exports (they hurt refactoring and grep-ability).
- Keep the dependency direction one-way: features may depend on shared modules, never on each other's internals.

## 4. Formatting & Linting (Enforced)

- One formatter + linter for the repo (Biome or ESLint + Prettier — whichever the repo has configured). Its output is law.
- Never disable a rule inline to make code pass. Fix the code, or escalate with justification (Common §7).
- CI runs format check, lint, and typecheck (`tsc --noEmit`). All three must be clean.

## 5. Errors & Async

- No empty `catch` blocks — ever. Handle, rethrow with context, or log with context.
- Every promise is awaited or explicitly handled. No floating promises (enforce via lint rule).
- Fail fast on invalid input at boundaries (HTTP responses, WebSocket messages, env vars): validate before use, don't sprinkle defensive checks everywhere else.
- Use `Error` subclasses (or discriminated result types) when callers need to branch on failure kinds; don't throw strings.

## 6. Frontend Rules (VanJS / Vite context)

- Keep components small, pure, and boring: state in, DOM out. No hidden global state.
- Side effects (fetch, WebSocket, storage) live in dedicated modules, not inside UI components — this keeps components testable.
- Type all messages crossing the wire (HTTP payloads, WebSocket frames) with shared `type` definitions in one place; parse and validate them at the boundary.

## 7. Testing

- `bun test` is the runner. Tests live next to the code as `*.test.ts`.
- Tests are deterministic: no real network, no real timers where avoidable (use fake timers), no order dependence.
- Test through public interfaces of a module; don't reach into internals.
- Cover error paths and edge cases (empty inputs, malformed messages, rejected promises), not just the happy path.
- **Skipping (`test.skip`), deleting, or commenting out failing tests is forbidden** (Common §4). Snapshot tests are allowed only for genuinely stable output, and never as a substitute for behavioral assertions.

## 8. Documentation

- Public functions, exported types, and modules get a short JSDoc/TSDoc comment: what it does, why it exists.
- Each app/package README covers: what it is, `bun install` / `bun run dev` / `bun test`, and required env vars.

## 9. Definition of Done (TS additions)

In addition to the Common checklist:

- [ ] `tsc --noEmit` clean in strict mode.
- [ ] Formatter and linter clean, no inline rule disables added.
- [ ] `bun test` passes; new behavior covered.
- [ ] No `any`, no unjustified `as` / `!` / `@ts-ignore` in the diff.
- [ ] `bun.lock` changes (if any) correspond to intentional, justified dependency changes.
