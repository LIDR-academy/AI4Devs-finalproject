# Workflow: Code Review

## Purpose

Define the standard multi-agent workflow for reviewing code quality, architecture alignment, maintainability, testing, security, and release readiness.

This workflow ensures code is reviewed consistently before being merged or considered production-ready.

---

## Workflow Goals

The workflow aims to:

- detect bugs early
- improve maintainability
- validate architecture alignment
- improve test quality
- reduce security risks
- reduce regressions
- prevent technical debt

---

## 1. Review Scope Definition

## Primary Agent

- Code Reviewer Agent

## Responsibilities

- Understand the change being reviewed.
- Identify affected modules.
- Identify change type.
- Identify review focus areas.

## Outputs

- review scope
- affected components
- review checklist

---

## 2. Architecture Alignment Review

## Primary Agents

- Code Reviewer Agent
- Software Architect Agent, if needed

## Responsibilities

- Validate layer boundaries.
- Validate dependency direction.
- Validate module ownership.
- Identify coupling risks.
- Identify architectural violations.

## Outputs

- architecture findings
- structural risks
- improvement recommendations

---

## 3. Code Quality Review

## Primary Agent

- Code Reviewer Agent

## Responsibilities

- Review readability.
- Review maintainability.
- Review naming.
- Review complexity.
- Review duplication.
- Review separation of concerns.
- Review dependency usage.

## Outputs

- critical issues
- important improvements
- minor suggestions

---

## 4. Testing Review

## Primary Agents

- Code Reviewer Agent
- Test Automation Engineer Agent, if needed

## Responsibilities

- Review test coverage.
- Review test quality.
- Identify missing edge cases.
- Identify regression gaps.
- Identify flaky test risks.

## Outputs

- testing gaps
- automation recommendations
- regression risks

---

## 5. Security Review

## Primary Agent

- Security Reviewer Agent

## Responsibilities

- Review authentication and authorization impact.
- Review sensitive data handling.
- Review validation and input handling.
- Review error exposure.
- Review secrets and configuration risks.

## Outputs

- security findings
- mitigations
- validation recommendations

## Optional

Required only when the change has security impact.

---

## 6. Operational Review

## Primary Agent

- DevOps Engineer Agent

## Responsibilities

- Review deployment impact.
- Review environment configuration changes.
- Review CI/CD impact.
- Review observability impact.
- Review rollback considerations.

## Outputs

- operational risks
- deployment considerations
- release readiness concerns

## Optional

Required only when the change affects deployment, runtime, infrastructure, CI/CD, or configuration.

---

## 7. Final Review Summary

## Primary Agent

- Code Reviewer Agent

## Responsibilities

- Consolidate findings.
- Prioritize issues.
- Provide final recommendation.
- Identify required next actions.

## Outputs

- review summary
- required changes
- optional improvements
- final recommendation

---

## Completion Criteria

A code review is complete when:

- scope is understood
- architecture alignment is checked
- code quality is reviewed
- testing gaps are identified
- security impact is reviewed when relevant
- operational impact is reviewed when relevant
- findings are prioritized
- final recommendation is clear

---

## Final Recommendation Options

- Approve
- Approve With Minor Suggestions
- Request Changes
- Block Merge

---

## Final Rule

Code review should improve quality, maintainability, reliability, and safety without creating unnecessary friction or blocking changes for low-value preferences.