# Data Model Documentation

This document describes the data model for the INK·LINK application, including entity descriptions, field definitions, relationships, and an entity-relationship diagram.

## Model Descriptions

### 1. User
Represents any user of the platform (client, artist, or admin).

**Fields:**
- `id`: Unique identifier for the user (Primary Key, UUID)
- `email`: User's unique email address (max 255 characters)
- `password_hash`: Bcrypt hash of the user's password (max 255 characters)
- `role`: User's role in the system ('client', 'artist', 'admin')
- `first_name`: User's first name (max 100 characters)
- `last_name`: User's last name (max 100 characters)
- `phone`: User's phone number (optional, max 20 characters)
- `avatar_url`: URL to the user's profile picture (optional, max 500 characters)
- `is_verified`: Whether the user's email has been verified
- `created_at`: Timestamp when the account was created
- `updated_at`: Timestamp of last profile update

**Validation Rules:**
- Email is required, must be unique, and follow valid email format
- First name and last name are required, 2-100 characters
- Phone is optional but must follow Chilean format (+56 9 XXXX XXXX) if provided
- Role is required and must be one of: 'client', 'artist', 'admin'
- Password must be at least 8 characters with uppercase, lowercase, and number

**Relationships:**
- `artistProfile`: One-to-one relationship with ArtistProfile (if role is 'artist')
- `bookings`: One-to-many relationship with Booking (as client)

### 2. ArtistProfile
Represents the professional profile of a tattoo artist or studio.

**Fields:**
- `id`: Unique identifier for the artist profile (Primary Key, UUID)
- `user_id`: Foreign key referencing the User
- `slug`: URL-friendly identifier for public profile (max 100 characters, unique)
- `bio`: Professional description and background (TEXT)
- `years_experience`: Years of tattooing experience
- `artist_type`: Type of artist ('independent', 'studio')
- `latitude`: Geographic latitude coordinate (DECIMAL 10,8)
- `longitude`: Geographic longitude coordinate (DECIMAL 11,8)
- `address`: Physical address of the studio/workspace (max 300 characters)
- `commune`: Chilean commune/district (max 100 characters)
- `min_session_price`: Minimum price per session in CLP
- `hourly_rate`: Price per hour in CLP
- `deposit_percentage`: Percentage required as deposit (default 30, range 20-50)
- `cancellation_policy`: Cancellation window ('24h', '48h', '72h')
- `is_published`: Whether the profile is publicly visible
- `rating_avg`: Calculated average rating across all reviews (DECIMAL 3,2)
- `total_reviews`: Total number of reviews received

**Validation Rules:**
- User reference must exist and have role 'artist'
- Slug is required, unique, lowercase alphanumeric with hyphens only
- Bio is optional but cannot exceed 2000 characters
- Latitude must be between -90 and 90; longitude between -180 and 180
- Min session price and hourly rate must be positive integers (CLP, no decimals)
- Deposit percentage must be between 20 and 50
- Profile cannot be published without: bio, at least 1 portfolio item, min_session_price, hourly_rate, and at least 1 availability slot

**Relationships:**
- `user`: Many-to-one relationship with User model
- `portfolioItems`: One-to-many relationship with PortfolioItem
- `styles`: Many-to-many relationship with TattooStyle (through ArtistStyle)
- `availabilities`: One-to-many relationship with Availability
- `blockedDates`: One-to-many relationship with BlockedDate
- `bookings`: One-to-many relationship with Booking
- `certifications`: One-to-many relationship with Certification
- `awards`: One-to-many relationship with Award
- `sponsorships`: One-to-many relationship with Sponsorship

### 3. PortfolioItem
Represents a photo or piece of work in an artist's portfolio.

**Fields:**
- `id`: Unique identifier for the portfolio item (Primary Key, UUID)
- `artist_profile_id`: Foreign key referencing the ArtistProfile
- `image_url`: URL to the full-resolution image (max 500 characters)
- `thumbnail_url`: URL to the thumbnail version (max 500 characters)
- `style_id`: Foreign key referencing the TattooStyle
- `description`: Optional description of the piece (max 500 characters)
- `is_featured`: Whether this is a featured/highlighted piece
- `sort_order`: Display order in the portfolio
- `created_at`: Timestamp when the item was uploaded

