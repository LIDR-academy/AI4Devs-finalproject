# Score / results summary (R7)

**As a** learner
**I want** to see my score at the end of a lesson, and have each retake recorded as its own attempt
**so that** I can gauge how much I learned and track my improvement over time

## Context
- PRD R7 (Score / results summary). Depends on R3 (activity slide types) for which types count, R2.1 (lesson composition) for the instructional-only edge case, and R9 (resume/restart) for how a retake is triggered.
- Only **system-checked** activity types contribute to the score total: multiple choice, fill-in-the-blank, and matching (per their respective stories' explicit product decisions). Flashcard self-marks and open-ended submissions are excluded entirely — this story sums only those three types' correct/incorrect results.
- Matching's exact scoring granularity (whole-slide correct/incorrect vs. per-pair partial credit toward the total) is still an open decision flagged in `activity-matching.md` — `spec_partner` should resolve it here since R7 is where it actually surfaces.
- Retake = restarting a completed lesson from the beginning (R9). Each retake is persisted as its own attempt record (score, total, timestamp) rather than overwriting the previous one — this is what the PRD's primary success metric (learning gain: delta between first and best/second attempt) is measured from.
- Product decision (this round): the results summary screen itself shows only the current attempt's score. It does **not** display a comparison to a previous attempt — improvement is measured later from the stored attempt history (analytics/data), not surfaced in-app. If a "see your progress across attempts" view is wanted later, that's a separate story.
- For `instructional only` lessons (R2.1), there are no gradable activities, so the summary shows a completion state instead of a score (no correct/total, no attempt record).
- No analytics event for this story at this time (deferred, consistent with the R3 activity-type stories).

## Acceptance criteria
- Given a lesson with system-checked activity slides (multiple choice, fill-in-the-blank, matching), when the learner completes all slides, then the results summary shows a score as correct/total, counting only those system-checked types.
- Given a lesson that also contains flashcard and/or open-ended slides, when the score is calculated, then those slides' results are excluded from the correct/total.
- Given a completed lesson, when the learner retakes it (restarts from the beginning per R9) and completes it again, then a new attempt (score, total, timestamp) is persisted separately from prior attempts — the previous attempt's record is not overwritten.
- Given an `instructional only` lesson (R2.1), when the learner reaches the end, then the summary shows a completion state (e.g. "Lesson complete") instead of a score, and no attempt record is created.
- Given a lesson with zero system-checked activity slides (e.g. `both` composition that happened to generate only flashcards/open-ended), then the summary shows the completion state, not a score of 0/0.

## Notes
- Data model: needs a per-attempt record (user, lesson, score, total, completed-at), not a single overwritable score field on the lesson — coordinate with R9's persistence work and `libs/types/src/lesson.ts`.
- Open decision carried over from `activity-matching.md`: whole-slide vs. per-pair scoring for matching's contribution to the total — resolve during spec.
- On-screen improvement comparison (current vs. previous attempt) was explicitly deferred this round — attempt history is recorded, but the summary UI shows only the current attempt.
- No analytics event for this story at this time (deferred).
