# API Contracts: Default Password & Force Change on First Login

> **Note**: Full API specifications are in [docs/api-specifications.md](../../docs/api-specifications.md). This file documents only the contracts affected by this feature.

## POST /auth/login (updated)

**Request**: Unchanged
```json
{
  "email": "string (email format)",
  "password": "string"
}
```

**Response** — Added `mustChangePassword` to user object:
```json
{
  "accessToken": "string (JWT, 15 min)",
  "refreshToken": "string (opaque, 7 day)",
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "role": "admin | coach | coachee",
    "status": "active | inactive",
    "mustChangePassword": false
  }
}
```

## POST /auth/refresh (updated)

**Response** — Added `mustChangePassword` to user object:
```json
{
  "accessToken": "string (JWT, 15 min)",
  "refreshToken": "string (opaque, 7 day)",
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "role": "admin | coach | coachee",
    "status": "active | inactive",
    "mustChangePassword": false
  }
}
```

## POST /auth/change-password (new)

**Description**: Allows an authenticated user to change their password. Verifies current password before accepting new one. Clears `must_change_password` flag on success.

**Auth/Role**: Authenticated (any role)

**Request**:
```json
{
  "currentPassword": "string",
  "newPassword": "string (min 6 characters)"
}
```

**Success Response** (`200 OK`):
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses**:

| HTTP | Code | When |
|------|------|------|
| 400 | `VALIDATION_ERROR` | Missing fields, new password too short |
| 401 | `UNAUTHORIZED` | Invalid/missing access token |
| 401 | `UNAUTHORIZED` | Current password is incorrect |

## POST /coachees (updated)

**Phone field** changed from optional to required:
```json
{
  "name": "string",
  "email": "string (email format)",
  "phone": "string",              // NOW REQUIRED
  "classTypePreference": "individual | group | both",
  "levelId": "uuid",
  "additionalInfo": "string | null"
}
```

**Business rule**: The phone number is used as the coachee's initial password (hashed with bcrypt). The `must_change_password` flag defaults to `true`.
