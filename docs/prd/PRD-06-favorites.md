# PRD-06 · Favorites (Watchlist)

**Status:** Draft
**Platform:** Android · iOS · Desktop (KMP)
**User Stories:** DVX-US-023 · DVX-US-024 · DVX-US-025

---

## Overview

The Favorites screen is a curated watchlist of securities the user is monitoring but has not yet added to their portfolio. It provides a live price feed for tracked assets and allows quick management of the list. It is surfaced as a compact widget on the Dashboard and as a full-screen view accessible from that widget or the bottom navigation.

---

## Problem Statement

Dividend investors typically research securities for weeks before committing capital. They need a lightweight tracking mechanism — separate from the portfolio — where they can monitor price and yield data for candidates without the noise of their actual holdings.

---

## Goals

- Provide a dedicated, searchable list of watchlisted securities.
- Show live price data and daily change for each entry.
- Make it trivially easy to remove a security from the watchlist.
- Keep the watchlist consistent across Dashboard widget, this screen, and the Security Analysis screen.

---

## Functional Requirements

### FR-06-01 · Screen Structure

| # | Requirement |
|---|---|
| 1 | Back button (top left) returns to the previous screen. |
| 2 | Centred title: "Favorites". |
| 3 | Full-width search bar below the header with placeholder "Search ticker or company name…". |

### FR-06-02 · Watchlist Feed

| # | Requirement |
|---|---|
| 1 | Vertically scrollable list of high-contrast cards, one per favourited security. |
| 2 | Each card displays: Company logo (circle) | Ticker (bold) | Company name (sub-caption). |
| 3 | Price section: Spot Price (bold primary text) | Daily Change (% with direction icon + semantic colour). |
| 4 | Daily Change is green for positive, red for negative. |
| 5 | Each card has a solid heart icon (filled blue). Tapping it removes the security from the watchlist immediately. |
| 6 | Removal is reflected in real time on this screen, the Dashboard widget, and the Security Analysis header. |
| 7 | Tapping anywhere on the card (except the heart icon) navigates to the Security Analysis screen. |

### FR-06-03 · Search

| # | Requirement |
|---|---|
| 1 | Search filters the watchlist in real time (client-side, no network call). |
| 2 | Matches against ticker symbol and company name (case-insensitive). |
| 3 | Empty search result shows: "No favourites match '{query}'." |

### FR-06-04 · Data Disclaimer

| # | Requirement |
|---|---|
| 1 | A disclaimer line is always visible at the bottom of the list: "Prices are delayed by 15 minutes." |
| 2 | Displayed in subtle gray typography; non-interactive. |

### FR-06-05 · Empty State

| # | Requirement |
|---|---|
| 1 | When the watchlist is empty, show a centred illustration + message: "No favourites yet. Search for a security to add one." |
| 2 | The message includes a tappable "Search" link that navigates to the Search screen. |

---

## Error & Edge Cases

| Scenario | Behaviour |
|---|---|
| Network unavailable | Show last cached prices with a stale data indicator; no error screen. |
| Favourite security delisted or data unavailable | Show the entry with "Data unavailable" in place of price; still removable. |
| User removes the last favourite | Immediately transitions to the empty state. |

---

## Non-Functional Requirements

- Price data is delayed by 15 minutes (provider constraint); must always be communicated to the user.
- List must support scrolling performance for up to 100 favourited securities without jank.
- Watchlist state must be persisted server-side so it syncs across devices/platforms.

---

## Out of Scope (v1)

- Price alert notifications triggered from the Watchlist (covered in PRD-08).
- Sorting or filtering the watchlist (e.g., by yield, alphabetically).
- Notes or tags on watchlist entries.
- Drag-to-reorder.

---

## Open Questions

- Should there be a maximum limit on the number of favourited securities in v1?
- Should adding a security to the portfolio automatically remove it from the Watchlist, or keep both states independent?
