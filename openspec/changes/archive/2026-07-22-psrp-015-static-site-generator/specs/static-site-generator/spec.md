## ADDED Requirements

### Requirement: Queue Processing
The system SHALL monitor the `ssg:queue` Redis queue and process incoming static site generation payloads (eventId, eventSlug, eventType) asynchronously.

#### Scenario: Processing published event
- **WHEN** an event is published and a message is added to `ssg:queue`
- **THEN** the SSG worker pulls the message and begins the site generation process

### Requirement: Template Rendering
The system SHALL render Razor templates (index.html, styles.css) using the event's specific data (venue, date, couple names, custom colors, fonts) and the selected template layout.

#### Scenario: Rendering HTML and CSS
- **WHEN** the generation process starts
- **THEN** the system generates static HTML from the Razor view and CSS containing the event's primary and secondary colors

### Requirement: MinIO Upload
The system SHALL upload the generated static files (HTML, CSS, JS) and necessary assets to a MinIO bucket named `static-sites` under the path `{event-slug}/`.

#### Scenario: Successful upload
- **WHEN** template rendering completes successfully
- **THEN** the files are uploaded to MinIO and made available for public access

### Requirement: CDN Cache Invalidation
The system SHALL trigger a CDN cache invalidation (purge) for the specific event slug path (`/e/{event-slug}/*`) when an event site is regenerated.

#### Scenario: Updating an existing event
- **WHEN** a previously published event is updated and re-rendered
- **THEN** the system calls the Cloudflare API to purge the cache, ensuring the new content is visible to users within 1 hour

### Requirement: Mobile-First Performance
The generated static site SHALL be optimized for mobile devices, targeting a Lighthouse performance score > 90 and a load time < 2s on a 3G connection.

#### Scenario: Performance evaluation
- **WHEN** the static site is served to a mobile device
- **THEN** it meets the performance requirements by utilizing inlined critical CSS, minified assets, and lazy-loaded map iframes

### Requirement: Event Actions
The generated site SHALL include functional links for RSVP, directions, and calendar integration without relying on a dynamic frontend.

#### Scenario: Using site actions
- **WHEN** a guest clicks "Add to Calendar" or "Get Directions"
- **THEN** the system provides a .ics file download (or Google Calendar link) or opens the mapping application (Google Maps/Waze) using deep links based on the venue's coordinates
