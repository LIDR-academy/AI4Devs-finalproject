## ADDED Requirements

### Requirement: Manual Guest Entry
The system SHALL allow users to manually add a single guest with name, email (optional), phone (optional), and category (optional).

#### Scenario: Successfully add manual guest
- **WHEN** user submits the add guest form with valid data
- **THEN** the guest is added to the event's guest list and displayed in the table

#### Scenario: Try to add without name
- **WHEN** user tries to submit the form without providing a name
- **THEN** the system rejects the submission with a validation error

### Requirement: CSV Bulk Import
The system SHALL allow users to upload a CSV file to bulk import guests. The system SHALL validate each row and return row-specific errors without failing the entire import for valid rows.

#### Scenario: Successful clean CSV import
- **WHEN** user uploads a valid CSV with no errors
- **THEN** all guests are imported and a success summary is shown

#### Scenario: CSV with partial errors
- **WHEN** user uploads a CSV containing some invalid rows (e.g., missing name or malformed email)
- **THEN** valid rows are imported, and invalid rows are displayed with specific error messages for correction

### Requirement: Email Deduplication
The system SHALL ensure guest emails are unique per event, excluding soft-deleted records.

#### Scenario: Duplicate email detected
- **WHEN** user imports or manually adds a guest with an email that already exists for the event
- **THEN** the system flags the entry as a duplicate and offers options to skip or update

### Requirement: Free Tier Guest Limit
The system SHALL limit events in "draft" status to a maximum of 5 guests.

#### Scenario: Exceeding free tier limit
- **WHEN** a user tries to add a 6th guest to a draft event
- **THEN** the system blocks the action and displays a message prompting them to publish the event

### Requirement: Soft Delete and Cascade
The system SHALL support soft deletion of guests. When a guest is soft deleted, their related invitations SHALL also be soft deleted.

#### Scenario: User deletes a guest
- **WHEN** a user deletes a guest from the manager table
- **THEN** the guest and their invitations are soft-deleted and no longer appear in active queries
