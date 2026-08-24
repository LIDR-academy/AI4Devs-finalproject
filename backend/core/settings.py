"""
Django settings for the EyeMaster V2 backend.

Configuration is environment-driven per the redefined connectivity spec
(readme.md §2, documentacion-funcional.md §5.3): no secrets in code, and the
ERP webservice mode/URLs/tokens live here as env vars.
"""

import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def env(name, default=None, required=False):
   value = os.environ.get(name, default)
   if required and not value:
      raise RuntimeError(f"Missing required environment variable: {name}")
   return value


def env_bool(name, default=False):
   value = os.environ.get(name)
   if value is None:
      return default
   return value.strip().lower() in ("1", "true", "yes", "on")


SECRET_KEY = env("SECRET_KEY", default="django-insecure-dev-only-change-me")
DEBUG = env_bool("DEBUG", default=True)
ALLOWED_HOSTS = [h for h in env("ALLOWED_HOSTS", default="localhost,127.0.0.1").split(",") if h]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "apps.accounts",
    "apps.auditoria",
    "apps.clientes",
    "apps.empresas",
    "apps.comercial",
    "apps.financiero",
    "apps.reportes",
]

AUTH_USER_MODEL = "accounts.User"

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# Only the frontend origin is authorized (readme.md §2.5 "CORS configured").
CORS_ALLOWED_ORIGINS = [
   origin.strip()
   for origin in env("CORS_ALLOWED_ORIGINS", default="http://localhost:5173").split(",")
   if origin.strip()
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"

# --- Database ---------------------------------------------------------
# EyeMaster's own PostgreSQL (own data + ERP financial cache). Never the
# ERPs themselves — those are reached only through the ERP Gateway.

DATABASE_URL = env("DATABASE_URL")

if DATABASE_URL:
   import urllib.parse

   parsed = urllib.parse.urlparse(DATABASE_URL)
   DATABASES = {
      "default": {
         "ENGINE": "django.db.backends.postgresql",
         "NAME": parsed.path.lstrip("/"),
         "USER": parsed.username,
         "PASSWORD": parsed.password,
         "HOST": parsed.hostname,
         "PORT": parsed.port or 5432,
      }
   }
else:
   DATABASES = {
      "default": {
         "ENGINE": "django.db.backends.sqlite3",
         "NAME": BASE_DIR / "db.sqlite3",
      }
   }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- REST Framework / JWT ---------------------------------------------

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}

# --- ERP connectivity (webservices, simulated until real WS exist) ----
# See readme.md §2 and openspec/changes/add-erp-gateway.

ERP_MODE = env("ERP_MODE", default="mock")
ADMIN_API_URL = env("ADMIN_API_URL")
ADMIN_API_TOKEN = env("ADMIN_API_TOKEN")
PEOPLE_API_URL = env("PEOPLE_API_URL")
PEOPLE_API_TOKEN = env("PEOPLE_API_TOKEN")
ERP_HTTP_TIMEOUT_SECONDS = float(env("ERP_HTTP_TIMEOUT_SECONDS", default="5"))
ERP_HTTP_MAX_RETRIES = int(env("ERP_HTTP_MAX_RETRIES", default="2"))
ERP_CIRCUIT_BREAKER_THRESHOLD = int(env("ERP_CIRCUIT_BREAKER_THRESHOLD", default="5"))
ERP_CIRCUIT_BREAKER_COOLDOWN_SECONDS = float(
   env("ERP_CIRCUIT_BREAKER_COOLDOWN_SECONDS", default="30")
)

if ERP_MODE == "real":
   missing = [
      name
      for name, value in (
         ("ADMIN_API_URL", ADMIN_API_URL),
         ("ADMIN_API_TOKEN", ADMIN_API_TOKEN),
         ("PEOPLE_API_URL", PEOPLE_API_URL),
         ("PEOPLE_API_TOKEN", PEOPLE_API_TOKEN),
      )
      if not value
   ]
   if missing:
      raise RuntimeError(
         f"ERP_MODE=real requires the following environment variables: {', '.join(missing)}"
      )
