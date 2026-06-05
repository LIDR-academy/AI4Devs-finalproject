---
name: backlog-generator
description: "Trigger: backlog, user stories, epics, tasks, subtasks, story mapping, story breakdown. Generates a structured backlog (epics, stories, subtasks, DoD) from existing documentation with 3-level approval."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "2.0"
---

## Activation Contract

Load this skill when requirements breakdown, epic definitions, user stories mapping, acceptance criteria generation, or subtask decomposition are requested. Triggers: `backlog`, `user stories`, `epics`, `tasks`, `subtasks`, `story mapping`, `story breakdown`.

## Hard Rules

- **Traceability:** Maintain bidirectional links between requirements (PRD), epics, user stories, and technical subtasks.
- **INVEST Standards:** Enforce that all generated user stories comply with the INVEST framework.
- **Acceptance Criteria:** Every user story must contain at least 2 acceptance scenarios written in Given-When-Then format.
- **Approvals Gate:** Require explicit user sign-off at each pipeline stage (Epics -> Stories -> Subtasks).

## Decision Gates

| Pipeline Level | Action |
|---|---|
| Level 1: Epic Map | Present epics and dependency map, wait for OK |
| Level 2: Stories per Epic | Present stories and INVEST validation, wait for OK |
| Level 3: Subtasks per Story | Present tasks grouped by category, wait for OK |

## Execution Steps

```sudolang
BacklogGenerator {
  Config {
    lang = detect_from_user_input |> default "en"
    inputDir = "docs/"
    outputDir = ask_user |> default "docs/backlog/"
    diagrams = mermaid
    approval = three_level(epics_map, stories_per_epic, subtasks_per_story)
  }

  OnActivate {
    mem_search("backlog/{project}/state")
    found => present_summary => ask: continue | update | start_fresh
    not_found => begin SourceDiscovery
  }

  SourceDiscovery {
    scan(inputDir) => find([PRDs, diagrams, ADRs])
    persist: mem_save(sources, topic: "backlog/{project}/sources", type: "architecture")
  }

  StackDetection {
    analyze(sources) => infer(project_type, tech_stack, architecturePattern)
    persist: mem_save(stack, topic: "backlog/{project}/stack", type: "architecture")
  }

  Pipeline = [EpicsMap, StoriesPerEpic, SubtasksPerStory] |> sequential {
    // 1. Generate Epic Map with priorities and dependencies
    // 2. Generate User Stories matching template layouts
    // 3. Generate role-assigned subtasks matching technical DoD
  }
}
```

1. **Source Discovery & Stack Detection**: Parse documentation files and infer architecture details.
2. **Epics Mapping**: Layout epic categories, mapping dependencies.
3. **Stories & Subtasks Breakdown**: Detail stories, validating against INVEST, then assign subtask tickets.
4. **Summary & Export**: Build backlog indices and optionally format to CSV/JSON.

## Output Contract

Return:
- An executive backlog index listing total epics, stories, and task aggregates.
- Path coordinates to generated markdown task files inside `docs/backlog/`.

## References

- `docs/` — Document context sources (PRDs, wireframes, architectures).
