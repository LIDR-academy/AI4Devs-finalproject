# PRD: [Product Name]

> Version: [semver] | Date: [YYYY-MM-DD] | Author: PRD Generator AI
> Status: Draft | Under Review | Approved

---

## 1. Vision

### 1.1 Purpose
<!-- INSTRUCTION: Write exactly ONE paragraph (3-5 sentences) answering:
  - What is this product?
  - What does it do at a high level?
  - Why does it need to exist?
  Do NOT use marketing buzzwords. Be concrete and specific. -->

### 1.2 Problem Statement
<!-- INSTRUCTION: Describe the user pain point this product solves.
  Structure as:
  - WHO experiences the problem (link to personas in Section 2)
  - WHAT the problem is (observable behavior or measurable gap)
  - WHEN/WHERE it occurs (context, frequency)
  - WHY current solutions fail (gap analysis)
  Include evidence: user research, market data, or explicit hypotheses marked as [HYPOTHESIS]. -->

### 1.3 Value Proposition
<!-- INSTRUCTION: Complete this formula:
  "For [target user] who [need/pain], [product name] is a [category]
  that [key benefit]. Unlike [alternative], our product [differentiator]."
  Then expand with 2-3 measurable benefit statements.
  Each benefit must be verifiable (e.g., "reduces onboarding time by 40%"). -->

---

## 2. Target Users

### 2.1 Personas

<!-- INSTRUCTION: Create a table with minimum 2 personas. Each persona must be:
  - Named with a role-based name (e.g., "Tech Lead Maria", not just "User")
  - Described with specific daily context, not abstract demographics
  - Linked to concrete needs that map to features in Section 3 -->

| Persona | Role | Daily Context | Key Needs | Primary Pain | Success Metric |
|---------|------|---------------|-----------|--------------|----------------|
| [Name] | [Job title / role] | [What they do daily relevant to this product] | [Top 2-3 needs, numbered] | [Single biggest frustration] | [How they measure if this product helps] |

### 2.2 Market Segments

<!-- INSTRUCTION: Define primary and secondary segments.
  For each segment provide:
  - Segment name and description
  - Estimated size (users, companies, or TAM) — if unknown, state [TO VALIDATE]
  - Why this segment matters (strategic value)
  - How to reach them (acquisition channel hint) -->

| Segment | Type | Description | Estimated Size | Strategic Value |
|---------|------|-------------|----------------|-----------------|
| [Name] | Primary / Secondary | [Description] | [Number or TO VALIDATE] | [Why this segment] |

---

## 3. Product Scope

### 3.1 Core Features

<!-- INSTRUCTION: List between 5 and 10 features, prioritized.
  Each feature MUST:
  - Have a unique ID (F-01, F-02, ...)
  - Map to at least one persona need from Section 2
  - Be described in one sentence as a user capability, not a technical spec
  - Never describe HOW it works, only WHAT the user can do
  Order by priority (highest first). -->

| ID | Feature | User Capability | Persona(s) | Priority |
|----|---------|----------------|------------|----------|
| F-01 | [Name] | [As a user, I can...] | [Persona name(s)] | Must / Should / Could |

### 3.2 Out of Scope

<!-- INSTRUCTION: List at least 3 explicit exclusions.
  For each, explain WHY it is excluded (e.g., "deferred to v2", "handled by external system").
  This prevents scope creep and sets stakeholder expectations. -->

