---
name: backlog-generator
description: "Trigger: backlog, user stories, epics, tasks, subtasks, story mapping, story breakdown. Generates a structured backlog (epics, stories, subtasks, DoD) from existing documentation with 3-level approval."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "1.0"
---

```sudolang
BacklogGenerator {
  Config {
    lang = detect_from_user_input |> default "en"
    inputDir = ".ia/"
    outputDir = ask_user |> default ".ia/backlog/"
    diagrams = mermaid
    approval = three_level(epics_map, stories_per_epic, subtasks_per_story)
    exportFormats = ["markdown"] // user can request: "jira_csv", "github_json"
  }

  OnActivate {
    mem_search("backlog/{project}/state")
    found => present_summary => ask: continue | update | start_fresh
    not_found => begin SourceDiscovery
  }

  SourceDiscovery {
    scan(inputDir) => find([PRDs, diagrams, ADRs, API_specs, wireframe_descriptions])
    present_found_sources(table: name, type, path, relevance)
    ask_user: confirm_sources | add_more | remove_irrelevant
    persist: mem_save(sources, topic: "backlog/{project}/sources", type: "architecture")
  }

  StackDetection {
    analyze(sources) => infer(project_type, tech_stack, architecturePattern)
    present_detected_stack(table: layer, technology, subtask_types)
    subtaskCategories = detect_from_stack => default [Frontend, Backend, Testing, Infrastructure, UX]
    ask_user: confirm | adjust_categories | add_custom_categories
    persist: mem_save(stack, topic: "backlog/{project}/stack", type: "architecture")
  }

  Pipeline = [EpicsMap, StoriesPerEpic, SubtasksPerStory] |> sequential {

    // === LEVEL 1: Epic Map ===
    Phase1_EpicsMap {
      load_template("assets/epic-template.md")
      analyze(all_sources) => extract(business_objectives, features, user_flows)
      generate(epic_map: [epics with features, priorities, dependencies, effort_summary])
      validate(epic_map) // references/validation-rules.md
      present(epic_map, as: overview_table + mermaid_dependency_diagram)

      await_feedback {
        ✅ approve => persist_epics => Phase2
        ✏️  modify(feedback) => incorporate => re_present
        ❌ reject => re_analyze_sources => regenerate
      }
      save_files(outputDir/README.md, outputDir/{epic-id}/README.md per epic)
      mem_save(epic_map, topic: "backlog/{project}/epics", type: "architecture")
    }

    // === LEVEL 2: Stories per Epic ===
    Phase2_StoriesPerEpic {
      forEach(epic in approved_epics) {
        load_template(detect_story_type(epic) => "assets/story-{type}-template.md")
        generate(stories, from: epic + sources + approved_context)
        validate(stories, rules: INVEST + AC_GWT + traceability) // references/validation-rules.md
        present(stories_for_epic, section_by_section)

        await_feedback {
          ✅ approve => save_stories => next_epic
          ✏️  modify(feedback, target: specific_story | all) => incorporate => re_present
          ❌ reject(story) => regenerate(story)
        }
        save_files(outputDir/{epic-id}/{story-id}.md per story)
        mem_save(stories_summary, topic: "backlog/{project}/epic-{id}/stories", type: "architecture")
      }
    }

    // === LEVEL 3: Subtasks per Story ===
    Phase3_SubtasksPerStory {
      forEach(epic in approved_epics) {
        forEach(story in epic.approved_stories) {
          classify(story) => assign_subtask_categories(from: StackDetection.subtaskCategories)
          load_template("assets/subtask-{category}-template.md" per category)
          generate(subtasks + DoD_checklist, from: story + stack_context)
          validate(subtasks) // references/validation-rules.md
          present(subtasks_for_story, grouped_by_category)

          await_feedback {
            ✅ approve => save_subtasks => next_story
            ✏️  modify(feedback) => incorporate => re_present
            ❌ reject(subtask) => regenerate(subtask)
          }
          append_subtasks_to(outputDir/{epic-id}/{story-id}.md)
          mem_save(subtasks, topic: "backlog/{project}/story-{id}/subtasks", type: "architecture")
        }
      }
    }
  }
  |> finally {
    generate_executive_overview(all_approved_artifacts) => {
      summary_table(total_epics, total_stories, total_subtasks, effort_aggregate)
      mermaid_dependency_graph(epics + blocking_stories)
      complexity_heatmap(per_epic: stories_count, effort, risk_level)
    }
    save_files(outputDir/README.md) // update with full index + overview
    mem_save(full_state, topic: "backlog/{project}/state", type: "architecture")
    log: "Backlog generated in {outputDir} — {n} epics, {m} stories, {k} subtasks"
  }

  StoryTypeDetection {
    analyze(story_context, epic_features) => classify {
      "fullstack" => touches_ui + touches_api + touches_data
      "frontend"  => touches_ui + no_new_api
      "backend"   => touches_api + touches_data + no_ui
      "infra"     => touches_deployment + touches_config + touches_monitoring
      "ux"        => touches_design + touches_flow + touches_prototype
    }
    present_classification => ask_user: confirm | override
  }

  Validate {
    INVEST(stories)                           // references/validation-rules.md
    AC_required(every_story, format: Given/When/Then, min: 2_scenarios)
    traceability(epic → feature → story → subtask, bidirectional_links)
    dependencies(identify, classify: blocking | preferred | informational, detect_cycles => error)
    technical_coherence {
      subtasks_cover_full_story(no_gaps)
      DoD_items_are_verifiable(each_item)
      effort_estimate_coherent(size ↔ time ↔ complexity)
    }
    complexity_estimation(per_subtask_type) {
      size: XS | S | M | L | XL
      time: range(min, max)
      validate: size ↔ time coherence
      aggregate: per_story + per_epic + global
    }
  }

  Export {
    trigger: user says "export to jira|github|linear|csv"
    formats {
      jira_csv  => load_template("assets/export-jira.csv")  => map(stories + subtasks)
      github_json => load_template("assets/export-github.json") => map(issues + labels)
    }
    save_file(outputDir/exports/{format}_export.{ext})
  }

  Persist {
    engram_keys {
      "backlog/{project}/sources"           => source_documents + paths
      "backlog/{project}/stack"             => detected_stack + subtask_categories
      "backlog/{project}/epics"             => epic_map + dependencies
      "backlog/{project}/epic-{id}/stories" => stories_per_epic
      "backlog/{project}/story-{id}/subtasks" => subtasks_per_story
      "backlog/{project}/state"             => generation_status + file_locations
    }
    files {
      outputDir/README.md        => executive_overview + full_index
      outputDir/{epic-id}/       => directory per epic
      outputDir/{epic-id}/README.md => epic detail + story index
      outputDir/{epic-id}/{story-id}.md => story + subtasks + DoD
    }
  }

  Update {
    trigger: user says "update|add|modify|refine" + backlog_reference
    flow:
      mem_search("backlog/{project}") => recover_state
      => read_existing_files(outputDir)
      => identify_scope(which_epics_or_stories_to_change)
      => apply_changes(preserve_untouched_content)
      => re_validate(modified_artifacts) // references/validation-rules.md
      => re_persist(engram + files)
      => update_index(outputDir/README.md)
  }
}
```
