# Spec review — lesson-player (pre-gate)

Verdict: **APPROVED**

## Findings
None. (Round-2: prior save-once finding resolved — `attemptSaved` deck flag + `markAttemptSaved`/`reset` (spec decision, task-4/5/7), backward-compatible `persistOnMount` default-`true` on `LessonResults` (task-5), and new `@s13` "saved exactly once" / `@s21` no-re-save / `@s18` session-clear / `@s22` retake-re-save, all traced to tasks. Full traceability intact: `s1–s22` map both ways; tags unique; paths + layering valid.)
