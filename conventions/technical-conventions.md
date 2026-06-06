# Technical Conventions for Aura Planning

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | .NET 8+ (ASP.NET Core Web API) |
| Frontend | Angular 17+ (Standalone components) |
| Database | SQLite with Entity Framework Core |
| Authentication | Magic links with JWT tokens |
| Email | AWS SES |
| WhatsApp | Meta WhatsApp Business API |
| Payments | Stripe Connect |
| Maps | Google Maps API |
| Hosting | JAMstack (static sites for guests via CDN) |

## Architecture

### High-Level Architecture
```
graph TB
    subgraph Client
        A[Host Dashboard - Angular SPA]
        B[Guest Microsite - Static HTML/JS]
        C[Accomplice Panel - Angular SPA]
    end

    subgraph CDN
        D[CloudFront / Azure CDN]
    end

    subgraph Backend
        E[.NET 8 API - ASP.NET Core]
        F[Static Site Generator Service]
        G[Email Service - AWS SES]
        H[WhatsApp Service - Meta API]
        I[Payment Service - Stripe]
    end

    subgraph Data
        J[(SQLite)]
        K[(BackgroundService - Queues)]
    end

    A --> E
    C --> E
    D --> B
    E --> F
    E --> G
    E --> H
    E --> I
    E --> J
    E --> K
    F --> D
```

### Guest Microsite Flow
```
sequenceDiagram
    participant Guest
    participant CDN
    participant API
    participant DB

    Guest->>CDN: GET /e/{event-slug}
    CDN->>CDN: Serve static HTML/JS/CSS
    CDN-->>Guest: 200 OK (static)
    Guest->>API: POST /api/rsvp/{token}
    API->>DB: Insert RSVP
    API-->>Guest: 200 OK
```

## Data Model

### Entities

| Entity | Description |
|--------|-------------|
| **Users** | Host accounts (Id, Email, Name, CreatedAt, LastLogin, Status) |
| **Events** | Wedding/event details (Id, UserId, Name, Slug, Date, Venue, Status, Template, Colors, Font) |
| **Templates** | Pre-designed invitation templates (Id, Name, Description, PreviewUrl, IsPremium) |
| **Guests** | Event attendees (Id, EventId, Name, Email, Phone, Category, InviteStatus, IsDeleted) |
| **Invitations** | Per-guest invitation records (Id, GuestId, EventId, Token, SentAt, SentVia, DeliveryStatus) |
| **RSVPs** | Guest responses (Id, InvitationId, GuestId, EventId, Attendance, DietaryRestrictions, NeedsTransport, PlusOne, Message) |
| **Accomplices** | Trusted persons with magic link access (Id, EventId, Email, Token, Permissions) |
| **MessageTemplates** | Pre-configured live message templates (Id, EventId, Label, DefaultMessage, Icon, RequiresSwipe) |
| **LiveMessages** | Sent live notifications (Id, EventId, AccompliceId, MessageTemplateId, CustomMessage, SentAt, SentVia, DeliveryStatus) |
| **Payments** | Stripe payment records (Id, EventId, StripePaymentIntentId, Amount, Currency, Status) |
| **DataRetentionJobs** | Scheduled data deletion (Id, EventId, ScheduledDeleteAt, Status, ExecutedAt) |

### Key Relationships
- Users 1:N Events
- Events 1:N Guests
- Events 1:N Invitations
- Guests 1:N Invitations
- Invitations 1:1 RSVPs
- Events 1:N Accomplices
- Events 1:N LiveMessages
- Events 1:N MessageTemplates
- Events 1:1 Payments

### Constraints
- Event.Slug is unique
- Invitations.Token is unique
- Accomplices.Token is unique
- RSVP.InvitationId is unique (one RSVP per invitation)
- Payment.EventId is unique (one payment per event)
- Soft delete pattern for Guests and Invitations (IsDeleted flag)
- Hard delete for all data 30 days after EventEndDate via BackgroundService

## API Endpoints (Core 10)

### Authentication
1. **POST /api/auth/magic-link** - Request magic link login
2. **GET /api/auth/verify** - Verify token and return session JWT

