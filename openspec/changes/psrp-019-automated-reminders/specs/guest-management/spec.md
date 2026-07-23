## ADDED Requirements

### Requirement: Manual Reminder UI
The guest manager UI SHALL allow the host to send manual reminders to pending guests.

#### Scenario: Sending manual reminders
- **WHEN** the host selects one or more pending guests and clicks "Send Reminder"
- **THEN** a confirmation dialog appears, and upon confirmation, the UI calls the manual reminder API, and the guests receive a reminder.
