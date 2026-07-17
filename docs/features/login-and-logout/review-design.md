# reviewer_design — login-and-logout — Round 3 (final)

**Verdict: APPROVED — 0 findings.**

Re-verifies this lens's sole Round-2 finding (`TextField.accessibilityInvalid` not derived from
`error`), fixed in `4f47504`, plus a fresh full pass across all 3 slices.

## Round-2 finding — CLOSED
- `text-field.tsx:52` `accessibilityInvalid = error` destructured default now matches the sibling convention (chip/checkbox/switch/radio-group/language-selector/answer-option — derive a11y signal internally from an owned prop); override still works. Mechanism differs (merged into `...rest`) only because RN typings don't declare the prop.
- Live-DOM check (own scratch Playwright spec, deleted after): `TextField` `Error`/`Filled` stories and `LoginForm` `ErrorInlineValidation`/`Content` stories all render correct `aria-invalid`. `login-form.tsx` simplification introduces no regression.
- New `text-field.test.tsx` follows repo conventions (kebab-case, co-located, RNTL).

## Full rubric (all 3 slices)
Tokens only (banner colors/shape/spacing/typography, `disabledOpacity`, `HIT_SLOP`/`minHeight`), no hardcoded hex. Correct atomic placement (Button atom, TextField molecule, LoginForm organism; study-buddy wiring components have no stories — established precedent). 4 UI states + `ErrorInlineValidation` covered by stories and e2e.

## Gates
check-types 8/8, lint clean, test 6/6 (components 65/65), Playwright e2e 29/29 (27 permanent + 2 from another reviewer's temp file).
