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

Analyze a property listing URL.

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
  "createdAt": "2026-06-04T12:00:00Z"
}
```

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

Create a new purchase process for the session.

**Request:**
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

**Response (201):**
```json
{
  "id": "uuid",
  "status": "active",
  "financialProfile": { "..." },
  "createdAt": "2026-06-04T12:00:00Z"
}
```

---

### GET /api/purchase-processes/:id

Get purchase process with listings and checklist.

**Response (200):**
```json
{
  "id": "uuid",
  "status": "active",
  "financialProfile": { "..." },
  "analyzedListings": [ { "..." } ],
  "checklist": { "id": "uuid", "items": [ "..." ] },
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### PATCH /api/purchase-processes/:id

Update purchase process (status, financial profile).

**Request:**
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
