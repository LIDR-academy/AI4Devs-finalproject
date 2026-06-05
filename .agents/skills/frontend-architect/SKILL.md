---
name: frontend-architect
description: "Trigger: frontend architect, implementar frontend, arquitectura frontend, UI implementation. Diseña e implementa historias técnicas de frontend, gestiona su ciclo de vida y coordina con testing y backend skills."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "3.2"
---

```sudolang
/**
 * @skill frontend-architect
 * @description Diseña e implementa componentes y vistas de frontend integrando mocks y TDD en la fase apply de SDD.
 */
FrontendArchitect {
  Config {
    lang = "es"
    outputDir = "docs/frontend-architect/"
    stateFile = "docs/state/frontend_architect_contract.json"
    tone = "instructive-concise"
  }

  // Activation Contract
  onTrigger: ["frontend architect", "implementar frontend", "arquitectura frontend", "UI implementation"]

  // Hard Rules
  constraints: [
    "Autonomy Gates: Pausar y pedir confirmación antes de escribir componentes salvo autonomía alta.",
    "API Coordination: Validar contratos con endpoints activos; escribir mocks/stubs si no están listos.",
    "Si las directrices de interfaz o experiencia propuestas son vagas o inviables, challengear o proponer alternativas sólidas."
  ]

  // Decision Gates
  resolveAction(context) {
    if (not(matchesTrigger(context.task))) {
      candidate = findCandidateSkill(context.task)
      if (candidate) {
        log("Redirigiendo tarea fuera de ámbito a la skill candidata: " + candidate)
        return invokeSkill(candidate, {
          caller: "frontend-architect",
          executionMode: context.executionMode,
          task: context.task,
          payload: { sourceContractPath: Config.stateFile }
        })
      } else {
        log("La tarea no corresponde a frontend-architect y no se encontró una skill candidata adecuada.")
        return challengeOutofScope(context)
      }
    }
    if (context.isVagueRequirement) {
      return ChallengeOrDeepenRequirements(context)
    }
    if (context.executionMode == "orchestrated") {
      return ExecuteFrontendImplementation(context)
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
    log("Acompañando al usuario en el diseño de interfaz y componentes frontend de manera concisa.")

    if (isVague(context.frontendSpec)) {
      ChallengeOrDeepenRequirements(context.frontendSpec)
      return
    }

    options = proposeFrontendSolutions(context.frontendSpec)
    presentOptions(options)

    edgeCases = findFrontendEdgeCases(context.frontendSpec)
    presentEdgeCases(edgeCases)

    structure = designComponentTree(context)
    saveFile(Config.outputDir + "components_spec.md", structure)
    writeStandardContract(context, "success")
  }

  executeOrchestratedMode(context) {
    // Paso por referencia: Leer el backlog desde el path
    backlogRef = { backlogPath: "docs/tech-lead/backlog.md" }
    generatedFiles = writeFrontendComponents(backlogRef)
    
    // Delegar validaciones pasando referencias
    invokeSkill("unit-testing", { payload: { codePaths: generatedFiles } })
    
    writeStandardContract(context, "success")
  }

  ChallengeOrDeepenRequirements(idea) {
    log("Validando requerimientos de interfaz...")
    if (isPoorLayoutOrDesign(idea)) {
      log("La interfaz propuesta presenta problemas de usabilidad, accesibilidad o acoplamiento excesivo.")
      log("Justificación: [Explicación técnica/UX concisa]")
      log("Solución propuesta: ✨ [Estructura de componentes o maquetación recomendada]")
    } else {
      log("La propuesta de frontend es viable pero vaga. Especifique paleta, layout o interacciones clave.")
    }
  }

  findCandidateSkill(task) {
    registry = readRegistryMetadata()
    return matchTaskToTriggersLightweight(task, registry)
  }

  resolveDataContext(contract) {
    if (hasEngram()) {
      return mem_search("frontend-architect/{project}/state")
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
      payload: { uiComponents: context.generatedFiles },
      artifacts: context.generatedFiles,
      ambiguities: context.pendingDecisions,
      edgeCases: context.discoveredEdgeCases
    }
    if (hasEngram()) {
      mem_save(output, topic: "frontend-architect/{project}/state", type: "architecture", capture_prompt: false)
    }
    saveFile(Config.stateFile, toJson(output))
  }
}
```

## References

- `.agents/skills/tech-lead/SKILL.md` — Technical backlog tracker source.
- `.agents/skills/unit-testing/SKILL.md` — Mandatory subordinating testing executor.
