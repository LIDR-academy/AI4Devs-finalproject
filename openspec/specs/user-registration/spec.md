# user-registration Specification

## Purpose
TBD - created by archiving change add-user-registration-frontend. Update Purpose after archive.
## Requirements
### Requirement: User Registration Form
The frontend SHALL provide a registration form that allows new users to create an account by entering their name, email, and password.

#### Scenario: Successful registration
- **WHEN** a user fills the registration form with valid data (name, valid email, password > 6 characters)
- **AND** the email is not already registered
- **THEN** the form submits to `POST /auth/register`
- **AND** upon successful response (201), the user is redirected to `/login`
- **AND** a success message or confirmation is displayed

#### Scenario: Email validation error
- **WHEN** a user enters an invalid email format
- **THEN** the form shows a validation error message
- **AND** the submit button is disabled or the form cannot be submitted

#### Scenario: Password length validation
- **WHEN** a user enters a password with 6 or fewer characters
- **THEN** the form shows a validation error message indicating password must be greater than 6 characters
- **AND** the submit button is disabled or the form cannot be submitted

#### Scenario: Duplicate email error
- **WHEN** a user submits the form with an email that already exists
- **AND** the backend returns a 409 Conflict response
- **THEN** the form displays an error message indicating the email is already registered
- **AND** the user can correct the email and resubmit

#### Scenario: Network or server error
- **WHEN** a network error occurs or the backend returns a 500 error
- **THEN** the form displays a generic error message
- **AND** the user can retry the submission

#### Scenario: Required field validation
- **WHEN** a user attempts to submit the form with empty required fields (name, email, or password)
- **THEN** the form shows validation errors for each empty required field
- **AND** the form cannot be submitted

### Requirement: Registration Form UI Design
The registration form SHALL follow the Design System Guide specifications for mobile-first design, colors, typography, and component styling.

#### Scenario: Mobile-optimized form
- **WHEN** the registration page is displayed
- **THEN** the form uses mobile-first layout (optimized for 360px-430px width)
- **AND** input fields have minimum height of 48px (touch target)
- **AND** input fields use font size of 16px (to prevent iOS auto-zoom)

#### Scenario: Design System color compliance
- **WHEN** the registration form is displayed
- **THEN** primary buttons use violet-600 color
- **AND** error states use red-500 color
- **AND** background uses slate-50 color
- **AND** focus states use violet-600 ring

#### Scenario: Typography compliance
- **WHEN** the registration form is displayed
- **THEN** headings use Plus Jakarta Sans font (600/700 weight)
- **AND** body text and inputs use Inter font (400/500 weight)

### Requirement: Registration API Integration
The frontend SHALL integrate with the backend registration endpoint and handle all response scenarios appropriately.

#### Scenario: API call structure
- **WHEN** the registration form is submitted with valid data
- **THEN** a POST request is sent to `/auth/register` endpoint
- **AND** the request body contains `{ nombre: string, email: string, contraseña: string }`
- **AND** the request includes appropriate Content-Type headers

#### Scenario: Success response handling
- **WHEN** the backend returns a 201 Created response with user data
- **THEN** the frontend stores the response (if needed for future use)
- **AND** the user is redirected to `/login` page
- **AND** no authentication token is stored (user must login separately)

#### Scenario: Error response handling
- **WHEN** the backend returns a 400 Bad Request (validation error)
- **THEN** the frontend displays appropriate validation error messages
- **WHEN** the backend returns a 409 Conflict (duplicate email)
- **THEN** the frontend displays a specific error message about email already being registered
- **WHEN** the backend returns a 500 Internal Server Error
- **THEN** the frontend displays a generic error message

### Requirement: Registration Form Navigation
The registration page SHALL be accessible via routing and provide navigation to related pages.

#### Scenario: Registration route access
- **WHEN** a user navigates to `/register`
- **THEN** the registration page is displayed
- **AND** the form is ready for user input

#### Scenario: Post-registration navigation
- **WHEN** registration is successful
- **THEN** the user is automatically redirected to `/login`
- **AND** the user can then login with their newly created credentials

