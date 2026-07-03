# Feature Specification: Automatic Expiry Learning from User Overrides

**Feature Branch**: `006-expiry-learning`

**Created**: 2026-06-29

**Status**: Draft

**Input**: User description: "docs/tickets/extendedMVP/EXT-007-expiry-learning.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Improved Expiry Suggestions Based on Past Corrections (Priority: P1)

A user who regularly buys the same types of groceries notices that the app's suggested expiry dates for dairy products are always 5 days shorter than what they actually experience. After correcting the app 3 or more times, the next time they add a dairy item, the suggestion automatically reflects their preference — no manual correction needed.

**Why this priority**: This is the core value of the feature. Without automatic adjustment, the feature delivers no user-facing benefit. Every other story builds on this foundation.

**Independent Test**: Can be fully tested by adding the same food category item multiple times, overriding the suggested expiry each time, and verifying the subsequent suggestion is adjusted — delivering the primary value of reducing repetitive corrections.

**Acceptance Scenarios**:

1. **Given** a user has corrected the app's expiry suggestion for the "dairy" category at least 3 times with a consistent positive offset (e.g., always adds 5 more days), **When** the user adds a new dairy item and the system generates an expiry estimate, **Then** the estimate is automatically adjusted upward by approximately 5 days compared to the baseline rule.
2. **Given** a user has only 1 or 2 overrides in a category, **When** the system generates a new estimate for that category, **Then** the estimate uses the baseline rule without any learned adjustment.
3. **Given** a user's historical overrides in a category include an extreme value (e.g., +200 days), **When** the system applies the learned adjustment, **Then** the adjustment is capped so that the final estimate never exceeds the baseline by more than 30 days, nor falls below it by more than 30 days.

---

### User Story 2 - Confidence Level Reflects Learning Progress (Priority: P2)

A user sees the confidence indicator on an expiry suggestion. After having corrected the same category 3 or more times, the confidence indicator upgrades from "Low" to "Medium", signaling that the system has learned from their behavior and is now making a more reliable estimate.

**Why this priority**: Trust in the system is a key adoption driver. Surfacing confidence improvement shows users that their corrections are being used and rewards engagement with the feature.

**Independent Test**: Can be tested independently by checking the confidence indicator value before and after accumulating 3 overrides in a single category — delivering visible proof of learning without requiring the full settings UI.

**Acceptance Scenarios**:

1. **Given** a user has fewer than 3 overrides in a food category, **When** the system generates an expiry estimate for an item in that category, **Then** the confidence level is "Low" (or whatever the baseline confidence is for that rule).
2. **Given** a user has made 3 or more overrides in a category, **When** the system generates a new estimate for that category, **Then** the confidence level is at least "Medium", even if the baseline rule would have assigned "Low".

---

### User Story 3 - View Learned Preferences in Settings (Priority: P3)

A user wants to understand what the app has learned about their habits. They navigate to the settings page and see a "Expiry Learning" section listing each food category where the system has adapted its suggestions, along with a plain-language description of the adjustment (e.g., "You prefer +5 days for Dairy").

**Why this priority**: Transparency builds trust. Users need to be able to see and verify what the system has inferred about them before they feel comfortable relying on it.

**Independent Test**: Can be tested by seeding the system with preference data for a user and verifying the settings page renders a correctly formatted list — delivering full transparency without depending on the reset functionality.

**Acceptance Scenarios**:

1. **Given** a user has learned preferences in 2 food categories, **When** they open the settings page and view the "Expiry Learning" section, **Then** both categories are listed with a human-readable description of the average adjustment for each.
2. **Given** a user has no learned preferences yet, **When** they open the settings page and view the "Expiry Learning" section, **Then** an empty state message is displayed rather than an error.

---

### User Story 4 - Reset Learned Preferences (Priority: P3)

A user realizes the app has learned incorrect preferences (e.g., they had unusual buying habits for a period). They want to clear the learned data for a specific category or for all categories, restoring the system to its default estimation behavior.

**Why this priority**: Without a reset mechanism, users are locked into bad learnings. This is a safety valve that completes the control loop started by User Story 3.

**Independent Test**: Can be tested by resetting a category and verifying the next estimate uses the baseline rule (no adjustment applied) — delivering user control independently of the settings view rendering.

**Acceptance Scenarios**:

1. **Given** a user has learned preferences for "meat" and "produce", **When** they reset preferences for "meat" only, **Then** subsequent expiry suggestions for "meat" use the baseline rule while suggestions for "produce" remain adjusted.
2. **Given** a user has learned preferences for multiple categories, **When** they reset all preferences, **Then** subsequent expiry suggestions for all categories return to using the baseline rule.
3. **Given** a user tries to reset preferences for a category they have never corrected, **When** the reset action is triggered, **Then** the system responds gracefully without displaying an error.

---

### Edge Cases

