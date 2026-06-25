# Feature Specification: Recipe Suggestions Based on Current Pantry

**Feature Branch**: `002-recipe-suggestions`

**Created**: 2026-06-25

**Status**: Draft

**Input**: User description: "EXT-005 — Recipe Suggestions Based on Current Pantry. Users want recipe suggestions based on what is expiring in their pantry so they can use those ingredients before they go bad."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Personalized Recipe Suggestions (Priority: P1)

A user opens the Recipes section of the app and immediately sees a list of recipe ideas tailored to the ingredients they currently have in their pantry, with the most relevant suggestions — those using items that are expiring soonest — shown first. Each suggestion clearly indicates how many of their pantry items the recipe uses.

**Why this priority**: This is the core user value. Without suggestions, the feature does not exist. It directly reduces food waste by helping users act on expiring items before they spoil.

**Independent Test**: Can be fully tested by adding pantry items with different expiry dates and verifying that the suggestions list appears with recipes ranked by pantry overlap, with soonest-expiring items contributing most to the ranking.

**Acceptance Scenarios**:

1. **Given** a user has pantry items with recognizable ingredient names, **When** they open the Recipes section, **Then** they see at least one recipe suggestion matching those ingredients.
2. **Given** a user has multiple pantry items with different expiry dates, **When** they view suggestions, **Then** recipes using the soonest-expiring items appear higher in the list.
3. **Given** a user has no pantry items, **When** they open the Recipes section, **Then** they see an empty state message rather than an error.
4. **Given** the external recipe source is temporarily unavailable, **When** the user opens the Recipes section, **Then** they see a friendly unavailability message rather than a crash or blank screen.

---

### User Story 2 - View Recipe Detail with Pantry Match (Priority: P2)

A user selects a recipe suggestion and sees the full recipe details: instructions, a complete ingredient list, and a clear visual distinction between ingredients they already have in their pantry and ingredients they would need to obtain.

**Why this priority**: Detail view enriches the decision-making experience and helps users understand what they can cook right now versus what they'd need to buy. It builds on Story 1 but is not required to deliver core value.

**Independent Test**: Can be fully tested by navigating to a recipe detail page and verifying that matched pantry ingredients are visually distinguished from missing ones, and that cooking instructions are displayed.

**Acceptance Scenarios**:

1. **Given** a user selects a recipe suggestion, **When** the detail view opens, **Then** they see cooking instructions, a full ingredient list, and a visual indicator distinguishing pantry-matched ingredients from missing ones.
2. **Given** a recipe has ingredients not in the user's pantry, **When** viewing the detail, **Then** those missing ingredients are shown in a visually distinct way (e.g., greyed out) to help the user identify what they would need to purchase.
3. **Given** a user is on the recipe detail, **When** they navigate back, **Then** they return to the suggestions list without losing their place.

---

### User Story 3 - Mark Recipe as Cooked to Update Pantry (Priority: P1)

A user has cooked a recipe and wants to update their pantry to reflect the ingredients they used. They mark the recipe as cooked, and the app automatically records consumption events for all matched pantry items. The user receives confirmation that their pantry has been updated.

**Why this priority**: This closes the food-waste loop. Without this action, pantry items remain marked as available even after use, making the pantry inaccurate. It also reinforces the app's core value proposition of active pantry management.

**Independent Test**: Can be fully tested by cooking a recipe and verifying that the matched pantry items are marked as consumed, that consumption events are recorded, and that a success message is shown.

**Acceptance Scenarios**:

1. **Given** a user is viewing a recipe detail with matched pantry items, **When** they tap "Mark as cooked", **Then** consumption events are recorded for all matched pantry items and a success message is shown.
2. **Given** a user marks a recipe as cooked, **When** the action completes, **Then** the pantry is updated and the consumed items no longer appear as available.
3. **Given** a user attempts to mark a recipe as cooked referencing pantry items that do not belong to their household, **When** the action is submitted, **Then** the request is rejected and no consumption events are created.
4. **Given** a network error occurs while marking a recipe as cooked, **When** the error happens, **Then** the user sees an error message and their pantry state is unchanged (no partial updates).

---

### Edge Cases

