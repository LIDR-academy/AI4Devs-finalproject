## REMOVED Requirements

### Requirement: No TBR side effects in this capability

**Reason**: KAN-13 (US-04 scenario 8) implements TBR auto-complete now that KAN-10 `TBRService` exists.

**Migration**: When status transitions to `leido`, invoke `TBRService.markCompletedIfInActiveMonthTbr` and set `meta.tbrAutoCompleted` per the ADDED requirement below.

## ADDED Requirements

### Requirement: TBR auto-complete on mark as read

When `status` transitions to `leido` from any other status, the system SHALL invoke `TBRService.markCompletedIfInActiveMonthTbr(userId, bookId, finishedOn)` to mark matching open entries in the user's **active calendar month** TBR as completed. The active month SHALL be derived from the persisted `finished_on` date (UTC calendar month) after server auto-fill rules apply.

#### Scenario: Book in active-month TBR marked read (KAN-13 / US-04 scenario 8)

- **WHEN** status changes to `leido` and the book has an open entry (`completed = false`) in the user's TBR for the active month
- **THEN** that entry is set to `completed = true` with `completed_at` populated and the response includes `meta.tbrAutoCompleted: true`

#### Scenario: Book not in active-month TBR

- **WHEN** status changes to `leido` and the book has no open entry in the active month's TBR
- **THEN** the response omits `tbrAutoCompleted` or sets it to `false`

#### Scenario: Already completed TBR entry

- **WHEN** status changes to `leido` and the book's TBR entry for the active month is already `completed = true`
- **THEN** the system does not error and `meta.tbrAutoCompleted` is omitted or `false`

#### Scenario: No transition to read

- **WHEN** status is already `leido` and the patch only updates `rating` or dates
- **THEN** TBR auto-complete is not invoked and `meta.tbrAutoCompleted` is not set

#### Scenario: TBR update failure does not fail PATCH

- **WHEN** status transitions to `leido` but the TBR completion update fails internally
- **THEN** the reading record remains saved with status `leido` and the response omits `meta.tbrAutoCompleted`
