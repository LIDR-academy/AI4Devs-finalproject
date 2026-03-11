# SEPE Templates Comparator - Backend

Backend API for the SEPE Templates Comparator application, built with FastAPI and SQLAlchemy.

## Features

- **FastAPI Framework**: Modern, fast web framework for building APIs
- **SQLAlchemy ORM**: Powerful database ORM with PostgreSQL support
- **Authentication**: JWT-based authentication system
- **PDF Processing**: Extract and compare AcroForm fields from PDF documents
- **Template Management**: Upload, catalog, and version PDF templates
- **Comparison Engine**: Compare template structures and track differences
- **Background Tasks**: Celery integration for async processing
- **API Documentation**: Automatic OpenAPI/Swagger documentation

## Quick Start

### Prerequisites

- Python 3.10 or higher
- PostgreSQL 12 or higher
- Redis (for background tasks)

### Installation

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt  # For development
   ```

3. **Environment configuration:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup:**
   ```bash
   # Create database
   createdb sepe_comparator
   
   # Run migrations
   alembic upgrade head
   ```

5. **Start the development server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

The API will be available at `http://localhost:8000`

## API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Project Structure

```
backend/
├── app/                    # Application package
│   ├── api/               # API routes
│   │   └── v1/           # API version 1
│   ├── core/             # Core functionality
│   │   ├── config.py     # Configuration settings
│   │   ├── database.py   # Database setup
│   │   └── exceptions.py # Custom exceptions
│   ├── models/           # SQLAlchemy models
│   │   ├── user.py       # User model
│   │   ├── template.py   # Template models
│   │   └── comparison.py # Comparison models
│   ├── services/         # Business logic
│   ├── utils/           # Utility functions
│   └── main.py          # FastAPI application
├── tests/               # Test suite
├── migrations/          # Alembic migrations
├── requirements.txt     # Production dependencies
├── requirements-dev.txt # Development dependencies
└── pyproject.toml      # Project configuration
```

## Development

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_main.py

# Run tests with specific marker
pytest -m unit
```

### Code Quality

```bash
# Format code
black app tests

# Sort imports
isort app tests

# Lint code
flake8 app tests

# Type checking
mypy app
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Downgrade migration
alembic downgrade -1
```

### Pre-commit Hooks

```bash
# Install pre-commit hooks
pre-commit install

# Run hooks manually
pre-commit run --all-files
```

## Environment Variables

Key environment variables (see `env.example` for complete list):

- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Application secret key
- `JWT_SECRET_KEY`: JWT signing key
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `DEBUG`: Enable debug mode (true/false)
- `LOG_LEVEL`: Logging level (DEBUG, INFO, WARNING, ERROR)

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### Templates
- `GET /api/v1/templates/` - List templates
- `POST /api/v1/templates/` - Upload template
- `GET /api/v1/templates/{id}` - Get template details

### Comparisons
- `GET /api/v1/comparisons/` - List comparisons
- `POST /api/v1/comparisons/` - Create comparison
- `GET /api/v1/comparisons/{id}` - Get comparison results

### System
- `GET /api/v1/health` - Health check
- `GET /api/v1/info` - System information

## Contributing

1. Follow the established code style (Black, isort, flake8)
2. Write tests for new functionality
3. Update documentation as needed
4. Use conventional commit messages
5. Ensure all tests pass before submitting

## License

MIT License - see LICENSE file for details.
