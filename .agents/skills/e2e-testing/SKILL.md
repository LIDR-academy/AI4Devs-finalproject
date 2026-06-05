---
name: e2e-testing
description: "Trigger: e2e, end-to-end, tests E2E, flujos de usuario, acceptance testing, Playwright, Cypress. Genera tests E2E completos desde flujos de negocio, analiza gaps de cobertura y gestiona configuración del framework."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "2.0"
---

## Activation Contract

Load this skill when user story flows, business acceptance criteria audits, end-to-end user tests, or integration configurations are requested. Triggers: `e2e`, `end-to-end`, `tests E2E`, `flujos de usuario`, `acceptance testing`, `Playwright`, `Cypress`.

## Hard Rules

- **Locator Priorities:** Always prefer semantic locators (`data-testid`, roles, ARIA labels) over brittle CSS classes or long XPath selectors.
- **Resilient Execution:** Never allow raw `sleep` / delay statements; tests must use dynamic wait structures (wait for network idle, locator assertions).
- **Atomic Flows:** Each test scenario must be independent, setting up its state and cleaning it up at teardown.

## Decision Gates

| Framework Detected | Action | Template File |
|---|---|---|
| Playwright | Generate Playwright TypeScript tests & fixtures | `references/playwright-scenarios.md` |
| Cypress | Generate Cypress JavaScript specs & commands | `references/cypress-scenarios.md` |

## Execution Steps

```sudolang
E2ETesting {
  Config {
    lang = detect_from_input |> default "es"
    inputSources = ["docs/", caller_context, natural_language_description]
    frameworkInfo = caller_provided | infer_from("docs/") | ask_user
    targetEnv = local | staging | ask_user
    mockSources = caller_provided | scan_project_for_mocks | ask_user
  }

  OnActivate {
    mem_search("e2e-testing/{project}/state")
    found => present_summary => ask: continue | update | start_fresh
    not_found => begin FrameworkDiscovery
  }

  FrameworkDiscovery {
    // Check local configuration files, package.json
    // Resolves runner commands and environment base URLs
    persist: mem_save(framework_config, topic: "e2e-testing/{project}/framework", type: "config")
  }

  MockDiscovery {
    // Locate local __mocks__, fixtures, or generate synthetic test data if missing
    persist: mem_save(mock_index, topic: "e2e-testing/{project}/mocks", type: "architecture")
  }

  FlowDiscovery {
    // Extract scenarios from PRDs, backlogs, user stories
    persist: mem_save(user_flows, topic: "e2e-testing/{project}/flows", type: "architecture")
  }

  GapAnalysis {
    // Cross-reference existing E2E tests against known user flows
    persist: mem_save(gap_report, topic: "e2e-testing/{project}/gaps", type: "architecture")
  }

  ScenarioFirstCycle {
    // 1. Define test cases in Given-When-Then format
    // 2. Generate code tests by delegating structure to playwright or cypress references
  }

  CollectResults {
    instruct_run => parse_terminal_output => diagnose_failures => summarize
  }
}
```

1. **Discovery & Setup**: Identify frameworks, target URLs, and mock directories.
2. **Analysis**: Generate gap analysis of untested critical paths.
3. **Execution**: Define natural-language test scenarios and write executable code specs.
4. **Diagnosis**: Run target test runner, collect results, and suggest fixes on failure.

## Output Contract

Return:
- List of created or patched E2E test files.
- Command line instruction to execute tests.
- Consolidated run results (Scenarios parsed, status, failures).

## References

- [playwright-scenarios.md](references/playwright-scenarios.md) — Playwright test generation patterns and page objects.
- [cypress-scenarios.md](references/cypress-scenarios.md) — Cypress spec structures and custom commands.
