
# PRD — RealSaveFooding (v1)

## 1. Overview

### 1.1 Product name

RealSaveFooding — Stop Wasting Food & Money

### 1.2 One-line summary

A smart, shared pantry app that uses AI to ingest grocery receipts, infer and learn expiration windows (localized for Spain), recommend what to consume/recipes next, and quantify food + money waste.

### 1.3 Problem statement

Households and individuals waste food because they lack (1) an accurate view of what they have, (2) dependable expiration tracking without manual effort, and (3) actionable guidance on what to consume next. Waste is also largely invisible, so behavior doesn’t change.

### 1.4 Goals

- Reduce food waste by improving visibility and timely action.
- Reduce grocery spend by avoiding duplicates and preventing spoilage.
- Minimize manual input via AI + automation.
- Enable shared pantry coordination (multi-user) with clear event visibility.

### 1.5 Non-goals (for v1 unless explicitly scoped)

- Full meal-plan substitution (weekly meal planning as a primary product).
- B2B restaurant inventory workflows.
- Guaranteed “true” expiry dates for all products (we will provide estimates with confidence + confirmation flows).

---

## 2. Target users & personas

### 2.1 Primary personas

1) **Busy household manager (couple/family)**

- Needs shared pantry to avoid duplicates
- Wants “what expires next” and notifications
- Low tolerance for manual entry

2) **Budget-conscious individual**

- Wants money-saved story, price comparisons/alternatives
- Wants simple workflows and clear analytics

3) **Sustainability-motivated user**

- Wants measurable waste reduction and behavioral feedback loops

### 2.2 Key jobs-to-be-done

- “After shopping, I want my groceries added quickly so I can track them without typing.”
- “Before cooking, I want to know what to use first to avoid spoilage.”
- “In a shared household, I want to know what’s been consumed and what’s left.”
- “I want to understand how much I waste and why, so I can improve.”

---

## 3. Value proposition

### 3.1 Core value

- **Automation**: receipt → items → (estimated) expiry suggestions.
- **Localization (Spain)**: expiry windows aligned to Spanish supermarket norms.
- **Learning loop**: user-corrected expiries become future default suggestions.
- **Shared pantry coordination**: consumption visibility + notifications.
- **Waste analytics**: food + money wasted, at-risk inventory, top-wasted items.

---

## 4. Scope & milestones (productisation-ready)

### 4.1 MVP (recommended)

MVP should prove the end-to-end loop:

1) Create account → pantry created

2) Add items (receipt + manual) → expiry tracked

3) Expiry notifications + “use next” prioritization

4) Basic waste tracking (wasted vs consumed)

5) Shared pantry (2 users) + “consumed” events + notifications

### 4.2 Post-MVP (from your Non-MVP list + inferred)

- Gamification (points, streaks, achievements)
- Auto-consumption assumptions (e.g., if well past expiry, suggest “discarded” with confirmation)
- Supermarket partnerships (QR ingestion with exact expiry)
- Expanded price intelligence (true supermarket comparisons)
- Benchmarking vs other users (privacy-preserving, opt-in)

---

## 5. Functional requirements (detailed)

### 5.1 Authentication & accounts

**FR-ACC-01** Sign up

- Support email + password.
- Optional: username.

**FR-ACC-02** Login

- Email/username + password.

**FR-ACC-03** Password recovery

- Recovery via email.

**FR-ACC-04** Account settings

- Update profile: Name, Family Name, Age, Email, Address fields (City, Postal Code, Region, Country).
- Privacy & Security:
    - Change password
    - Delete account
    - Ad privacy preferences (store consent and preferences)

Acceptance criteria

- User can create account, login, recover password.
- Sensitive operations require re-authentication (optional but recommended).

### 5.2 Pantry model (inventory)

**FR-PAN-01** Pantry views

- List items with key fields: name, quantity, expiry date (or estimate), status (fresh/expiring soon/expired), storage location (optional: pantry/fridge/freezer).

**FR-PAN-02** Item details

