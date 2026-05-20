# PRD-03 · My Holdings

**Status:** Draft
**Platform:** Android · iOS · Desktop (KMP)
**User Stories:** DVX-US-011 · DVX-US-012 · DVX-US-013 · DVX-US-014 · DVX-US-015

---

## Overview

My Holdings is the Portfolio tab — the definitive list of all stock positions owned by the user. It is the primary CRUD surface for portfolio management: view, search, sort, add, and edit holdings. Each position is enriched with live market data, dividend yield, and gain/loss performance relative to the user's cost basis.

---

## Problem Statement

Users need a structured, searchable view of every position in their portfolio with enough detail to assess individual performance at a glance, and a low-friction path to add or modify positions.

---

## Goals

- Display all holdings with performance and dividend context.
- Allow fast retrieval of any holding via search.
- Support multiple analytical sort orders.
- Provide a simple, guided flow for adding new and editing existing positions.

---

## Functional Requirements

### FR-03-01 · Holdings List

| # | Requirement |
|---|---|
| 1 | Display "My Holdings" as the screen title (top left). |
| 2 | Each holding is represented as a card containing: Company logo | Ticker (bold) | Company name | Edit button (pencil icon). |
| 3 | Card body shows three data points in a row: SHARES | MARKET PRICE | DIVIDEND %. |
| 4 | Card footer shows: TOTAL VALUE (left) | Gain/Loss performance badge (right). |
| 5 | Performance badge: green with "+" prefix for gains, red with "-" prefix for losses, relative to cost basis. |
| 6 | List is scrollable; supports an arbitrary number of holdings. |
| 7 | Empty state: centred illustration + "No holdings yet. Tap + to add your first one." |

### FR-03-02 · Search

| # | Requirement |
|---|---|
| 1 | Full-width search input at the top of the list with placeholder "Search ticker or company name…". |
| 2 | List filters in real time as the user types (client-side filtering, no network call). |
| 3 | Search matches against both ticker symbol and company name (case-insensitive). |
| 4 | If no holdings match, show an inline empty state: "No results for '{query}'." |

### FR-03-03 · Sort

| # | Requirement |
|---|---|
| 1 | Three sort chips below the search bar: `[ Gain | Max Yield % | Date Added ]`. |
| 2 | Sort chips are mutually exclusive; only one active at a time. |
| 3 | Tapping the active chip toggles sort direction (ascending ↔ descending). |
| 4 | Sort direction is indicated visually on the active chip (e.g., arrow icon). |
| 5 | List re-sorts instantly (client-side, no network call). |
| 6 | Sort state persists while the user remains on the screen; resets to default ("Gain" descending) on re-entry. |

### FR-03-04 · Add New Holding

| # | Requirement |
|---|---|
| 1 | Accessible via the "+" FAB centred at the bottom of the Holdings screen. |
| 2 | Opens as a bottom sheet modal with: drag handle, close (X) button, and title "Add New Holding". |
| 3 | Smart search bar auto-suggests securities by Ticker or Company Name in real time. |
| 4 | User selects a security from the suggestion list before proceeding. |
| 5 | Two numeric inputs: **Shares** (supports decimal fractions, e.g., 0.5) and **Price per Share** (cost basis). |
| 6 | Currency chips: `[ USD | EUR | … ]`. Defaults to the user's Default Currency. "…" opens a full currency picker. |
| 7 | Live "Estimated Total" (Shares × Price per Share) updates as the user types. |
| 8 | Display the Dividend Yield of the selected security as contextual information. |
| 9 | "+ Add to Portfolio" CTA: full-width blue button. Disabled until a security is selected and both numeric fields are filled. |
| 10 | On save: haptic feedback (mobile) + brief success state + modal dismisses + holdings list updates. |

### FR-03-05 · Edit Existing Holding

| # | Requirement |
|---|---|
| 1 | Accessible via the pencil icon on each holding card. |
| 2 | Opens the Edit Holding screen (same layout as Add New Holding) pre-filled with existing values. |
| 3 | User can modify: Shares, Price per Share, Currency. |
| 4 | Security (ticker) cannot be changed in edit mode; user must delete and re-add if the ticker is wrong. |
| 5 | Save button confirms changes; list reflects updates immediately. |
| 6 | A "Delete Position" destructive action is available in edit mode, with a confirmation dialog. |

---

## Error & Edge Cases

| Scenario | Behaviour |
|---|---|
| Security search returns no results | Show "No securities found for '{query}'" in the suggestion dropdown. |
| Network unavailable when adding a holding | Show error: "Unable to fetch security data. Check your connection." |
| Shares or Price entered as zero or negative | Inline validation error: "Value must be greater than zero." CTA remains disabled. |
| Market price data unavailable for a holding | Show last known price with a stale indicator (clock icon). |
| User deletes a position | Confirmation dialog: "Remove {TICKER} from your portfolio? This cannot be undone." |

---

## Non-Functional Requirements

- Search filtering must respond within 100ms (client-side, in-memory).
- All monetary values respect the user's Default Currency setting.
- The FAB must not obscure the last list item; the list must have sufficient bottom padding.

---

## Out of Scope (v1)

- Bulk import of holdings (CSV upload).
- Multiple lots per position (FIFO / LIFO cost basis tracking).
- Options, ETFs, crypto, or non-equity asset types.
- Drag-to-reorder holdings.

---

## Open Questions

- Should partial shares (fractional investing) be supported from the start, or limited to whole numbers in v1?
- Should the Edit screen allow changing the purchase date for accurate YTD performance tracking?
