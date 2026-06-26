# Feature Specification: Mercadona Live Price Comparison

**Feature Branch**: `003-mercadona-price-comparison`

**Created**: 2026-06-26

**Status**: Draft

**Input**: EXT-008 — Live Price Comparison via Mercadona API

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Live Price Lookup (Priority: P1)

As a user, when I compare the price of a pantry item, I see the current Mercadona supermarket price alongside what I paid, so I can judge whether my purchase was fair and make a better decision next time.

**Why this priority**: This is the core value of the feature — without a live price, the comparison is stale and untrustworthy. P1 because it is the primary reason the feature exists.

**Independent Test**: Can be fully tested by adding a common grocery item (e.g. "leche") with a price paid, requesting its price comparison, and verifying that a Mercadona price is returned alongside the overpaid/underpaid delta.

**Acceptance Scenarios**:

1. **Given** a user has a pantry item named "leche" with a price paid, **When** the user requests the price comparison, **Then** the system returns the current Mercadona price, the product name, and the price difference (delta) within 3 seconds.
2. **Given** a price comparison was already requested within the past 24 hours for the same item, **When** the user requests it again, **Then** the system returns the cached result instantly without re-fetching from Mercadona.
3. **Given** a pantry item has no price paid recorded, **When** the user requests the price comparison, **Then** the Mercadona price is shown but the delta is omitted.

---

### User Story 2 - Graceful Fallback to Static Catalog (Priority: P2)

As a user, when Mercadona does not carry a specific item or their service is temporarily unavailable, I still see a reference price from the static catalog so the comparison view is never blank.

**Why this priority**: Reliability of the comparison feature is critical; users must never see a broken or empty state. Static catalog fallback ensures 100% availability of the comparison view.

**Independent Test**: Can be tested by requesting a price comparison for an item not found in Mercadona and verifying the static catalog price is shown, and by simulating a Mercadona service outage and verifying the fallback is triggered.

**Acceptance Scenarios**:

1. **Given** a pantry item whose name does not match any Mercadona product, **When** the user requests a price comparison, **Then** the system displays the static catalog reference price and indicates Mercadona had no match.
2. **Given** the Mercadona service is unavailable (network error or timeout), **When** the user requests a price comparison, **Then** the system falls back to the static catalog entry and the comparison view displays without error.
3. **Given** neither Mercadona nor the static catalog has a price for the item, **When** the user requests a price comparison, **Then** the view shows a clear "no price data available" state with no delta.

---

### User Story 3 - Price Freshness Visibility (Priority: P3)

As a user, I want to see when the Mercadona price was last retrieved so I can assess whether the displayed price is current or may be slightly out of date.

**Why this priority**: Trust in the data depends on transparency about its age. A cached price from 20 hours ago is still useful, but the user should know it is not real-time.

**Independent Test**: Can be tested by requesting a price comparison after a cached entry exists and verifying that the UI shows "Last updated X hours ago" below the Mercadona price.

**Acceptance Scenarios**:

1. **Given** a Mercadona price is served from cache, **When** the comparison view is displayed, **Then** the UI shows when the price was last fetched (e.g. "Last updated 3 hours ago").
2. **Given** a Mercadona price was just fetched live, **When** the comparison view is displayed, **Then** the UI indicates the price is fresh (e.g. "Live price" or "Just updated").
3. **Given** only a static catalog price is available, **When** the comparison view is displayed, **Then** no "last updated" timestamp is shown for the static entry (it is clearly labelled as a reference price).

---

### Edge Cases

