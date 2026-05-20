# DiviDox — User Stories

All user stories written in **Gherkin format** (Given/When/Then) for clarity and testability. Delivery 1 covers 10 core stories. Future stories build on this foundation.

---

## Delivery 1 Stories

## Authentication (DVX-TK-011)

### DVX-US-001 · Sign In with Email & Password

**Feature:** User authentication with email and password credentials

```gherkin
Scenario: Returning user logs in with valid credentials
  Given the user is on the Login screen
  And the user has a registered email "john@example.com" with password "SecurePass123"
  When the user enters email "john@example.com"
  And the user enters password "SecurePass123"
  And the user taps "Sign In"
  Then the user is navigated to the Dashboard
  And the back stack is cleared

Scenario: Email validation shows error on invalid format
  Given the user is on the Login screen
  When the user enters email "invalid-email" and blurs the field
  Then an inline error "Invalid email format" is displayed
  And the "Sign In" button remains disabled

Scenario: Password visibility toggle works
  Given the user is on the Login screen
  When the user enters password "MyPassword123"
  And the user taps the eye icon
  Then the password becomes visible as plain text
  And tapping again hides the password

Scenario: User sees error on incorrect credentials
  Given the user is on the Login screen
  When the user enters email "john@example.com"
  And the user enters password "WrongPassword"
  And the user taps "Sign In"
  Then an error banner "Incorrect email or password. Please try again." appears
  And the user remains on the Login screen

Scenario: Error clears when user edits a field
  Given an error banner is displayed on the Login screen
  When the user edits the email field
  Then the error banner disappears automatically
```

**Ticket:** DVX-TK-011

---

### DVX-US-002 · Sign In with Google

**Feature:** OAuth authentication via Google Sign-In

```gherkin
Scenario: User logs in with Google account
  Given the user is on the Login screen
  When the user taps "Continue with Google"
  Then the native Google Sign-In flow launches
  And the user completes authentication
  And the user is navigated to the Dashboard
  And the back stack is cleared

Scenario: Error handling for failed Google Sign-In
  Given the user has tapped "Continue with Google"
  When the Google Sign-In flow fails (e.g., user cancels)
  Then an error message appears below the button
  And the user remains on the Login screen

Scenario: User cancels Google Sign-In mid-flow
  Given the Google Sign-In dialog is open
  When the user taps "Cancel"
  Then the dialog closes
  And the user is returned to the Login screen
  And no error is shown
```

**Ticket:** DVX-TK-011

---

### DVX-US-003 · Create an Account

**Feature:** New user registration with email and password

```gherkin
Scenario: User creates a new account successfully
  Given the user is on the Sign Up screen
  When the user enters Full Name "John Doe"
  And the user enters Email "john.doe@example.com"
  And the user enters Password "SecurePass123"
  And the user checks "I agree to Terms of Service and Privacy Policy"
  And the user taps "Create Account"
  Then the account is created in Firebase
  And the user is navigated to the Dashboard
  And the back stack is cleared

Scenario: Email validation prevents duplicate registration
  Given the user is on the Sign Up screen
  When the user enters Email "existing@example.com" (already registered)
  And the user blurs the email field
  Then an error "An account with this email already exists." is shown
  And the "Create Account" button remains disabled

Scenario: Create Account button is disabled until form is valid
  Given the user is on the Sign Up screen
  When the user has not filled all required fields
  Or the user has not checked the Terms checkbox
  Then the "Create Account" button is disabled

Scenario: User can navigate back to Sign In
  Given the user is on the Sign Up screen
  When the user taps "Already have an account? Sign In"
  Then the user is navigated back to the Login screen

Scenario: Password validation enforces minimum requirements
  Given the user is on the Sign Up screen
  When the user enters a weak password "abc"
  Then an error message displays: "Password must be at least 8 characters"
  And the "Create Account" button remains disabled
```

**Ticket:** DVX-TK-011

---

### DVX-US-004 · Recover Password

**Feature:** Password reset via email

```gherkin
Scenario: User requests password reset
  Given the user is on the Login screen
  When the user taps "Forgot Password"
  Then the Password Recovery screen is displayed
  And an email input field is shown

Scenario: User enters email and receives reset confirmation
  Given the user is on the Password Recovery screen
  When the user enters their registered email "john@example.com"
  And the user taps "Send Reset Link"
  Then a confirmation message is displayed: "A password reset link has been sent to your email"

Scenario: Confirmation message shown even if email not registered (security best practice)
  Given the user is on the Password Recovery screen
  When the user enters an unregistered email "notfound@example.com"
  And the user taps "Send Reset Link"
  Then the same confirmation message is displayed (no user enumeration)

Scenario: User can navigate back from recovery screen
  Given the user is on the Password Recovery screen
  When the user taps the back button
  Then the user is returned to the Login screen
```

