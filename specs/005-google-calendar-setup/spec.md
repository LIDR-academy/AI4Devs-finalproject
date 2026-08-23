# Feature Specification: Google Calendar Infrastructure Setup

**Feature Branch**: `005-google-calendar-setup`

**Created**: 2026-07-15

**Status**: Draft

**Input**: User description: "https://linear.app/ai4devs/issue/COACHER-58/t-211-set-up-google-cloud-project-calendar-api-service-account-system"

## Clarifications

### Session 2026-07-15
- Q: Should we provision separate GCP projects / Service Accounts / system calendars per environment (dev, staging, production), or share a single set across all environments? → A: Shared GCP project, per-environment calendars (one project, one SA, separate calendars for dev/staging/prod)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer provisions GCP infrastructure for Calendar API (Priority: P1)

As a developer (DevOps/platform engineer), I want to provision a Google Cloud project, enable the Calendar API, create a Service Account with a JSON key, and set up a dedicated system calendar so that the scheduling engine can read from and write to Google Calendar programmatically without end-user interaction.

**Why this priority**: This is the foundation of all Calendar integration — without the provisioned GCP infrastructure, the scheduling engine cannot authenticate or interact with Google Calendar at all.

**Independent Test**: A Service Account email can be used to authenticate a Google Calendar API call (e.g., listing calendars), and the system calendar ID can be retrieved via the API. The JSON key file exists at a known secure path and is loadable by the scheduling engine.

**Acceptance Scenarios**:

1. **Given** a new GCP project with billing enabled, **When** the Calendar API is enabled, **Then** `gcloud services list` confirms `calendar-json.googleapis.com` is in the active services list
2. **Given** an active GCP project with Calendar API enabled, **When** a Service Account is created and a JSON key is generated, **Then** the key file is saved to a secure location (outside version control) and is loadable by the scheduling engine
3. **Given** a Service Account with a valid JSON key, **When** it is used to authenticate against the Calendar API, **Then** the auth token is obtained successfully and the Service Account can interact with Google Calendar
4. **Given** a dedicated system calendar, **When** the Service Account email is granted "Make changes to events" (writer) permission, **Then** the Service Account can create, read, update, and delete events on that calendar

---

### User Story 2 - Security review confirms least-privilege access (Priority: P1)

As a security reviewer, I want to verify that the provisioned infrastructure follows least-privilege principles so that the Service Account has only the permissions necessary to operate the scheduling engine and no broader access.

**Why this priority**: A security misconfiguration at the infrastructure level could expose the calendar system to unauthorized access or data leaks, which is a non-negotiable security requirement.

**Independent Test**: The Service Account cannot access calendars it has not been explicitly shared with, and has no GCP IAM roles beyond what is strictly required for authentication.

**Acceptance Scenarios**:

1. **Given** the provisioned Service Account, **When** IAM roles are reviewed, **Then** the Service Account has no broad IAM roles assigned (e.g., no `Editor`, `Owner`, or `Calendar Admin` roles)
2. **Given** the system calendar, **When** sharing permissions are reviewed, **Then** only the Service Account email has writer access and no other users or groups have access unless explicitly required
3. **Given** the JSON key file, **When** the codebase is scanned, **Then** the key file is never committed to version control (confirmed by `.gitignore` and absence from git history)

---

### Edge Cases

