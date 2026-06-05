---
name: tech-lead
description: "Trigger: tech lead, plan técnico, tareas técnicas, ejecución, orquestación técnica. Traduce requerimientos de negocio a tareas técnicas detalladas, orquesta su ejecución paralela/secuencial y gestiona el estado del plan."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "2.0"
---

## Activation Contract

Load this skill when requirements decomposition, project tasks breakdown, technology version resolution, dependency mappings, or architectural orchestration plans are requested. Triggers: `tech lead`, `plan técnico`, `tareas técnicas`, `ejecución`, `orquestación técnica`.

## Hard Rules

- **Strict Dependency Mapping:** All technical tasks must explicitly map to business requirements (PRD features) and list blocking/informational dependencies. No cycles allowed.
- **CVE Checking:** Scan and verify that all recommended package and technology versions are free of Critical or High vulnerabilities.
- **Autonomy Control:** Pause and request approval of technical plans at level gates unless autonomy level is explicitly set to `high`.

## Decision Gates

| Operation Mode | Action | Reference Contract |
|---|---|---|
| Concurrent Multi-Agent Execution | Coordinate agents peer-to-peer via board | `references/agent-contract.md` |
| Orchestrated Run | Direct sequencing handled by TechLead | Inlined sequential groups |
| Vulnerability lookup / version scan | Resolve package CVE metadata | `references/cve-databases.md` |

## Execution Steps

```sudolang
TechLead {
  Config {
    lang = detect_from_input |> default "es"
    outputDir = ".ia/tech-lead/"
    inputSources = [".ia/", any_business_doc, natural_language_description]
    skillsRegistry = scan(".agents/skills/") + scan("~/.gemini/config/skills/")
    approvalMode = three_level(epics_plan, tasks_high_level, subtasks_technical)
    executionMode = hybrid(plan_always, execute_on_explicit_user_approval)
    executionArchitecture = ask_user_before_run |> default "orchestrator"
  }

  OnActivate {
    mem_search("tech-lead/{project}/state")
    found => present_summary => ask: continue | update | start_fresh
    not_found => begin SourceDiscovery
  }

  SourceDiscovery {
    scan(inputSources) => find([PRDs, backlogs, ADRs, API_specs, diagrams])
    persist: mem_save(sources, topic: "tech-lead/{project}/sources", type: "architecture")
  }

  GapResolution {
    // Escalate missing information to product-owner or user
  }

  StackAnalysis {
    // Analyzes stack and calls CVE checks in references/cve-databases.md
    persist: mem_save(stack, topic: "tech-lead/{project}/stack", type: "architecture")
  }

  SkillDiscovery {
    scan(skillsRegistry) => match_skills_to_task_types
    persist: mem_save(skill_index, topic: "tech-lead/{project}/skills", type: "architecture")
  }

  Pipeline = [EpicsPlan, TasksHighLevel, SubtasksTechnical] |> sequential {
    // 1. Decompose business goals to Epics map
    // 2. Break down Epics into high level stories (INVEST, traceability)
    // 3. Decompose stories into technical tasks assigned to developer roles
  }

  ExecutionEngine {
    when architecture == "orchestrator" => RunOrchestrator
    when architecture == "multi-agent" => RunMultiAgentCoordinator (see references/agent-contract.md)
  }
}
```

1. **Context Analysis & Gap Detection**: Evaluate input specifications, verifying completeness.
2. **Security & Tech Resolution**: Infer stacks and resolve non-vulnerable versions.
3. **Task & Pipeline Planning**: Map dependencies, building a DAG roadmap for sprints.
4. **Handoff / Multi-Agent Launch**: Deploy subagents, tracking execution progress in real-time.

## Output Contract

Return:
- A dependency DAG visualized in Mermaid.
- A technical backlog summary (sprints, tasks, effort, roles).
- Path locations of generated task files inside `.ia/tech-lead/`.

## References

- [agent-contract.md](references/agent-contract.md) — Autonomous peer-to-peer coordinator protocol and shared board interface.
- [cve-databases.md](references/cve-databases.md) — Vulnerability lookup sources and safe-version matching protocols.
