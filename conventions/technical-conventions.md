# Technical Conventions for Aura Planning

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | .NET 10 (ASP.NET Core Web API) |
| Frontend | Angular 22 (Standalone components) |
| Database | PostgreSQL 16 with Entity Framework Core |
| Authentication | Magic links with JWT tokens |
| Email | Gmail SMTP (IEmailService abstraction — swappable to Mailgun/Brevo) |
| WhatsApp | Meta WhatsApp Business API |
| Payments | Stripe Connect |
| Maps | Google Maps API |
| Queue/Cache | DragonflyDB (Redis-compatible) |
| Object Storage | MinIO (S3-compatible) |
| Hosting | Kubernetes (Rancher Desktop local, TBD production: GKE/EKS/DOKS) |

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
        D[Cloudflare CDN]
    end

    subgraph K8s_Cluster["Kubernetes Cluster"]
        E[.NET 10 API - ASP.NET Core]
        F[Static Site Generator Service]
        G[Email Service - Gmail SMTP]
        H[WhatsApp Service - Meta API]
        I[Payment Service - Stripe]
    end

    subgraph Data
        J[(PostgreSQL)]
        K[(DragonflyDB - Queue/Cache)]
        L[(MinIO - Object Storage)]
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
    E --> L
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

### Gmail SMTP
- Used for: magic links, email invitations, reminders, thank you cards
- Template-based emails with personalization tokens (HTML composition)
- Known limitation: 500 emails/day limit, no bounce/complaint webhooks
- IEmailService abstraction allows swap to Mailgun/Brevo/SendGrid
- Daily quota: 500 emails (free account)

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
- PII encrypted at rest (PostgreSQL with pgcrypto or application-level)
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

### Backend (.NET 10)
```
backend/
├── src/
│   ├── Aura.Api/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   ├── Filters/
│   │   ├── Health/
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
│       ├── Queue/
│       └── BackgroundWorkers/
├── workers/
│   ├── Aura.Workers.Email/
│   ├── Aura.Workers.WhatsApp/
│   └── Aura.Workers.SSG/
├── tests/
└── AuraPlanning.sln
```

### Frontend (Angular 22)
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

### Kubernetes (Kustomize)
```
k8s/
├── base/
│   ├── api/
│   ├── workers/
│   ├── cronjobs/
│   ├── database/
│   ├── dragonfly/
│   ├── minio/
│   └── frontend/
└── overlays/
    ├── local/
    └── production/
```

## Configuration

### appsettings.json Keys
- ConnectionStrings:DefaultConnection
- Jwt:Key, Issuer, Audience, ExpiryMinutes
- MagicLink:ExpiryMinutes, BaseUrl
- WhatsApp:ApiKey, PhoneNumberId, BaseUrl
- Smtp:Host, Port, Username, Password, EnableSsl
- Minio:Endpoint, AccessKey, SecretKey, BucketName
- Dragonfly:ConnectionString
- Stripe:SecretKey, PublishableKey, WebhookSecret, PublishingPrice
- GoogleMaps:ApiKey

## Code Style

### Backend (C#)
- File-scoped namespaces (.NET 10 style)
- Primary constructors (C# 12+)
- Collection expressions (C# 12+)
- SOLID principles
- Async/await all the way
- Records for DTOs
- Nullable reference types
- Minimal APIs where appropriate

### Frontend (TypeScript/Angular)
- Strict mode
- Standalone components (default)
- New control flow (@if, @for, @switch)
- Angular signals for reactive state
- Typed forms
- inject() function for DI
- Follow Angular style guide