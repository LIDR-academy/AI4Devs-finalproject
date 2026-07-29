## Why

Book Tracker is the core library surface (PRD §Book Tracker) but still uses legacy page CSS and a raw table that overflows on typical viewports. KAN-22 applies the KAN-18 design system and fixes horizontal overflow so the 12-column table remains usable without breaking the sidebar layout.

## What Changes

- Replace custom page header with shared **PageHeader** and **Button** components.
- Wrap the books table in **TableScroll** + **Table** for horizontal scroll when columns exceed width.
- Add column width / alignment classes for cover, title, numeric, date, and action columns.
- Migrate **BookTrackerPage.css** to design tokens (remove hard-coded hex).
- Preserve all existing row interactions (status, dates, rating, format, audience, edit, modals).

**Non-goals:** filters, internal search, restyling other pages (KAN-21…KAN-25).

## Capabilities

### New Capabilities

- `book-tracker-page-ui`: Book Tracker page layout, responsive table container, and token-based styling.

### Modified Capabilities

*(none — lifecycle behaviour unchanged)*

## Impact

- **Frontend:** `BookTrackerPage.tsx`, `BookTrackerPage.css`; optional row class tweaks.
- **Depends on:** KAN-18 (`PageHeader`, `Button`, `Table`, `TableScroll`, tokens), KAN-19 (AppLayout shell).
- **Product refs:** KAN-22, KAN-20 epic, PRD §Book Tracker.
