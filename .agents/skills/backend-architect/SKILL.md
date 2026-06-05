---
name: backend-architect
description: "Trigger: backend architect, implementar backend, arquitectura backend, backend implementation. Diseña e implementa historias técnicas de backend y bases de datos, gestiona su ciclo de vida y coordina con testing y frontend."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "1.0"
---

```sudolang
BackendArchitect {
  Config {
    lang = detect_from_input |> default "es"
    outputDir = ".ia/backend-architect/"
    skillsRegistry = scan(".agents/skills/") + scan("~/.gemini/config/skills/")
    
    // Configuración por defecto del stack si no se detecta
    defaultStack {
      language = "JavaScript"
      runtime = "Node.js"
      framework = "Express"
      database = "PostgreSQL"
      orm = "Prisma"
    }

    // Arquitecturas soportadas
    architectures = [
      "Clean Architecture",
      "MVC",
      "Layered Architecture"
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

  DatabasePlanMetadata {
    type: "creation" | "migration" | "seed" | "none"
    engine: string
    ormOrTool: string
    filesToCreate: [string]
    description: string
    impactLevel: "low" | "medium" | "high"
  }

  BackendMetadata {
    layer: "domain" | "application" | "infrastructure" | "route" | "controller" | "repository" | "middleware"
    name: string
    path: string
    dependencies: [string]
    hasTests: boolean
    securityChecks: [string]
  }

  OnActivate {
    mem_search("backend-architect/{project}/state")
    found => {
      present_dashboard(state)
      ask: continue_from_next | update_state | start_fresh
    }
    not_found => begin ContextDiscovery
  }

  ContextDiscovery {
    // 1. Detección automática del stack y estructura
    scan(project) => find([
      package_json, tsconfig_json, package_lock_json,
      prisma_schema, env_example, docker_compose, src_directory
    ])
    => infer_stack_and_conventions {
      stack: detected_runtime_and_libraries
      architecturePattern: detect_dir_structure(src_directory)
    }

    // 2. Comprobar especificaciones de tech-lead o .ia/
    scan(".ia/") => find([PRDs, backlogs, tech_lead_plans, tasks])
    
    // 3. Fallbacks de resolución
    when stack_uncertain => {
      ask_caller_or_skill("tech-lead", query: "get_project_stack")
      => not_resolved => ask_user("¿Qué stack, base de datos y arquitectura usa este proyecto?")
    }

    present_discovered_context(table: property, detected_value, source)
    ask_user: confirm_context | override_settings
    persist: mem_save(discovered_context, topic: "backend-architect/{project}/context", type: "config")
  }

  AutodiscoverSkills {
    availableSkills = scan(skillsRegistry)
    
    // Identificar skills complementarias y priorizar seguridad
    testingSkill = availableSkills.find(s => s.name == "unit-testing" || s.name == "qa-engineer")
    diagramSkill = availableSkills.find(s => s.name == "diagram-generator")
    securitySkills = availableSkills.filter(s => s.description.contains("security") || s.description.contains("seguridad") || s.description.contains("rules"))
    
    log("Skills relacionadas autodescubiertas. Unit testing: " + testingSkill.name + ", Diagramas: " + diagramSkill.name + ", Seguridad: " + securitySkills.map(s => s.name).join(", "))
  }

  LifecycleManager {
    sync_tasks {
      mem_search("tech-lead/{project}/board") => load(board)
      or_fallback => scan(".ia/tech-lead/") => read_tasks
      
      backend_tasks = board.tasks.filter(task => 
        task.assignedRole == "backend" || task.skill == "backend-architect"
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
      securityRequirements: [string]
    }

    execute {
      set_autonomy(input.autonomy |> default currentAutonomy)
      LifecycleManager.update_task_status(storyId, in_progress)
      AutodiscoverSkills()
      
      // 1. Planificación técnica, base de datos y archivos
      plan_files(input) => backend_plan {
        db_plan: DatabasePlanMetadata
        files_to_create: [BackendMetadata]
        files_to_modify: [path]
        external_dependencies: [library_name]
      }

      // Puertas de decisión según la autonomía seleccionada
      when currentAutonomy == granular || currentAutonomy == story {
        present_plan(backend_plan)
        ask_user: "Aprobar plan técnico y de base de datos backend antes de codificar"
        => approved => proceed
        => modified(feedback) => replan(feedback)
      }

      // 2. Aplicar cambios de base de datos / migraciones
      when backend_plan.db_plan.type != "none" => {
        generate_database_migration_plan(backend_plan.db_plan)
        when currentAutonomy == granular {
          ask_user: "Aprobar migración de base de datos propuesta"
        }
        apply_database_migration(backend_plan.db_plan)
      }

      // 3. Generación y codificación de componentes/capas de backend
      forEach(file in backend_plan.files_to_create) {
        write_backend_code(file) {
          apply_stack_conventions
          apply_secure_coding_practices(input.securityRequirements)
        }

        when currentAutonomy == granular {
          present_diff(file)
          ask_user: "¿Continuar con el siguiente componente o ajustar?"
        }

        // 4. Generación de tests unitarios y de integración (Delegación a unit-testing)
        when testingSkill != null => {
          invoke_skill(testingSkill.name, input: {
            component_path: file.path,
            mode: "tdd",
            target_coverage: 80
          })
        }
      }

      LifecycleManager.update_task_status(storyId, in_review)
      
      return_results {
        files_created: [path]
        files_modified: [path]
        database_changes: backend_plan.db_plan.filesToCreate
        test_results: unit_testing_results
      }
    }
  }

  Persist {
    engram_keys {
      "backend-architect/{project}/context" => discovered_context + stack + rules
      "backend-architect/{project}/state"   => current_execution_dashboard
      "backend-architect/{project}/history" => history_of_implemented_stories
    }
    files {
      outputDir/context-summary.md => stack_and_architecture_guidelines
      outputDir/tasks-progress.md  => sync_status_of_backend_tasks
    }
  }
}
```

## References

- `.agents/skills/tech-lead/SKILL.md` — origen de planes de tareas y tablero de sincronización.
- `.agents/skills/unit-testing/SKILL.md` — delegación mandatoria para pruebas unitarias.
