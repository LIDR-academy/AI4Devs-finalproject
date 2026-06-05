---
name: a11y-testing
description: "Trigger: accesibilidad, a11y, WCAG, accessibility testing, contraste, ARIA, teclado, lector de pantalla, auditoría accesibilidad. Genera tests de accesibilidad WCAG 2.1/2.2, audita violaciones, propone fixes y produce reportes priorizados."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "2.0"
---

## Activation Contract

Load this skill when accessibility testing, audits, WCAG criteria reviews, contrast issues, screen reader capabilities, keyboard navigation, or accessibility triggers (`accesibilidad`, `a11y`, `WCAG`, `accessibility testing`, `contraste`, `ARIA`, `teclado`, `lector de pantalla`, `auditoría accesibilidad`) are requested for any page or UI component.

## Hard Rules

- **WCAG Standards:** Support both automated audits (Axe-Core) and manual reviews using standard checklists.
- **Strict Release Gate:** Fail builds/releases if critical or serious violations are detected.
- **Accessibility Test Generation:** Generate automated test code inline in existing E2E suites or as standalone component tests based on configuration.
- **Reference Resolution:** Load domain rules and checklists dynamically from local references.

## Decision Gates

| Scope / Scenario | Action | Reference File |
|---|---|---|
| Manual accessibility check / non-automatable criteria | Load Manual WCAG Checklist | `references/wcag-criteria.md` |
| Automated UI element / CSS selector assertion | Apply Axe-Core Rules & Targets | `references/axe-assertions.md` |
| Standalone page audit | Run Pa11y / Axe-CLI | `references/axe-assertions.md` |
| Integrated E2E testing (Playwright/Cypress) | Generate axe integrations / patches | `references/axe-assertions.md` |

## Execution Steps

```sudolang
A11yTesting {
  Config {
    lang = detect_from_input |> default "es"
    inputSources = ["docs/", caller_context, natural_language_description]
    standards = [WCAG_2_1_AA, WCAG_2_1_AAA, WCAG_2_2_AA]
    toolInfo = caller_provided | infer_from_stack | ask_user
    reportLevel = caller_provided |> default "violations+warnings"
    integrationMode = integrated_with_e2e | standalone
  }

  OnActivate {
    mem_search("a11y-testing/{project}/state")
    found => present_summary => ask: continue | update | start_fresh
    not_found => begin ContextDiscovery
  }

  ContextDiscovery {
    when caller_provides(context) => {
      extract(stack, framework, scope, target_pages | target_components | flow_ref)
      => ToolResolution
    }
    when not_provided => scan(inputSources) => find([
      tech_stack_docs, package_json, playwright_config, cypress_config,
      PRDs, user_stories, component_inventory
    ])
    found => infer(stack, e2e_framework_if_any, ui_type)
    not_found => ask_user(message: "Provide tech stack & audit scope info")
    persist: mem_save(context, topic: "a11y-testing/{project}/context", type: "architecture")
  }

  ToolResolution {
    // Resolved from references/axe-assertions.md configs
    resolve_tool()
    persist: mem_save(tool_config, topic: "a11y-testing/{project}/tool", type: "config")
  }

  AuditCycle {
    // 1. Define audit scope (full_page | component | user_flow)
    // 2. Generate configuration from references/axe-assertions.md
    // 3. Generate test assertions (standalone or integrated E2E patches)
    // 4. Generate manual checklist from references/wcag-criteria.md
  }

  ViolationAnalysis {
    // Parse test output -> Classify severity -> Generate specific fix suggestions
    // Blocks release if critical/serious count > 0
    persist: mem_save(violations, topic: "a11y-testing/{project}/violations", type: "architecture", capture_prompt: false)
  }

  CollectResults {
    instruct_run => parse_results => ViolationAnalysis
  }
}
```

1. **Context Discovery**: Scan files to detect UI technology and E2E frameworks.
2. **Tool Selection**: Determine whether to use `@axe-core/playwright`, `cypress-axe`, `jest-axe`, or `pa11y`.
3. **Execution & Test Generation**: Write appropriate test code, applying assertions and exporting manual validation checklists.
4. **Analysis & Mitigation**: Parse audit logs, format issues by severity, block release on failure, and suggest fixes.

## Output Contract

Return a markdown report containing:
- Target name and description of evaluated elements.
- Verdict Table (violations by severity, automated/manual).
- Remediations list with suggested CSS/HTML fixes.
- Release status: `APPROVED ✅` or `ESCALATED ⚠️` (if critical/serious violations exist).

## References

- [wcag-criteria.md](references/wcag-criteria.md) — Manual accessibility criteria checklists.
- [axe-assertions.md](references/axe-assertions.md) — Axe-Core rules, selectors, and config integration guides.
