---
name: multi-agent-investigation
description: Spawn multiple specialist agents in parallel to investigate complex problems from different angles. Use when a problem requires simultaneous codebase exploration, web research, git state analysis, and synthesis of competing hypotheses.
---

```
sudo
Contracts {
  Inputs {
    problem: string (required)
      "The core question, failure, or decision to resolve"
    angles: List<{
      question: string (required)
        "The specific question for this angle"
      agent_type: "explore" | "general" (required)
        "explore for codebase/files, general for web research"
    }> (required)
      "Distinct investigation perspectives with agent type assignment"
    budget?: string (optional)
      "Token budget hint: 'low', 'medium', 'high'. Default: medium"
  }
  Outputs {
    synthesis: string
      "Merged findings ranked by confidence, with reasoning"
    next_steps: List<string>
    confidence: string
      "high | medium | low — based on evidence quality"
  }
  Constraints {
    MUST: "spawn agents in parallel, not sequentially"
    MUST: "synthesize all findings before drawing conclusions"

    MUST: "use context7-mcp for web research before spawning generic agents"
    SHOULD: "assign one angle per agent; avoid overloaded agents"
    SHOULD: "include an 'explore' agent for codebase-heavy angles"
    SHOULD: "include a 'general' agent for web research angles"
    NEVER: "draw conclusions before all agents report back"
    NEVER: "merge agent findings into a single hypothesis without ranking"
  }
}
```

# Multi-Agent Investigation

## When to use this skill

Use when a problem is complex enough that **any single agent would need to make too many assumptions**. Indicators:

- The problem spans multiple systems (CI + app code + platform policy)
- There are competing hypotheses with different root causes
- The answer requires simultaneously: git state, codebase, web research, and execution context
- You've already tried reading files and still don't understand the failure
- A fix was applied but the problem persists — suggesting a different layer
- Multiple failed attempts to fix the same issue
- Root cause could be in any of several possible layers (infra, code, config, platform)

## Investigation Flow

```
sudo
workflow:
  name: "multi-agent-investigation"
  description: "Parallel specialist agents + synthesis"
  goals:
    - "Define one clear angle per agent"
    - "Run all agents in parallel"
    - "Merge findings into ranked hypotheses"
    - "Derive next steps with confidence scores"
  steps:
    - id: "define-angles"
      description: "Identify all distinct investigation angles needed"
      action_type: "reason"
    - id: "validate-angles"
      description: "Ensure angles are non-overlapping and sufficiently diverse; split or merge if needed"
      action_type: "reason"
    - id: "spawn-agents"
      description: "Launch one task agent per angle in parallel"
      action_type: "agent"
    - id: "synthesize"
      description: "Merge all agent findings; rank by confidence and evidence quality"
      action_type: "reason"
    - id: "derive-next-steps"
      description: "Produce ranked hypotheses and recommended actions"
      action_type: "reason"
```

## Angle Definition Guide

For each investigation angle, specify:

- **What to investigate** — the specific question for this angle
- **Agent type** — `explore` for codebase/files, `general` for web research
- **What context to pass** — key files, known facts, constraints
- **What to return** — findings, evidence, confidence level

### Common Angles

| Angle | Agent Type | Typical Question |
|-------|------------|-----------------|
| Codebase state | `explore` | Does the code support this behavior? What does X do? |
| Git state | `explore` | What tags/commits exist? What does git describe return? |
| Web research | `general` | How does platform X behave in this scenario? |
| Platform docs | `general` | What does the official docs say about Y? |
| Execution context | `explore` | What environment does this CI step actually run in? |
| Alternative hypothesis | `explore` | What if the bug is in a different layer? |

### Spawning Pattern

```python
agents = [
    task(agent="explore", prompt=codebase_angle_prompt, description="codebase analysis"),
    task(agent="general", prompt=web_research_angle_prompt, description="platform behavior research"),
    task(agent="explore", prompt=git_state_angle_prompt, description="git state diagnosis"),
    task(agent="general", prompt=alternative_hypothesis_angle_prompt, description="alternative root cause"),
]
results = [agent.result() for agent in agents]
```