### Events
3. **POST /api/events** - Create new event (auto-generates slug)
4. **GET /api/events/{slug}** - Get event details with stats
5. **POST /api/events/{slug}/guests/import** - Import guests from CSV
6. **POST /api/events/{slug}/publish** - Publish event (Stripe payment)

### Public (Guest)
7. **GET /api/rsvp/{token}** - Get event/guest info for RSVP
8. **POST /api/rsvp/{token}** - Submit RSVP response

### Accomplice
9. **POST /api/accomplices/{eventSlug}/grant** - Grant accomplice access
10. **POST /api/live/{accompliceToken}/send** - Send live notification

## Integration Points

### WhatsApp Business API
- Provider: Meta Cloud API or BSP (Twilio, MessageBird)
- Template messages: invitation, reminder, live update, thank you
- Rate limits: 1000 messages/hour per phone number
- Fallback: Email if WhatsApp delivery fails after 2 retries

### AWS SES
- Used for: magic links, email invitations, reminders, thank you cards
- Template-based emails with personalization tokens
- Bounce/complaint handling via SNS webhooks
- Daily quota: 50,000 emails (sandbox: 200/day)

### Stripe Connect
- Payment flow: One-time payment for event publishing
- Future: Gift registry with platform fee (1.5-2%)
- Webhook handling: payment_intent.succeeded, payment_intent.failed
- No stored card data (PCI compliance via Stripe Elements)

### Google Maps
- Embedded maps on guest microsites
- Geocoding API for venue address -> coordinates
- Directions links (Google Maps / Waze deep links)
- Free tier: 28,000 loads/month

## Security

### Authentication
- Magic links with JWT tokens (15-min expiry for login, 24-hour for sessions)
- No passwords stored
- Rate limiting: 3 magic link requests per email per hour
- CSRF protection for all state-changing endpoints

### Authorization
- Event ownership verification on all event-related endpoints
- Accomplice tokens scoped to specific event and permissions
- Invitation tokens scoped to specific guest and event
- Policy-based authorization in .NET

### Data Protection
- PII encrypted at rest (SQLite with SQLCipher or application-level)
- TLS 1.3 for all data in transit
- 30-day automated data deletion after EventEndDate
- GDPR compliance: right to access, rectify, delete
- No third-party cookies on guest microsites

### Infrastructure Security
- CORS whitelist for allowed origins
- Input validation (FluentValidation or DataAnnotations)
- SQL injection prevention via EF Core parameterized queries
- Rate limiting: 100 requests/minute per IP (AspNetCoreRateLimit)

## Project Structure

### Backend (.NET 8)
```
backend/
├── src/
│   ├── Aura.Api/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   ├── Filters/
│   │   ├── wwwroot/static-sites/
│   │   └── Program.cs
│   ├── Aura.Core/
│   │   ├── Services/
│   │   ├── Models/
│   │   ├── DTOs/
│   │   └── Interfaces/
│   └── Aura.Infrastructure/
│       ├── Data/Configurations/
│       ├── Migrations/
│       ├── Repositories/
│       ├── Services/
│       └── BackgroundServices/
├── tests/
└── AuraPlanning.sln
```

### Frontend (Angular 17+)
```
frontend/
├── src/
│   ├── app/
│   │   ├── core/ (guards, interceptors, services)
│   │   ├── features/ (auth, dashboard, events, accomplice, rsvp)
│   │   ├── shared/
│   │   └── app.routes.ts
│   ├── assets/
│   └── environments/
├── angular.json
└── package.json
```

## Configuration

### appsettings.json Keys
- ConnectionStrings:DefaultConnection
- Jwt:Key, Issuer, Audience, ExpiryMinutes
- MagicLink:ExpiryMinutes, BaseUrl
- WhatsApp:ApiKey, PhoneNumberId, BaseUrl
- Aws:AccessKey, SecretKey, Region, SesSourceEmail
- Stripe:SecretKey, PublishableKey, WebhookSecret, PublishingPrice
- GoogleMaps:ApiKey

## Code Style

### Backend (C#)
- File-scoped namespaces (.NET 8 style)
- Primary constructors where appropriate
- SOLID principles
- Async/await all the way
- Records for DTOs
- Nullable reference types

### Frontend (TypeScript/Angular)
- Strict mode
- Standalone components
- Angular signals for reactive state
- Typed forms
- inject() function for DI
- Follow Angular style guide