# TASK-US-012-04: Document Admin Endpoints

[Trello Card](https://trello.com/c/AT4yMiuH)

[Pull Request](https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/pull/12)

## Parent User Story
[US-012: API Documentation with Swagger](../../user-stories/backend/US-012-api-documentation.md)

## Description
Add Flasgger YAML docstrings to all admin-only route functions: audit log listing (`GET /api/v1/admin/audit-logs`) and admin user management endpoints (list users, deactivate, reactivate). Docstrings must document the admin API key security requirement, pagination query parameters, and admin-specific response schemas.

## Priority
🟡 Medium

## Estimated Time
45 minutes

## Detailed Steps

### 1. Document the audit logs endpoint
`backend/core/admin/routes/audit_logs.py` (or equivalent) — `GET /api/v1/admin/audit-logs`
```python
def list_audit_logs():
    """List audit log entries (admin only).
    ---
    tags:
      - Admin
    summary: List audit logs
    description: >
      Returns a paginated list of audit log entries. Requires an admin API key.
      Supports filtering by `user_id`, `action`, and date range via query parameters.
    parameters:
      - in: query
        name: page
        type: integer
        default: 1
        description: Page number (1-based)
      - in: query
        name: per_page
        type: integer
        default: 50
        description: Number of entries per page (max 200)
      - in: query
        name: user_id
        type: integer
        required: false
        description: Filter by user ID
      - in: query
        name: action
        type: string
        required: false
        description: Filter by action type (e.g. UPLOAD, RETRIEVE, REGISTER)
      - in: query
        name: from_date
        type: string
        format: date-time
        required: false
        description: Start of date range (ISO 8601)
      - in: query
        name: to_date
        type: string
        format: date-time
        required: false
        description: End of date range (ISO 8601)
    responses:
      200:
        description: Paginated audit log entries
        schema:
          type: object
          properties:
            status:
              type: integer
              example: 200
            data:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: integer
                  user_id:
                    type: integer
                  action:
                    type: string
                    example: UPLOAD
                  details:
                    type: string
                  created_at:
                    type: string
                    format: date-time
            meta:
              type: object
              properties:
                page:
                  type: integer
                per_page:
                  type: integer
                total:
                  type: integer
      401:
        description: Invalid or missing API key
      403:
        description: Admin privileges required
    security:
      - ApiKeyAuth: []
    """
```

### 2. Document the list users endpoint
`backend/core/admin/routes/users.py` (or equivalent) — `GET /api/v1/admin/users`
```python
def list_users():
    """List all registered users (admin only).
    ---
    tags:
      - Admin
    summary: List users
    description: Returns a paginated list of all users. Requires an admin API key.
    parameters:
      - in: query
        name: page
        type: integer
        default: 1
      - in: query
        name: per_page
        type: integer
        default: 50
      - in: query
        name: is_active
        type: boolean
        required: false
        description: Filter by active/inactive status
    responses:
      200:
        description: Paginated user list
        schema:
          type: object
          properties:
            status:
              type: integer
              example: 200
            data:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: integer
                  email:
                    type: string
                  is_active:
                    type: boolean
                  is_admin:
                    type: boolean
                  usage_count:
                    type: integer
                  created_at:
                    type: string
                    format: date-time
      401:
        description: Invalid or missing API key
      403:
        description: Admin privileges required
    security:
      - ApiKeyAuth: []
    """
```

### 3. Document the deactivate and reactivate user endpoints
`backend/core/admin/routes/users.py` — `POST /api/v1/admin/users/<id>/deactivate` and `POST /api/v1/admin/users/<id>/reactivate`
```python
def deactivate_user(user_id):
    """Deactivate a user account (admin only).
    ---
    tags:
      - Admin
    summary: Deactivate user
    parameters:
      - in: path
        name: user_id
        type: integer
        required: true
    responses:
      200:
        description: User deactivated successfully
      401:
        description: Invalid or missing API key
      403:
        description: Admin privileges required
      404:
        description: User not found
    security:
      - ApiKeyAuth: []
    """

def reactivate_user(user_id):
    """Reactivate a deactivated user account (admin only).
    ---
    tags:
      - Admin
    summary: Reactivate user
    parameters:
      - in: path
        name: user_id
        type: integer
        required: true
    responses:
      200:
        description: User reactivated successfully
      401:
        description: Invalid or missing API key
      403:
        description: Admin privileges required
      404:
        description: User not found
    security:
      - ApiKeyAuth: []
    """
```

### 4. Verify in Swagger UI
Open `/swagger` and navigate to the **Admin** tag. Confirm:
- All admin routes are listed with a clear note that `ApiKeyAuth` is required.
- Pagination parameters appear consistently across list endpoints.
- 401 and 403 responses are documented on every admin endpoint.

## Acceptance Criteria
- [x] `GET /api/v1/users/admin/audit-logs` docstring documents pagination params and paginated response schema
- [x] Existing admin revoke/reactivate endpoints are documented
- [x] All current admin endpoints are grouped under the `Admin` tag in Swagger UI
- [x] All admin endpoints show `ApiKeyAuth` as required and include 401 and 403 response codes
- [x] No existing tests are broken

## Notes
- If some admin routes are not yet implemented (e.g. US-010 is still in progress), add the Flasgger docstring as a placeholder comment — the spec will be generated even for not-yet-wired routes.
- Admin pagination `meta` field shape should match the standard used by the `build_success_payload` helper from `core/common/responses.py` (US-011).
- Cross-reference with US-010 (Audit Logging) and US-013 (Backend Testing) when filling in exact route paths.

## Completion Status
- [x] 100% - Completed
