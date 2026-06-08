# 6. MVP Feature Specification

> [Back to PRD Index](../PRD.md) | [Previous: Registration & Onboarding](05-registration-onboarding.md) | [Next: Work Breakdown](07-work-breakdown.md)

---

## 6.1 Host Management Panel

### 6.1.1 Template Editor

**Description:** A visual tool for customizing invitation templates. Users select from 3 preset templates and customize colors, typography, and hero images.

**Scope (MVP):**
- 3 preset wedding templates
- Customization: primary color, secondary color, font family, hero image upload
- Real-time preview
- Auto-save (2-second debounce)
- No drag-and-drop, no custom HTML/CSS

**User Stories:**

| ID | Story | Priority |
|----|-------|----------|
| US-T-01 | As a host, I want to select from preset templates so that I can start designing quickly | Must |
| US-T-02 | As a host, I want to customize colors so that the invitation matches my wedding theme | Must |
| US-T-03 | As a host, I want to change the font so that the invitation reflects my style | Must |
| US-T-04 | As a host, I want to upload a hero image so that the invitation is personal | Must |
| US-T-05 | As a host, I want to see changes in real-time so that I know how the invitation will look | Must |

**Acceptance Criteria:**

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| AC-T-01 | Select template | User is in the template editor | User selects one of 3 preset templates | Preview updates immediately; template is applied to the event |
| AC-T-02 | Customize colors | User has a template selected | User changes the primary color using a color picker | Preview updates in real-time; color is auto-saved |
| AC-T-03 | Customize typography | User has a template selected | User selects a different font family from the dropdown | Preview updates; font is auto-saved |
| AC-T-04 | Upload hero image | User has a template selected | User uploads an image file (JPG/PNG, max 5MB) | Image is uploaded, cropped to fit template, and displayed in preview |
| AC-T-05 | Auto-save | User makes any customization | User waits 2 seconds without further changes | Changes are saved to the database; UI shows "Saved" indicator |

**Edge Cases:**
- Image upload exceeds 5MB -> error message with size limit
- Image format not supported (e.g., .bmp) -> error with supported formats list
- Color picker returns invalid hex -> fallback to last valid color
- Network interruption during auto-save -> retry with offline indicator
- User navigates away before auto-save triggers -> force save on navigation

---

### 6.1.2 Guest Manager

**Description:** Bulk import (CSV) and manual entry of guests with segmentation by category (family, friends, colleagues, other).

**Scope (MVP):**
- Manual guest entry: name, email, phone, category
- CSV import with validation and error preview
- Guest categorization (family, friends, colleagues, other)
- Guest list with search, filter, and pagination
- Free mode: max 5 guests (draft events)
- Published mode: unlimited guests

**User Stories:**

| ID | Story | Priority |
|----|-------|----------|
| US-GM-01 | As a host, I want to add guests manually so that I can build my guest list | Must |
| US-GM-02 | As a host, I want to import guests from a CSV file so that I can add many guests at once | Must |
| US-GM-03 | As a host, I want to categorize guests so that I can organize my list | Must |
| US-GM-04 | As a host, I want to see validation errors before importing so that I can fix them | Must |
| US-GM-05 | As a host, I want to search and filter my guest list so that I can find specific guests | Should |
| US-GM-06 | As a host, I want to delete guests so that I can correct mistakes | Must |

**Acceptance Criteria:**

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| AC-GM-01 | Add guest manually | User is on the guest manager page | User fills in name, email, phone, category and clicks "Add" | Guest is added to the list; appears in the guest table |
| AC-GM-02 | Import valid CSV | User has a CSV with columns: name, email, phone, category | User uploads the CSV | System validates all rows; shows preview with guest count; user confirms import; guests are added |
| AC-GM-03 | Import CSV with errors | User has a CSV with some invalid emails and missing names | User uploads the CSV | System highlights error rows; shows error messages; user can fix and re-upload or skip invalid rows |
| AC-GM-04 | Free mode limit | User is in free (unpublished) mode with 5 guests | User tries to add a 6th guest | System blocks the action; shows upgrade prompt: "Publish your event to add unlimited guests" |
| AC-GM-05 | Categorize guests | User has guests in the list | User filters by category (family/friends/work) | Only guests in that category are displayed |
| AC-GM-06 | Delete guest | User has a guest in the list | User clicks "Delete" and confirms | Guest is soft-deleted; removed from the list |