**Validation Rules:**
- Artist profile reference must exist
- Image URL is required and must be a valid URL
- Maximum of 100 portfolio items per artist
- Only 1 item can be marked as featured at a time
- Supported image formats: JPEG, PNG, WebP (max 10MB)

**Relationships:**
- `artistProfile`: Many-to-one relationship with ArtistProfile
- `style`: Many-to-one relationship with TattooStyle

### 4. TattooStyle
Represents a tattoo style category used for filtering and classification.

**Fields:**
- `id`: Unique identifier for the style (Primary Key, UUID)
- `name`: Display name of the style (max 50 characters)
- `slug`: URL-friendly identifier for filtering (max 50 characters, unique)
- `icon_url`: URL to the style's representative icon (max 500 characters)

**Validation Rules:**
- Name and slug are required and unique
- Predefined catalog: realismo, tradicional, blackwork, fine-line, japones, lettering, neotradicional, acuarela, geometrico, minimalista, dotwork, tribal

**Relationships:**
- `artists`: Many-to-many relationship with ArtistProfile (through ArtistStyle)
- `portfolioItems`: One-to-many relationship with PortfolioItem

### 5. ArtistStyle
Pivot table representing the many-to-many relationship between artists and styles.

**Fields:**
- `artist_profile_id`: Foreign key referencing ArtistProfile (composite PK)
- `style_id`: Foreign key referencing TattooStyle (composite PK)

**Validation Rules:**
- Both references must exist
- Combination must be unique (no duplicate style assignments)

**Relationships:**
- `artistProfile`: Many-to-one relationship with ArtistProfile
- `style`: Many-to-one relationship with TattooStyle

### 6. Availability
Represents recurring weekly availability slots for an artist.

**Fields:**
- `id`: Unique identifier for the availability record (Primary Key, UUID)
- `artist_profile_id`: Foreign key referencing the ArtistProfile
- `day_of_week`: Day of the week (0=Monday, 6=Sunday)
- `start_time`: Start time of availability window (TIME)
- `end_time`: End time of availability window (TIME)
- `slot_duration_minutes`: Duration of each bookable slot in minutes
- `is_active`: Whether this availability is currently active

**Validation Rules:**
- Day of week must be 0-6
- Start time must be before end time
- Slot duration must be between 30 and 480 minutes (30min to 8h)
- No overlapping availability windows for the same artist on the same day
- At least one active availability required for profile publication

**Relationships:**
- `artistProfile`: Many-to-one relationship with ArtistProfile

### 7. BlockedDate
Represents specific dates when an artist is unavailable (vacations, conventions, etc.).

**Fields:**
- `id`: Unique identifier for the blocked date (Primary Key, UUID)
- `artist_profile_id`: Foreign key referencing the ArtistProfile
- `blocked_date`: The specific date that is blocked (DATE)
- `reason`: Optional reason for blocking (max 200 characters)

**Validation Rules:**
- Blocked date must be today or in the future
- Cannot block a date that already has confirmed bookings (must cancel first)
- No duplicate blocked dates for the same artist

**Relationships:**
- `artistProfile`: Many-to-one relationship with ArtistProfile

### 8. Booking
Represents a confirmed tattoo appointment between a client and an artist.

**Fields:**
- `id`: Unique identifier for the booking (Primary Key, UUID)
- `client_id`: Foreign key referencing User (client)
- `artist_profile_id`: Foreign key referencing ArtistProfile
- `booking_date`: Date of the appointment (DATE)
- `start_time`: Start time of the appointment (TIME)
- `end_time`: End time of the appointment (TIME)
- `status`: Current booking status ('confirmed', 'completed', 'cancelled_client', 'cancelled_artist', 'no_show')
- `estimated_price_min`: Minimum estimated price in CLP
- `estimated_price_max`: Maximum estimated price in CLP
- `deposit_amount`: Amount paid as deposit in CLP
- `body_zone`: Body area for the tattoo (max 100 characters)
- `size_reference`: Size reference selected by client (max 50 characters)
- `style_id`: Foreign key referencing TattooStyle
- `is_color`: Whether the tattoo is in color (false = black & white)
- `is_coverup`: Whether this is a cover-up tattoo
- `reference_images`: JSON array of reference image URLs (optional)
- `notes`: Additional notes from the client (TEXT, optional)
- `created_at`: Timestamp when the booking was created
- `cancelled_at`: Timestamp when cancellation was requested (nullable)

