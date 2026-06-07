# Ticketing Strategy Recommendation - RealSaveFooding

## 1. Context
The project started with four separate identifier families:
- TKT-BE-XXX
- TKT-FE-XXX
- TKT-DB-XXX
- TKT-US-XXX

For a solo full-stack implementation in an academic MVP, this creates unnecessary overhead in prioritization and sequence management.

## 2. Evaluation of approaches

### Option A - Separate sequences by technology
Advantages:
- Fast visual classification by layer.
- Useful when different specialized teams own separate backlogs.

Disadvantages:
- Priority order becomes fragmented across multiple queues.
- Harder to maintain a single execution timeline.
- Duplicate tracking when one feature spans FE/BE/DB.
- Adds ceremony not needed for a solo developer MVP.

### Option B - Single unified sequence
Advantages:
- One backlog, one priority order.
- Simpler sprint/session planning.
- Better fit for cross-functional full-stack delivery.
- Cleaner traceability from user story to implementation.

Disadvantages:
- Requires metadata fields for technology focus.
- Layer ownership is less visible from ID alone.

### Recommended approach (Option B with metadata)
Use one sequence TKT-XXX and keep technology split in ticket metadata:
- Type: Frontend, Backend, Database, Full-Stack
- Domains/modules and related user story IDs

This keeps IDs simple while preserving technical clarity.

## 3. Final naming convention
- Canonical ticket ID: TKT-XXX
- File naming: TKT-XXX-short-kebab-title.md

Examples:
- TKT-001-auth-register-login.md
- TKT-003-receipt-upload-ocr.md
- TKT-011-backend-receipt-ocr-pipeline.md

## 4. Migration examples from old scheme
- TKT-US-001 -> TKT-001
- TKT-US-010 -> TKT-010
- TKT-BE-001 -> TKT-011
- TKT-FE-001 -> TKT-012
- TKT-DB-001 -> TKT-013

## 5. Documentation updates required
Already applied:
- docs/tickets/README.md
  - Replaced old mixed prefixes with unified TKT-XXX references.
  - Added explicit strategy section.
- readme.md (Section 6 Tickets de Trabajo)
  - Updated 3 highlighted tickets to unified IDs.
  - Kept one backend, one frontend, one database reference.
- docs/tickets/* ticket files
  - Updated file names and title headers to unified IDs.

Recommended additional updates:
- If prompts history should reflect current convention, update examples in prompts.md section 6 to use TKT-XXX format.

## 6. README sections impacted
- Section 6: Tickets de Trabajo.
- No structural changes required in other sections.

## 7. Final recommendation for RealSaveFooding
For this academic MVP implemented by one full-stack engineer, prioritize clarity and flow over enterprise specialization:
- Keep one canonical ticket sequence (TKT-XXX).
- Use metadata for technical layer and ownership context.
- Keep links from user stories to tickets explicit.

This gives the best balance of traceability, maintainability, Agile alignment, and simplicity.
