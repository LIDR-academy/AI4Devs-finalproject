# API Contracts: Coachee Lifecycle Management

**Base URL**: `/api/v1`
**Auth**: Bearer JWT token in `Authorization` header
**Error Envelope**: `{ error: { code, message, ref } }`

---

## POST /coachees

Create a new coachee.

**Auth**: Admin only (`requireRole('ADMIN')`)

**Request**:
```json
{
  "name": "string",
  "email": "string (email format)",
  "phone": "string",
  "classTypePreference": "individual | group | both",
  "levelId": "uuid",
  "additionalInfo": "string | null"
}
```

**Response 201**:
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "phone": "string",
  "classTypePreference": "individual | group | both",
  "status": "active",
  "level": { "id": "uuid", "name": "string", "color": "string" },
  "createdAt": "string (ISO 8601)"
}
```

**Errors**: `400 VALIDATION_ERROR`, `403 FORBIDDEN`, `409 CONFLICT` (duplicate email)

---

## GET /coachees

List coachees with pagination and filters.

**Auth**: Admin or Coach (`requireRole('ADMIN', 'COACH')`)

**Query Params**: `status` (comma-sep), `levelId` (comma-sep), `page` (default 1), `limit` (default 20)

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "phone": "string",
      "classTypePreference": "individual | group | both | null",
      "status": "active | inactive",
      "level": { "id": "uuid", "name": "string", "color": "string" } | null,
      "createdAt": "string (ISO 8601)"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 25, "totalPages": 2 }
}
```

**Errors**: `403 FORBIDDEN`

---

## GET /coachees/:id

Get coachee detail.

**Auth**: Admin or Coach (`requireRole('ADMIN', 'COACH')`)

**Response 200**:
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "phone": "string",
  "classTypePreference": "individual | group | both | null",
  "status": "active | inactive",
  "level": { "id": "uuid", "name": "string", "color": "string" } | null,
  "additionalInfo": "string | null",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

**Errors**: `403 FORBIDDEN`, `404 NOT_FOUND`

---

## PUT /coachees/:id

Update coachee profile (partial update).

**Auth**: Admin or Coach (`requireRole('ADMIN', 'COACH')`)

**Request**:
```json
{
  "name": "string | null",
  "email": "string (email) | null",
  "phone": "string | null",
  "classTypePreference": "individual | group | both | null",
  "additionalInfo": "string | null"
}
```

**Response 200**: Same shape as `GET /coachees/:id`

**Errors**: `400 VALIDATION_ERROR`, `403 FORBIDDEN`, `404 NOT_FOUND`, `409 CONFLICT` (duplicate email)

---

## PATCH /coachees/:id/status

Activate/deactivate a coachee.

**Auth**: Admin only (`requireRole('ADMIN')`)

**Request**:
```json
{
  "status": "active | inactive"
}
```

**Response 200**:
```json
{
  "id": "uuid",
  "status": "active | inactive"
}
```

**Errors**: `400 VALIDATION_ERROR`, `403 FORBIDDEN`, `404 NOT_FOUND`

---

## PATCH /coachees/:id/level

Change coachee level.

**Auth**: Admin or Coach (`requireRole('ADMIN', 'COACH')`)

**Request**:
```json
{
  "levelId": "uuid"
}
```

**Response 200**:
```json
{
  "id": "uuid",
  "level": { "id": "uuid", "name": "string", "color": "string", "sortOrder": 1 }
}
```

**Errors**: `400 VALIDATION_ERROR`, `403 FORBIDDEN`, `404 NOT_FOUND`
