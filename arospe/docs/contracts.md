# Contracts

Behavioral contracts that govern what actions an AI agent working in this repository is allowed or forbidden to take, and how it should make decisions when working here. This is distinct from [architecture/authorization.md](architecture/authorization.md) (application-level roles/permissions enforced by the running app) and [conventions/](conventions/) (code style) — those govern the *product*; this file governs the *agent*.

New contracts are appended below as additional `###` sections; nothing here is removed without the change being visible in this file's history.

### Uncertainty Handling Rule

When you are not sufficiently confident that you understand the user's intent or have all the information required to complete a task correctly, **do not make assumptions or choose an option on the user's behalf**.

Follow this protocol:

1. **Proceed only when the request has a single, clear, and well-supported interpretation.**
2. **If any required information is missing, ambiguous, or open to multiple reasonable interpretations, stop before taking action.**
3. **Ask concise, specific clarifying questions to resolve the ambiguity.**
4. **Whenever appropriate, present multiple possible answers or courses of action. Clearly label the option you believe is the best fit for the project as _**(recommended)**_, and briefly explain why you recommend it.**
5. **Wait for the user's response before continuing with any action that depends on the answer.**
6. **Never invent missing information, infer user preferences, or make irreversible decisions without explicit confirmation.**
7. **When in doubt, asking a clarifying question is always preferred over making an assumption.**

Your goal is to maximize correctness rather than speed. It is better to ask one clarifying question than to complete the wrong task. When providing options, your role is to guide the user with a recommendation—not to make the final decision on their behalf.

### Commit Approval Rule

You must **never commit anything on behalf of the user**. Committing is a human decision that requires a human to review the actual staged changes first — even a direct, explicit-seeming instruction to "commit" is a request to prepare a commit for review, not to run `git commit` yourself.

Follow this protocol:

1. **Stage only the intended changes explicitly** with `git add <files>`, naming the specific files. Never stage with `git add -A`, `git add .`, or any other bulk/catch-all form.
2. **Prepare a draft commit message** for the staged changes.
3. **Present both to a human for review**: what was staged and the proposed commit message, so the human can inspect the actual staged changes (e.g. via `git diff --staged` / `git status`) before deciding.
4. **Wait for explicit human approval before running `git commit`.** Do not run `git commit` until a human has reviewed the staged changes and explicitly approved. Absent that approval, stop at staging plus a proposed message.
5. **Treat even an explicit "commit this" as stopping at staging plus a proposed message for review** — do not interpret it as pre-approval to run `git commit`. The approval must come *after* the human has seen the actual staged changes.

This contract is intentionally stricter than the general "only commit when explicitly asked" git-safety guidance: here the boundary is that you never run `git commit` at all without a human first reviewing the staged diff and explicitly approving.

### Destructive Database Command Rule

