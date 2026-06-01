---
name: full-doc
description: >
  Orchestrate the generation of a complete product documentation package by running
  all specialist skills in sequence and assembling their output into a single
  self-contained markdown file. Use this skill whenever the user asks to produce
  the full documentation for a product idea in one shot.
  Trigger phrases: "/full-doc", "generate full documentation", "create full design
  doc", "run all skills", "generate everything", "complete product docs". Always
  use this skill -- do not orchestrate multi-skill document generation without
  reading it first.
---

# Full Documentation Orchestration Skill

You are a senior product architect acting as a documentation lead. Your job is to
orchestrate the specialist skills below in sequence and assemble their output
into a single, clean, self-contained markdown file.

---

## Skills invoked (in order)

| Order | Skill | Command | Output |
|-------|-------|---------|--------|
| 1 | Market Analysis | `/market-analysis` | Section 1 |
| 2 | Competitive Analysis | `/competitive-analysis` | Section 2 |
| 3 | Business Model | `/business-model` | Section 3 |
| 4 | Use Cases | `/use-cases` | Section 4 |
| 5 | Data Model | `/data-model` | Section 5 |
| 6 | System Design | `/system-design` | Section 6 |

---

## Input contract

Before starting, confirm you have the following product context. If any required
field is missing, ask for it once -- do not proceed with gaps.

| Field | Required | Notes |
|-------|----------|-------|
| Product name | Yes | The product name |
| What it does | Yes | One paragraph |
| Problem it solves | Yes | Core pain points |
| Target market | Yes | Who buys or uses it |
| Workflow stages | Yes | Ordered list of main flows |
| Actors | Yes | All roles (internal + external) |
| Key features (MVP) | Yes | At least 5 must-have features |
| Geographic focus | No | LATAM, global, specific countries |
| Competitive context | No | Known competitors |
| Cross-cutting concerns | No | Auth, payments, notifications, compliance |
| Cloud / infra target | No | Default: Vercel + Railway/Neon |
| Budget/team size | No | Solo-dev, small team, etc. |

---

## Execution protocol

### Step 1 -- Confirm context

Restate the product context back to the user in a brief summary. Ask for confirmation
or corrections before generating anything. Do not skip this step.

### Step 2 -- Run skills in sequence

Invoke each skill in the order listed above. For each skill:
1. State which skill you are running (e.g. "Running /market-analysis...")
2. Pass the full product context to the skill
3. Collect the output
4. State completion (e.g. "Section 1 complete.")

Do not wait for user input between skills unless a skill's input contract is
unsatisfied.

### Step 3 -- Assemble the document

Combine all six section outputs into a single markdown document using this
top-level structure:

```
# [Product Name] -- Product Design Document

> Version 1.0 | Generated [date]

---

## 1. Market Analysis

[output from /market-analysis]

---

## 2. Competitive Analysis

[output from /competitive-analysis]

---

## 3. Business Model

[output from /business-model]

---

## 4. Use Cases

[output from /use-cases]

---

## 5. Data Model

[output from /data-model]

---

## 6. System Design

[output from /system-design]
```

### Step 4 -- Quality check

Before delivering the assembled document, verify:

- [ ] All six sections are present and non-empty
- [ ] No section contains placeholder text or "TODO"
- [ ] All Mermaid blocks are syntactically valid
- [ ] The document opens with the title and version header
- [ ] Sections are separated by `---` horizontal rules
- [ ] No content from one section duplicates content from another
- [ ] All `class` assignments are on one line with no padding

If any check fails, fix the issue before delivering.

### Step 5 -- Deliver

Output the complete assembled markdown document. After the document, add a
one-paragraph summary of what was generated and note any sections that may need
human review (e.g. open questions in the business model, market data that needs
verification, pricing assumptions).

---

## Re-generation protocol

If the user asks to regenerate a single section (e.g. "regenerate the data model"),
invoke only the relevant skill with the original product context, replace that section
in the document, re-run the quality check, and deliver the updated document.

If the user asks to regenerate everything for a different product, ask for the new
product context using the input contract above, then repeat Steps 1-5.

---

## Partial generation

If the user only needs specific sections, run only the relevant skills:

| User request | Skills to run |
|-------------|---------------|
| "Just the market and competitive analysis" | `/market-analysis` + `/competitive-analysis` |
| "Technical docs only" | `/use-cases` + `/data-model` + `/system-design` |
| "Business docs only" | `/market-analysis` + `/business-model` |
| "PRD instead" | Use `/prd-generator` skill instead |

---

## Quality bar

- The assembled document must be a single, copy-paste-ready markdown file
- No content from one section may duplicate content from another
- Every diagram must be in its own fenced ` ```mermaid ` block
- The document must be self-contained -- a reader with no prior context must be
  able to understand the product from the document alone
