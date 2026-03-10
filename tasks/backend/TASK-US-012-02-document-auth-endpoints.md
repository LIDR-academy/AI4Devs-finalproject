# TASK-US-012-02: Document Auth Endpoints

[Trello Card](https://trello.com/c/7I42enOc)

[Pull Request](https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/pull/12)

## Parent User Story
[US-012: API Documentation with Swagger](../../user-stories/backend/US-012-api-documentation.md)

## Description
Add Flasgger YAML docstrings to all authentication and user-management route functions (`register`, `status` POST/GET, `renew`, `revoke`). Each docstring must include the endpoint summary, description, request body or parameters, response schemas for all possible HTTP status codes, the `ApiKeyAuth` security requirement, and the appropriate tag.

## Priority
🟡 Medium

## Estimated Time
1 hour

## Detailed Steps

### 1. Document the user registration endpoint
`backend/core/users/routes/register.py` — `POST /api/v1/users/register`
```python
def register():
    """Register a new user and receive an API key.
    ---
    tags:
      - Users
    summary: Register a new user
    description: >
      Creates a new user account with the provided email and password.
      Returns the generated API key on success.
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - password
          properties:
            email:
              type: string
              format: email
              example: user@example.com
            password:
              type: string
              minLength: 8
              example: S3cur3P@ssw0rd
    responses:
      201:
        description: User registered successfully
        schema:
          type: object
          properties:
            status:
              type: integer
              example: 201
            message:
              type: string
              example: User registered successfully
            data:
              type: object
              properties:
                api_key:
                  type: string
                  example: ipfs_gw_abc123...
      400:
        description: Validation error (missing fields or invalid format)
      409:
        description: Email already registered
    security: []
    """
```

### 2. Document the API key status endpoints
`backend/core/users/routes/status.py` — `GET /api/v1/users/status` and `POST /api/v1/users/status`
```python
def get_status():
    """Health probe for the user service.
    ---
    tags:
      - Health
    summary: Service liveness check
    responses:
      200:
        description: Service is active
        schema:
          type: object
          properties:
            status:
              type: string
              example: active
    security: []
    """

def post_status():
    """Retrieve API key status.
    ---
    tags:
      - Users
    summary: Get API key status
    description: Returns the current status, usage count, and timestamps for the authenticated API key.
    responses:
      200:
        description: API key status retrieved
        schema:
          type: object
          properties:
            status:
              type: integer
              example: 200
            message:
              type: string
              example: API key status retrieved
            data:
              type: object
              properties:
                api_key_status:
                  type: string
                  example: active
                usage_count:
                  type: integer
                  example: 42
                created_at:
                  type: string
                  format: date-time
                last_renewed_at:
                  type: string
                  format: date-time
                  nullable: true
      401:
        description: Invalid or missing API key
    security:
      - ApiKeyAuth: []
    """
```

### 3. Document the API key renew endpoint
`backend/core/users/routes/renew.py` — `POST /api/v1/users/renew`
```python
def renew():
    """Renew (rotate) the API key.
    ---
    tags:
      - Users
    summary: Rotate API key
    description: Generates a new API key and invalidates the old one. The new key is returned in the response.
    responses:
      200:
        description: API key renewed
        schema:
          type: object
          properties:
            status:
              type: integer
              example: 200
            message:
              type: string
              example: API key renewed successfully
            data:
              type: object
              properties:
                api_key:
                  type: string
                  example: ipfs_gw_new_abc456...
      401:
        description: Invalid or missing API key
    security:
      - ApiKeyAuth: []
    """
```

### 4. Document the API key revoke endpoint
`backend/core/users/routes/revoke.py` — `POST /api/v1/users/revoke`
```python
def revoke():
    """Revoke the API key.
    ---
    tags:
      - Users
    summary: Revoke API key
    description: Permanently deactivates the current API key. The account is disabled and a new key must be requested via an admin.
    responses:
      200:
        description: API key revoked successfully
      401:
        description: Invalid or missing API key
    security:
      - ApiKeyAuth: []
    """
```

### 5. Verify in Swagger UI
Start the server and open `/swagger`. Confirm all four endpoints appear under the **Users** and **Health** tags with correct request/response schemas and an active **Authorize** button.

## Acceptance Criteria
- [x] All user-management route functions contain a Flasgger-compatible YAML docstring
- [x] Each docstring has at minimum: `tags`, `summary`, `responses` (including error codes), and `security`
- [x] The `register` endpoint is documented as requiring no authentication (`security: []`)
- [x] `POST /status`, `renew`, and `revoke` are documented with `ApiKeyAuth` security
- [x] Swagger UI renders all four endpoints without errors
- [x] No existing tests are broken

## Notes
- Keep docstrings concise — Flasgger parses the YAML block between the opening `---` and the end of the docstring.
- Reusable schema definitions added in TASK-US-012-05 can be referenced with `$ref: '#/definitions/UserStatusResponse'` once they exist.
- For `POST /status` versus `GET /status`, ensure both HTTP methods are shown separately in the UI.

## Completion Status
- [x] 100% - Completed
