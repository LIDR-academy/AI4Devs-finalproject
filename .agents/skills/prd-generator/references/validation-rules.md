# PRD Validation Rules

Apply these rules after generating each section. A section MUST pass all its checks before presenting to the user for approval.

---

## Section 1: Vision

### Pass Criteria
| Check | Rule | Fail Signal |
|-------|------|-------------|
| Purpose clarity | One paragraph, 3-5 sentences, answers what/why | Longer than 5 sentences or uses buzzwords ("synergy", "leverage", "disrupt") |
| Problem specificity | Names WHO, WHAT, WHEN/WHERE, WHY alternatives fail | Generic "users struggle with X" without context |
| Problem evidence | Includes data, research, or explicitly marked [HYPOTHESIS] | Unsupported claims presented as facts |
| Value prop formula | Follows "For [user] who [need], [product] is a [category] that [benefit]" | Missing any formula component |
| Measurable benefits | At least 2 benefits with quantifiable targets | "Better experience" without a metric |

### Anti-patterns
- ❌ "Revolutionary platform that disrupts the industry" → no substance
- ❌ Problem described without linking to a real user persona
- ❌ Value proposition identical to a competitor's marketing copy

---

## Section 2: Target Users

### Pass Criteria
| Check | Rule | Fail Signal |
|-------|------|-------------|
| Persona count | Minimum 2 personas | Single persona or none |
| Persona specificity | Named with role, has daily context, not just demographics | "25-35 year old professionals" without role context |
| Needs traceability | Each persona need maps to at least one feature in Section 3 | Orphan needs with no feature coverage |
| Pain concreteness | Primary pain is observable or measurable | Vague "frustrated with current tools" |
| Segment sizing | Market segments have estimated size or explicit [TO VALIDATE] | No sizing and no acknowledgment of uncertainty |

### Anti-patterns
- ❌ Personas that are just demographic profiles without behavioral context
- ❌ "Everyone" as a target user
- ❌ Persona needs that don't appear anywhere in Section 3 features

---

## Section 3: Product Scope

### Pass Criteria
| Check | Rule | Fail Signal |
|-------|------|-------------|
| Feature count | Between 5 and 10 features | Fewer than 5 (too vague) or more than 10 (scope creep) |
| Feature as capability | Written as "user can [do X]", not "system does [Y]" | Technical implementation details in feature description |
| Persona mapping | Every feature links to at least one persona | Feature with no persona → potential gold-plating |
| Out of scope | At least 3 exclusions with justification | Empty out-of-scope section |
| Assumptions testable | Every assumption is falsifiable with a validation method | "Users will like this" without a way to test |
| High-risk assumptions | HIGH risk assumptions have a validation plan | HIGH risk without mitigation |

### Anti-patterns
- ❌ Features described as technical tasks ("implement REST API") instead of user capabilities
- ❌ Out of scope section says "N/A" — there is always something out of scope
- ❌ Assumptions that are actually decisions ("We will use React") — move to Constraints

---

## Section 4: Business Requirements

### Pass Criteria
| Check | Rule | Fail Signal |
|-------|------|-------------|
| SMART objectives | Each objective is Specific, Measurable, Achievable, Relevant, Time-bound | "Grow the user base" without a target number or timeframe |
| Objective-KPI link | Every objective links to at least one KPI | Orphan objectives with no way to measure success |
| KPI quantifiable | Every KPI has a numeric baseline and target | "Improve satisfaction" without a scale |
| KPI measurement | Each KPI has a concrete measurement method | KPI with no way to measure it |
| KPI count | Between 5 and 7 KPIs | Fewer than 5 (blind spots) or more than 7 (unfocused) |
| Business model concrete | Revenue/value mechanism is specific, not generic | "We will monetize later" |
| No vanity metrics | KPIs measure outcomes, not outputs | "Number of features shipped" is an output, not an outcome |

### Anti-patterns
- ❌ Objectives without timeframes
- ❌ KPIs that can't be measured with available tools
- ❌ Business model described as "TBD" without at least a hypothesis

---

## Section 5: Competitive Context

### Pass Criteria
| Check | Rule | Fail Signal |
|-------|------|-------------|
| Real competitors | Named real products/companies, not "Competitor A" | Anonymous competitors |
| Competitor count | Minimum 2 (direct or indirect) | Only 1 or none → blind spot |
| Honest strengths | Competitor strengths are genuinely strong, not strawman | "They have a clunky UI" when they actually don't |
| Specific differentiators | Our edge is concrete and defensible, not "better UX" | Generic differentiators that any competitor could claim |
| Moat identified | Each differentiator has a moat type | Differentiator without defensibility reasoning |
| Linked to needs | Differentiators connect to user needs from Section 2 | Differentiator that solves a problem no persona has |

### Anti-patterns
- ❌ "No competitors exist" — there are always alternatives (even manual processes)
- ❌ Differentiators that are just features ("we have dark mode") instead of strategic advantages
- ❌ Competitor analysis that reads like marketing ("we are better at everything")

---

## Section 6: Constraints

### Pass Criteria
| Check | Rule | Fail Signal |
|-------|------|-------------|
| Technical specificity | Constraints name concrete technologies, platforms, numbers | "Should be fast" instead of "P95 latency < 200ms" |
| Business realism | Budget, timeline, team size are stated or flagged as [TO DEFINE] | No mention of resource limits |
| Regulatory completeness | Applicable regulations listed, or explicit "none identified" with justification | Empty regulatory section without explanation |
| Impact documented | Each constraint explains how it affects the product | Constraint listed without impact analysis |
| Mitigation for business | Business constraints have a mitigation or workaround | Hard deadline with no plan for what to cut if behind |

### Anti-patterns
- ❌ "No constraints" — every project has constraints
- ❌ Mixing constraints with assumptions (constraints are fixed; assumptions are beliefs)
- ❌ Technical constraints that prescribe implementation ("must use microservices") unless mandated by org

---

## Cross-Section Consistency Checks

Run these AFTER all 6 sections are approved:

| Check | Rule |
|-------|------|
| Persona → Feature coverage | Every persona need in Section 2 has at least one feature in Section 3 |
| Feature → Persona link | Every feature in Section 3 maps to a persona in Section 2 |
| Objective → KPI link | Every objective in Section 4 has a linked KPI |
| KPI → Objective link | Every KPI in Section 4 connects to an objective |
| Competitor → Differentiator | Every competitor in Section 5 has a specific differentiator against them |
| Constraint → Scope impact | Technical constraints in Section 6 are reflected in feature scope in Section 3 |
| Problem → Value Prop | The problem in Section 1 is directly addressed by the value proposition |

If any cross-section check fails, flag it to the user during final assembly and suggest corrections.

---

## Overall PRD Quality Gate

Before saving the final PRD, verify:

- [ ] All 6 sections individually approved by user
- [ ] Cross-section consistency checks pass
- [ ] No [TO VALIDATE] or [TO DEFINE] markers exceed 20% of all fields
- [ ] Document has version, date, and status metadata
- [ ] Change log entry exists for this version
