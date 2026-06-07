---
name: plan-mvp
description: Planning workflow for Aura Planning. Invokes po-assistant and tech-design agents to gather context before creating tickets or implementing features.
mode: subagent
temperature: 0.2
permission:
  read: allow
  edit: allow
  bash: allow
  glob: allow
  grep: allow
  task: allow
---

# Planning Workflow for Aura Planning

This skill orchestrates the mandatory planning sequence for Aura Planning work items. It must be invoked before creating tickets or implementing features.

## Workflow

### Step 1: Product Owner Analysis
Invoke `@po-assistant` to:
- Read and analyze `business-documentation/Aura.MD`
- Produce MoSCoW prioritization (Must have / Should have / Could have / Won't have)
- Identify gaps, risks, and open questions
- Create sprint breakdown with deliverables per week
- Define acceptance criteria for MVP features

Capture the full output.

### Step 2: Technical Design
Invoke `@tech-design` to:
- Reference `conventions/technical-conventions.md` for baseline tech stack, architecture, data model, API specs, integrations, and security
- Extend or modify the baseline technical design based on PO analysis from Step 1
- Create feature-specific architecture diagrams (mermaid)
- Provide code patterns and implementation guidance

Capture the full output.

### Step 3: Context Consolidation
After both agents complete, summarize and store:
- Prioritized feature list with MoSCoW labels
- Sprint breakdown with timeline
- Acceptance criteria table
- Data model (entities, relationships, constraints)
- API endpoint specifications
- Architecture diagrams (mermaid)
- Integration specifications
- Security requirements

## When to Invoke

Invoke this workflow when:
- Starting a new project or phase
- Creating tickets (required by opencode.json configuration)
- Beginning implementation of any feature
- Sprint planning session

## Output Format

Provide a consolidated planning document containing:

1. **MoSCoW Prioritization** - Features organized by Must/Should/Could/Won't
2. **Sprint Breakdown** - Timeline with deliverables
3. **Acceptance Criteria** - For each MVP feature
4. **Technical Design** - Architecture, data model, API specs
5. **Implementation Notes** - Key patterns and considerations

## Notes

- The po-assistant and tech-design agents have deep context about Aura Planning
- Technical baseline is defined in `conventions/technical-conventions.md`
- Always use their outputs rather than working from memory
- This ensures consistency across planning and implementation