## Example: CI Pipeline Failure

**Problem:** PyPI upload keeps failing with "file already exists" even after version bump.

**Angles spawned:**
1. `explore` — "Analyze the GitHub Actions workflow: trigger, job deps, checkout ref, build step, artifact flow"
2. `general` — "Research PyPI file reuse policy and pypa/gh-action-pypi-publish skip-existing behavior"
3. `explore` — "Diagnose git state: tag order (git describe), pyproject.toml version, what commit does HEAD point to?"

**Parallel spawning:**
```python
agents = [
    task(agent="explore", prompt=build_workflow_analysis_prompt, description="github actions build flow"),
    task(agent="general", prompt=pypi_policy_research_prompt, description="pypi upload policy"),
    task(agent="explore", prompt=git_version_diagnosis_prompt, description="git tag versioning"),
]
results = [agent.result() for agent in agents]
```

**Synthesis:**
- Agent 1: `github.event.release.tag_name` is null on push trigger → checkout uses wrong ref
- Agent 2: PyPI rejects re-upload permanently; skip-existing only masks symptom
- Agent 3: `git describe` returns v0.0.1 (created after v0.2.0) → version auto-increments to 0.0.2 but pyproject.toml still says 0.2.0
- **Consensus:** pyproject.toml not updated before build; build always produces 0.2.0 artifact
- **Confidence:** HIGH (all 3 agents confirm independent paths to same root)

**Next steps:** 1) Write version to pyproject.toml before build; 2) Change checkout to github.sha; 3) Add skip-existing as safety net

## Synthesis Pattern

When merging findings:

1. **List all evidence** from each agent
2. **Identify consensus** — where multiple agents agree on a root cause
3. **Identify conflicts** — where agents disagree; resolve by evidence quality
4. **Rank hypotheses** by:
   - Number of independent agents confirming it
   - Quality of evidence (direct logs > inference > guess)
   - Blast radius if wrong (lower is better)
5. **Flag unknowns** — what no agent could determine; what needs follow-up testing
6. **Assign confidence**:
   - **High** — multiple agents confirm, direct evidence in logs
   - **Medium** — one agent confirms, others neutral or inconclusive
   - **Low** — competing hypotheses, no direct evidence, needs testing

## Chain of Thought for Synthesis

```
OBSERVE:  [What does each agent report? List all findings.]
CONSENSUS: [Where do multiple agents agree?]
CONFLICT: [Where do agents disagree?]
RANK:     [Hypothesis A: evidence from agents X,Y; confidence HIGH]
          [Hypothesis B: evidence from agent Z only; confidence MEDIUM]
UNKNOWN: [What couldn't be determined? What needs live testing?]
ACT:     [Fix hypothesis A first — minimal change, highest confidence]
```

## Anti-Patterns

- **Sequential spawning** — launching agents one after another defeats the purpose; always parallel
- **Overloaded agents** — one agent trying to cover multiple angles loses focus; split it
- **Premature synthesis** — drawing conclusions before all agents report; wait for all
- **No ranking** — just concatenating agent outputs instead of merging with confidence
- **Missing unknowns** — not flagging what couldn't be determined; leads to false confidence

## References

- [LangGraph Supervisor Pattern](https://github.com/langchain-ai/langgraph-supervisor-py) — hierarchical multi-agent orchestration with LLM-based handoff decisions
- [LangGraph Parallel Tasks](https://docs.langchain.com/oss/python/langgraph/use-functional-api) — `@task` decorator for parallel agent execution with `futures.result()` synchronization
- [LangGraph Graph API Parallelization](https://docs.langchain.com/oss/python/langgraph/choosing-apis) — fan-out/fan-in patterns via START and END nodes
- [Karpathy Autoresearch Loop](https://github.com/karpathy/autoresearch) — experiment→measure→keep/revert improvement methodology

## Companion Files

- `refs/` — multi-agent orchestration reference materials
- `examples/` — concrete investigation examples with parallel spawning patterns (TODO)
