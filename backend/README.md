# Backend Service

Backend foundation for the IPFS Gateway project.

## Local setup

```bash
uv venv .venv
source .venv/bin/activate
uv pip install -e ".[dev]"
cp .env.example .env
python application.py
```

## Tests

```bash
python -m unittest discover -s ../tests/backend -p "test_*.py"
```

