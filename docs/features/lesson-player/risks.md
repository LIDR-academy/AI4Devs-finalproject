# Risks — lesson-player

## Technical
- **No full-lesson fetch exists yet.** `LessonsDao` only reads `LessonSummary`; the player needs the full `Lesson` (with `slides` JSON). *Mitigation:* task-1 adds `getLessonById` / `LessonsService.getLesson` / `useLesson`, mirroring the existing `use-lessons` reducer stack; `slides` is a JSON column on the `lessons` row (no join).
- **Results-as-last-slide reducer model.** N = contentSlides + 1; the terminal index renders `LessonResults`, not a `Slide`. Off-by-one on the boundary (Next on last content, Next hidden on results, Back from results) is the main correctness risk. *Mitigation:* pure reducer with named transitions + explicit boundary tests (task-4); e2e covers enter/leave results.
- **No cross-route store needed.** Because results is inline, the deck's React state feeds `LessonResults` directly — the earlier module-singleton handoff is dropped. *Mitigation:* single source of truth (deck reducer); no route-param/serialization concerns.
- **Duplicate attempt saves on results re-entry.** Back (@s20) unmounts `LessonResults`; re-enter (@s13) remounts it, and R7 saves on mount (skips only on re-render, not remount) — so naive wiring persists a new attempt every visit. *Mitigation:* deck `attemptSaved` flag + backward-compatible `persistOnMount` prop gates R7's save to the first entry per session; retake clears the flag for a new save (task-5/task-7, @s13/@s21/@s22).
- **Signed-URL resolution latency/failure.** Storage signed URLs are network I/O and expire. *Mitigation:* service normalizes failure to `null`; `SlideImage` degrades to text-only, no error (task-3/task-10); short TTL, no cache in R4.
- **`storagePath` → bucket mapping.** `SlideImageRef.storagePath` must resolve against the correct bucket (`pdf-images`). *Mitigation:* confirm path shape (folder vs full path) during task-3; DAO owns bucket + `createSignedUrl`.
- **Answer-restore prop threading.** Study-buddy activity wrappers don't currently forward `initialAnswer` / `initialSubmittedAnswer`. *Mitigation:* task-6 threads them (incl. Back from results); organisms already accept them.
- **Open-ended has no `isCorrect`.** `OpenEndedAnswer` doesn't satisfy `GradedAnswer`. *Mitigation:* `buildLessonGradedAnswers` maps it to `isCorrect:false` (non-system-checked, never scored) (task-5).

## Product
- **Legacy `results.tsx` route left on the stub.** After folding results into the player, the standalone route + `index.tsx` "View results" link still render the stub fixture. *Mitigation:* documented out of R4's happy path (spec non-goals); the demoable play flow uses real inline data; full cleanup/persistence deferred to R9. Flag if the stub route should be removed now.
- **Load-error UX not in the original debate.** Chosen: Error = Retry + Back (task-9). *Mitigation:* recorded as a resolved decision with rationale; revisit at gate if Back-only preferred.

## Timeline / dependencies
- Depends on R1/R2/R2.1/R3/R7 — all **done**. No blocking upstream work.
- R9 (resume) sequences after/alongside R4; it will add persistence and can retire the legacy `results.tsx` route. Keep the graded-answers shape (`{ lesson, answers }`) swap-friendly.
