## Why

Lists/TBR remains one of the few user-facing pages with legacy, hard-coded styling and inconsistent checklist cards. KAN-24 aligns the page with the design system and improves layout coherence while preserving existing TBR behavior.

## What Changes

- Restyle Lists page shell using design-system patterns and tokenized spacing.
- Improve month navigation and actions presentation for visual consistency.
- Restyle TBR checklist entries and empty state as soft cards with coherent typography.
- Remove hard-coded color values from Lists page styles and avoid horizontal overflow.

## Capabilities

### New Capabilities

*(none)*

### Modified Capabilities

- `monthly-tbr-ui`: Add design-system visual/layout requirements for Lists/TBR checklist and page shell.

## Impact

- Frontend: `ListsPage.tsx`, `ListsPage.css` (and existing TBR components styling via page classes).
- Depends on: KAN-18 design tokens/components.
- No API/backend changes.
