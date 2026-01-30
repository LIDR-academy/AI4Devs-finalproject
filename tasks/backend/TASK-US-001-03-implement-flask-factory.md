# TASK-US-001-03: Implement Flask Factory

## Parent User Story
[US-001: Project Setup and Configuration](../../user-stories/backend/US-001-project-setup-configuration.md)

## Description
Implement the Flask application factory pattern in `core/__init__.py` following the IAM-gateway structure. This includes initializing extensions, registering blueprints, and setting up error handlers.

## Priority
🔴 Critical

## Estimated Time
2 hours

## Detailed Steps

### 1. Create core/__init__.py
```python
"""Flask application factory and extensions initialization."""

from flask import Flask
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from sqlmodel import SQLModel

from config.validate_config import validate_env_config
from server.config.logs import configure_logging

# Initialize extensions
limiter = Limiter(key_func=get_remote_address)
db_engine = None


def create_app(settings_module="config.development") -> Flask:
    """Create and configure the Flask application.
    
    Args:
        settings_module: The configuration module to load.
        
    Returns:
        Flask: Configured Flask application.
    """
    app = Flask(
        __name__,
        static_url_path="/static",
        static_folder="../static",
        instance_relative_config=True,
    )
    
    # Load configuration
    app.config.from_object(settings_module)
    
    # Validate configuration
    validate_env_config(app.config)
    
    # Configure logging
    configure_logging(app)
    
    # Initialize extensions
    init_extensions(app)
    
    # Register blueprints
    register_blueprints(app)
    
    # Register error handlers
    register_error_handlers(app)
    
    app.logger.info(f"Application initialized with {settings_module}")
    
    return app


def init_extensions(app: Flask) -> None:
    """Initialize Flask extensions."""
    global db_engine
    
    # CORS
    CORS(app, origins=app.config.get("ALLOWED_ORIGINS", "*"))
    
    # Rate Limiter
    limiter.init_app(app)
    
    # Database
    from sqlmodel import create_engine
    db_engine = create_engine(
        app.config["DATABASE_URL"],
        echo=app.config.get("SQLALCHEMY_ECHO", False),
        pool_pre_ping=True,
    )
    
    app.logger.info("Extensions initialized")


def register_blueprints(app: Flask) -> None:
    """Register all application blueprints."""
    from core.users import users_bp
    from core.files import files_bp
    
    app.register_blueprint(users_bp)
    app.register_blueprint(files_bp)
    
    # Swagger documentation
    from flasgger import Swagger
    Swagger(app)
    
    app.logger.info("Blueprints registered")


def register_error_handlers(app: Flask) -> None:
    """Register custom error handlers."""
    from core.common.exceptions import (
        APIException,
        AuthenticationError,
        AuthorizationError,
        NotFoundError,
        ValidationError,
    )
    
    @app.errorhandler(APIException)
    def handle_api_exception(error):
        return error.to_dict(), error.status_code
    
    @app.errorhandler(404)
    def handle_not_found(error):
        return {"status": 404, "message": "Resource not found"}, 404
    
    @app.errorhandler(500)
    def handle_internal_error(error):
        app.logger.error(f"Internal error: {error}")
        return {"status": 500, "message": "Internal server error"}, 500
    
    @app.errorhandler(429)
    def handle_rate_limit(error):
        return {"status": 429, "message": "Rate limit exceeded"}, 429
    
    app.logger.info("Error handlers registered")


def get_engine():
    """Get the database engine."""
    return db_engine
```

### 2. Create application.py Entry Point
```python
"""Application entry point."""

import os

from core import create_app

settings_module = os.getenv("APP_SETTINGS_MODULE", "config.development")
app = create_app(settings_module)

if __name__ == "__main__":
    app.run(
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 5000)),
        debug=os.getenv("APP_DEBUG", "False").lower() == "true",
    )
```

## Acceptance Criteria
- [ ] `core/__init__.py` implements app factory pattern
- [ ] Extensions are initialized properly
- [ ] Blueprints are registered
- [ ] Error handlers are configured
- [ ] Application can start without errors

## Notes
- Follow the IAM-gateway pattern for consistency
- Ensure all extensions are properly initialized before use
- Log important initialization steps for debugging

## Completion Status
- [ ] 0% - Not Started
