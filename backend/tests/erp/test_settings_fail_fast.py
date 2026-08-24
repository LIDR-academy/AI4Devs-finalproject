import os
import subprocess
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[2]


def test_erp_mode_real_without_config_fails_fast():
   env = {
      **os.environ,
      "ERP_MODE": "real",
      "SECRET_KEY": "test",
      "DJANGO_SETTINGS_MODULE": "core.settings",
      "ADMIN_API_URL": "",
      "ADMIN_API_TOKEN": "",
      "PEOPLE_API_URL": "",
      "PEOPLE_API_TOKEN": "",
   }
   result = subprocess.run(
      [sys.executable, "-c", "import django; django.setup()"],
      cwd=BACKEND_DIR,
      env=env,
      capture_output=True,
      text=True,
   )
   assert result.returncode != 0
   assert "ERP_MODE=real requires" in result.stderr


def test_erp_mode_mock_boots_without_erp_config():
   env = {
      **os.environ,
      "ERP_MODE": "mock",
      "SECRET_KEY": "test",
      "DJANGO_SETTINGS_MODULE": "core.settings",
      "ADMIN_API_URL": "",
      "ADMIN_API_TOKEN": "",
      "PEOPLE_API_URL": "",
      "PEOPLE_API_TOKEN": "",
   }
   result = subprocess.run(
      [sys.executable, "-c", "import django; django.setup()"],
      cwd=BACKEND_DIR,
      env=env,
      capture_output=True,
      text=True,
   )
   assert result.returncode == 0, result.stderr
