# PRD-07 · Search

**Status:** Draft
**Platform:** Android · iOS · Desktop (KMP)
**User Stories:** DVX-US-026

---

## Overview

The Search screen is the global security discovery surface. It allows users to find any listed stock by ticker or company name, see live price data, toggle favourites inline, and navigate directly to the Security Analysis screen. It is accessible from the central FAB in the bottom navigation bar.

---

## Problem Statement

Users need a fast, universal entry point to find any security — whether they are researching a new candidate, looking up a specific ticker, or navigating to a security they already own. Without a dedicated search, discovery is fragmented across different sections of the app.

---

## Goals

- Provide a single, fast search surface for the entire securities universe.
- Surface enough context (price, change, favourite status) to make the result immediately actionable.
- Allow inline watchlist management without navigating to the Security Analysis screen.

---

## Functional Requirements

### FR-07-01 · Screen Structure

| # | Requirement |
|---|---|
| 1 | Back button (top left) returns to the previous screen. |
| 2 | Centred title: "Search." |
| 3 | Full-width search bar is auto-focused on screen entry (keyboard opens immediately). |
| 4 | Placeholder: "Search ticker or company name…". |

### FR-07-02 · Search Results Feed

| # | Requirement |
|---|---|
| 1 | Results filter in real time as the user types (minimum 1 character to trigger results). |
| 2 | Each result card displays: Company logo (circle) | Ticker (bold) | Company name (sub-caption). |
| 3 | Price section: Spot Price (bold primary text) | Daily Change (% with direction icon + semantic colour). |
| 4 | Daily Change is green for positive, red for negative. |
| 5 | Each card has a heart icon. Outlined if not favourited; solid/filled if already in the Watchlist. |
| 6 | Tapping the heart icon toggles the favourite state inline; change is reflected immediately across the app. |
| 7 | Tapping anywhere on the card (except the heart icon) navigates to the Security Analysis screen for that security. |

### FR-07-03 · Empty & Loading States

| # | Requirement |
|---|---|
| 1 | Before any input: show a placeholder state — e.g., "Search for a stock by ticker or name." |
| 2 | While fetching results: show a loading indicator (skeleton cards or spinner). |
| 3 | No results found: show "No results for '{query}'. Try a different ticker or company name." |

### FR-07-04 · Data Disclaimer

| # | Requirement |
|---|---|
| 1 | "Prices are delayed by 15 minutes" displayed at the bottom in subtle gray typography. |
| 2 | Non-interactive. |

---

## Error & Edge Cases

| Scenario | Behaviour |
|---|---|
| Network unavailable | Show banner: "Search requires an internet connection." Results area shows empty state. |
| Query too short | Results not shown until at least 1 character is entered; no minimum length error message needed. |
| Server returns an error | Show: "Unable to load results. Please try again." with a retry button. |
| Security already in portfolio | Card shows a portfolio badge (e.g., small briefcase icon) alongside the heart; tapping navigates to Security Analysis with "Edit Holding" CTA. |

---

## Non-Functional Requirements

- Search results should begin appearing within 300ms of the last keystroke (debounce: 250ms).
- Results list must support scrolling performance for up to 50 concurrent results.
- Price data is delayed by 15 minutes; must always be communicated via the disclaimer.
- Search is network-dependent (no offline mode for discovery).

---

## Out of Scope (v1)

- Search history / recent searches.
- Filtering by exchange, sector, market cap, or dividend yield.
- Barcode / QR scanning for securities.
- Voice search.

---

## Open Questions

- What is the securities universe? US stocks only, or US + European markets from the start?
- Should search results be ranked by relevance (e.g., exact ticker match first) or alphabetically?
