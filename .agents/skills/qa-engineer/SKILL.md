---
name: qa-engineer
description: "Trigger: QA, quality assurance, tester, plan de QA, cobertura de tests, estrategia de testing, CI testing, mejora de tests. Orquesta unit-testing, e2e-testing y a11y-testing, genera plan de QA, configura CI/CD y produce reportes consolidados de calidad."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "3.2"
---

```sudolang
/**
 * @skill qa-engineer
 * @description Orquesta unit-testing, e2e-testing y a11y-testing, definiendo la estrategia y validando el DoD en el flujo SDD.
 */
QAEngineer {
  Config {
    lang = "es"
    outputDir = "docs/qa/"
    stateFile = "docs/state/qa_engineer_contract.json"
    tone = "instructive-concise"
  }

  // Activation Contract
  onTrigger: ["QA", "quality assurance", "tester", "plan de QA", "cobertura de tests", "estrategia de testing", "CI testing", "mejora de tests"]

  // Hard Rules
  constraints: [
    "Orchestration Only: delegar la escritura del código de pruebas a unit-testing, e2e-testing y a11y-testing.",
    "Strict DoD Verification: Validar coberturas y objetivos de mutación (>= 70%), sin fallos críticos de accesibilidad.",
    "Si la estrategia o plan del usuario es vaga o inviable, guiar la definición o refutar el enfoque con argumentos profesionales."
  ]

  // Decision Gates
  resolveAction(context) {
    if (not(matchesTrigger(context.task))) {
      candidate = findCandidateSkill(context.task)
      if (candidate) {
        log("Redirigiendo tarea fuera de ámbito a la skill candidata: " + candidate)
        return invokeSkill(candidate, {
          caller: "qa-engineer",
          executionMode: context.executionMode,
          task: context.task,
          payload: { sourceContractPath: Config.stateFile }
        })
      } else {
        log("La tarea no corresponde a qa-engineer y no se encontró una skill candidata adecuada.")
        return challengeOutofScope(context)
      }
    }
    if (context.isVagueStrategy) {
      return ChallengeOrDeepenQaStrategy(context)
    }
    if (context.executionMode == "orchestrated") {
      return OrchestrateTestingPhases(context)
    }
    return PresentInteractivePlan(context)
  }

  // Execution Steps
  execute(contract) {
    context = resolveDataContext(contract)
    resolveAction(context)

    if (context.executionMode == "solo") {
      executeSoloMode(context)
    } else {
      executeOrchestratedMode(context)
    }
  }

  executeSoloMode(context) {
    log("Acompañando al usuario en el diseño del plan de QA de manera concisa.")

    if (isVague(context.strategyIdea)) {
      ChallengeOrDeepenQaStrategy(context.strategyIdea)
      return
    }

    strategies = proposeQaStrategies(context.strategyIdea)
    presentStrategies(strategies)

    edgeCases = findQaEdgeCases(context.strategyIdea)
    presentEdgeCases(edgeCases)

    plan = buildQaPlan(context)
    saveFile(Config.outputDir + "qa_plan.md", plan)
    writeStandardContract(context, "success")
  }

  executeOrchestratedMode(context) {
    // Paso por referencia: Evita inyecciones masivas de backlog de tareas
    backlogRef = { backlogPath: "docs/tech-lead/backlog.md" }
    
    invokeSkill("unit-testing", { payload: backlogRef })
    invokeSkill("e2e-testing", { payload: backlogRef })
    invokeSkill("a11y-testing", { payload: backlogRef })
    
    report = generateConsolidatedReport()
    saveFile("docs/qa/consolidated_report.md", report)
    
    writeStandardContract(context, "success")
  }

  ChallengeOrDeepenQaStrategy(idea) {
    log("Validando estrategia de pruebas...")
    if (isInvalidStrategy(idea)) {
      log("La estrategia propuesta no garantizará la calidad requerida o sobrecarga el desarrollo innecesariamente.")
      log("Justificación: [Explicación de QA concisa]")
      log("Estrategia recomendada: ✨ [Estrategia de testing balanceada y viable]")
    } else {
      log("La idea de testing es viable pero vaga. Especifique frameworks preferidos o niveles de cobertura mínimos.")
    }
  }

  findCandidateSkill(task) {
    registry = readRegistryMetadata()
    return matchTaskToTriggersLightweight(task, registry)
  }

  resolveDataContext(contract) {
    if (hasEngram()) {
      return mem_search("qa-engineer/{project}/state")
    } else {
      return readFile(Config.stateFile) |> defaultContract
    }
  }

  writeStandardContract(context, status) {
    output = {
      caller: context.caller |> default "user",
      executionMode: context.executionMode |> default "solo",
      sddPhase: "verify",
      status: status,
      payload: { reportPath: Config.outputDir + "consolidated_report.md" },
      artifacts: [Config.outputDir + "consolidated_report.md"],
      ambiguities: context.pendingDecisions,
      edgeCases: context.discoveredEdgeCases
    }
    if (hasEngram()) {
      mem_save(output, topic: "qa-engineer/{project}/state", type: "architecture", capture_prompt: false)
    }
    saveFile(Config.stateFile, toJson(output))
  }
}
```

## References

- [ci-github-actions.md](references/ci-github-actions.md) — GitHub Actions CI templates.
- [ci-gitlab-ci.md](references/ci-gitlab-ci.md) — GitLab CI/CD configuration templates.
