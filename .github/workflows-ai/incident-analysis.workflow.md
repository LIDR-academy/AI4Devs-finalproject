# Workflow: Incident Analysis

## Purpose

Define the standard multi-agent workflow for analyzing production incidents, operational failures, outages, regressions, and critical system issues.

This workflow ensures incidents are investigated systematically, root causes are identified, mitigations are applied safely, and long-term reliability improves over time.

---

## Workflow Goals

The workflow aims to:

- identify root causes
- reduce recovery time
- improve operational visibility
- prevent repeated incidents
- improve reliability
- improve incident communication
- improve post-incident learning

---

## 1. Incident Intake

## Primary Agent

- DevOps Engineer Agent

## Responsibilities

- Identify incident scope.
- Identify impacted systems.
- Identify operational severity.
- Collect initial operational evidence.
- Identify customer/business impact.

## Outputs

- incident summary
- affected systems
- severity classification
- operational symptoms
- timeline start

---

## 2. Initial Impact Assessment

## Primary Agents

- Tech Lead Agent
- Product Owner Agent

## Responsibilities

- Evaluate business impact.
- Identify affected workflows.
- Identify customer-facing impact.
- Prioritize mitigation urgency.

## Outputs

- business impact assessment
- affected workflows
- mitigation priority
- communication recommendations

---

## 3. Technical Investigation

## Primary Agents

- Backend Developer Agent
- Frontend Developer Agent
- DevOps Engineer Agent

## Responsibilities

- Analyze logs and telemetry.
- Analyze runtime behavior.
- Analyze infrastructure behavior.
- Analyze deployment history.
- Analyze dependency failures.
- Identify likely root causes.

## Outputs

- technical findings
- suspected root causes
- infrastructure findings
- reproduction attempts

---

## 4. Observability and Reliability Analysis

## Primary Agents

- DevOps Engineer Agent
- Software Architect Agent

## Responsibilities

- Identify monitoring gaps.
- Identify logging gaps.
- Identify tracing gaps.
- Identify operational bottlenecks.
- Identify reliability weaknesses.

## Outputs

- observability gaps
- reliability concerns
- operational weaknesses
- monitoring recommendations

---

## 5. Security Investigation

## Primary Agent

- Security Reviewer Agent

## Responsibilities

- Evaluate whether the incident involves security exposure.
- Review unauthorized access possibilities.
- Review sensitive data exposure.
- Review suspicious operational behavior.

## Outputs

- security findings
- exposure analysis
- mitigation recommendations

## Optional

Required only when security impact is possible.

---

## 6. Root Cause Analysis

## Primary Agents

- Tech Lead Agent
- Software Architect Agent

## Responsibilities

- Identify root cause.
- Identify contributing factors.
- Identify systemic weaknesses.
- Identify architectural or operational contributors.

## Outputs

- confirmed root cause
- contributing factors
- systemic issues
- architectural findings

---

## 7. Mitigation and Recovery Plan

## Primary Agents

- DevOps Engineer Agent
- Backend Developer Agent
- Frontend Developer Agent

## Responsibilities

- Define mitigation strategy.
- Define rollback or recovery actions.
- Define validation strategy.
- Minimize operational risk during recovery.

## Outputs

- recovery plan
- rollback strategy
- mitigation actions
- validation plan

---

## 8. Regression Prevention

## Primary Agents

- QA Engineer Agent
- Test Automation Engineer Agent

## Responsibilities

- Define regression validation.
- Add automated regression coverage when appropriate.
- Validate incident reproduction scenarios.
- Validate mitigations.

## Outputs

- regression test plan
- automation recommendations
- validation scenarios

---

## 9. Documentation and Postmortem

## Primary Agent

- Technical Writer Agent

## Responsibilities

- Document incident timeline.
- Document root cause.
- Document mitigation actions.
- Document lessons learned.
- Document operational improvements.

## Outputs

- incident postmortem
- operational recommendations
- follow-up actions

---

## Completion Criteria

An incident analysis is complete when:

- the incident scope is understood
- impacted systems are identified
- root cause is identified
- contributing factors are documented
- mitigation actions are applied
- regression prevention is considered
- observability gaps are identified
- operational improvements are documented
- postmortem documentation exists

---

## Final Rule

Incident analysis should focus on systemic learning, operational improvement, and realistic root-cause identification instead of assigning blame or applying superficial fixes.