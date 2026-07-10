# Workflow: Architecture Review

## Purpose

Define the standard multi-agent workflow for reviewing architectural decisions, structural changes, scalability strategies, integrations, and long-term maintainability concerns.

This workflow ensures architectural evolution remains maintainable, scalable, operationally sustainable, and aligned with business and technical goals.

---

## Workflow Goals

The workflow aims to:

- validate architectural consistency
- identify structural risks
- evaluate scalability impact
- evaluate operational impact
- reduce long-term technical debt
- improve maintainability
- improve system evolution safety

---

## 1. Architecture Scope Definition

## Primary Agent

- Software Architect Agent

## Responsibilities

- Understand the architectural change or proposal.
- Identify affected systems and modules.
- Identify architectural goals.
- Identify constraints and assumptions.

## Outputs

- architecture scope
- affected systems
- assumptions
- architectural goals

---

## 2. Business and Technical Context Review

## Primary Agents

- Product Owner Agent
- Tech Lead Agent

## Responsibilities

- Validate business context.
- Validate technical constraints.
- Clarify operational requirements.
- Clarify scalability expectations.
- Clarify delivery constraints.

## Outputs

- business drivers
- technical constraints
- operational expectations
- scope limitations

---

## 3. Structural Architecture Review

## Primary Agent

- Software Architect Agent

## Responsibilities

- Review module boundaries.
- Review dependency direction.
- Review system coupling.
- Review ownership boundaries.
- Review integration strategy.
- Review extensibility and maintainability.

## Outputs

- architecture assessment
- structural concerns
- maintainability analysis
- dependency analysis

---

## 4. Scalability and Reliability Analysis

## Primary Agents

- Software Architect Agent
- Tech Lead Agent

## Responsibilities

- Analyze scalability constraints.
- Analyze bottlenecks.
- Analyze concurrency concerns.
- Analyze reliability impact.
- Analyze operational sustainability.

## Outputs

- scalability assessment
- reliability risks
- operational constraints
- recommended improvements

---

## 5. Security and Trust Boundary Review

## Primary Agent

- Security Reviewer Agent

## Responsibilities

- Review trust boundaries.
- Review authorization boundaries.
- Review sensitive data exposure.
- Review integration security concerns.
- Review infrastructure exposure risks.

## Outputs

- security findings
- threat considerations
- mitigation recommendations

---

## 6. Operational and Infrastructure Review

## Primary Agent

- DevOps Engineer Agent

## Responsibilities

- Review deployment impact.
- Review infrastructure complexity.
- Review observability requirements.
- Review CI/CD implications.
- Review rollback and operational concerns.

## Outputs

- operational risks
- deployment considerations
- observability requirements
- infrastructure recommendations

---

## 7. Validation and Testing Strategy Review

## Primary Agents

- QA Engineer Agent
- Test Automation Engineer Agent

## Responsibilities

- Review regression impact.
- Review testing complexity.
- Review validation requirements.
- Review automation impact.

## Outputs

- testing considerations
- regression risks
- validation recommendations

---

## 8. Final Architecture Recommendation

## Primary Agent

- Software Architect Agent

## Responsibilities

- Consolidate findings.
- Evaluate trade-offs.
- Define architectural recommendation.
- Identify blockers or risks.
- Recommend next steps.

## Outputs

- architecture decision summary
- trade-off analysis
- recommended improvements
- final recommendation

---

## Completion Criteria

An architecture review is complete when:

- architectural goals are clear
- constraints are identified
- module boundaries are reviewed
- scalability impact is analyzed
- operational impact is analyzed
- security boundaries are reviewed
- testing implications are considered
- trade-offs are documented
- final recommendation is defined

---

## Final Recommendation Options

- Approve
- Approve With Improvements
- Requires Additional Validation
- Major Rework Recommended

---

## Final Rule

Architecture reviews should prioritize maintainability, scalability, operational sustainability, security, and realistic system evolution over theoretical perfection or unnecessary complexity.