- Show purchase date, inferred/confirmed expiry, confidence label, edit history.

**FR-PAN-03** Manual add/edit

- Add an item manually with at minimum: name, quantity, purchase date, expiry (optional).
- Edit: quantity, expiry, notes.

**FR-PAN-04** Consumption logging

- Mark item (or quantity) as consumed.
- In shared pantry: attribute consumption event to a user.

Acceptance criteria

- Items can be created, edited, consumed, and viewed consistently across devices.

### 5.3 Receipt ingestion + AI

**FR-RCP-01** Receipt capture flow

- Camera capture + upload.
- Post-scan review: user can confirm/edit extracted items.

**FR-RCP-02** Item extraction

- Extract line items: product name, quantity (if inferable), price (if present), purchase date (from receipt or capture time).

**FR-RCP-03** Expiration inference (Spain norms)

- Suggest expiry windows/dates using a Spain-oriented ruleset/model.

**FR-RCP-04** Confidence + uncertainty UX contract

- If confidence is low:
    - Mark expiry as **Estimate**
    - Prompt user to confirm or set the expiry.

**FR-RCP-05** Learning default expiration window

- When user changes an expiry date:
    - Persist an updated “default shelf-life” for the canonical product (or product pattern).
- On next purchase of same product:
    - Suggest the learned window.

Acceptance criteria

- Receipt scan produces editable list of items.
- Low-confidence expiry is never silently asserted as “certain.”

### 5.4 Expiry tracking & notifications

**FR-EXP-01** Expiry status computation

- Compute: Fresh / Expiring soon / Expired.
- Configurable thresholds (e.g., “expiring soon” = within N days).

**FR-EXP-02** Notifications

- Configurable toggles:
    - Food expiration alerts
    - Food consumed alerts (shared pantry)
    - Price drop alerts (may be stubbed in MVP if no data source)

**FR-EXP-03** Alerts content

- Notification includes item name and time to expiry.

Acceptance criteria

- Notifications can be enabled/disabled.
- Users receive expiration alerts based on thresholds.

### 5.5 Recipes & “use next” recommendations

**FR-REC-01** What to consume next

- A prioritized list of items to use soon, driven by expiry.

**FR-REC-02** Recipe suggestions

- Suggest recipes based on available items, prioritizing expiring soon.

Notes

- Recipe source can be: external API, curated dataset, or “minimal starter set.”

Acceptance criteria

- User can view recipe suggestions for at least a subset of common ingredients.

### 5.6 Price comparison & alternatives (phased)

**FR-PRC-01** Compare prices action

- Long-press menu includes “Compare prices.”
- MVP option: placeholder UX + manual entry OR limited dataset.

**FR-PRC-02** Alternatives

- Show alternatives/substitutes (could be taxonomy-based initially).

Acceptance criteria

- Long-press menu exists and actions route to screens.

### 5.7 Long-press contextual actions

**FR-CTX-01** Long-press menu on pantry item

- Compare prices
- Alternatives
- Change expiration date (this instance)
- Change default expiration date (product)

Acceptance criteria

- Menu appears reliably and triggers correct flows.

### 5.8 Sharing / household pantry

**FR-SHR-01** Invite user

- Invite by email.

**FR-SHR-02** Accept invite

- Link account to household pantry.

**FR-SHR-03** Shared activity visibility

- See who consumed what and when.

**FR-SHR-04** Shared notifications

- Optional: notify when another user consumes an item.

Acceptance criteria

- Two users see consistent shared pantry.
- Consumption events show actor and timestamp.

### 5.9 Waste analytics

**Definitions**

- **Consumed**: user-marked consumption
- **Wasted**: user-marked wasted/discarded; (optional post-MVP: inferred waste)
- **At risk**: expiring soon or predicted to be wasted

**FR-ANA-01** Dashboard

- Total food wasted (count/quantity)
- Total money wasted (estimated)
- At-risk items count

**FR-ANA-02** Drilldowns

- Group by time: day/week/month
- Group by food: category/product/item

**FR-ANA-03** Top 10 most-wasted foods

