---
name: wireframe-designer
description: "Trigger: wireframe, mockup, prototipo, UI prototype, navigable design, interactivo, autocontenido. Diseña y genera wireframes y prototipos interactivos autocontenidos (HTML/JS/Tailwind) para validar evolutivos de manera rápida."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "3.2"
---

```sudolang
/**
 * @skill wireframe-designer
 * @description Diseña y genera wireframes interactivos autocontenidos en HTML/JS con Tailwind en el flujo SDD.
 */
WireframeDesigner {
  Config {
    lang = "es"
    outputDir = "docs/wireframes/"
    stateFile = "docs/state/wireframe_contract.json"
    tone = "instructive-concise"
    uiDefaults {
      palette = "Slate and Indigo (✨ Recommended)"
      typography = "Inter (from Google Fonts)"
      stylePreset = "tailwind_cdn"
    }
  }

  // Activation Contract
  onTrigger: ["wireframe", "mockup", "prototipo", "UI prototype", "navigable design", "interactivo", "autocontenido"]

  // Hard Rules
  constraints: [
    "Generar un único archivo HTML autocontenido con CSS, JS y dependencias por CDN (como Tailwind y FontAwesome).",
    "Interactividad completa: botones, menús y navegación simulados en Vanilla JS con gestión de estado.",
    "Preparado para verificación: incluir selectores de ID únicos y claros en el DOM para pruebas con browser_subagent.",
    "Si la idea o flujo de UI propuesto por el usuario es vaga o confusa, challengear y guiar la especificación con alternativas claras."
  ]

  // Decision Gates
  resolveAction(context) {
    if (not(matchesTrigger(context.task))) {
      candidate = findCandidateSkill(context.task)
      if (candidate) {
        log("Redirigiendo tarea fuera de ámbito a la skill candidata: " + candidate)
        return invokeSkill(candidate, {
          caller: "wireframe-designer",
          executionMode: context.executionMode,
          task: context.task,
          payload: { sourceContractPath: Config.stateFile }
        })
      } else {
        log("La tarea no corresponde a wireframe-designer y no se encontró una skill candidata adecuada.")
        return challengeOutofScope(context)
      }
    }
    if (context.isVagueUiIdea) {
      return ChallengeOrDeepenLayout(context)
    }
    if (context.executionMode == "orchestrated") {
      return BuildWireframe(context)
    }
    return PresentInteractivePrototypeDesigner(context)
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
    log("Acompañando al usuario en el diseño y flujo de pantallas de manera concisa.")

    if (isVague(context.uiIdea)) {
      ChallengeOrDeepenLayout(context.uiIdea)
      return
    }

    flows = proposeUserFlows(context.uiIdea)
    presentFlows(flows)

    edgeCases = findUiEdgeCases(context.uiIdea)
    presentEdgeCases(edgeCases)

    mockup = generateHtmlWireframe(context)
    path = Config.outputDir + context.name + ".html"
    saveFile(path, mockup)
    writeStandardContract(context, "success")
  }

  executeOrchestratedMode(context) {
    // Paso por referencia: Leer especificación por ruta
    specsRef = { briefPath: "docs/prd/brief.md" }
    
    mockup = generateHtmlWireframeFromSpecs(specsRef)
    path = Config.outputDir + "index.html"
    saveFile(path, mockup)
    
    writeStandardContract(context, "success")
  }

  ChallengeOrDeepenLayout(idea) {
    log("Validando flujo de interfaz...")
    if (isPoorUserExperience(idea)) {
      log("El diseño de interfaz o flujo de navegación propuesto presenta problemas severos de experiencia de usuario o accesibilidad.")
      log("Justificación: [Explicación de UX concisa]")
      log("Diseño recomendado: ✨ [Layout o flujo UX recomendado]")
    } else {
      log("La propuesta de UI es viable pero vaga. Indique número de pantallas clave o interacciones deseadas.")
    }
  }

  findCandidateSkill(task) {
    registry = readRegistryMetadata()
    return matchTaskToTriggersLightweight(task, registry)
  }

  resolveDataContext(contract) {
    if (hasEngram()) {
      return mem_search("wireframe-designer/{project}/state")
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
      payload: { mockupPath: Config.outputDir + "index.html" },
      artifacts: [Config.outputDir + "index.html"],
      ambiguities: context.pendingIssues,
      edgeCases: context.discoveredEdgeCases
    }
    if (hasEngram()) {
      mem_save(output, topic: "wireframe-designer/{project}/state", type: "architecture", capture_prompt: false)
    }
    saveFile(Config.stateFile, toJson(output))
  }
}
```

## References

- Carpeta `docs/`: Contiene especificaciones de flujos de usuario y diseño.
- AGENTS.md: Registro de skills del proyecto para la coordinación de dependencias.