**Ticket:** DVX-TK-011

---

## Dashboard (DVX-TK-018)

### DVX-US-005 · View Portfolio Overview

**Feature:** Portfolio summary with key metrics

```gherkin
Scenario: User sees portfolio metrics for selected period
  Given the user is on the Dashboard
  When the period selector shows "1M" (one month)
  Then the following metrics are displayed:
    | Metric | Example Value |
    | Total Value | $15,250 (+2.3%) |
    | Profit | +$1,200 (+8.5%) |
    | Yield | 3.2% |
    | Dividends (YTD) | $480 |

Scenario: Period selector updates all metrics
  Given the user is on the Dashboard
  And the period selector is set to "1M"
  When the user taps "1Y"
  Then all four metrics recalculate for the 1-year period
  And the UI updates without delay

Scenario: Period selector shows all available periods
  Given the user is on the Dashboard
  When the user views the period selector
  Then the following options are visible: | 1D | 1W | 1M | 1Y | YTD | ALL |

Scenario: Metrics reflect real portfolio data
  Given the user has holdings: AAPL (10 shares @ $150) and MSFT (5 shares @ $300)
  When the Dashboard loads
  Then Total Value = (10×$150) + (5×$300) = $3,000
  And Profit reflects current market prices vs. purchase prices
```

**Ticket:** DVX-TK-018

---

### DVX-US-006 · Switch Display Currency

**Feature:** Currency conversion for portfolio values

```gherkin
Scenario: User toggles between USD and EUR
  Given the user is on the Dashboard
  And all values are displayed in USD
  When the user taps the USD/EUR toggle
  Then all monetary values are recalculated to EUR using current spot rate
  And the toggle now shows "EUR"

Scenario: Currency selection persists across sessions
  Given the user has set currency to EUR on the Dashboard
  When the user closes and reopens the app
  Then the Dashboard displays values in EUR by default

Scenario: Currency toggle in header affects all screens
  Given the user is on the Dashboard with USD selected
  When the user navigates to the Portfolio screen
  And the user changes currency to EUR
  Then returning to Dashboard shows EUR values
  And the toggle reflects the change

Scenario: Conversion uses latest exchange rates
  Given the user has switched to EUR
  Then the conversion rate is fetched from current market data
  And prices reflect 1:1 USD-EUR conversion (or latest available rate)
```

**Ticket:** DVX-TK-018

---

### DVX-US-007 · Monitor Today's Gainers and Losers

**Feature:** Quick identification of best/worst performing holdings

```gherkin
Scenario: User sees top gainers and losers
  Given the user is on the Dashboard
  When the Dashboard loads with existing holdings
  Then two sections are displayed:
    | Section | Example Contents |
    | Top 3 Gainers | AAPL +2.5%, MSFT +1.8%, GOOGL +1.2% |
    | Top 3 Losers | AMZN -1.5%, TSLA -2.1%, META -1.8% |

Scenario: Gainers displayed in green, losers in red
  Given the Dashboard shows gainers and losers
  When the user views the list
  Then gainer rows have green text/background
  And loser rows have red text/background

Scenario: Holdings only from user's portfolio are included
  Given the user has holdings: AAPL, MSFT, GOOGL
  And the user is watching (not owning): AMZN, TSLA
  When the Dashboard calculates gainers/losers
  Then only AAPL, MSFT, GOOGL are considered (not watchlist)

Scenario: Less than 3 gainers/losers handled gracefully
  Given the user has only 2 holdings
  When the Dashboard calculates gainers/losers
  Then only 2 entries are shown in each section (not padded with empty rows)
```

**Ticket:** DVX-TK-018

---

### DVX-US-008 · View Upcoming Dividend Events

**Feature:** Upcoming dividend notifications on dashboard

```gherkin
Scenario: User sees upcoming dividend events feed
  Given the user is on the Dashboard
  When the Dashboard renders the dividend events section
  Then upcoming dividend payments are listed with:
    | Field | Example |
    | Ticker | AAPL |
    | Payment Amount | $0.24 per share |
    | Ex-Dividend Date | May 17, 2025 |
    | Status | "Ex-date in 5 days" |

Scenario: Dividend variation is highlighted
  Given a dividend event has changed vs. previous payout
  When the event is displayed
  Then % change is shown in green (increase) or red (cut)

Scenario: Only portfolio holdings dividends are shown
  Given the user holds AAPL but watches (doesn't own) MSFT
  When the Dashboard renders dividend events
  Then only AAPL upcoming dividends are shown

Scenario: No dividends message when none upcoming
  Given the user has holdings with no upcoming dividends in 30 days
  When the Dashboard renders the dividend section
  Then a message displays: "No upcoming dividend payments in the next 30 days"
```

**Ticket:** DVX-TK-018

---

