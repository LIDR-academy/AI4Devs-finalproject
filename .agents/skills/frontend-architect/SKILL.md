---
name: frontend-architect
description: "Trigger: frontend architect, implementar frontend, arquitectura frontend, UI implementation. Diseña e implementa historias técnicas de frontend, gestiona su ciclo de vida y coordina con testing y backend skills."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "2.0"
---

## Activation Contract

Load this skill when building or implementing frontend UI modules, state managers, component trees (Atomic Design / Feature-Sliced Design), form schemas, or routing hooks. Triggers: `frontend architect`, `implementar frontend`, `arquitectura frontend`, `UI implementation`.

## Hard Rules

- **Autonomy Gates:** Pause and request approval of component file-writing plans at the specified checkpoints unless `autonomyLevel` is set to `high`.
- **API Coordination:** Cross-reference active endpoints and contracts with backend architectures; write stub mocks where APIs are not yet ready.
- **TDD Integration:** Mandatory delegation to `unit-testing` using TDD mode for all newly created component specs.

## Decision Gates

| Phase / Condition | Target Mode |
|---|---|
| API endpoint not ready | Generate local stubs / mocks |
| Granular Autonomy Level | Ask validation after writing each component |
| Story Autonomy Level | Ask validation on the files plan, then implement batch |

## Execution Steps

```sudolang
FrontendArchitect {
  Config {
    lang = detect_from_input |> default "es"
    outputDir = "docs/frontend-architect/"
    skillsRegistry = scan(".agents/skills/") + scan("~/.gemini/config/skills/")
    defaultStack {
      framework = "React"
      builder = "Vite"
      language = "TypeScript"
      css = "Tailwind"
      stateManagement = "Zustand"
    }
  }

  OnActivate {
    mem_search("frontend-architect/{project}/state")
    found => present_dashboard(state) => ask: continue_from_next | update_state | start_fresh
    not_found => begin ContextDiscovery
  }

  ContextDiscovery {
    // Scan project files (package.json, tailwind.config, tsconfig, src/)
    // Infer tech stack, bundlers, and CSS frameworks
    persist: mem_save(discovered_context, topic: "frontend-architect/{project}/context", type: "config")
  }

  ImplementStory {
    // 1. Plan components structure (pages, organisms, atoms)
    // 2. Fetch or mock API contracts
    // 3. Write UI files and JSDoc/TSDoc documentations
    // 4. Delegate component testing to unit-testing skill
    // 5. Generate Storybook stories under request options
  }
}
```

1. **Context Discovery**: Auto-detect frontend bundlers, CSS modules, and package managers.
2. **Backlog Synchronization**: Sync with the Tech Lead's board to identify assigned UI tasks.
3. **Execution Plan**: Create the component tree and modification list, requesting approvals if required.
4. **Writing & Testing**: Generate components and trigger unit tests under TDD parameters.

## Output Contract

Return:
- List of written or modified file paths.
- Path to generated Storybook story specs (if requested).
- Status of unit tests executed against the written components.

## References

- `.agents/skills/tech-lead/SKILL.md` — Technical backlog tracker source.
- `.agents/skills/unit-testing/SKILL.md` — Mandatory subordinating testing executor.
