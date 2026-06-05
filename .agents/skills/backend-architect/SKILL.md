---
name: backend-architect
description: "Trigger: backend architect, implementar backend, arquitectura backend, backend implementation. Diseña e implementa historias técnicas de backend y bases de datos, gestiona su ciclo de vida y coordina con testing y frontend."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "3.1"
---

```sudolang
/**
 * @skill backend-architect
 * @description Diseña e implementa componentes y lógica de backend bajo TDD en la fase apply de SDD.
 */
BackendArchitect {
  Config {
    lang = "es"
    outputDir = "docs/backend-architect/"
    stateFile = "docs/state/backend_architect_contract.json"
    tone = "instructive-concise"
  }

  // Activation Contract
  onTrigger: ["backend architect", "implementar backend", "arquitectura backend", "backend implementation"]

  // Hard Rules
  constraints: [
    "Database Non-Regression: Validar impactos de base de datos proactivamente.",
    "TDD Integration: Delegación obligatoria a unit-testing en modo TDD para nuevos componentes.",
    "Si la dirección de backend o stack sugerido es vaga o ineficiente, profundizar o justificar alternativas adecuadas."
  ]

  // Decision Gates
  resolveAction(context) {
    if (not(matchesTrigger(context.task))) {
      candidate = findCandidateSkill(context.task)
      if (candidate) {
        log("Redirigiendo tarea fuera de ámbito a la skill candidata: " + candidate)
        return invokeSkill(candidate, context)
      } else {
        log("La tarea no corresponde a backend-architect y no se encontró una skill candidata adecuada.")
        return challengeOutofScope(context)
      }
    }
    if (context.isVagueRequirement) {
      return ChallengeOrDeepenRequirements(context)
    }
    if (context.executionMode == "orchestrated") {
      return ExecuteBackendImplementation(context)
    }
    return PresentInteractiveDesign(context)
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
    log("Acompañando al usuario en el diseño y codificación del backend de manera concisa.")

    if (isVague(context.backendSpec)) {
      ChallengeOrDeepenRequirements(context.backendSpec)
      return
    }

    patterns = proposeDesignPatterns(context.backendSpec)
    presentPatterns(patterns)

    edgeCases = findBackendEdgeCases(context.backendSpec)
    presentEdgeCases(edgeCases)

    architecture = designBackendArchitecture(context)
    saveFile(Config.outputDir + "architecture.md", architecture)
    writeStandardContract(context, "success")
  }

  executeOrchestratedMode(context) {
    task = readSddArtifact("docs/tech-lead/backlog.md")
    
    generatedFiles = writeBackendComponents(task)
    
    invokeSkill("unit-testing", { payload: generatedFiles })
    
    writeStandardContract(context, "success")
  }

  ChallengeOrDeepenRequirements(idea) {
    log("Validando requerimientos de backend...")
    if (isInefficientOrFlawed(idea)) {
      log("La propuesta de backend presenta problemas críticos de rendimiento o diseño de API.")
      log("Justificación: [Explicación técnica concisa]")
      log("Alternativa propuesta: ✨ [Estructura de backend o patrón recomendado]")
    } else {
      log("La especificación de backend es viable pero vaga. Indique contratos de API o modelos de datos requeridos.")
    }
  }

  findCandidateSkill(task) {
    registry = readRegistry()
    return matchTaskToSkillTriggers(task, registry)
  }

  resolveDataContext(contract) {
    if (hasEngram()) {
      return mem_search("backend-architect/{project}/state")
    } else {
      return readFile(Config.stateFile) |> defaultContract
    }
  }

  writeStandardContract(context, status) {
    output = {
      caller: context.caller |> default "user",
      executionMode: context.executionMode |> default "solo",
      sddPhase: "apply",
      status: status,
      payload: { codePaths: context.generatedFiles },
      artifacts: context.generatedFiles,
      ambiguities: context.pendingDecisions,
      edgeCases: context.discoveredEdgeCases
    }
    if (hasEngram()) {
      mem_save(output, topic: "backend-architect/{project}/state", type: "architecture", capture_prompt: false)
    }
    saveFile(Config.stateFile, toJson(output))
  }
}
```

## References

- `.agents/skills/tech-lead/SKILL.md` — Technical backlog tracker source.
- `.agents/skills/unit-testing/SKILL.md` — Mandatory subordinating testing executor.
