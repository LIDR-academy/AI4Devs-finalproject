# Data Model: Realista MVP

## Entity Relationship Diagram

```
┌──────────┐       ┌──────────────────┐       ┌──────────────────┐
│   User   │ 1───N │ PurchaseProcess  │ 1───N │ AnalyzedListing  │
│          │       │                  │       │                  │
│ id (UUID)│       │ id (UUID)        │       │ id (UUID)        │
│          │       │ userId (?)       │       │ processId        │
│          │       │ status           │       │ url              │
│          │       │ propertyPrice    │       │ numericScore     │
│          │       │ sourceListingId  │       │ locationConf     │
│          │       │ currentStage     │       │ miraTuZonaLink   │
│          │       │ financialProfile │       │ cadastralRef     │
│          │       │ (JSON)           │       │ snapshotHash     │
│          │       │ createdAt        │       │ previousHash     │
│          │       │ updatedAt        │       │ diff (JSON)      │
│          │       │                  │       │ createdAt        │
│          │       │ 1───1            │       │                  │
│          │       │ Checklist        │       │ 1───N            │
│          │       │                  │       │                  │
│          │       │ id (UUID)        │  ┌────┴──────────┐       │
│          │       │ processId        │  │  RedFlag     │       │
│          │       │ updatedAt        │  │              │       │
│          │       │                  │  │ flag (enum)  │       │
│          │       │ 1───N            │  │ reasoning    │       │
│          │       │                  │  │ createdAt    │       │
│          │       │ ChecklistItem    │  └──────────────┘       │
│          │       │                  │                          │
│          │       │ id (UUID)        │                          │
│          │       │ stage            │                          │
│          │       │ title            │                          │
│          │       │ description      │                          │
│          │       │ documentsNeeded  │                          │
│          │       │ (JSON array)     │                          │
│          │       │ estimatedDays    │                          │
│          │       │ completed        │                          │
│          │       │ completedAt      │                          │
│          │       │ sortOrder        │                          │
│          │       └──────────────────┘                          │
└──────────┘                                                       │
                                                                  │
┌─────────────────────────────────────────────────────────────────┐
│              PortalHealthCheck (monitorización proactiva)       │
│                                                                 │
│  id, portal, status, successRate, lastCheckedAt, lastSuccessAt,  │
│  consecutiveFailures, alertTriggeredAt                          │
└─────────────────────────────────────────────────────────────────┘
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
  currentStage      String            @default("pre_arras") // pre_arras | arras | due_diligence | mortgage | notary | completed
  financialProfile  Json?             // semi-estructurado (input de usuario), justificado como JSON
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  analyzedListings  AnalyzedListing[]
  checklist         Checklist?
}

model AnalyzedListing {
  id                String   @id @default(uuid())
  processId         String
  process           PurchaseProcess @relation(fields: [processId], references: [id])
  url               String
  numericScore      Int               // 0-100
  locationConfidence Float?           // 0.0-1.0 (basado en 'declared' o 'geocoded', sin vision)
  miraTuZonaLink    String?
  cadastralRef      String?
  cadastralM2       Float?
  claimedM2         Float?
  constructionYear  Int?
  snapshotHash      String            // SHA-256 del contenido canónico (ver SnapshotHash definition)
  previousHash      String?           // link to previous snapshot for diff
  diff              Json?             // Diferencias vs previousHash (precio, m², año, etc.) — computado por backend
  createdAt         DateTime          @default(now())

  redFlags          RedFlag[]         // normalizado a tabla (ver FR-025)

  @@index([processId])
}

model RedFlag {
  id                String   @id @default(uuid())
  listingId         String
  listing           AnalyzedListing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  flag              String    // valor del enum RedFlagType (ver value object)
  reasoning         String    // frase del anuncio + inferencia del LLM (FR-025)
  createdAt         DateTime  @default(now())

  @@index([listingId])
  @@index([flag])
}

model Checklist {
  id                String            @id @default(uuid())
  processId         String            @unique
  process           PurchaseProcess   @relation(fields: [processId], references: [id])
  updatedAt         DateTime          @updatedAt
  items             ChecklistItem[]
}

model ChecklistItem {
  id                String    @id @default(uuid())
  checklistId       String
  checklist         Checklist  @relation(fields: [checklistId], references: [id], onDelete: Cascade)
  stage             String    // pre_arras | post_arras | pre_escritura | post_escritura
  title             String
  description       String
  documentsNeeded   String[]  // array de strings (Postgres native)
  estimatedDays     Int
  completed         Boolean   @default(false)
  completedAt       DateTime?
  sortOrder         Int        @default(0)
  createdAt         DateTime  @default(now())

  @@index([checklistId])
  @@index([stage])
}

model PortalHealthCheck {
  id                    String    @id @default(uuid())
  portal                String    @unique  // 'idealista' | 'fotocasa' | 'habitaclia' | etc.
  status                String    @default("unknown") // ok | blocked | throttled | unknown
  successRate           Float     @default(1.0)        // 0.0-1.0 sobre los últimos 100 requests
  totalRequests         Int       @default(0)
  consecutiveFailures   Int       @default(0)
  lastCheckedAt         DateTime?
  lastSuccessAt         DateTime?
  alertTriggeredAt      DateTime?
  notes                 String?   // ej: "blocked since 2026-06-15, retry every 30min"

  @@index([portal])
}
```

