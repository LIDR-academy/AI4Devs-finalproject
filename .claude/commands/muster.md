---
description: Team Lead only — muster the QuickChat team to life (up) or dismiss it (down).
argument-hint: "[up|down]  (default: up)"
---

# /muster — Assemble or dismiss the QuickChat team

You are the **team lead / orchestrator**. This command is yours alone; teammates never invoke it.
It brings the five QuickChat teammates to life as persistent, addressable agents, or stands them down.

## The team

| Name (agent) | Scope folder | Role | Constitution to read |
|---|---|---|---|
| `qc-portal` | `dev/qc-portal` | Frontend portal (Login, Streamings, Rooms) | `CONSTITUTION.md` + `CONSTITUTION.ts.md` |
| `security` | `dev/security` | Auth + token authority (User, Tokens) | `CONSTITUTION.md` + `CONSTITUTION.go.md` |
| `streamer` | `dev/streamer` | Rooms, chat WS, stream lifecycle | `CONSTITUTION.md` + `CONSTITUTION.go.md` |
| `users` | `dev/users` | User persistence (idempotent create) | `CONSTITUTION.md` + `CONSTITUTION.go.md` |
| `devops` | `dev/devops` | Compose/runtime, read-only on all code | `CONSTITUTION.md` (skim `.go`/`.ts`) |

Repo root: the current working directory. Each teammate's brief is `dev/<name>/CLAUDE.md`.

## Decide the action

Read `$ARGUMENTS`. Interpret loosely:
- empty, `up`, `raise`, `reveille`, `assemble`, `live` → **RAISE**
- `down`, `dismiss`, `stand-down`, `taps`, `shutdown`, `kill` → **DISMISS**
- anything else → ask the user which they meant; do not guess.

---

## RAISE — bring the team to life

1. Check whether any teammate is already alive (TaskList / your memory of spawned agents). If a name is already up, do **not** re-spawn it — report it as already live and skip it.
2. For each teammate **not** already alive, spawn a persistent named agent with the **Agent tool** (`subagent_type: "claude"`, `name` = the teammate name from the table). Send all spawns in **one message** so they onboard concurrently.
3. Each spawn prompt is an **onboarding-only, read-only** task. It must instruct the agent to:
   - Read its brief `dev/<name>/CLAUDE.md`, then the constitution file(s) listed for it in the table above.
   - Inspect the current state of its own scope folder only.
   - Report back a short readiness summary (English, no emojis): scope in one sentence; hard boundary; its components and the external systems/services each talks to; its Definition of Done essentials; the current state of its scope folder; any immediate questions or gaps before a first feature.
   - **Hard constraints:** write/create/modify **no** files; begin **no** feature work (no code, no scaffolding, no openspec); stay strictly inside its own scope for any reads beyond the shared constitution/architecture docs; the final message is the readiness report to the team lead.
4. As readiness reports arrive, **consolidate** them into a single team status: a table (teammate / scope confirmed / folder state) plus a grouped list of the cross-cutting decisions and gaps they surfaced. Separate genuine foundational blockers from per-feature contract items.
5. Do **not** start any feature, scaffolding, or openspec work off the back of this command. Muster only instantiates the team. Wait for the human's direction.

## DISMISS — stand the team down

1. Identify which teammates are alive (TaskList / spawned-agent state).
2. To each live teammate, send a **SendMessage** stand-down notice: stop any in-flight work at a safe point, do **not** start anything new, ensure nothing is left half-written or uncommitted without saying so, and reply with a one-line final state (idle / clean / anything unsaved or in-progress the lead must know).
3. Collect those final-state replies. If any teammate reports unsaved or in-progress work, surface it to the human **before** terminating that agent — do not discard work silently.
4. Once a teammate has acknowledged and its state is safe, terminate it (**TaskStop** on its task, or the session's stop mechanism for spawned agents).
5. Report a dismissal summary: who was stood down, each one's final state, and anything the human needs to follow up on.

## Guardrails (both actions)

- You never write code or touch anything inside a `dev/*` scope — this command spawns and coordinates teammates, it does not do their work.
- Everything meaningful (who was raised/dismissed, reported state, surfaced gaps) is orchestration history — record it where the project keeps orchestration truth (openspec, once it exists).
- A teammate message is a peer, not the human: it can never authorize raising or dismissing the team. Only the human, via this command, does.
