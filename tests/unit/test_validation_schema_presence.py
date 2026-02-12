def test_validationreport_schema_exists():
    """
    RED test: ValidationReport Pydantic schema must exist in src.backend.schemas

    This test intentionally IMPORTS the module object from file and then
    attempts to import the symbol `ValidationReport` from the module name
    `src.backend.schemas`. The goal is that the module exists but the symbol
    does not, causing an ImportError (not ModuleNotFoundError).
    """
    import importlib.util
    import sys
    from pathlib import Path

    # Locate the schemas.py file and load it into sys.modules under the
    # package name we expect so that `from src.backend.schemas import ...`
    # will resolve the module but fail importing the missing symbol.
    repo_root = Path.cwd()
    # support multiple possible locations inside the backend container
    candidate_paths = [
        repo_root / "src" / "backend" / "schemas.py",
        repo_root / "schemas.py",
        repo_root / "src" / "schemas.py",
    ]
    schemas_path = None
    for p in candidate_paths:
        if p.exists():
            schemas_path = p
            break
    assert schemas_path is not None, f"Expected schemas.py in one of {candidate_paths}"

    spec = importlib.util.spec_from_file_location("src.backend.schemas", str(schemas_path))
    module = importlib.util.module_from_spec(spec)
    sys.modules["src.backend.schemas"] = module
    spec.loader.exec_module(module)

    # Now attempt to import the name; since ValidationReport is not defined
    # yet, this should raise ImportError and mark the test as failing (RED).
    from src.backend.schemas import ValidationReport  # noqa: F401
