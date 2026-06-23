# PRD-02 · Dashboard

**Status:** Draft
**Platform:** Android · iOS · Desktop (KMP)
**User Stories:** DVX-US-005 · DVX-US-006 · DVX-US-007 · DVX-US-008 · DVX-US-009 · DVX-US-010

---

## Overview

The Dashboard is the home screen of DiviDox. It provides a real-time snapshot of the user's portfolio: total value, profit, yield, and dividends collected. It also surfaces today's movers, upcoming dividend events, a compact watchlist, and a discovery carousel for new opportunities — all in a single scrollable view.

---

## Problem Statement

Investors who track dividends need a central view that immediately answers: "How is my portfolio doing right now, what am I earning in dividends, and what should I pay attention to today?" Currently this requires switching between multiple apps or spreadsheets.

---

## Goals

- Give users an at-a-glance summary of their portfolio health.
- Surface the most time-sensitive information (gainers/losers, upcoming dividends) without requiring navigation.
- Enable currency switching without leaving the screen.
- Introduce high-dividend-growth discovery organically within the home experience.

---

## Functional Requirements

### FR-02-01 · Header & Currency Selector

| # | Requirement |
|---|---|
| 1 | Display "Dashboard" as the screen title (top left). |
| 2 | Display a USD / EUR toggle in the top right. |
| 3 | Switching currency instantly recalculates all monetary values on the screen using the current spot exchange rate. |
| 4 | The selected currency persists across sessions and stays in sync with the Default Currency setting in Profile & Settings. |

### FR-02-02 · Critical Metrics Block

| # | Requirement |
|---|---|
| 1 | Display a Period Selector above the metrics block: `[ 1D | 1W | 1M | 1Y | YTD | ALL ]`. |
| 2 | Period Selector applies uniformly to all four metrics below. |
| 3 | **Total Value**: Display current net portfolio value with absolute variation (currency) and % change for the selected period. |
| 4 | **Profit**: Display latent gain/loss plus accumulated dividends as a percentage. Reflects actual total return. |
| 5 | **Yield**: Display profitability percentage based on original purchase price (Yield on Cost). |
| 6 | **Dividends**: Display total cash received in the selected period. |

### FR-02-03 · Portfolio Today (Gainers & Losers)

| # | Requirement |
|---|---|
| 1 | Display section "Portfolio Today" with two sub-lists: Top Gainers and Top Losers. |
| 2 | Show Top 3 Gainers sorted by % change descending. Each entry: Ticker | Price | % Change. |
| 3 | Show Top 3 Losers sorted by % change ascending. Each entry: Ticker | Price | % Change. |
| 4 | List is restricted exclusively to securities already in the user's portfolio. |
| 5 | Gainers are displayed in green; losers in red. |
| 6 | If fewer than 3 gainers or losers exist, show only what is available (no placeholders). |

### FR-02-04 · Upcoming Events

| # | Requirement |
|---|---|
| 1 | Display a chronological feed of upcoming dividend-related events for portfolio securities. |
| 2 | Dividend payment entries show: payments icon + "Dividend credit from $TICKER ($X.XX)". |
| 3 | Corporate event entries show: calendar icon + event description (ex-dividend date, dividend variation). |
| 4 | Dividend variation notices display the % change in green (increase) or red (cut) vs. the previous payment. |
| 5 | Feed is limited to securities in the user's portfolio. |

### FR-02-05 · Favourites Monitor (Watchlist)

| # | Requirement |
|---|---|
| 1 | Display a "Favourites" section with a "VIEW ALL" link to the full Favorites screen. |
| 2 | Show up to 2 watchlist entries: Ticker | Market Price | % Change Today. |
| 3 | Each entry has a heart icon; tapping it removes the asset from the watchlist immediately. |
| 4 | Removal is reflected in real time without requiring a page refresh. |

### FR-02-06 · Market Intelligence Carousel

| # | Requirement |
|---|---|
| 1 | Display a "Market Intelligence" section with a "VIEW ALL" link. |
| 2 | Show a horizontally scrollable carousel of securities with dividend CAGR > 10% over the last 5 years that are NOT in the user's portfolio. |
| 3 | Each card shows: Ticker | Current Yield | 5Y CAGR. |
| 4 | Each card has a "+" button that navigates to the Add New Holding screen pre-filled with that ticker. |

---

## Error & Edge Cases

| Scenario | Behaviour |
|---|---|
| Portfolio is empty | Metrics show $0.00 / 0%; Gainers/Losers section hidden; Events feed shows empty state. |
| Market data unavailable | Show last known values with a stale data indicator; timestamp shows last successful fetch. |
| No upcoming events | Upcoming Events section shows: "No upcoming events for your portfolio." |
| No watchlist entries | Favourites section shows: "No favourites yet. Search for a security to add one." |
| Spot rate unavailable for currency conversion | Show last known rate with a warning icon and tooltip. |

---

## Non-Functional Requirements

- Dashboard data should refresh automatically when the app returns to foreground.
- Market price data is delayed by 15 minutes (provider constraint); this must be communicated to the user.
- Period selector changes must recalculate metrics in < 300ms (client-side computation, not a new network call).

---

## Out of Scope (v1)

- Real-time (live) price streaming.
- Push notifications triggered from the Dashboard events feed (covered in PRD-08).
- More than 2 currencies (USD / EUR only).
- Customisable Dashboard layout (drag-and-drop sections).

---

## Open Questions

- Should the Market Intelligence carousel filter out securities already in the Watchlist as well, or only those already in the portfolio?
- Should the Period Selector state persist across sessions or always reset to "1M" on app launch?
