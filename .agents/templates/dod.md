# Definition of Done — <name>

**Verdict:** PASS | DOD_FAILED
_Validated by `dod_validator`. Each item is re-checked against the code, not trusted from prior reports. Cite evidence (command output, `file:line`, links to `review.md` / `mutation.md`)._

## Accepted minors (documented risk-accepted, if any)
_Only **minor** findings left after the 2-round review loop, explicitly risk-accepted by the human and mirrored in `spec.md` Open decisions. PASS may carry these; it may NOT carry an open blocker/major or an unmet mutation threshold. Leave empty if none._
- _none_

## Functionality
- [ ] All acceptance criteria in `spec.md` met
- [ ] 4 UI states implemented (if UI)
- [ ] Robust error handling; no undefined/crash states

## Code quality
- [ ] `pnpm lint` clean — _evidence:_
- [ ] `pnpm check-types` clean — _evidence:_
- [ ] `pnpm test` (unit + integration) green — _evidence:_
- [ ] `test:e2e` green where relevant — _evidence:_
- [ ] No TODOs without an issue; Conventional Commits

## Architecture
- [ ] `Component→Hook→Service→DAO` respected; no cross-layer imports
- [ ] DTOs not leaked out of data/DAO; barrels updated
- [ ] No unapproved dependencies

## Design system
- [ ] Tokens/existing components reused; correct atomic-design placement
- [ ] Storybook story per shared component (4 states)
- [ ] Every component has a Jest unit test (`<name>.test.tsx`)

## Security (OWASP)
- [ ] No secrets/keys in code or logs; inputs validated
- [ ] Supabase RLS/auth respected; no PII in logs; TLS for external calls

## Accessibility (WCAG 2.2 AA)
- [ ] Labels/roles; contrast ≥ 4.5:1; touch targets ≥ 44/48; focus order; dynamic type

## Testing rigor
- [ ] Every `@s` scenario covered
- [ ] Mutation score threshold met on changed source (`.tsx` included) — _link mutation.md_

## Observability & i18n
- [ ] Analytics events per spec; feature flag wrapping (if applicable)
- [ ] No hardcoded strings

---
**If PASS → `pr_ready`.** Opening & merging the PR is a manual human step → `done`.