- For current user

**FR-ANA-04** Compare vs other users (post-MVP unless privacy model is ready)

- Requires opt-in, aggregation thresholds, anonymization.

Acceptance criteria

- User can see totals and at least one drilldown dimension.

### 5.10 Settings

**FR-SET-01** Notifications settings

- Toggle: expiry, price drop, consumed

**FR-SET-02** Cloud sync

- Abstract setting for “Cloud sync provider” (implementation detail).

**FR-SET-03** Appearance

- Dark / Light / Device

**FR-SET-04** App info

- Version
- “Contact by email” action

Acceptance criteria

- Settings persist and take effect.

---

## 6. User journeys (end-to-end)

### 6.1 New user onboarding

1) Install app

2) Create account

3) (Optional) accept invite to household

4) Add first groceries via receipt scan

5) Confirm uncertain expiries

6) See pantry list + expiring soon section

### 6.2 Weekly usage loop

1) Shop → scan receipt

2) Pantry updates

3) Daily: check “use next”

4) Cook/consume → log consumption

5) Get alerts for expiring soon

6) Occasionally review waste analytics

### 6.3 Shared pantry loop

1) User A scans receipt

2) User B sees items

3) User B consumes item → event logged

4) User A gets (optional) notification “Consumed by …”

---

## 7. UX / UI requirements

### 7.1 Design principles

- Apple-like: clean, minimal, intuitive.
- Reduce cognitive load: surface “next best action.”
- Trust-building: clearly label estimates and allow quick correction.

### 7.2 Key screens

- Auth: signup/login/forgot password
- Pantry list (with expiring soon filter)
- Item detail
- Receipt scan + review
- What to use next
- Recipes list + recipe detail
- Analytics dashboard + drilldown
- Settings
- Sharing/invitations

### 7.3 Error and edge-case UX

- Receipt scan fails: allow manual add or retry.
- Low-confidence expiry: explicit confirmation required.
- Shared conflicts: show reconciliation prompt (last-write-wins is acceptable for MVP if logged).

---

## 8. Data & domain model (engineer-facing)

### 8.1 Core entities

- User
- Household (shared pantry)
- PantryItem (instance)
- CanonicalProduct (normalized product)
- Purchase (receipt + items)
- Receipt (image + extracted lines)
- ExpiryModelSuggestion (date/window + confidence + rationale)
- DefaultShelfLifeRule (per product, per household or per user)
- ConsumptionEvent (consumed/wasted, quantity, actor, timestamp)
- NotificationPreference

### 8.2 Key relationships

- Household has many Users
- Household has many PantryItems
- PantryItem references CanonicalProduct (if matched)
- PantryItem has many Events (edits, consumption)

### 8.3 Auditability

- Keep an event log for:
    - expiry edits
    - default shelf-life changes
    - consumption events

---

## 9. AI/ML requirements (practical and shippable)

### 9.1 Receipt extraction pipeline

- OCR (on-device or server)
- Parsing and itemization
- Normalization (map to CanonicalProduct)

### 9.2 Expiration inference

- Spain-oriented baseline model:
    - ruleset by category (e.g., dairy/meat/produce) + product-specific overrides
    - incorporate storage location where possible
- Confidence scoring
- Human-in-the-loop confirmation

### 9.3 Learning loop

- When user edits expiry:
    - update DefaultShelfLifeRule for that canonical product
    - store whether it’s household-wide default or user-specific (recommend household-wide with per-user override as future enhancement)

### 9.4 Guardrails

- Never present low-confidence outputs as facts.
- Avoid hallucinated product matches: show candidate match list when uncertain.

---

## 10. Privacy, security, compliance

### 10.1 Data categories

- PII: email, name, address fields
- Household membership
- Shopping behavior: receipts, purchases

### 10.2 Requirements

- Encryption at rest and in transit.
- Role-based access control within household (MVP can be “all members are editors”; add roles later).
- Data deletion on account delete (and household data handling rules).
- Consent management for ad privacy.

### 10.3 Benchmarking vs other users

