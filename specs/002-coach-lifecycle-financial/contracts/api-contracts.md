# API Contracts: Coach Lifecycle & Financial Data

All endpoints are under `/api/v1/coaches` prefix. All responses follow the standard envelope format.

## POST /api/v1/coaches — Create Coach

**Auth**: Admin only (`authenticate` + `requireRole(UserRole.ADMIN)`)

**Request Body**:
```json
{
  "name": "string (required, max 255)",
  "email": "string (required, valid email)",
  "phone": "string | null (optional, max 20)",
  "specialities": "string | null (optional)",
  "bankAccount": "string (required)",
  "ssn": "string (required)",
  "dni": "string (required)"
}
```

**Response 201**:
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "phone": "string | null",
  "specialities": "string | null",
  "status": "string",
  "createdAt": "ISO date"
}
```
*No financial data in response.*

**Errors**: 400 (validation), 401 (unauthorized), 403 (forbidden), 409 (email conflict)

---

## GET /api/v1/coaches — List Coaches

**Auth**: Admin only (`authenticate` + `requireRole(UserRole.ADMIN)`)

**Query Params**: `?page=1&limit=20&status=active|inactive`

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "status": "string"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```
*No financial data in response. Minimal fields in list view.*

**Errors**: 401 (unauthorized), 403 (forbidden)

---

## GET /api/v1/coaches/:id — Get Coach Detail

**Auth**: Admin only (`authenticate` + `requireRole(UserRole.ADMIN)`)

**Response 200**:
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "phone": "string | null",
  "specialities": "string | null",
  "status": "string",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```
*No financial data in response.*

**Errors**: 401 (unauthorized), 403 (forbidden), 404 (not found)

---

## PUT /api/v1/coaches/:id — Update Coach Profile

**Auth**: Admin only (`authenticate` + `requireRole(UserRole.ADMIN)`)

**Request Body** (partial update — only include fields to change):
```json
{
  "name": "string | null (optional)",
  "email": "string | null (optional)",
  "phone": "string | null (optional)",
  "specialities": "string | null (optional)"
}
```

**Response 200**: Same as GET /api/v1/coaches/:id

**Errors**: 400 (validation), 401 (unauthorized), 403 (forbidden), 404 (not found), 409 (email conflict)

---

## PATCH /api/v1/coaches/:id/status — Toggle Coach Status

**Auth**: Admin only (`authenticate` + `requireRole(UserRole.ADMIN)`)

**Request Body**:
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

**Errors**: 400 (validation), 401 (unauthorized), 403 (forbidden), 404 (not found)

---

## GET /api/v1/coaches/:id/financial — Get Coach Financial Data

**Auth**: Admin only (`authenticate` + `requireRole(UserRole.ADMIN)`)

**Security**: Access is logged as a security event.

**Response 200**:
```json
{
  "id": "uuid",
  "name": "string",
  "bankAccount": "string",
  "ssn": "string",
  "dni": "string"
}
```

**Errors**: 401 (unauthorized), 403 (forbidden), 404 (not found), 503 (decryption failure)