- What happens when the pantry item name is a single character or too generic after normalization (e.g. "x")? → Skip Mercadona lookup; show static catalog only.
- What happens when Mercadona returns a result but the product name is very different from the pantry item? → The first closest match is used; the returned product name is displayed so the user can judge relevance.
- What happens when a user adds an accented name (e.g. "leché" or "LECHE ENTERA 1L")? → Names are normalized (lowercase, accent-stripped, quantity suffixes removed) before querying.
- What happens if the Mercadona price is zero or extremely low (possible data quality issue)? → Zero-price results are treated as "not found"; fallback to static catalog applies.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST query Mercadona for the current price of a pantry item when a price comparison is requested.
- **FR-002**: System MUST cache Mercadona price results for 24 hours; a second comparison request for the same normalized item name within that window MUST NOT trigger a new Mercadona request.
- **FR-003**: System MUST normalize pantry item names before querying (lowercase, remove accents, strip quantity and unit suffixes such as "1L", "500g", "x6").
- **FR-004**: System MUST fall back to the static price catalog when Mercadona returns no result for the item.
- **FR-005**: System MUST fall back to the static price catalog when the Mercadona service is unavailable (timeout after 3 seconds, or any 5xx response).
- **FR-006**: System MUST compute the price delta (price paid minus Mercadona price) when both values are available; delta MUST be omitted when either value is missing.
- **FR-007**: System MUST return the Mercadona product name and unit alongside the price when a Mercadona match is found.
- **FR-008**: System MUST return the timestamp of when the Mercadona price was last retrieved (live fetch or last cache write).
- **FR-009**: System MUST indicate in the response whether the Mercadona price was retrieved live or served from cache.
- **FR-010**: System MUST NOT send any user-identifying information (user ID, email, household ID) to Mercadona; only the normalized product name is transmitted.
- **FR-011**: System MUST skip the Mercadona lookup when the normalized item name is fewer than 3 characters; in that case, the static catalog is used directly.
- **FR-012**: The price comparison endpoint MUST remain protected by user authentication; unauthenticated requests MUST be rejected.

### Key Entities

- **PantryItem**: An item registered by the user in their pantry, including the name and optionally the price paid (in Euros).
- **MercadonaPrice**: The current price fetched from Mercadona for a normalized product name — includes product name, price per unit, unit type, and retrieval timestamp.
- **StaticCatalogPrice**: A reference price for a generic product name stored in the application's built-in price database (does not change until manually updated).
- **PriceComparison**: The aggregated result returned to the user — combines the price paid, the Mercadona price (if found), the static catalog price (if found), and the computed delta.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Price comparison results for common Spanish grocery items appear within 3 seconds on first lookup (live fetch from Mercadona).
- **SC-002**: Price comparison results for previously requested items appear in under 500 milliseconds (cache hit).
- **SC-003**: 100% of price comparison requests return a usable result even when Mercadona is completely unavailable — the feature never shows an unhandled error state.
- **SC-004**: Users can see how long ago the displayed Mercadona price was retrieved, enabling them to judge data freshness.
- **SC-005**: Zero bytes of user personal data (name, email, user ID) are transmitted to Mercadona or any external price service.
- **SC-006**: The comparison view clearly distinguishes between a live Mercadona price, a cached Mercadona price, and a static catalog reference price.

## Assumptions

- The price comparison endpoint already exists (TKT-006 delivered the MVP with a static catalog); this feature extends it with live Mercadona data without changing the endpoint URL.
- Mercadona's public, unofficial API at `tienda.mercadona.es/api/` is stable enough for production use; the static catalog fallback mitigates the risk of API instability.
- Only Mercadona is in scope; other Spanish supermarket chains (Carrefour, Lidl, Aldi, Dia) are excluded because they do not provide a reliable, stable API.
- Prices are in Euros; no currency conversion is needed.
- A single Spain-wide warehouse location is sufficient for price accuracy; per-user geolocation is out of scope.
- In-memory caching (surviving for the lifetime of the server process) is sufficient for the initial implementation; persistent cache across restarts is a potential follow-up.
- The "best match" strategy (closest product name to the pantry item name) is acceptable; users see the matched product name and can judge whether it is the right one.
- Price history tracking and price-drop alerts are explicitly out of scope.
