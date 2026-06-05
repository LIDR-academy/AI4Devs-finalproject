---
name: backend-architect
description: "Trigger: backend architect, implementar backend, arquitectura backend, backend implementation. Diseña e implementa historias técnicas de backend y bases de datos, gestiona su ciclo de vida y coordina con testing y frontend."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "2.0"
---

## Activation Contract

Load this skill when designing or implementing backend business logic, database tables, migrations, ORM schemas, REST APIs, or handling integrations. Triggers: `backend architect`, `implementar backend`, `arquitectura backend`, `backend implementation`.

## Hard Rules

- **Autonomy Gates:** Pause and request approval of file-writing and database schema change plans at the specified checkpoints unless `autonomyLevel` is set to `high`.
- **Database Non-Regression:** Validate database change impacts, ensuring rollback migrations exist where applicable.
- **TDD Integration:** Mandatory delegation to `unit-testing` using TDD mode for all newly created layers/components.

## Decision Gates

| Phase / Condition | Target Mode |
|---|---|
| Database schema modification / migration | Apply migration plan and request confirmation |
| Granular Autonomy Level | Ask validation after writing each file/component |
| Story Autonomy Level | Ask validation on the files plan, then implement batch |

## Execution Steps

```sudolang
BackendArchitect {
  Config {
    lang = detect_from_input |> default "es"
    outputDir = ".ia/backend-architect/"
    skillsRegistry = scan(".agents/skills/") + scan("~/.gemini/config/skills/")
    defaultStack {
      language = "JavaScript"
      runtime = "Node.js"
      framework = "Express"
      database = "PostgreSQL"
      orm = "Prisma"
    }
  }

  OnActivate {
    mem_search("backend-architect/{project}/state")
    found => present_dashboard(state) => ask: continue_from_next | update_state | start_fresh
    not_found => begin ContextDiscovery
  }

  ContextDiscovery {
    // Scan project files (package.json, schema.prisma, env, src/)
    // Infer tech stack and directory pattern
    persist: mem_save(discovered_context, topic: "backend-architect/{project}/context", type: "config")
  }

  ImplementStory {
    // 1. Plan database migrations and code files
    // 2. Apply database schemas
    // 3. Write component code layers (domain, controllers, repositories)
    // 4. Delegate testing assertions to unit-testing skill
  }
}
```

1. **Context Discovery**: Auto-detect directory structures, ORMs, and packages.
2. **Backlog Synchronization**: Sync with the Tech Lead's board to identify assigned tasks.
3. **Execution Plan**: Create the migration and logic change lists, requesting approvals if required.
4. **Writing & Testing**: Generate components and trigger unit tests under TDD parameters.

## Output Contract

Return:
- List of written or modified file paths.
- Applied database schema migration scripts or log details.
- Status of unit tests executed against the written components.

## References

- `.agents/skills/tech-lead/SKILL.md` — Technical backlog tracker source.
- `.agents/skills/unit-testing/SKILL.md` — Mandatory subordinating testing executor.
