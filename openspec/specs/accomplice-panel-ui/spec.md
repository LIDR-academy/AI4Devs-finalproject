# Accomplice Panel UI

## Purpose
This capability describes the frontend Accomplice Panel UI where an authenticated accomplice can send live messages via magic link and a swipe-to-send gesture.

## Requirements

### Requirement: Accomplice Authentication
The system SHALL authenticate the accomplice via a magic link token in the URL before displaying the panel.

#### Scenario: Valid Magic Link
- **WHEN** the accomplice visits `/accomplice/:token` with a valid, unexpired token
- **THEN** the system verifies the token, stores the issued JWT, and redirects the user to the panel view.

#### Scenario: Expired Magic Link
- **WHEN** the accomplice visits `/accomplice/:token` with an expired token
- **THEN** the system displays an "Access has expired" message with instructions to contact the host.

### Requirement: Swipe-to-Send Gesture
The system SHALL provide a swipeable button to send messages to prevent accidental taps.

#### Scenario: Successful Swipe
- **WHEN** the accomplice swipes a message button left-to-right past the 80% threshold
- **THEN** the system triggers the send action, displays a "Sent" state with a checkmark, and triggers a haptic vibration (if supported).

#### Scenario: Incomplete Swipe
- **WHEN** the accomplice releases the button before reaching the 80% threshold
- **THEN** the button animates back to its original position without sending a message.

#### Scenario: Accidental Tap
- **WHEN** the accomplice taps the button without swiping
- **THEN** the system displays a tooltip or hint saying "Swipe to send" and no message is sent.

### Requirement: Delivery Status and History
The system SHALL display the sent messages history and update their delivery status in real-time.

#### Scenario: Viewing Sent Messages
- **WHEN** the accomplice sends messages
- **THEN** the messages appear in a scrollable history list with their timestamps and delivery statuses (pending, sent, delivered, failed).

#### Scenario: Polling for Status
- **WHEN** the accomplice panel is open
- **THEN** the system polls for live message delivery status updates every 5 seconds and updates the UI accordingly.

### Requirement: RSVP Summary View
The system SHALL display an RSVP summary if the accomplice has the required permission.

#### Scenario: Authorized RSVP View
- **WHEN** an accomplice with the `view_rsvps` permission views the panel
- **THEN** the system displays an RSVP summary section showing confirmed, declined, and pending counts.
