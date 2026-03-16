# TASK-US-108-04: Create Code Examples with Copy Button

Create multi-language code examples (cURL, Python, JavaScript) and a reusable syntax-highlighted code block component with a copy-to-clipboard button.

[Trello Card](https://trello.com/c/U3R1inHk)

## Parent User Story
[US-108: Documentation Pages](../../user-stories/frontend/US-108-documentation-pages.md)

## Description
Build a `<CodeBlock>` React component that renders a syntax-highlighted code snippet with a language badge and a copy-to-clipboard button. Then produce the `src/app/docs/code-examples/page.mdx` content page containing working examples for the four most common operations (register, upload, retrieve, delete) in three languages: cURL, Python, and JavaScript/Node.js. Group examples by operation with a tabbed or accordion switcher.

## Priority
Medium

## Estimated Time
1.5 hours

## Detailed Steps
1. Install `shiki` or `rehype-pretty-code` for server-side syntax highlighting in MDX.
2. Create `src/components/docs/CodeBlock.tsx`:
   - Renders `<pre><code>` with highlighted output.
   - Displays a language label badge (e.g., `bash`, `python`, `javascript`).
   - Include a **Copy** button (reuse clipboard helper from existing upload UI).
   - Show a "Copied!" confirmation for 2 seconds after clicking.
3. Wire `CodeBlock` as the MDX `code` element override in `mdx-components.tsx`.
4. Create `src/app/docs/code-examples/page.mdx`:
   - **Register**: `POST /register` examples in cURL, Python `requests`, and `fetch`.
   - **Upload a file**: `POST /upload` examples in all three languages.
   - **Retrieve a file**: `GET /retrieve/<cid>` examples.
   - **Delete a file**: `DELETE /files/<cid>` examples.
5. Add language tab switcher (cURL / Python / JavaScript) so the user selects the language once and all blocks switch accordingly.
6. Register the page in the sidebar.

## Acceptance Criteria
- [ ] Syntax highlighting renders correctly for `bash`, `python`, and `javascript` blocks.
- [ ] Copy button copies the raw code to the clipboard and shows confirmation.
- [ ] Language switcher toggles all code blocks on the page simultaneously.
- [ ] All four operation examples are present and accurate.
- [ ] Page renders at `/docs/code-examples` without errors.

## Notes
- Re-use the clipboard utility already present in `upload-history.tsx` to stay consistent.
- Prefer server-side highlighting to avoid client-side bundle size increase.
- Ensure the copy button is keyboard-accessible (`aria-label`).

## Completion Status
- [x] 100% - Completed

[PR #24](https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/pull/24)

### Implementation Notes
- Created `src/app/docs/code-examples/page.tsx` (client component for language tabs)
- Three language tabs: cURL, Python, JavaScript
- Five operations per language: Register, Upload, Retrieve, List, Delete
- `CodeBlock` component: dark theme, language badge, copy-to-clipboard with fallback
