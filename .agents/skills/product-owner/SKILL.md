---
name: product-owner
description: "Trigger: PRD, product owner, requisitos, user stories, épicas, documentación de negocio, criterios de aceptación. Genera documentación de negocio mediante entrevista dinámica con aprobación por sección."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "1.0"
---

```sudolang
ProductOwner {
  Config {
    lang = "es"
    outputDir = ask_user |> default "docs/"
    knowledgeDir = ask_user |> default "knowledge/"
    diagrams = mermaid
    interAgentFormat = sudolang
    approval = detailed_per_section
  }

  OnActivate {
    mem_search("po/{project}/state")
    found => present_summary => ask: continue | start_fresh
    not_found => ask_config_preferences => begin Interview
  }

  Interview {
    strategy = dynamic(ask_question tool, multi-question blocks)
    Phase1_core: [
      visión_producto, problema_a_resolver, usuarios_objetivo,
      propuesta_valor, modelo_negocio, competidores, restricciones
    ]
    Phase2_deepen: on(unclear | complex_domain) => follow_up_contextually
    complete: when context.sufficient_for_PRD_generation
    persist: mem_save(context, topic: "po/{project}/context", type: "architecture")
  }

  Pipeline = [PRD, Épicas, Stories, AC, MVP_MLP, KPIs] |> forEach(artifact) {
    load_template("assets/{artifact}-template.md")
    generate(artifact, from: interview_context + previous_approved_artifacts)
    validate(artifact) // see references/validation-rules.md
    present(artifact, section_by_section)

    await_feedback {
      ✅ approve => save + next_artifact
      ✏️  modify(feedback) => incorporate_feedback => re_present_section
      ❌ reject => re_interview_relevant_section
    }

    save_file(outputDir/{artifact}.md)
    save_knowledge(knowledgeDir/{project}/{artifact}.md)
    mem_save(summary, topic: "po/{project}/{artifact}", type: "architecture")
  }
  |> finally {
    generate_index(all_artifacts) => save(outputDir/README.md)
    mem_save(full_artifact_map, topic: "po/{project}/state", type: "architecture")
    log: "Documentación completa generada en {outputDir} y {knowledgeDir}"
  }

  Validate {
    INVEST(stories)                // references/validation-rules.md
    AC_required(every_story, format: Given/When/Then)
    traceability(épica → feature → story → AC, bidirectional_links)
    dependencies(identify, classify: bloqueante | preferente | informativa)
    prioritization(suggest: MoSCoW | RICE, document_rationale)
    effort_estimation(every_story) {
      talla: XS | S | M | L | XL
      tiempo: range(min_days, max_days) // see references/validation-rules.md
      validate: talla ↔ tiempo coherence
      aggregate: per_epic + per_mvp totals
    }
  }

  Persist {
    engram_keys {
      "po/{project}/context"      => business_context + decisions
      "po/{project}/state"        => artifact_locations + generation_status
      "po/{project}/{artifact}"   => each_artifact_summary
    }
    files {
      outputDir   => generated_artifacts(.md) + README_index
      knowledgeDir => business_knowledge_snapshots
    }
  }

  Update {
    trigger: user says "actualiza|añade|modifica" + artifact_reference
    flow:
      mem_search("po/{project}") => recover_state
      => read_existing_artifact_files
      => apply_changes(preserve_existing_content)
      => re_validate(modified_artifacts)
      => re_persist(engram + files)
      => update_index(outputDir/README.md)
  }
}
```
