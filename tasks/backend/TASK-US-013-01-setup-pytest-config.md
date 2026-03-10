# TASK-US-013-01: Setup pytest configuration

[Trello Card](https://trello.com/c/VrfEYoNx)

## Parent User Story
[US-013: Backend Testing Suite](../../user-stories/backend/US-013-backend-testing.md)

## Description
Configure pytest as the primary test framework for the backend. Set up `pyproject.toml` (or `pytest.ini`) with proper test discovery paths, environment markers, and database isolation settings. Ensure the configuration supports running unit tests independently from e2e tests and integrates cleanly with CI/CD.

## Priority
🟠 **High** - Foundation for all other testing tasks.

## Estimated Time
1 hour

## Detailed Steps

### 1. Add pytest and plugins to dependencies
Add the following to `backend/requirements.txt` (or `pyproject.toml` under `[project.optional-dependencies]`):
```
pytest>=8.0
pytest-cov>=5.0
faker>=24.0
factory-boy>=3.3
vcrpy>=6.0
```

### 2. Create/update `pyproject.toml` at the project root
```toml
[tool.pytest.ini_options]
testpaths = ["tests/backend"]
python_files = "test_*.py"
python_classes = "Test*"
python_functions = "test_*"
markers = [
    "unit: pure unit tests (no I/O)",
    "e2e: end-to-end tests that hit real external services",
    "slow: tests that take more than 1 second",
]
addopts = "-v --tb=short"
```

### 3. Ensure `tests/backend/` directory structure exists
Create the required `__init__.py` files and subdirectories:
```
tests/backend/
├── __init__.py
├── conftest.py
├── factories/
│   ├── __init__.py
│   ├── user_factory.py
│   └── file_factory.py
├── cassettes/
│   └── .gitkeep
├── unit/
│   ├── __init__.py
│   └── (unit test files)
└── e2e/
    ├── __init__.py
    └── (e2e test files)
```

### 4. Configure environment separation
Ensure .env files are documented:
- `.env` — used by e2e tests (real Filebase S3 + Redis)
- `TestingConfig` in `backend/config/testing.py` — used by unit tests (in-memory SQLite, no external I/O)

### 5. Move existing tests into `unit/` subdirectory
Move all current test files from `tests/backend/test_*.py` into `tests/backend/unit/` to match the target structure. Update any imports in those files accordingly.

### 6. Verify test discovery
```bash
cd /PROJECTS/python/ipfs-saas-ai4devs
.venv/bin/python -m pytest tests/backend/unit/ -v --co
```
Confirm all previously passing tests are still discovered and pass.

## Acceptance Criteria
- [x] `pyproject.toml` contains a `[tool.pytest.ini_options]` section with correct `testpaths`, markers, and `addopts`
- [x] `pytest` can be run from the project root without additional arguments
- [x] Unit tests and e2e tests can be run independently using `-m unit` and `-m e2e` markers
- [x] All previously passing tests still pass after the reorganisation
- [x] `tests/backend/unit/` directory exists and contains the moved test files
- [x] `tests/backend/e2e/` and `tests/backend/factories/` directories exist with `__init__.py`

## Notes
- The existing test files use `unittest.TestCase`; pytest is fully compatible with `unittest`-style tests — no rewrite needed.
- Do not add `pytest.ini` if `pyproject.toml` already covers the configuration; avoid duplicate config files.
- Keep `TestingConfig` (SQLite in-memory, rate limiting disabled) as the config class for all unit tests.

## Completion Status
- [x] 100% - Completed