- What happens when a recipe's ingredients do not match any current pantry items (match score of zero)?
- What if the user's pantry has items with non-standard names that don't match the external recipe database's ingredient naming?
- What happens if the external recipe source returns duplicate or inconsistent recipe data?
- What if the user taps "Mark as cooked" multiple times rapidly before the first request completes?
- What happens when all pantry items are consumed and the user returns to the suggestions list?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a list of recipe suggestions to authenticated users, ordered by how many of the user's pantry items the recipe uses, with soonest-expiring items weighted most heavily.
- **FR-002**: Recipe suggestions MUST be accessible from the app's primary navigation.
- **FR-003**: Each recipe suggestion MUST clearly show the recipe name, a visual preview (thumbnail), and how many of the user's pantry ingredients it uses.
- **FR-004**: The system MUST allow users to view full recipe details, including cooking instructions and a complete ingredient list.
- **FR-005**: The recipe detail view MUST visually distinguish between ingredients the user has in their pantry and ingredients they do not have.
- **FR-006**: The system MUST provide a "Mark as cooked" action on the recipe detail view that records consumption events for all matched pantry items in a single operation.
- **FR-007**: The "Mark as cooked" action MUST be atomic — it either consumes all matched items or none; partial consumption MUST NOT occur.
- **FR-008**: The system MUST verify that pantry items submitted in a "Mark as cooked" action belong to the authenticated user's household before recording any consumption events.
- **FR-009**: When the external recipe source is unavailable, the system MUST return a degraded response (empty list or cached results) with an informative message, without crashing or displaying an unhandled error.
- **FR-010**: The system MUST cache recipe data from the external source to reduce dependency on its availability and improve response speed for repeated requests.

### Key Entities

- **Recipe Suggestion**: A recipe retrieved from the external source, enriched with pantry-match data; has a unique identifier, name, visual preview, a list of matched pantry ingredients, a list of missing ingredients, and a match score (0–1 range indicating pantry overlap).
- **Recipe Detail**: The full content of a single recipe; includes cooking instructions, a complete ingredient list with quantities, and pantry-match status for each ingredient.
- **Pantry Match**: The relationship between a recipe's ingredients and the user's current pantry items; drives ranking and the "Mark as cooked" action.
- **Consumption Event**: An existing entity in the system that records when a pantry item has been used; created in bulk when a user marks a recipe as cooked.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users with at least one pantry item containing a recognizable ingredient name see at least one recipe suggestion when opening the Recipes section.
- **SC-002**: Recipe suggestions are presented within 3 seconds of opening the Recipes section under normal conditions.
- **SC-003**: The recipe with the highest number of pantry-matched ingredients appears first in the list 100% of the time.
- **SC-004**: "Mark as cooked" successfully records consumption events for all matched pantry items in a single interaction, with a success confirmation shown to the user.
- **SC-005**: When the external recipe source is unavailable, users see a clear unavailability message within the normal page load time — no unhandled errors or blank screens.
- **SC-006**: Zero unauthorized consumption events are created — every "Mark as cooked" action is validated against the authenticated user's household.

## Assumptions

- The pantry management feature (item storage and expiry tracking) and the consumption event recording feature are fully implemented and available as a dependency; this feature builds on top of them.
- The external recipe source provides sufficient coverage of common ingredients to return meaningful suggestions for typical household pantries.
- Ingredient matching between pantry item names and recipe ingredient names is performed using a simple case-insensitive substring comparison; fuzzy or semantic matching is out of scope for this version.
- "Mark as cooked" consumes the full quantity of each matched pantry item rather than decrementing by a measured amount, consistent with the existing consumption flow.
- Missing ingredients are shown in the recipe detail view to help users identify what they might need to buy; this is considered good UX and requires no additional backend work.
- Recipes with a very low match score (zero or near-zero pantry overlap) are included in the results but ranked last; the user interface may choose to de-emphasize or hide them below a minimum threshold.
- Saving favourite recipes, custom recipe creation, AI-generated recipes, and advanced fuzzy ingredient matching are explicitly out of scope for this version.
- The external recipe source is a free public service with no authentication requirement and no guaranteed uptime; the system must handle its unavailability gracefully.
- Recipe data from the external source is cached per process to reduce load and improve resilience; cached data is considered fresh for a defined time window and does not persist across server restarts.