**Validation Rules:**
- Client must exist and have role 'client'
- Artist profile must exist and be published
- Booking date must be in the future
- Time slot must match artist's availability and not be blocked
- No overlapping bookings for the same artist at the same time
- Estimated prices must be positive integers with min <= max
- Deposit amount = (estimated_price_min * artist.deposit_percentage / 100)
- Status transitions: confirmed → completed | cancelled_client | cancelled_artist | no_show
- Reference images: maximum 3 URLs in JSON array

**Relationships:**
- `client`: Many-to-one relationship with User
- `artistProfile`: Many-to-one relationship with ArtistProfile
- `style`: Many-to-one relationship with TattooStyle
- `payment`: One-to-one relationship with Payment
- `review`: One-to-one relationship with Review

### 9. Payment
Represents a financial transaction for a booking deposit.

**Fields:**
- `id`: Unique identifier for the payment (Primary Key, UUID)
- `booking_id`: Foreign key referencing Booking (unique)
- `flow_transaction_id`: Transaction identifier from Flow payment gateway (max 100 characters)
- `amount`: Total amount charged in CLP
- `platform_fee`: Platform commission amount in CLP
- `artist_amount`: Amount to be transferred to the artist in CLP
- `status`: Payment status ('pending', 'completed', 'refunded')
- `paid_at`: Timestamp when payment was confirmed

**Validation Rules:**
- Booking reference must exist and be unique (one payment per booking)
- Amount must be positive and match booking.deposit_amount
- Platform fee = amount * commission_rate (5-10%)
- Artist amount = amount - platform_fee
- Flow transaction ID is set after successful gateway response
- Status transitions: pending → completed → refunded

**Relationships:**
- `booking`: One-to-one relationship with Booking

### 10. Review
Represents a client's review of a completed tattoo session.

**Fields:**
- `id`: Unique identifier for the review (Primary Key, UUID)
- `booking_id`: Foreign key referencing Booking (unique)
- `client_id`: Foreign key referencing User (client)
- `artist_profile_id`: Foreign key referencing ArtistProfile
- `rating_hygiene`: Rating for workspace hygiene (1-5 stars)
- `rating_pain_management`: Rating for pain management and communication (1-5 stars)
- `rating_customer_service`: Rating for customer service and professionalism (1-5 stars)
- `rating_result`: Rating for tattoo quality/result (1-5 stars)
- `comment`: Optional text review (TEXT)
- `tattoo_photo_url`: URL to photo of the fresh tattoo (max 500 characters)
- `created_at`: Timestamp when the review was submitted

**Validation Rules:**
- Booking must exist and have status 'completed'
- One review per booking (booking_id is unique)
- Client must match the booking's client
- All 4 rating dimensions are required, each must be 1-5
- Comment is optional but cannot exceed 2000 characters
- Anti-fraud: rate limiting of 1 review per booking, no edits after 48h

**Relationships:**
- `booking`: One-to-one relationship with Booking
- `client`: Many-to-one relationship with User
- `artistProfile`: Many-to-one relationship with ArtistProfile

### 11. Certification (Seed Data)
Represents verified sanitary and professional certifications for artists.

**Fields:**
- `id`: Unique identifier for the certification (Primary Key, UUID)
- `artist_profile_id`: Foreign key referencing ArtistProfile
- `type`: Type of certification ('sanitary', 'biosecurity', 'municipal')
- `name`: Name of the certificate (max 200 characters)
- `issuer`: Issuing organization (max 200 characters)
- `valid_until`: Expiration date of the certification (DATE)
- `is_active`: Whether the certification is currently valid