### Decisión de normalización: lo que se queda como JSON y por qué

| Campo | Storage | Justificación |
|-------|---------|---------------|
| `PurchaseProcess.financialProfile` | `Json?` | **Semi-estructurado, input del usuario**. El usuario introduce sus datos financieros y los editamos. Normalizar a tablas separadas (FinancialProfile, FinancialDebt, etc.) sería over-engineering para datos que raramente se consultan por campos individuales. El value object `FinancialProfile` valida en el dominio. |
| `AnalyzedListing.diff` | `Json?` | **Resultado computado, no datos de negocio**. El diff entre dos snapshots es un artefacto transitorio que se muestra en el dashboard pero no se querya por campos. Mejor computar y almacenar como JSON. |
| `ChecklistItem.documentsNeeded` | `String[]` (Postgres native) | **Array simple de strings, sin estructura relacional**. Postgres soporta arrays nativos, evita la creación de una tabla `Document` separada para algo que es solo una lista de etiquetas. |

## Value Objects (domain layer, encapsulan las entidades DB)

### TransparencyScore (`domain/value-objects/TransparencyScore.ts`)

```typescript
interface TransparencyScore {
  value: number        // 0-100, persistido en DB como `numericScore`
  label: 'excellent' | 'good' | 'fair' | 'poor' | 'suspicious' // derivado de `value` (no persistido)
  breakdown: { completeness: number; accuracy: number; clarity: number } // derivado de `value` (no persistido)
}
```

### RedFlagType (enum cerrado, usado en `RedFlag.flag`)

```typescript
// Enum cerrado: solo estos valores son válidos en `RedFlag.flag`.
// Constraint en DB via check constraint o validación en el agregado AnalyzedListing.
type RedFlagType =
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

El LLM está instruido a devolver **solo** valores de este enum. El validador en `AnalyzedListing` agrega rechaza cualquier string fuera del enum. El constraint de la columna en DB es `String` (no enum nativo de Prisma) para permitir evolución sin migraciones, pero el dominio impone el enum.

### SnapshotHash

```typescript
interface SnapshotHashInput {
  title: string
  description: string
  price: number
  features: string[]
  claimedM2: number
  declaredLocation: string
  photoUrls: string[]
}
function computeSnapshotHash(input: SnapshotHashInput): string
// Returns: 'sha256:<hex64>'
```

### FinancialProfile (semi-estructurado, vive en `PurchaseProcess.financialProfile` JSON)

```typescript
interface FinancialProfile {
  propertyPrice: number
  savings: number
  monthlyIncome: number
  existingDebts: number
  region: string
  interestRate?: number
  persona?: 'conservative' | 'moderate' | 'growth'
}

interface HiddenCosts { /* ITP, notaría, registro, gestoría, tasación */ }
interface AmortizationScenario { /* baseline, light, moderate, aggressive */ }
interface InvestmentAlternative { /* 3 escenarios con valor real */ }
```

### BureaucraticMilestone (encapsula un `ChecklistItem` con metadata adicional)

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

### RedFlag
```
detected ──→ persisted (no transition needed, stateless)
```

### ChecklistItem
```
pending ──→ completed ──→ pending (toggle)
```

### AnalyzedListing
```
created ──→ reanalyzed (new snapshot created, old one linked via previousHash)
```

### PortalHealthCheck
```
unknown ──→ ok (después de N requests exitosos)
ok ──→ throttled (después de N 429s consecutivos)
ok/throttled ──→ blocked (después de N 403s consecutivos)
blocked ──→ ok (auto-recovery vía retry logic tras timeout)
```

## Notas

- **RedFlag normalizado** permite queries SQL directas: `SELECT flag, COUNT(*) FROM "RedFlag" GROUP BY flag` para análisis agregado de red flags más comunes (insight de producto futuro).
- **ChecklistItem normalizado** permite toggle individual eficiente (UPDATE por ID en lugar de parsear/modificar JSON).
- **PortalHealthCheck** es la tabla de soporte para FR-027 (monitorización proactiva de portales). Permite query eficiente del estado de cada portal y trigger de alertas/alertas.