### DVX-US-009 · Manage Watchlist from Dashboard

**Feature:** Quick access to and management of favorite securities

```gherkin
Scenario: User sees watchlist section with up to 2 entries
  Given the user is on the Dashboard
  And the user has 5 securities in watchlist
  When the watchlist section loads
  Then only top 2 entries are displayed with:
    | Field | Example |
    | Ticker | MSFT |
    | Price | $425.50 |
    | % Change Today | +1.2% |

Scenario: User removes favorite with heart icon
  Given the Dashboard shows watchlist entries
  When the user taps the solid heart icon on an entry
  Then the security is removed from watchlist immediately
  And the Dashboard watchlist section updates
  And the Security Detail screen (if open) also reflects the change

Scenario: VIEW ALL link navigates to full Favorites screen
  Given the user is on the Dashboard
  When the user taps "VIEW ALL" in the watchlist section
  Then the full Favorites/Watchlist screen is displayed
  And all watched securities are shown

Scenario: Empty state when no watchlist items
  Given the user has no favorite securities
  When the watchlist section loads
  Then a message displays: "No favorites yet. Tap the heart on any security to add it."
```

**Ticket:** DVX-TK-018

---

### DVX-US-010 · Discover Dividend Growth Securities

**Feature:** Curated discovery of high-dividend-growth opportunities

```gherkin
Scenario: User sees Market Intelligence carousel
  Given the user is on the Dashboard
  When the Market Intelligence carousel loads
  Then securities with dividend CAGR > 10% (5 years) are shown in carousel
  And each card displays:
    | Field | Example |
    | Ticker | JNJ |
    | Yield | 2.8% |
    | 5Y Dividend CAGR | +12.5% |

Scenario: Tapping card navigates to Add New Holding pre-filled
  Given the Dashboard shows Market Intelligence carousel
  When the user taps on a security card (e.g., JNJ)
  And the user taps the "+" button
  Then the Add New Holding sheet opens
  And the Ticker field is pre-filled with "JNJ"
  And other fields are ready for user input (shares, price, etc)

Scenario: VIEW ALL shows full discovery list
  Given the user is on the Dashboard
  When the user taps "VIEW ALL" in Market Intelligence
  Then a full discovery screen is displayed
  And all high-CAGR securities are filterable/sortable

Scenario: Limited carousel when few high-growth securities
  Given there are only 2 high-growth securities available
  When the carousel loads
  Then only 2 cards are shown (not padded)
  And VIEW ALL button still navigates to full list
```

**Ticket:** DVX-TK-018

---

---

## Future Stories (Delivery 2+)

---

## My Holdings

### DVX-US-011 · View All Holdings

**Feature:** Complete portfolio overview with detailed holdings

```gherkin
Scenario: User views all portfolio holdings
  Given the user is on the Portfolio screen
  When the screen loads with existing holdings
  Then each holding card displays: Ticker, Company Name, Shares, Price, Dividend %, Total Value, Gain/Loss Badge
  And gain badge is green for positive, red for negative

Scenario: Empty state when no holdings exist
  Given the user is on the Portfolio screen
  And the user has no holdings
  Then an empty state message displays: "No holdings yet. Tap + to add your first one."
  And an Add button (FAB) is prominently displayed

Scenario: Holdings display correct calculated values
  Given the user has 10 AAPL shares purchased at $150 each, current price $180
  When the Portfolio screen loads
  Then Total Value shows $1,800 (10 × $180)
  And Gain/Loss shows +$300 (10 × ($180 - $150))
  And Gain % shows +20%

Scenario: Holdings sorted by default order
  Given the user has added holdings in this order: AAPL, MSFT, GOOGL
  When the Portfolio screen loads
  Then holdings display in the order they were added
```

**Ticket:** DVX-TK-019

---

### DVX-US-012 · Search Holdings

**Feature:** Quick lookup of holdings by ticker or name

```gherkin
Scenario: User searches holdings by ticker
  Given the user is on the Portfolio screen
  When the user enters "AA" in the search field
  Then holdings matching "AA" are filtered in real time
  And non-matching holdings disappear

Scenario: User searches holdings by company name
  Given the user is on the Portfolio screen
  When the user enters "Apple" in the search field
  Then holdings with "Apple" in the company name are shown
  And the list updates instantly

Scenario: Empty state when no results match
  Given the user has searched for "XYZ"
  When no holdings match the search
  Then an empty state message displays: "No holdings match 'XYZ'"

Scenario: Search clears and shows all holdings again
  Given the user has an active search filter
  When the user clears the search field (taps X)
  Then all holdings are displayed again
  And the list refreshes instantly
```

**Ticket:** DVX-TK-019

---

### DVX-US-013 · Sort Holdings

**Feature:** Reorganize holdings view by different criteria

