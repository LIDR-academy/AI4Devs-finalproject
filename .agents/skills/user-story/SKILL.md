---
name: user-story
description: 'Create and refine user stories from feature ideas, requirements, or epics. Use when writing backlog items, defining acceptance criteria, splitting stories, or checking story readiness for implementation.'
argument-hint: 'Feature, epic, or requirement to turn into a user story'
user-invocable: true
disable-model-invocation: false
---

# User Story

## What This Skill Produces

This skill turns a rough idea, requirement, bug report, or epic into a structured user story that is ready for backlog review or implementation planning.

The default output should include:
- Story title
- User story statement in the form "As a..., I want..., so that..."
- Context and assumptions
- Acceptance criteria
- Test scenarios
- Implementation tasks
- Edge cases or non-goals

## When to Use

Use this skill when the user asks to:
- write a user story
- convert requirements into backlog items
- define acceptance criteria
- split an epic into smaller stories
- improve a vague feature request
- check whether a story is implementation-ready

Do not use this skill for:
- low-level technical task breakdown with no user outcome
- full product requirement documents
- architecture design documents

## Inputs

Ask for the following if they are missing:
- target user or actor
- desired outcome or capability
- business value or reason
- constraints, dependencies, or deadline
- scope boundaries

If the request is incomplete, proceed with explicit assumptions instead of blocking.

## Procedure

0. Please review the current status of the project by preparing a comparison table that outlines what has been implemented and what remains. This will allow the user to accept or reject each item before moving forward.

1. Identify the outcome.
Determine the actor, desired capability, and business value.

2. Determine the correct story level.
If the request is too large, treat it as an epic and propose a smaller story slice.
If the request is too technical, reframe it in terms of user value.

3. Draft the story statement.
Use a concise format:
As a <actor>, I want <capability>, so that <value>.

4. Define acceptance criteria.
Write concrete, testable conditions. Prefer observable behavior over implementation details.

5. Capture scope boundaries.
List non-goals, exclusions, or deferred behaviors when they matter.

6. Surface ambiguity.
List missing decisions, dependencies, risks, and assumptions.

7. Check readiness.
Verify the story is understandable, testable, and small enough to estimate.

8. Offer the next useful transformation.
If helpful, also provide one of these:
- a split into smaller stories
- implementation tasks
- test scenarios
- API or UI notes

9. Add delivery-facing follow-up sections.
When the story is stable enough, add:
- test scenarios derived from acceptance criteria
- implementation tasks that support delivery without replacing the user story

## Decision Rules

If the request is vague:
- produce a draft with assumptions clearly labeled
- ask only the minimum follow-up questions needed to reduce ambiguity

If the story is too large:
- label it as an epic candidate
- propose 2 to 4 smaller stories grouped by user outcome

If the request is technical only:
- translate it into user impact first
- keep technical notes in a separate implementation section

If acceptance criteria are missing:
- generate them using behavior-focused statements
- avoid coupling criteria to a specific code solution unless required

If multiple actors are involved:
- prefer one primary actor per story
- split the story when actors have different goals or flows

## Quality Criteria

The final story should be:
- clear enough for product and engineering to discuss without re-translation
- testable through explicit acceptance criteria
- small enough to estimate or flagged as too large
- anchored in user value, not just implementation work
- explicit about assumptions and open questions

## Output Template

One .md file in the same folder adding the suffix "-refined".

Use this structure by default:

```md
Title: <short outcome-focused title>

User Story:
As a <actor>, I want <capability>, so that <value>.

Context:
- <relevant background>

Acceptance Criteria:
1. <testable outcome>
2. <testable outcome>
3. <testable outcome>

Test Scenarios:
1. <validation scenario>
2. <validation scenario>

Implementation Tasks:
1. <delivery task>
2. <delivery task>

Non-Goals:
- <out of scope item>

Open Questions:
- <missing decision>

Readiness Check:
- [ ] Clear actor and value
- [ ] Testable acceptance criteria
- [ ] Scope is small enough
- [ ] Dependencies identified
```

## Completion Check

Complete the skill when the response includes:
- one well-formed story or a justified split into smaller stories
- acceptance criteria that can be validated
- test scenarios aligned to the criteria
- implementation tasks aligned to the story scope
- any key assumptions or open questions
- a note on whether the story is ready for implementation