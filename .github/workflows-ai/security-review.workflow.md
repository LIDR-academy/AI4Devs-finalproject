# Workflow: Security Review

## Purpose

Define the standard multi-agent workflow for reviewing authentication, authorization, sensitive data handling, trust boundaries, infrastructure exposure, and security risks across systems and features.

This workflow ensures security concerns are identified early and addressed consistently before release.

---

## Workflow Goals

The workflow aims to:

- identify security risks early
- validate trust boundaries
- reduce attack surface
- protect sensitive data
- improve authorization safety
- improve operational security awareness
- standardize security validation

---

## 1. Security Scope Definition

## Primary Agent

- Security Reviewer Agent

## Responsibilities

- Understand the feature, system, or workflow being reviewed.
- Identify exposed surfaces.
- Identify sensitive operations.
- Identify trust boundaries.
- Identify critical assets.

## Outputs

- review scope
- critical assets
- exposed surfaces
- trust boundaries

---

## 2. Authentication and Authorization Review

## Primary Agent

- Security Reviewer Agent

## Responsibilities

- Review authentication requirements.
- Review token/session handling.
- Review authorization enforcement.
- Review ownership validation.
- Review role/permission boundaries.

## Outputs

- authentication findings
- authorization findings
- privilege escalation risks
- recommended mitigations

---

## 3. Input Validation and API Review

## Primary Agents

- Security Reviewer Agent
- Backend Developer Agent

## Responsibilities

- Review request validation.
- Review API exposure.
- Review unsafe input handling.
- Review injection risks.
- Review mass assignment risks.
- Review unsafe file handling when applicable.

## Outputs

- validation findings
- API security risks
- unsafe behavior analysis

---

## 4. Sensitive Data Review

## Primary Agent

- Security Reviewer Agent

## Responsibilities

- Review sensitive data collection.
- Review sensitive data storage.
- Review sensitive data exposure.
- Review logging behavior.
- Review encryption requirements when relevant.

## Outputs

- sensitive data risks
- exposure concerns
- storage concerns
- logging concerns

---

## 5. Infrastructure and Operational Security Review

## Primary Agents

- DevOps Engineer Agent
- Security Reviewer Agent

## Responsibilities

- Review secrets management.
- Review environment isolation.
- Review CI/CD exposure risks.
- Review runtime configuration risks.
- Review infrastructure permissions.

## Outputs

- infrastructure security findings
- CI/CD security risks
- operational exposure concerns

---

## 6. Threat Modeling

## Primary Agent

- Security Reviewer Agent

## Responsibilities

- Identify attack surfaces.
- Identify abuse cases.
- Identify realistic attack scenarios.
- Evaluate impact and likelihood.
- Recommend mitigations.

## Outputs

- threat analysis
- abuse-case analysis
- risk classification
- mitigation recommendations

---

## 7. Validation and Testing Review

## Primary Agents

- QA Engineer Agent
- Test Automation Engineer Agent

## Responsibilities

- Validate permission behavior.
- Validate abuse-case handling.
- Validate authentication behavior.
- Validate regression protection.
- Define security-sensitive automated tests when appropriate.

## Outputs

- security validation scenarios
- regression considerations
- automation recommendations

---

## 8. Final Security Recommendation

## Primary Agent

- Security Reviewer Agent

## Responsibilities

- Consolidate findings.
- Prioritize risks.
- Define mitigation urgency.
- Provide final recommendation.

## Outputs

- security review summary
- critical risks
- mitigation priorities
- final recommendation

---

## Completion Criteria

A security review is complete when:

- trust boundaries are identified
- authentication is reviewed
- authorization is reviewed
- sensitive data handling is reviewed
- input validation is reviewed
- infrastructure exposure is reviewed
- abuse cases are considered
- mitigations are defined
- validation requirements are documented

---

## Final Recommendation Options

- Approve
- Approve With Mitigations
- Requires Additional Validation
- Block Release

---

## Final Rule

Security reviews should reduce realistic risks through practical, maintainable, and context-aware protections without introducing unnecessary operational or architectural complexity.