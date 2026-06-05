---
name: a11y-testing
description: "Trigger: accesibilidad, a11y, WCAG, accessibility testing, contraste, ARIA, teclado, lector de pantalla, auditoría accesibilidad. Genera tests de accesibilidad WCAG 2.1/2.2, audita violaciones, propone fixes y produce reportes priorizados."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "1.0"
---

```sudolang
A11yTesting {
  Config {
    lang = detect_from_input |> default "es"
    inputSources = [".ia/", caller_context, natural_language_description]
    standards = [WCAG_2_1_AA, WCAG_2_1_AAA, WCAG_2_2_AA]  // todos activos por defecto
    toolInfo = caller_provided | infer_from_stack | ask_user
    reportLevel = caller_provided |> default "violations+warnings"  // configurable por invocación
    integrationMode = integrated_with_e2e | standalone              // auto-detectado
  }

  // Severidad según axe-core + WCAG impact
  ViolationSeverity = enum {
    critical  // Bloquea release — WCAG falla, usuarios excluidos completamente
    serious   // Debe corregirse antes del release — impacto alto en AT users
    moderate  // Mejora recomendada — degradación significativa de experiencia
    minor     // Sugerencia — buenas prácticas, impacto bajo
  }

  ReportLevel = enum {
    strict      // Solo violations (critical + serious)
    balanced    // violations + warnings (critical + serious + moderate)
    exhaustive  // Todo incluyendo suggestions (minor)
  }

  AuditScope = enum {
    full_page    // URL completa
    component    // Elemento aislado (selector CSS / componente)
    user_flow    // Secuencia de pasos (integración con E2E)
  }

  ViolationMetadata {
    id: string                       // A11Y-{page|component}-{seq}
    wcag_criterion: string           // e.g. "1.4.3 Contrast (Minimum)"
    wcag_level: AA | AAA
    wcag_version: "2.1" | "2.2"
    category: contrast | keyboard | aria | images | forms | structure | motion | targets
    severity: ViolationSeverity
    description: string              // Qué falla y por qué
    element: css_selector | xpath    // Elemento afectado
    fix_suggestion: string           // Fix concreto y accionable
    automatable: boolean             // ¿Verificable automáticamente?
    manual_check_required: boolean   // Criterios que axe no puede detectar
  }

  AuditMetadata {
    id: string                       // AUD-{scope}-{seq}
    scope: AuditScope
    target: url | selector | flow_id
    tool: string                     // axe | lighthouse | pa11y | jest-axe | cypress-axe
    standards: [string]
    report_level: ReportLevel
    testFile: path | null            // Si genera test ejecutable
    status: pending | passing | failing | partial
    violations: [ViolationMetadata]
    manual_checklist: [ChecklistItem] | null
  }

  ChecklistItem {
    criterion: string                // WCAG criterion
    description: string              // Qué verificar manualmente
    why_not_automatable: string
    verified: boolean | null         // null = pendiente
  }

  OnActivate {
    mem_search("a11y-testing/{project}/state")
    found => present_summary => ask: continue | update | start_fresh
    not_found => begin ContextDiscovery
  }

  // =============================================
  // DESCUBRIMIENTO DE CONTEXTO
  // Prioridad: caller → .ia/ → usuario
  // =============================================
  ContextDiscovery {
    // 1. El caller (skill/agente) puede proveer todo directamente
    when caller_provides(context) => {
      extract(stack, framework, scope, target_pages | target_components | flow_ref)
      => ToolResolution
    }

    // 2. Buscar en documentación .ia/
    when not_provided => scan(inputSources) => find([
      tech_stack_docs, package_json(devDependencies),
      playwright_config, cypress_config,
      PRDs, user_stories, component_inventory,
      any_tech_doc_in_ia
    ])
    found => infer(stack, e2e_framework_if_any, ui_type: web_app | component_library | both)
    not_found => ask_user(
      message: "No encontré información del stack ni del scope. Necesito saber:",
      questions: [
        "¿Qué tecnología/framework de UI usas? (React, Vue, Angular, HTML vanilla...)",
        "¿Ya tienes tests E2E con Playwright o Cypress?",
        "¿Qué quieres auditar? (páginas específicas, componentes, flujos de usuario)"
      ]
    )
    persist: mem_save(context, topic: "a11y-testing/{project}/context", type: "architecture")
  }

  // =============================================
  // RESOLUCIÓN DE HERRAMIENTA
  // Prioridad: stack → caller → lista de opciones
  // =============================================
  ToolResolution {
    resolve_tool {
      // Si hay E2E con Playwright => integrar axe-core/playwright
      when e2e_framework == "playwright" && integration_mode == integrated
        => tool = "@axe-core/playwright"
           runner = "npx playwright test"
           integration_type = "inline assertions in existing E2E tests"

      // Si hay E2E con Cypress => cypress-axe
      when e2e_framework == "cypress" && integration_mode == integrated
        => tool = "cypress-axe"
           runner = "npx cypress run"
           integration_type = "cy.checkA11y() in existing E2E tests"

      // Tests de componentes (React, Vue, etc.) => jest-axe
      when ui_type == "component_library" | scope == "component"
        => tool = "jest-axe" | "vitest + axe-core"
           runner = "npx jest --testPathPattern=a11y" | "npx vitest run"
           integration_type = "standalone component a11y tests"

      // Sin E2E o scope = full_page => Pa11y o axe-cli
      when no_e2e_framework || scope == "full_page"
        => tool = "pa11y" | "axe-cli"
           runner = "npx pa11y {url}" | "npx axe {url}"
           integration_type = "standalone page audit"

      // Auditoría general + métricas => Lighthouse
      when scope == "full_page" && user_wants_metrics
        => tool = "lighthouse"
           runner = "npx lighthouse {url} --output json"
           integration_type = "full-page audit with performance metrics"

      // Fallback: presentar opciones
      not_resolved => present_tool_options([
        { tool: "@axe-core/playwright", best_for: "integración con Playwright E2E" },
        { tool: "cypress-axe",          best_for: "integración con Cypress E2E" },
        { tool: "jest-axe",             best_for: "tests de componentes aislados" },
        { tool: "pa11y",                best_for: "auditoría de páginas desde CLI/CI" },
        { tool: "lighthouse",           best_for: "auditoría completa + métricas" }
      ])
      ask_user: select_tool
    }
    persist: mem_save(tool_config, topic: "a11y-testing/{project}/tool", type: "config")
  }

  // =============================================
  // CATEGORÍAS WCAG AUDITADAS
  // =============================================
  WCAGCategories {
    active_categories = [
      contrast,    // 1.4.3 AA, 1.4.6 AAA, 1.4.11 Non-text Contrast (2.1)
      keyboard,    // 2.1.1 Keyboard, 2.1.2 No Keyboard Trap, 2.4.3 Focus Order, 2.4.7 Focus Visible
      aria,        // 4.1.2 Name/Role/Value, 4.1.3 Status Messages, live regions
      images,      // 1.1.1 Non-text Content (alt text, decorative images)
      forms,       // 1.3.1 Info and Relationships, 3.3.1 Error Identification, 3.3.2 Labels
      structure,   // 1.3.1 headings/landmarks, 2.4.6 Headings and Labels
      motion       // 2.3.3 Animation from Interactions (AAA), prefers-reduced-motion
    ]
    // El usuario o caller pueden añadir categorías adicionales
    extend_if_needed {
      when caller_provides(extra_categories) => add(extra_categories)
      when user_requests(additional_criteria) => add(additional_criteria)
    }
    non_automatable = [
      "1.2.x Captions / Audio Descriptions (video/audio content)",
      "1.4.2 Audio Control",
      "2.4.2 Page Titled (content quality)",
      "2.4.5 Multiple Ways",
      "3.1.x Language of Page/Parts",
      "3.2.4 Consistent Identification",
      "3.3.4 Error Prevention (legal, financial)"
    ]
  }

  // =============================================
  // GAP ANALYSIS DE COBERTURA A11Y
  // =============================================
  GapAnalysis {
    trigger: user asks "gap a11y" | "qué falta auditar" | "cobertura accesibilidad" | caller_invokes(gap_analysis: true)

    flow:
      ContextDiscovery
      => scan(inputSources) => find([pages_list, component_inventory, e2e_test_files])
      => cross_reference(existing_a11y_tests | axe_assertions_in_e2e)
      => identify_gaps {
           pages_without_a11y_audit: [url]
           components_without_a11y_test: [component_name]
           flows_without_a11y_assertions: [flow_id]
           categories_not_covered: [WCAGCategory]
         }
      => generate_gap_report {
           table(target, type, a11y_coverage: covered | partial | missing, priority, wcag_categories_missing)
           highlight: critical_paths_without_a11y
           risk_summary: "Criterios WCAG sin cobertura automática"
         }
      => present(gap_report)
      => await_feedback {
           ✅ approve => generate_tests_for_gaps => AuditCycle
           ✏️  adjust(scope) => re_analyze
           ❌ save_only => mem_save(gap_report, ...) => done
         }
      => mem_save(gap_report, topic: "a11y-testing/{project}/gaps", type: "architecture")
  }

  // =============================================
  // CICLO PRINCIPAL DE AUDITORÍA
  // =============================================
  AuditCycle {
    trigger: default | user says "audita" | "genera tests a11y" | caller_invokes

    // PASO 1: Definir scope de auditoría
    ScopeDefinition {
      resolve_scope {
        when caller_provides(scope: full_page | component | user_flow) => use(scope)
        when not_provided => ask_user(
          message: "¿Qué quieres auditar?",
          options: [
            "Una página completa (dame la URL o ruta de la página)",
            "Un componente específico (dame el nombre o selector)",
            "Un flujo de usuario completo (como en los tests E2E)"
          ]
        )
      }

      resolve_report_level {
        when caller_provides(report_level) => use(caller_report_level)
        when not_provided => use(Config.reportLevel)  // default: balanced
      }
    }

    // PASO 2: Generar configuración de la herramienta
    ConfigGeneration {
      trigger: first_time_setup | tool_not_configured | caller_invokes(config: true)

      check_existing_config => {
        found => present(existing_config) => ask: update | keep_as_is
        not_found => generate_from_scratch
      }

      generate(tool_config_file) {
        "@axe-core/playwright" => axe_config_in_playwright_fixture {
          // Fixture compartido que inyecta axe en todos los tests o en los seleccionados
          rules: build_from(standards: Config.standards) {
            wcag2a: true
            wcag2aa: true
            wcag21aa: true
            wcag22aa: true
          }
          reporter: "v2"
          // Integrar en playwright.config.ts existente o crear nuevo
        }
        "cypress-axe" => cypress_support_config {
          // commands.js: cy.injectAxe() + cy.checkA11y()
          rules: build_from(Config.standards)
        }
        "jest-axe" => jest_setup_config {
          toHaveNoViolations matcher
          axe_config: { rules: build_from(Config.standards) }
        }
        "pa11y" => pa11y_config_json {
          standard: "WCAG2AA"  // o WCAG2AAA según Config.standards
          runners: ["axe", "htmlcs"]
          ignore: []  // nada ignorado por defecto — explícito si se necesita
        }
        "lighthouse" => lighthouse_config_json {
          settings: { onlyCategories: ["accessibility"] }
          // thresholds configurables
        }
      }

      present(config_file, path: suggested_path)
      await_feedback {
        ✅ approve => save_config
        ✏️  modify => incorporate => re_present
      }
      persist: mem_save(config_path, topic: "a11y-testing/{project}/config", type: "config")
    }

    // PASO 3: Generar tests
    TestGeneration {
      forEach(target in audit_scope) {
        mode = detect_integration_mode(target) {
          flow_ref && e2e_tests_exist => integrated_with_e2e
          component | page_without_e2e => standalone
        }

        when mode == integrated_with_e2e => {
          // Inyectar aserciones axe en los tests E2E existentes
          locate_e2e_test(target.flow_ref)
          generate_axe_assertions {
            "@axe-core/playwright" => {
              // Añadir al test existente:
              "import { checkA11y } from '@axe-core/playwright'"
              "await checkA11y(page, null, axeConfig)"
              // Colocar después de cada acción significativa del usuario
              placement: after_navigation + after_modal_open + after_form_submit
            }
            "cypress-axe" => {
              "cy.injectAxe()"
              "cy.checkA11y(null, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa','wcag22aa'] } })"
            }
          }
          generate_patch(e2e_test_file, a11y_assertions)
          present(patch, format: diff_view)
        }

        when mode == standalone => {
          // Generar archivo de test independiente
          generate_test_file {
            "jest-axe" => {
              structure: {
                render_component(target.selector | target.component)
                axe_result = await axe(container)
                expect(axe_result).toHaveNoViolations()
                // Añadir tests específicos por categoría
              }
              forEach(category in WCAGCategories.active_categories) {
                generate_targeted_assertion(category, target)
              }
            }
            "pa11y" | "axe-cli" => {
              generate_test_script(target.url | target.selector) {
                run_command: runner_command + " " + target
                parse_output: => violations
              }
            }
          }
          present(generated_test, path: suggested_test_file_path)
        }
      }

      await_feedback {
        ✅ approve => instruct_run
        ✏️  modify(test) => incorporate => re_present
        ❌ reject(test) => ask("¿Qué cambios necesitas?") => regenerate
      }
      mem_save(audit_metadata_list, topic: "a11y-testing/{project}/audits", type: "architecture")
    }

    // PASO 4: Generar checklist manual para criterios no automatizables
    ManualChecklist {
      trigger: always_after_TestGeneration | caller_invokes(manual: true)

      filter(WCAGCategories.non_automatable, by: relevant_to_scope) => generate_checklist {
        forEach(criterion in non_automatable_relevant) {
          ChecklistItem {
            criterion: criterion.id + " " + criterion.title
            description: specific_verification_steps_for_this_project
            why_not_automatable: brief_explanation
            verified: null
          }
        }
      }
      present(checklist, format: markdown_table_with_checkboxes)
      note: "⚠️ Estos criterios WCAG no son verificables automáticamente. Requieren revisión humana o pruebas con tecnología asistiva (NVDA, VoiceOver, JAWS)."
      mem_save(checklist, topic: "a11y-testing/{project}/manual-checklist", type: "architecture")
    }
  }

  // =============================================
  // ANÁLISIS Y FIXES DE VIOLACIONES
  // =============================================
  ViolationAnalysis {
    trigger: user_provides(execution_output) | caller_provides(violations_json)
             | user says "analiza las violaciones" | "propón fixes"

    parse_violations(tool_output) {
      "@axe-core/playwright" | "cypress-axe" | "jest-axe"
        => parse_axe_json(violations: [{ id, impact, description, nodes: [{ html, target }] }])
      "pa11y"
        => parse_pa11y_json(issues: [{ code, message, context, selector }])
      "lighthouse"
        => parse_lighthouse_json(audits: [{ id, title, description, items }])
    }

    classify_violations {
      forEach(violation) {
        map_to_wcag(violation) => ViolationMetadata {
          wcag_criterion: lookup_criterion(violation.id | violation.code)
          wcag_level: determine_level(criterion)
          wcag_version: determine_version(criterion)
          category: classify_category(criterion)
          severity: map_impact_to_severity(violation.impact) {
            "critical" | "serious" => ViolationSeverity.critical | .serious
            "moderate"             => ViolationSeverity.moderate
            "minor"                => ViolationSeverity.minor
          }
          element: violation.nodes[0].target | violation.selector
          automatable: true
        }
        generate_fix(violation) => fix_suggestion {
          contrast       => "Ajusta el color de {element} de {current_ratio} a mínimo 4.5:1 (AA) o 7:1 (AAA). Valor sugerido: {hex_suggestion}"
          keyboard       => "Añade tabindex='0' y maneja keydown/keyup en {element}. Asegura outline visible: outline: 2px solid #005FCC"
          aria           => "Añade aria-label='{descriptive_label}' a {element} | Corrige role='{correct_role}'"
          images         => "Añade alt='{descriptive_text}' a {img_element}. Si es decorativa: alt=''"
          forms          => "Asocia <label for='{input_id}'> a {input_element} | Añade aria-describedby para mensajes de error"
          structure      => "Reorganiza encabezados: {current_structure} → {correct_hierarchy}"
          motion         => "@media (prefers-reduced-motion: reduce) { animation: none }"
          default        => specific_fix_based_on_violation_description
        }
      }
    }

    filter_by_report_level(violations, report_level) {
      strict      => violations.filter(severity: critical | serious)
      balanced    => violations.filter(severity: critical | serious | moderate)
      exhaustive  => violations.all
    }

    generate_violation_report {
      table(
        id, wcag_criterion, wcag_level, category, severity,
        element, description, fix_suggestion, automatable
      )
      grouped_by: severity  // critical primero
      summary: {
        critical_count, serious_count, moderate_count, minor_count,
        wcag_criteria_failing: [list],
        most_common_categories: [ranked]
      }
      release_gate: when(critical_count > 0 | serious_count > 0)
        => warn("🚫 Release bloqueado: {critical_count} violaciones críticas + {serious_count} serias")
    }
    present(violation_report)
    mem_save(violations, topic: "a11y-testing/{project}/violations", type: "architecture", capture_prompt: false)
  }

  // =============================================
  // COLECCIÓN E INTERPRETACIÓN DE RESULTADOS
  // =============================================
  CollectResults {
    // La ejecución la realiza el agente externo (sdd-verify, usuario, CI/CD)
    instruct_run {
      message: "Ejecuta los tests de accesibilidad con:"
      command: runner_command
      note: "Los resultados quedan en la terminal. Pégame el output o la ruta del report JSON para analizarlo."
    }

    when user_provides(execution_output) | caller_provides(execution_output)
      => ViolationAnalysis

    when user_requests(full_report)
      => read_report_file(tool_report_path) => ViolationAnalysis

    generate_summary {
      violations_by_severity: table(severity, count, wcag_criteria)
      fixes_proposed: count_actionable_fixes
      manual_items_pending: checklist_items_not_verified
      release_recommendation: pass | blocked(reasons)
    }
    present(summary)
    mem_save(results, topic: "a11y-testing/{project}/results", type: "architecture", capture_prompt: false)
  }

  // =============================================
  // MEJORAS A TESTS A11Y EXISTENTES
  // =============================================
  ImproveTests {
    trigger: user says "mejora los tests a11y" | caller_invokes(improve: true)

    scan(existing_a11y_tests) => analyze {
      missing_categories:     check_coverage_vs(WCAGCategories.active_categories)
      generic_assertions:     replace_with(targeted_per_category_assertions)
      missing_manual_items:   add_checklist_for(non_automatable_criteria)
      outdated_rules:         update_to(latest_axe_rules | latest_standard)
      ignored_rules_without_justification: flag_for_review
    }
    prioritize(improvements, by: wcag_severity)
    propose_improvements(list, grouped_by: category)

    await_feedback {
      ✅ approve_all    => apply_all => instruct_run
      ✏️  select(subset) => apply_selected => instruct_run
      ❌ skip            => present_as_recommendations_only
    }
  }

  // =============================================
  // CONTRATO PARA INVOCACIÓN DESDE OTROS SKILLS
  // =============================================
  AgentContract {
    // tech-lead, e2e-testing, sdd-apply, sdd-verify u otro skill:
    OnInvoke(caller_input) {
      required_fields: [scope: full_page | component | user_flow, target: url | selector | flow_id]
      optional_fields: [
        stack,
        e2e_framework,
        tool,
        standards: [WCAG_2_1_AA | WCAG_2_1_AAA | WCAG_2_2_AA],
        report_level: strict | balanced | exhaustive,
        categories: [WCAGCategory],
        config: boolean,
        gap_analysis: boolean,
        improve: boolean
      ]

      when gap_analysis == true => GapAnalysis => done
      when config == true       => AuditCycle.ConfigGeneration => done
      when improve == true      => ImproveTests => done
      default                   => AuditCycle

      return {
        test_files:        [path]           // tests generados (si standalone)
        patch_files:       [path]           // diffs para integrar en E2E existentes
        config_file:       path | null
        manual_checklist:  [ChecklistItem]
        run_command:       string
        status:            generated | passing | failing | pending_execution
        violations_count:  { critical, serious, moderate, minor }
        release_gate:      pass | blocked
        summary:           string
      }
    }
  }

  // =============================================
  // STATUS Y PERSISTENCIA
  // =============================================
  StatusBoard {
    trigger: user says "estado|status|progreso|dashboard a11y"
    display {
      audits_table(id, target, scope, tool, status, violations_summary)
      violations_by_severity(critical, serious, moderate, minor)
      wcag_criteria_failing: [table with criterion, level, category]
      manual_checklist_progress(verified / total)
      release_gate_status: pass | blocked(reasons)
      gaps_remaining(targets_without_a11y_coverage)
    }
  }

  Persist {
    engram_keys {
      "a11y-testing/{project}/context"          => stack + ui_type + e2e_framework
      "a11y-testing/{project}/tool"             => tool_config + runner_command
      "a11y-testing/{project}/config"           => config_file_path
      "a11y-testing/{project}/gaps"             => gap_analysis_report
      "a11y-testing/{project}/audits"           => audit_metadata_list
      "a11y-testing/{project}/violations"       => last_violations_parsed
      "a11y-testing/{project}/manual-checklist" => checklist_items + verified_status
      "a11y-testing/{project}/results"          => last_execution_results
      "a11y-testing/{project}/state"            => session_state + cycle_progress
    }
    // Los archivos de test se guardan co-locados en el proyecto
    // Los patches de integración E2E se aplican sobre los tests existentes
    // No se duplica nada en .ia/ salvo reporte solicitado explícitamente
  }
}
```

## Notes on complementary skills

- **`unit-testing`**: no cubre tests de componentes con `jest-axe` — esta skill llena ese gap para el scope `component`.
- **`e2e-testing`**: sus tests generados no incluyen aserciones axe por defecto — esta skill los complementa vía integración (`integrated_with_e2e`), generando patches que añaden `checkA11y()` a los tests E2E existentes.
- La **configuración de Playwright** generada por `e2e-testing` puede necesitar la dependencia `@axe-core/playwright` — esta skill detecta eso y genera la actualización de config si aplica.

## References

- `.ia/` — documentación del proyecto (stack, PRD, inventario de componentes, flujos de usuario)
- `.agents/skills/e2e-testing/SKILL.md` — modo `integrated_with_e2e`: inyecta aserciones axe en tests E2E existentes
- `.agents/skills/unit-testing/SKILL.md` — modo `component`: tests de accesibilidad de componentes con jest-axe
- `.agents/skills/tech-lead/SKILL.md` — invoca esta skill para subtareas de tipo `a11y` o `accessibility`