Never run `migrate:fresh`, `migrate:refresh`, `migrate:rollback`, `migrate:reset`, `db:wipe`, or any other command that drops or rewinds schema/data against this project's **real** database without the user's **explicit authorization first**. "Real" means the local development database (`arospe`, per `.env`'s `DB_DATABASE`) exactly as much as any staging/production database — anything that is not the isolated `testing` database Laravel's test suite runs against.

Follow this protocol:

1. **Before running any destructive migration/wipe command directly** via `php artisan` (or `docker exec`/Sail), **stop and ask the user for explicit authorization.** Do not run it — not for debugging, not to "just reset state," and not because a similar destructive action was approved earlier in the same session. Approval does not carry over across commands or sessions; ask again each time.
2. **Running the test suite itself is exempt and always safe** — `php artisan test`, `vendor/bin/pest`, `vendor/bin/phpunit`, and Pest's `RefreshDatabase`/`DatabaseTransactions` traits may be run freely, because `phpunit.xml` pins `DB_DATABASE=testing` for every process launched through them, isolating all resets to the dedicated testing database.
3. **Do not trust a bare `--env=testing` flag (or similar) to redirect a direct `artisan` invocation to a safe database.** This repo has no `.env.testing` file, so `php artisan migrate:fresh --env=testing` run directly (outside the test runner) silently falls back to `.env`'s real `DB_DATABASE` (`arospe`) — this already happened once in this project and wiped the dev database (see [errors-log.md](errors-log.md)). The only reliable way to target the testing database outside the test runner is to export `DB_DATABASE=testing` explicitly, or better, just invoke through the test runner itself.
4. **If you need to inspect or reset test data while debugging, run the actual test suite** (it resets its own database safely) instead of a manual `artisan` command against whatever database happens to be configured.

This is intentionally stricter than the general "confirm before destructive operations" git-safety guidance: here, prior approval never generalizes across commands or sessions, and the testing-database exemption is narrow — it covers only commands executed through Laravel's test runner, never a manually typed `artisan` command that merely references "testing."

### Full Test Suite Gate Rule

A task must **never be closed** — i.e. its file must never be moved from `ai-spec/tasks/in-progress/` to `ai-spec/tasks/done/` (Phase 7 of [workflow.md](workflow.md)), and work must never proceed to the next task — while even one test in the **full** suite is failing. "All tests green" means every test in the project, not just the tests the current task added or touched.

Follow this protocol:

1. **Immediately before moving a task's file to `done/`, run the complete suite** (`php artisan test`, not a filtered subset) and confirm it reports 100% passing.
2. **A failing test blocks closure regardless of whose it is.** A failure that predates the current task, belongs to unrelated code, or was only just discovered is not an exception — "not my test" does not authorize closing the task anyway. Diagnose and resolve it first, following [workflow.md](workflow.md) Phase 3's existing "Test issue" vs. "Code issue" distinction for how to fix it and who fixes it.
3. **A suspicious mass-failure must be verified as real before being acted on or reported as a regression.** If a full-suite run shows unexpected, widespread failures, first rule out test-run interference — most commonly two processes (e.g. two agents, or a manual run overlapping an agent's run) exercising the same shared database concurrently, which can produce deadlocks or seed collisions that look like a regression but are not one. Re-run the suite in isolation, with no other process touching the same database, before drawing any conclusion.
4. **Only a single, isolated, 100%-passing full-suite run is sufficient evidence to close a task.** A task file's Definition of Done "full suite green" checkbox must not be checked off, and the file must not be moved to `done/`, on the strength of anything weaker than that — not a partial/filtered run, not a run contaminated by concurrent interference, and not a prior run whose result may since have been invalidated by later changes.

This complements [workflow.md](workflow.md)'s existing gates — Phase 3's TDD requirement that tests are green before Phase 4, and Phase 5's "the full test suite passes" review criterion — by making the same requirement binding specifically at the Phase 7 closure step, so a regression introduced or discovered between Phase 5's review and closure cannot slip a task into `done/` unnoticed.

### Parallel Agent File-Ownership Rule

Never dispatch two or more agents **in parallel** — concurrently, in the same tool-call batch — when their scopes can write to the same file. "Can write to" is broader than "is about": it includes any file an agent's **verification or regression-proof step** might touch, even transiently, even if that file is not its stated primary target.

Follow this protocol:

1. **Before dispatching a batch, enumerate each agent's full write set**, not just the file its task is named after. A test-fixing agent that proves an assertion can genuinely fail by temporarily editing application code writes to that application file; a docs agent asked to verify a snippet against the code may not. Judge by the *method* each agent will use, not by the task's title.
2. **If two agents' write sets intersect at all, do not run them in parallel.** Choose one of two options: run them **sequentially** (the first completes and reports before the second is dispatched), or **state the ownership boundary explicitly in both agents' instructions** — naming which agent may write the shared file and requiring the other to treat it as read-only.
3. **A transient edit counts as a write.** Reverting it afterwards does not make it safe: while it is in place, a concurrent agent can read it, and the last writer wins if both edits are real.
4. **Treat an unexplained edit as blocking, not as noise.** An agent that observes a change it did not make must stop and report rather than proceed or work around it — that is the correct response even when the cause turns out to be benign concurrency, because the same symptom is what a genuine injected instruction or a lost-edit bug looks like.
5. **Do not accept a verification run that overlapped a concurrent agent's edits.** Re-run it in isolation, consistent with the Full Test Suite Gate Rule above, which already refuses contaminated evidence.

This rule exists because of a real incident during story 0006's Phase 5 re-fix round: two subagents scoped to "different files" both ended up writing to `resources/views/livewire/users.blade.php`, one persistently and one transiently as part of a legitimate regression-proof, and the resulting intermediate diff was briefly suspected of being adversarial. See [errors-log-archive.md](errors-log-archive.md#two-agents-dispatched-in-parallel-both-wrote-to-the-same-blade-view--2026-08-16) for the full account.

### Token-Efficient Reading and Dispatch Rule

Every agent in this project independently re-reads large parts of `docs/` on every dispatch, with no context shared between sibling subagent calls — this is the dominant cost in the multi-agent workflow, not a minor inefficiency. See [workflow-token-efficiency.md](workflow-token-efficiency.md) for the measurements this rule is based on. Follow this protocol whenever you read documentation or dispatch another agent:

1. **Read `docs/README.md`'s index first, always.** It is a compact, one-entry-per-doc summary built for exactly this — deciding *which* doc actually covers your task's domain — before opening any full doc file. Never open a doc "just in case" because an agent's own instructions say "read all of `docs/`"; open only the doc(s) whose index entry names the feature, table, route, or convention your task actually touches.
2. **Scope every read to an exact anchor, not to a doc category, and never hand a subagent a bare filename when you already know the section.** "I'm touching `sales_regions`" means locating the exact heading — `grep -n '^#' docs/architecture/authorization.md | grep -i 'sales.region'`, or the file's own Table of Contents — and reading with `offset`/`limit` bounded to that section (plus a small buffer for a cross-reference), never opening a 1,000+ line file bare with no range. This binds dispatch, not just your own reading: when you point another agent at a doc, name the exact `file.md#heading` (or `file.md`, lines N–M) in the prompt — "see `docs/architecture/authorization.md`" tells a subagent nothing about which 40 of its 1,467 lines it actually needs, and it will default to reading all of them. **This is a reading tactic, not a reason to split a large doc into smaller files** — see [workflow-token-efficiency.md](workflow-token-efficiency.md#what-not-to-change) for why splitting is rejected: it doesn't reduce what a genuinely-needing agent must read, it multiplies per-file overhead, and it risks the exact link-integrity drift [errors-log.md](errors-log.md) and [workflow.md](workflow.md#link-integrity-check-on-every-stage-move) already catalog as a real, repeated failure mode in this project.
3. **A facilitator distills once; specialists don't each re-derive the same background.** When `product-owner` convenes a Three Amigos debate (or any orchestrator dispatches more than one specialist against the same feature), the facilitator reads the load-bearing docs **once**, extracts a short brief (existing conventions that bind this task, related decisions/shapes from prior stories, the relevant schema/route/permission facts) and includes that brief directly in each participant's dispatch prompt. A participant receiving a brief trusts it for background and reads further only for the part of the task that is specifically theirs to design — it does not independently re-read the same five files the facilitator already digested.
4. **The Phase 1 task file is itself a carried-forward brief for every later phase — treat it as one.** `buildBrief()` (item 3) only runs during Phase 1 (Three Amigos); Phases 3–6 have no facilitator distilling for `backend-expert`/`frontend-expert`, `backend-qa`/`frontend-qa`, `appsec-auditor`, or `code-reviewer`. But each of them already reads the task file under `ai-spec/tasks/{in-progress,done}/` per its own agent definition, and that file's "Files to create/modify" and "Documented functional decisions" sections **are** Phase 1's distilled output — the same load-bearing facts a brief would contain, already written down. Treat the task file as the primary source for those facts and open a full `docs/` page directly only to fill a gap the task file doesn't cover, not to re-derive what Phase 1 already worked out.
5. **Prefer a short per-epic decision digest over re-reading every prior sibling story in full.** Before designing a story that extends an existing epic, check that epic's digest (see [workflow.md](workflow.md#decision-digest-per-epic)) for the shapes and decisions later work must not re-derive, instead of opening every already-closed story file in that epic end to end.
6. **Batch heavy agent dispatches in twos or threes, not four-plus, unless the user asks for more.** Running several Opus/Sonnet-tier specialists concurrently is correct for genuinely independent, disjoint-file work (per the Parallel Agent File-Ownership Rule above), but it multiplies tokens-consumed-per-minute — this has produced real rate-limit failures in this project. Prefer two-to-three at a time, and feed one agent's finished output into the next rather than having every agent re-derive it independently.
7. **Diagnose a failed dispatch before blindly retrying it.** When an agent call fails (a connection error, a rate limit, a timeout), first determine whether it failed before or after doing its expensive reading/analysis — resuming or narrowing the retry to the remaining work avoids re-paying a reading cost that was already paid once.
8. **Keep a resumed agent's instruction terse and pointed.** A resumed agent already carries its own prior conversation forward; state the specific fix or finding and its exact location (file, line, decision label) rather than re-supplying background context the agent's own history already has. Repeating it doubles the cost of something already paid for.
9. **Route mechanical, low-judgment work to a lighter model only when that model's own fixed overhead leaves room for the task.** Verification-only passes, transcription, and translation are good candidates for a cheaper model tier — but a specialized agent whose own system prompt already loads a large project-wide index (this repo's own `docs-keeper` is a confirmed case) can exceed a small model's context window before the actual task is even added. Check an agent's own baseline context cost before assuming a lighter model is a free win; when unsure, keep the agent's assigned model tier.

This does not lower the bar for what gets read when it matters — a genuine architectural decision, a security-relevant change, or anything this project's `docs/errors-log.md` shows gets missed by insufficient reading still gets the full read it needs. This rule is about not paying that cost redundantly across every sibling agent call for background that one careful read already established.

### Doc Growth Management Rule

`docs/README.md` hit 223k characters, `docs/errors-log.md` hit 184k, and `api/routes.md`, `database/schema.md`, `conventions/base-standards.md` and `database/migrations.md` were independently trending toward the same 150k-char hard limit — the same bloat pattern each time: an accumulating footer chain of `_Previously: ...` blocks instead of one current line, and (in `routes.md`'s case) a section re-narrating detail another doc already owns in full. This is now a recognized, recurring failure mode rather than a one-off, so every `docs-keeper`/docs-maintainer sync pass must apply the following, not just the pass that happens to notice a file is already close to the limit:

1. **No accumulating footer changelogs.** A doc's revision history is a single current `_Last updated: <date>, <what changed>_` line — never a growing chain of `_Previously: ...` blocks. If a `_Previously:` block already exists when you edit a file for any reason, fold it into the current line instead of prepending another one, even if your own change is unrelated to the footer.
2. **Write for current state, not as a chronological log.** Prose in architecture/schema/route/convention docs should state what is true *now*, concisely and specifically — avoid accumulating "Since task X... Since story Y... corrected by Z..." narrative chains inline. If the historical journey (why a decision was made, what was tried and rejected) has real value, it belongs in `errors-log.md`, a `decisions/` ADR, or a dedicated section of the target doc — not repeated inline every time a later story touches the same area.
3. **Watch for a section outgrowing its file.** When a sync pass notices a section has grown substantially across several stories — a strong sign: the section's own char count is a large fraction of the whole file, or it keeps needing "Since story N" additions — consider splitting it into its own file and linking to it from the original, the same move already applied to `docs/errors-log.md` (archived + topic-indexed), rather than continuing to expand it in place indefinitely. This applies to both index-style bloat (`docs/README.md`'s pattern: one bullet absorbing a full changelog) and target-doc bloat (`routes.md` re-narrating what `architecture/authorization.md` already owns — state the current contract concisely and link out instead).
4. **This is a checklist item, not an occasional cleanup.** It is checked on every sync pass — see the docs-maintainer skill's Definition of Done — not only once a hard limit has already been tripped.

This directly reduces the largest token cost the [Token-Efficient Reading and Dispatch Rule](#token-efficient-reading-and-dispatch-rule) above already targets: a bloated doc is exactly the file a later agent is told to open at a precise anchor, and an accumulating footer or a re-narrated section makes that anchor's surrounding content larger and staler than it needs to be.

### CI / GitHub Actions Review Protocol

When asked to review this repository's CI, diagnose a failing pipeline, or explain "why did the build break," treat this as an investigation with a fixed order rather than an open-ended "go look at GitHub Actions" task. This project's actual CI configuration, coverage enforcement state, and known environment findings are documented in [testing/ci/pipeline-integration.md](testing/ci/pipeline-integration.md) and [testing/ci/commands.md](testing/ci/commands.md); this rule governs your *behavior* while reviewing CI, not the pipeline's own configuration — don't restate those pages' content here, follow them.

Follow this protocol:

1. **List the recent runs for the current branch first**, not the whole repository's run history:

   ```bash
   gh run list --branch $(git branch --show-current) --limit 5
   ```

2. **If a run failed, view only the failed step's log**, not the full log of every job and step — the failed-only view is what you need to diagnose, and the full log is mostly noise:

   ```bash
   gh run view <run-id> --log-failed
   ```

3. **Reproduce the failure locally before touching any code.** A CI failure is a claim about this repository's state, not yet a diagnosis — confirm it locally first, using this project's own commands rather than a generic equivalent (`npm test` means nothing here; this is a Pest/Laravel project):

   ```bash
   php artisan test --compact --filter=<TestName>   # a failing test — narrow first, then run the full suite unscoped per the Full Test Suite Gate Rule above
   vendor/bin/pint --format agent                    # a formatting/style failure — unscoped, not --dirty, to match what CI actually checks
   composer types:check                              # a Larastan/static-analysis failure
   ```

   See [testing/ci/commands.md](testing/ci/commands.md) for the full local command reference (single test, single file, coverage, parallel run) and [conventions/base-standards.md](conventions/base-standards.md#quality-gates) for which of the three quality gates a given failure belongs to.

4. **Fix the real cause, not the test — unless the test itself is what's wrong.** Apply the same distinction [workflow.md](workflow.md) Phase 3 already draws between a "Test issue" and a "Code issue": a test asserting a genuinely wrong expectation is fixed as a test change; application code that violates a real, correctly-asserted contract is fixed as an application change. Don't default to loosening, skipping, or deleting an inconvenient assertion just because that's the faster way to turn CI green — this is the same bias the Full Test Suite Gate Rule above already states as "a failing test blocks closure regardless of whose it is."
5. **Never push or re-trigger a workflow run without being asked first.** `git push`, `gh run rerun <run-id>`, and `gh workflow run <workflow>` are all treated the way the Commit Approval Rule above treats `git commit`: diagnosing and preparing a fix does not carry implicit authorization to make it visible on the remote or to consume CI minutes re-running it. Stop once the fix is staged and proposed, and wait for explicit approval before pushing or re-triggering anything — a direct, explicit-seeming instruction to "fix the pipeline" is authorization to diagnose and prepare the fix, not to push it.

This protocol is diagnostic-first by design: steps 1–3 exist to establish, cheaply and locally, exactly what is broken before any code changes are made — the same "verify before acting" instinct behind the Destructive Database Command Rule and the Full Test Suite Gate Rule above, applied here to a CI run instead of to the database or to task closure.

### Commit Granularity Rule

When preparing commits under the Commit Approval Rule above, split them **by layer** — production code, tests, and documentation each get their own commit — instead of bundling a change into one. This is not a new practice being introduced; it is what this project's own `git log` already shows for every story landed so far, made explicit so it keeps happening deliberately rather than by habit.

Follow this protocol:

1. **One commit per layer, minimum.** Production code (`feat`/`fix`/`refactor`/`style`/`chore`), tests (`test`), and documentation (`docs`) are staged and proposed as separate commits — never combined into one, even when they land in the same session for the same story. Skip a layer's commit if it has no changes; don't pad one out to force a fixed count.
2. **Use Conventional Commits, matching this repo's real history**: `type(scope): summary`. Types actually in use here: `feat`, `fix`, `test`, `docs`, `chore`, `refactor`, `style`. `scope` is the feature/module area the change touches (`products`, `sales-regions`, `wysiwyg`, `deps`, `tasks`) — never the task/story id, and never generic (`app`, `misc`).
3. **Name the story/task in the message.** By default this goes in the body (e.g. "Story 0029 landed...", "Moves `ai-spec/tasks/0029-....md` to `done/`"). Add a `-- story NNNN` / `-- task NNNN` suffix to the title itself when the title alone would otherwise be ambiguous about which story it belongs to — this repo's history does that mainly for `chore(deps):` and `chore(tasks):` commits (e.g. `chore(deps): add symfony/html-sanitizer -- story 0024a`).
4. **`docs(tasks):`** is for task-file lifecycle work specifically — moving `ai-spec/tasks/in-progress/*.md` to `done/`, the two-direction link-integrity fix-up, Phase 7 closure corrections. **`docs(<feature>):`** is for syncing `docs/` content (schema, routes, architecture, conventions) to what actually shipped. This repo's history shows both a single combined `docs(<feature>):` commit doing both, and two separate commits (`docs(<feature>):` then `docs(tasks):`) — either is acceptable; what must not happen is folding either `docs` commit into the `feat`/`test` commits.
5. **Order the commits `feat`/`fix` → `test` → `docs`** (interleaved per TDD cycle when a story lands as several small feat→test pairs is fine), stopping at `docs(tasks)` last since it closes the story. Stage, draft, and present each one individually per the Commit Approval Rule — do not batch all layers into a single review-and-approve step.

This composes with, and does not relax, the Commit Approval Rule: splitting by layer changes how many commits get proposed, not whether each one is staged, drafted, and explicitly approved by a human before `git commit` runs. The point is traceability — a reviewer (human or a later `code-reviewer`/`docs-keeper` pass) can inspect, discuss, or revert what changed in the app, in its test coverage, and in its documentation as three separate, independently reviewable units, instead of one commit conflating all three.

_Last updated: 2026-09-07 — Added the CI / GitHub Actions Review Protocol: a new agent-behavior contract for CI triage (list recent runs for the current branch, view only the failed step's log, reproduce locally before touching code using this project's real Pest/Pint/Larastan commands, fix the real cause rather than the test unless the test is wrong, never push or re-trigger a workflow without being asked first). No prior story or task triggered this — this repository had no documented procedure at all for how an agent should behave when asked to review CI, unlike its already-documented pipeline *configuration* ([testing/ci/pipeline-integration.md](testing/ci/pipeline-integration.md)) and local test *commands* ([testing/ci/commands.md](testing/ci/commands.md)), neither of which governs agent behavior. Also carries the 2026-09-05 addition of the Commit Granularity Rule (split commits by layer: code/tests/docs, per this repo's own established `git log` convention) and the Doc Growth Management Rule (no accumulating footer changelogs — codifying the fix applied that day to six files found trending toward this project's 150k-char hard limit; see the mirrored checklist item in `.claude/skills/docs-maintainer/SKILL.md`'s Definition of Done).