- What happens if the GCP project reaches its Calendar API quota? The scheduling engine should handle API errors gracefully with retry logic and logging.
- What happens if the Service Account key is rotated (regenerated)? The scheduling engine must be updated with the new key; the old key will stop working immediately.
- What happens if the system calendar is deleted accidentally? A new calendar must be created and re-shared with the Service Account; the Calendar ID changes.
- What happens if billing is disabled on the GCP project? All Calendar API calls will fail with billing-related errors.
- What happens if the Service Account is deleted? All existing calendar access is revoked; a new Service Account must be created and re-shared with the calendar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST have a dedicated GCP project with a descriptive project ID (e.g., `coacher-scheduling-engine`) separate from any personal projects
- **FR-002**: The Google Calendar API (`calendar-json.googleapis.com`) MUST be enabled on the project
- **FR-003**: A dedicated Service Account MUST be created with a descriptive name (e.g., `scheduling-engine-calendar-sa`)
- **FR-004**: The Service Account MUST NOT be assigned any broad GCP IAM roles — calendar access is controlled exclusively via Calendar sharing permissions
- **FR-005**: A JSON key MUST be generated for the Service Account
- **FR-006**: The JSON key file MUST be stored securely outside the version-controlled codebase (secrets manager, environment variable, or `.env` file added to `.gitignore`)
- **FR-007**: A dedicated Google Calendar MUST be created per environment (dev, staging, production) exclusively for the scheduling engine
- **FR-008**: The system calendar MUST be shared with the Service Account email with "Make changes to events" (writer) permission
- **FR-009**: The Calendar ID of each environment's system calendar (dev, staging, prod) MUST be recorded and made available as separate configuration values to the scheduling engine
- **FR-010**: The Service Account email and Calendar ID MUST be injected into the application via environment variables (following constitution secrets management rules)
- **FR-011**: All provisioning steps MUST be reproducible via `gcloud` CLI commands or documented scripts

### Key Entities *(include if feature involves data)*

- **Google Cloud Project**: The top-level GCP container that holds the Calendar API, Service Account, and billing configuration. Identified by a unique project ID.
- **Service Account**: A non-human (machine) identity that authenticates to Google APIs. Identified by a unique email address (e.g., `scheduling-engine-calendar-sa@<project-id>.iam.gserviceaccount.com`). Possesses a JSON key file for authentication.
- **System Calendar**: A dedicated Google Calendar resource used exclusively by the scheduling engine for reading and writing class events. Identified by a Calendar ID string (format: `<long-hex>@group.calendar.google.com`).
- **Calendar API Credentials**: The combination of the Service Account email, its JSON key, and the Calendar ID that together enable programmatic access to the system calendar.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can follow the documented provisioning steps and have a fully functional GCP Calendar infrastructure in under 30 minutes
- **SC-002**: The scheduling engine can authenticate against Google Calendar API using the Service Account credentials without any manual intervention (no OAuth consent screen, no user interaction)
- **SC-003**: The Service Account can create, read, update, and delete events on the system calendar via API calls
- **SC-004**: The Service Account cannot access any calendar other than the system calendar it has been explicitly shared with
- **SC-005**: The JSON key file is never present in the git repository (verified by `git status` and absence from any commit history)
- **SC-006**: All provisioning steps are reproducible by running a single documented sequence of `gcloud` commands or a setup script

## Configuration Steps (Manual — Developer Responsibilities)

The following steps must be performed by a developer with GCP access. These cannot be automated within the application codebase and are prerequisites for the scheduling engine to function.

### Step 1: Create the GCP Project
1. Open the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project with an ID like `coacher-scheduling-engine`
3. Link the project to a billing account (Calendar API requires billing)
4. Set the project as active: `gcloud config set project coacher-scheduling-engine`

### Step 2: Enable the Calendar API
```bash
gcloud services enable calendar-json.googleapis.com --project=coacher-scheduling-engine
```
Verify: `gcloud services list --project=coacher-scheduling-engine --enabled | grep calendar`

### Step 3: Create the Service Account and Key
```bash
# Create the Service Account
gcloud iam service-accounts create scheduling-engine-calendar-sa \
  --display-name="Scheduling Engine Calendar Service Account" \
  --project=coacher-scheduling-engine

# Generate JSON key
gcloud iam service-accounts keys create ./coacher-calendar-sa-key.json \
  --iam-account=scheduling-engine-calendar-sa@coacher-scheduling-engine.iam.gserviceaccount.com \
  --project=coacher-scheduling-engine
```

**Record this Service Account email:**
`scheduling-engine-calendar-sa@coacher-scheduling-engine.iam.gserviceaccount.com`

