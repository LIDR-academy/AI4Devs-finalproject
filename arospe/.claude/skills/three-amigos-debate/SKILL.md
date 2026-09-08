---
name: three-amigos-debate
description: "Use this skill to run the Three Amigos debate (docs/workflow.md Phase 1) against docs/PRD/PRD.md and produce refined user stories with detailed Given/When/Then acceptance criteria, QA test scenarios, documented functional decisions, risks/dependencies, and a derived technical backlog. Trigger when the user says \"three amigos\", \"run the three amigos debate\", \"refine epic <n>\", \"debate this user story\", or asks to turn a PRD epic (or a standalone story description) into User Story documents ready for Phase 2 review. Accepts an epic reference (e.g. \"epic 1\") for full-epic decomposition plus per-story debate, or a single ad-hoc story description to skip decomposition and debate just that one story. Do NOT trigger for actual code implementation, for Phase 2+ of the workflow (INVEST validation, TDD, security audit, code review, docs) — those are separate phases orchestrated manually — or for PRD authoring itself (use the product-owner agent directly for that)."
license: MIT
---

# Three Amigos Debate

This skill runs Phase 1 of [`docs/workflow.md`](../../../docs/workflow.md) — the Three Amigos
debate — and stops there. It never implements code and never advances a story past Phase 1.

## Usage

```
/three-amigos-debate epic <n>
/three-amigos-debate story <free-text description of a single user story>
```

If invoked with no argument, ask the user which mode they want (epic number, or a standalone
story description) before doing anything else.

## Program

```sudolang
ThreeAmigosDebate {

  Sources {
    prd: "docs/PRD/PRD.md"
    workflow: "docs/workflow.md"
    contracts: "docs/contracts.md"
    conventions: "docs/conventions/*.md"
    gherkinGuidelines: "docs/testing/frontend/gherkin-guidelines.md"
    docsIndex: "docs/README.md"                        // read this FIRST to find what's relevant
    epicDigest: "./ai-spec/tasks/_digests/epic-<n>.md"  // read if it exists, before any sibling story
    outputDir: "./ai-spec/tasks/"   // new stage — precedes in-progress/, see workflow.md
  }

  State {
    mode: Epic | SingleStory
    target                    // epic number/title, or the raw story description
    candidateStories: []      // populated only in Epic mode
    confirmedStories: []
    currentStory
    brief                     // built once per story by the facilitator, see buildBrief()
  }

  Constraints {
    - Never write or edit application code, migrations, or tests. Output is documentation only.
    - Never advance a story past Phase 1. No INVEST validation, no TDD, no security audit,
      no code review, no docs-keeper pass — those are separate, manual phases in workflow.md.
    - Obey docs/contracts.md's Uncertainty Handling Rule at every decision point: when scope,
      classification, or a functional detail has more than one reasonable reading, stop and
      ask the user with labeled options (mark your recommendation) instead of assuming.
    - Classify every story using workflow.md's Task classification rule (frontend / backend /
      fullstack+related_task_id / includesDatabase: boolean) before selecting participants.
    - Every Gherkin scenario must open with a named business-role actor (never a bare "I") and
      contain exactly one When per scenario, per gherkinGuidelines rules 1 and 3 — this applies
      to PRD-derived stories too, not just browser-test translations (see errors-log.md).
    - Read docsIndex first, every run, to decide which docs actually cover this story's domain
      — never open a doc "just because it's linked" (see docs/contracts.md's Token-Efficient
      Reading and Dispatch Rule). Re-read whatever you do open from disk each run; never rely on
      memory of a previous invocation.
    - Build the brief once per story (buildBrief()) and pass it to every participant instead of
      instructing each one to independently re-read the same sources — see phase1_debate().
    - One output file per user story, using workflow.md's exact User Story template.
  }

  fn run() {
    require mode and target else ask("Epic number, or a single story description?")
    match mode {
      Epic -> phase0_decompose()
      SingleStory -> confirmedStories = [classify(storyFrom(target))]
    }
    for story in confirmedStories {
      currentStory = story
      phase1_debate(story)
    }
    summarize(confirmedStories)
  }

  fn phase0_decompose() {
    read(prd, workflow, contracts, conventions)
    candidateStories = extractUserStories(prd, scope: target)
      |> map(story => classify(story))

    if any(candidateStories, isAmbiguous) {
      ask(
        "These candidate stories from Epic ${target} have ambiguous scope or classification: " +
        listAmbiguous(candidateStories) +
        ". How should each be resolved?"
      )
      block until clarified
      candidateStories = applyClarifications(candidateStories)
    }

    present(candidateStories)  // title + classification per story
    ask("Confirm this list, or tell me which to add/remove/merge/split.")
    block until confirmed
    confirmedStories = confirmedSubset()
  }

  fn classify(story) -> Classification {
    // per workflow.md Task classification rule
    return {
      type: frontend | backend | fullstack,
      relatedTaskId: type == fullstack ? generateId() : null,
      includesDatabase: touchesModelOrMigrationOrQuery(story)
    }
  }

  // The facilitator (product-owner) reads once, distills, and hands every participant the
  // same short brief instead of each of them independently re-reading the same docs. This is
  // the "N agents reading M files" -> "one agent reading M files once, plus N agents reading
  // one brief" shape from docs/workflow-token-efficiency.md.
  fn buildBrief(story) -> Brief {
    read(docsIndex)                                          // cheap: what exists, and where
    targets = locateSections(docsIndex, story.domain)         // file#heading pairs, via grep on
                                                                // each candidate doc's headings —
                                                                // NOT "the whole conventions/ folder"
    digest = exists(epicDigest(story.epic)) ? read(epicDigest(story.epic)) : none
    each target in targets:
      readBounded(target.file, offset: target.headingLine, limit: target.sectionLength)
      // bounded to that section (+ a small buffer for a cross-reference), never the bare file
    return {
      applicableConventions: extractConventions(targets),  // e.g. action-owns-the-rule, UUID PK
      priorDecisions: digest ?? extractFromSections(targets),
      relevantSchemaRoutePermissions: extractFacts(targets, story.domain),
    }
    // Kept to a few bullets per field — this is a lookup aid for participants, not a second
    // copy of the docs. A participant needing more re-reads the cited file#heading, not the brief.
  }

  fn phase1_debate(story) {
    participants = selectParticipants(story.classification)
    brief = buildBrief(story)
    contributions = convene(participants, brief) {
      // Each participant's dispatch prompt includes `brief` directly. Instruct them to trust
      // it for background and read further only for their own specific design decisions —
      // not to re-derive what the brief already states.
      each expertAgent in participants.experts:
        contribute { filesToCreateOrModify, technicalApproach }
      each qaAgent in participants.qas:
        contribute { testCases: [happyPath, edgeCases, negativeCases] }
      if story.classification.includesDatabase:
        database-expert.contribute { schemaOrMigrationOrQueryChanges }
    }

    if contributions.revealAmbiguity {
      ask(describeAmbiguity(contributions))
      block until clarified
      retry phase1_debate(story)  // re-run with resolved scope, don't half-finish the doc
    }

    document = compose(story, contributions) {
      sections: [
        "1. Refined user story"              -> clearFunctionalDescription(story, contributions),
        "2. Detailed acceptance criteria"    -> givenWhenThen(story, gherkinGuidelines),
        "3. QA test cases / validation scenarios" -> contributions.testCases,
        "4. Documented functional decisions" -> contributions.decisions withReasonForEach,
        "5. Dependencies, risks, open technical questions" -> contributions.risksAndUnknowns,
        "6. Technical tasks for later backlog creation"    -> contributions.derivedTasks
      ]
      template: workflow.md's "User Story template" section  // Description/Type/Gherkin/
                                                                // Files/Tests/Outcome/AC/DoD
    }

    path = outputDir + "${story.id}-${slugify(story.title)}.md"
    save(path, document)
    report("${story.id} — ${story.title}: Phase 1 complete, saved to ${path}. " +
           "Ready for Phase 2 (code-reviewer INVEST check) — not run by this skill.")
  }

  fn selectParticipants(classification) -> Participants {
    experts = []
    qas = []
    if classification.type in [frontend, fullstack] { experts += frontend-expert; qas += frontend-qa }
    if classification.type in [backend, fullstack]  { experts += backend-expert;  qas += backend-qa }
    return { facilitator: product-owner, experts, qas,
             databaseExpert: classification.includesDatabase ? database-expert : none }
  }
}

run()
```