```gherkin
Scenario: User sorts holdings by Gain
  Given the user is on the Portfolio screen
  And the sort selector shows three chips: [ Gain | Max Yield % | Date Added ]
  When the user taps "Gain"
  Then holdings are sorted by gain/loss in descending order (largest gains first)

Scenario: User toggles sort order
  Given the user has sorted by "Gain" (descending)
  When the user taps the "Gain" chip again
  Then the sort order toggles to ascending (smallest gains first)
  And a visual indicator (up/down arrow) shows the direction

Scenario: Sort selection persists during session
  Given the user has sorted by "Max Yield %"
  When the user navigates away and returns to Portfolio
  Then the sort selection is preserved

Scenario: Sort works with filtered search results
  Given the user has searched for "AP"
  When the user selects sort "Date Added"
  Then filtered results are sorted by date (not all holdings)
```

**Ticket:** DVX-TK-019

---

### DVX-US-014 · Add a New Holding

**Feature:** Input new equity position to portfolio

```gherkin
Scenario: User adds a new holding with smart search
  Given the user taps the "+" FAB on Portfolio screen
  When the Add Holding sheet opens
  And the user enters "AAP" in the security search
  Then auto-suggestions appear: "AAPL - Apple Inc", "AAPL.L - Apple (London)", etc.
  And the user taps to select "AAPL - Apple Inc"

Scenario: User completes holding details
  Given the security "AAPL" is selected
  When the user enters:
    | Field | Value |
    | Shares | 10.5 |
    | Price per Share | 150.00 |
    | Currency | USD |
  Then the "Estimated Total" updates live: "10.5 × $150.00 = $1,575"
  And the current dividend yield displays as context

Scenario: User saves holding with confirmation
  Given all required fields are valid
  When the user taps "+ Add to Portfolio"
  Then haptic feedback is triggered
  And the holding is saved to Firestore
  And the Portfolio list updates with the new holding

Scenario: User selects duplicate holding already in portfolio
  Given the user has already added AAPL
  When the user searches for AAPL to add again
  Then a warning message displays: "You already own AAPL. Edit existing holding?"
  And the user can tap "Edit" to modify the existing position
```

**Ticket:** DVX-TK-020, DVX-TK-014

---

### DVX-US-015 · Edit an Existing Holding

**Feature:** Modify position details (shares, price, currency)

```gherkin
Scenario: User opens edit screen for a holding
  Given the user is on the Portfolio screen
  When the user taps the pencil icon on an AAPL holding card
  Then the Edit Holding sheet opens
  And all fields are pre-filled with current values:
    | Field | Current Value |
    | Shares | 10 |
    | Price per Share | 150.00 |
    | Currency | USD |

Scenario: User updates share quantity
  Given the Edit Holding sheet is open
  When the user changes "Shares" from 10 to 15
  Then the "Total Cost Basis" recalculates instantly: 15 × $150.00 = $2,250
  And the updated gain/loss is displayed

Scenario: Changes are saved and reflected immediately
  Given the user has updated holding details
  When the user taps "Save Changes"
  Then the changes are persisted to Firestore
  And the Portfolio list updates immediately
  And the Dashboard metrics recalculate

Scenario: User cancels edit without saving
  Given the user has made changes to holding details
  When the user taps "Cancel"
  Then a confirmation dialog appears: "Discard changes?"
  And if the user confirms, the edit sheet closes without saving
```

**Ticket:** DVX-TK-020, DVX-TK-014

---

## Dividend Activity

### DVX-US-016 · View Lifetime Dividend Summary

**Feature:** Aggregate dividend income metrics

```gherkin
Scenario: User sees dividend summary metrics
  Given the user is on the Dividend Activity screen
  When the screen loads
  Then the following metrics are displayed:
    | Metric | Example Value |
    | Lifetime Dividends | $5,240 |
    | YTD Dividends | $480 |
    | YoY Growth | +12.5% |
    | Next Payout | $124 on May 30 (5 days) |
    | Portfolio YoC | 3.8% (red if below 5%) |

Scenario: YoC color changes based on target
  Given the Portfolio Yield on Cost is calculated
  When YoC >= 5.0%
  Then the indicator displays in green
  When YoC < 5.0%
  Then the indicator displays in red

Scenario: Metrics update when portfolio changes
  Given the user is viewing dividend metrics
  When the user adds a new high-dividend holding
  Then the metrics recalculate
  And the "Lifetime Dividends" increases
  And "Portfolio YoC" updates accordingly

Scenario: Empty state with no dividends
  Given the user has no holdings that pay dividends
  When the Dividend Activity screen loads
  Then all metrics display 0 or "N/A"
  And a message displays: "No dividends yet"
```

**Ticket:** DVX-TK-021, DVX-TK-023

---

### DVX-US-017 · Visualise Dividend Projection

**Feature:** Chart past and future dividend income

