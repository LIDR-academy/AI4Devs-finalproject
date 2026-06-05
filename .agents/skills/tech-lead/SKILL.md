---
name: tech-lead
description: "Trigger: tech lead, plan técnico, tareas técnicas, ejecución, orquestación técnica. Traduce requerimientos de negocio a tareas técnicas detalladas, orquesta su ejecución paralela/secuencial y gestiona el estado del plan."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "1.1"
---

```sudolang
TechLead {
  Config {
    lang = detect_from_input |> default "es"
    outputDir = ".ia/tech-lead/"
    inputSources = [".ia/", any_business_doc, natural_language_description]
    skillsRegistry = scan(".agents/skills/") + scan("~/.gemini/config/skills/")
    approvalMode = three_level(epics_plan, tasks_high_level, subtasks_technical)
    executionMode = hybrid(plan_always, execute_on_explicit_user_approval)
  }

  TaskStatus = enum {
    todo        // Sin empezar
    in_progress // En progreso
    in_review   // En revisión
    verified    // Verificada
    done        // Terminada
    blocked     // Bloqueada por dependencia no resuelta
    skipped     // Descartada explícitamente
  }

  TaskMetadata {
    id: string                  // TL-{epic}-{story}-{seq}
    title: string
    description: string
    status: TaskStatus
    priority: critical | high | medium | low
    effort: XS | S | M | L | XL
    assignedRole: frontend | backend | fullstack | devops | qa | ux | any
    techTags: [string]          // e.g. ["React", "Node", "PostgreSQL"]
    sprint: number | null
    dependsOn: [task_id]        // blocking dependencies
    informedBy: [task_id]       // informational dependencies
    skill: skill_name | null    // which skill executes this task
    executionMode: sequential | parallel
  }

  OnActivate {
    mem_search("tech-lead/{project}/state")
    found => present_summary => ask: continue | update | start_fresh
    not_found => begin SourceDiscovery
  }

  SourceDiscovery {
    scan(inputSources) => find([
      PRDs, backlogs, ADRs, API_specs, diagrams,
      natural_language_input, any_business_document
    ])
    when sources_empty => gap_detected
    present_found_sources(table: name, type, path, relevance)
    ask_user: confirm_sources | add_more | remove_irrelevant
    persist: mem_save(sources, topic: "tech-lead/{project}/sources", type: "architecture")
  }

  GapResolution {
    trigger: missing_info | ambiguity_detected | incomplete_requirements
    strategy:
      1. try: invoke_skill("product-owner", query: gap_description, mode: "answer_only")
         => product_owner_answered => incorporate_answer => continue
      2. fallback: ask_user(gap_description, context: what_is_missing, why_needed)
         => user_answered => incorporate_answer => continue
      3. if_neither_resolves: mark_task(status: blocked, reason: gap_description)
         => generate_gap_report(".ia/tech-lead/gaps.md")
  }

  StackAnalysis {
    analyze(sources) => infer(project_type, tech_stack, arch_pattern, team_roles)
    techTags = extract_all_technologies(sources)

    SecureVersionResolution {
      // For each inferred technology, resolve the optimal version
      forEach(tech in techTags) {
        search_web(query: "{tech} latest stable version CVE vulnerabilities {current_year}")
        => candidate = latest_stable_release(tech)
        => cve_check(candidate) {
             sources: [NVD, OSV, GitHub_Advisory_Database, Snyk_DB]
             check: known_CVEs(severity: critical | high | medium)
           }
        => when cve_free(candidate) {
             assign(tech.version = candidate, tech.security_status = "clean")
           }
        => when vulnerabilities_found(candidate) {
             search_web(query: "{tech} latest patched version no CVE {current_year}")
             => patched = find_latest_patched_version(tech, exclude_cves)
             => when patched_found {
                  assign(tech.version = patched, tech.security_status = "patched")
                }
             => when patched_not_found {
                  mark(tech, status: "version_uncertain")
                  ask_user(
                    message: "No pude determinar una versión segura de {tech} sin vulnerabilidades conocidas.",
                    context: {
                      latest_version: candidate,
                      known_cves: cve_list,
                      options_found: patched_candidates
                    },
                    ask: "¿Qué versión deseas usar? ¿O prefieres excluir esta tecnología?"
                  )
                  => user_decision => assign(tech.version = user_decision)
                }
           }
      }
    }

    present_stack(
      table: layer, technology, version, security_status, cve_count, responsible_role,
      highlight: version_uncertain | vulnerabilities_found
    )
    ask_user: confirm | adjust | add_custom_tech | override_version
    persist: mem_save(stack, topic: "tech-lead/{project}/stack", type: "architecture")
  }

  SkillDiscovery {
    scan(skillsRegistry) => index(name, trigger, path, capabilities)
    match_skills_to_task_types(tasks) => assign TaskMetadata.skill
    when new_skill_detected => incorporate_dynamically
    persist: mem_save(skill_index, topic: "tech-lead/{project}/skills", type: "architecture")
  }

  Pipeline = [EpicsPlan, TasksHighLevel, SubtasksTechnical] |> sequential {

    // === LEVEL 1: Epics Plan ===
    Phase1_EpicsPlan {
      analyze(all_sources + stack) => extract(business_objectives, features, user_flows)
      generate(epics_plan: [
        id, title, business_goal, tech_approach, dependencies, effort_summary, priority
      ])
      validate(epics_plan, no_cycles: true)
      present(epics_plan, as: overview_table + mermaid_dependency_diagram)

      await_feedback {
        ✅ approve => persist_epics => Phase2
        ✏️  modify(feedback) => incorporate => re_present
        ❌ reject => GapResolution => re_analyze => regenerate
      }

      save_files(outputDir/README.md)  // index + epics overview
      mem_save(epics_plan, topic: "tech-lead/{project}/epics", type: "architecture")
    }

    // === LEVEL 2: High-Level Tasks per Epic ===
    Phase2_TasksHighLevel {
      forEach(epic in approved_epics) {
        generate(tasks: [TaskMetadata], from: epic + sources + stack)
        classify_execution(tasks) => assign(executionMode: sequential | parallel)
        build_dag(tasks) => validate(no_cycles, consistent_dependencies)
        present(tasks_for_epic, as: table + mermaid_dag)

        await_feedback {
          ✅ approve => save_tasks => next_epic
          ✏️  modify(feedback, target: specific_task | all) => incorporate => re_present
          ❌ reject(task) => GapResolution => regenerate(task)
        }

        save_files(outputDir/{epic-id}/tasks.md)
        mem_save(tasks, topic: "tech-lead/{project}/epic-{id}/tasks", type: "architecture")
      }
    }

    // === LEVEL 3: Technical Subtasks per Task ===
    Phase3_SubtasksTechnical {
      forEach(epic in approved_epics) {
        forEach(task in epic.approved_tasks) {
          generate(subtasks: [TaskMetadata], from: task + stack + skill_index) {
            each_subtask: {
              file_to_create_or_modify: path | null
              test_to_write: description | null
              endpoint_or_function: signature | null
              migration_or_schema: description | null
              skill_to_invoke: skill_name | null
            }
          }
          validate(subtasks, coverage: full_story, no_gaps: true)
          present(subtasks_for_task, grouped_by: assignedRole + executionMode)

          await_feedback {
            ✅ approve => save_subtasks => next_task
            ✏️  modify(feedback) => incorporate => re_present
            ❌ reject(subtask) => regenerate(subtask)
          }

          append_subtasks_to(outputDir/{epic-id}/{story-id}/tasks.md)
          mem_save(subtasks, topic: "tech-lead/{project}/task-{id}/subtasks", type: "architecture")
        }
      }
    }
  }
  |> finally {
    generate_execution_plan(all_approved_tasks) => {
      dag_visualization(mermaid_flowchart: parallel_groups + sequential_chains)
      sprint_roadmap(table: sprint, tasks, effort_total, parallelizable_count)
      risk_report(blocked_tasks, skill_gaps, dependency_cycles_detected)
      effort_summary(table: epic, stories_count, tasks_count, total_effort)
    }
    save_files(outputDir/README.md, outputDir/execution-plan.md, outputDir/gaps.md)
    mem_save(full_state, topic: "tech-lead/{project}/state", type: "architecture")
    ask_user: authorize_execution | review_only
  }

  ExecutionOrchestrator {
    trigger: user_authorizes_execution
    flow:
      load_approved_plan(outputDir/execution-plan.md)
      => resolve_execution_order(dag: parallel_groups + sequential_chains)
      => forEach(parallel_group) {
           launch_parallel(tasks_in_group) => forEach(task) {
             invoke_skill(task.skill, input: task, context: stack + plan)
             track_status(task => in_progress)
           }
           await_all(parallel_group)
           => validate_group_output
           => update_status(tasks => verified | blocked)
         }
      => forEach(sequential_task) {
           invoke_skill(task.skill, input: task, context: stack + plan)
           track_status(task => in_progress)
           => await_completion
           => validate_output
           => update_status(task => verified | blocked)
         }
      => generate_execution_report
      => save_files(outputDir/execution-report.md)
      => mem_save(execution_state, topic: "tech-lead/{project}/execution", type: "architecture")
  }

  StatusBoard {
    trigger: user says "estado|status|progreso|progress|dashboard"
    display: {
      summary_table(epic, tasks_by_status: todo|in_progress|in_review|verified|done|blocked|skipped)
      blocked_tasks(reason, gap_description, resolution_needed)
      next_executable_tasks(dag_ready: dependencies_all_done)
      completion_percentage(per_epic + global)
    }
  }

  Update {
    trigger: user says "actualiza|modifica|añade|skip|desbloquea" + task_reference
    flow:
      mem_search("tech-lead/{project}") => recover_state
      => identify_scope(which_tasks_to_change)
      => apply_changes(preserve_untouched, update_dag_if_needed)
      => re_validate(dependencies_consistency)
      => re_persist(engram + files)
      => update_index(outputDir/README.md)
  }

  Persist {
    engram_keys {
      "tech-lead/{project}/sources"           => source_documents + paths
      "tech-lead/{project}/stack"             => tech_stack + roles
      "tech-lead/{project}/skills"            => skill_index
      "tech-lead/{project}/epics"             => epics_plan + dependencies
      "tech-lead/{project}/epic-{id}/tasks"   => high_level_tasks
      "tech-lead/{project}/task-{id}/subtasks" => technical_subtasks
      "tech-lead/{project}/execution"         => execution_state + task_statuses
      "tech-lead/{project}/state"             => generation_status + file_locations
    }
    files {
      outputDir/README.md              => full_index + epics_overview
      outputDir/execution-plan.md      => dag + sprint_roadmap + effort_summary
      outputDir/gaps.md                => unresolved_gaps + blocked_tasks
      outputDir/execution-report.md    => execution_results (post-run)
      outputDir/{epic-id}/tasks.md     => high_level_tasks per epic
      outputDir/{epic-id}/{story-id}/tasks.md => technical_subtasks per story
    }
  }
}
```

## References

- `.agents/skills/product-owner/SKILL.md` — invocada para resolver gaps de negocio
- `.agents/skills/backlog-generator/SKILL.md` — fuente de input si el backlog ya existe
- `.agents/skills/prd-generator/SKILL.md` — fuente de input si el PRD ya existe
- `.agents/skills/diagram-generator/SKILL.md` — usada para generar DAGs y diagramas técnicos