- Only aggregate, anonymize, and thresholded.
- Explicit opt-in recommended.

---

## 11. Analytics & metrics (product KPIs)

### 11.1 North-star metric

- Reduction in wasted value (€) per active household over time.

### 11.2 Activation metrics

- First receipt scan completed
- % items with confirmed expiry
- Notifications enabled
- First consumption event logged

### 11.3 Engagement metrics

- Weekly active users/households
- Pantry check frequency
- “Use next” interactions
- Recipe views started from expiring items

### 11.4 Quality metrics (AI)

- Receipt extraction precision/recall (validated by user edits)
- Expiry suggestion acceptance rate
- Average confidence vs edit rate

---

## 12. Technical requirements (Lead Engineer starter)

### 12.1 Architecture overview

- Mobile apps (iOS/Android)
- Backend API + database
- AI services: receipt OCR/parsing, expiry inference
- Notification service

### 12.2 API surface (high-level)

- Auth: signup/login/reset
- Household: invite/accept/list members
- Pantry: CRUD items, list with filters
- Receipt: upload, parse, confirm items
- Events: consumption/waste events
- Defaults: per-product shelf-life rules
- Analytics: aggregates + drilldowns
- Settings: notification prefs, appearance (client-side), ad privacy

### 12.3 Sync & concurrency

- Shared pantry requires:
    - server as source of truth
    - optimistic UI with server reconciliation
    - event log to explain changes

### 12.4 Observability

- Structured logs, tracing, error reporting
- Model pipeline monitoring (receipt failures, inference low-confidence distribution)

---

## 13. Ticket-splitting guide (PO-ready epics)

### Epic A — Foundations

- A1 Auth (signup/login/reset)
- A2 User profile + account settings
- A3 Core data model + API scaffolding

### Epic B — Pantry core

- B1 Pantry list + item detail
- B2 Manual add/edit
- B3 Consumption events
- B4 Shared pantry invite/accept + shared views

### Epic C — Receipt ingestion

- C1 Receipt capture UI
- C2 Upload + storage
- C3 OCR + parsing
- C4 Review/confirmation UX
- C5 Canonical product matching

### Epic D — Expiry intelligence

- D1 Spain-oriented inference baseline
- D2 Confidence scoring + estimate labeling
- D3 Confirmation flow
- D4 Learning defaults + apply on next purchase

### Epic E — Notifications

- E1 Preference center
- E2 Expiry jobs + push notifications
- E3 Shared consumption notifications

### Epic F — Recipes & use-next

- F1 “Use next” prioritization
- F2 Recipes integration + UI

### Epic G — Analytics

- G1 Waste + at-risk dashboard
- G2 Drilldowns (time + category)
- G3 Top 10 most wasted

### Epic H — Price comparison (phased)

- H1 UI entry points + long-press menu
- H2 Data source strategy + MVP implementation

---

## 14. Open questions / decisions needed

1) **Receipt ingestion**: on-device OCR vs server OCR? Cost/latency/privacy tradeoff.

2) **Canonical product strategy**: barcode support? Use external product DB?

3) **Spain norms**: define initial shelf-life tables by category/product.

4) **Shared pantry permissions**: all editors in MVP vs roles.

5) **Waste definition**: require explicit “wasted” action in MVP?

6) **Price comparison**: data acquisition approach (partnership vs scraping vs user-entered).

7) **Recipe source**: API selection/licensing.

---

## 15. Risks & mitigations

- **AI accuracy risk** (receipt + expiry): mitigate with confirmation UX, confidence display, learning loop.
- **Price data availability**: keep as phased; avoid blocking MVP.
- **Privacy concerns**: minimize PII, make benchmarking opt-in.
- **Shared sync complexity**: start with server-source-of-truth + event log.

---

## 16. Appendix

- Competitive landscape: see companion page “Market research — competitors comparison (AI pantry + expiry + recipes + price)”.
- Frontend/back-end split reference: see “Split by Frontend/Backend”.
- Non-MVP ideas: see “Non-MVP”.