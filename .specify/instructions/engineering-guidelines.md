# 🛠️ Engineering Guidelines — Meditation Builder
**Version:** 2.0.0 (Unified Backend + Frontend)

---

## 0. Purpose
**Stable** engineering standards to maintain design consistency, naming, style and patterns in **backend** (Java 21 + Spring Boot) and **frontend** (React + TS).

---

## 1. SOLID and Cross-Cutting Principles
- **SRP**: one class/file = one reason to change.
- **OCP**: extensible by composition/strategy; avoid modifying invariants.
- **LSP**: implementations fulfill contracts (ports) without surprises.
- **ISP**: small and specific interfaces (avoid God-interfaces).
- **DIP**: domain depends on **abstractions** (ports), not on infra.
- **YAGNI / KISS**: do not anticipate.
- **Clean Code**: small functions, semantic names, controlled side-effects.

---

## 2. Naming (Backend Java)
- Packages: `com.hexagonal.<boundedContext>.<layer>`.
- Entities: `MeditationSession`, VOs: `MeditationText`.
- **Out** ports: `<Resource>Port` (e.g., `TextGenerationPort`).
- Use cases: `<Action><Resource>UseCase` (e.g., `GenerateMeditationTextUseCase`).
- AI adapters (out): `<Resource>AiAdapter`.
- Controllers: `<Resource>Controller` (e.g., `MeditationBuilderController`).
- Input/output DTOs: `<Resource><Action>{Request|Response}`.
- Mappers: `<Source>To<Target>Mapper`.

---

## 3. Naming (Frontend TS/React)
- Components: `PascalCase`.
- Hooks: `useCamelCase`.
- Zustand stores: `use<Name>Store`.
- Tests: `*.spec.ts(x)` and `*.e2e.ts`.
- API wrappers: `src/api/client.ts` or `src/api/adapters.ts`.

---

## 4. Code Style
### Backend
- Java 21; constructor injection; avoid `static` with state.
- Domain **without** Spring or infrastructure types.
- Small methods; one abstraction per function.
- Null-safety: `Optional` where applicable; validations in domain.
- **See `java21-best-practices.md`** for mandatory patterns:
  - Records for Value Objects and Entities
  - UUID for identifiers (not String)
  - Clock injection for timestamps (not Instant.now())
  - Immutable API with `withX()` methods
  - Optional accessors for nullable fields

### Frontend
- React 18 + strict TS (`strict: true`).
- Pure components; use `useMemo/useCallback` with moderation.
- Common `eslint` + `prettier`.
- Avoid `any`; types derived from OpenAPI client.

---

## 5. Recommended Patterns
- **Hexagonal (Ports & Adapters)**.
- **Tactical DDD**: Entities, VOs, Aggregates, Policies.
- **Factory** for creation with invariants.
- **Strategy/Policy** for variable rules (AI provider selection).
- **Mapper** to isolate DTOs from domain and persistence.
- **Decorator** for cross-cutting (caching/metrics) in adapters.

---

## 6. Observability and Errors
- Structured logs with correlation (`requestId`).
- Key metrics per endpoint and use case: latency, errors, throughput.
- Distributed traces (OpenTelemetry).
- AI → HTTP taxonomy: `AiTimeout/AiUnavailable → 503`, `AiRateLimited → 429`.
- **Do not** log prompts or AI responses.

---

## 7. Security
- Authentication/authorization consistent per context.
- Secrets outside code (env/Secret Manager).
- Superficial validations in controllers; invariants in domain.

---

## 8. Dependency Rules
- `domain` depends on no one.
- `application` depends on `domain` and **on interfaces** of `domain`.
- `infrastructure` depends on `application` and **on ports** of `domain`.
- `shared` is cross-cutting but **stable**.

---

## 9. PR Review and Quality
- Lint + local tests before PR.
- CI enforces gates; no failure allows merge.
- Avoid giant PRs; prefer small stories and tasks.

---

## 10. Anti-patterns
- Business logic in controllers/adapters.
- Anemic entities without invariants.
- Adding endpoints/DTOs not backed by BDD.
- Tests depending on real cloud services.
- Mixing layers in the same task.

**Final mantra**: today's design must facilitate tomorrow's change.
