## ADDED Requirements

### Requirement: Home annual goal card

The application SHALL provide a Home page at `/` displaying an annual goal card for the current UTC calendar year.

#### Scenario: Configure goal from Home (US-03 scenario 1)

- **WHEN** the user is on Home and submits a target of 50 books
- **THEN** the client calls `PUT /v1/goals/{currentYear}` and the card shows the saved target

#### Scenario: Display progress (US-03 scenario 2)

- **WHEN** the user has goal 50 and 20 books read in the year
- **THEN** the card displays «20 / 50», the percentage (40%), and a progress bar at 40%

#### Scenario: Display forecast (US-03 scenario 3)

- **WHEN** the API returns a non-null `forecast`
- **THEN** the card shows a readable message indicating whether the user is ahead, on track, or behind based on `forecast.status`

#### Scenario: No goal empty state

- **WHEN** `goal` is null
- **THEN** the card prompts the user to set an annual target with an inline input

#### Scenario: Insufficient forecast data

- **WHEN** `forecast` is null
- **THEN** the card shows neutral copy inviting the user to mark books as read to see a prediction

### Requirement: Home as authenticated landing route

The application SHALL route authenticated users to `/` as the default landing page while keeping Book Tracker at `/book-tracker`.

#### Scenario: Default redirect after login

- **WHEN** an authenticated user navigates to `/` or an unknown protected path
- **THEN** Home is shown at `/` (not redirected away to Book Tracker)

### Requirement: Goal card edit anytime

The user SHALL be able to change the annual target from the Home card at any point in the year.

#### Scenario: Mid-year edit

- **WHEN** the user edits the target from 50 to 30 in June
- **THEN** the card updates immediately after a successful PUT
