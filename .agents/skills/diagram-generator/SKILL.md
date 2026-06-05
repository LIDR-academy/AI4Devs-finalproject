---
name: diagram-generator
description: "Trigger: diagrama, diagram, mermaid, casos de uso, secuencia, clases, flujo, ER, arquitectura, C4, mindmap, gitGraph. Genera diagramas Mermaid detallados a partir de documentación del proyecto o contexto proporcionado."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "2.0"
---

## Activation Contract

Load this skill when visual diagrams, architecture charts, user flow mapping, C4 container topologies, or database ER schemas are requested. Triggers: `diagrama`, `diagram`, `mermaid`, `casos de uso`, `secuencia`, `clases`, `flujo`, `ER`, `arquitectura`, `C4`, `mindmap`, `gitGraph`.

## Hard Rules

- **Strict Syntax Verification:** Mermaid syntax must be validated for correctness before output. Avoid HTML tags or unquoted parentheses inside labels.
- **Maximum Detail:** Include all actors, data flows, and labeled edges. No placeholder lines.
- **Output Routing:** Support file serialization and direct SudoLang payload return to calling agents.

## Decision Gates

| Invocation Mode | Action | Output Model |
|---|---|---|
| Inter-Agent (Delegation) | Verify required diagram types are passed, bypass config questionnaire | `return_to_caller` |
| Direct User Request | Run context gathering and step approvals | `file` or as configured |

## Execution Steps

```sudolang
DiagramGenerator {
  Config {
    lang             = detect_from_user_input |> default "es"
    sourceDir        = ".ia/"
    supportedTypes   = ["usecase", "sequence", "class", "flowchart", "er", "C4Context", "C4Container"]
    approval         = param_or_default("per_diagram")
    outputMode       = ask_user
    outputDir        = ask_user |> default ".ia/docs/diagrams/"
  }

  OnActivate {
    mode = detect_invocation_mode()
    when mode == "inter_agent" => HandleAgentInvocation
    when mode == "user" => HandleUserInvocation
  }

  Execute {
    // 1. Analyze text context to extract actors, boundaries, and flows
    // 2. Generate target Mermaid code following strict structure rules
    // 3. Prompt validation or batch confirmations
  }

  Deliver {
    // Save to outputDir or return structured JSON depending on outputMode
    persist: mem_save(summary, topic: "diagram/{project}/state", type: "architecture", capture_prompt: false)
  }
}
```

1. **Context Parsing**: Scans `.ia/` and extracts structural data models.
2. **Mermaid Generation**: Render diagram templates matching requested types.
3. **Syntax Verification**: Test outputs against Mermaid parser constraints.
4. **Delivery**: Output to files or return payload.

## Output Contract

Return:
- Labeled code blocks wrapped in standard markdown ` ```mermaid ` fences.
- Overview list of diagram types generated and their purpose.

## References

- `.ia/` — Text specifications, API structures, or stories.
