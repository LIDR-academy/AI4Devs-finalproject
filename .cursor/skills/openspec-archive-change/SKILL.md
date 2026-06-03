---
name: openspec-archive-change
description: Archive a completed change in the experimental workflow. Use when the user wants to finalize and archive a change after implementation is complete.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.3.1"
---

Archive a completed change in the experimental workflow.

**Input**: Optionally specify a change name. If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

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
   - Use **AskUserQuestion tool** to confirm user wants to proceed
   - Proceed if user confirms

3. **Check task completion status**

   Read the tasks file (typically `tasks.md`) to check for incomplete tasks.

   Count tasks marked with `- [ ]` (incomplete) vs `- [x]` (complete).

   **If incomplete tasks found:**
   - Display warning showing count of incomplete tasks
   - Use **AskUserQuestion tool** to confirm user wants to proceed
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

   **Only when the change modified application code** (not spec-only changes):

   - Confirm the user accepts the implemented changes
   - Confirm mandatory test steps passed (reports in PASS)
   - On the feature branch: `git add` relevant files and create **one commit** with a bullet-point message (viñetas breves) summarizing all changes
   - **Push the feature branch to remote** before merging: `git push -u origin feature/[ticket-id]-[ticket-name]` (keeps branch history visible on GitHub)
   - Merge feature branch into `develop`: `git checkout develop` → `git pull origin develop` → `git merge feature/[ticket-id]-[ticket-name]`
   - Optionally push `develop` if the team workflow requires it

   **Do NOT commit during apply** — this is the only commit point in the OpenSpec workflow.

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

7. **Marcar ticket como Implementado en el product backlog (último paso — no bloqueante)**

   Tras mover el change a `archive/`, intentar actualizar `docs/product-backlog.md` para el ticket vinculado al change.

   **Resolver el Ticket ID** (en este orden):
   1. Campo `**Ticket:** T-XX-YY` en `proposal.md` del change (activo o ya archivado en `openspec/changes/archive/YYYY-MM-DD-<name>/`).
   2. Si falta, derivar del nombre del change: `t-01-02-foo` → `T-01-02`.

   **Actualizar el backlog** (ejecutar el script del repo; no omitir el intento):
   ```bash
   npm run openspec:mark-ticket -- --change <name>
   ```
   Equivalente: `node scripts/openspec-mark-ticket-implemented.mjs --change <name>`

   El script sustituye en la sección del ticket (apartado **4. Tickets de Desarrollo**), justo antes de **Descripción**, la línea:
   - `**Estado en código:** ❌ Pendiente` (o `🟡 Parcial`) → `**Estado en código:** ✅ Implementado`

   Si el ticket ya está en ✅ Implementado, el script termina sin error (idempotente).

   **Si el script falla (exit code ≠ 0):**
   - **No bloquear** el archivado ni revertir el `mv` a `archive/`.
   - Dar el change por **terminado** igualmente (el cierre OpenSpec ya ocurrió en el paso 6).
   - Registrar el error en el resumen (salida del script + ticket ID si se conoció).
   - Indicar al usuario que corrija manualmente `docs/product-backlog.md` o vuelva a ejecutar `npm run openspec:mark-ticket -- --change <name>` cuando convenga.

   Incluir `docs/product-backlog.md` en el commit de cierre (paso 5) solo si el script tuvo éxito y el fichero cambió; si el paso 7 falló, el commit de backlog puede hacerse después de forma separada.

8. **Display summary**

   Show archive completion summary including:
   - Change name
   - Schema that was used
   - Archive location
   - Estado del backlog: ✅ actualizado / ⚠️ falló (detalle)
   - Whether specs were synced (if applicable)
   - Note about any warnings (incomplete artifacts/tasks, fallo de backlog)

**Output On Success**

```
## Archive Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Archived to:** openspec/changes/archive/YYYY-MM-DD-<name>/
**Backlog:** ✓ Ticket T-XX-YY marcado como ✅ Implementado en docs/product-backlog.md
**Specs:** ✓ Synced to main specs (or "No delta specs" or "Sync skipped")

All artifacts complete. All tasks complete.
```

**Output On Success (Backlog update failed — archive still complete)**

```
## Archive Complete (with warnings)

**Change:** <change-name>
**Schema:** <schema-name>
**Archived to:** openspec/changes/archive/YYYY-MM-DD-<name>/
**Backlog:** ⚠ No se pudo marcar T-XX-YY en docs/product-backlog.md (<error summary>)
**Specs:** ✓ Synced to main specs (or "No delta specs" or "Sync skipped")

The OpenSpec change is archived and considered complete. Fix the backlog manually or re-run:
`npm run openspec:mark-ticket -- --change <name>`
```

**Guardrails**
- Always prompt for change selection if not provided
- Use artifact graph (openspec status --json) for completion checking
- Don't block archive on warnings - just inform and confirm
- Preserve .openspec.yaml when moving to archive (it moves with the directory)
- Show clear summary of what happened
- If sync is requested, use openspec-sync-specs approach (agent-driven)
- If delta specs exist, always run the sync assessment and show the combined summary before prompting
- **Commit + push feature + merge to develop happen in step 5**, only after user accepts changes — never during apply
- **Step 7 runs after step 6** — always attempt `npm run openspec:mark-ticket`; a failure there is a **warning only**, not a reason to undo archive or withhold "Archive Complete"
