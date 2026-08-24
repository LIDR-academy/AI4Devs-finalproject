"""
Guardrail: the ERP Gateway is the single entry point to the ERPs. No module
outside services/erp/ may import httpx directly or reference the ERP base
URL settings, or the isolation the gateway provides is meaningless.
"""

from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
ALLOWED_PREFIXES = (BACKEND_DIR / "services" / "erp", BACKEND_DIR / ".venv")
ALLOWED_FILES = (BACKEND_DIR / "core" / "settings.py",)
FORBIDDEN_TOKENS = ("import httpx", "ADMIN_API_URL", "PEOPLE_API_URL")


def _python_files():
   for path in BACKEND_DIR.rglob("*.py"):
      if any(str(path).startswith(str(prefix)) for prefix in ALLOWED_PREFIXES):
         continue
      if path in ALLOWED_FILES:
         continue
      if "/tests/" in str(path) or path.name.startswith("test_"):
         continue
      yield path


def test_no_direct_erp_transport_outside_gateway():
   offenders = []
   for path in _python_files():
      content = path.read_text(encoding="utf-8")
      for token in FORBIDDEN_TOKENS:
         if token in content:
            offenders.append(f"{path.relative_to(BACKEND_DIR)}: {token}")

   assert not offenders, "ERP access must go through services/erp/:\n" + "\n".join(offenders)