- What happens when a user overrides an expiry but no system suggestion exists for that item? (Learning is skipped silently; the override is still saved successfully.)
- What happens when a user's first override is an extreme outlier (e.g., +200 days)? (The raw value is stored for historical accuracy; the clamp is only applied when the adjustment is used to generate a future suggestion.)
- What happens when all 5 history slots are filled and a new override comes in? (The oldest entry is dropped; the new one is added; the average is recomputed from the updated history.)
- What if a food category cannot be identified at the time of override? (The learning step is skipped silently; the override itself still saves successfully.)
- What if the learning system encounters a database error during preference storage? (The error is logged internally; the user's override is saved and returned successfully without any error being surfaced to the user.)
- What if the settings page fails to load preference data? (An empty state is displayed; no error page is shown.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST record the signed difference in days between its suggested expiry date and the user's chosen expiry date whenever the user overrides a suggestion that originated from a system estimate.
- **FR-002**: System MUST maintain a rolling history of the last 5 override differences per user per food category; when a 6th override is recorded, the oldest entry is dropped.
- **FR-003**: System MUST compute and store the running average of the stored differences for each user-category combination.
- **FR-004**: System MUST apply the stored average difference on top of the baseline expiry estimate whenever generating a new suggestion for a user who has 3 or more overrides recorded for that food category.
- **FR-005**: System MUST clamp the applied adjustment so that the resulting suggestion never deviates more than 30 days in either direction from the baseline estimate.
- **FR-006**: System MUST upgrade the confidence level of an expiry suggestion from "Low" to at least "Medium" when the user has 3 or more recorded overrides for the corresponding food category.
- **FR-007**: System MUST expose an endpoint allowing the authenticated user to retrieve a list of all food categories for which they have learned preferences, including the average adjustment and the number of overrides recorded.
- **FR-008**: System MUST expose an endpoint allowing the authenticated user to delete the learned preference for a single specified food category.
- **FR-009**: System MUST expose an endpoint allowing the authenticated user to delete all their learned preferences at once.
- **FR-010**: A settings section MUST display the list of learned preferences using the data from FR-007, with each entry showing the category name and the average adjustment in plain language (e.g., "You prefer +5 days for Dairy").
- **FR-011**: The settings section MUST include a reset button for each individual category and a "Reset all" button for removing all preferences at once.
- **FR-012**: System MUST NOT block or delay the user's override save operation when a learning system error occurs; the error MUST be logged without surfacing to the user.
- **FR-013**: Preference data MUST be strictly scoped to the authenticated user; no user may read or delete another user's preferences.

### Key Entities *(include if feature involves data)*

- **Category Expiry Preference**: Represents the accumulated learning for a specific food category for a specific user. Holds the history of recent override differences (up to 5), the computed average adjustment, and a count of total overrides recorded. One record exists per user-category combination.
- **Expiry Override Event**: Occurs when a user changes the system-suggested expiry date for a pantry item. Carries the original suggestion date, the user-chosen date, and the food category — the inputs needed to compute the learning delta.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After 3 or more corrections in a food category, 100% of subsequent suggestions for that category automatically include the learned adjustment (no manual re-correction required for the same offset).
- **SC-002**: No adjusted suggestion ever exceeds ±30 days from the baseline estimate, regardless of the magnitude of historical overrides.
- **SC-003**: The confidence level for a food category with 3 or more recorded overrides is "Medium" or higher on 100% of subsequent suggestions.
- **SC-004**: The settings page "Expiry Learning" section renders the correct adjustment values for all categories within the same response time as other settings sections.
- **SC-005**: A reset action (single category or all) takes full effect within the next estimate generated after the reset completes — no stale adjustments are applied.
- **SC-006**: 100% of preference data is user-scoped; no cross-user data leakage is possible via any preference endpoint.
- **SC-007**: A learning system failure (any internal error during preference update) never prevents the user from successfully saving their expiry override — the override succeeds in 100% of such cases.

## Assumptions

- The baseline expiry estimation system (EXT-004 / TKT-004) is already live and generating suggestions; this feature extends it without replacing it.
- Each pantry item belongs to exactly one food category that is known at estimation and override time.
- "Override" is defined as a user actively changing a system-generated suggestion; items added manually without any system suggestion are excluded from learning (no delta can be computed).
- A rolling window of 5 overrides is sufficient to reflect current user habits without retaining excessive historical data.
- A ±30-day clamp covers all realistic food expiry adjustment scenarios for domestic grocery shopping.
- The settings page is an existing, authenticated section of the application; the "Expiry Learning" summary is added as a new sub-section within it.
- Preference data is owned by the user who created it; there is no team or household sharing scope in this feature.
- Cross-user learning (aggregating preferences across all users to improve global baselines) is explicitly out of scope for this feature.
- Items where no prior expiry assessment exists in the system do not produce a learning delta; this is an acceptable gap and requires no user-facing message.
