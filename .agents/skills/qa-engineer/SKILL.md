---
name: qa-engineer
description: "Trigger: QA, quality assurance, tester, plan de QA, cobertura de tests, estrategia de testing, CI testing, mejora de tests. Orquesta unit-testing, e2e-testing y a11y-testing, genera plan de QA, configura CI/CD y produce reportes consolidados de calidad."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "1.0"
---

```sudolang
QAEngineer {
  Config {
    lang = detect_from_input |> default "es"
    inputSources = [".ia/", caller_context, natural_language_description]
    skillsRegistry = scan(".agents/skills/") + scan("~/.gemini/config/skills/")
    // Skills de testing base conocidas + auto-descubrimiento de nuevas
    knownTestingSkills = [
      { name: "unit-testing",  path: ".agents/skills/unit-testing/SKILL.md",  type: unit },
      { name: "e2e-testing",   path: ".agents/skills/e2e-testing/SKILL.md",   type: e2e  },
      { name: "a11y-testing",  path: ".agents/skills/a11y-testing/SKILL.md",  type: a11y }
    ]
    ciPlatform = detect_from_project |> ask_user  // GitHub Actions | GitLab CI
  }

  // =============================================
  // MODOS DE OPERACIÓN
  // =============================================
  OperationMode = enum {
    full_pipeline  // QA Plan → Setup → Generate → Execute → Report
    plan_only      // QA Plan + Setup
    implement_only // Generar / mejorar tests
    analyze_only   // Gap analysis + reporte de lo existente
  }

  // Estado de cada fase del pipeline
  PhaseStatus = enum {
    skipped    // Ya completado o no aplica — se detecta automáticamente
    pending    // Por hacer
    in_progress
    done
  }

  PipelineState {
    qa_plan:      PhaseStatus
    env_setup:    PhaseStatus
    unit_tests:   PhaseStatus
    e2e_tests:    PhaseStatus
    a11y_tests:   PhaseStatus
    ci_config:    PhaseStatus
    report:       PhaseStatus
  }

  OnActivate {
    // Recuperar estado previo si existe
    mem_search("qa-engineer/{project}/state")
    found => {
      present_pipeline_dashboard(state)
      ask: continue_from_next_pending | restart_phase | start_fresh
    }
    not_found => begin ContextDiscovery
  }

  // =============================================
  // DESCUBRIMIENTO DE CONTEXTO
  // Prioridad: caller → .ia/ → usuario
  // =============================================
  ContextDiscovery {
    // 1. El caller (tech-lead u otro agente) puede pasar contexto directamente
    when caller_provides(context) => {
      extract(
        task_metadata: [TaskMetadata],  // viene de tech-lead
        stack, scope, flows, components,
        existing_tests, ci_platform
      )
      => SkillDiscovery
    }

    // 2. Analizar `.ia/` de forma autónoma
    when not_provided => scan(inputSources) => find([
      PRDs, backlogs, user_stories, ADRs,
      tech_stack_docs, package_json, existing_test_files,
      existing_ci_config, component_inventory,
      any_doc_relevant_to_testing
    ])
    found => {
      infer(
        stack, framework, test_coverage_existing,
        features_to_test, user_flows, components_list,
        ci_platform_in_use
      )
      summarize_found_context(table: source, type, relevance_to_testing)
      present(context_summary)
      ask_user: confirm_sources | add_more | adjust
    }
    not_found => ask_user(
      message: "No encontré documentación en `.ia/` ni recibí contexto del caller. ¿Cómo quieres proceder?",
      options: [
        "Descríbeme qué quieres testear (en lenguaje natural)",
        "Dame la ruta de la documentación del proyecto",
        "Quiero que analice el código fuente directamente"
      ]
    )
    persist: mem_save(context, topic: "qa-engineer/{project}/context", type: "architecture")
  }

  // =============================================
  // AUTO-DESCUBRIMIENTO DE SKILLS DE TESTING
  // =============================================
  SkillDiscovery {
    // Base conocida + escaneo para skills nuevas añadidas en el futuro
    load(knownTestingSkills)
    scan(skillsRegistry) => find_additional_testing_skills {
      filter: description contains ["test", "testing", "qa", "spec", "assert", "coverage"]
      exclude: already_in(knownTestingSkills)
      if_found => add_to_active_skills(with: type_inferred_from_description)
    }
    present(active_skills_table: name, type, path, capabilities_summary)
    persist: mem_save(active_skills, topic: "qa-engineer/{project}/skills", type: "architecture")
  }

  // =============================================
  // SELECCIÓN DE MODO DE OPERACIÓN
  // =============================================
  ModeSelection {
    resolve_mode {
      when caller_provides(mode) => use(caller_mode)
      when user_says("plan" | "estrategia") => plan_only
      when user_says("implementa" | "genera" | "mejora") => implement_only
      when user_says("analiza" | "gap" | "revisión") => analyze_only
      when user_says("todo" | "pipeline completo") => full_pipeline
      default => ask_user(
        message: "¿En qué modo quieres trabajar?",
        options: [
          "Pipeline completo: Plan → Setup → Tests → CI → Reporte",
          "Solo planificación y setup del entorno",
          "Solo generar o mejorar tests existentes",
          "Solo analizar gaps y estado actual"
        ]
      )
    }
    => resolve_execution_strategy {
      when caller_provides(execution: sequential | parallel) => use(caller_strategy)
      else => ask_user(
        message: "¿Cómo quieres que se ejecuten las skills de testing?",
        options: [
          "Secuencialmente (unit → E2E → a11y) — más predecible",
          "En paralelo cuando no haya dependencias — más rápido"
        ]
      )
    }
  }

  // =============================================
  // FASE 1: QA PLAN
  // Se salta si ya existe en .ia/ o en Engram
  // =============================================
  QAPlan {
    check_existing {
      mem_search("qa-engineer/{project}/qa-plan")
      when found && not_outdated => {
        present_existing_plan_summary
        ask: use_existing | update | regenerate
        when use_existing => mark(qa_plan: skipped) => next_phase
      }
      when not_found => generate_fresh
    }

    generate_fresh {
      analyze(context: stack + features + flows + components + existing_tests)
      generate_plan {
        testing_strategy {
          unit_coverage_target: percentage  // e.g. 80%
          e2e_critical_flows:   [flow_id]
          a11y_standards:       [WCAG_2_1_AA, WCAG_2_2_AA]
          risk_areas:           [component | flow | module] // prioridad por criticidad
        }
        testing_pyramid {
          unit:  percentage_of_total_tests
          e2e:   percentage_of_total_tests
          a11y:  scope_summary
        }
        definition_of_done_qa {
          // Criterios que deben cumplirse antes de considerar una tarea "done" desde QA
          unit_tests_passing: true
          unit_coverage_meets_target: true
          e2e_critical_paths_green: true
          a11y_no_critical_violations: true
          a11y_no_serious_violations: true
          manual_checklist_reviewed: when_applicable
        }
        execution_order(skills: active_skills, by: dependency | risk_priority)
        effort_estimate(table: skill, scope, estimated_effort)
      }
      present(qa_plan, sections: [strategy, pyramid, dod, execution_order, effort])
      await_feedback {
        ✅ approve => persist_plan => mark(qa_plan: done) => EnvSetup
        ✏️  modify => incorporate => re_present
        ❌ reject => ask("¿Qué necesitas cambiar en la estrategia?") => regenerate
      }
      mem_save(qa_plan, topic: "qa-engineer/{project}/qa-plan", type: "architecture")
    }
  }

  // =============================================
  // FASE 2: SETUP DEL ENTORNO DE TESTING
  // Se salta si el entorno ya está configurado
  // =============================================
  EnvSetup {
    check_existing {
      scan(project) => find([
        package_json(devDependencies: testing_frameworks),
        existing_test_config_files,
        ci_config_file
      ])
      when fully_configured => {
        present_env_summary(what_is_already_set_up)
        mark(env_setup: skipped)
        => TestingPhases
      }
      when partially_configured => {
        present_gaps_in_setup
        ask: fill_gaps_only | full_setup
      }
      when not_configured => generate_full_setup
    }

    generate_full_setup {
      // Stack de testing recomendado basado en el proyecto
      propose_stack {
        infer_from(context.stack) => recommend {
          unit_framework:  vitest | jest | pytest | junit5 | ...
          e2e_framework:   playwright | cypress | ...
          a11y_tool:       "@axe-core/playwright" | "cypress-axe" | "jest-axe" | pa11y
          coverage_tool:   v8 | istanbul | pytest-cov | jacoco
          report_format:   html + json + terminal
        }
        present(proposed_stack, table: purpose, tool, version_recommended, rationale)
        await_feedback {
          ✅ approve => generate_install_guide
          ✏️  adjust => incorporate => re_present
        }
      }

      generate_install_guide {
        // Instrucciones de instalación paso a paso
        steps: [
          install_commands(package_manager: npm | yarn | pnpm | pip | mvn | gradle),
          config_files_to_create: [path, content_summary],
          scripts_to_add_to_package_json | build_tool,
          env_vars_needed: [name, description, example_value]
        ]
        present(install_guide, format: step_by_step_with_commands)
      }

      // Configuración de CI/CD
      CIConfig {
        detect_platform {
          scan([".github/workflows/", ".gitlab-ci.yml", "Jenkinsfile", "azure-pipelines.yml"])
          found => ci_platform = detected_platform
          not_found => ask_user("¿Qué plataforma de CI/CD usas? (GitHub Actions, GitLab CI, otra...)")
        }

        generate(ci_config_file) {
          "github_actions" => ".github/workflows/testing.yml" {
            name: "Testing Suite"
            on: [push, pull_request]
            jobs: {
              unit_tests: {
                runs-on: ubuntu-latest
                steps: [checkout, setup_node | python | java, install, run_unit_tests, upload_coverage]
              }
              e2e_tests: {
                runs-on: ubuntu-latest
                needs: [unit_tests]  // secuencial por defecto
                steps: [checkout, setup, install_playwright | cypress, start_dev_server, run_e2e]
              }
              a11y_tests: {
                runs-on: ubuntu-latest
                needs: [e2e_tests]
                steps: [checkout, setup, install_a11y_tool, run_a11y_audit]
              }
            }
            // Ajustar a paralelo si el caller lo solicitó
            when execution_strategy == parallel => remove(needs_dependencies)
          }
          "gitlab_ci" => ".gitlab-ci.yml" {
            stages: [unit, e2e, a11y]
            // jobs equivalentes adaptados a GitLab syntax
          }
          other => generate_generic_script(ci_platform) | ask_user
        }

        present(ci_config, path: suggested_path)
        await_feedback {
          ✅ approve => save_ci_config
          ✏️  modify => incorporate => re_present
        }
        persist: mem_save(ci_config_path, topic: "qa-engineer/{project}/ci-config", type: "config")
      }

      mark(env_setup: done)
    }
  }

  // =============================================
  // FASE 3: GENERACIÓN / MEJORA DE TESTS
  // Delega a las skills especializadas
  // =============================================
  TestingPhases {
    // Determinar qué fases aplican según contexto
    resolve_applicable_skills {
      forEach(skill in active_skills) {
        applies(skill) {
          unit_testing  => context.has_functions_or_modules
          e2e_testing   => context.has_user_flows || context.has_pages
          a11y_testing  => context.has_ui_components || context.has_web_pages
        }
        when not_applicable => mark(skill.phase: skipped, reason: "No aplica al contexto")
      }
    }

    // Construir el contexto enriquecido que se pasa a cada skill
    BuildSkillContext(skill) {
      base_context = {
        stack:           context.stack,
        project:         project_name,
        inputSources:    [".ia/", found_docs]
      }
      skill_specific {
        unit_testing => {
          ...base_context,
          mode:          caller_provided | "tdd",
          target_scope:  context.functions_or_modules,
          coverage_target: qa_plan.testing_strategy.unit_coverage_target
        }
        e2e_testing => {
          ...base_context,
          framework:     env_setup.e2e_framework,
          flow_descriptions: context.user_flows,
          target_env:    caller_provided | "local",
          mock_paths:    context.mock_paths | scan_for_mocks
        }
        a11y_testing => {
          ...base_context,
          tool:          env_setup.a11y_tool,
          standards:     qa_plan.testing_strategy.a11y_standards,
          scope:         context.ui_scope,  // full_page | component | user_flow
          report_level:  "balanced"
        }
      }
    }

    ExecuteSkills {
      // Verificar si cada fase ya está cubierta antes de invocar
      forEach(skill in applicable_skills) {
        check_existing_coverage(skill) {
          scan(project) => find(existing_tests_for_skill_type)
          when fully_covered => {
            present("✅ {skill.name}: ya tiene cobertura adecuada.")
            ask: review_and_improve | keep_as_is | gap_analysis_only
            when keep_as_is => mark(skill.phase: skipped) => continue
          }
          when partially_covered => {
            present("⚠️ {skill.name}: cobertura parcial. Áreas sin tests: {gaps}")
            ask: fill_gaps | improve_existing | skip
          }
          when not_covered => {
            present("❌ {skill.name}: sin cobertura. Generando tests desde cero.")
            => invoke_skill(skill)
          }
        }

        invoke_skill(skill) {
          skill_context = BuildSkillContext(skill)
          invoke(skill.path, input: skill_context)
          => collect_result {
               test_files:    result.test_files
               run_command:   result.run_command
               status:        result.status
               skill_summary: result.summary
               // a11y específico:
               release_gate:  result.release_gate | null
             }
          track_progress(skill.phase: done | failed)
          persist: mem_save(skill_result, topic: "qa-engineer/{project}/{skill.name}/result", type: "architecture", capture_prompt: false)
        }
      }
    }
  }

  // =============================================
  // MEJORA DE TESTS EXISTENTES
  // =============================================
  ImproveExistingTests {
    trigger: user says "mejora" | "refactoriza tests" | "revisa calidad de tests"
             | caller_invokes(improve: true) | implement_only mode

    forEach(skill in applicable_skills) {
      invoke(skill.path, input: { ...BuildSkillContext(skill), improve: true })
      => collect_improvement_result(skill)
    }
    => ConsolidatedReport(mode: improvements_only)
  }

  // =============================================
  // GAP ANALYSIS GLOBAL
  // =============================================
  GlobalGapAnalysis {
    trigger: user says "gap analysis" | "qué falta testear" | analyze_only mode
             | caller_invokes(gap_analysis: true)

    forEach(skill in applicable_skills) {
      invoke(skill.path, input: { ...BuildSkillContext(skill), gap_analysis: true })
      => collect_gap_result(skill) {
           gaps: [{ target, type, priority, skill_type }]
         }
    }

    merge_gaps(all_skill_gaps) => unified_gap_report {
      table(
        target, type, priority: critical | high | medium | low,
        missing_coverage: [unit | e2e | a11y],
        effort_estimate,
        recommended_action
      )
      risk_summary: critical_paths_with_zero_coverage
      recommended_priority_order: sorted_by(priority + effort)
    }
    present(unified_gap_report)
    await_feedback {
      ✅ approve_all    => TestingPhases(scope: gaps_only)
      ✏️  select(subset) => TestingPhases(scope: selected_gaps)
      ❌ save_only       => persist_gap_report
    }
    mem_save(gap_report, topic: "qa-engineer/{project}/gaps", type: "architecture")
  }

  // =============================================
  // REPORTE CONSOLIDADO DE CALIDAD
  // Solo resumen ejecutivo — detalles en cada skill
  // =============================================
  ConsolidatedReport {
    trigger: all_phases_done | user says "reporte" | "informe de calidad" | caller_invokes(report: true)

    collect_all_results {
      unit_result   = mem_search("qa-engineer/{project}/unit-testing/result")
      e2e_result    = mem_search("qa-engineer/{project}/e2e-testing/result")
      a11y_result   = mem_search("qa-engineer/{project}/a11y-testing/result")
    }

    generate_executive_summary {
      // Resumen ejecutivo — una vista, no duplicar detalles de cada skill
      header: "📊 QA Report — {project} — {date}"

      overall_status: pass | blocked | partial {
        blocked_if: any(release_gate == blocked) || any(critical_unit_failures)
      }

      quality_scorecard {
        table(
          dimension,         status,        detail
          "Unit Tests",      pass|fail,     "{passed}/{total} tests, {coverage}% coverage"
          "E2E Tests",       pass|fail,     "{passed}/{total} scenarios, {critical_flows_green} critical flows"
          "Accessibility",   pass|fail|blocked, "{violations.critical} critical, {violations.serious} serious violations"
          "CI/CD",           configured|missing, "{ci_platform} | {ci_file_path}"
        )
      }

      dod_checklist {
        // Definition of Done desde perspectiva de QA
        forEach(criterion in qa_plan.definition_of_done_qa) {
          "[ criterion ]": met | not_met | not_applicable
        }
        overall: all_met | pending_items([list])
      }

      risks_and_blockers {
        release_blockers: [{ skill, reason, severity }]
        warnings:         [{ skill, reason }]
        recommendations:  [{ action, priority, effort_estimate }]
      }

      next_steps {
        immediate:   [actions_to_unblock_release]
        short_term:  [improvements_recommended]
        long_term:   [strategic_testing_improvements]
      }

      links_to_detail_reports {
        unit:  "Ver detalles: invoke unit-testing CollectResults"
        e2e:   "Ver detalles: invoke e2e-testing CollectResults"
        a11y:  "Ver detalles: invoke a11y-testing CollectResults"
      }
    }
    present(executive_summary)
    mem_save(report, topic: "qa-engineer/{project}/report", type: "architecture", capture_prompt: false)
  }

  // =============================================
  // TRADUCCIÓN DESDE TECH-LEAD
  // Convierte TaskMetadata del tech-lead en invocaciones de testing
  // =============================================
  TranslateTechLeadPlan {
    trigger: caller_provides(task_metadata: [TaskMetadata]) | caller == "tech-lead"

    forEach(task in task_metadata) {
      when task.assignedRole == "qa" || task.skill == "qa-engineer" {
        classify_task(task) {
          task.techTags contains ["unit", "test", "spec"] => unit_scope
          task.techTags contains ["e2e", "flow", "scenario"] => e2e_scope
          task.techTags contains ["a11y", "accessibility", "wcag"] => a11y_scope
          task.description contains ["cobertura", "coverage"] => global_gap_analysis
          default => infer_from(task.description)
        }
        build_skill_input(task, classified_scope) => invoke_applicable_skills
      }
    }
  }

  // =============================================
  // DASHBOARD DE ESTADO DEL PIPELINE
  // =============================================
  PipelineDashboard {
    trigger: user says "estado|status|progreso|dashboard QA"
    display {
      pipeline_progress {
        table(
          phase, status: ✅skipped | ⏳pending | 🔄in_progress | ✔️done | ❌failed,
          skill_invoked, result_summary
        )
        overall_completion: percentage
      }
      quality_scorecard(if_results_available)
      next_pending_phase: label + recommended_action
      release_gate: pass | blocked(reasons)
    }
  }

  // =============================================
  // CONTRATO PARA INVOCACIÓN DESDE OTROS SKILLS
  // =============================================
  AgentContract {
    OnInvoke(caller_input) {
      required_fields: [scope | task_metadata | description]
      optional_fields: [
        mode: full_pipeline | plan_only | implement_only | analyze_only,
        execution_strategy: sequential | parallel,
        stack, ci_platform,
        skills_to_invoke: [unit | e2e | a11y],
        report_level: strict | balanced | exhaustive
      ]

      when caller_provides(task_metadata) => TranslateTechLeadPlan
      when mode == analyze_only           => GlobalGapAnalysis => ConsolidatedReport
      when mode == plan_only              => QAPlan => EnvSetup
      when mode == implement_only         => TestingPhases => ConsolidatedReport
      default                             => full_pipeline

      return {
        qa_plan_path:      path | null
        ci_config_path:    path | null
        test_files:        { unit: [path], e2e: [path], a11y: [path] }
        gap_report:        path | null
        executive_summary: string
        overall_status:    pass | blocked | partial
        release_gate:      pass | blocked
        dod_met:           boolean
        next_steps:        [string]
      }
    }
  }

  Persist {
    engram_keys {
      "qa-engineer/{project}/context"          => project_context + stack + docs_found
      "qa-engineer/{project}/skills"           => active_testing_skills_index
      "qa-engineer/{project}/qa-plan"          => testing_strategy + dod + execution_order
      "qa-engineer/{project}/ci-config"        => ci_config_path + platform
      "qa-engineer/{project}/unit-testing/result"   => unit_skill_result
      "qa-engineer/{project}/e2e-testing/result"    => e2e_skill_result
      "qa-engineer/{project}/a11y-testing/result"   => a11y_skill_result
      "qa-engineer/{project}/gaps"             => unified_gap_report
      "qa-engineer/{project}/report"           => executive_summary_last_run
      "qa-engineer/{project}/state"            => pipeline_state + phase_statuses
    }
    // Ningún archivo de test se guarda en .ia/ — quedan co-locados en el proyecto
    // Solo reportes y plan de QA pueden guardarse en .ia/qa-engineer/ a petición explícita
  }
}
```

## References

- `.ia/` — fuente de verdad: PRD, backlog, user stories, stack, flows, mocks
- `.agents/skills/unit-testing/SKILL.md` — skill subordinada: tests unitarios y TDD
- `.agents/skills/e2e-testing/SKILL.md` — skill subordinada: tests E2E de flujos de usuario
- `.agents/skills/a11y-testing/SKILL.md` — skill subordinada: auditoría WCAG y accesibilidad
- `.agents/skills/tech-lead/SKILL.md` — caller principal: pasa TaskMetadata para traducción a testing
