# API Contracts: Realista MVP

## Base URL

```
Development: http://localhost:3001/api
Production: TBD (Railway/Render)
```

## Headers

| Header | Required | Description |
|--------|----------|-------------|
| `X-Session-Id` | No* | UUID v4 de sesión. *Obligatorio tras la primera respuesta que lo devuelva |
| `Content-Type` | Yes | `application/json` |
| `Accept` | Yes | `application/json` |

## Endpoints

### POST /api/listings/analyze

Analyze a property listing URL. Auto-attaches to the active PurchaseProcess (creates one if none exists).

**Request:**
```json
{
  "url": "https://www.idealista.com/inmueble/12345678/"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "url": "https://www.idealista.com/inmueble/12345678/",
  "numericScore": 42,
  "redFlags": ["imprecise_location", "no_energy_certificate", "inflated_square_meters"],
  "locationConfidence": 0.78,
  "miraTuZonaLink": "https://miratuzona.com/zone/madrid-centro",
  "cadastralRef": "9876543VK4797N",
  "cadastralM2": 78,
  "claimedM2": 85,
  "constructionYear": 1972,
  "snapshotHash": "sha256:a1b2c3d4...",
  "createdAt": "2026-06-04T12:00:00Z",
  "processSummary": {
    "processId": "uuid",
    "status": "active",
    "propertyPrice": 200000,
    "sourceListingId": "uuid"
  }
}
```

El campo `processSummary` siempre está presente:
- Si la sesión no tenía proceso activo, se crea uno con `propertyPrice` extraído del listing (`sourceListingId` apunta al listing recién creado)
- Si ya había proceso activo, el listing se adjunta al existente y `processSummary` refleja el estado actual del proceso

**Response (400 - invalid URL):**
```json
{
  "error": "INVALID_URL",
  "message": "La URL proporcionada no es válida o no se pudo acceder al anuncio."
}
```

**Response (429 - rate limited):**
```json
{
  "error": "RATE_LIMITED",
  "message": "Has alcanzado el límite de 20 análisis por día. Vuelve mañana.",
  "retryAfter": 86400
}
```

---

### GET /api/listings

List all analyzed listings for the current session.

**Response (200):**
```json
{
  "listings": [
    {
      "id": "uuid",
      "url": "...",
      "numericScore": 42,
      "createdAt": "2026-06-04T12:00:00Z"
    }
  ]
}
```

---

### GET /api/listings/:id

Get a single analyzed listing.

**Response (200):**
```json
{
  "id": "uuid",
  "url": "...",
  "numericScore": 42,
  "redFlags": ["..."],
  "locationConfidence": 0.78,
  "miraTuZonaLink": "...",
  "cadastralRef": "...",
  "cadastralM2": 78,
  "claimedM2": 85,
  "constructionYear": 1972,
  "snapshotHash": "...",
  "previousHash": "...",
  "createdAt": "..."
}
```

---

### POST /api/purchase-processes

Create a new purchase process for the session. Optionally pre-fills the financial profile from a previously analyzed listing.

**Request (sin listing previo):**
```json
{
  "financialProfile": {
    "propertyPrice": 200000,
    "savings": 45000,
    "monthlyIncome": 3500,
    "existingDebts": 0,
    "region": "madrid",
    "interestRate": 3.5,
    "persona": "moderate"
  }
}
```

**Request (con listing previo — pre-rellena propertyPrice):**
```json
{
  "analyzedListingId": "uuid",
  "financialProfile": {
    "savings": 45000,
    "monthlyIncome": 3500,
    "existingDebts": 0,
    "region": "madrid"
  }
}
```

Cuando se pasa `analyzedListingId`:
- `propertyPrice` se toma del listing y se vincula (`sourceListingId` se rellena automáticamente)
- El usuario NO puede sobrescribirlo en la creación — debe usar PATCH si quiere cambiarlo
- Esto evita la fricción de "rellena otra vez 200.000€" cuando Mortgage Compass viene después del Listing Lens

**Response (201):**
```json
{
  "id": "uuid",
  "status": "active",
  "propertyPrice": 200000,
  "sourceListingId": "uuid",
  "financialProfile": { "..." },
  "createdAt": "2026-06-04T12:00:00Z"
}
```

---

### GET /api/purchase-processes/:id

Get purchase process with listings and checklist. Endpoint principal del dashboard.

**Response (200):**
```json
{
  "id": "uuid",
  "status": "active",
  "propertyPrice": 200000,
  "sourceListingId": "uuid",
  "financialProfile": { "..." },
  "computed": {
    "totalCash": 58200,
    "gap": -13200,
    "monthlyPayment30yr": 720,
    "amortizationScenarios": [
      { "label": "baseline", "extraMonthly": 0, "finalDuration": 30, "totalInterest": 99000, "interestSaved": 0 },
      { "label": "light", "extraMonthly": 100, "finalDuration": 25, "totalInterest": 73000, "interestSaved": 26000 }
    ],
    "investmentAlternative": {
      "monthlyContribution": 300,
      "estimatedValue30yr": 340000
    }
  },
  "analyzedListings": [
    {
      "id": "uuid",
      "url": "...",
      "numericScore": 42,
      "createdAt": "..."
    }
  ],
  "checklist": {
    "id": "uuid",
    "items": [
      {
        "id": "item-uuid",
        "stage": "pre_arras",
        "title": "Nota simple del registro",
        "completed": false
      }
    ]
  },
  "createdAt": "...",
  "updatedAt": "..."
}
```

El campo `computed` agrega el resultado del Mortgage Compass para una sola llamada en el dashboard, evitando N+1 problemas.

---

### PATCH /api/purchase-processes/:id

Update purchase process (status, financial profile, propertyPrice).

**Request (sobrescribir propertyPrice del listing):**
```json
{
  "propertyPrice": 195000
}
```

**Request (actualizar perfil financiero):**
```json
{
  "financialProfile": {
    "propertyPrice": 200000,
    "savings": 50000
  }
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "active",
  "propertyPrice": 200000,
  "sourceListingId": "uuid",
  "financialProfile": { "..." },
  "updatedAt": "2026-06-04T13:00:00Z"
}
```

---

### GET /api/checklist/:processId

Get checklist items ordered by stage.

**Response (200):**
```json
{
  "id": "uuid",
  "processId": "uuid",
  "items": [
    {
      "id": "item-uuid",
      "stage": "pre_arras",
      "title": "Nota simple del registro",
      "description": "Solicitar nota simple en el Registro de la Propiedad",
      "documentsNeeded": [],
      "estimatedDays": 3,
      "completed": false
    }
  ],
  "updatedAt": "2026-06-04T12:00:00Z"
}
```

---

### PATCH /api/checklist/:processId/items/:itemId

Toggle a checklist item's completion status.

**Request:**
```json
{
  "completed": true
}
```

**Response (200):**
```json
{
  "id": "item-uuid",
  "completed": true
}
```

---

### GET /api/session

Get or create session UUID.

**Response (200):**
```json
{
  "sessionId": "uuid-v4",
  "isNew": true
}
```

---

### GET /api/health

Health check for CI/CD and monitoring.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-06-04T12:00:00Z",
  "version": "1.0.0"
}
```
