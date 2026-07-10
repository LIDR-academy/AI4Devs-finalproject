---
name: create-user-story
description: Manual skill to create user stories in the user-stories/ directory following project format (As a / I want / so that, context, acceptance criteria, optional notes). Invoke explicitly with `/create-user-story` to generate a new story from a rough idea.
compatibility: 
  - Bash
---

## Overview

Use this skill when you need help creating a structured user story. Provide your initial idea — even if it's rough or incomplete — and the skill will ask clarifying questions to help you flesh it out into a complete story ready for `/ticket-orchestrator`.

## How it works

**Input:** A description of a feature, behavior, or capability you want to build (can be vague)

**Process:**
1. Ask clarifying questions to understand the user persona, their goal, the benefit, and relevant context
2. Gather acceptance criteria (what success looks like, observable outcomes)
3. Optionally collect details like analytics events, feature flags, or design notes if relevant
4. Generate a properly-formatted markdown file

**Output:** A file saved to `user-stories/<derived-name>.md` with confirmation of the file path

## Story format

The generated file follows this structure:

```markdown
# [Title]

**As a** [user type / persona]
**I want** [goal / action / capability]
**so that** [benefit / outcome / value]

## Context
[Background, constraints, related features, data sources, why this matters]

## Acceptance criteria
- [Observable outcome or success condition]
- [What the user can do or see when it works]
- [Given/When/Then style is helpful but not required; use natural language]

## Notes
[Optional: analytics event name, feature flag, design screenshot, related tickets, etc.]
```

## Example interaction

**User says:** "Users need to be able to search for lessons"

**Skill clarifies:**
- Who uses this? (students, teachers, both?)
- What are they searching by? (topic, date, difficulty, keyword?)
- Why do they need this? (they have too many lessons, faster discovery, etc.)
- When would they search? (in the lesson list screen, or from the home screen?)
- What counts as success? (see search results, can filter by type, etc.?)
- Any analytics or flags to track? (optional)

**Result:** A file `user-stories/lesson-search.md` with clear, structured acceptance criteria

## Running the skill

When you're ready, just describe your feature idea. The more details you have, the better — but don't worry if it's rough. The skill will ask follow-up questions to clarify:

- **Who** is the user? (the persona or type of person using this)
- **What** do they want to do? (the action, goal, or capability)
- **Why** do they want it? (the value, benefit, or problem it solves)
- **When/Where** would they use this? (context, screens, workflows)
- **Success criteria:** What does "done" look like? (observable, testable outcomes)
- **Optional details:** Analytics events, feature flags, design references, or related context

The skill will then generate your user story file and save it to the correct location.
