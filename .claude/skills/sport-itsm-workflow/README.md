# sport-itsm-workflow Skill

## Purpose

Entry point to the project's **process and operations** (not code patterns): the mandatory task
execution cycle, the verification discipline that decides when a task is done, the Nx/pnpm command
surface and what is runnable today, artifact ownership, and the change-to-documentation mapping.

Split out from the architecture and craft standards so the three are used at the right time:
structure while placing code (`sport-itsm-architecture`), craft while writing it
(`sport-itsm-engineering-principles`), process while operating the repo and closing a task (this
skill).

## Role

**Process/operations reference (support skill)** — the *how to operate the repo*.

## Loaded by

- `testing-implementer` and the dev agents when closing a task or verifying a change.
- Any agent that needs the command surface, artifact ownership, or documentation-update guidance.

## Constraints

- **No `docs/standards/` directory exists in this repository.** Authority is distributed across
  `CLAUDE.md` §2/§3/§5 and `docs/product/`; the skill carries the map and the process rules that
  have no other home. Where an authoritative document does cover a rule, cite it rather than
  restating it — a forked rule drifts.
- Covers process and operations only. Structure → `sport-itsm-architecture`. Code craft →
  `sport-itsm-engineering-principles`. Stack detail → `sport-itsm-backend` / `sport-itsm-frontend`.
- Statements about what exists in the workspace go stale as tickets land. Re-verify before relying
  on the "not runnable yet" list.