```gherkin
Scenario: User sees dividend projection bar chart
  Given the user is on the Dividend Activity screen
  When the projection chart loads
  Then bars cover the last 12 months
  And bars for past months are filled (solid color)
  And bars for future months are outlined/muted

Scenario: Chart displays monthly labels
  Given the projection chart is displayed
  When the user views the X-axis
  Then one label appears per month (Jan, Feb, Mar, etc.)
  And the current month is highlighted

Scenario: User toggles between amount and percentage
  Given the user is viewing the projection chart
  When a toggle option exists (Amount/%)
  Then the user can switch to view $ amounts or % change
  And the chart recalculates and re-renders

Scenario: Chart reflects current portfolio state
  Given the user has AAPL (quarterly $0.24) and MSFT (quarterly $0.68)
  When the chart loads
  Then projected bars show combined dividends for upcoming months
  And past bars show actual received dividends
```

**Ticket:** DVX-TK-021, DVX-TK-023

---

### DVX-US-018 · View Upcoming Dividend Payments

**Feature:** List confirmed upcoming dividend events

```gherkin
Scenario: User sees upcoming dividend list
  Given the user is on the Dividend Activity screen
  When the "Upcoming Payments" section loads
  Then each row displays:
    | Field | Example |
    | Company Logo | [icon] |
    | Ticker | AAPL |
    | Company Name | Apple Inc. |
    | Amount per Share | $0.24 |
    | Total Payout | $2.40 |
    | Status Badge | "Confirmed" (green) |

Scenario: Status badge reflects dividend confirmation
  Given a dividend payment is visible
  When the ex-dividend date has passed
  Then status badge shows "Confirmed" in green
  When the ex-dividend date has not passed
  Then status badge shows "Estimated" in gray

Scenario: Upcoming payments ordered by date
  Given multiple upcoming dividends exist
  When the list loads
  Then payments are sorted by date (soonest first)

Scenario: Empty state when no upcoming payments
  Given the user has no upcoming dividend payments
  When the section loads
  Then a message displays: "No upcoming payments scheduled"
```

**Ticket:** DVX-TK-021, DVX-TK-023

---

### DVX-US-019 · Review Past Dividend Activity

**Feature:** Historical dividend receipt records

```gherkin
Scenario: User views dividend history grouped by month
  Given the user is on the Dividend Activity screen
  When the "Past Dividends" section loads
  Then dividends are grouped by calendar month
  And each month group is collapsible
  And the most recent month is expanded by default

Scenario: User sees dividend entry details
  Given a dividend month is expanded
  When viewing individual dividend entries
  Then each entry displays:
    | Field | Example |
    | Ticker | AAPL |
    | Company Name | Apple Inc. |
    | Date | May 23, 2025 |
    | Method | Cash / Reinvested |
    | Amount | $2.40 |

Scenario: Reinvested dividends are visually distinct
  Given a dividend entry shows "Method: Reinvested"
  Then the entry is displayed with a different icon or muted color
  And the distinction is clear vs. "Cash" entries

Scenario: User can collapse/expand month groups
  Given the Past Dividends section is displayed
  When the user taps a month header (e.g., "May 2025")
  Then the month group collapses/expands
  And other months maintain their state
```

**Ticket:** DVX-TK-021, DVX-TK-023

---

## Security Analysis

### DVX-US-020 · Analyse a Security

**Feature:** Detailed stock analysis dashboard

```gherkin
Scenario: User views security analysis screen
  Given the user navigates to a security detail screen (e.g., AAPL)
  When the Security Analysis screen loads
  Then the following sections are displayed:
    | Section | Contents |
    | Header | Company name, Exchange, Current Price, % Change |
    | Price Chart | Line chart with period selector [1D|1W|1M|YTD|1Y|ALL] |
    | Dividend Metrics | 2x2 grid: Yield, Annual Payout, Payout Ratio, 5Y Growth |
    | Dividend History | Bar chart (10 years of dividend amounts) |
    | Fundamentals | Market Cap, P/E Ratio, Ex-Dividend Date |
    | CTA | "Add to Portfolio" or "Edit Holding" button |

Scenario: User refreshes data with pull-to-refresh
  Given the user is on the Security Analysis screen
  When the user pulls down to refresh
  Then prices and metrics are updated from Yahoo Finance
  And "Refreshed X minutes ago" timestamp updates

Scenario: Price chart updates with period selection
  Given the user is viewing the price chart
  When the user taps "1Y" in the period selector
  Then the chart redraws showing 1-year price history
  And dividend payment marks are overlaid

Scenario: Security not in portfolio shows Add CTA
  Given the user views a security they don't own
  Then the CTA button displays "Add to Portfolio"
  And the button is enabled for tapping
```

**Ticket:** DVX-TK-024

---

