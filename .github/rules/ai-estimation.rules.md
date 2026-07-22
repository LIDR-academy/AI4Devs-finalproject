# AI Estimation Rules

## Purpose

Define mandatory quality controls for all AI-based estimation flows in ProjectScope AI.

---

## Mandatory Rules

1. All estimation prompts must be built in backend, never in frontend.
2. All AI responses must be validated before persistence.
3. Required output sections cannot be omitted.
4. Token and cost values must be labeled as projected estimates.
5. Model failures or malformed responses must produce controlled errors.
6. No secrets, credentials, or internal keys may appear in prompts or logs.

---

## Prompt Rules

- prompts must use explicit role and task framing
- prompts must request deterministic output structure
- prompts must avoid ambiguous field naming
- prompts must include response constraints for MVP fields

---

## Validation Rules

Before data is stored:

- validate structure and required fields
- validate numeric fields are non-negative
- validate arrays are present where required
- validate assumptions and risks are non-empty

---

## Error Handling Rules

When validation fails:

- return a consistent API error response
- log technical details without sensitive content
- provide actionable user-facing message

---

## Testing Rules

Every AI estimation change must include:

- parser/validator unit test updates
- at least one malformed-output test case
- integration verification of estimation endpoint behavior

---

## Final Rule

No AI estimation output is considered valid unless it passes contract validation.
