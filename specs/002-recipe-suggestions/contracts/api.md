# API Contracts: Recipe Suggestions

**Feature**: 002-recipe-suggestions | **Date**: 2026-06-25

All endpoints are under `/api` prefix. Authentication is required — requests must include a valid JWT Bearer token. See pantry API for auth pattern reference.

---

## GET /api/recipes

Returns recipe suggestions ranked by pantry overlap, prioritizing soonest-expiring items.

### Request

```
GET /api/recipes?limit=10
Authorization: Bearer <token>
```

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit`   | integer | No | 10 | Maximum number of suggestions to return (1–50) |

### Response 200 OK

```json
{
  "recipes": [
    {
      "id": "52795",
      "name": "Chicken Handi",
      "category": "Chicken",
      "thumbnailUrl": "https://www.themealdb.com/images/media/meals/...",
      "matchedIngredients": ["Chicken", "Tomato"],
      "missingIngredients": ["Cream", "Garlic", "Ginger"],
      "matchScore": 0.4
    }
  ]
}
```

### Response 503 Service Unavailable

Returned when TheMealDB is unreachable and no cache is available.

```json
{
  "statusCode": 503,
  "message": "Recipe suggestions are temporarily unavailable. Please try again later."
}
```

### Response 401 Unauthorized

```json
{ "statusCode": 401, "message": "Unauthorized" }
```

---

## GET /api/recipes/:mealId

Returns full recipe detail with pantry match overlay for the authenticated user.

### Request

```
GET /api/recipes/52795
Authorization: Bearer <token>
```

### Response 200 OK

```json
{
  "id": "52795",
  "name": "Chicken Handi",
  "category": "Chicken",
  "thumbnailUrl": "https://www.themealdb.com/images/media/meals/...",
  "youtubeUrl": "https://www.youtube.com/watch?v=...",
  "instructions": "Step 1: ...",
  "ingredients": [
    { "name": "Chicken", "measure": "1kg" },
    { "name": "Onion", "measure": "2 medium" }
  ],
  "matchedPantryItemIds": ["pantry-item-uuid-1", "pantry-item-uuid-2"]
}
```

### Response 404 Not Found

Returned when the `mealId` does not exist in TheMealDB.

```json
{ "statusCode": 404, "message": "Recipe not found" }
```

### Response 503 Service Unavailable

Same as list endpoint — TheMealDB unreachable.

---

## POST /api/recipes/:mealId/cook

Records consumption events for all specified pantry items. Atomic — all succeed or none.

### Request

```
POST /api/recipes/52795/cook
Authorization: Bearer <token>
Content-Type: application/json

{
  "pantryItemIds": ["pantry-item-uuid-1", "pantry-item-uuid-2"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pantryItemIds` | string[] | Yes | Non-empty array of pantry item UUIDs belonging to the user's household |

### Response 201 Created

```json
{
  "consumedCount": 2,
  "events": [
    { "id": "event-uuid-1" },
    { "id": "event-uuid-2" }
  ]
}
```

### Response 400 Bad Request

Returned when `pantryItemIds` is empty, malformed, or contains an ID that does not belong to the user's household.

```json
{
  "statusCode": 400,
  "message": "One or more pantry items are invalid or do not belong to your household"
}
```

### Response 404 Not Found

Returned when a `pantryItemId` is not found.

```json
{ "statusCode": 404, "message": "Pantry item not found" }
```

---

## Authentication

All endpoints use `JwtAuthGuard` (existing guard). The `req.user.id` value is the authenticated user's UUID and is used to scope all pantry queries.

## Error Envelope

All error responses follow NestJS's default exception format:

```json
{
  "statusCode": <number>,
  "message": "<string>"
}
```