**Validation Rules:**
- Artist profile reference must exist
- Type must be one of the defined values
- Name and issuer are required
- is_active is automatically set based on valid_until vs current date
- In MVP: data is pre-loaded via seed — no upload flow exists

**Relationships:**
- `artistProfile`: Many-to-one relationship with ArtistProfile

### 12. Award (Seed Data)
Represents verified prizes and recognitions earned by artists.

**Fields:**
- `id`: Unique identifier for the award (Primary Key, UUID)
- `artist_profile_id`: Foreign key referencing ArtistProfile
- `title`: Title of the award (max 200 characters)
- `event_name`: Name of the event/convention (max 200 characters)
- `year`: Year the award was received
- `category`: Award category (max 100 characters)
- `badge_icon_url`: URL to the badge icon displayed on the profile (max 500 characters)

**Validation Rules:**
- Artist profile reference must exist
- Title and event_name are required
- Year must be between 2000 and current year
- Category is optional but cannot exceed 100 characters
- In MVP: data is pre-loaded via seed — no upload flow exists

**Relationships:**
- `artistProfile`: Many-to-one relationship with ArtistProfile

### 13. Sponsorship (Seed Data)
Represents brand sponsorships/endorsements for artists.

**Fields:**
- `id`: Unique identifier for the sponsorship (Primary Key, UUID)
- `artist_profile_id`: Foreign key referencing ArtistProfile
- `brand_name`: Name of the sponsoring brand (max 200 characters)
- `brand_logo_url`: URL to the brand's logo (max 500 characters)
- `relationship_type`: Type of sponsorship relationship (ENUM: 'ambassador', 'sponsored', 'certified')
- `is_active`: Whether the sponsorship is currently active

**Validation Rules:**
- Artist profile reference must exist
- Brand name is required
- Brand logo URL must be a valid URL if provided
- In MVP: data is pre-loaded via seed — no management panel exists

**Relationships:**
- `artistProfile`: Many-to-one relationship with ArtistProfile

## Entity Relationship Diagram

