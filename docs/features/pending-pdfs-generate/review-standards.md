# review-standards — pending-pdfs-generate

CI: green @ `8781bee` (+ uncommitted round-1 fixes verified green)

## Verdict

**APPROVED**

## Findings

None open.

## Round-2 verification (prior territory — resolved)

1. **[a11y] WCAG 2.2 AA 4.1.3** — `pdf-documents.tsx` surfaces delete failure when `state === 'content' && error`: assertive live-region banner + `AccessibilityInfo.announceForAccessibility`; `pdfList.delete.failed` in en/es/de/pt; unit tests cover banner/announce and negative paths. Swallowing `.catch` on delete remains (unhandled-rejection guard); status now announced via hook error + UI.

2. **[security] OWASP A04 / MASVS-STORAGE** — `pdf-documents.dao.ts` `removeBucketFolder` paginates `storage.list` (`limit: 100`, re-list offset 0 after each remove) until empty for `pdf-images` + `pdf-uploads`; DAO test asserts multi-page purge.

3. **[a11y] WCAG 4.1.2 / @s21** (minor from round 1) — `PdfDocumentListItem` info region has `accessible` + `accessibilityLabel` (`filename, statusLabel`); test asserts label.

## Lens coverage

- `[security]` — applied; no open findings (paginated purge closed; no secrets/PII sinks; RLS/session path unchanged).
- `[a11y]` — applied; no open findings (delete status messages + row name closed).
