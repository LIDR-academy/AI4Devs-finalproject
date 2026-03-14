# TASK-US-108-01: Setup Documentation Page Structure

Set up the Next.js `/docs` route, MDX integration, sidebar navigation, and table of contents component.

[Trello Card](https://trello.com/c/Wt62FlPu)

## Parent User Story
[US-108: Documentation Pages](../../user-stories/frontend/US-108-documentation-pages.md)

## Description
Create the structural foundation for the documentation section: the `/docs` route group, `@next/mdx` configuration, a persistent sidebar with section links (Getting Started, Authentication, API Reference, Code Examples, FAQ), and a table-of-contents component that highlights the active heading as the user scrolls. The layout must be responsive so the sidebar collapses into a drawer on small screens.

## Priority
High

## Estimated Time
2 hours

## Detailed Steps
1. Install and configure `@next/mdx` and `rehype-highlight` in `frontend/`.
2. Create `src/app/docs/layout.tsx` with a two-column layout: sidebar + content area.
3. Implement `Docssidebar` component with hard-coded section tree matching the story structure.
4. Implement `TableOfContents` component that parses `h2`/`h3` headings inside the content area using an `IntersectionObserver`.
5. Add `src/app/docs/page.tsx` as the docs home page (redirects or renders a welcome paragraph).
6. Make the sidebar collapse into a slide-over drawer on `sm` breakpoint and below.
7. Verify navigation links are highlighted for the active route using `usePathname`.

## Acceptance Criteria
- [ ] `/docs` route renders without errors.
- [ ] Sidebar is visible on desktop and accessible via a toggle button on mobile.
- [ ] Active sidebar item is highlighted for the current route.
- [ ] Table of contents updates scroll position indicator as user reads content.
- [ ] Layout is readable and passes basic accessibility checks (keyboard navigation).

## Notes
- Use MDX for all content files stored under `src/app/docs/`.
- Avoid adding a heavy docs framework (Nextra, etc.) unless explicitly approved; keep this within the existing Next.js setup.
- Sidebar items should match the five documentation sections from the user story.

## Completion Status
- [x] 100% - Completed

### Implementation Notes
- Used pure TSX components instead of MDX (no config changes needed)
- Created `src/app/docs/layout.tsx` with three-column layout
- `DocsSidebar` handles both mobile drawer and desktop sticky aside
- `TableOfContents` uses `IntersectionObserver` to track active heading
- `DocsSearch` with 150ms debounce and keyboard navigation
