---
name: /opsx-archive
id: opsx-archive
category: Workflow
description: Archive a completed change in the experimental workflow
---

Archive a completed change in the experimental workflow.

**Input**: Optionally specify a change name after `/opsx:archive` (e.g., `/opsx:archive add-auth`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **If no change name provided, prompt for selection**

   Run `openspec list --json` to get available changes. Use the **AskUserQuestion tool** to let the user select.

   Show only active changes (not already archived).
   Include the schema used for each change if available.

   **IMPORTANT**: Do NOT guess or auto-select a change. Always let the user choose.

2. **Check artifact completion status**

   Run `openspec status --change "<name>" --json` to check artifact completion.

   Parse the JSON to understand:
   - `schemaName`: The workflow being used
   - `artifacts`: List of artifacts with their status (`done` or other)

   **If any artifacts are not `done`:**
   - Display warning listing incomplete artifacts
   - Prompt user for confirmation to continue
   - Proceed if user confirms

3. **Check task completion status**

   Read the tasks file (typically `tasks.md`) to check for incomplete tasks.

   Count tasks marked with `- [ ]` (incomplete) vs `- [x]` (complete).

   **If incomplete tasks found:**
   - Display warning showing count of incomplete tasks
   - Prompt user for confirmation to continue
   - Proceed if user confirms

   **If no tasks file exists:** Proceed without task-related warning.

4. **Assess delta spec sync state**

   Check for delta specs at `openspec/changes/<name>/specs/`. If none exist, proceed without sync prompt.

   **If delta specs exist:**
   - Compare each delta spec with its corresponding main spec at `openspec/specs/<capability>/spec.md`
   - Determine what changes would be applied (adds, modifications, removals, renames)
   - Show a combined summary before prompting

   **Prompt options:**
   - If changes needed: "Sync now (recommended)", "Archive without syncing"
   - If already synced: "Archive now", "Sync anyway", "Cancel"

   If user chooses sync, use Task tool (subagent_type: "general-purpose", prompt: "Use Skill tool to invoke openspec-sync-specs for change '<name>'. Delta spec analysis: <include the analyzed delta spec summary>"). Proceed to archive regardless of choice.

5. **Git closure (commit + push feature + merge) before OpenSpec archive**

   **Only when the change modified application code:**

   - Confirm the user accepts the implemented changes
   - Confirm mandatory test steps passed
   - On the feature branch: create **one commit** with a bullet-point message (viñetas breves)
   - **Push the feature branch to remote** before merging: `git push -u origin feature/[ticket-id]-[ticket-name]`
   - Merge feature branch into `develop`: `git checkout develop` → `git pull origin develop` → `git merge feature/[ticket-id]-[ticket-name]`
   - Optionally push `develop`

   **Do NOT commit during apply** — this is the only commit point.

6. **Perform the archive**

   Create the archive directory if it doesn't exist:
   ```bash
   mkdir -p openspec/changes/archive
   ```

   Generate target name using current date: `YYYY-MM-DD-<change-name>`

   **Check if target already exists:**
   - If yes: Fail with error, suggest renaming existing archive or using different date
   - If no: Move the change directory to archive

   ```bash
   mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>
   ```

7. **Marcar ticket como Implementado en docs/product-backlog.md (último paso — no bloqueante)**

   Tras el `mv` a `archive/`, ejecutar:
   ```bash
   npm run openspec:mark-ticket -- --change <name>
   ```
   Resuelve el Ticket ID desde `proposal.md` (`**Ticket:** T-XX-YY`) o desde el prefijo del change (`t-01-02-…` → `T-01-02`). Actualiza `**Estado en código:**` del ticket en la sección **4. Tickets de Desarrollo** a `✅ Implementado`.

   **Si el comando falla:** no bloquear el archivado; el change sigue **terminado** (ya está en `archive/`). Mostrar advertencia en el resumen y sugerir corrección manual o re-ejecutar el script más tarde.

8. **Display summary**

   Show archive completion summary including:
   - Change name
   - Schema that was used
   - Archive location
   - Backlog: ✅ actualizado o ⚠ falló (con detalle si aplica)
   - Spec sync status (synced / sync skipped / no delta specs)
   - Note about any warnings (incomplete artifacts/tasks, fallo de backlog)

**Output On Success**

```
## Archive Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Archived to:** openspec/changes/archive/YYYY-MM-DD-<name>/
**Backlog:** ✓ Ticket T-XX-YY → ✅ Implementado en docs/product-backlog.md
**Specs:** ✓ Synced to main specs

All artifacts complete. All tasks complete.
```

**Output On Success (No Delta Specs)**

```
## Archive Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Archived to:** openspec/changes/archive/YYYY-MM-DD-<name>/
**Backlog:** ✓ Ticket T-XX-YY → ✅ Implementado en docs/product-backlog.md
**Specs:** No delta specs

All artifacts complete. All tasks complete.
```

**Output On Success With Warnings**

```
## Archive Complete (with warnings)

**Change:** <change-name>
**Schema:** <schema-name>
**Archived to:** openspec/changes/archive/YYYY-MM-DD-<name>/
**Backlog:** ✓ Ticket T-XX-YY → ✅ Implementado en docs/product-backlog.md
**Specs:** Sync skipped (user chose to skip)

**Warnings:**
- Archived with 2 incomplete artifacts
- Archived with 3 incomplete tasks
- Delta spec sync was skipped (user chose to skip)
- Backlog: could not mark T-XX-YY as ✅ Implementado in docs/product-backlog.md (<error summary>)

Review the archive if this was not intentional. Re-run `npm run openspec:mark-ticket -- --change <name>` or fix the backlog manually when ready.
```

**Output On Success (Backlog update failed — archive still complete)**

```
## Archive Complete (with warnings)

**Change:** <change-name>
**Schema:** <schema-name>
**Archived to:** openspec/changes/archive/YYYY-MM-DD-<name>/
**Backlog:** ⚠ No se pudo marcar T-XX-YY en docs/product-backlog.md (<error summary>)
**Specs:** ✓ Synced to main specs

The OpenSpec change is archived and considered complete.
```

**Output On Error (Archive Exists)**

```
## Archive Failed

**Change:** <change-name>
**Target:** openspec/changes/archive/YYYY-MM-DD-<name>/

Target archive directory already exists.

**Options:**
1. Rename the existing archive
2. Delete the existing archive if it's a duplicate
3. Wait until a different date to archive
```

**Guardrails**
- Always prompt for change selection if not provided
- Use artifact graph (openspec status --json) for completion checking
- Don't block archive on warnings - just inform and confirm
- Preserve .openspec.yaml when moving to archive (it moves with the directory)
- Show clear summary of what happened
- If sync is requested, use the Skill tool to invoke `openspec-sync-specs` (agent-driven)
- If delta specs exist, always run the sync assessment and show the combined summary before prompting
- **Commit + push feature + merge to develop happen in step 5**, only after user accepts changes — never during apply
- **Step 7** runs after `archive/` — always attempt `npm run openspec:mark-ticket`; failure is a **warning only**, not a failed archive