### DVX-US-021 · Add a Security to Portfolio from Analysis

**Feature:** Quick portfolio addition from detail screen

```gherkin
Scenario: User adds security directly from analysis screen
  Given the user is on the Security Analysis screen for AAPL
  And AAPL is NOT in the user's portfolio
  When the user taps the "Add to Portfolio" CTA
  Then the Add New Holding sheet opens
  And the Ticker field is pre-filled with "AAPL"
  And other fields are ready for input (shares, price, etc.)

Scenario: CTA changes when holding already exists
  Given the user is on the Security Analysis screen for AAPL
  And AAPL is already in the user's portfolio
  Then the CTA button reads "Edit Holding" instead of "Add to Portfolio"
  And tapping it opens the Edit Holding screen

Scenario: Add sheet pre-fills current security data
  Given the user taps "Add to Portfolio" on AAPL detail screen
  When the Add Holding sheet opens
  Then the current price from the detail screen is suggested
  And the dividend yield is displayed as reference
```

**Ticket:** DVX-TK-024

---

### DVX-US-022 · Toggle Favourite from Security Screen

**Feature:** Watchlist management from detail view

```gherkin
Scenario: User toggles favourite heart icon
  Given the user is on the Security Analysis screen
  When the user taps the heart icon in the header
  Then the heart toggles from outlined (unfavorited) to solid (favorited)
  And the security is added to the Watchlist

Scenario: Changes reflect across app
  Given the user has toggled a security as favorite
  When the user navigates to:
    | Screen | Expected Behavior |
    | Dashboard Watchlist | Security appears in top 2 |
    | Favorites screen | Security is listed |
  Then all screens reflect the updated favorite status

Scenario: Removing favorite works from detail screen
  Given the user has favorited a security (heart is solid)
  When the user taps the heart again to remove
  Then the heart becomes outlined
  And the security is removed from watchlist
  And Dashboard/Favorites screens update immediately
```

**Ticket:** DVX-TK-024

---

## Favorites & Search

### DVX-US-023 · View Watchlist

**Feature:** Centralized view of all favorite securities

```gherkin
Scenario: User accesses Favorites screen
  Given the user is on the Settings screen
  When the user taps the "Favorites" row item
  Then the Favorites screen is displayed
  And all favorited securities are shown in a list

Scenario: User sees watchlist entry details
  Given the Favorites screen is open
  Then each watchlist card displays:
    | Field | Example |
    | Company Logo | [icon] |
    | Ticker | MSFT |
    | Company Name | Microsoft Corp. |
    | Spot Price | $425.50 |
    | Daily Change | +1.2% (green) |

Scenario: Disclaimer footer is displayed
  Given the Favorites screen is open
  When the screen loads
  Then a disclaimer footer reads: "Prices are delayed by 15 minutes"

Scenario: Empty state when no favorites
  Given the user has no favorite securities
  When the Favorites screen loads
  Then a message displays: "No favorites yet"
  And a link offers: "Browse securities to add favorites"
```

**Ticket:** DVX-TK-025, DVX-TK-016

---

### DVX-US-024 · Search Within Watchlist

**Feature:** Filter favorite securities

```gherkin
Scenario: User searches favorites
  Given the user is on the Favorites screen
  When the user enters text in the search bar
  Then the watchlist filters in real time
  And only matching securities are displayed

Scenario: Empty state when no matches
  Given the user has searched for "XYZ" with no matches
  Then an empty state message displays: "No favorites match 'XYZ'"

Scenario: Search clears to show all favorites again
  Given the user has an active search
  When the user clears the search field (taps X)
  Then all favorites are displayed again

Scenario: Search is case-insensitive
  Given the user enters "msft" in lowercase
  Then "MSFT" is still found and displayed
```

**Ticket:** DVX-TK-025

---

### DVX-US-025 · Remove a Favourite

**Feature:** Unwatch a security

```gherkin
Scenario: User removes a favorite
  Given the user is on the Favorites screen
  When the user taps the solid heart icon on a card
  Then the security is removed from the watchlist immediately
  And the card disappears from the Favorites list
  And the removal is reflected on:
    | Screen | Change |
    | Dashboard Watchlist | Security is removed from top 2 |
    | Security Analysis | Heart icon is now outlined (unfavorited) |

Scenario: Swipe-to-delete alternative
  Given the user is on the Favorites screen
  When the user swipes left on a favorite card
  Then a "Delete" button appears
  And tapping it removes the favorite

Scenario: Empty state after removing all favorites
  Given the user has only 1 favorite
  When the user removes it
  Then the empty state message displays: "No favorites yet"
```

**Ticket:** DVX-TK-025, DVX-TK-016

---

### DVX-US-026 · Search for a Security

**Feature:** Discover securities to analyse or add

