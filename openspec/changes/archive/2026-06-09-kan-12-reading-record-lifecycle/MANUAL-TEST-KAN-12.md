# Manual test checklist — KAN-12 (US-04)

**Change:** `kan-12-reading-record-lifecycle`  
**Page:** `/book-tracker`  
**Prerequisites:** Backend + frontend running; at least one book in library (from KAN-9 flow).

| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| 1 | Change status inline | Change status via row selector | Row updates without full page reload |
| 2 | Start date on Leyendo | Set Pendiente → Leyendo | Start date = today, editable |
| 3 | Completion modal | Set Leyendo → Leído | Modal: finish date (today), format, 1–5 stars |
| 4 | Dismiss modal | Open modal, close without saving optionals | Stays Leído; can fill rating/format/dates inline later |
| 5 | Inline rating | On Leído without rating, set stars in row | Rating saved without modal |
| 6 | Inline dates | Edit start/finish on Leyendo or Leído | Date picker saves via PATCH |
| 7 | Date validation | Set finish before start | Error shown; invalid value not kept |

**Out of scope (do not test here):** TBR auto-complete (KAN-10), annual goal (KAN-11), page progress (UC-03), tags in modal.
