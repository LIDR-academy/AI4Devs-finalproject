---
name: product-owner
description: "Trigger: product owner, requisitos, documentación de negocio, backlog preliminar. Coordina la fase de entrevista de negocio y delega la creación del PRD y backlog técnico en sus respectivas skills."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "1.1"
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

  Pipeline {
    // 1. Delegar generación del PRD
    brief = compile(interview_context)
    save_file(".ia/docs/prd/brief.md", brief)
    show_instruction_to_user("Entrevista completada. Por favor, ejecuta la skill `prd-generator` con el brief generado en `.ia/docs/prd/brief.md` para obtener el PRD detallado.")

    // 2. Delegar generación del Backlog
    show_instruction_to_user("Una vez que el PRD esté generado y aprobado, ejecuta la skill `backlog-generator` para desglosar el backlog técnico.")
  }

  Persist {
    engram {
      "po/{project}/context" => business_context + decisions
      "po/{project}/state"   => generation_status
    }
    files {
      outputDir => "brief.md"
    }
  }

  Update {
    trigger = user_says("actualiza|añade|modifica") + interview_reference
    flow = [
      mem_search("po/{project}") => recover_state,
      update_interview_context,
      compile(new_context) => save_file(".ia/docs/prd/brief.md"),
      show_instruction_to_user("Brief actualizado. Re-ejecuta `prd-generator` y `backlog-generator` para propagar los cambios.")
    ]
  }
}
```
