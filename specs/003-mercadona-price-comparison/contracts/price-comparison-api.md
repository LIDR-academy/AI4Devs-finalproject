# API Contract: Price Comparison (with Mercadona)

## Endpoint

```
GET /api/insights/price-comparison
```

**Authentication**: Bearer JWT required (`Authorization: Bearer <token>`)

**Query parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `normalizedName` | string | yes | Raw pantry item name (backend normalizes it) |

---

## Response 200 OK

```json
{
  "normalizedName": "leche entera",
  "found": true,
  "mercadona": {
    "found": true,
    "productName": "Leche entera Hacendado 1L",
    "priceEur": "0.72",
    "unit": "l",
    "lastUpdatedAt": "2026-06-26T10:00:00.000Z",
    "source": "MERCADONA_LIVE"
  },
  "reference": {
    "normalizedName": "leche entera",
    "category": "Lácteos",
    "sourceLabel": "Mercadona catalog 2025-01",
    "referencePriceEur": "0.75",
    "currencyCode": "EUR",
    "effectiveDate": "2025-01-01T00:00:00.000Z"
  },
  "receiptContext": {
    "latestUnitPriceEur": "0.89",
    "latestObservedAt": "2026-05-15T08:30:00.000Z"
  },
  "delta": "0.17",
  "unavailableReason": null
}
```

---

## Response shape: `mercadona` field

| Field | Type | When populated |
|-------|------|----------------|
| `found` | boolean | Always present |
| `productName` | string \| null | When `found: true` |
| `priceEur` | string \| null | When `found: true` |
| `unit` | string \| null | When `found: true` |
| `lastUpdatedAt` | string (ISO 8601) \| null | When `found: true` |
| `source` | `"MERCADONA_LIVE"` \| `"MERCADONA_CACHED"` \| null | When `found: true` |

---

## Response: `delta` field

`delta = receiptContext.latestUnitPriceEur − mercadona.priceEur`

- Positive value → user overpaid relative to Mercadona price
- Negative value → user paid less than current Mercadona price
- `null` → either `receiptContext.latestUnitPriceEur` or `mercadona.priceEur` is missing

---

## Fallback scenarios

### Mercadona not found, static catalog available

```json
{
  "normalizedName": "trufa negra",
  "found": true,
  "mercadona": {
    "found": false,
    "productName": null,
    "priceEur": null,
    "unit": null,
    "lastUpdatedAt": null,
    "source": null
  },
  "reference": {
    "normalizedName": "trufa negra",
    "referencePriceEur": "850.00",
    ...
  },
  "delta": null,
  "unavailableReason": null
}
```

### Neither Mercadona nor catalog

```json
{
  "normalizedName": "carne de dragon",
  "found": false,
  "mercadona": { "found": false, "productName": null, "priceEur": null, "unit": null, "lastUpdatedAt": null, "source": null },
  "reference": null,
  "receiptContext": { "latestUnitPriceEur": null, "latestObservedAt": null },
  "delta": null,
  "unavailableReason": "NO_REFERENCE_DATA"
}
```

---

## Error responses

| Status | Condition |
|--------|-----------|
| 401 | Missing or invalid JWT |
| 400 | `normalizedName` query param missing |

---

## Backwards compatibility

All fields present in the original response shape (`normalizedName`, `found`, `reference`, `receiptContext`, `unavailableReason`) remain unchanged. The `mercadona` and `delta` fields are additive. Existing frontend code that does not read the new fields continues to work without modification.
