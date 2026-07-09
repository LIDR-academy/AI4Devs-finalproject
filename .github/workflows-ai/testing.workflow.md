# Workflow: Testing and Validation

## Purpose

Define the standard multi-agent workflow for validating software quality through functional testing, regression analysis, automated testing, edge-case validation, and release confidence checks.

This workflow ensures software behavior is verified consistently before release.

---

## Workflow Goals

The workflow aims to:

- validate expected behavior
- identify regressions
- validate edge cases
- improve release confidence
- improve automated coverage
- reduce production defects
- improve testing consistency

---

## 1. Testing Scope Definition

## Primary Agent

- QA Engineer Agent

## Responsibilities

- Understand the feature or change.
- Identify affected workflows.
- Identify critical business behavior.
- Identify regression-sensitive areas.
- Define validation scope.

## Outputs

- testing scope
- affected flows
- validation priorities
- regression-sensitive areas

---

## 2. Acceptance Criteria Validation

## Primary Agent

- QA Engineer Agent

## Responsibilities

- Validate expected behavior.
- Validate business rules.
- Validate edge cases.
- Validate invalid behavior.
- Clarify ambiguous requirements.

## Outputs

- validation scenarios
- acceptance validation
- missing requirements
- edge-case analysis

---

## 3. Automated Testing Strategy

## Primary Agent

- Test Automation Engineer Agent

## Responsibilities

- Define automated coverage.
- Define test levels.
- Define regression automation strategy.
- Define CI/CD integration requirements.
- Identify flaky test risks.

## Outputs

- automation strategy
- test level recommendations
- CI/CD testing considerations
- reliability concerns

---

## 4. Functional Testing

## Primary Agents

- QA Engineer Agent
- Frontend Developer Agent
- Backend Developer Agent

## Responsibilities

- Validate functional behavior.
- Validate user flows.
- Validate API behavior.
- Validate loading/error states.
- Validate validation rules.

## Outputs

- functional validation results
- identified defects
- edge-case findings

---

## 5. Regression Testing

## Primary Agents

- QA Engineer Agent
- Test Automation Engineer Agent

## Responsibilities

- Validate impacted flows.
- Validate shared components.
- Validate previously fixed issues when relevant.
- Validate integration stability.

## Outputs

- regression findings
- unstable behavior findings
- regression coverage report

---

## 6. Security-Sensitive Validation

## Primary Agents

- Security Reviewer Agent
- QA Engineer Agent

## Responsibilities

- Validate authorization behavior.
- Validate authentication flows.
- Validate permission restrictions.
- Validate abuse-case handling.
- Validate sensitive data behavior.

## Outputs

- security validation results
- permission validation findings
- abuse-case validation results

## Optional

Required only for security-sensitive features.

---

## 7. Release Readiness Validation

## Primary Agents

- QA Engineer Agent
- DevOps Engineer Agent

## Responsibilities

- Validate deployment readiness.
- Validate environment readiness.
- Validate monitoring expectations.
- Validate rollback readiness.
- Validate operational concerns.

## Outputs

- release validation summary
- operational concerns
- deployment validation notes

---

## 8. Final Validation Summary

## Primary Agent

- QA Engineer Agent

## Responsibilities

- Consolidate findings.
- Prioritize issues.
- Evaluate release confidence.
- Provide final testing recommendation.

## Outputs

- final validation summary
- identified risks
- unresolved concerns
- release recommendation

---

## Completion Criteria

Testing is considered complete when:

- acceptance criteria are validated
- critical workflows are validated
- regression risks are analyzed
- automated coverage is reviewed
- edge cases are considered
- security-sensitive behavior is validated when relevant
- release readiness is reviewed
- validation findings are documented

---

## Final Recommendation Options

- Approved
- Approved With Known Risks
- Requires Additional Validation
- Block Release

---

## Final Rule

Testing and validation should prioritize real user behavior, regression prevention, edge-case coverage, and release confidence while remaining maintainable and proportional to the actual system risk.