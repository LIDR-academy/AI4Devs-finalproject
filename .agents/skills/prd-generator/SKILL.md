---
name: prd-generator
description: "Trigger: PRD, product requirements, product definition, requisitos de producto, definición de producto. Generates a PRD from a user brief with section-by-section approval."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "2.0"
---

## Activation Contract

Load this skill when generating product requirements documents, writing detailed specifications, defining scopes, or mapping competitive context from a user brief. Triggers: `PRD`, `product requirements`, `product definition`, `requisitos de producto`, `definición de producto`.

## Hard Rules

- **SMART Metrics:** Enforce that all business requirements (objectives and KPIs) are defined in SMART (Specific, Measurable, Actionable, Relevant, Time-bound) formats.
- **Traceability:** Establish explicit maps between target user personas and core features.
- **Section-by-Section Approval:** The generation flow must pause and await user verification before assembling the final PRD.

## Decision Gates

| Phase / Condition | Target Mode |
|---|---|
| Section generated and validated | Await user feedback (approve / modify / reject) |
| Document update requested | Identify scope, edit, re-validate, and increment version |

## Execution Steps

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
}
```

1. **Brief Discovery**: Read user brief and confirm it has sufficient length.
2. **Drafting Iteration**: Sequence through PRD sections (Vision, Users, Scope, Objectives, Competitors, Constraints).
3. **Validating & Modifying**: Run validations against criteria templates, integrating user feedback.
4. **Assembly**: Collect sections, assign metadata tags, write the final file.

## Output Contract

Return:
- Fully assembled `PRD.md` file saved to `.ia/docs/prd/`.
- Summary of approved segments and overall status.

## References

- `references/validation-rules.md` — Quality checks, compliance criteria.
- `assets/prd-template.md` — Section templates for PRD documents.