| Exclusion | Reason |
|-----------|--------|
| [What is NOT included] | [Why it's excluded and when it might be addressed] |

### 3.3 Assumptions

<!-- INSTRUCTION: List assumptions this PRD is built upon.
  Each assumption MUST be:
  - Falsifiable (can be proven wrong)
  - Testable (there's a way to validate it)
  - Marked with risk level: LOW / MEDIUM / HIGH
  If an assumption is HIGH risk, add a validation plan. -->

| ID | Assumption | Risk | Validation Method |
|----|-----------|------|-------------------|
| A-01 | [Concrete, falsifiable statement] | LOW / MEDIUM / HIGH | [How to validate] |

---

## 4. Business Requirements

### 4.1 Business Objectives

<!-- INSTRUCTION: Define SMART objectives (Specific, Measurable, Achievable, Relevant, Time-bound).
  Each objective must link to at least one KPI in Section 4.2.
  Maximum 5 objectives. -->

| ID | Objective | Metric | Target | Timeframe | Linked KPIs |
|----|-----------|--------|--------|-----------|-------------|
| O-01 | [Specific goal] | [How to measure] | [Numeric target] | [By when] | [KPI IDs] |

### 4.2 KPIs & Success Metrics

<!-- INSTRUCTION: Define 5-7 quantifiable KPIs.
  Each KPI must have:
  - A current baseline (or [TO MEASURE] if unknown)
  - A target value
  - A measurement method (tool, query, manual process)
  Avoid vanity metrics. Focus on outcomes, not outputs. -->

| ID | KPI | Current Baseline | Target | Measurement Method |
|----|-----|-----------------|--------|-------------------|
| K-01 | [Metric name] | [Current value or TO MEASURE] | [Target value] | [How to measure] |

### 4.3 Business Model

<!-- INSTRUCTION: Describe how this product generates or captures value.
  Answer concretely:
  - Revenue model (subscription, freemium, transactional, internal-tool cost-saving)
  - Pricing strategy (if applicable)
  - Unit economics hints (CAC, LTV expectations — or [TO DEFINE] if early stage)
  If this is an internal tool, describe cost savings or efficiency gains instead. -->

---

## 5. Competitive Context

### 5.1 Competitors

<!-- INSTRUCTION: Analyze minimum 2 competitors (direct or indirect).
  For each:
  - Name a real product/company (not generic "Competitor A")
  - Be honest about their strengths
  - Identify real weaknesses (not strawman arguments)
  - State our specific differentiator against THEM (not generic) -->

| Competitor | Type | Strengths | Weaknesses | Our Differentiator |
|------------|------|-----------|------------|-------------------|
| [Real name] | Direct / Indirect | [Honest strengths] | [Real weaknesses] | [Specific edge against them] |

### 5.2 Key Differentiators

<!-- INSTRUCTION: List 2-4 differentiators that are:
  - Defensible (not easily copied)
  - Specific (not "better UX" — say what's better and why)
  - Linked to a user need from Section 2
  For each, state the moat type: Technology / Data / Network Effect / Brand / Cost -->

| Differentiator | Description | Moat Type | Linked Persona Need |
|---------------|-------------|-----------|-------------------- |
| [Name] | [Specific description] | [Moat type] | [Need from Section 2] |

---

## 6. Constraints

### 6.1 Technical Constraints

<!-- INSTRUCTION: List concrete technical limitations:
  - Target platforms (web, iOS, Android, etc.)
  - Required integrations (APIs, third-party services)
  - Tech stack constraints (if any mandated by team/org)
  - Performance requirements (latency, uptime, load)
  - Infrastructure constraints (cloud provider, region, etc.)
  Be specific. "Must use AWS" is good. "Should be fast" is not. -->

| Constraint | Details | Impact on Product |
|-----------|---------|-------------------|
| [Constraint] | [Specific details] | [How it affects scope/design] |

### 6.2 Business Constraints

<!-- INSTRUCTION: Document real-world business limits:
  - Budget range (or "unfunded" / "pre-seed" / "internal budget of X")
  - Timeline hard deadlines (regulatory, market window, contractual)
  - Team size and composition
  - Resource bottlenecks (e.g., "only 1 designer available") -->

| Constraint | Details | Mitigation |
|-----------|---------|------------|
| [Constraint] | [Specific details] | [How to work within this limit] |

### 6.3 Regulatory Constraints

<!-- INSTRUCTION: List compliance requirements:
  - Data privacy (GDPR, CCPA, HIPAA, etc.)
  - Accessibility (WCAG level)
  - Industry-specific regulations
  - Legal requirements (terms of service, licensing)
  If none apply, state "No regulatory constraints identified" with justification. -->

| Regulation | Requirement | Impact | Compliance Strategy |
|-----------|-------------|--------|---------------------|
| [Regulation name] | [What it requires] | [How it affects the product] | [How to comply] |

---

## Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| [YYYY-MM-DD] | 1.0 | Initial creation | PRD Generator AI |