**Edge Cases:**
- CSV with duplicate emails -> deduplicated, warning shown
- CSV with missing required columns -> error with expected format
- Guest email already exists in event -> duplicate warning, option to skip or update
- Free mode limit reached during CSV import -> import blocked with upgrade prompt
- Large CSV (1000+ rows) -> progress indicator, background processing

---

### 6.1.3 Control Dashboard

**Description:** Real-time tracking of RSVPs, no-shows, dietary restrictions, allergens, and transportation needs.

**Scope (MVP):**
- RSVP statistics: total invited, confirmed, declined, pending, maybe
- Dietary restrictions list (aggregated from RSVPs)
- Transportation needs count
- Plus-one count
- Guest list with RSVP status
- Export guest list as CSV

**User Stories:**

| ID | Story | Priority |
|----|-------|----------|
| US-CD-01 | As a host, I want to see real-time RSVP statistics so that I can track responses | Must |
| US-CD-02 | As a host, I want to see which guests have dietary restrictions so that I can coordinate with the caterer | Must |
| US-CD-03 | As a host, I want to see who needs transportation so that I can arrange it | Must |
| US-CD-04 | As a host, I want to export my guest list so that I can share it with vendors | Should |
| US-CD-05 | As a host, I want to see who hasn't responded so that I can follow up | Must |

**Acceptance Criteria:**

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| AC-CD-01 | View RSVP stats | Host is on the event dashboard | Host views the RSVP section | Dashboard shows: total invited, confirmed, declined, pending, dietary restrictions list, transport needs count |
| AC-CD-02 | Real-time update | A guest submits an RSVP | Host is viewing the dashboard | Dashboard stats update within 5 seconds (no manual refresh) |
| AC-CD-03 | View dietary restrictions | Host clicks "Dietary Restrictions" | System displays the list | List shows guest name and their dietary restrictions |
| AC-CD-04 | Export guest list | Host clicks "Export CSV" | System generates and downloads a CSV file | CSV contains: name, email, phone, category, RSVP status, dietary restrictions, transport needs |
| AC-CD-05 | Filter by RSVP status | Host filters by "Pending" | System updates the guest list | Only guests who haven't responded are displayed |

**Edge Cases:**
- No guests added yet -> empty state with "Add guests to get started"
- No RSVPs received yet -> stats show all zeros with "Waiting for responses"
- Guest updates RSVP -> stats update, previous response replaced
- RSVP submitted after event date -> accepted but flagged as "late"

---

## 6.2 Guest Microsite

### 6.2.1 Static JAMstack Site

**Description:** Ultra-fast, mobile-first invitation page served via CDN. No app download required.

**Scope (MVP):**
- Static HTML/CSS/JS generated per published event
- Served via CDN (Cloudflare)
- Mobile-first responsive design
- Load time < 2 seconds on mobile 3G
- Lighthouse performance score > 90
- Event details: couple names, date, venue, schedule
- Embedded Google Maps venue
- RSVP link (token-based)
- Add-to-calendar buttons (Google Calendar, Apple Calendar)
- Directions links (Google Maps / Waze deep links)

**User Stories:**

| ID | Story | Priority |
|----|-------|----------|
| US-MS-01 | As a guest, I want to view the invitation on my mobile browser so that I don't need to download an app | Must |
| US-MS-02 | As a guest, I want the page to load quickly so that I can see the details immediately | Must |
| US-MS-03 | As a guest, I want to see the venue on a map so that I know where to go | Must |
| US-MS-04 | As a guest, I want to get directions with one tap so that I can navigate easily | Must |
| US-MS-05 | As a guest, I want to add the event to my calendar so that I don't forget | Should |

**Acceptance Criteria:**

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| AC-MS-01 | Load microsite | Event is published | Guest navigates to `aura.planning/e/{slug}` | Static site loads with event details, venue map, RSVP link |
| AC-MS-02 | Mobile responsiveness | Guest accesses the microsite on a mobile device | Guest views the page | Site is fully responsive; all elements are readable and tappable |
| AC-MS-03 | Performance | Guest accesses the microsite on mobile 3G | Page loads | Total load time is under 2 seconds; Lighthouse performance score > 90 |
| AC-MS-04 | Venue map | Guest views the microsite | Guest scrolls to the venue section | Google Maps embed shows the venue location |
| AC-MS-05 | Directions link | Guest clicks "Get Directions" | Browser opens | Google Maps or Waze app opens with the venue as destination |
| AC-MS-06 | Calendar sync | Guest clicks "Add to Calendar" | System generates | .ics file downloads or Google Calendar link opens with event details pre-filled |
| AC-MS-07 | Update after edit | Host updates event details after publishing | Host saves changes | Static site is regenerated; CDN cache is invalidated; new content is visible within 1 hour |

