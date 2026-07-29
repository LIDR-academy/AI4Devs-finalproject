## REMOVED Requirements

### Requirement: No TBR side effects in this capability

**Reason**: KAN-10 implements `TBRService` integration for US-02 scenario 3 / US-04 scenario 8.

**Migration**: When status transitions to `leido`, invoke `TBRService.markCompletedIfInActiveMonthTbr` and set `meta.tbrAutoCompleted` per the ADDED requirement below.

## ADDED Requirements

### Requirement: TBR auto-complete on mark as read

When `status` transitions to `leido` from any other status, the system SHALL invoke `TBRService` to mark matching open entries in the user's **active calendar month** TBR as completed. The active month SHALL be derived from the persisted `finished_on` date (UTC calendar month) after server auto-fill rules apply.

#### Scenario: Book in current-month TBR marked read (KAN-10 scenario 3)

- **WHEN** status changes to `leido` and the book has an open entry (`completed = false`) in the user's TBR for the active month
- **THEN** that entry is set to `completed = true` with `completed_at` populated and the response includes `meta.tbrAutoCompleted: true`

#### Scenario: Book not in current-month TBR

- **WHEN** status changes to `leido` and the book has no open entry in the active month's TBR
- **THEN** the response omits `tbrAutoCompleted` or sets it to `false`

#### Scenario: Already completed TBR entry

- **WHEN** status changes to `leido` and the book's TBR entry for the active month is already `completed = true`
- **THEN** the system does not error and `meta.tbrAutoCompleted` is omitted or `false`

#### Scenario: No transition to read

- **WHEN** status is already `leido` and the patch only updates `rating` or dates
- **THEN** TBR auto-complete is not invoked and `meta.tbrAutoCompleted` is not set
