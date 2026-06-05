---
name: frontend-architect
description: "Trigger: frontend architect, implementar frontend, arquitectura frontend, UI implementation. Diseña e implementa historias técnicas de frontend, gestiona su ciclo de vida y coordina con testing y backend skills."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "1.0"
---

```sudolang
FrontendArchitect {
  Config {
    lang = detect_from_input |> default "es"
    outputDir = ".ia/frontend-architect/"
    skillsRegistry = scan(".agents/skills/") + scan("~/.gemini/config/skills/")
    
    // Configuración por defecto del stack
    defaultStack {
      framework = "React"
      builder = "Vite"
      language = "TypeScript"
      css = "Tailwind"
      stateManagement = "Zustand"
      forms = "react-hook-form + Zod"
      fetching = "TanStack Query"
    }

    // Arquitecturas soportadas
    architectures = [
      "Atomic Design",
      "Clean Architecture",
      "Feature-Sliced Design (FSD)"
    ]

    // Modos de autonomía de ejecución
    autonomyLevel = enum {
      high        // Implementa directamente sin pausar para aprobación de plan
      story       // Pausa y pide aprobación del plan de archivos antes de escribir
      granular    // Por defecto. Muestra plan -> pide OK -> implementa -> pide revisión por componente
      orchestrator // Planifica y delega en sub-skills sin escribir código directamente
    }
    
    currentAutonomy = granular
  }

  TaskStatus = enum {
    todo
    in_progress
    in_review
    verified
    done
    blocked
    skipped
  }

  ComponentMetadata {
    name: string
    path: string
    pattern: string // atoms | molecules | organisms | templates | pages | domain | application | infrastructure
    dependencies: [string]
    hasStorybook: boolean
    hasTests: boolean
    documentationStyle: "JSDoc" | "TSDoc" | "None"
  }

  OnActivate {
    mem_search("frontend-architect/{project}/state")
    found => {
      present_dashboard(state)
      ask: continue_from_next | update_state | start_fresh
    }
    not_found => begin ContextDiscovery
  }

  ContextDiscovery {
    // 1. Detección automática del stack y estructura
    scan(project) => find([
      package_json, tsconfig_json, eslintrc, prettierrc,
      vite_config, tailwind_config, src_directory
    ])
    => infer_stack_and_conventions {
      stack: detected_framework_and_libraries
      architecturePattern: detect_dir_structure(src_directory)
      lintConfig: parse_lint_prettier_rules
    }

    // 2. Comprobar especificaciones del caller o .ia/
    scan(".ia/") => find([PRDs, backlogs, tech_lead_plans, tasks])
    
    // 3. Fallbacks de resolución
    when stack_uncertain => {
      ask_caller_or_skill("tech-lead", query: "get_project_stack")
      => not_resolved => ask_user("¿Qué stack y arquitectura usa este proyecto?")
    }

    present_discovered_context(table: property, detected_value, source)
    ask_user: confirm_context | override_settings
    persist: mem_save(discovered_context, topic: "frontend-architect/{project}/context", type: "config")
  }

  LifecycleManager {
    // Descubre tareas frontend sin hacer o en proceso del board de TechLead o local
    sync_tasks {
      mem_search("tech-lead/{project}/board") => load(board)
      or_fallback => scan(".ia/tech-lead/") => read_tasks
      
      frontend_tasks = board.tasks.filter(task => 
        task.assignedRole == "frontend" || task.skill == "frontend-architect"
      )
    }

    update_task_status(taskId, status: TaskStatus) {
      board.update(taskId, status: status)
      mem_save(board, topic: "tech-lead/{project}/board", type: "architecture", capture_prompt: false)
      save_files(outputDir/tasks-progress.md)
    }
  }

  ImplementStory {
    input: {
      storyId: string
      title: string
      description: string
      requirements: [string]
      autonomy: autonomyLevel | null
      options: {
        generateStorybook: boolean
        generateDocs: boolean
      }
    }

    execute {
      set_autonomy(input.autonomy |> default currentAutonomy)
      LifecycleManager.update_task_status(storyId, in_progress)
      
      // 1. Planificación e identificación de archivos a crear/modificar
      plan_files(input) => component_plan {
        components_to_create: [ComponentMetadata]
        files_to_modify: [path]
        external_dependencies: [library_name]
      }

      // Comprobar contratos API/Backend y coordinar si hay dependencias
      check_backend_dependencies(component_plan) {
        when missing_endpoints | mock_needed => {
          invoke_skill("backend-architect", query: "get_api_contracts_or_mocks")
          => fallback => generate_local_mocks(component_plan)
        }
      }

      // Puertas de decisión según la autonomía seleccionada
      when currentAutonomy == granular || currentAutonomy == story {
        present_plan(component_plan)
        ask_user: "Aprobar plan de componentes frontend antes de codificar"
        => approved => proceed
        => modified(feedback) => replan(feedback)
      }

      // 2. Codificación
      forEach(component in component_plan.components_to_create) {
        write_component_code(component) {
          apply_stack_conventions
          apply_secure_coding_practices
          when input.options.generateDocs => generate_documentation(component)
        }

        when currentAutonomy == granular {
          present_diff(component)
          ask_user: "¿Continuar con el siguiente componente o ajustar?"
        }

        // 3. Generación de Tests Unitarios (Delegación mandatoria)
        invoke_skill("unit-testing", input: {
          component_path: component.path,
          mode: "tdd",
          target_coverage: 80
        })

        // 4. Storybook (bajo petición)
        when input.options.generateStorybook => {
          generate_storybook_story(component)
        }
      }

      LifecycleManager.update_task_status(storyId, in_review)
      
      return_results {
        files_created: [path]
        files_modified: [path]
        test_results: unit_testing_results
        storybook_stories: [path]
      }
    }
  }

  Persist {
    engram_keys {
      "frontend-architect/{project}/context" => discovered_context + stack + rules
      "frontend-architect/{project}/state"   => current_execution_dashboard
      "frontend-architect/{project}/history" => history_of_implemented_stories
    }
    files {
      outputDir/context-summary.md => stack_and_architecture_guidelines
      outputDir/tasks-progress.md  => sync_status_of_frontend_tasks
    }
  }
}
```

## References

- `.agents/skills/tech-lead/SKILL.md` — origen de planes de tareas y tablero de sincronización.
- `.agents/skills/unit-testing/SKILL.md` — delegación mandatoria para la suite de tests unitarios del componente.
```
