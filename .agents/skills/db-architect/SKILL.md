---
name: db-architect
description: "Trigger: db architect, base de datos, database schema, migration, diagramas ER. Planea, implementa y valida esquemas y migraciones de base de datos."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "3.1"
---

```sudolang
/**
 * @skill db-architect
 * @description Diseña e implementa esquemas de base de datos, DDLs, migraciones y diagramas ER en los flujos SDD.
 */
DatabaseArchitect {
  Config {
    lang = "es"
    outputDir = "docs/db-architect/"
    stateFile = "docs/state/db_architect_contract.json"
    tone = "instructive-concise"
  }

  // Activation Contract
  onTrigger: ["db-architect", "db architect", "base de datos", "database schema", "migration", "diagramas ER"]

  // Hard Rules
  constraints: [
    "Always scan the docs/ directory and configuration files to discover stack before proceeding.",
    "Never run standalone database tests. Always delegate schema/migration testing and validation to unit-testing.",
    "Si el esquema o propuesta de persistencia del usuario es vaga o técnicamente inadecuada, argumentar en contra u ofrecer alternativas válidas."
  ]

  // Decision Gates
  resolveAction(context) {
    if (not(matchesTrigger(context.task))) {
      candidate = findCandidateSkill(context.task)
      if (candidate) {
        log("Redirigiendo tarea fuera de ámbito a la skill candidata: " + candidate)
        return invokeSkill(candidate, context)
      } else {
        log("La tarea no corresponde a db-architect y no se encontró una skill candidata adecuada.")
        return challengeOutofScope(context)
      }
    }
    if (context.isVagueDatabaseSpec) {
      return ChallengeOrDeepenPersistence(context)
    }
    if (context.executionMode == "orchestrated") {
      return ImplementDatabaseChanges(context)
    }
    return PresentInteractiveDatabaseDesign(context)
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
    log("Acompañando al usuario en el diseño de persistencia y base de datos de manera concisa.")

    if (isVague(context.dbSpec)) {
      ChallengeOrDeepenPersistence(context.dbSpec)
      return
    }

    models = proposeSchemaDesigns(context.dbSpec)
    presentModels(models)

    edgeCases = findDatabaseEdgeCases(context.dbSpec)
    presentEdgeCases(edgeCases)

    schema = designDatabaseSchema(context)
    saveFile(Config.outputDir + "schema_spec.md", schema)
    writeStandardContract(context, "success")
  }

  executeOrchestratedMode(context) {
    design = readSddArtifact("docs/design/DESIGN.md")
    
    files = generateDatabaseScripts(design)
    
    invokeSkill("diagram-generator", { payload: files })
    invokeSkill("unit-testing", { payload: files })
    
    writeStandardContract(context, "success")
  }

  ChallengeOrDeepenPersistence(idea) {
    log("Validando modelo de persistencia...")
    if (isFlawedPersistence(idea)) {
      log("La estructura de base de datos o persistencia propuesta presenta riesgos de integridad o performance.")
      log("Justificación: [Explicación técnica concisa]")
      log("Modelo recomendado: ✨ [Esquema o modelo sugerido]")
    } else {
      log("La especificación de base de datos es viable pero vaga. Indique tablas principales o volúmenes esperados.")
    }
  }

  findCandidateSkill(task) {
    registry = readRegistry()
    return matchTaskToSkillTriggers(task, registry)
  }

  resolveDataContext(contract) {
    if (hasEngram()) {
      return mem_search("db-architect/{project}/state")
    } else {
      return readFile(Config.stateFile) |> defaultContract
    }
  }

  writeStandardContract(context, status) {
    output = {
      caller: context.caller |> default "user",
      executionMode: context.executionMode |> default "solo",
      sddPhase: "design",
      status: status,
      payload: { schemaPath: Config.outputDir + "schema_spec.md" },
      artifacts: [Config.outputDir + "schema_spec.md"],
      ambiguities: context.pendingIssues,
      edgeCases: context.discoveredEdgeCases
    }
    if (hasEngram()) {
      mem_save(output, topic: "db-architect/{project}/state", type: "architecture", capture_prompt: false)
    }
    saveFile(Config.stateFile, toJson(output))
  }
}
```

## References

- `.agents/skills/diagram-generator/SKILL.md` — Delegated E/R diagram creator.
- `.agents/skills/unit-testing/SKILL.md` — Subordinate unit test runner.
- `.agents/skills/qa-engineer/SKILL.md` — Quality assurance validator.
