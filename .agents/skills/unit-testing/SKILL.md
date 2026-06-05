---
name: unit-testing
description: "Trigger: unit testing, tests unitarios, TDD, test generation, cobertura, gap analysis, mocks, stubs, fixtures. Genera tests unitarios en modo TDD por defecto, analiza gaps de cobertura y ejecuta el ciclo Red-Green-Refactor."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "1.0"
---

```sudolang
UnitTesting {
  Config {
    lang = detect_from_input |> default "es"
    outputDir = ".ia/unit-testing/"
    inputSources = [".ia/", caller_context, natural_language_description]
    mode = tdd | on_demand           // tdd = default (Red→Green→Refactor)
    stackInfo = caller_provided | infer_from(".ia/") | ask_user
  }

  TestStatus = enum {
    pending      // Test generado, aún no ejecutado
    red          // Test falla (esperado en TDD)
    green        // Test pasa
    refactored   // Test + código refactorizados y verdes
    skipped      // Descartado explícitamente
  }

  TestMetadata {
    id: string                     // UT-{module}-{seq}
    title: string
    description: string            // Given-When-Then
    targetFile: path               // Archivo bajo test
    testFile: path                 // Archivo de test generado
    status: TestStatus
    framework: string              // jest | vitest | pytest | junit | etc.
    hasMocks: boolean
    hasFixtures: boolean
    coverageTarget: string | null  // función / clase / endpoint objetivo
  }

  OnActivate {
    mem_search("unit-testing/{project}/state")
    found => present_summary => ask: continue | update | start_fresh
    not_found => begin StackDiscovery
  }

  StackDiscovery {
    // 1. Intentar obtener el stack del caller (otro skill o agente)
    when caller_provides(stack) => use(caller_stack) => FrameworkResolution
    // 2. Buscar en documentación .ia/
    when not_provided => scan(inputSources) => find([
      tech_stack_docs, package_json, requirements_txt,
      pyproject_toml, pom_xml, build_gradle, any_config_file
    ])
    found => infer(stack, test_framework, runner_command)
    not_found => ask_user(
      message: "No encontré información del stack. ¿Qué tecnología/lenguaje usas?",
      context: "Necesito saber el stack para elegir el framework de testing adecuado."
    )
    persist: mem_save(stack, topic: "unit-testing/{project}/stack", type: "architecture")
  }

  FrameworkResolution {
    // Mapear stack => framework de testing recomendado
    resolve(framework) {
      TypeScript | JavaScript => vitest | jest (prefer vitest for new projects)
      Python                  => pytest
      Java                    => junit5 + mockito
      Kotlin                  => kotest | junit5
      Go                      => testing (stdlib) + testify
      other                   => ask_user("¿Qué framework de testing usas?")
    }
    resolve(runner_command) {
      vitest  => "npx vitest run --coverage"
      jest    => "npx jest --coverage"
      pytest  => "pytest --cov"
      junit5  => "mvn test" | "gradle test"
      other   => ask_user("¿Cuál es el comando para ejecutar los tests?")
    }
    persist: mem_save(framework_config, topic: "unit-testing/{project}/framework", type: "config")
  }

  GapAnalysis {
    trigger: user asks "gap analysis" | "qué falta testear" | "cobertura" | caller invokes with scope
    flow:
      scan(targetScope) => find(all_functions_classes_modules)
      cross_reference(existing_tests) => identify(untested | partially_tested)
      generate_gap_report {
        table(module, function, has_test, coverage_estimate, priority: critical | high | medium | low)
        highlight: critical_paths_without_tests
      }
      present(gap_report)
      await_feedback {
        ✅ approve => generate_tests_for_gaps => TDDCycle | OnDemandCycle
        ✏️  modify(scope) => re_analyze
        ❌ skip => save_gap_report_only
      }
      save_files(outputDir/gap-report.md)
      mem_save(gap_report, topic: "unit-testing/{project}/gaps", type: "architecture")
  }

  // =============================================
  // MODO TDD (por defecto): Red → Green → Refactor
  // =============================================
  TDDCycle {
    trigger: mode == tdd | user says "TDD" | no mode specified

    Red {
      // 1. Entender qué funcionalidad se quiere implementar
      resolve_target {
        when caller_provides(task_description) => use(task_description)
        when not_provided => ask_user(
          message: "¿Qué funcionalidad quieres desarrollar con TDD?",
          context: "Necesito la descripción para generar el test antes del código."
        )
      }

      // 2. Generar el test que describe el comportamiento esperado (FALLA en este punto)
      generate_test {
        analyze(task_description + stack + framework)
        write_test {
          structure: Given_When_Then
          cover: happy_path + edge_cases + error_cases
          include_mocks_if: external_dependencies_detected
          include_fixtures_if: complex_data_required
          comment: "// RED: Este test debe fallar hasta que se implemente la funcionalidad"
        }
        present(generated_test, path: testFile)
      }

      await_feedback {
        ✅ approve => confirm_test_fails => Green
        ✏️  modify(feedback) => incorporate => re_present
        ❌ reject => ask_user("¿Qué cambios necesitas en el test?")
      }

      // 3. Instrucciones para verificar que el test falla (fase RED confirmada)
      instruct_run {
        message: "Ejecuta el test para confirmar que falla (RED):"
        command: runner_command + " " + testFile
        expected: test_fails_with_meaningful_error
      }
      mem_save(test_metadata, topic: "unit-testing/{project}/tests", type: "architecture")
    }

    Green {
      // Delegar la implementación mínima al agente/skill de desarrollo
      instruct_implementer {
        message: "Implementa el mínimo código necesario para que este test pase (GREEN)."
        context: {
          test_file: testFile,
          test_description: task_description,
          target_file: targetFile,
          constraint: "Solo el código mínimo para pasar el test, sin optimizar aún."
        }
        // Si hay un agente ejecutor disponible, delegarlo
        when executor_available => invoke_skill(executor, input: {test: testFile, task: task_description})
        when not_available => present_instructions_to_user
      }

      await_green_confirmation {
        user confirms test passes => Refactor
        test still fails => diagnose(failure) => suggest_fix => retry
      }
    }

    Refactor {
      // Refactorizar manteniendo los tests verdes
      analyze(implementation) => suggest_refactors {
        duplication: eliminate
        naming: improve_clarity
        complexity: reduce
        performance: flag_if_critical
      }
      present(refactor_suggestions)
      await_feedback {
        ✅ approve_refactors => apply_refactors => verify_still_green => complete
        ✏️  partial => apply_selected => verify_still_green => complete
        ❌ skip => mark_status(refactored) => complete
      }

      complete {
        update_status(test, TestStatus.refactored)
        mem_save(test_metadata, topic: "unit-testing/{project}/tests", type: "architecture")
        ask_user {
          option: next_feature => new TDDCycle
          option: gap_analysis => GapAnalysis
          option: done         => GenerateReport
        }
      }
    }
  }

  // =============================================
  // MODO ON-DEMAND: Tests para funcionalidades existentes
  // =============================================
  OnDemandCycle {
    trigger: caller_invokes(scope) | user says "genera tests para X" | mode == on_demand

    resolve_scope {
      when caller_provides(scope) => use(scope)
      when not_provided => ask_user(
        message: "¿Para qué módulo, función o archivo quieres generar los tests?",
        context: "Puedo analizar el código existente y generar tests unitarios."
      )
    }

    analyze(targetScope) => extract(functions, classes, interfaces, edge_cases)

    generate_tests {
      forEach(unit in extracted_units) {
        write_test {
          structure: Given_When_Then
          cover: happy_path + edge_cases + error_cases
          include_mocks_if: external_dependencies_detected
          include_fixtures_if: complex_data_required
        }
        propose_improvements_if: existing_tests_found
      }
      present(generated_tests, grouped_by: module)
    }

    await_feedback {
      ✅ approve => instruct_run_all => CollectResults
      ✏️  modify(feedback, target: specific_test | all) => incorporate => re_present
      ❌ reject(test) => skip(test) => continue_with_remaining
    }
  }

  // =============================================
  // GENERACIÓN DE MOCKS / STUBS / FIXTURES
  // =============================================
  MockGeneration {
    trigger: user says "genera mocks" | "genera fixtures" | "genera stubs"
             | caller_invokes(mocks: true) | external_dependency_detected

    resolve_target {
      when caller_provides(dependency_description) => use(dependency_description)
      when not_provided => ask_user("¿Qué dependencia externa necesitas mockear?")
    }

    generate {
      mocks   => typed_mock(interface | class, framework: framework_config)
      stubs   => minimal_stub(returns_controlled_values)
      fixtures => realistic_test_data(schema_inferred | schema_provided)
    }

    present(generated_mocks, path: suggested_path)
    await_feedback {
      ✅ approve => save_to_test_directory
      ✏️  modify => incorporate => re_present
    }
  }

  // =============================================
  // RECOLECCIÓN Y REPORTE DE RESULTADOS
  // =============================================
  CollectResults {
    // La ejecución la realiza el agente externo (sdd-verify, usuario, etc.)
    // Esta skill recibe / interpreta los resultados

    instruct_run {
      message: "Ejecuta los tests con:"
      command: runner_command
      note: "Los resultados quedan en la terminal y en el coverage report del proyecto."
    }

    when user_provides(execution_output) => parse_results {
      passed: count
      failed: [test_id, reason]
      skipped: count
      coverage: percentage | by_module
    }

    when user_requests(coverage_report) => read_coverage_file {
      formats: [lcov, html, json, text]
      present: coverage_table(module, lines, branches, functions, statements)
    }

    generate_summary {
      table(test_id, title, status, duration)
      coverage_summary(total %, critical_paths_covered)
      failed_tests(reason, suggested_fix)
    }
    present(summary)
    mem_save(results, topic: "unit-testing/{project}/results", type: "architecture", capture_prompt: false)
  }

  // =============================================
  // MEJORAS A TESTS EXISTENTES
  // =============================================
  ImproveTests {
    trigger: user says "mejora los tests" | "refactoriza tests" | caller_invokes(improve: true)

    scan(existing_tests) => analyze {
      missing_edge_cases
      poor_descriptions
      missing_Given_When_Then
      over_mocking
      brittle_assertions
    }
    propose_improvements(prioritized_list)
    await_feedback {
      ✅ approve_all => apply_all => CollectResults
      ✏️  select(subset) => apply_selected => CollectResults
      ❌ skip => present_as_recommendations_only
    }
  }

  GenerateReport {
    trigger: user says "reporte" | "informe" | "resumen" | end_of_session
    generate {
      tests_generated: count_by_module
      tdd_cycles_completed: count
      gap_analysis_results: if_performed
      coverage_trend: if_multiple_runs
      pending_tests: status == pending | red
    }
    present(report)
    // No persiste archivos de test — quedan en el proyecto
    // Solo persiste el estado del ciclo de trabajo
    mem_save(session_state, topic: "unit-testing/{project}/state", type: "architecture")
  }

  // =============================================
  // CONTRATO PARA INVOCACIÓN DESDE OTROS SKILLS
  // =============================================
  AgentContract {
    // Cuando tech-lead, sdd-apply, sdd-verify u otro skill invoca esta skill:
    OnInvoke(caller_input) {
      required_fields: [task_description | target_scope]
      optional_fields: [stack, framework, mode: tdd | on_demand, mocks: boolean]

      when mode == tdd    => TDDCycle
      when mode == on_demand => OnDemandCycle
      when not_specified  => TDDCycle  // default

      return {
        test_files: [path]
        run_command: string
        status: generated | failed | pending_execution
        coverage_available: boolean
        summary: string
      }
    }
  }

  Persist {
    engram_keys {
      "unit-testing/{project}/stack"     => tech_stack + framework + runner_command
      "unit-testing/{project}/framework" => framework_config
      "unit-testing/{project}/tests"     => test_metadata_list
      "unit-testing/{project}/gaps"      => gap_analysis_report
      "unit-testing/{project}/results"   => last_execution_results
      "unit-testing/{project}/state"     => session_state + tdd_cycle_progress
    }
    // Los archivos de test se guardan co-locados con el código fuente del proyecto
    // No se duplican en .ia/ salvo que el usuario lo solicite explícitamente
  }
}
```

## References

- `.ia/` — documentación del proyecto (stack, arquitectura, PRD, backlog)
- `.agents/skills/tech-lead/SKILL.md` — invoca esta skill para subtareas de tipo `qa`
- `.agents/skills/diagram-generator/SKILL.md` — puede complementar con diagramas de flujo de tests
