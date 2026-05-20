# PRD-04 · Dividend Activity

**Status:** Draft
**Platform:** Android · iOS · Desktop (KMP)
**User Stories:** DVX-US-016 · DVX-US-017 · DVX-US-018 · DVX-US-019

---

## Overview

Dividend Activity is the dedicated income tab of DiviDox. It consolidates everything dividend-related in one screen: lifetime income summary, a 12-month projection chart, upcoming confirmed payments, and a full historical log grouped by month. This is the primary screen for users whose investment strategy centres on passive income generation.

---

## Problem Statement

Dividend-focused investors need a single place to understand how much income their portfolio generates, when the next payment is due, and how their dividend income has grown over time. This data is currently scattered across brokerage statements, emails, and spreadsheets.

---

## Goals

- Give users a clear picture of total, YTD, and projected dividend income.
- Allow users to track upcoming payments with confirmation status.
- Provide a full, auditable log of past receipts with payment method detail.
- Help users measure progress toward a yield-on-cost target.

---

## Functional Requirements

### FR-04-01 · Critical Metrics Block

| # | Requirement |
|---|---|
| 1 | Display "Dividend Activity" as the screen title (top left). |
| 2 | **Lifetime Dividends**: Total cash dividends ever received. Displayed as the primary large metric. |
| 3 | **YTD Dividends**: Cash collected from January 1st of the current year to today. |
| 4 | **YoY Performance**: Percentage growth of dividends received vs. the same period last year. Shown in green (positive) or red (negative). |
| 5 | **Next Payout**: Amount of the nearest upcoming dividend payment, its scheduled date, and days remaining (e.g., "3d away"). |
| 6 | **Portfolio YoC (Yield on Cost)**: Annualised dividend income divided by total cost basis. Displayed alongside a target indicator (default target: 5.0%). |
| 7 | YoC indicator turns green when value meets or exceeds the target; red when below. |

### FR-04-02 · Dividend Projection Chart

| # | Requirement |
|---|---|
| 1 | Section label: "Dividend Projection" with a "Last 12 Months" period tag. |
| 2 | Bar chart displaying one bar per calendar month for the trailing 12 months. |
| 3 | Past months (actual received dividends): filled/solid bars. |
| 4 | Future months (projected dividends based on known upcoming payments): outlined or muted bars — visually distinct from actual. |
| 5 | X-axis displays abbreviated month labels (OCT, NOV, …, SEP). |
| 6 | Tapping a bar shows a tooltip with the exact amount for that month. |

### FR-04-03 · Upcoming Payments

| # | Requirement |
|---|---|
| 1 | Section label: "Upcoming Payments". |
| 2 | Each row shows: Company logo | Ticker | Company name | Amount per share | Total payout | Status badge. |
| 3 | Status badge = **"Confirmed"** (green) when the ex-dividend date has already passed (payment is certain). |
| 4 | Status badge = **"Estimated"** (gray) when the ex-dividend date has not yet passed (payment may still vary). |
| 5 | Rows are sorted chronologically by payment date (soonest first). |
| 6 | Tapping a row navigates to the Security Analysis screen for that security. |

### FR-04-04 · Past Activity

| # | Requirement |
|---|---|
| 1 | Section label: "Past Activity". |
| 2 | Entries are grouped by calendar month (e.g., "September 2023"). |
| 3 | Each month group is collapsible via a chevron icon. |
| 4 | The most recent month is expanded by default; all others are collapsed. |
| 5 | Each entry shows: Company logo | Ticker | Company name | Date | Method | Amount received. |
| 6 | **Method: Cash** — standard dividend credit. Displayed with a payments icon. |
| 7 | **Method: Reinvested** — DRIP reinvestment. Displayed with a reinvestment icon and muted colour to indicate no cash was deposited to the account. |
| 8 | Tapping an entry navigates to the Security Analysis screen for that security. |

---

## Error & Edge Cases

| Scenario | Behaviour |
|---|---|
| No dividends received yet | Metrics show $0.00; chart shows empty state with message "Add holdings to start tracking dividends." |
| No upcoming payments | Upcoming Payments section shows: "No upcoming payments scheduled." |
| YoC target not configured | Use default target of 5.0%; allow user to adjust in a future settings screen. |
| Dividend data unavailable for a holding | Mark those entries as "Data unavailable" with a warning icon. |
| Network unavailable | Show last cached data with a banner: "Data may be outdated. Pull to refresh." |

---

## Non-Functional Requirements

- Past Activity list must support pagination or lazy loading for users with multi-year dividend histories.
- All monetary values respect the user's Default Currency setting and convert using stored spot rates at the time of receipt.
- Chart rendering must complete within 300ms of screen load.

---

## Out of Scope (v1)

- Manual entry of dividend payments (all data derived from holdings + market data provider).
- Tax report generation (cost basis, qualified vs. ordinary dividends).
- Custom YoC target configuration (hardcoded to 5.0% in v1; configurable in a future release).
- Dividend reinvestment (DRIP) configuration.

---

## Open Questions

- How is dividend payment data sourced? Market data API (e.g., Polygon.io, Alpha Vantage) or manual entry?
- Should "Method: Reinvested" entries count toward the Lifetime Dividends total, or only "Method: Cash" entries?
- Should projected future months in the chart account for expected dividend growth, or use the last known payment flat?
