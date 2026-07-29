---
name: /kan-pipeline
id: kan-pipeline
category: Workflow
description: Run the full KAN ticket pipeline (enrich → propose → apply → PR → human merge → archive)
---

Run the **kan-pipeline** orchestrator for Jira `KAN-*` tickets.

**Load skill:** `kan-pipeline` from `.cursor/skills/kan-pipeline/SKILL.md`

**Queue:** `ai-specs/queues/kan-implementation-queue.yaml`

**Fork only:** All pushes and PRs target **`CeliaMerino/AI4Devs-finalproject:main`** via `origin`. Never open PRs against `LIDR-academy` (`upstream`).

**Input**: Optional argument after the command:

| Argument | Action |
|----------|--------|
| *(none)* | Start or resume the full queue |
| `status` | Show progress only |
| `next` | Implement one ticket, open PR, **stop for your review** |
| `continue` | After you merged the PR: archive, reset, optionally next ticket |
| `continue KAN-XX` | Continue a specific ticket awaiting merge |
| `KAN-XX` | Process that ticket only |
| `from KAN-XX` | Start at that ticket |
| `dry-run` | Plan next ticket without writes |

**Per-ticket steps:**

1. **Preflight** — `main` + `git pull origin main`, tooling checks
2. **enrich-us** — fetch Jira, write enhanced story
3. **openspec-propose** — create change + artifacts on feature branch
4. **openspec-apply-change** — implement all tasks
5. **commit + PR** — push to `origin`, PR to `CeliaMerino/AI4Devs-finalproject:main` — **no auto-merge**
6. **STOP** — you review and merge on GitHub
7. **`/kan-pipeline continue`** — verify merge, archive change, sync specs, pull `main`
8. Next ticket (if running full queue)

**Examples:**

```
/kan-pipeline next
/kan-pipeline continue
/kan-pipeline KAN-18
/kan-pipeline status
```