```gherkin
Scenario: User searches for a security
  Given the user taps the Search FAB on the Dashboard
  When the Search screen opens
  And the user enters "App" in the search field
  Then results appear in real time:
    | Company Logo | Ticker | Company Name | Spot Price | Daily Change |
    | [icon] | AAPL | Apple Inc. | $185.50 | +0.8% |
    | [icon] | APPF | AppFolio Inc. | $95.20 | -1.2% |

Scenario: User navigates to security details
  Given search results are displayed
  When the user taps a result card
  Then the Security Analysis screen opens for that ticker

Scenario: User toggles favorite inline
  Given search results are displayed
  When the user taps the heart icon on a result
  Then the security is added to the watchlist
  And the heart becomes solid
  And the change is reflected on Dashboard Watchlist

Scenario: Search suggestions improve with typing
  Given the user enters "M"
  Then broad suggestions appear: MSFT, META, MCD, etc.
  When the user continues typing "S"
  Then results narrow to "MSFT"
```

**Ticket:** DVX-TK-026

---

## Settings & Security

### DVX-US-027 · Enable Biometric Lock

**Feature:** Biometric authentication on app launch

```gherkin
Scenario: User enables biometric lock
  Given the user is on the Settings screen
  When the user enables the "Biometric Lock" toggle
  Then the toggle takes effect immediately
  And the biometric setting is saved to preferences

Scenario: Biometric prompt appears on next app launch
  Given biometric lock is enabled
  When the user closes and reopens the app
  Then a biometric prompt appears (Face ID or fingerprint)
  And the user must authenticate before accessing the Dashboard

Scenario: Failed biometric falls back to password
  Given the biometric prompt is shown
  When the user fails biometric authentication
  Then a "Try Again" prompt appears
  And the user can tap "Use Password" as fallback

Scenario: User can disable biometric lock
  Given biometric lock is currently enabled
  When the user disables the "Biometric Lock" toggle
  Then the setting is saved
  And no biometric prompt appears on next app launch
```

**Ticket:** DVX-TK-028, DVX-TK-029

---

### DVX-US-028 · Configure Notifications

**Feature:** Choose which events trigger alerts

```gherkin
Scenario: User accesses notification settings
  Given the user is on the Settings screen
  When the user taps "Notifications"
  Then the Notifications configuration screen opens

Scenario: User selects notification events
  Given the Notifications screen is open
  Then toggles are available for:
    | Event | Default |
    | Dividend Payment Credits | ON |
    | Price Alerts | ON |
    | Upcoming Ex-Dividend Dates | ON |

Scenario: Changes are saved immediately
  Given the user has toggled notification preferences
  When the user switches a toggle on/off
  Then the change is saved immediately
  And no "Save" button is required

Scenario: Notifications respect user preferences
  Given "Dividend Payment Credits" is disabled
  When a dividend is received
  Then no notification is sent to the user
```

**Ticket:** DVX-TK-029

---

### DVX-US-029 · Set Default Currency

**Feature:** Choose display currency for app

```gherkin
Scenario: User sets default currency
  Given the user is on the Settings screen
  When the user taps the currency selector
  Then an inline toggle appears: [ USD | EUR ]
  And the current selection is highlighted

Scenario: Currency change recalculates all values
  Given the user taps EUR
  When the currency switches to EUR
  Then all monetary values across the app recalculate
  And the toggle now shows "EUR" as selected

Scenario: Currency selection persists
  Given the user has set currency to EUR
  When the user closes and reopens the app
  Then the app displays values in EUR by default

Scenario: Exchange rate accuracy
  Given the user has switched to EUR
  When holdings are worth $1,000 USD
  Then the EUR value reflects current exchange rate
  And approximately €920-950 depending on rate
```

**Ticket:** DVX-TK-029

---

### DVX-US-030 · Export Portfolio

**Feature:** Download portfolio data as file

```gherkin
Scenario: User initiates portfolio export
  Given the user is on the Settings screen
  When the user taps "Export Portfolio"
  Then a loading indicator appears: "Generating export..."
  And the system compiles portfolio data (CSV or PDF format)

Scenario: Share sheet appears on completion
  Given the export file has been generated
  When the file is ready
  Then the native share sheet appears
  And the user can share via:
    | Option | |
    | Email | |
    | Cloud Storage | |
    | AirDrop (iOS) | |
    | Nearby Share (Android) | |

Scenario: Export includes all portfolio data
  Given the user exports the portfolio
  Then the file contains: Holdings, Current Prices, Dividends, YTD Income
  And data reflects the current state at time of export

Scenario: Large portfolios handle gracefully
  Given the user has 500+ holdings
  When the user exports
  Then the export still completes within reasonable time
  And the file size remains manageable
```

**Ticket:** DVX-TK-029, DVX-TK-030

---

### DVX-US-031 · Delete Account

**Feature:** Permanent account and data deletion

