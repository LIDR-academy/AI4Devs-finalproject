---
name: e2e-testing
description: "Trigger: e2e, end-to-end, tests E2E, flujos de usuario, acceptance testing, Playwright, Cypress. Genera tests E2E completos desde flujos de negocio, analiza gaps de cobertura y gestiona configuración del framework."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "1.0"
---

```sudolang
E2ETesting {
  Config {
    lang = detect_from_input |> default "es"
    inputSources = [".ia/", caller_context, natural_language_description]
    frameworkInfo = caller_provided | infer_from(".ia/") | ask_user
    targetEnv = local | staging | ask_user  // configurable per invocation
    mockSources = caller_provided | scan_project_for_mocks | ask_user
  }

  TestStatus = enum {
    pending      // Escenario definido, test no generado
    generated    // Test generado, no ejecutado
    passing      // Test ejecutado y pasa
    failing      // Test ejecutado y falla
    skipped      // Descartado explícitamente
    flaky        // Test inestable (pasa/falla intermitentemente)
  }

  ScenarioMetadata {
    id: string                      // E2E-{epic}-{flow}-{seq}
    title: string
    description: string             // Given-When-Then en lenguaje natural
    sourceRef: string               // Historia de usuario / backlog item / descripción
    testFile: path                  // Archivo de test generado
    framework: string               // playwright | cypress | selenium | etc.
    targetEnv: local | staging | url
    fixturesUsed: [path]            // Archivos de fixtures/mocks utilizados
    steps: [step_description]
    status: TestStatus
    tags: [string]                  // e.g. ["smoke", "regression", "critical-path"]
  }

  OnActivate {
    mem_search("e2e-testing/{project}/state")
    found => present_summary => ask: continue | update | start_fresh
    not_found => begin FrameworkDiscovery
  }

  // =============================================
  // DESCUBRIMIENTO DE FRAMEWORK Y ENTORNO
  // =============================================
  FrameworkDiscovery {
    // 1. El caller (skill/agente) puede proveerlo directamente
    when caller_provides(framework) => use(caller_framework) => EnvDiscovery

    // 2. Buscar en documentación e5 config files del proyecto
    when not_provided => scan(inputSources) => find([
      playwright_config, cypress_config, package_json(devDependencies),
      tech_stack_docs_in_ia, any_e2e_config_file
    ])
    found => infer(framework, runner_command, base_url_pattern)
    not_found => ask_user(
      message: "¿Qué framework E2E usas en el proyecto? (Playwright, Cypress, Selenium...)",
      context: "No encontré configuración E2E. Necesito el framework para generar tests válidos."
    )
    persist: mem_save(framework_config, topic: "e2e-testing/{project}/framework", type: "config")
  }

  EnvDiscovery {
    // Determinar la URL base según entorno objetivo
    resolve_env(targetEnv) {
      local   => base_url = infer_from(config | package_json scripts | ask_user("¿URL local del servidor?"))
      staging => base_url = caller_provided | infer_from(".ia/" | ask_user("¿URL de staging?"))
    }
    runner_command = resolve_runner(framework) {
      playwright => "npx playwright test"
      cypress    => "npx cypress run"
      selenium   => infer_from(project_setup) | ask_user
      other      => ask_user("¿Comando para ejecutar los tests E2E?")
    }
    persist: mem_save(env_config, topic: "e2e-testing/{project}/env", type: "config")
  }

  // =============================================
  // DESCUBRIMIENTO DE MOCKS Y FIXTURES
  // =============================================
  MockDiscovery {
    // Prioridad: caller -> proyecto -> usuario
    when caller_provides(mock_paths) => use(mock_paths) => done

    scan_project_for_mocks {
      search([
        "**/__mocks__/**",
        "**/mocks/**",
        "**/fixtures/**",
        "**/test-data/**",
        "**/*.mock.*",
        "**/*.fixture.*"
      ])
      found => index(mock_files: [path, schema_inferred, entity_type])
               => present(mock_index, as: table(path, entity, fields))
               => ask_user: confirm_mocks | add_more | ignore_and_use_synthetic
      not_found => ask_user(
        message: "No encontré mocks o fixtures en el proyecto. ¿Dónde están los datos de prueba?",
        context: "Los tests E2E necesitan datos realistas. Puedo generarlos sintéticamente o usar los existentes.",
        options: [
          "Indícame la ruta donde están los mocks",
          "Genera datos sintéticos basados en los modelos del proyecto",
          "No necesito datos de prueba para estos tests"
        ]
      )
    }
    persist: mem_save(mock_index, topic: "e2e-testing/{project}/mocks", type: "architecture")
  }

  // =============================================
  // DESCUBRIMIENTO DE FLUJOS DE NEGOCIO
  // =============================================
  FlowDiscovery {
    // Extraer flujos de usuario desde documentación de negocio y técnica
    scan(inputSources) => find([
      user_stories, acceptance_criteria, backlog_items,
      PRDs, use_case_docs, API_specs, wireframes_descriptions,
      any_business_doc_in_ia
    ])
    extract(user_flows: [
      id, title, actor, preconditions, steps, expected_outcome, priority
    ])

    when flows_found => present(flows_table, as: table(id, title, actor, priority, has_e2e_test))
    when flows_not_found => {
      when caller_provides(flow_description) => use(flow_description)
      else => ask_user(
        message: "¿Qué flujos de usuario quieres cubrir con tests E2E?",
        context: "Puedes describirlos en lenguaje natural o pegarme historias de usuario."
      )
    }
    persist: mem_save(user_flows, topic: "e2e-testing/{project}/flows", type: "architecture")
  }

  // =============================================
  // GAP ANALYSIS DE COBERTURA E2E
  // =============================================
  GapAnalysis {
    trigger: user asks "gap analysis" | "qué flujos faltan" | "cobertura E2E" | caller invokes with scope

    flow:
      FlowDiscovery
      => scan(existing_e2e_tests) => extract(covered_flows)
      => cross_reference(user_flows, covered_flows) => identify(uncovered | partially_covered)
      => generate_gap_report {
           table(flow_id, title, actor, priority, status: covered | partial | missing)
           highlight: critical_paths_without_e2e
           risk_summary: untested_critical_flows
         }
      => present(gap_report)
      => await_feedback {
           ✅ approve => generate_tests_for_gaps => ScenarioFirstCycle
           ✏️  adjust(scope) => re_analyze
           ❌ save_only => save_gap_report_only
         }
      => save_files(gap-report.md)  // solo reporte, tests van co-locados al proyecto
      => mem_save(gap_report, topic: "e2e-testing/{project}/gaps", type: "architecture")
  }

  // =============================================
  // CICLO PRINCIPAL: SCENARIO-FIRST
  // =============================================
  ScenarioFirstCycle {
    trigger: default | user says "genera tests E2E" | caller_invokes

    // PASO 1: Definir escenarios en lenguaje natural
    ScenarioDefinition {
      resolve_input {
        when caller_provides(flow_description | user_story | backlog_item) => use(input)
        when not_provided => FlowDiscovery => select_flows_to_test
      }

      forEach(flow in selected_flows) {
        generate_scenario {
          title: descriptive_name
          actor: who_performs_the_action
          preconditions: system_state_before_test
          steps: ordered_actions_in_natural_language
          expected_outcome: what_success_looks_like
          edge_cases: boundary_conditions + error_paths
          tags: classify(smoke | regression | critical | happy_path | error_path)
        }
        present(scenario, format: Given_When_Then)
      }

      await_feedback {
        ✅ approve_all    => TestGeneration
        ✏️  modify(flow)  => incorporate => re_present(flow)
        ❌ reject(flow)   => skip(flow) => continue_with_remaining
        ➕ add_scenario   => define_new_scenario => append => re_present
      }
    }

    // PASO 2: Generar código de test desde los escenarios aprobados
    TestGeneration {
      MockDiscovery  // Asegurar datos de prueba disponibles

      forEach(scenario in approved_scenarios) {
        generate_test {
          framework: framework_config
          structure: {
            setup:    configure_env + login_if_required + seed_test_data(from: mock_sources)
            actions:  user_interactions(selectors: semantic | data-testid | aria-labels)
            assertions: verify_expected_outcome + verify_no_side_effects
            teardown: cleanup_test_data_if_needed
          }
          include {
            page_object_pattern: when_multiple_interactions_with_same_page
            fixtures_inline: when_data_is_simple
            fixtures_file: when_data_is_complex | reused_across_tests (path: co-located)
          }
          quality_rules {
            no_hardcoded_urls: use(base_url_from_config)
            no_sleep: use(explicit_waits | network_idle | locator_assertions)
            descriptive_test_names: matches(scenario.title)
            atomic: each_test_independent_from_others
            resilient_selectors: prefer(data-testid | aria | role) over(css_class | xpath)
          }
        }
        present(generated_test, path: suggested_test_file_path)
      }

      await_feedback {
        ✅ approve      => ConfigGeneration => instruct_run
        ✏️  modify(test) => incorporate => re_present
        ❌ reject(test)  => ask("¿Qué cambios necesitas?") => regenerate
      }

      mem_save(scenario_metadata_list, topic: "e2e-testing/{project}/scenarios", type: "architecture")
    }
  }

  // =============================================
  // GENERACIÓN DE CONFIGURACIÓN DEL FRAMEWORK
  // =============================================
  ConfigGeneration {
    trigger: user says "configura" | "genera config" | first_time_setup | caller_invokes(config: true)

    check_existing_config => {
      found     => present(existing_config) => ask: update | keep_as_is
      not_found => generate_from_scratch
    }

    generate(framework_config_file) {
      playwright => playwright.config.ts {
        projects: [chromium, firefox, webkit]  // cross-browser by default
        baseURL: env_config.base_url
        testDir: "./e2e" | infer_from_project
        retries: 2  // flakiness resilience
        reporter: ["html", "list"]
        use: { screenshot: "only-on-failure", video: "retain-on-failure", trace: "on-first-retry" }
      }
      cypress    => cypress.config.js {
        baseUrl: env_config.base_url
        specPattern: "cypress/e2e/**/*.cy.{js,ts}"
        video: true
        screenshotOnRunFailure: true
      }
      other      => generate_minimal_config(framework) | ask_user
    }

    present(config_file, path: suggested_path)
    await_feedback {
      ✅ approve => save_config
      ✏️  modify  => incorporate => re_present
    }
    persist: mem_save(config_path, topic: "e2e-testing/{project}/config", type: "config")
  }

  // =============================================
  // GENERACIÓN DE FIXTURES / DATOS DE PRUEBA
  // =============================================
  FixtureGeneration {
    trigger: user says "genera fixtures" | "datos de prueba" | caller_invokes(fixtures: true)
             | complex_data_detected_in_scenario

    MockDiscovery  // Siempre buscar mocks existentes primero

    forEach(scenario_requiring_data in identified_scenarios) {
      when mocks_available => {
        select_relevant_mocks(scenario) => adapt_to_test_format
        present(adapted_fixtures, source: "basado en mocks existentes en {mock_path}")
      }
      when mocks_not_available => {
        infer_data_schema(from: api_specs | models | business_docs | type_definitions)
        generate_synthetic_fixtures {
          realistic: true  // nombres, emails, fechas plausibles
          varied: include_edge_case_values
          typed: match_schema_types_strictly
        }
        present(synthetic_fixtures)
        warn_user("⚠️ No se encontraron mocks. Estos datos son sintéticos — revisa que sean válidos para tu sistema.")
      }
    }

    await_feedback {
      ✅ approve => save_fixtures(co-located_with_tests)
      ✏️  modify  => incorporate => re_present
    }
  }

  // =============================================
  // EJECUCIÓN E INTERPRETACIÓN DE RESULTADOS
  // =============================================
  CollectResults {
    // La ejecución la realiza el agente externo (sdd-verify, usuario, CI/CD)
    // Esta skill provee el comando e interpreta los resultados

    instruct_run {
      message: "Ejecuta los tests E2E con:"
      command: runner_command + env_flags(targetEnv)
      note: "Los resultados quedan en la terminal y en el report del framework."
      env_flags {
        local   => ""  // usa baseURL del config
        staging => "--env BASE_URL={staging_url}" | "PLAYWRIGHT_BASE_URL={staging_url}"
      }
    }

    when user_provides(execution_output) | caller_provides(execution_output) => parse_results {
      passed:  [scenario_id, title, duration]
      failed:  [scenario_id, title, error_message, screenshot_path | trace_path]
      skipped: [scenario_id, reason]
      flaky:   [scenario_id, retry_count]
      summary: { total, passed_count, failed_count, duration_total }
    }

    when failures_detected => diagnose_failures {
      forEach(failed_test) {
        analyze(error_message + stack_trace)
        classify: selector_issue | timing_issue | data_issue | env_issue | regression
        suggest_fix: specific_actionable_recommendation
      }
    }

    when user_requests(full_report) => read_report_file {
      playwright => "playwright-report/index.html"
      cypress    => "cypress/reports/"
      present: summary_table(scenario, status, duration, error)
    }

    generate_summary {
      table(scenario_id, title, tags, status, duration, notes)
      failure_diagnosis(failed_tests, root_cause, suggested_fix)
      flaky_tests_warning(flaky_list, retry_recommendation)
      coverage_delta(new_flows_covered, gaps_remaining)
    }
    present(summary)
    mem_save(results, topic: "e2e-testing/{project}/results", type: "architecture", capture_prompt: false)
  }

  // =============================================
  // CONTRATO PARA INVOCACIÓN DESDE OTROS SKILLS
  // =============================================
  AgentContract {
    // Cuando tech-lead, sdd-apply, sdd-verify u otro skill invoca esta skill:
    OnInvoke(caller_input) {
      required_fields: [flow_description | user_story | backlog_item]
      optional_fields: [
        framework,
        target_env: local | staging | url,
        mock_paths: [path],
        config: boolean,
        fixtures: boolean,
        gap_analysis: boolean
      ]

      when gap_analysis == true => GapAnalysis => done
      when config == true       => ConfigGeneration => done
      when fixtures == true     => FixtureGeneration => done
      default                   => ScenarioFirstCycle

      return {
        scenario_files: [path]
        test_files:     [path]
        fixture_files:  [path]
        config_file:    path | null
        run_command:    string
        status:         generated | failed | pending_execution
        scenarios_count: number
        summary:        string
      }
    }
  }

  // =============================================
  // MEJORAS A TESTS E2E EXISTENTES
  // =============================================
  ImproveTests {
    trigger: user says "mejora los tests E2E" | "refactoriza E2E" | caller_invokes(improve: true)

    scan(existing_e2e_tests) => analyze {
      hardcoded_values:      replace_with_config_or_fixtures
      fragile_selectors:     replace_with(data-testid | aria-labels | roles)
      sleep_statements:      replace_with(explicit_waits | network_idle)
      missing_assertions:    add_meaningful_assertions
      test_interdependence:  make_each_test_atomic
      missing_edge_cases:    add_error_paths + boundary_conditions
      duplicated_setup:      extract_to_fixtures_or_helpers
    }
    prioritize(improvements, by: impact_on_reliability)
    propose_improvements(prioritized_list, grouped_by: category)

    await_feedback {
      ✅ approve_all    => apply_all => instruct_run
      ✏️  select(subset) => apply_selected => instruct_run
      ❌ skip            => present_as_recommendations_only
    }
  }

  // =============================================
  // STATUS Y PERSISTENCIA
  // =============================================
  StatusBoard {
    trigger: user says "estado|status|progreso|dashboard E2E"
    display {
      scenarios_table(id, title, tags, status: pending|generated|passing|failing|skipped|flaky)
      coverage_summary(flows_covered / total_flows)
      gaps_remaining(critical_paths_without_e2e)
      flaky_tests(list + retry_recommendation)
      last_run_summary(if_available)
    }
  }

  Persist {
    engram_keys {
      "e2e-testing/{project}/framework"  => framework + runner_command
      "e2e-testing/{project}/env"        => base_urls + env_flags
      "e2e-testing/{project}/mocks"      => mock_index + fixture_paths
      "e2e-testing/{project}/flows"      => user_flows extracted from docs
      "e2e-testing/{project}/gaps"       => gap_analysis_report
      "e2e-testing/{project}/scenarios"  => scenario_metadata_list
      "e2e-testing/{project}/config"     => config_file_path
      "e2e-testing/{project}/results"    => last_execution_results
      "e2e-testing/{project}/state"      => session_state + cycle_progress
    }
    // Los archivos de test y fixtures se guardan co-locados en el proyecto
    // No se duplican en .ia/ salvo que el usuario lo solicite explícitamente
  }
}
```

## References

- `.ia/` — documentación del proyecto (PRD, backlog, historias de usuario, stack, mocks)
- `.agents/skills/unit-testing/SKILL.md` — skill complementaria para tests unitarios
- `.agents/skills/tech-lead/SKILL.md` — invoca esta skill para subtareas de tipo `qa` o `e2e`
- `.agents/skills/backlog-generator/SKILL.md` — fuente de flujos de usuario si el backlog existe
- `.agents/skills/prd-generator/SKILL.md` — fuente de criterios de aceptación si el PRD existe
