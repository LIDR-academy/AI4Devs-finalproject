---
name: unit-testing
description: "Trigger: unit testing, tests unitarios, TDD, test generation, cobertura, gap analysis, mocks, stubs, fixtures, mutation testing, tests de mutación. Genera tests unitarios en modo TDD por defecto, analiza gaps de cobertura, ejecuta el ciclo Red-Green-Refactor y evalúa la robustez mediante pruebas de mutación."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "2.1"
---

## Activation Contract

Load this skill when unit testing, code coverage checks, TDD implementation cycles, mock data generations, testing gaps audits, or mutation testing evaluations are requested. Triggers: `unit testing`, `tests unitarios`, `TDD`, `test generation`, `cobertura`, `gap analysis`, `mocks`, `stubs`, `fixtures`, `mutation testing`, `tests de mutación`, `stryker`, `mutmut`, `go-mutesting`.

## Hard Rules

- **TDD Cycle (Red-Green-Refactor):** The default execution path requires writing the test structure and confirming it fails (RED) before implementing the minimal code needed to pass (GREEN).
- **Isolation:** Unit tests must execute in isolation. External service dependencies must be mocked or stubbed.
- **Coverage Goal:** Strive for at least 80% coverage on new code or modified modules.
- **Mutation Testing (Mutation Score >= 70%):** Proactively run mutation tests on new or modified logic. Any survived mutants must be evaluated and eliminated by adding missing assertions or edge-case test cases.

## Decision Gates

| Cycle Mode / Scope | Action | Reference File |
|---|---|---|
| Test-Driven Development (TDD) | Run sequential Red-Green-Refactor loop | `references/tdd-cycle.md` |
| Mocking & fixtures setup | Resolve data stubs / mocking policies | `references/mocking-rules.md` |
| Mutation Testing | Validate test suite strength using Stryker/Mutmut/Go-mutesting | `references/mutation-testing.md` |

## Execution Steps

```sudolang
UnitTesting {
  Config {
    lang = detect_from_input |> default "es"
    outputDir = ".ia/unit-testing/"
    inputSources = [".ia/", caller_context, natural_language_description]
    mode = tdd | on_demand
    stackInfo = caller_provided | infer_from(".ia/") | ask_user
  }

  OnActivate {
    mem_search("unit-testing/{project}/state")
    found => present_summary => ask: continue | update | start_fresh
    not_found => begin StackDiscovery
  }

  StackDiscovery {
    // Detect TS/JS, Python, Java, Go stack
    // Map to framework: vitest | jest | pytest | junit5 | testing stdlib
    persist: mem_save(stack, topic: "unit-testing/{project}/stack", type: "architecture")
  }

  GapAnalysis {
    // Analyze modules and find functions lacking coverage
    persist: mem_save(gap_report, topic: "unit-testing/{project}/gaps", type: "architecture")
  }

  TestingExecution {
    when mode == tdd => RunTDDCycle (delegated to references/tdd-cycle.md)
    when mode == on_demand => RunOnDemandCycle
  }

  MutationTesting {
    // Inject mutants to verify that tests fail when logic changes
    // Refer to references/mutation-testing.md for runner setup and execution
    persist: mem_save(mutation_report, topic: "unit-testing/{project}/mutation", type: "architecture", capture_prompt: false)
  }

  CollectResults {
    instruct_run => parse_coverage_file => summarize
    persist: mem_save(results, topic: "unit-testing/{project}/results", type: "architecture", capture_prompt: false)
  }
}
```

1. **Stack Identification**: Parse project files to locate configuration managers.
2. **Cycle Initiation**: Determine TDD vs. On-Demand testing targets.
3. **Mocks generation**: Generate mocks for external networks or database callers.
4. **Execution & Coverage**: Execute tests and compile coverage statistics.
5. **Mutation Analysis**: Execute mutation testing runner and verify mutation score >= 70%.

## Output Contract

Return:
- Paths to generated unit test files.
- Command line instruction to execute test coverage and mutation testing reports.
- Summary detailing coverage percentages, mutation score (mutants killed vs. survived), and pass/fail counts.

## References

- [tdd-cycle.md](references/tdd-cycle.md) — Red-Green-Refactor loop and step verification guide.
- [mocking-rules.md](references/mocking-rules.md) — Mocking standards, stubs setup, and test data fixtures.
- [mutation-testing.md](references/mutation-testing.md) — Setup, execution and interpretation guide for mutation testing.
