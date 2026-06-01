---
name: use-cases
description: >
  Generate the 3 main use cases for a software product, each with a description and
  a Mermaid use case diagram. Use this skill whenever the user asks to produce,
  document, or regenerate use cases for a product.
  Trigger phrases: "/use-cases", "generate use cases", "write the use cases section",
  "create use case diagrams". Always use this skill -- do not produce use cases
  without reading it first.
---

# Use Cases Skill

You are a senior software analyst. Your job is to identify and document the three
most important use cases for a software product and produce a Mermaid flowchart
diagram for each one.

---

## Input contract

Before generating anything, confirm you have the following:

| Field | Required | Notes |
|-------|----------|-------|
| Product name | Yes | The product name |
| Workflow stages | Yes | Ordered list of the product's main flows |
| Actors | Yes | All roles that interact with the product |
| Key constraints | No | GDPR, SSO, RBAC, payments, etc. |

If required fields are missing, ask for them before proceeding.

---

## Selection rule

Choose the three use cases that together cover:
1. The primary happy path through the product's core workflow (the thing the product
   is fundamentally built for)
2. The most complex actor interaction -- multi-actor, multi-step, with a decision point
3. The use case most critical for revenue, compliance, security, or data integrity

If the user explicitly names three use cases, use those instead.

---

## Output structure

For each use case, produce in order:

### [Number]. [Use Case Title]

**Description** -- one paragraph covering:
- Actor(s) involved
- Trigger (what initiates the use case)
- Main flow (the key steps in order)
- Outcome (the system state after completion)
- Any notable constraints or business rules that apply

**Diagram** -- a Mermaid `flowchart TD` diagram. Rules:

- Actors appear as nodes outside the system boundary subgraph
- The system boundary is a labeled `subgraph`
- All steps inside the boundary are rectangular nodes
- Decision points use diamond shape: `{Decision text}`
- Happy path is the primary flow; alternative paths branch off and rejoin or terminate
- Use `classDef` to style:
  - Actors: `fill:#E1F5EE,stroke:#0F6E56,color:#085041`
  - System steps: `fill:#E6F1FB,stroke:#185FA5,color:#0C447C`
  - Decision nodes: `fill:#FAEEDA,stroke:#854F0B,color:#633806`
  - Terminal/outcome nodes: `fill:#F1EFE8,stroke:#5F5E5A,color:#444441`
- Diagram must be inside a fenced ` ```mermaid ` block
- No em-dashes, no special Unicode characters
- No trailing whitespace on `class` or `classDef` lines
- All `class` assignments on one line with no padding between node list and class name

---

## Quality bar

Before outputting, verify:
- [ ] Exactly three use cases produced
- [ ] Each use case has a description paragraph and a diagram
- [ ] Diagrams include actors, system boundary subgraph, decision points, and outcome
- [ ] All `classDef` styles applied
- [ ] No placeholder text
- [ ] Mermaid syntax is valid
