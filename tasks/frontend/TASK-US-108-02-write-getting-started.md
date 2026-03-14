# TASK-US-108-02: Write Getting Started Guide

Write the Getting Started documentation section covering quick start, registration walkthrough, first file upload, and API key setup.

[Trello Card](https://trello.com/c/BjoBgkRl)

## Parent User Story
[US-108: Documentation Pages](../../user-stories/frontend/US-108-documentation-pages.md)

## Description
Produce the MDX content for `src/app/docs/getting-started/page.mdx` with four sub-sections: a quick-start checklist, a step-by-step registration walkthrough with screenshots placeholders, a first-upload tutorial with a cURL example, and an API key management guide. The content should be beginner-friendly and include inline code snippets and callout boxes for tips/warnings.

## Priority
High

## Estimated Time
1.5 hours

## Detailed Steps
1. Create `src/app/docs/getting-started/page.mdx` with front-matter `title` and `description`.
2. Write **Quick Start** sub-section: numbered list (register → get API key → upload first file).
3. Write **Registration Walkthrough** sub-section: point to `/register`, describe each form field, show success screen.
4. Write **First Upload Tutorial** sub-section: include a cURL upload snippet, describe the returned CID, link to the Retrieve page.
5. Write **API Key Management** sub-section: how to view/copy the key from the dashboard, security advice.
6. Add a `<Callout type="warning">` component for sensitive operations.
7. Register the page in the sidebar navigation added in TASK-US-108-01.

## Acceptance Criteria
- [ ] Page renders at `/docs/getting-started` without errors.
- [ ] All four sub-sections are present and correctly structured.
- [ ] Code snippet for cURL upload is accurate and testable.
- [ ] Callout component renders warning and tip variants correctly.
- [ ] Content is accessible — headings follow a logical hierarchy.

## Notes
- Keep the language simple; avoid backend implementation jargon.
- cURL examples must match the actual backend API contract (see API Reference task).
- Placeholder images can be empty `<figure>` elements until real screenshots are available.

## Completion Status
- [x] 100% - Completed

[PR #24](https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/pull/24)

### Implementation Notes
- Created `src/app/docs/getting-started/page.tsx`
- Four sections: Quick Start (3-step list), Registration Walkthrough, First Upload Tutorial (cURL + JSON response), API Key Management
- Uses `<CodeBlock>` and `<Callout>` shared components
- Warning callout added for API key visibility