```gherkin
Scenario: User initiates account deletion
  Given the user is on the Settings screen
  When the user taps "Delete Account"
  Then a confirmation dialog appears:
    "Are you sure? This action is permanent and cannot be undone."

Scenario: Deletion requires authentication
  Given the confirmation dialog is shown
  When the user confirms deletion
  Then the app re-authenticates the user (biometric or password)
  And on successful authentication, all user data is deleted from Firestore

Scenario: App returns to login screen
  Given the account has been successfully deleted
  When the deletion is complete
  Then the app navigates to the Login screen
  And the back stack is cleared

Scenario: Data deletion is comprehensive
  Given the user has deleted their account
  Then the following are removed:
    | Data Type | |
    | User profile | |
    | Holdings | |
    | Watchlist | |
    | Settings | |
    | All associated data | |
```

**Ticket:** DVX-TK-029

---

### DVX-US-032 · Sign Out

**Feature:** Logout and end session

```gherkin
Scenario: User initiates sign out
  Given the user is on the Settings screen
  When the user taps "Sign Out"
  Then a confirmation dialog appears: "Are you sure you want to sign out?"

Scenario: Session is cleared on confirmation
  Given the user confirms sign out
  When the dialog is confirmed
  Then the user session is cleared (tokens removed)
  And the app navigates to the Login screen
  And the back stack is cleared

Scenario: User can sign out from any screen
  Given the user can access Settings from the main navigation
  When the user signs out from any screen
  Then the app returns to the Login screen regardless of previous screen

Scenario: Local data is preserved after sign out
  Given the user signs out
  Then the next user can log in
  And previous user's data is NOT accessible
  And app returns to clean state for next login
```

**Ticket:** DVX-TK-029

---

## Session Management

### DVX-US-033 · Persist Session Across App Restarts

**Feature:** Automatic re-authentication on app launch

```gherkin
Scenario: User remains signed in after closing app
  Given the user has successfully signed in
  When the user closes the app completely
  And the user reopens the app
  Then the app loads directly to the Dashboard
  And no login screen is shown

Scenario: Session survives cold start
  Given the app process has been killed by the OS
  When the user reopens the app from scratch
  Then the previously authenticated session is restored
  And the user sees the Dashboard immediately

Scenario: Session persists until explicit logout
  Given the user is signed in
  When days pass without signing out
  Then the session remains active
  And the user can use the app normally
  (Unless the session is revoked by the server)

Scenario: Session token is refreshed automatically
  Given the user's session token is about to expire
  When the app detects expiry
  Then a refresh token is used to get a new session token
  And the user is never interrupted
```

**Ticket:** DVX-TK-012

---

### DVX-US-034 · Automatic Redirect on Session Expiry

**Feature:** Graceful handling of expired sessions

```gherkin
Scenario: User is redirected on token expiry
  Given the user's session token has expired
  And the token cannot be refreshed
  When the user attempts an API call
  Then the app automatically redirects to the Login screen
  And the back stack is cleared

Scenario: Splash state shown during session resolution
  Given the user has opened a cold app
  And the app is checking session state
  When the session is being resolved
  Then a splash/loading state is shown
  And no "Login screen flash" occurs (no flashing between screens)

Scenario: Successful re-login returns to Dashboard
  Given the user is on the Login screen after session expiry
  When the user signs in again successfully
  Then the app navigates to the Dashboard
  And the normal session state is restored

Scenario: Error message on forced logout
  Given the user's session was revoked server-side
  When the user attempts an action
  Then a message displays: "Your session has expired. Please log in again."
  And the Login screen appears
```

**Ticket:** DVX-TK-012

---

## Story & Ticket Mapping Reference

| Domain | Stories | Tickets |
|--------|---------|---------|
| **Authentication** | DVX-US-001–004 | DVX-TK-011 |
| **Dashboard** | DVX-US-005–010 | DVX-TK-018 |
| **My Holdings** | DVX-US-011–015 | DVX-TK-019, DVX-TK-020, DVX-TK-014 |
| **Dividend Activity** | DVX-US-016–019 | DVX-TK-021, DVX-TK-023 |
| **Security Analysis** | DVX-US-020–022 | DVX-TK-024 |
| **Favorites & Search** | DVX-US-023–026 | DVX-TK-025, DVX-TK-026, DVX-TK-016 |
| **Settings & Security** | DVX-US-027–032 | DVX-TK-029, DVX-TK-028, DVX-TK-030 |
| **Session Management** | DVX-US-033–034 | DVX-TK-012 |

**Total User Stories:** 34  
**Total Delivery 1 Stories:** 10 (with comprehensive Gherkin scenarios)  
**Total Future Stories:** 24 (with comprehensive Gherkin scenarios)

For full technical details on each ticket, see [docs/tickets/](tickets/) directory.

