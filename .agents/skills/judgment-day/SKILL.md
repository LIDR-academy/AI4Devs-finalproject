---
name: judgment-day
description: "Trigger: judgment day, dual review, adversarial review, juzgar, confrontar. Validate and challenge results across the software development lifecycle."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "2.0"
---

## Activation Contract

Load this skill when adversarial review, dual validation, or the trigger words (`juzgar`, `confrontar`, `judgment day`) are requested for any artifact (code, PR, PRD, backlog, diagram, tests).

## Hard Rules

- Default execution is **blind dual review** in parallel (Judge A and Judge B) using two separate agent instances.
- If the user or calling process specifies a target model (e.g. `opus`, `sonnet`, `haiku`) or delegation method, use that instead of the default.
- Dynamically load the relevant criteria from [References](#references) based on the target type being reviewed.
- Synthesize verdicts into a unified table: `Confirmed`, `Suspect`, `Contradiction`, and `INFO`.
- A warning is `WARNING (real)` only if it is triggerable in normal use; otherwise, downgrade to `WARNING (theoretical)`.

## Decision Gates

| Phase / Condition | Method | Criteria File |
|---|---|---|
| Business/PRD/Backlog | Blind Dual Review | `criteria-requirements.sudolang` |
| Architecture & Diagrams | Blind Dual Review | `criteria-architecture.sudolang` |
| Source Code & Implementation | Blind Dual Review (Sonnet/Opus) | `criteria-security.sudolang` & `criteria-performance.sudolang` |
| Testing & QA | Blind Dual Review | `criteria-testing.sudolang` |
| Override Specified | Custom Method / Model | Load requested override |

## Execution Steps

```sudolang
JudgmentDayOrchestrator {
  state {
    targetArtifact
    selectedCriteria: []
    verdict
  }

  function run(target, options) {
    targetArtifact = target
    
    // Resolve criteria files to load
    selectedCriteria = determineCriteria(target)
    loadCriteriaModules(selectedCriteria)

    // Check for model or method override
    model = options.model ?: selectDefaultModel(target)
    method = options.method ?: "BlindDualReview"

    log("Juicio iniciado para: " + target)
    
    if (method == "BlindDualReview") {
      verdict = executeBlindDualReview(targetArtifact, model)
    } else {
      verdict = executeCustomReview(targetArtifact, method, model)
    }

    return presentReport(verdict)
  }

  function executeBlindDualReview(target, model) {
    // Run two judges concurrently
    judgeA = spawnJudge("A", model, selectedCriteria)
    judgeB = spawnJudge("B", model, selectedCriteria)
    
    verdictA = judgeA.evaluate(target)
    verdictB = judgeB.evaluate(target)
    
    return synthesizeverdicts(verdictA, verdictB)
  }
}
```

1. Determine the target type (requirements, diagrams, code, tests) and select the corresponding criteria files.
2. Spawn Judge A and Judge B in parallel (unless overridden).
3. Consolidate results: issues flagged by both are `Confirmed`; flagged by one are `Suspect`.
4. Return the consolidated evaluation report.

## Output Contract

Return a markdown report titled `## Judgment Day — [Target]` including:
- Target name and description of the evaluated phase.
- Active criteria files loaded.
- Verdict Table (Judge A vs Judge B) with severity.
- Final Status: `APPROVED ✅` or `ESCALATED ⚠️`.

## References

- [criteria-requirements.sudolang](references/criteria-requirements.sudolang)
- [criteria-architecture.sudolang](references/criteria-architecture.sudolang)
- [criteria-security.sudolang](references/criteria-security.sudolang)
- [criteria-performance.sudolang](references/criteria-performance.sudolang)
- [criteria-testing.sudolang](references/criteria-testing.sudolang)
