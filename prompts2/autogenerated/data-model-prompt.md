# Prompt: Generate Data Structure Section with Detailed Mermaid ER Diagram

## Role
You are a senior data architect and technical documentation specialist with deep expertise in relational and non-relational data modelling, entity-relationship design, and Mermaid diagram syntax.

---

## Objective
Write a **Data Structure** section for the technical documentation of the application described in this conversation. The section must include a fully detailed Mermaid ER diagram that uses the complete range of available syntax to express the data model with maximum precision, plus written documentation explaining each entity and its relationships.

---

## Instructions

### 1. Derive the Data Model from This Application
- Identify all entities, attributes, and relationships based on what has been established in this conversation (features, user roles, domain logic, etc.).
- Do not invent entities that have not been implied by the product. Do not omit entities that are clearly required.

### 2. Build the Mermaid ER Diagram
Use **`erDiagram`** syntax and apply every available Mermaid ER feature to maximise detail:

#### Keys & Attribute Types
- Mark primary keys with `PK`
- Mark foreign keys with `FK`
- Mark unique constraints with `UK` where applicable
- Specify the **data type** for every attribute (e.g. `int`, `string`, `boolean`, `datetime`, `float`, `uuid`)
- Example attribute syntax:
  ```
  ENTITY {
    uuid    id          PK
    string  name
    int     user_id     FK
    string  email       UK
    boolean is_active
    datetime created_at
  }
  ```

#### Relationships
- Define every relationship using the full Mermaid cardinality syntax:

  | Symbol | Meaning |
  |--------|---------|
  | `\|\|` | exactly one |
  | `\|o` | zero or one |
  | `o\|` | zero or one |
  | `}o` | zero or many |
  | `o{` | zero or many |
  | `}\|` | one or many |
  | `\|{` | one or many |

- Include a **quoted relationship label** on every line (e.g. `"has"`, `"belongs to"`, `"creates"`)
- Example:
  ```
  USER ||--o{ POST : "creates"
  POST }o--|| CATEGORY : "belongs to"
  ```

### 3. Write the Entity Documentation
For each entity in the diagram, provide:
- **Purpose**: what this entity represents in the domain
- **Key attributes**: a brief description of non-obvious fields
- **Relationships**: a plain-English summary of how it relates to other entities

### 4. Document Relationship Rules
After the entity descriptions, add a **Relationship Rules** subsection that states any important cardinality constraints or business rules in plain language (e.g. "A user can belong to multiple groups, but each group must have exactly one admin").

---

## Output Format

Deliver the section ready to paste into the project's technical documentation:

````
## Data Structure

### Overview
[2–3 sentences describing the overall data model approach — relational, document-based, hybrid, etc. — and why it fits this application]

### Entity-Relationship Diagram

```mermaid
erDiagram
  [Full diagram here]
```

### Entity Descriptions

#### [EntityName]
- **Purpose**: ...
- **Key attributes**: ...
- **Relationships**: ...

[Repeat for each entity]

### Relationship Rules
- ...
````

---

## Constraints
- The Mermaid diagram must be valid and renderable — double-check syntax before outputting.
- Every entity must have at least a `PK` field and all foreign keys must be marked `FK`.
- Use `snake_case` for all attribute names to reflect real-world database conventions.
- Relationship labels must be meaningful domain verbs, not generic words like `"link"` or `"ref"`.
- Do not simplify the diagram for brevity — the goal is maximum detail and documentation value.