**Edge Cases:**
- Event not published -> 404 page with "This event is not yet available"
- Event deleted -> 404 page with "This event is no longer available"
- Invalid slug -> 404 page
- CDN cache miss during regeneration -> fallback to previous version or loading state
- Google Maps API quota exceeded -> static map image fallback

---

### 6.2.2 Smart RSVP Form

**Description:** Mobile-optimized form for guests to respond to invitations. No account required.

**Scope (MVP):**
- Token-based access (unique per guest)
- Attendance: Yes / No / Maybe
- Dietary restrictions (free text)
- Transportation needs (checkbox)
- Plus-one (checkbox)
- Personal message to hosts (optional, free text)
- RSVP deadline (7 days before event)
- Confirmation page after submission
- Ability to update RSVP before deadline

**User Stories:**

| ID | Story | Priority |
|----|-------|----------|
| US-RSVP-01 | As a guest, I want to RSVP without creating an account so that I can respond quickly | Must |
| US-RSVP-02 | As a guest, I want to indicate my dietary restrictions so that the hosts can accommodate me | Must |
| US-RSVP-03 | As a guest, I want to indicate if I need transportation so that the hosts can arrange it | Must |
| US-RSVP-04 | As a guest, I want to update my RSVP before the deadline so that I can change my plans | Must |
| US-RSVP-05 | As a guest, I want to see a confirmation after submitting so that I know my response was received | Must |

**Acceptance Criteria:**

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| AC-RSVP-01 | Guest accesses RSVP | Guest receives an invitation link | Guest clicks the link | System displays the event details and RSVP form with guest name pre-filled |
| AC-RSVP-02 | Submit RSVP (attending) | Guest is on the RSVP form | Guest selects "Yes, I'll attend", fills dietary restrictions, and submits | RSVP is saved; guest sees confirmation message; host dashboard updates in real-time |
| AC-RSVP-03 | Submit RSVP (not attending) | Guest is on the RSVP form | Guest selects "No, I can't attend" and submits | RSVP is saved; guest sees thank you message; host dashboard shows declined count incremented |
| AC-RSVP-04 | Update RSVP | Guest previously submitted an RSVP | Guest clicks their invitation link again (more than 7 days before event) | Guest can modify their response; changes are saved |
| AC-RSVP-05 | RSVP deadline | Guest tries to update RSVP less than 7 days before event | Guest submits changes | System rejects the update; shows "RSVP deadline has passed" message |
| AC-RSVP-06 | Invalid token | Guest accesses an invalid or expired invitation link | System validates the token | System shows "This invitation link is not valid" with a contact link |

**Edge Cases:**
- Guest submits RSVP without selecting attendance -> validation error
- Guest submits RSVP after deadline -> rejected with message
- Guest shares their link with someone else -> RSVP is tied to the original guest name
- Network interruption during submission -> retry with saved form data
- Duplicate submission (double-click) -> idempotent handling, single RSVP recorded

---

## 6.3 Communication System

### 6.3.1 Email + WhatsApp Invitations

**Description:** Multi-channel invitation sending via Gmail SMTP (email) and Meta WhatsApp Business API.

**Scope (MVP):**
- Email invitations: personalized template with RSVP link
- WhatsApp invitations: template message with RSVP link
- Delivery status tracking (sent, delivered, opened)
- Fallback: email if WhatsApp delivery fails after 2 retries
- Bounce/complaint handling for email (via SNS webhooks)

**User Stories:**

| ID | Story | Priority |
|----|-------|----------|
| US-COM-01 | As a host, I want to send invitations via email so that all guests receive them | Must |
| US-COM-02 | As a host, I want to send invitations via WhatsApp so that guests receive them on their preferred channel | Should |
| US-COM-03 | As a host, I want to see which invitations have been delivered so that I can follow up with non-receivers | Should |
| US-COM-04 | As a host, I want invitations to fall back to email if WhatsApp fails so that no guest is missed | Should |

