## MODIFIED Requirements

### Requirement: Room page layout
The room page (`/stream/{id}`) SHALL present a header showing the stream's `username`, then `title`, then `description` when present, a **media area** (hosting the live media surface — creator pre-join/live or viewer video/offline, defined in the `portal-stream-media` capability), and a chat area. It SHALL lay these out as media 2/3 + chat 1/3 (columns) on wide viewports and media 1/2 + chat 1/2 (rows) on narrow viewports. The same layout SHALL apply to creator and viewers. A **chat toggle** SHALL be available on both layouts; hiding chat SHALL expand the media area to full width (wide) or full height (narrow). Toggle state SHALL be session-local and held in memory only. The media area and the chat SHALL be independent (per `portal-stream-media`): toggling or a fault in one SHALL NOT disturb the other.

#### Scenario: Responsive two-layout
- **WHEN** the room page is viewed on a wide viewport and then a narrow one
- **THEN** it shows media 2/3 + chat 1/3 columns when wide and media 1/2 + chat 1/2 rows when narrow

#### Scenario: Chat toggle expands the media area
- **WHEN** the visitor toggles chat off
- **THEN** the chat area is hidden and the media area expands to fill the space, on both layouts, and toggling on restores chat, without disturbing the media connection

#### Scenario: Header shows username first
- **WHEN** the room page renders for a stream with a username, title, and description
- **THEN** the header shows the username, then the title, then the description, and the username is display-only
