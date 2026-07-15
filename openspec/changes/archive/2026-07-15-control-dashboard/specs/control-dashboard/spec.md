## ADDED Requirements

### Requirement: Host Dashboard View
The system SHALL provide a dashboard for event hosts to view high-level statistics about their event.

#### Scenario: Dashboard loads
- **WHEN** the host navigates to the event dashboard
- **THEN** they see the total number of invited guests, confirmed RSVPs, declined RSVPs, and pending RSVPs.

### Requirement: Dashboard Auto-refresh
The dashboard statistics SHALL update periodically to reflect real-time RSVP changes.

#### Scenario: New RSVP submitted
- **WHEN** a guest submits an RSVP and the host is viewing the dashboard
- **THEN** the dashboard statistics update automatically within the polling interval (5 seconds).

### Requirement: Dietary Restrictions Panel
The system SHALL display a panel summarizing guests with dietary restrictions.

#### Scenario: View dietary restrictions
- **WHEN** the host views the dietary restrictions section
- **THEN** they see a list of guest names along with their specified dietary restrictions.

### Requirement: Transport Needs Panel
The system SHALL display the count of guests requiring transport.

#### Scenario: View transport needs
- **WHEN** the host views the transport needs section
- **THEN** they see the total number of guests who indicated they need transport.

### Requirement: Filterable Guest List
The system SHALL display a guest list that can be filtered by RSVP status.

#### Scenario: Filter by Pending
- **WHEN** the host applies the "Pending" filter to the guest list
- **THEN** the list displays only guests who have not yet responded to their invitation.

### Requirement: Guest List Export
The system SHALL allow the host to export the guest list data to a CSV file.

#### Scenario: Export CSV
- **WHEN** the host clicks "Export CSV"
- **THEN** the system downloads a CSV file containing guest names, emails, phones, categories, RSVP statuses, dietary restrictions, and transport needs.
