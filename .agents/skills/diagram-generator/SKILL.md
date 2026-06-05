---
name: diagram-generator
description: "Trigger: diagrama, diagram, mermaid, casos de uso, secuencia, clases, flujo, ER, arquitectura, C4, mindmap, gitGraph. Genera diagramas Mermaid detallados a partir de documentación del proyecto o contexto proporcionado."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "1.0"
---

```sudolang
DiagramGenerator {
  Config {
    lang             = detect_from_user_input |> default "es"
    sourceDir        = ".ia/"
    supportedTypes   = [
      "usecase", "sequence", "class", "flowchart",
      "er", "stateDiagram", "gantt", "mindmap",
      "gitGraph", "C4Context", "C4Container", "C4Component",
      "timeline", "quadrantChart", "xychart", "block"
    ]
    approval         = param_or_default("per_diagram")  // per_diagram | batch
    outputMode       = ask_user |> options ["file", "return_to_caller"]
    outputDir        = ask_user |> default ".ia/docs/diagrams/"
    interAgentFormat = sudolang
  }

  OnActivate {
    mode = detect_invocation_mode()  // "user" | "inter_agent"

    mode == "inter_agent" => {
      // Caller must pass: diagramTypes[], sourceContext (text|refs), outputMode, approval
      params = receive_from_caller(diagramTypes, sourceContext, outputMode, approval)
      require: params.diagramTypes.length > 0
        || error("El flujo invocante debe indicar al menos un tipo de diagrama.")
      require: params.sourceContext != null
        || error("El flujo invocante debe pasar el contexto o referencias de documentación.")
      context = params.sourceContext
      diagramPlan = params.diagramTypes
      goto Execute
    }

    mode == "user" => {
      mem_search("diagram/{project}/state")
      found     => present_summary => ask: continue | update | start_fresh
      not_found => begin Gather
    }
  }

  Gather {
    // Step 1 — Resolve documentation source
    docs = scan_dir(sourceDir, extensions: [".md", ".txt", ".yaml", ".json"])
    docs.empty => {
      warn("No se encontró documentación en `.ia/`. Por favor proporciona:")
      ask_user([
        "Texto descriptivo del sistema o flujo a diagramar",
        "Ruta a los archivos o directorio de documentación",
        "O pega directamente el contexto relevante"
      ])
      context = user_provided_context
    }
    docs.not_empty => {
      context = read_and_summarize(docs)
      inform_user("Documentación encontrada en `.ia/`. Usando como fuente base.")
    }

    // Step 2 — Determine diagram types
    ask_user("¿Qué tipos de diagrama necesitas? (puedes elegir varios):")
    present_options(supportedTypes)
    diagramPlan = user_selection |> validate_against(supportedTypes)
    diagramPlan.empty => error("Selecciona al menos un tipo de diagrama.")

    // Step 3 — Resolve output preferences
    outputMode = ask_user("¿Cómo quieres el resultado?") |> options ["file (.ia/docs/diagrams/)", "devolver al flujo invocante"]
    outputMode == "file" => outputDir = ask_user("¿Directorio de salida?") |> default ".ia/docs/diagrams/"

    // Step 4 — Confirm approval mode
    approval = ask_user("¿Aprobación por diagrama o al final en lote?") |> options ["per_diagram", "batch"]

    goto Execute
  }

  Execute {
    results = []

    forEach(diagramType in diagramPlan) {
      // Analysis phase
      analysis = analyze_context(context, diagramType) {
        extract: actors, entities, relationships, flows, states, sequences
        depth:   maximum_detail_from_context
        infer:   implicit_relationships_when_evident
      }

      // Generation phase
      diagram = generate_mermaid(diagramType, analysis) {
        syntax:    strict_mermaid_v10+
        detail:    maximum (all actors, all flows, all edges labeled)
        labels:    in_lang(lang)
        title:     include_diagram_title
        notes:     add_participant_notes_when_sequence
        validate:  check_mermaid_syntax_before_output
      }

      // Approval gate
      approval == "per_diagram" => {
        present(diagram, format: "```mermaid\n{diagram}\n```")
        await_feedback {
          ✅ approve     => results.append(diagram)
          ✏️  modify(fb) => incorporate_feedback(fb) => regenerate => re_present
          ❌ reject      => ask_clarification => regenerate_from_scratch(diagramType, context)
        }
      }
      approval == "batch" => results.append(diagram)
    }

    // Batch approval gate
    approval == "batch" => {
      present_all(results)
      await_feedback {
        ✅ approve_all           => goto Deliver
        ✏️  modify(type, fb)    => incorporate_feedback(type, fb) => regenerate(type) => re_present_all
        ❌ reject(type)          => ask_clarification(type) => regenerate_from_scratch(type)
      }
    }

    goto Deliver
  }

  Deliver {
    outputMode == "file" => {
      forEach(diagram in results) {
        filename = "{diagram.type}-{timestamp}.md"
        save_file("{outputDir}/{filename}", wrap_in_markdown(diagram))
      }
      mem_save(
        summary: diagram_plan + file_paths,
        topic:   "diagram/{project}/state",
        type:    "architecture",
        capture_prompt: false
      )
      inform_user("Diagramas guardados en `{outputDir}`.")
    }

    outputMode == "return_to_caller" => {
      return_to_caller {
        status:   "success"
        diagrams: results  // array of { type, mermaidCode, title }
        savedTo:  null
      }
    }
  }

  DiagramTypes {
    usecase       { actors, useCases, relationships: [include, extend, generalization] }
    sequence      { participants, messages, activations, loops, alts, notes }
    class         { classes, attributes, methods, relationships: [inheritance, composition, aggregation, dependency] }
    flowchart     { direction: TD|LR, nodes, edges, decision_diamonds, subgraphs }
    er            { entities, attributes, relationships, cardinality }
    stateDiagram  { states, transitions, guards, initial_final }
    gantt         { tasks, sections, milestones, dependencies, dates }
    mindmap       { root, branches, leaves, icons }
    gitGraph      { branches, commits, merges, tags }
    C4Context     { persons, systems, external_systems, relationships }
    C4Container   { containers, technologies, databases, apis, relationships }
    C4Component   { components, interfaces, dependencies }
    timeline      { eras, events, milestones }
    quadrantChart { axes, quadrants, points }
    xychart       { axes, bars_or_lines, series }
    block         { blocks, arrows, groups }
  }

  Persist {
    engram {
      "diagram/{project}/state"   => diagram_plan + file_paths + generation_status
      "diagram/{project}/context" => source_context_summary
    }
    files {
      outputDir => "{diagramType}-{timestamp}.md"  // only when outputMode == "file"
    }
  }

  Update {
    trigger = user_says("actualiza|regenera|añade|modifica|update|regenerate") + diagram_reference
    flow = [
      mem_search("diagram/{project}/state") => recover_state,
      ask_user("¿Qué diagrama y qué cambios necesitas?"),
      re_analyze(context, updated_requirements),
      regenerate_specific_diagrams,
      re_deliver(outputMode)
    ]
  }
}
```

## References

- `assets/mermaid-types-reference.md` — quick syntax reference per diagram type
