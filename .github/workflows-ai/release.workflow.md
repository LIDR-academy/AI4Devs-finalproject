# Workflow: Release Validation

## Purpose

Define the standard multi-agent workflow for validating deployment readiness, operational safety, testing completeness, rollback capability, and release confidence before shipping software to production.

This workflow ensures releases are stable, observable, recoverable, and operationally safe.

---

## Workflow Goals

The workflow aims to:

- reduce production incidents
- improve deployment safety
- validate operational readiness
- validate rollback readiness
- validate release quality
- improve observability awareness
- standardize release validation

---

## 1. Release Scope Definition

## Primary Agent

- Tech Lead Agent

## Responsibilities

- Identify included changes.
- Identify affected systems and workflows.
- Identify release risks.
- Identify dependencies and migrations.

## Outputs

- release scope
- affected components
- release risks
- deployment dependencies

---

## 2. Regression and Validation Review

## Primary Agents

- QA Engineer Agent
- Test Automation Engineer Agent

## Responsibilities

- Validate critical workflows.
- Validate regression coverage.
- Review unresolved defects.
- Validate release confidence.
- Review automated test results.

## Outputs

- regression validation report
- unresolved risks
- test coverage assessment
- automation status

---

## 3. Security Validation

## Primary Agent

- Security Reviewer Agent

## Responsibilities

- Review unresolved security findings.
- Validate security-sensitive changes.
- Validate authentication and authorization behavior.
- Validate secret/configuration handling.

## Outputs

- security validation summary
- unresolved security concerns
- mitigation requirements

## Optional

Required only for releases affecting security-sensitive areas.

---

## 4. Infrastructure and Deployment Review

## Primary Agent

- DevOps Engineer Agent

## Responsibilities

- Validate deployment readiness.
- Validate infrastructure changes.
- Validate CI/CD readiness.
- Validate rollback strategy.
- Validate environment configuration.
- Validate observability readiness.

## Outputs

- deployment readiness assessment
- rollback validation
- operational concerns
- monitoring readiness

---

## 5. Architecture and Scalability Review

## Primary Agents

- Software Architect Agent
- Tech Lead Agent

## Responsibilities

- Review architectural impact.
- Review scalability concerns.
- Review operational sustainability.
- Review integration impact.

## Outputs

- architecture release assessment
- scalability concerns
- operational impact analysis

## Optional

Required only for releases with significant structural or scalability impact.

---

## 6. Documentation Validation

## Primary Agent

- Technical Writer Agent

## Responsibilities

- Validate release documentation.
- Validate operational documentation updates.
- Validate migration documentation.
- Validate troubleshooting documentation.

## Outputs

- documentation readiness status
- missing documentation gaps

---

## 7. Final Release Assessment

## Primary Agents

- Tech Lead Agent
- DevOps Engineer Agent
- QA Engineer Agent

## Responsibilities

- Consolidate release findings.
- Evaluate unresolved risks.
- Evaluate rollback confidence.
- Define final release recommendation.

## Outputs

- final release summary
- unresolved risks
- release recommendation
- mitigation requirements

---

## Completion Criteria

A release is considered ready when:

- critical workflows are validated
- regression risks are reviewed
- deployment readiness is confirmed
- rollback strategy exists
- observability is sufficient
- unresolved risks are documented
- security concerns are addressed
- operational documentation is updated when required

---

## Final Recommendation Options

- Release Approved
- Release Approved With Known Risks
- Requires Additional Validation
- Block Release

---

## Final Rule

Releases should prioritize operational safety, rollback readiness, observability, reliability, and realistic risk management over deployment speed alone.