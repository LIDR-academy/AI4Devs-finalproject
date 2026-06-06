# PRD Validation Rules

Apply these rules after generating each section. A section MUST pass all its checks before presenting to the user for approval.

---

## Section 1: Vision & Product Summary

### Pass Criteria
| Check | Rule | Fail Signal |
|-------|------|-------------|
| Purpose clarity | One paragraph, 3-5 sentences, answers what/why, specifies B2B/B2C orientation | Longer than 5 sentences or uses buzzwords ("synergy", "leverage", "disrupt") |
| Problem specificity | Names WHO, WHAT, WHEN/WHERE, WHY alternatives fail (e.g. itemization paywalled) | Generic "users struggle with X" without context |
| Problem evidence | Includes data, research, or explicitly marked [HYPOTHESIS] | Unsupported claims presented as facts |
| Value prop formula | Follows "For [user] who [need], [product] is a [category] that [benefit]" | Missing any formula component |
| Measurable benefits | At least 2 benefits with quantifiable targets | "Better experience" without a metric |
| Product Principles | List 4-6 fundamental principles, must include "Privacy by design" and a fallback principle | Fewer than 4 principles, or missing privacy / fallback rules |

### Anti-patterns
- ❌ "Revolutionary platform that disrupts the industry" → no substance
- ❌ Problem described without linking to a real user persona
- ❌ Value proposition identical to a competitor's marketing copy

---

## Section 2: Target Users & Market Context

### Pass Criteria
| Check | Rule | Fail Signal |
|-------|------|-------------|
| Persona count | Minimum 2 personas | Single persona or none |
| Persona specificity | Named with role, has daily behavioral context, not just demographics | "25-35 year old professionals" without role context |
| Jobs to Be Done | Minimum 2 JTBD formatted as "When [situation], I want to [action] so that [outcome]" | Missing JTBD, or incorrect format |
| Needs traceability | Each persona need maps to at least one feature in Section 3/4 | Orphan needs with no feature coverage |
| Market Context | Explains sector volume, market sizing (TAM/SAM/SOM), and strategic value of segments | Vague "big market" without numbers or [TO VALIDATE] |

---

## Section 3: MVP Scope & Constraints

### Pass Criteria
| Check | Rule | Fail Signal |
|-------|------|-------------|
| Included MVP Scope | Details all core features, browser/device API usage, and local persistence capabilities | Missing description of device APIs or storage mechanism |
| Out of Scope | At least 4 explicit exclusions with clear justifications and target roadmap phase | Fewer than 4 exclusions or no phase mapping |
| Technical Constraints | Names concrete technologies, platforms, HTTPS secure context, and performance targets | "Should be fast" instead of "P95 latency < 200ms" or no HTTPS mention |
| Business/Resource Constraints | Stated budget, timeline, team size limits, and single points of failure | No resource limits mentioned |

---

## Section 4: Functional & Non-Functional Requirements

### Pass Criteria
| Check | Rule | Fail Signal |
|-------|------|-------------|
| RF categorization | Grouped by component (Experience, Capture, Processing/OCR, Split, Storage, Sharing) | Monolithic list without component groups |
| RF format & priority | Each RF has a unique ID (RF-01...), description as user capability, priority (Must/Should/Could), and Acceptance Criteria | Missing ID, written as tech tasks, or missing measurable acceptance criteria |
| RNF completeness | Covered: Performance (latencies), Usability, Privacy & Security (consent separation), Reliability (offline/degradation fallback) | Missing any of the mandated RNF categories |
| RNF measurability | Every RNF must have a target metric, SLA, or compliance verification method | "Safe and secure" without verification strategy |

---

## Section 5: Core UX Flows

### Pass Criteria
| Check | Rule | Fail Signal |
|-------|------|-------------|
| Flow completeness | Minimum 3 detailed user journeys: Happy Path (Scan to Split), Manual Correction, and Local Recovery/Migration | Fewer than 3 flows described |
| Step specificity | Numbered, step-by-step user and system interactions | Descriptive prose without clear sequence |
| Fallback logic | Explicitly details what happens when permissions are rejected or OCR accuracy is low | Assumes 100% success without error paths |

---

## Section 6: Platform, Permissions & Local Storage

### Pass Criteria
| Check | Rule | Fail Signal |
|-------|------|-------------|
| Permission flow | Just-in-time (JIT) permissions for camera/location with rejects handled in UI | Permissions requested upfront without user action |
| Secure contexts | Explicitly states HTTPS requirements for mobile browser hardware access | No mention of secure context/HTTPS constraints |
| Identity & Storage | Details LocalStorage/IndexedDB limits, maximum stored history sessions, and clear data deletion tools | Lacks storage limit definitions or clear delete mechanism |
| JSON Backup Schema | Explicit export/import structure, including schema version control, timestamps, and data validation steps | Missing export/import schema details or validation steps |

