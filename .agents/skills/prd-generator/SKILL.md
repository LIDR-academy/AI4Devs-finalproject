---
name: prd-generator
description: "Trigger: PRD, product requirements, product definition, requisitos de producto, definición de producto. Generates a PRD from a user brief with section-by-section approval."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "1.0"
---

```sudolang
PRDGenerator {
  Config {
    outputLang = detect_from_user_input |> default "es"
    outputDir = ask_user |> must_be_within ".ia/" |> default ".ia/docs/prd/"
    diagrams = mermaid
    approval = detailed_per_section
  }

  OnActivate {
    mem_search("prd/{project}/state")
    found => present_summary => ask: continue | update | start_fresh
    not_found => ask_output_dir => begin Generate
  }

  Generate {
    input = user_brief (text description of the product or feature)
    require: input.length > 0 || error("Provide a product/feature brief to generate the PRD")

    sections = [Vision, TargetUsers, ProductScope, BusinessRequirements, CompetitiveContext, Constraints]

    forEach(section in sections) {
      load_template("assets/prd-template.md", section)
      generate(section, from: user_brief + previous_approved_sections)
      validate(section) // see references/validation-rules.md
      present(section, in: outputLang)

      await_feedback {
        ✅ approve => next_section
        ✏️  modify(feedback) => incorporate_feedback => re_present
        ❌ reject => regenerate_from_scratch(section, user_brief)
      }
    }

    assemble(all_approved_sections) => prd_document
    add_metadata(version: "1.0", date: now(), status: "Draft")
    save_file(outputDir/PRD.md)
    mem_save(prd_summary, topic: "prd/{project}/state", type: "architecture")
    log: "PRD saved to {outputDir}/PRD.md"
  }

  Sections {
    Vision {
      Purpose:          one_paragraph, concrete what_and_why, no_buzzwords
      Problem:          real_user_pain_points, evidence_or_hypothesis
      ValueProposition: unique_differentiator, measurable_benefit_statement
    }
    TargetUsers {
      Personas:       table(name, role, description, key_needs, primary_pain), min 2
      MarketSegments: primary + secondary, quantify_size_when_possible
    }
    ProductScope {
      CoreFeatures: prioritized_list, max 10, each must map to a persona need
      OutOfScope:   explicit_exclusions, justify why excluded
      Assumptions:  documented, falsifiable, testable
    }
    BusinessRequirements {
      Objectives:    table(objective, metric, target, timeframe), SMART format
      KPIs:          quantifiable, 5-7 max, each linked to an objective
      BusinessModel: revenue_mechanism or value_mechanism, concrete
    }
    CompetitiveContext {
      Competitors:     table(name, strengths, weaknesses, our_differentiator), min 2
      Differentiators: unique_selling_points, defensible, not_generic
    }
    Constraints {
      Technical:   platform, integrations, tech_stack, performance_requirements
      Business:    budget_range, timeline, team_size, resource_limits
      Regulatory:  compliance, legal, data_privacy, accessibility
    }
  }

  Persist {
    engram {
      "prd/{project}/context" => business_context + user_brief
      "prd/{project}/state"   => file_path + generation_status + version
    }
    files {
      outputDir => PRD.md (always within .ia/)
    }
  }

  Update {
    trigger: user says "update|add|modify|actualiza|añade|modifica" + PRD reference
    flow:
      mem_search("prd/{project}") => recover_state
      => read_existing_prd_file
      => identify_sections_to_change
      => apply_changes(preserve_untouched_sections)
      => re_validate(modified_sections) // references/validation-rules.md
      => increment_version
      => re_persist(engram + file)
  }
}
```
