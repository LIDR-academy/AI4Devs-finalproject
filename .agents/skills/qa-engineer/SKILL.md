---
name: qa-engineer
description: "Trigger: QA, quality assurance, tester, plan de QA, cobertura de tests, estrategia de testing, CI testing, mejora de tests. Orquesta unit-testing, e2e-testing y a11y-testing, genera plan de QA, configura CI/CD y produce reportes consolidados de calidad."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "2.0"
---

## Activation Contract

Load this skill when a QA strategy, quality assurance checks, test plans, CI pipeline configuration, or test metrics analysis are requested. Triggers: `QA`, `quality assurance`, `tester`, `plan de QA`, `cobertura de tests`, `estrategia de testing`, `CI testing`, `mejora de tests`.

## Hard Rules

- **Orchestration Only:** This skill delegates actual code writing to subordinating skills (`unit-testing`, `e2e-testing`, `a11y-testing`).
- **Unified QA Plan:** Require a QA plan to be validated by the user or defined in `.ia/` before starting implementation.
- **Strict Dod Verification:** Enforce all criteria in the Definition of Done (coverage targets, no critical a11y violations, green critical paths).
- **Domain-Specific Templates:** Reference pipeline templates from modular domains.

## Decision Gates

| Pipeline Platform | Action | Template File |
|---|---|---|
| GitHub Actions | Load GitHub Actions workflow template | `references/ci-github-actions.md` |
| GitLab CI/CD | Load GitLab CI pipeline configuration template | `references/ci-gitlab-ci.md` |

## Execution Steps

```sudolang
QAEngineer {
  Config {
    lang = detect_from_input |> default "es"
    inputSources = [".ia/", caller_context, natural_language_description]
    skillsRegistry = scan(".agents/skills/") + scan("~/.gemini/config/skills/")
    ciPlatform = detect_from_project |> ask_user
  }

  OnActivate {
    mem_search("qa-engineer/{project}/state")
    found => present_pipeline_dashboard(state) => ask: continue | restart_phase | start_fresh
    not_found => begin ContextDiscovery
  }

  ContextDiscovery {
    // Detect stack, devDependencies, CI platform, and existing documentation
    // Injects context parameters to local memory
    persist: mem_save(context, topic: "qa-engineer/{project}/context", type: "architecture")
  }

  QAPlan {
    // Strategy targets: coverage percentages, critical user flows, target platforms
    // Persist plan after user confirmation
    persist: mem_save(qa_plan, topic: "qa-engineer/{project}/qa-plan", type: "architecture")
  }

  EnvSetup {
    // Generate package.json scripts, recommended dev dependencies
    // Delegates CI workflow generation to templates depending on ciPlatform
  }

  TestingPhases {
    // Sub-delegation logic:
    // 1. Invokes "unit-testing" with coverage targets
    // 2. Invokes "e2e-testing" with critical business scenarios
    // 3. Invokes "a11y-testing" with WCAG target compliance
  }

  ConsolidatedReport {
    // Merge results from sub-testing phases into a high-level executive summary
    // Fails gate if any sub-phase release gate is blocked
    persist: mem_save(report, topic: "qa-engineer/{project}/report", type: "architecture", capture_prompt: false)
  }
}
```

1. **Context & Skill Discovery**: Search for environment data and testing capabilities.
2. **QA Strategy Planning**: Create a scorecard representing the project's testing goals.
3. **Setup CI/CD Pipelines**: Write template configurations for target platforms.
4. **Execution & Report Consolidation**: Coordinate testing agents and build the final report.

## Output Contract

Return a unified quality scorecard including:
- Overall release status: `PASS` or `BLOCKED`.
- Table detailing test counts and coverage per category (Unit, E2E, A11y).
- Outstanding risks, critical failures, and immediate actions to unblock release.

## References

- [ci-github-actions.md](references/ci-github-actions.md) — GitHub Actions CI templates.
- [ci-gitlab-ci.md](references/ci-gitlab-ci.md) — GitLab CI/CD configuration templates.
