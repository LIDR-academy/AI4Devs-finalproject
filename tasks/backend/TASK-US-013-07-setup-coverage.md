# TASK-US-013-07: Setup code coverage reporting

[Trello Card](https://trello.com/c/DcLNU2Ei)

[Pull Request](https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/pull/13)

## Parent User Story
[US-013: Backend Testing Suite](../../user-stories/backend/US-013-backend-testing.md)

## Description
Configure `coverage.py` (via the `pytest-cov` plugin) to measure and report code coverage across the backend. Set a minimum coverage threshold of 80%. Generate both a terminal summary report and an HTML report. Integrate the coverage gate into the CI/CD pipeline so that builds fail when coverage drops below the threshold.

## Priority
🟡 **Medium** - Final quality gate; depends on unit tests being complete.

## Estimated Time
1 hour

## Detailed Steps

### 1. Install `pytest-cov`
Add to `backend/requirements.txt`:
```
pytest-cov>=5.0.0
coverage[toml]>=7.0
```

### 2. Configure coverage in `.coveragerc`
```toml
[tool.coverage.run]
source = ["backend"]
omit = [
    "*/tests/*",
    "*/migrations/*",
    "*/config/*",
    "*/__init__.py",
    "*/celery_worker.py",    # entry-point script, not testable logic
]
branch = true                # measure branch coverage, not just line coverage

[tool.coverage.report]
show_missing = true
skip_covered = false
fail_under = 80              # CI will fail if overall coverage drops below 80%
exclude_lines = [
    "pragma: no cover",
    "if __name__ == .__main__.:",
    "raise NotImplementedError",
    "\\.\\.\\.",              # abstract method stubs
]

[tool.coverage.html]
directory = "htmlcov"

[tool.coverage.xml]
output = "coverage.xml"      # for CI badge / SonarQube integration
```

### 3. Keep `pytest` configuration in `pytest.ini`
```toml
[tool.pytest.ini_options]
addopts = "-v --tb=short --cov=backend --cov-report=term-missing --cov-report=html --cov-fail-under=80"
```
> **Note**: remove `--cov-fail-under` from `addopts` if you want to run tests without the coverage gate locally; use it only in CI via the command line flag instead.

### 4. Add a `Makefile` target (or CI script step)
```makefile
.PHONY: test coverage

test:
	.venv/bin/python -m pytest tests/backend/unit/ -v

coverage:
	.venv/bin/python -m pytest tests/backend/unit/ \
	    --cov=backend \
	    --cov-report=term-missing \
	    --cov-report=html \
	    --cov-fail-under=80
	@echo "HTML report: htmlcov/index.html"
```

### 5. Configure CI step (GitHub Actions)
In `.github/workflows/backend-tests.yml`, add:
```yaml
- name: Run tests with coverage
  run: |
    .venv/bin/python -m pytest tests/backend/unit/ \
      --cov=backend \
      --cov-report=xml \
      --cov-fail-under=80
  env:
    PYTHONPATH: backend

- name: Upload coverage report
  uses: actions/upload-artifact@v4
  with:
    name: backend-coverage-report
    path: |
      coverage.xml
      htmlcov/
```

### 6. Add `htmlcov/` and `coverage.xml` to `.gitignore`
```gitignore
htmlcov/
coverage.xml
.coverage
```

### 7. Run coverage report and verify threshold
```bash
.venv/bin/python -m pytest tests/backend/unit/ \
    --cov=backend \
    --cov-report=term-missing \
    --cov-fail-under=80
```
Review the terminal output; identify any modules below 80% and add targeted unit tests in TASK-US-013-04.

## Acceptance Criteria
- [x] `pytest-cov` and `coverage[toml]` are in `backend/requirements.txt`
- [x] `.coveragerc` defines `source`, `omit`, `branch = True`, and `fail_under = 80`
- [x] Running `coverage run -m unittest discover -s tests/backend/unit -p 'test_*.py'` and `coverage report` exits with code 0 (coverage ≥ 80%)
- [x] HTML report is generated in `htmlcov/` directory
- [x] `htmlcov/`, `coverage.xml`, and `.coverage` are listed in `.gitignore`
- [x] CI workflow includes a coverage step that fails the build when coverage < 80%
- [x] XML report (`coverage.xml`) and HTML report (`htmlcov/`) are exported as CI artifacts

## Notes
- Run `coverage report --show-missing` after any new test additions to check which lines are still uncovered.
- The 80% threshold applies to the overall project; individual modules may be lower as long as the aggregate meets the bar.
- Exclude auto-generated migration files, config files, and `__init__.py` boilerplate from coverage measurement.
- `branch = true` in `[tool.coverage.run]` measures whether both sides of each `if/else` branch are exercised, giving a more accurate picture than line coverage alone.

## Completion Status
- [x] 100% - Completed
