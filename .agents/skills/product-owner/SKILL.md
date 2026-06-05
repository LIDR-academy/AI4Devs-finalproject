---
name: product-owner
description: "Trigger: product owner, requisitos, documentación de negocio, backlog preliminar. Coordina la fase de entrevista de negocio y delega la creación del PRD y backlog técnico en sus respectivas skills."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "2.0"
---

## Activation Contract

Load this skill when initiating business interviews, gathering user requirements, defining visions, or planning preliminary documentation pipelines. Triggers: `product owner`, `requisitos`, `documentación de negocio`, `backlog preliminar`.

## Hard Rules

- **Strict Separation of Concerns:** Product Owner coordinates interviews and structures preliminary visions, delegating the generation of the PRD to `prd-generator` and task breakdowns to `backlog-generator`.
- **User Verification:** Require explicit sign-offs on the compiled product brief before spawning generator sub-phases.

## Decision Gates

| Pipeline Level | Action |
|---|---|
| Interview in progress | Iterate through dynamic question blocks using the ask_question tool |
| Interview complete | Compile brief and invoke `prd-generator` |
| PRD approved | Invoke `backlog-generator` to detail epics and tasks |

## Execution Steps

```sudolang
ProductOwner {
  Config {
    lang = "es"
    outputDir = ask_user |> default "docs/"
    knowledgeDir = ask_user |> default "knowledge/"
    diagrams = mermaid
    approval = detailed_per_section
  }

  OnActivate {
    mem_search("po/{project}/state")
    found => present_summary => ask: continue | start_fresh
    not_found => ask_config_preferences => begin Interview
  }

  Interview {
    strategy = dynamic(ask_question tool, multi-question blocks)
    Phase1_core: [visión, problema, usuarios, valor, negocio, competidores, restricciones]
    Phase2_deepen: on(unclear | complex_domain) => follow_up_contextually
    complete: when context.sufficient_for_PRD_generation
    persist: mem_save(context, topic: "po/{project}/context", type: "architecture")
  }

  Pipeline {
    brief = compile(interview_context)
    save_file("docs/prd/brief.md", brief)
    invoke_skill("prd-generator", input: brief, outputDir: "docs/prd/")
    invoke_skill("backlog-generator", inputDir: "docs/", outputDir: "docs/backlog/")
  }
}
```

1. **Questioning Interview**: Conduct a structured requirements interview.
2. **Brief Assembly**: Consolidate responses into a coherent vision statement.
3. **PRD Handoff**: Spawns `prd-generator` and validates output.
4. **Backlog Breakdown**: Triggers `backlog-generator` to compile developer tasks.

## Output Contract

Return:
- A compiled product brief saved to `docs/prd/brief.md`.
- Active pipeline status reporting on PRD and Backlog creation progress.

## References

- `.agents/skills/prd-generator/SKILL.md` — Subordinating PRD compiler.
- `.agents/skills/backlog-generator/SKILL.md` — Subordinating Backlog breakdown manager.
