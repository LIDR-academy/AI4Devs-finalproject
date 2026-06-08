# Data Model: Realista MVP

## Entity Relationship Diagram

```
┌──────────┐       ┌──────────────────┐       ┌──────────────────┐
│   User   │ 1───N │ PurchaseProcess  │ 1───N │ AnalyzedListing  │
│          │       │                  │       │                  │
│ id (UUID)│       │ id (UUID)        │       │ id (UUID)        │
│          │       │ userId (?)       │       │ processId        │
│          │       │ status           │       │ url              │
│          │       │ financialProfile │       │ numericScore     │
│          │       │ createdAt        │       │ redFlags         │
│          │       │ updatedAt        │       │ locationConf     │
│          │       │                  │       │ miraTuZonaLink   │
│          │       │                  │       │ cadastralRef     │
│          │       │                  │       │ snapshotHash     │
│          │       │                  │       │ createdAt        │
│          │       │                  │       │                  │
│          │       │ 1───1            │       │                  │
│          │       │ Checklist        │       │                  │
│          │       │                  │       │                  │
│          │       │ id (UUID)        │       │                  │
│          │       │ processId        │       │                  │
│          │       │ items (JSON)     │       │                  │
│          │       │ updatedAt        │       │                  │
└──────────┘       └──────────────────┘       └──────────────────┘
```

## Prisma Schema

```prisma
model User {
  id                String            @id @default(uuid())
  createdAt         DateTime          @default(now())
  purchaseProcesses PurchaseProcess[]
}

model PurchaseProcess {
  id                String            @id @default(uuid())
  userId            String?
  user              User?             @relation(fields: [userId], references: [id])
  status            String            @default("active") // active | completed | archived
  propertyPrice     Int?              // 0 si se crea sin listing origen
  sourceListingId   String?           // FK lógica al AnalyzedListing que inició el proceso
  financialProfile  Json?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  analyzedListings  AnalyzedListing[]
  checklist         Checklist?
}

model AnalyzedListing {
  id                String            @id @default(uuid())
  processId         String
  process           PurchaseProcess   @relation(fields: [processId], references: [id])
  url               String
  numericScore      Int               // 0-100
  redFlags          Json              // string[]
  locationConfidence Float?           // 0.0-1.0
  miraTuZonaLink    String?
  cadastralRef      String?
  cadastralM2       Float?
  claimedM2         Float?
  constructionYear  Int?
  snapshotHash      String            // SHA-256
  previousHash      String?           // link to previous snapshot for diff
  createdAt         DateTime          @default(now())

  @@index([processId])
}

model Checklist {
  id                String            @id @default(uuid())
  processId         String            @unique
  process           PurchaseProcess   @relation(fields: [processId], references: [id])
  items             Json              // BureaucraticMilestone[]
  updatedAt         DateTime          @updatedAt
}
```

## Value Objects (domain layer, not in DB)

### TransparencyScore (`domain/value-objects/TransparencyScore.ts`)

```typescript
interface TransparencyScore {
  value: number        // 0-100
  label: 'excellent' | 'good' | 'fair' | 'poor' | 'suspicious'
  breakdown: {
    completeness: number
    accuracy: number
    clarity: number
  }
}
```

### FinancialProfile (`domain/value-objects/FinancialProfile.ts`)

```typescript
interface FinancialProfile {
  propertyPrice: number
  savings: number
  monthlyIncome: number
  existingDebts: number
  region: string          // autonomous community (affects ITP %)
  interestRate?: number   // override Euribor default
  persona?: FinancialPersona
}

type FinancialPersona = 'conservative' | 'moderate' | 'growth'

interface HiddenCosts {
  itpIva: number          // 6-10% of property price
  notaria: number         // ~600€
  registro: number        // ~400€
  gestoria: number        // ~300€
  tasacion: number        // ~300€
  total: number
}

interface AmortizationScenario {
  label: string           // "Baseline" | "Light" | "Moderate" | "Aggressive"
  extraMonthly: number
  yearsShortened: number
  finalDuration: number
  totalInterest: number
  interestSaved: number
}

interface InvestmentAlternative {
  monthlyContribution: number
  estimatedReturn5pct: number
  estimatedReturn7pct: number
  years: number
}
```

### RedFlags (`domain/value-objects/RedFlags.ts`)

```typescript
type RedFlag =
  | 'imprecise_location'
  | 'no_energy_certificate'
  | 'inflated_square_meters'
  | 'vague_description'
  | 'missing_floor_info'
  | 'stale_listing'
  | 'common_area_photos'
  | 'no_orientation'
  | 'euphemistic_language'
  | 'price_inconsistency'
```

### BureaucraticMilestone (`domain/value-objects/BureaucraticMilestone.ts`)

```typescript
interface BureaucraticMilestone {
  id: string
  stage: 'pre_arras' | 'post_arras' | 'pre_escritura' | 'post_escritura'
  title: string
  description: string
  documentsNeeded: string[]
  estimatedDays: number
  completed: boolean
}
```

## State Transitions

### PurchaseProcess
```
active ──→ completed
  │
  └──→ archived
```

### Checklist Item
```
pending ──→ completed ──→ pending (toggle)
```

### AnalyzedListing
```
created ──→ reanalyzed (new snapshot created, old one linked via previousHash)
```
