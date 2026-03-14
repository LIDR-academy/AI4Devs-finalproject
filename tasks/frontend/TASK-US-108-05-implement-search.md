# TASK-US-108-05: Implement Documentation Search

Implement client-side full-text search across all documentation pages with a search input in the docs header and live results with highlighted matches.

[Trello Card](https://trello.com/c/AyuSxBae)

## Parent User Story
[US-108: Documentation Pages](../../user-stories/frontend/US-108-documentation-pages.md)

## Description
Add a search feature to the documentation section using a lightweight client-side indexing library (e.g., `flexsearch` or `fuse.js`). At build time, generate a search index from all MDX page content. At runtime, expose a search input in the docs header that shows a floating results panel with matched snippets and links — no page reload required.

## Priority
Medium

## Estimated Time
1.5 hours

## Detailed Steps
1. Choose and install a lightweight search library (`fuse.js` recommended to avoid separate build tooling).
2. Create `src/lib/docs-search-index.ts` that exports a static array of `{ title, slug, excerpt }` objects covering all documentation pages.
3. Build `src/components/docs/DocsSearch.tsx`:
   - Controlled `<input>` with `role="combobox"` and `aria-expanded`.
   - Debounced query (150 ms) piped into Fuse.js search.
   - Floating `<ul role="listbox">` showing up to 8 results with title and excerpt snippet.
   - Keyboard navigation: `ArrowUp`/`ArrowDown` to move focus, `Enter` to navigate, `Escape` to close.
4. Integrate `DocsSearch` into the docs layout header (TASK-US-108-01).
5. Highlight the matched substring in each result title using a `<mark>` element.
6. Write a unit test for the search component covering: empty query shows nothing, valid query shows matches, `Escape` closes the panel.

## Acceptance Criteria
- [ ] Search input is visible in the docs layout header on all `/docs/*` pages.
- [ ] Typing a query returns relevant results within 150 ms of the last keystroke.
- [ ] Results panel shows title and excerpt for each match, with the matched term highlighted.
- [ ] Keyboard navigation works correctly (arrow keys, Enter, Escape).
- [ ] Clicking a result navigates to the correct documentation page.
- [ ] Search is fully accessible (ARIA roles, focus management).

## Notes
- The search index should be a static import — no server round-trip at search time.
- Keep the index small: title + first 120 characters of content per page is sufficient.
- If a page has no results, show a "No results for …" message rather than an empty panel.

## Completion Status
- [x] 100% - Completed

### Implementation Notes
- Created `src/lib/docs-search-index.ts` with 28 static search entries across 6 sections
- `DocsSearch` component: 150ms debounce, max 8 results, `<mark>` highlighting
- Keyboard navigation: ArrowUp/Down, Enter (navigate), Escape (clear)
- ARIA roles: `combobox`, `listbox`, `option`; fully keyboard-accessible
