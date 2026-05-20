# PRD-05 · Security Analysis

**Status:** Draft
**Platform:** Android · iOS · Desktop (KMP)
**User Stories:** DVX-US-020 · DVX-US-021 · DVX-US-022

---

## Overview

The Security Analysis screen is the deep-dive view for any individual stock. It combines price performance, dividend metrics, a 10-year dividend growth chart, and key fundamentals in a single scrollable view. It is the primary research screen from which users can take immediate action: add the security to their portfolio or watchlist.

---

## Problem Statement

Before adding a new holding or evaluating an existing one, investors need detailed, dividend-centric information in one place. Switching between financial websites to assemble price history, dividend yield, payout ratio, and growth rate is slow and error-prone.

---

## Goals

- Surface all information a dividend investor needs to evaluate a security.
- Provide direct portfolio and watchlist actions without leaving the screen.
- Keep data fresh with a lightweight refresh mechanism.

---

## Functional Requirements

### FR-05-01 · Header

| # | Requirement |
|---|---|
| 1 | Back button (arrow icon, top left) returns to the previous screen. |
| 2 | Ticker symbol displayed centred and bold (e.g., "AAPL"). |
| 3 | Favourite (heart) icon in the top right toggles the security in/out of the Watchlist. |
| 4 | Heart icon is **solid/filled** when the security is in the Watchlist; **outlined** when not. |
| 5 | Toggling the heart updates the Favorites screen and the Dashboard Watchlist widget in real time. |

### FR-05-02 · Price & Performance

| # | Requirement |
|---|---|
| 1 | Display the full company name and exchange (e.g., "Apple Inc. · NASDAQ"). |
| 2 | Display the current market price as the primary large value. |
| 3 | Display the price change as a percentage with a direction icon (trending_up / trending_down). |
| 4 | Change value is green for positive, red for negative. |
| 5 | Display a "Refreshed X minutes ago" timestamp below the price. |
| 6 | Data updates on pull-to-refresh; timestamp reflects the last successful fetch. |

### FR-05-03 · Price Chart

| # | Requirement |
|---|---|
| 1 | Display a line chart of historical prices for the selected period. |
| 2 | Period selector: `[ 1D | 1W | 1M | YTD | 1Y | ALL ]`. |
| 3 | Switching periods updates the chart immediately. |
| 4 | Dividend metrics and fundamentals remain static regardless of the selected period. |

### FR-05-04 · Dividend Metrics Grid

| # | Requirement |
|---|---|
| 1 | Display a 2×2 grid of four dividend metrics: |
| 2 | **Dividend Yield**: Annual dividend income / current price. |
| 3 | **Annual Payout**: Total dividends paid per share in the last 12 months. |
| 4 | **Payout Ratio**: Dividends paid / earnings per share. |
| 5 | **5Y Growth Rate**: Compound annual growth rate of dividends over the last 5 years. |

### FR-05-05 · Dividend Growth Chart

| # | Requirement |
|---|---|
| 1 | Section label: "Dividend Growth" with a "Last 10 Years" tag. |
| 2 | Bar chart with one bar per month over the last 10 years showing the historical dividend payment per share. |
| 3 | X-axis: abbreviated monthly labels. |
| 4 | Tapping a bar shows a tooltip with the exact dividend amount and date. |

### FR-05-06 · Fundamentals

| # | Requirement |
|---|---|
| 1 | Display three key fundamentals in a list: **Market Cap** | **P/E Ratio** | **Ex-Dividend Date**. |

### FR-05-07 · Portfolio CTA

| # | Requirement |
|---|---|
| 1 | When the security is **not** in the portfolio: show supporting text + full-width primary "Add Security" button. |
| 2 | Tapping "Add Security" opens the Add New Holding sheet (see PRD-03) pre-filled with this ticker. |
| 3 | When the security **is** in the portfolio: replace "Add Security" with a full-width "Edit Holding" button. |
| 4 | Tapping "Edit Holding" opens the Edit Holding screen for the existing position. |

---

## Error & Edge Cases

| Scenario | Behaviour |
|---|---|
| Security has no dividend history | Dividend metrics show "N/A"; Dividend Growth chart shows empty state: "No dividend history available." |
| Market data unavailable | Show last cached values with stale indicator; "Refresh" button prominently displayed. |
| Security already in portfolio | "Add Security" CTA replaced by "Edit Holding" (see FR-05-07). |
| Network unavailable | Show cached data with banner: "You're offline. Data may be outdated." |

---

## Non-Functional Requirements

- Price chart must render within 500ms of period selection.
- Market price data is delayed by 15 minutes (provider constraint); this is communicated via the "Refreshed X minutes ago" timestamp.
- The screen must be accessible via: Dashboard Market Intelligence cards, Search results, Favorites list, My Holdings cards.

---

## Out of Scope (v1)

- Analyst ratings and price targets.
- News feed for the security.
- Options chain or advanced derivatives data.
- Comparison view (e.g., AAPL vs. MSFT).
- Real-time price streaming.

---

## Open Questions

- Should the Dividend Growth chart show quarterly or monthly bars? (Monthly increases data density but may be noisy for infrequent payers.)
- What market data provider will be used? This affects latency, available history depth, and cost.