**Acceptance Criteria:**

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| AC-COM-01 | Send email invitation | Host has guests with email addresses | Host clicks "Send Email Invitations" | Emails are sent via Gmail SMTP; delivery status updated to "sent" |
| AC-COM-02 | Send WhatsApp invitation | Host has guests with phone numbers | Host clicks "Send WhatsApp Invitations" | WhatsApp messages are sent via Meta API; delivery status updated |
| AC-COM-03 | WhatsApp delivery failure | WhatsApp message fails to deliver | System retries after 5 minutes, then 30 minutes | After 2 failed attempts, invitation is sent via email as fallback |
| AC-COM-04 | Email bounce | Email bounces (hard bounce) | SNS webhook notifies the system | Invitation status updated to "failed"; guest flagged; no retry |
| AC-COM-05 | Email complaint | Recipient marks email as spam | SNS webhook notifies the system | Email address suspended; no further emails sent to this address |

**Edge Cases:**
- Guest has neither email nor phone -> invitation marked as "cannot send"; host notified
- WhatsApp template not yet approved by Meta -> fallback to email only
- Gmail SMTP daily limit (500/day) -> monitor quota, plan Mailgun/Brevo migration
- Rate limit exceeded (WhatsApp 1K/hr) -> queue remaining messages for next window

---

### 6.3.2 Automated Reminders

**Description:** Automated RSVP reminders for guests who haven't responded.

**Scope (MVP):**
- Configurable reminder schedule (default: 7 days before RSVP deadline)
- Reminder sent via same channel as original invitation (email or WhatsApp)
- Host can manually trigger reminders
- Reminder respects guest preferences (no reminders if guest opted out)

**User Stories:**

| ID | Story | Priority |
|----|-------|----------|
| US-REM-01 | As a host, I want automated reminders sent to non-responders so that I don't have to follow up manually | Should |
| US-REM-02 | As a host, I want to manually trigger reminders so that I can send them on my own schedule | Should |

**Acceptance Criteria:**

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| AC-REM-01 | Automated reminder | Event has guests who haven't RSVP'd | RSVP deadline approaches (configurable days before) | Reminder is sent to non-responders via their original channel |
| AC-REM-02 | Manual reminder | Host is on the guest manager | Host selects pending guests and clicks "Send Reminder" | Reminder is sent immediately to selected guests |
| AC-REM-03 | Guest responds before reminder | Guest submits RSVP | Reminder is scheduled | Reminder is canceled for that guest |

**Edge Cases:**
- Guest already responded -> reminder not sent
- Guest email bounced -> reminder not sent via email; try WhatsApp if available
- Reminder sent but guest still doesn't respond -> second reminder (configurable)
- Event date changed -> reminder schedule recalculated

---

### 6.3.3 Post-Event Thank You Cards

**Description:** Automated digital thank you cards sent to attendees after the event.

**Scope (MVP):**
- Sent 1 day after event date
- Via email or WhatsApp (same channel as invitation)
- Personalized with guest name and event name
- Optional: link to external photo gallery (Drive, Pixieset)
- Host can customize the thank you message

**User Stories:**

| ID | Story | Priority |
|----|-------|----------|
| US-TY-01 | As a host, I want automated thank you cards sent to attendees so that I can thank them without manual effort | Could |
| US-TY-02 | As a host, I want to include a link to my photo gallery so that guests can see the photos | Could |

**Acceptance Criteria:**

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| AC-TY-01 | Automated thank you | Event date has passed | 1 day after event | Thank you cards are sent to all attendees via their original channel |
| AC-TY-02 | Custom message | Host has customized the thank you message | Thank you cards are sent | Custom message is used instead of default |
| AC-TY-03 | Photo gallery link | Host has added a photo gallery URL | Thank you cards are sent | Link is included in the thank you message |

**Edge Cases:**
- Event has no attendees -> no thank you cards sent
- Guest email bounced -> thank you not sent via email; try WhatsApp if available
- Host hasn't added photo gallery link -> thank you sent without link

---

## 6.4 Live Guest Journey (Killer Feature)

### 6.4.1 Accomplice Magic-Link Panel

**Description:** Secure access via magic link for a trusted person (best man, bridesmaid) to send live event updates.

**Scope (MVP):**
- Host grants accomplice access via email
- Accomplice receives magic link (no password required)
- Accomplice panel: simplified mobile-first interface
- Pre-configured message templates (e.g., "The bride is leaving the hotel!")
- Swipe-to-send gesture to prevent accidental sends
- Delivery status tracking
- Accomplice access expires EventDate + 1 day
- Permissions: send messages, view RSVPs (configurable)

