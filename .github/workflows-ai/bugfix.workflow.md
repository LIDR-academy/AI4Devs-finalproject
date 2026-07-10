# Workflow: Bug Fix

## Purpose

Define the standard multi-agent workflow for analyzing, reproducing, fixing, validating, and documenting software bugs.

This workflow ensures bug fixes address the root cause, avoid regressions, and remain aligned with project architecture and quality standards.

---

## Workflow Goals

The workflow aims to:

- reproduce bugs clearly
- identify root causes
- avoid superficial fixes
- reduce regressions
- improve validation quality
- preserve maintainability
- document relevant findings

---

## 1. Bug Intake

## Primary Agent

- QA Engineer Agent

## Responsibilities

- Understand the reported issue.
- Identify expected behavior.
- Identify actual behavior.
- Define reproduction steps.
- Identify affected users or flows.
- Estimate severity and impact.

## Outputs

- bug summary
- reproduction steps
- expected vs actual behavior
- severity
- affected flows
- initial regression risks

---

## 2. Functional Impact Analysis

## Primary Agent

- Product Owner Agent

## Responsibilities

- Clarify intended behavior.
- Confirm business rules.
- Confirm whether current behavior is incorrect.
- Define acceptance criteria for the fix.

## Outputs

- confirmed expected behavior
- business rules
- acceptance criteria
- out-of-scope items

## Optional

Skip if expected behavior is already clear and documented.

---

## 3. Technical Root Cause Analysis

## Primary Agent

- Tech Lead Agent

## Responsibilities

- Identify likely technical cause.
- Identify affected components.
- Evaluate impact.
- Define fix strategy.
- Identify risks and dependencies.

## Outputs

- root cause hypothesis
- affected components
- proposed fix strategy
- technical risks

---

## 4. Implementation

## Primary Agents

- Backend Developer Agent
- Frontend Developer Agent

## Responsibilities

- Implement the smallest safe fix.
- Preserve existing behavior outside the bug scope.
- Respect project architecture.
- Add or update validations when needed.
- Add regression tests.

## Outputs

- bug fix implementation
- updated tests
- implementation notes

---

## 5. Regression Testing

## Primary Agents

- QA Engineer Agent
- Test Automation Engineer Agent

## Responsibilities

- Validate the fixed scenario.
- Validate related flows.
- Identify regression risks.
- Add automated regression coverage when appropriate.

## Outputs

- regression test scenarios
- automated regression tests when needed
- validation results

---

## 6. Code Review

## Primary Agent

- Code Reviewer Agent

## Responsibilities

- Verify the fix is minimal and safe.
- Review maintainability.
- Review test coverage.
- Review architecture alignment.
- Check for unintended side effects.

## Outputs

- review findings
- required improvements
- approval or change request

---

## 7. Security Review

## Primary Agent

- Security Reviewer Agent

## Responsibilities

- Review security impact if the bug involves permissions, authentication, authorization, sensitive data, or external exposure.

## Outputs

- security risks
- mitigation recommendations

## Optional

Only required for security-sensitive bugs.

---

## 8. Documentation

## Primary Agent

- Technical Writer Agent

## Responsibilities

- Update troubleshooting documentation if needed.
- Update known issues if relevant.
- Update technical documentation when behavior changed.

## Outputs

- updated documentation

## Optional

Skip if the bug fix does not affect documented behavior.

---

## Completion Criteria

A bug fix is complete when:

- the bug is reproducible or clearly understood
- expected behavior is confirmed
- root cause is identified
- the fix is implemented
- regression tests are considered
- related flows are validated
- code review is completed
- security concerns are addressed when relevant
- documentation is updated when needed

---

## Final Rule

Bug fixes should address the root cause, protect against regression, and avoid broad unrelated changes.