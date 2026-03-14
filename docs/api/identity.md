# Identity API

API for Google OAuth login, session management and protected-resource access control.

**Bounded Context**: `identity` (US1)

## Endpoints

### 1. Authenticate with Google
Exchange a Google `id_token` for a backend-issued JWT.

*   **URL**: `/api/v1/identity/auth/google`
*   **Method**: `POST`
*   **Auth Required**: No (Public)
*   **Request Body**:
    ```json
    {
      "idToken": "string (Google id_token)"
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
      "sessionToken": "string (JWT)",
      "userId": "uuid",
      "nombre": "string",
      "correo": "string",
      "urlFoto": "string (url)"
    }
    ```
*   **Error Responses**:
    *   **401 Unauthorized**: Invalid or expired Google token.
    *   **400 Bad Request**: Malformed JSON or missing fields.

---

### 2. Logout
Invalidate the current session.

*   **URL**: `/api/v1/identity/auth/logout`
*   **Method**: `POST`
*   **Auth Required**: Yes (Bearer Token)
*   **Success Response (204 No Content)**: Empty body.
