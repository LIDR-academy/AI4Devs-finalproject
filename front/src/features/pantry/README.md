# Pantry Feature

Feature module for pantry item CRUD and stock tracking.

## Auto-expiry of long-expired items (EXT-010)

Items that stay past their expiration date beyond a per-user threshold (default **14 days**,
configurable **7–60 days** in Settings) are surfaced as "stale candidates":

- The pantry page shows a banner ("N items may be expired") opening a bulk-review sheet
  (`ExpiredItemsReview`) where the user can **mark all as wasted**, **keep** individual items, or
  **dismiss all** (which suppresses the banner for a 7-day grace window).
- A daily background pass records a digest and notifies the user; if no action is taken within the
  **7-day grace**, items are automatically marked as wasted, tagged on the consumption event with
  `method = "AUTO_EXPIRED"` so automatic cleanup is distinguishable from manual waste.
- Auto-expiry can be disabled entirely in Settings; disabled users receive no digest and have no
  items auto-wasted.

API bindings live in `pantry.api.ts` (`getExpiredCandidates`, `bulkWaste`, `bulkDismissExpired`)
and `features/notifications/notifications.api.ts` (`getAutoExpirySettings`,
`updateAutoExpirySettings`).