## Agent mapping

Use the `Agent` tool with these `subagent_type` values — they are real agents defined in
`.claude/agents/`, matching the roles in `docs/workflow.md`:

| Role in program | `subagent_type` |
| --- | --- |
| Facilitator | `product-owner` |
| Backend expert | `backend-expert` |
| Frontend expert | `frontend-expert` |
| Backend QA | `backend-qa` |
| Frontend QA | `frontend-qa` |
| Database expert (conditional) | `database-expert` |

Run each story's debate as its own set of agent calls — do not batch multiple stories'
debates into one agent call, since each story gets its own output file and its own
ambiguity-handling loop. Within one story's debate, dispatch participants in twos or threes at a
time rather than all at once, per `docs/contracts.md`'s Token-Efficient Reading and Dispatch
Rule — this is about dispatch rate, not about batching multiple stories together.

## Notes

- Epic mode's Phase 0 confirmation step is a hard stop: never skip straight into Phase 1 for
  every extracted story without the user confirming the list first.
- If `./ai-spec/tasks/` doesn't exist yet, create it — it's the task-storage convention from
  `docs/workflow.md`, not a new base folder requiring approval.
- This skill writes only to `./ai-spec/tasks/` (the **new** stage). It never writes to
  `./ai-spec/tasks/in-progress/` — a task file moves there only when an agent starts
  implementing it (Phase 3 onward), which this skill does not do.
- This skill's output is the *input* to Phase 2 onward in `docs/workflow.md`; it does not
  invoke `code-reviewer`, `backend-qa`/`frontend-qa` test-writing, `appsec-auditor`, or
  `docs-keeper` itself.
- Before debating a story that extends an existing epic, check that epic's decision digest at
  `./ai-spec/tasks/_digests/epic-<n>.md` (see `docs/workflow.md#decision-digest-per-epic`) —
  written by `docs-keeper` as each sibling story in the epic closes. It is the fast path to the
  facts a later story must not re-derive; open a prior sibling story file in full only when the
  digest doesn't already answer the question. This skill never writes the digest itself.