---

## Section 7: Business Model & Tech Considerations

### Pass Criteria
| Check | Rule | Fail Signal |
|-------|------|-------------|
| Monetization stages | Outlines Phase 0 (free) and subsequent B2C freemium / B2B SaaS layers | "Monetize later" without structural breakdown |
| Data monetization limits | Explicitly clarifies data monetization is secondary/avoided due to regulatory complexity | Direct monetization of user data listed as primary revenue |
| Tech tradeoffs (OCR/AI) | Structured comparison table (Option A, B, C) evaluating cost, latency, accuracy, and strategic alignment | No cost-benefit comparison of OCR heuristics vs LLM tokens |

---

## Section 8: Legal, Compliance & Privacy

### Pass Criteria
| Check | Rule | Fail Signal |
|-------|------|-------------|
| Pseudonymization | Distinguishes pseudonymized vs anonymized data, acknowledging pseudonymized is personal data | Treats transaction data or IPs as automatically anonymous |
| Re-identification risk | Analyzes re-identification vectors in hyper-local datasets (restaurant name, date, time, group size) | Ignores local correlation risks |
| Consent separation | Mandates separate, informed, revocable checkboxes for primary utility and secondary analytics | Bundled terms of service and marketing consent |
| Data minimization | Restricts collection of email, phone, or name unless strictly necessary for core utility | Requests user registration info for basic scan |

---

## Section 9: Product Risks & Critical Assumptions

### Pass Criteria
| Check | Rule | Fail Signal |
|-------|------|-------------|
| Critical assumptions | Listed assumptions are falsifiable, testable, have risk levels, and validation methods | Non-falsifiable assumptions |
| Product risks table | Structured table including risk description, severity (HIGH/MED/LOW), probability, and concrete mitigation | Lacks severity, probability, or realistic technical mitigations |

---

## Section 10: Metrics & Performance Indicators

### Pass Criteria
| Check | Rule | Fail Signal |
|-------|------|-------------|
| North Star Metric | Single defined North Star metric representing user value (not just revenue/sessions) | Missing North Star, or uses basic revenue/active users |
| Funnel metrics | Quantifiable KPIs for: Activation (completion rates), Quality (manual corrections), Retention (return rates), and Business | Only lists active users/page views (vanity metrics) |

---

## Section 11: Development Roadmap

### Pass Criteria
| Check | Rule | Fail Signal |
|-------|------|-------------|
| Phase roadmap | Min 4 incremental phases (Fase 0 validation, Fase 1 retention, Fase 2 account, Fase 3 B2B/SaaS) | Generic "future plans" list |
| Phase alignment | Each phase states a clear objective and features included | Roadmap sections lack objective or scope boundaries |

---

## Section 12: Project Management & Success

### Pass Criteria
| Check | Rule | Fail Signal |
|-------|------|-------------|
| Open decisions | Table listing decision ID, description, options, tradeoffs, owner, and deadline | Empty decisions list |
| MVP Acceptance Criteria | Explicit checklist of conditions required to ship (coverage, UX gates, legal compliance gates) | "Ready when tests pass" without specific product gates |
| Executive recommendation | Clear alignment guidelines for engineering and stakeholders | Missing recommendation section |

---

## Cross-Section Consistency Checks

Run these AFTER all sections are generated:

| Check | Rule |
|-------|------|
| Persona → Feature coverage | Every persona need in Section 2 has at least one RF in Section 4 |
| RF → Persona link | Every RF in Section 4 maps to a persona in Section 2 |
| Objective → KPI link | Every business objective in Section 4 has a linked KPI in Section 10 |
| KPI → Objective link | Every KPI in Section 10 connects to an objective or funnel stage |
| Competitor → Differentiator | Every competitor in Section 2 has a specific differentiator against them |
| RNF → Scope impact | Non-functional constraints/RNFs are reflected in the technical scope |
| Problem → Value Prop | The problem in Section 1 is directly addressed by the value proposition and MVP features |

---

## Overall PRD Quality Gate

Before saving the final PRD, verify:

- [ ] All sections individually validated using these rules
- [ ] Cross-section consistency checks pass
- [ ] No [TO VALIDATE] or [TO DEFINE] markers exceed 15% of all fields in the final document
- [ ] Document has version, date, and status metadata
- [ ] Change log entry exists for this version
