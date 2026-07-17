# [EXAMPLE — copy this file, don't build it] Lesson list

> This is a format guide for `/ticket-orchestrator`. Create a real story as `user-stories/pending/<name>.md`
> (e.g. `user-stories/pending/lesson-list.md`) and run `/ticket-orchestrator lesson-list`.
> The orchestrator moves the story **pending → in-progress** when it starts and **→ done** when the feature is `pr_ready`.

**As a** learner
**I want** to see the lessons I've generated
**so that** I can pick one up and resume studying.

## Context
Lessons belong to the signed-in user and come from Supabase (`lessons` table).

## Acceptance criteria
- Given I'm authenticated and have lessons, when I open the lessons screen, then I see them (newest first).
- Given I have no lessons, when I open the screen, then I see an empty state inviting me to create one.
- Given the request fails, when I open the screen, then I see an error state with a retry action.
- While loading, I see a loading state.

## Notes
- Optional: paste a screenshot here if you have a design (no Figma in this repo).
- Analytics: `lesson_list_viewed`. Feature flag: none.
