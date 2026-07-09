## ADDED Requirements

### Requirement: Template Editor UI
The system SHALL provide a Template Editor page where event hosts can customize their event invitation's template, colors, fonts, and hero image. The editor SHALL display a real-time preview of these changes.

#### Scenario: Real-time preview updates
- **WHEN** the user changes the primary color, font family, or template selection
- **THEN** the preview iframe/component reflects the changes immediately

### Requirement: Auto-save Functionality
The system SHALL automatically save changes made in the Template Editor to the backend `PUT /api/events/{slug}` endpoint.

#### Scenario: Debounced auto-save
- **WHEN** the user makes a change and pauses for 2 seconds
- **THEN** an auto-save request is sent to the backend
- **THEN** the UI indicator changes from "Saving..." to "Saved"

### Requirement: Force Save on Exit
The system SHALL prevent users from losing unsaved changes if they navigate away from the Template Editor before the auto-save debounce triggers.

#### Scenario: Navigating away with unsaved changes
- **WHEN** the user attempts to leave the route with pending changes
- **THEN** the `canDeactivate` guard fires and forces an immediate save before proceeding

### Requirement: Hero Image Upload Endpoint
The backend SHALL expose `POST /api/events/{slug}/upload-hero-image` to accept multipart file uploads for hero images.

#### Scenario: Valid hero image upload
- **WHEN** a JPG or PNG file under 5MB is uploaded
- **THEN** the file is stored in MinIO and its public URL is returned
- **THEN** the event's `HeroImageUrl` is updated in the database

#### Scenario: Invalid file size
- **WHEN** a file larger than 5MB is uploaded
- **THEN** the backend rejects the request with a 400 Bad Request error
