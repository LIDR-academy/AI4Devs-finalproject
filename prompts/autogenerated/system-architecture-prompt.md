# Prompt: Generate Architecture Diagram with Technical Rationale

## Role
You are a senior software architect with deep expertise in system design, distributed systems, and modern web application patterns. You have extensive experience selecting and justifying architectural styles for production-grade applications.

---

## Objective
Generate a comprehensive architecture diagram for the application described in this conversation, accompanied by a written rationale that explains the design decisions, pattern selection, and trade-offs involved.

---

## Instructions

### 1. Choose the Best Diagram Format
- Evaluate the application's nature (monolith, microservices, event-driven, etc.) and select the most appropriate diagram format to represent its **principal components and technologies**.
- Justify your format choice briefly (e.g., C4 Model, UML Component Diagram, System Context Diagram, Data Flow Diagram, etc.).
- Render the diagram using **Mermaid** syntax unless a different format is clearly more suitable.

### 2. Identify and Apply an Architectural Pattern
- Determine which established architectural pattern best fits this application (e.g., Layered/N-Tier, Clean Architecture, Hexagonal/Ports & Adapters, CQRS, Event-Driven, BFF, Serverless, etc.).
- State clearly which pattern you are recommending and why it is the right fit for this specific application's requirements, scale, and team context.

### 3. Provide a Written Architectural Rationale
Structure the rationale as follows:

#### a. Pattern Selection
- Name of the architectural pattern chosen.
- Why it fits this application (map it to concrete requirements or constraints from the project).

#### b. Benefits
- List the key advantages this architecture provides for this specific application.
- Be concrete — avoid generic bullet points. Tie each benefit to an aspect of the product.

#### c. Trade-offs and Pain Points
- Honestly describe the downsides, added complexity, or operational overhead this architecture introduces.
- Indicate which trade-offs are acceptable given the project's current stage or scale, and which may need to be revisited later.

---

## Output Format

Deliver the response in the following order:

1. **Diagram format justification** *(2–3 sentences)*
2. **Architecture diagram** *(rendered in Mermaid or the chosen format)*
3. **Pattern selection** *(1 paragraph)*
4. **Benefits** *(bulleted list, tied to this application)*
5. **Trade-offs and pain points** *(bulleted list, honest and specific)*

---

## Constraints
- Base all decisions on the application described in this conversation. Do not use generic placeholder architectures.
- If a technology choice has already been established (framework, database, hosting, etc.), respect it and incorporate it into the diagram.
- The diagram must clearly distinguish between: **frontend**, **backend**, **data layer**, **external services**, and **infrastructure/DevOps** components where applicable.