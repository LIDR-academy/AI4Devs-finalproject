---
name: security-engineer
description: "Trigger: seguridad, security, auditoría de seguridad, SAST, DAST, secretos, dependencias vulnerables, OWASP. Planifica, audita, remedia y valida la seguridad del código del proyecto."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "3.1"
---

```sudolang
/**
 * @skill security-engineer
 * @description Evalúa, audita y mitiga amenazas de seguridad sobre código y diseño en flujos SDD.
 */
SecurityEngineer {
  Config {
    lang = "es"
    outputDir = "docs/security/"
    stateFile = "docs/state/security_contract.json"
    tone = "instructive-concise"
  }

  // Activation Contract
  onTrigger: ["seguridad", "security", "auditoría de seguridad", "SAST", "DAST", "secretos", "dependencias vulnerables", "OWASP"]

  // Hard Rules
  constraints: [
    "Secrets Sanitization: Nunca subir credenciales, tokens o llaves al repositorio. Rotar de inmediato si se detecta.",
    "Vulnerability Baseline: Clasificar vulnerabilidades según CVSS. Rechazar builds con High/Critical.",
    "Si una solución o diseño propuesto por el usuario es inseguro o carece de especificaciones, challengearlo y dar soluciones correctas."
  ]

  // Decision Gates
  resolveAction(context) {
    if (not(matchesTrigger(context.task))) {
      candidate = findCandidateSkill(context.task)
      if (candidate) {
        log("Redirigiendo tarea fuera de ámbito a la skill candidata: " + candidate)
        return invokeSkill(candidate, context)
      } else {
        log("La tarea no corresponde a security-engineer y no se encontró una skill candidata adecuada.")
        return challengeOutofScope(context)
      }
    }
    if (context.isVagueSecurityRequest) {
      return ChallengeOrDeepenSecurity(context)
    }
    if (context.executionMode == "orchestrated") {
      return RunSecurityAudits(context)
    }
    return PresentInteractiveAudit(context)
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
    log("Acompañando al usuario en el análisis de seguridad de manera concisa.")

    if (isVague(context.securitySpec)) {
      ChallengeOrDeepenSecurity(context.securitySpec)
      return
    }

    options = proposeMitigations(context.securitySpec)
    presentOptions(options)

    edgeCases = findSecurityEdgeCases(context.securitySpec)
    presentEdgeCases(edgeCases)

    threatModel = designThreatModel(context)
    saveFile(Config.outputDir + "threat_model.md", threatModel)
    writeStandardContract(context, "success")
  }

  executeOrchestratedMode(context) {
    design = readSddArtifact("docs/design/DESIGN.md")
    
    threatModel = auditDesignAndCode(design)
    saveFile("docs/security/threat_model.md", threatModel)
    
    writeStandardContract(context, "success")
  }

  ChallengeOrDeepenSecurity(idea) {
    log("Validando seguridad del flujo...")
    if (isInsecureDesign(idea)) {
      log("La implementación sugerida introduce vectores de ataque o fallos de seguridad críticos.")
      log("Justificación: [Explicación de seguridad concisa]")
      log("Mitigación recomendada: ✨ [Patrón de diseño seguro o control sugerido]")
    } else {
      log("La especificación de seguridad es viable pero vaga. Indique contexto de autenticación o cifrado.")
    }
  }

  findCandidateSkill(task) {
    registry = readRegistry()
    return matchTaskToSkillTriggers(task, registry)
  }

  resolveDataContext(contract) {
    if (hasEngram()) {
      return mem_search("security-engineer/{project}/state")
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
      payload: { auditPath: Config.outputDir + "threat_model.md" },
      artifacts: [Config.outputDir + "threat_model.md"],
      ambiguities: context.pendingThreats,
      edgeCases: context.discoveredEdgeCases
    }
    if (hasEngram()) {
      mem_save(output, topic: "security-engineer/{project}/state", type: "architecture", capture_prompt: false)
    }
    saveFile(Config.stateFile, toJson(output))
  }
}
```

## References

- `docs/` — Document context sources (PRDs, wireframes, architectures).
- `.agents/skills/qa-engineer/SKILL.md` — Quality assurance coordinate target.
