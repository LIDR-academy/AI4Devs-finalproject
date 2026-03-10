# TASK-US-012-01: Configure Flasgger

[Trello Card](https://trello.com/c/jyEo4qlV)

[Pull Request](https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/pull/12)

## Parent User Story
[US-012: API Documentation with Swagger](../../user-stories/backend/US-012-api-documentation.md)

## Description
Install and configure Flasgger in the Flask application factory. Define the base OpenAPI 3.0 specification (title, version, description, security schemes), register the Swagger blueprint, and verify that the `/swagger` UI and `/swagger.json` export endpoints are accessible.

## Priority
🟡 Medium

## Estimated Time
1 hour

## Detailed Steps

### 1. Add Flasgger to dependencies
Add `flasgger` to `backend/requirements.txt` (or `pyproject.toml`):
```
flasgger>=0.9.7
```

### 2. Create the base Swagger configuration
Create or update `backend/config/swagger.py` with the OpenAPI 3.0 base template:
```python
"""Swagger / OpenAPI base configuration for Flasgger."""

SWAGGER_CONFIG = {
    "headers": [],
    "specs": [
        {
            "endpoint": "apispec",
            "route": "/swagger.json",
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/swagger",
}

SWAGGER_TEMPLATE = {
    "swagger": "2.0",
    "info": {
        "title": "IPFS Gateway API",
        "description": (
            "REST API for the decentralized IPFS file-storage gateway. "
            "Authenticate with an API key passed in the X-API-Key header."
        ),
        "version": "1.0.0",
        "contact": {
            "name": "IPFS Gateway Team",
        },
    },
    "basePath": "/api/v1",
    "schemes": ["http", "https"],
    "securityDefinitions": {
        "ApiKeyAuth": {
            "type": "apiKey",
            "in": "header",
            "name": "X-API-Key",
            "description": "API key issued during user registration.",
        }
    },
    "security": [{"ApiKeyAuth": []}],
    "consumes": ["application/json"],
    "produces": ["application/json"],
    "tags": [
        {"name": "Health", "description": "Service health checks"},
        {"name": "Users", "description": "User registration and API key management"},
        {"name": "Files", "description": "File upload and retrieval via IPFS"},
        {"name": "Tasks", "description": "Async task status polling"},
        {"name": "Admin", "description": "Admin-only operations"},
    ],
}
```

### 3. Register Flasgger in the Flask app factory
Update `backend/core/__init__.py` to initialise Flasgger after the app is created:
```python
from flasgger import Swagger
from config.swagger import SWAGGER_CONFIG, SWAGGER_TEMPLATE

def create_app(config_object=None):
    app = Flask(__name__)
    # ... existing setup ...

    Swagger(app, config=SWAGGER_CONFIG, template=SWAGGER_TEMPLATE)

    # ... blueprint registration ...
    return app
```

### 4. Smoke-test the endpoints
```bash
# Start the dev server
flask run

# Verify Swagger UI
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/swagger
# Expected: 200

# Verify OpenAPI JSON export
curl -s http://localhost:5000/swagger.json | python -m json.tool | head -20
# Expected: valid JSON with "swagger": "2.0" and correct info block
```

## Acceptance Criteria
- [x] `flasgger` is listed as a project dependency
- [x] `GET /swagger` returns HTTP 200 and renders the Swagger UI HTML page
- [x] `GET /swagger.json` returns a valid OpenAPI JSON document
- [x] The base spec contains the correct title (`IPFS Gateway API`), version (`v1`), and `ApiKeyAuth` security definition
- [x] No existing tests are broken after the change

## Notes
- Flasgger 0.9.x uses the Swagger 2.0 spec internally. OpenAPI 3.0 rewriting can be deferred to a separate task if needed.
- Keep `SWAGGER_TEMPLATE` and `SWAGGER_CONFIG` in a separate `config/swagger.py` file to avoid cluttering the app factory.
- The `/swagger` and `/swagger.json` routes should ideally be protected in production (e.g. behind an IP whitelist or Basic Auth middleware). Defer this to security hardening.

## Completion Status
- [x] 100% - Completed
