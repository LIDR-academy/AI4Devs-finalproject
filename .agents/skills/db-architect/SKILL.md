---
name: db-architect
description: "Trigger: db architect, base de datos, database schema, migration, diagramas ER. Planea, implementa y valida esquemas y migraciones de base de datos."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "1.0"
---

## Activation Contract

```sudolang
ActivationContract {
  conditions = [
    "planning database schemas or migrations",
    "designing database tables or Entity-Relationship metadata",
    "implementing schema files, DDLs, migrations, or seeds",
    "validating or testing database persistence layers",
    "optimizing queries or indexes"
  ]
  triggers = [
    "db architect",
    "base de datos",
    "database schema",
    "migration",
    "diagramas ER"
  ]
  on_trigger => load_skill(db-architect)
}
```

## Hard Rules

```sudolang
HardRules {
  * "Always scan the `docs/` directory and project root configuration files (e.g. `schema.prisma`, `package.json`) to discover stack before proceeding."
  * "Default to PostgreSQL with Prisma/Sequelize in JavaScript/TypeScript. Ask the user for confirmation if stack cannot be inferred."
  * "Always produce detailed structured table and relation descriptions to facilitate Entity-Relationship (E/R) diagram generation."
  * "Never run standalone database tests. Always delegate schema/migration testing and validation to `qa-engineer` or `unit-testing` skills."
}
```

## Decision Gates

```sudolang
DecisionGates {
  when (context.database == null || context.orm == null) => AskUser("Especificar detalles del stack de base de datos")
  when (prompt.requiresER || plan.schemaChanged) => {
    GenerateERMetadata()
    delegate("diagram-generator", "Generar diagrama E/R")
  }
  when (code.generated == true) => delegate("unit-testing" | "qa-engineer", "Validar y testear cambios de BD")
}
```

## Execution Steps

```sudolang
DatabaseArchitect {
  Config {
    lang = detect_from_input |> default "es"
    outputDir = "docs/db-architect/"
    defaultStack {
      database = "PostgreSQL"
      orms = ["Prisma", "Sequelize"]
      environment = "JavaScript/TypeScript"
    }
  }

  OnActivate(prompt) {
    context = ContextDiscovery()
    if (context.database == null || context.orm == null) {
      context = AskUser("Por favor, especifica la base de datos, ORM y lenguaje a utilizar:")
    }
    ExecuteWorkflow(prompt, context)
  }

  ContextDiscovery() {
    aiSpecs = scan_directory("docs/")
    projectFiles = list_files()
    
    db = infer_database(aiSpecs, projectFiles)
    orm = infer_orm(aiSpecs, projectFiles)
    language = infer_language(aiSpecs, projectFiles)
    
    return {
      database: db,
      orm: orm,
      language: language,
      specs: aiSpecs
    }
  }

  ExecuteWorkflow(prompt, context) {
    plan = PlanDatabaseChanges(prompt, context)
    
    if (prompt.requiresER || plan.schemaChanged) {
      erDoc = DocumentSchemaAndER(plan, context)
      delegate("diagram-generator", {
        task: "Generar diagrama de Entidad-Relación (E/R)",
        metadata: erDoc
      })
    }
    
    code = ImplementDatabaseCode(plan, context)
    ValidateAndTest(code, context)
  }

  PlanDatabaseChanges(prompt, context) {
    changes = []
    if (prompt.contains("migration") || prompt.contains("esquema")) {
      changes.push(DefineMigrationPlan(prompt, context))
    }
    if (prompt.contains("seed") || prompt.contains("semilla")) {
      changes.push(DefineSeedPlan(prompt, context))
    }
    if (prompt.contains("optimize") || prompt.contains("optimizar")) {
      changes.push(DefineOptimizationPlan(prompt, context))
    }
    
    plan = {
      changes: changes,
      schemaChanged: changes.any(c => c.type == "schema_modification")
    }
    
    return RequestUserApproval(plan)
  }

  DocumentSchemaAndER(plan, context) {
    tables = plan.targetTables.map(t => DescribeTableSchema(t))
    relationships = plan.targetRelationships.map(r => DescribeRelationship(r))
    return {
      title: "Metadata de Modelo E/R",
      tables: tables,
      relationships: relationships
    }
  }

  ImplementDatabaseCode(plan, context) {
    generatedFiles = []
    for (change in plan.changes) {
      if (change.type == "schema_modification") {
        generatedFiles.push(GenerateSchemaOrMigration(change, context))
      }
      if (change.type == "seed") {
        generatedFiles.push(GenerateSeedScript(change, context))
      }
      if (change.type == "query_optimization") {
        generatedFiles.push(GenerateOptimizedQueryOrIndex(change, context))
      }
    }
    return generatedFiles
  }

  ValidateAndTest(code, context) {
    // Validar sintaxis y ejecutar validaciones locales
    RunMigrationDryRun(code, context)
    
    // Delegar pruebas a la skill de QA
    delegate("unit-testing", {
      task: "Validar persistencia de base de datos e integridad del esquema",
      files: code,
      context: context
    })
  }
}
```

## Output Contract

Return:
- Discovered/inferred database stack configuration.
- Detailed migration plans and database schema code files created or modified.
- Structured table/relation documentation for E/R diagrams.
- Validation and testing reports delegated to QA/Testing skills.

## References

- `.agents/skills/diagram-generator/SKILL.md` — Delegated E/R diagram creator.
- `.agents/skills/unit-testing/SKILL.md` — Subordinate unit test runner.
- `.agents/skills/qa-engineer/SKILL.md` — Quality assurance validator.
