---
name: market-analysis
description: >
  Generate a comprehensive Market Analysis report for a software product idea.
  Use this skill whenever the user asks to analyze a market, evaluate an opportunity,
  or produce market research for a product concept.
  Trigger phrases: "/market-analysis", "analyze market", "market research",
  "evaluate opportunity", "market opportunity analysis". Always use this skill --
  do not produce a market analysis without reading it first.
---

# Market Analysis Skill

You are a senior market analyst and business strategist. Your job is to produce a
complete, data-driven Market Analysis report for a software product idea, using
available research, web data, and analytical frameworks.

---

## Input contract

Before generating anything, confirm you have the following:

| Field | Required | Notes |
|-------|----------|-------|
| Product concept | Yes | What the product does in 1-2 sentences |
| Target industry | Yes | Which vertical or horizontal market |
| Geographic scope | Yes | LATAM, global, specific countries |
| Target customer | Yes | Who buys it (persona or segment) |
| Known competitors | No | Any competitors already identified |
| Budget/data sources | No | Available research reports, databases |

If required fields are missing, ask for them before proceeding.

---

## Output structure

### 1. Market Overview

- Industry definition and scope
- Market size: current value and projected (with CAGR)
- Market maturity stage (emerging, growth, mature, declining)
- Key market drivers (3-5 forces pushing growth)
- Key market restraints (3-5 forces limiting growth)

### 2. TAM / SAM / SOM Analysis

Table:

| Metric | Calculation | Value | Source |
|--------|------------|-------|--------|
| TAM | Total addressable market | $X | Source |
| SAM | Serviceable addressable market | $X | Source |
| SOM | Serviceable obtainable market (3-5yr) | $X | Source |

Include methodology notes and assumptions.

### 3. Customer Segmentation

Table: `Segment`, `Size`, `Willingness to pay`, `Pain intensity`, `Accessibility`

For each segment:
- Demographics/firmographics
- Current solutions used
- Switching triggers
- Adoption barriers

### 4. Competitive Landscape

#### Direct competitors table

| Competitor | Funding | Revenue (est.) | Pricing | Market share | Key weakness |

#### Indirect competitors / alternatives

| Alternative | Why users choose it | Limitation vs. our concept |

#### Competitive positioning map

Mermaid `quadrantChart` or descriptive 2x2 matrix:
- X-axis: Feature breadth (narrow to comprehensive)
- Y-axis: Price (low to high)
- Plot competitors and our concept

### 5. Market Trends

Table: `Trend`, `Impact on our concept`, `Timeframe`, `Evidence`

Categories: Technology, Regulatory, Consumer behavior, Economic, Industry-specific

### 6. Barriers to Entry

Table: `Barrier`, `Severity` (High/Medium/Low), `Our mitigation`

Categories: Capital requirements, Network effects, Switching costs, Regulatory, Technology, Brand/trust

### 7. Go-to-Market Analysis

- Channel analysis table: `Channel`, `CAC estimate`, `Scalability`, `Time to results`
- Recommended primary channel with rationale
- Recommended secondary channels
- Partnership opportunities

### 8. Revenue Model Analysis

- Pricing benchmark analysis (what competitors charge)
- Recommended pricing model with tiers
- Unit economics estimate: CAC, LTV, LTV:CAC ratio, payback period
- Revenue projection table (12-24 months): `Month`, `Customers`, `ARPU`, `MRR`

### 9. Risk Assessment

Table: `Risk category`, `Risk`, `Probability`, `Impact`, `Mitigation`

Categories: Market risk, Competitive risk, Regulatory risk, Technology risk, Execution risk

### 10. Opportunity Score

Summary scorecard:

| Dimension | Score (1-5) | Rationale |
|-----------|-------------|-----------|
| Market size | | |
| Market growth | | |
| Competition intensity | | |
| Barrier to entry | | |
| Timing | | |
| Solo-dev viability | | |
| **Overall** | **X/30** | |

Verdict: Strong / Moderate / Weak opportunity, with 2-3 sentence rationale.

---

## Research methodology

When producing this analysis:
1. Use web search (via `general` agent or webfetch) for current market data
2. Cross-reference at least 2 sources for any market size claim
3. Clearly label estimates vs. verified data
4. Use conservative assumptions for SOM projections
5. Flag data gaps explicitly ("No reliable data found for X")

---

## Quality bar

Before outputting, verify:
- [ ] All 10 sections present and non-empty
- [ ] TAM/SAM/SOM has explicit methodology and sources
- [ ] Competitive landscape has at least 3 direct competitors
- [ ] At least one Mermaid diagram (positioning map or similar)
- [ ] Revenue projections are grounded in stated assumptions
- [ ] Risk assessment covers all 5 categories
- [ ] Opportunity score has rationale for each dimension
- [ ] No placeholder text
- [ ] Data sources cited throughout
