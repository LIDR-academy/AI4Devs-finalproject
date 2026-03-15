# TASK-US-001-02: Configure Dependencies

## Parent User Story
[US-001: Project Setup and Configuration](../../user-stories/backend/US-001-project-setup-configuration.md)

## Description
Create the `pyproject.toml` file with all required dependencies and configure the uv package manager. Generate a `requirements.txt` for compatibility.

## Priority
🔴 Critical

## Estimated Time
1 hour

## Detailed Steps

### 1. Create pyproject.toml
The file should include:
- Project metadata
- All production dependencies with pinned versions
- Development dependencies
- Tool configurations (pytest, black, isort, mypy)

### 2. Core Dependencies
```toml
[project]
dependencies = [
    # Web Framework
    "flask>=3.0.0,<4.0.0",
    "flask-cors>=4.0.0,<5.0.0",
    "gunicorn>=21.0.0,<23.0.0",
    "werkzeug>=3.0.0,<4.0.0",
    
    # Database
    "sqlmodel>=0.0.16,<1.0.0",
    "sqlalchemy>=2.0.0,<3.0.0",
    "psycopg2-binary>=2.9.9,<3.0.0",
    "alembic>=1.13.0,<2.0.0",
    
    # Task Queue
    "celery>=5.3.0,<6.0.0",
    "redis>=5.0.0,<6.0.0",
    
    # Configuration
    "python-dotenv>=1.0.0,<2.0.0",
    "pydantic>=2.5.0,<3.0.0",
    "pydantic-settings>=2.1.0,<3.0.0",
    
    # IPFS/S3
    "boto3>=1.34.0,<2.0.0",
    
    # Resilience
    "pybreaker>=1.0.0,<2.0.0",
    "tenacity>=8.2.0,<9.0.0",
    
    # Async
    "aiohttp>=3.9.0,<4.0.0",
    "httpx>=0.26.0,<1.0.0",
    
    # Security
    "passlib[bcrypt]>=1.7.4,<2.0.0",
    "email-validator>=2.1.0,<3.0.0",
    
    # API Documentation
    "flasgger>=0.9.7,<1.0.0",
    
    # Rate Limiting
    "flask-limiter>=3.5.0,<4.0.0",
    
    # Utilities
    "python-multipart>=0.0.6,<1.0.0",
    "arrow>=1.3.0,<2.0.0",
]
```

### 3. Development Dependencies
```toml
[project.optional-dependencies]
dev = [
    "pytest>=7.4.0,<8.0.0",
    "pytest-cov>=4.1.0,<5.0.0",
    "pytest-asyncio>=0.23.0,<1.0.0",
    "coverage>=7.3.0,<8.0.0",
    "faker>=22.0.0,<23.0.0",
    "vcrpy>=5.1.0,<6.0.0",
    "pytest-vcr>=1.0.2,<2.0.0",
    "black>=23.12.0,<24.0.0",
    "isort>=5.13.0,<6.0.0",
    "flake8>=7.0.0,<8.0.0",
    "mypy>=1.8.0,<2.0.0",
    "pre-commit>=3.6.0,<4.0.0",
    "bandit>=1.7.0,<2.0.0",
    "factory-boy>=3.3.0,<4.0.0",
]
```

### 4. Initialize uv Environment
```bash
cd backend
uv venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
uv pip install -e ".[dev]"
```

### 5. Generate requirements.txt
```bash
uv pip freeze > requirements.txt
```

## Acceptance Criteria
- [ ] `pyproject.toml` exists with all dependencies
- [ ] All versions are pinned to specific ranges
- [ ] Virtual environment is created in `backend/.venv/`
- [ ] `requirements.txt` is generated
- [ ] All packages install successfully

## Notes
- Use version ranges like `>=X.Y.Z,<X+1.0.0` for stability
- Separate production and development dependencies
- Include tool configurations in pyproject.toml

## Completion Status
- [ ] 0% - Not Started
