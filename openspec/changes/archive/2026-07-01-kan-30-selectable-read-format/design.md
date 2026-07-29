## Decisions

1. **Column visible for all rows** — format can be set anytime; empty until chosen.
2. **Reuse `READ_FORMAT_OPTIONS`** from `readingStatus.ts`.
3. **Null PATCH** — empty option sends `read_format: null`.
4. **No backend auto-format** — verified; only user PATCH sets value.

## Non-goals

- Stats/chart changes (already handle null as unknown).
