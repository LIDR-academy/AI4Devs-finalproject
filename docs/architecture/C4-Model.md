# C4 Model — RealSaveFooding (MVP)

This document provides the C4 model at three levels for the first version of RealSaveFooding:
- Level 1: System Context
- Level 2: Container Diagram
- Level 3: Component Diagram (Backend API)

Scope follows the MVP defined in `docs/product/3_PRD.md`:
- Authentication and JWT authorization
- Pantry CRUD
- Receipt upload + OCR extraction
- Expiration estimation and 3-day expiring-soon policy
- Notifications
- Dashboard and use-next prioritization
- Basic shared pantry

## C4 Level 1 — System Context

```plantuml
@startuml
!pragma teoz true

title C4 Level 1 - System Context (RealSaveFooding MVP)

actor "Household User" as User
actor "Household Member" as Member
actor "Product Team" as Team

rectangle "RealSaveFooding System" as System {
  component "RealSaveFooding Platform\n(Frontend + Backend Services)" as Platform
}

cloud "AWS Textract" as Textract
cloud "Amazon SNS" as SNS

User --> Platform : Manage pantry, upload receipts, confirm expiries
Member --> Platform : Consume items, view shared pantry
Platform --> Textract : OCR receipt text extraction
Platform --> SNS : Publish expiration notifications
Team --> Platform : Operate, configure, monitor MVP

@enduml
```

### Context notes
- The platform serves household users through a mobile-first web app.
- OCR and notifications are delegated to AWS managed services.
- Shared pantry behavior is part of the core system boundary in MVP.

## C4 Level 2 — Container Diagram

```plantuml
@startuml
!pragma teoz true

title C4 Level 2 - Container Diagram (RealSaveFooding MVP)

actor "End User" as User

node "Client Device" {
  component "Web App Container\nTanStack Start + React + TypeScript + Vite\n(front)" as Front
}

node "Backend Container\nNestJS Modular Monolith\n(back)" as Back

database "PostgreSQL Container\nAmazon RDS PostgreSQL" as RDS
storage "Object Storage Container\nAmazon S3 (receipt images)" as S3
cloud "OCR Service\nAWS Textract" as Textract
cloud "Notification Service\nAmazon SNS" as SNS

User --> Front : Uses UI flows
Front --> Back : HTTPS REST API + JWT
Back --> RDS : Read/write domain data
Back --> S3 : Upload/download receipt files
Back --> Textract : Analyze receipt documents
Back --> SNS : Publish expiring-soon alerts

@enduml
```

### Container notes
- `front` is the presentation container that handles UI state, feature flows, and API calls.
- `back` is a modular monolith exposing API endpoints and coordinating domain logic.
- RDS stores transactional domain data.
- S3 stores raw receipt files.
- Textract and SNS are external service containers integrated by backend adapters.

## C4 Level 3 — Component Diagram (Backend API Container)

```plantuml
@startuml
!pragma teoz true

title C4 Level 3 - Components (NestJS API Container)

component "Auth Module" as Auth
component "Users Module" as Users
component "Pantry Module" as Pantry
component "Receipts Module" as Receipts
component "Expiration Module" as Expiration
component "Notifications Module" as Notifications
component "Dashboard Module" as Dashboard

component "Prisma Data Access\n(database/prisma service)" as Prisma
component "S3 Adapter\n(integrations/aws-s3)" as S3Adapter
component "Textract Adapter\n(integrations/aws-textract)" as TextractAdapter
component "SNS Adapter\n(integrations/aws-sns)" as SNSAdapter
component "JWT Guard + Common Cross-Cutting" as Common

Auth --> Common
Users --> Prisma
Pantry --> Prisma
Receipts --> Prisma
Expiration --> Prisma
Dashboard --> Prisma

Receipts --> S3Adapter
Receipts --> TextractAdapter
Expiration --> Notifications
Notifications --> SNSAdapter

Pantry --> Expiration : Item changes affecting freshness state
Expiration --> Dashboard : Expiring-soon and use-next data
Auth --> Users : Identity and account ownership checks

@enduml
```

### Component notes
- Modules follow clear domain boundaries inside a single deployable backend container.
- Data persistence is centralized through Prisma service.
- External integrations are isolated behind dedicated adapters.
- Expiration and notifications are coupled by the 3-day policy for expiring-soon alerts in MVP.

## Traceability to Main User Flows
- Login/registration: Auth + Users modules
- Pantry CRUD and shared visibility: Pantry + Users + Dashboard modules
- Receipt ingestion: Receipts + S3 adapter + Textract adapter
- Expiry confirmation and status: Expiration + Pantry modules
- Alerts: Expiration + Notifications + SNS adapter
- Dashboard and use-next list: Dashboard + Expiration + Pantry modules

## Security View (Cross-Cutting)

### Security controls expected per level
- Context level:
  - End users authenticate before accessing household data.
  - External providers (Textract/SNS) are accessed through backend-only trust boundary.
- Container level:
  - Frontend to backend traffic requires HTTPS and JWT-based access control.
  - S3 object access should remain private and scoped via backend integration layer.
  - RDS access should be limited to backend service identity.
- Component level:
  - Auth module and common guards enforce identity and authorization boundaries.
  - Receipts module validates uploaded file metadata and OCR output before persistence.
  - Notifications module publishes minimal data payloads.

### Architecture risks documented (not fixed here)
- JWT lifecycle policy is not yet fully specified (refresh/revocation behavior pending).
- Shared pantry access boundaries may be under-specified for multi-household edge cases.
- No explicit throttling strategy is represented in the current C4 container interactions.
- Receipt data privacy depends on strict S3 policy and retention configuration outside this model.
- Operational concentration in a single MVP environment increases accidental exposure risk.

## Out of Scope (Post-MVP)
- Recipe recommendation engine and external recipe APIs
- Dynamic live supermarket price integrations
- Multi-role household permissions
- Cross-user benchmarking
- ML-based expiry learning loop persistence
