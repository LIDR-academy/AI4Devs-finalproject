# Prompt: Data Model Section (Mermaid ER Diagram) from PRD

## Role

You are a **Senior Database/Data Architect** specializing in relational data modeling and Entity-Relationship (ER) diagramming, with deep expertise in the Mermaid `erDiagram` syntax.

## Objective

Given the attached PRD ("Personal Training Management Platform"), add a **new "Data Structure" section** that defines the application's data model as a **Mermaid ER diagram**. The diagram must use the full expressive capability of Mermaid's `erDiagram` syntax — including primary keys, foreign keys, attribute types, and relationship cardinality — to give maximum detail. This task extends the previous architecture-diagram deliverable; it does not replace or modify it.

## Context (from the PRD)

Derive all entities, attributes, and relationships strictly from the PRD. Key entities and relationships to consider include, at minimum:

- **Users** with distinct roles: Admin, Coach, Coachee — each with role-specific attributes (e.g., Coach has Bank account, Social Security Number, DNI; Coachee has Level, Class type preference).
- **Class** (Individual or Group type), with assigned Coach, level, start time, fixed 1-hour duration, recurrence (one-off vs. weekly series), and status (Active/Canceled).
- **Class Enrollment / Attendance** — the relationship between Coachees and the Classes they attend (many-to-many for Group classes; one-to-one per slot for Individual classes).
- **Waiting List** entries — linking a Coachee to a specific Class (or specific time slot, for Individual classes), with join order/timestamp.
- **Level** — the 5 named tiers (Principiante, Básico, Intermedio, Avanzado, Experto) and their color mapping.
- **Block** (Calendar) — Personal vs. Gym-wide, linked to the Coach/Admin who created it, with start/end time.
- **Notification** — the 12 catalogued event types, recipient, content, and read/sent status.
- **Recurring Series** — the relationship between a recurrence definition and its generated Class instances.

## Instructions

1. **Identify all entities** implied by the PRD's business rules, glossary, and functional requirements (Section 3 Roles, Section 4 Glossary, Section 5 Business Rules, Section 7 Notifications).
2. **Define each entity's attributes**, including appropriate data types (e.g., `string`, `int`, `datetime`, `boolean`, `enum`), inferred reasonably from the PRD where types are not explicitly stated.
3. **Mark primary keys (PK) and foreign keys (FK)** explicitly on every applicable attribute, using Mermaid's supported key annotations.
4. **Define relationships between entities** using correct Mermaid ER cardinality notation (e.g., one-to-many, many-to-many, one-to-one), reflecting the actual business rules (e.g., a Group Class has many Coachees and a Coachee can be in many Group Classes; a Waiting List entry belongs to exactly one Coachee and one Class/slot).
5. **Use Mermaid `erDiagram` syntax fully** — leverage attribute comments/annotations where useful to clarify constraints (e.g., unique values, enums, business rules like max waiting list size) without breaking valid Mermaid syntax.
6. **Output the result as a single Mermaid code block**, ready to copy-paste and render directly.
7. Accompany the diagram with a **brief entity legend** (one line per entity, no more) explaining its purpose, so the diagram is self-contained and readable alongside the PRD.

## Output Format

Structure the output as Markdown with the following sections, written so it can be appended directly after the existing architecture sections:

1. **Heading**: `## Data Structure`
2. **Entity Legend** — short bullet list, one line per entity (name + one-sentence purpose).
3. **Entity-Relationship Diagram** — a single fenced Mermaid code block using `erDiagram` syntax, with all entities, attributes (with types), PK/FK annotations, and relationships with correct cardinality.

## Constraints

- Stay strictly within the objective: this is a data model addition only. Do not redefine, restate, or alter the previously requested architecture diagram, technology stack, or pattern discussion.
- All entities, attributes, and relationships must be traceable back to specific PRD content — do not invent business rules or fields not implied by the PRD. Where an attribute's type or constraint is not explicit in the PRD, state it as a reasonable assumption rather than presenting it as a stated fact.
- The Mermaid syntax must be valid and renderable as an `erDiagram` (correct PK/FK notation and relationship cardinality symbols).
- Do not produce a separate narrative description of the data model outside the legend and diagram — keep the section focused and copy-paste ready.