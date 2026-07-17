# Definition of Done — plan-entitlements-key-routing

**Verdict:** PASS
_Validated by `dod_validator`; amended 2026-07-16 for `plans` flags, Profile rename, and removal of `can_create_without_key`._

## Accepted minors (documented risk-accepted, if any)
- _none_

## Functionality
- [x] All acceptance criteria met — evidence: `tdd.md` maps `@s1`–`@s19`; full tests green.
- [x] 4 UI states implemented — evidence: `api-key-gate.stories.tsx`; `api-key-settings.stories.tsx`.
- [x] Robust error handling; no undefined/crash states — evidence: `api-key-gate.tsx`; `lesson-generation.service.ts`.

## Code quality
- [x] `pnpm lint` clean — evidence: turbo lint successful at DoD.
- [x] `pnpm check-types` clean — evidence: turbo check-types successful at DoD.
- [x] `pnpm test` (unit + integration) green — evidence: workspace suites passed at DoD.
- [x] `test:e2e` green where relevant — evidence: study-buddy + components Storybook E2E green at DoD.
- [x] No TODOs without an issue; Conventional Commits — evidence: feature diff clean; history uses conventional prefixes.

## Architecture
- [x] `Component→Hook→Service→DAO` respected; no cross-layer imports — evidence: `use-profile.ts`; `profile.service.ts` flag-map; `profile.dao.ts` profiles→plans join.
- [x] DTOs not leaked out of data/DAO; barrels updated — evidence: `libs/types/src/profile.ts`; task-2 barrel exports green.
- [x] No unapproved dependencies — evidence: bootstrap/install succeeded; TanStack Query explicitly human-waived.

## Design system
- [x] Tokens/existing components reused; correct atomic-design placement — evidence: `api-key-gate.tsx`; `api-key-settings.tsx`.
- [x] Storybook story per shared component (4 states) — evidence: gate Loading/CannotCreate/WithKey/Paid/Error; settings covers key visibility states.
- [x] Every component has a Jest unit test (`<name>.test.tsx`) — evidence: gate/settings/upload/PDF-list tests passed.

## Security (OWASP)
- [x] No secrets/keys in code or logs; inputs validated — evidence: `generate-lesson/index.ts`; key passed only to provider seam.
- [x] Supabase RLS/auth respected; no PII in logs; TLS for external calls — evidence: `20260716170000_create_profiles.sql`; Edge service-role plan-flag read.

## Accessibility (WCAG 2.2 AA)
- [x] Labels/roles; contrast ≥ 4.5:1; touch targets ≥ 44/48; focus order; dynamic type — evidence: `api-key-gate.tsx`; `api-key-settings.tsx`; Storybook E2E green.

## Testing rigor
- [x] Every `@s` scenario covered — evidence: `tdd.md` scenario map covers `@s1`–`@s19`.
- [x] Mutation score threshold met on changed source (`.tsx` included) — evidence: [`mutation.md`](./mutation.md), final 100%, 0 survivors.

## Observability & i18n
- [x] Analytics events per spec; feature flag wrapping (if applicable) — evidence: `spec.md` says neither applies.
- [x] No hardcoded strings — evidence: UI uses `t()`; locale parity for en/es/de/pt including `upload.cannotCreate`.

## Validation gates
- `pnpm bootstrap`: PASS (install + check-types + lint + tests).
- Full review: [`review.md`](./review.md) has no open blocker/major/minor findings; [`review-slice.md`](./review-slice.md) is `APPROVED`.
- Feature-only `git diff --check`: PASS.

---
**Lead reference:** `orchestrator_lead` may advance `pr_ready`; PR open/merge remains manual.
