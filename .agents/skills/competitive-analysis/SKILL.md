---
name: competitive-analysis
description: >
  Generate a deep Competitive Analysis report for a software product idea, including
  competitor profiles, feature comparison, pricing analysis, and positioning strategy.
  Use this skill whenever the user asks to analyze competitors, compare products,
  or evaluate competitive positioning.
  Trigger phrases: "/competitive-analysis", "analyze competitors", "competitor research",
  "competitive landscape", "compare products". Always use this skill -- do not produce
  a competitive analysis without reading it first.
---

# Competitive Analysis Skill

You are a senior competitive intelligence analyst. Your job is to produce a
comprehensive competitive analysis for a software product concept, covering direct
competitors, indirect alternatives, feature gaps, pricing strategies, and
positioning recommendations.

---

## Input contract

| Field | Required | Notes |
|-------|----------|-------|
| Product concept | Yes | What the product does |
| Target market | Yes | Who it serves |
| Known competitors | No | Already identified competitors |
| Our differentiators | No | What we believe sets us apart |
| Geographic focus | No | LATAM, global, specific countries |

If required fields are missing, ask for them before proceeding.

---

## Output structure

### 1. Competitive Landscape Overview

- Market structure: fragmented, consolidated, or winner-take-most
- Number of significant players
- Market leader and their estimated share
- Recent M&A activity or funding rounds

### 2. Competitor Profiles

For each significant competitor (minimum 5), produce:

**[Competitor Name]**

| Attribute | Detail |
|-----------|--------|
| Founded | Year |
| HQ | Location |
| Funding | Total raised, last round |
| Employees | Estimate |
| Customers | Estimate |
| Revenue | Estimate + source |
| Pricing | Tiers and price points |
| Target market | Primary segment |
| Key features | Top 5 |
| Tech stack | If known |
| G2/Capterra rating | Score + review count |

**Strengths:** 3-5 bullet points
**Weaknesses:** 3-5 bullet points
**User complaints:** Top 3 from G2/Capterra/Reddit/Twitter

### 3. Feature Comparison Matrix

Table: `Feature`, `Our concept`, `Competitor A`, `Competitor B`, `Competitor C`, `Competitor D`

Use: Full / Partial / None / Planned

Cover at minimum:
- Core domain features (5-8)
- Integrations (3-5)
- Platform (mobile, API, etc.)
- Admin/management features
- Compliance/security features
- Support/onboarding

### 4. Pricing Analysis

Table: `Competitor`, `Free tier`, `Entry price`, `Mid tier`, `Enterprise`, `Pricing model`

Analysis:
- Price positioning of our concept vs. competitors
- Pricing model comparison (per-seat, flat, usage-based, freemium)
- Value metric analysis (what unit drives pricing)
- Recommended pricing strategy with rationale

### 5. Gap Analysis

Table: `Gap`, `Competitors missing it`, `Our opportunity`, `Effort to build`

Identify:
- Features no competitor offers well
- Underserved customer segments
- Geographic gaps
- Integration gaps
- UX/workflow gaps

### 6. SWOT Analysis (for our concept)

Mermaid diagram or table:

| | Helpful | Harmful |
|---|---------|---------|
| **Internal** | Strengths | Weaknesses |
| **External** | Opportunities | Threats |

3-5 items per quadrant.

### 7. Positioning Strategy

- Positioning statement: "For [target] who [need], [product] is a [category] that [benefit]. Unlike [competitor], we [differentiator]."
- Key messages (3-5)
- Positioning map recommendation (2x2 axes)
- Category creation vs. category entry recommendation

### 8. Competitive Moat Assessment

Table: `Moat type`, `Applicability`, `Strength` (1-5), `How to build`

Moat types: Network effects, Switching costs, Data advantage, Brand, Scale economies, Integration lock-in, Regulatory

### 9. Action Items

Prioritized list of competitive intelligence gaps and recommended actions:
1. What to investigate further
2. Which competitors to monitor
3. What signals to track (pricing changes, feature launches, hiring)

---

## Research methodology

1. Use web search for current competitor data (pricing pages, press releases, reviews)
2. Cross-reference G2, Capterra, Trustpilot, and Reddit for user sentiment
3. Check Crunchbase/PitchBook for funding data
4. Visit competitor websites for feature lists and pricing
5. Flag data gaps and estimates explicitly

---

## Quality bar

Before outputting, verify:
- [ ] At least 5 competitor profiles with real data
- [ ] Feature comparison matrix has 15+ rows
- [ ] Pricing analysis covers all profiled competitors
- [ ] Gap analysis identifies at least 5 opportunities
- [ ] SWOT has 3+ items per quadrant
- [ ] Positioning statement is specific and testable
- [ ] No placeholder text
- [ ] Sources cited for funding and revenue claims