### Step 4: Secure the Key File
1. Move the key file to a secure, version-controlled-excluded path
2. Add the path to `.gitignore` (e.g., `secrets/coacher-calendar-sa-key.json`)
3. Set environment variables:
   ```
   GOOGLE_CALENDAR_SA_EMAIL=scheduling-engine-calendar-sa@coacher-scheduling-engine.iam.gserviceaccount.com
   GOOGLE_CALENDAR_SA_KEY_PATH=/path/to/coacher-calendar-sa-key.json
   GOOGLE_CALENDAR_ID_DEV=<dev-calendar-id>
   GOOGLE_CALENDAR_ID_STAGING=<staging-calendar-id>
   GOOGLE_CALENDAR_ID_PROD=<production-calendar-id>
   ```
4. For local dev, add these to your `.env` file (already in `.gitignore`)

### Step 5: Create the System Calendars (one per environment)
1. Open Google Calendar (the personal calendar of the GCP project owner)
2. Click the "+" next to "Other calendars" → "Create new calendar"
3. Create a calendar for each environment:
   - Name: "Coacher Scheduling Engine [dev]" — description: "Dev environment system calendar"
   - Name: "Coacher Scheduling Engine [staging]" — description: "Staging environment system calendar"
   - Name: "Coacher Scheduling Engine [prod]" — description: "Production environment system calendar"
4. Set the timezone to the gym's local timezone for each
5. Click "Create calendar" for each

### Step 6: Share Each Calendar with the Service Account
Repeat for each calendar (dev, staging, prod):
1. In Google Calendar, find the calendar under "My calendars"
2. Click the three dots → "Settings and sharing"
3. Under "Share with specific people", click "Add people"
4. Enter the Service Account email: `scheduling-engine-calendar-sa@coacher-scheduling-engine.iam.gserviceaccount.com`
5. Set permissions to "Make changes to events"
6. Click "Send" (the Service Account does not receive the email, but the permission is applied)

### Step 7: Record the Calendar IDs
1. For each calendar (dev, staging, prod), go to "Settings and sharing" → "Integrate calendar"
2. Copy the "Calendar ID" (looks like `<long-hex>@group.calendar.google.com`)
3. Add each value to your environment:
   - `GOOGLE_CALENDAR_ID_DEV=<dev-calendar-id>`
   - `GOOGLE_CALENDAR_ID_STAGING=<staging-calendar-id>`
   - `GOOGLE_CALENDAR_ID_PROD=<production-calendar-id>`

### Verification Checklist
- [ ] `gcloud services list` confirms `calendar-json.googleapis.com` is enabled
- [ ] Service Account email exists: `gcloud iam service-accounts list --project=coacher-scheduling-engine`
- [ ] JSON key file loads correctly: `gcloud auth activate-service-account --key-file=/path/to/coacher-calendar-sa-key.json`
- [ ] Service Account can list calendars via API (test with a quick script)
- [ ] Calendar IDs for all environments (dev, staging, prod) are set in environment variables
- [ ] No key file exists in git history (`git log --all -- '**/coacher-calendar-sa-key*'` returns empty)

## Assumptions

- The developer has a Google Cloud account with billing enabled.
- The developer has `gcloud` CLI installed and authenticated (`gcloud auth login`).
- The Calendar API free quota (1,000,000 queries/day) is sufficient for the scheduling engine's expected usage. If usage exceeds this, quota increase requests must be submitted to Google.
- The system calendar is created under the project owner's Google Workspace / personal Google account, not as a GCP resource. Calendar sharing is managed via the Google Calendar web UI because the Calendar API does not support programmatic sharing with Service Accounts in a straightforward way.
- A single Service Account is shared across all environments. Calendar access is isolated per environment by provisioning separate system calendars (dev, staging, production) and granting the shared SA writer access to each. This avoids the operational overhead of managing multiple SA keys while maintaining data isolation.
- If the Service Account key is compromised, it can be rotated (deleted and re-created) without recreating the Service Account itself.
