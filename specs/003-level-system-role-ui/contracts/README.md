# API Contracts: Level System

Base URL: `/api/v1`

## GET /levels

Retrieve all training levels ordered by sort_order.

**Authentication**: Required (any role — Admin, Coach, Coachee)

**Response** (200):
```json
{
  "data": [
    { "id": "uuid", "name": "Principiante", "color": "#4A90D9", "sort_order": 1 },
    { "id": "uuid", "name": "Basico", "color": "#50C878", "sort_order": 2 },
    { "id": "uuid", "name": "Intermedio", "color": "#F5A623", "sort_order": 3 },
    { "id": "uuid", "name": "Avanzado", "color": "#E67E22", "sort_order": 4 },
    { "id": "uuid", "name": "Experto", "color": "#E74C3C", "sort_order": 5 }
  ]
}
```

## PATCH /coachees/:id/level

Update a Coachee's training level.

**Authentication**: Required (Admin or Coach)

**Request Body**:
```json
{
  "levelId": "uuid (required)"
}
```

**Response** (200):
```json
{
  "id": "coachee-uuid",
  "level": { "id": "level-uuid" }
}
```

**Error Responses**:
- 400: Invalid levelId (not a UUID)
- 404: Coachee not found
- 403: Insufficient permissions (Coachee role cannot change levels)

## GET /coachees/:id

Retrieve a Coachee's full profile (includes level reference).

**Authentication**: Required (Admin or Coach)

**Response** (200):
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "phone": "string",
  "classTypePreference": "INDIVIDUAL | GROUP | BOTH | null",
  "status": "ACTIVE | INACTIVE",
  "level": { "id": "uuid" } | null,
  "additionalInfo": "string | null",
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```
