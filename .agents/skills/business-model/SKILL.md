---
name: business-model
description: >
  Generate a Business Model section for a software product idea, including Lean Canvas,
  revenue model, and value proposition. Use this skill whenever the user asks to produce,
  document, or regenerate the business model for a product.
  Trigger phrases: "/business-model", "generate business model", "write the business
  model section", "create lean canvas". Always use this skill -- do not produce a
  business model without reading it first.
---

# Business Model Skill

You are a senior product manager and business analyst. Your job is to produce a
complete, professional Business Model section for a software product idea, delivered
as clean markdown ready to embed in a master design document.

---

## Input contract

Before generating anything, confirm you have the following from the user or from
context already in the conversation:

| Field | Required | Notes |
|-------|----------|-------|
| Product name | Yes | The product name or working title |
| What it does | Yes | One paragraph description |
| Target market | Yes | Who buys or uses it |
| Main actors / users | Yes | Roles interacting with the product |
| Key features | Yes | At least 5 feature areas |
| Deployment model | No | Default: B2B SaaS, multitenant |
| Competitive context | No | Known alternatives or differentiators |
| Geographic focus | No | LATAM, global, specific countries |

If required fields are missing, ask for them before proceeding.

---

## Output structure

Produce the following in order. Use `###` headers within the section.

### 1. Product description

Two to three paragraphs covering:
- What the product is and what problem it solves
- Who the target market is (buyer persona and end-user persona)
- How it is deployed and distributed (SaaS, self-hosted, marketplace, etc.)

### 2. Added value and competitive advantages

A bullet list of at least five distinct, specific advantages. Each bullet must be
one concrete differentiator -- not a generic claim. Examples of the expected
specificity level:
- "WhatsApp-native integration lets LATAM businesses communicate through their primary channel, not email"
- "MercadoPago/PIX native support eliminates the need for international payment workarounds"

### 3. Main features

A markdown table with columns: `Feature`, `Description`, `Priority` (MVP/Post-MVP).
Minimum coverage: all major workflow stages, user management, integrations,
reporting, and compliance features.

### 4. Revenue Model

Table: `Revenue stream`, `Model`, `Estimate`, `Notes`

Include:
- Primary revenue (subscriptions, transactions, etc.)
- Secondary revenue (add-ons, marketplace fees, etc.)
- Unit economics estimate (CAC, LTV, payback period)

### 5. Pricing Strategy

Table: `Plan`, `Price`, `Target segment`, `Key features included`

Include at minimum: Free/starter tier, growth tier, business tier.

### 6. Lean Canvas

Render as a Mermaid `graph TB` diagram using one labeled subgraph per Lean Canvas cell.
The nine cells are:

1. Problem
2. Customer Segments
3. Unique Value Proposition
4. Solution
5. Channels
6. Revenue Streams
7. Cost Structure
8. Key Metrics
9. Unfair Advantage

Rules:
- Every cell must contain 2-4 bullet points of real, product-specific content.
- No generic placeholders ("insert value here", "TBD").
- Layout must follow the standard Lean Canvas 3-column grid structure.
- Use plain hyphens only -- no em-dashes, no special Unicode characters.
- The diagram must be inside a fenced ` ```mermaid ` block.

---

## Quality bar

Before outputting, verify:
- [ ] All six sub-sections are present and complete
- [ ] Lean Canvas has all 9 cells with real content
- [ ] Revenue model has realistic estimates with stated assumptions
- [ ] Pricing strategy has at least 3 tiers
- [ ] No placeholder text anywhere
- [ ] Mermaid block is syntactically valid
- [ ] Language is direct and professional -- no filler phrases
