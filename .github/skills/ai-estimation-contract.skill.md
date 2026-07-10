# Skill: AI Estimation Contract

## Purpose

Define and enforce a reliable output contract for AI-generated estimations so backend parsing and report rendering remain stable.

---

## Responsibilities

When using this skill:

- Define required output sections.
- Define required fields and data types.
- Define semantic validation checks.
- Define fallback behavior for malformed output.
- Define test cases for contract compliance.

---

## Required Output Sections

AI output should always include:

- project_summary
- phases
- role_estimates
- token_estimate
- cost_estimate
- assumptions
- risks

---

## Contract Rules

- `phases` must be an ordered list.
- each phase must include `name`, `description`, and `deliverables`.
- `role_estimates` must include role names and numeric hour estimates.
- `token_estimate` must contain numeric projected token usage.
- `cost_estimate` must contain currency and numeric amount.
- assumptions and risks must be explicit, not empty.

---

## Validation Strategy

Apply validation in backend before persistence:

1. structural validation (fields and types)
2. semantic validation (non-negative numbers, non-empty lists)
3. normalization (trim, map aliases, enforce defaults)
4. fallback behavior when mandatory fields are missing

---

## Fallback Rules

If output is partially invalid:

- reject and retry with stricter prompt constraints
- or return recoverable error with user-facing message
- never persist malformed estimation artifacts

---

## Testing Recommendations

- unit tests for parser and validator
- fixture tests for valid and invalid model outputs
- regression tests for known prompt drift patterns

---

## Final Rule

A parseable and validated estimation is mandatory for report generation.
