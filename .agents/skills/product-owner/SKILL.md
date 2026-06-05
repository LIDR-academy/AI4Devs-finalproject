---
name: product-owner
description: "Trigger: product owner, requisitos, documentación de negocio, backlog preliminar. Coordina la fase de entrevista de negocio y delega la creación del PRD y backlog técnico en sus respectivas skills."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "3.2"
---

```sudolang
/**
 * @skill product-owner
 * @description Coordina la fase de descubrimiento y definición de requerimientos de negocio, integrándose con el flujo SDD.
 */
ProductOwner {
  Config {
    lang = "es"
    outputDir = "docs/prd/"
    stateFile = "docs/state/product_owner_contract.json"
    tone = "instructive-concise"
  }

  // Activation Contract
  onTrigger: ["product owner", "requisitos", "documentación de negocio", "backlog preliminar"]

  // Hard Rules
  constraints: [
    "Strict Separation of Concerns: delegar la compilación del PRD a prd-generator y las tareas a backlog-generator.",
    "User Verification: requerir la confirmación explícita del brief del producto antes de invocar subfases.",
    "Si el usuario da una idea vaga o ambigua, profundizar en ella o rechazarla con criterios de negocio justificables."
  ]

  // Decision Gates
  resolveAction(context) {
    if (not(matchesTrigger(context.task))) {
      candidate = findCandidateSkill(context.task)
      if (candidate) {
        log("Redirigiendo tarea fuera de ámbito a la skill candidata: " + candidate)
        return invokeSkill(candidate, {
          caller: "product-owner",
          executionMode: context.executionMode,
          task: context.task,
          payload: { sourceContractPath: Config.stateFile } // Paso por referencia
        })
      } else {
        log("La tarea no corresponde a product-owner y no se encontró una skill candidata adecuada.")
        return challengeOutofScope(context)
      }
    }
    if (context.isVagueIdea) {
      return ChallengeOrDeepenIdea(context)
    }
    if (context.interviewInProgress) {
      return ContinueInterview(context)
    }
    if (context.briefApproved && context.executionMode == "orchestrated") {
      return RunGeneratorPipeline(context)
    }
    return PresentDiscoveryOptions(context)
  }

  // Execution Steps
  execute(contract) {
    resolvedContext = resolveDataContext(contract)
    resolveAction(resolvedContext)

    if (resolvedContext.executionMode == "solo") {
      executeSoloMode(resolvedContext)
    } else {
      executeOrchestratedMode(resolvedContext)
    }
  }

  executeSoloMode(context) {
    log("Acompañando al usuario en el proceso de descubrimiento con tono conciso.")
    
    if (isVague(context.userInput)) {
      ChallengeOrDeepenIdea(context.userInput)
      return
    }

    options = generateProductDirections(context.userInput)
    presentOptionsToUser(options)

    edgeCases = findBusinessEdgeCases(context.userInput)
    presentEdgeCases(edgeCases)

    userBrief = compileBrief(context)
    saveFile(Config.outputDir + "brief.md", userBrief)
    
    writeStandardContract(context, "success")
  }

  executeOrchestratedMode(context) {
    // Optimización de tokens: Pasar referencias de archivos en lugar de inyectar strings en memoria
    briefRef = { briefPath: Config.outputDir + "brief.md" }
    invokeSkill("prd-generator", { payload: briefRef })
    invokeSkill("backlog-generator", { payload: briefRef })
    writeStandardContract(context, "success")
  }

  ChallengeOrDeepenIdea(idea) {
    log("Analizando viabilidad de la idea...")
    if (isTechnicallyOrBusinessUnfeasible(idea)) {
      log("La idea propuesta presenta riesgos críticos de viabilidad de negocio o técnicos.")
      log("Justificación: [Explicación concisa de por qué no es el camino adecuado]")
      log("Alternativa propuesta: ✨ [Propuesta de alternativa viable]")
    } else {
      log("La idea es interesante pero ambigua. Vamos a profundizar:")
      askUser("¿Cuál es el usuario objetivo principal y el problema clave que resolvemos?")
    }
  }

  findCandidateSkill(task) {
    // Matching ligero: Lee los metadatos y triggers sin cargar los archivos completos
    registry = readRegistryMetadata() 
    return matchTaskToTriggersLightweight(task, registry)
  }

  resolveDataContext(contract) {
    if (hasEngram()) {
      return mem_search("po/{project}/state")
    } else {
      return readFile(Config.stateFile) |> defaultContract
    }
  }

  writeStandardContract(context, status) {
    output = {
      caller: context.caller |> default "user",
      executionMode: context.executionMode |> default "solo",
      sddPhase: "proposal",
      status: status,
      payload: { briefPath: Config.outputDir + "brief.md" },
      artifacts: [Config.outputDir + "brief.md"],
      ambiguities: context.pendingDecisions,
      edgeCases: context.discoveredEdgeCases
    }
    if (hasEngram()) {
      mem_save(output, topic: "po/{project}/state", type: "architecture", capture_prompt: false)
    }
    saveFile(Config.stateFile, toJson(output))
  }
}
```

## References

- `.agents/skills/prd-generator/SKILL.md` — Subordinating PRD compiler.
- `.agents/skills/backlog-generator/SKILL.md` — Subordinating Backlog breakdown manager.