**User Stories:**

| ID | Story | Priority |
|----|-------|----------|
| US-LGJ-01 | As a host, I want to grant accomplice access to a trusted person so that they can send live updates | Must |
| US-LGJ-02 | As an accomplice, I want to access my panel via magic link so that I don't need a password | Must |
| US-LGJ-03 | As an accomplice, I want to send pre-configured messages with a swipe gesture so that I can't accidentally send them | Must |
| US-LGJ-04 | As an accomplice, I want to see which messages have been delivered so that I know guests received updates | Should |
| US-LGJ-05 | As a host, I want to configure the message templates so that the accomplice sends the right messages | Must |

**Acceptance Criteria:**

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| AC-LGJ-01 | Grant accomplice access | Host is on the event dashboard | Host enters accomplice email and selects permissions | Accomplice receives magic link email; access granted |
| AC-LGJ-02 | Accomplice access | Accomplice clicks magic link | System validates token | Accomplice panel opens with message templates and RSVP summary |
| AC-LGJ-03 | Send live message | Accomplice is on the panel | Accomplice swipes a message button | Message is queued for WhatsApp delivery; accomplice sees "Sending..." |
| AC-LGJ-04 | Accidental prevention | Accomplice is on the panel | Accomplice taps (not swipes) a message button | Message is NOT sent; hint shows "Swipe to send" |
| AC-LGJ-05 | Delivery confirmation | Message was sent | WhatsApp delivers the message | Accomplice panel shows "Delivered" status |
| AC-LGJ-06 | Access expiry | Accomplice tries to access panel after EventDate + 1 day | System validates token | System shows "Access has expired"; panel is unavailable |

**Edge Cases:**
- Accomplice loses magic link email -> host can resend from dashboard
- Accomplice token compromised -> host can revoke access from dashboard
- WhatsApp API unavailable during event -> message queued, sent when available
- Accomplice sends too many messages (rate limit) -> 429 response, cooldown message
- Multiple accomplices for same event -> supported; each has independent access
- Accomplice tries to send message before event date -> allowed (host may want pre-event updates)

---

### 6.4.2 Pre-Configured Swipe-to-Send Buttons

**Description:** Simplified interface with pre-configured narrative buttons that require a swipe gesture to send.

**Scope (MVP):**
- 5-8 default message templates per event
- Customizable labels and messages by host
- Swipe gesture (left-to-right) to confirm send
- Visual feedback during swipe (progress indicator)
- Haptic feedback on mobile (if supported)
- Cannot be sent by tap alone

**Default Message Templates:**

| Label | Default Message | Icon |
|-------|----------------|------|
| Bride Leaving | "The bride is leaving the hotel!" | Bride |
| Ceremony Starting | "The ceremony is about to begin!" | Church |
| They Said Yes | "They said YES!" | Ring |
| Cocktail Hour | "Cocktail hour is starting!" | Champagne |
| Dinner Time | "Dinner is served!" | Plate |
| First Dance | "The first dance is starting!" | Dance |
| Cake Cutting | "Time for the cake!" | Cake |
| Party Time | "Let the dancing begin!" | Music |

**Acceptance Criteria:**

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| AC-SS-01 | Swipe to send | Accomplice is on the panel | Accomplice swipes a message button left-to-right | Message is sent; button shows "Sent" confirmation |
| AC-SS-02 | Tap prevention | Accomplice is on the panel | Accomplice taps (not swipes) a message button | Nothing happens; hint shows "Swipe to send" |
| AC-SS-03 | Partial swipe | Accomplice starts swiping but releases before completion | Accomplice releases finger before 80% swipe | Button returns to original position; message not sent |
| AC-SS-04 | Custom message | Host has customized a message template | Accomplice views the panel | Custom message is displayed instead of default |
| AC-SS-05 | Send history | Accomplice has sent messages | Accomplice scrolls down | Sent messages are listed with timestamps and delivery status |

**Edge Cases:**
- Accomplice on desktop (no touch) -> click-and-drag alternative for swipe
- Very slow swipe -> still registers if direction is correct
- Accidental swipe during phone movement -> 80% threshold + confirmation animation prevents most accidents
- Message template deleted by host while accomplice is viewing -> template removed from panel with notification

---

> [Back to PRD Index](../PRD.md) | [Previous: Registration & Onboarding](05-registration-onboarding.md) | [Next: Work Breakdown](07-work-breakdown.md)