```mermaid
erDiagram
    User {
        UUID id PK
        VARCHAR email UK
        VARCHAR password_hash
        ENUM role
        VARCHAR first_name
        VARCHAR last_name
        VARCHAR phone
        VARCHAR avatar_url
        BOOLEAN is_verified
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    ArtistProfile {
        UUID id PK
        UUID user_id FK UK
        VARCHAR slug UK
        TEXT bio
        INT years_experience
        ENUM artist_type
        DECIMAL latitude
        DECIMAL longitude
        VARCHAR address
        VARCHAR commune
        INT min_session_price
        INT hourly_rate
        INT deposit_percentage
        ENUM cancellation_policy
        BOOLEAN is_published
        DECIMAL rating_avg
        INT total_reviews
    }
    PortfolioItem {
        UUID id PK
        UUID artist_profile_id FK
        VARCHAR image_url
        VARCHAR thumbnail_url
        UUID style_id FK
        VARCHAR description
        BOOLEAN is_featured
        INT sort_order
        TIMESTAMP created_at
    }
    TattooStyle {
        UUID id PK
        VARCHAR name UK
        VARCHAR slug UK
        VARCHAR icon_url
    }
    ArtistStyle {
        UUID artist_profile_id FK
        UUID style_id FK
    }
    Availability {
        UUID id PK
        UUID artist_profile_id FK
        INT day_of_week
        TIME start_time
        TIME end_time
        INT slot_duration_minutes
        BOOLEAN is_active
    }
    BlockedDate {
        UUID id PK
        UUID artist_profile_id FK
        DATE blocked_date
        VARCHAR reason
    }
    Booking {
        UUID id PK
        UUID client_id FK
        UUID artist_profile_id FK
        DATE booking_date
        TIME start_time
        TIME end_time
        ENUM status
        INT estimated_price_min
        INT estimated_price_max
        INT deposit_amount
        VARCHAR body_zone
        VARCHAR size_reference
        UUID style_id FK
        BOOLEAN is_color
        BOOLEAN is_coverup
        JSON reference_images
        TEXT notes
        TIMESTAMP created_at
        TIMESTAMP cancelled_at
    }
    Payment {
        UUID id PK
        UUID booking_id FK UK
        VARCHAR flow_transaction_id
        INT amount
        INT platform_fee
        INT artist_amount
        ENUM status
        TIMESTAMP paid_at
    }
    Review {
        UUID id PK
        UUID booking_id FK UK
        UUID client_id FK
        UUID artist_profile_id FK
        INT rating_hygiene
        INT rating_pain_management
        INT rating_customer_service
        INT rating_result
        TEXT comment
        VARCHAR tattoo_photo_url
        TIMESTAMP created_at
    }
    Certification {
        UUID id PK
        UUID artist_profile_id FK
        ENUM type
        VARCHAR name
        VARCHAR issuer
        DATE valid_until
        BOOLEAN is_active
    }
    Award {
        UUID id PK
        UUID artist_profile_id FK
        VARCHAR title
        VARCHAR event_name
        INT year
        VARCHAR category
        VARCHAR badge_icon_url
    }
    Sponsorship {
        UUID id PK
        UUID artist_profile_id FK
        VARCHAR brand_name
        VARCHAR brand_logo_url
        ENUM relationship_type
        BOOLEAN is_active
    }

    User ||--o| ArtistProfile : "has profile"
    User ||--o{ Booking : "books as client"
    ArtistProfile ||--o{ PortfolioItem : "has portfolio"
    ArtistProfile ||--o{ Availability : "has schedule"
    ArtistProfile ||--o{ BlockedDate : "blocks dates"
    ArtistProfile ||--o{ Booking : "receives bookings"
    ArtistProfile }o--o{ TattooStyle : "specializes in"
    ArtistProfile ||--o{ Certification : "has certifications"
    ArtistProfile ||--o{ Award : "has awards"
    ArtistProfile ||--o{ Sponsorship : "has sponsors"
    Booking ||--o| Payment : "has payment"
    Booking ||--o| Review : "has review"
    PortfolioItem }o--|| TattooStyle : "tagged with"
    Booking }o--|| TattooStyle : "requests style"
```

## Key Design Principles

1. **Referential Integrity**: All foreign key relationships ensure data consistency. Cascade deletes are limited to owned entities (portfolio items, availability) — bookings and reviews are preserved for audit.

2. **Seed Data Pattern**: Certifications, Awards, and Sponsorships are pre-loaded data in the MVP. No user-facing upload or management interface exists for these entities. They are displayed and filterable but not editable.

3. **Autonomy of Flow**: The data model supports the core principle that artists configure once (profile, tariffs, schedule) and clients flow through the entire cycle (discover → quote → book → review) without artist intervention in real-time.

4. **Geospatial Support**: Latitude/longitude fields on ArtistProfile support PostGIS queries for proximity search, radius filtering, and map marker display.

5. **Financial Auditability**: Payment records maintain the split between platform fee and artist amount. All status transitions are tracked. Flow transaction IDs enable reconciliation with the payment gateway.

6. **Anti-Fraud Reviews**: One review per booking constraint, client verification against booking owner, and the 90-day healing photo window prevent fraudulent or premature reviews.

7. **Flexible Scheduling**: The combination of recurring Availability (weekly patterns) and BlockedDate (specific exceptions) allows artists to manage their calendar without complex recurrence rules.

## Notes

- All `id` fields are UUIDs generated server-side
- Monetary values are stored as integers in CLP (Chilean Pesos) — no decimal currency
- ENUM fields are stored as VARCHAR with application-level validation in .NET
- JSON fields (reference_images) use PostgreSQL's native JSONB type
- Timestamps use UTC with timezone-aware columns (TIMESTAMPTZ)
- Indexes recommended on: `ArtistProfile.commune`, `ArtistProfile.is_published`, `ArtistProfile.rating_avg`, `Booking.booking_date`, `Booking.status`, `Certification.is_active`
- PostGIS spatial index on `ArtistProfile(latitude, longitude)` for geo queries
