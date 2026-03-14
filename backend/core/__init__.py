"""Flask application factory and extension wiring."""

from __future__ import annotations

import re
from importlib import import_module
from types import ModuleType
from typing import Any
from uuid import uuid4

from flask import Flask, current_app, g, has_request_context, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.exceptions import RequestEntityTooLarge

from config.validate_config import validate_env_config
from config.swagger import SWAGGER_CONFIG, SWAGGER_TEMPLATE
from core.common.exceptions import APIException
from core.common.responses import build_error_payload
from server.config.logs import configure_logging

REQUEST_ID_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")


def resolve_rate_limit_key() -> str:
	"""Resolve a stable rate-limit key from API key or client IP."""
	api_key = request.headers.get("X-API-Key", "").strip()
	if api_key:
		return f"api:{api_key}"

	remote_address = get_remote_address()
	if remote_address:
		return f"ip:{remote_address}"
	return "anonymous"


limiter = Limiter(key_func=resolve_rate_limit_key)
db_engine = None


def configured_limit(config_key: str, fallback: str = "1000/hour"):
	"""Return a configured Flask-Limiter decorator for a route."""
	return limiter.limit(
		lambda: current_app.config.get(config_key, fallback),
		key_func=resolve_rate_limit_key,
	)


def _resolve_settings(settings_module: str | type[Any] | ModuleType) -> Any:
	"""Resolve a config object from dotted path, class, or module."""
	if isinstance(settings_module, str):
		module_path, _, attr = settings_module.rpartition(".")
		if module_path and attr:
			module = import_module(module_path)
			return getattr(module, attr)
		return import_module(settings_module)
	return settings_module


def _parse_allowed_origins(origins: Any) -> Any:
	"""Normalize configured CORS origins into a Flask-CORS friendly shape."""
	if isinstance(origins, str):
		cleaned = origins.strip()
		if cleaned == "*":
			return "*"
		return [item.strip() for item in cleaned.split(",") if item.strip()]
	return origins


def _sanitize_request_id(raw_request_id: str | None) -> str | None:
	"""Return a validated request ID header value when possible."""
	if raw_request_id is None:
		return None
	candidate = raw_request_id.strip()
	if candidate and REQUEST_ID_PATTERN.fullmatch(candidate):
		return candidate
	return None


def get_request_id() -> str | None:
	"""Return the current request ID when running inside a request context."""
	if not has_request_context():
		return None
	request_id = getattr(g, "request_id", None)
	if request_id is None:
		request_id = _sanitize_request_id(request.headers.get(current_app.config.get("REQUEST_ID_HEADER", "X-Request-ID"))) or uuid4().hex
		g.request_id = request_id
	return request_id


def _build_error_payload(status: int, message: str, code: str | None = None) -> dict[str, Any]:
	"""Backward-compatible proxy for the centralized error payload builder."""
	return build_error_payload(status, message, code=code)


def create_app(settings_module: str | type[Any] = "config.development.DevelopmentConfig") -> Flask:
	"""Create and configure a Flask application instance."""
	app = Flask(
		__name__,
		static_url_path="/static",
		static_folder="../static",
		instance_relative_config=True,
	)

	settings = _resolve_settings(settings_module)
	app.config.from_object(settings)

	validate_env_config(app.config)
	configure_logging(app)
	init_extensions(app)
	register_request_hooks(app)
	register_blueprints(app)
	register_error_handlers(app)

	app.logger.info("Application initialized successfully")
	return app


def init_extensions(app: Flask) -> None:
	"""Initialize app extensions and database engine."""
	global db_engine

	CORS(
		app,
		origins=_parse_allowed_origins(app.config.get("ALLOWED_ORIGINS", "*")),
		methods=app.config.get("CORS_METHODS", ["GET", "POST", "OPTIONS"]),
		allow_headers=app.config.get("CORS_ALLOW_HEADERS", ["Content-Type", "X-API-Key", "X-Request-ID"]),
		expose_headers=app.config.get(
			"CORS_EXPOSE_HEADERS",
			["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset", "Retry-After", "X-Request-ID"],
		),
		max_age=app.config.get("CORS_MAX_AGE", 3600),
		supports_credentials=app.config.get("CORS_SUPPORTS_CREDENTIALS", False),
	)
	limiter.init_app(app)

	try:
		from flasgger import Swagger

		Swagger(app, config=SWAGGER_CONFIG, template=SWAGGER_TEMPLATE)
	except Exception:
		app.logger.warning("Flasgger not available; Swagger docs disabled")

	from sqlmodel import create_engine

	database_url = app.config["DATABASE_URL"]
	engine_kwargs = {
		"echo": app.config.get("SQLALCHEMY_ECHO", False),
		"pool_pre_ping": True,
	}
	if database_url.startswith("sqlite"):
		engine_kwargs["connect_args"] = {"check_same_thread": False}
	else:
		engine_kwargs["pool_size"] = app.config.get("DB_POOL_SIZE", 5)
		engine_kwargs["max_overflow"] = app.config.get("DB_MAX_OVERFLOW", 10)

	db_engine = create_engine(database_url, **engine_kwargs)


def register_request_hooks(app: Flask) -> None:
	"""Register request tracing and response hardening hooks."""

	@app.before_request
	def assign_request_id() -> None:
		g.request_id = _sanitize_request_id(request.headers.get(app.config.get("REQUEST_ID_HEADER", "X-Request-ID"))) or uuid4().hex
		g.pending_audit_events = []

	@app.after_request
	def apply_security_headers(response):
		from core.services.audit_service import flush_pending_audit_logs

		request_id_header = app.config.get("REQUEST_ID_HEADER", "X-Request-ID")
		request_id = get_request_id()
		if request_id:
			response.headers.setdefault(request_id_header, request_id)

		header_pairs = {
			"X-Content-Type-Options": app.config.get("SECURITY_HEADER_X_CONTENT_TYPE_OPTIONS"),
			"X-Frame-Options": app.config.get("SECURITY_HEADER_X_FRAME_OPTIONS"),
			"Referrer-Policy": app.config.get("SECURITY_HEADER_REFERRER_POLICY"),
			"Content-Security-Policy": app.config.get("SECURITY_HEADER_CONTENT_SECURITY_POLICY"),
		}
		for header_name, header_value in header_pairs.items():
			if header_value:
				response.headers.setdefault(header_name, header_value)

		if response.status_code in {401, 403, 413, 429} or response.status_code >= 500:
			app.logger.warning(
				"Request completed with request_id=%s method=%s path=%s status=%s remote_addr=%s",
				request_id,
				request.method,
				request.path,
				response.status_code,
				request.remote_addr,
			)

		try:
			flush_pending_audit_logs()
		except Exception:
			app.logger.exception("Failed to flush deferred audit log events")

		return response


def register_blueprints(app: Flask) -> None:
	"""Register all API blueprints."""
	from core.files import files_bp
	from core.tasks.routes import create_tasks_blueprint
	from core.users import users_bp

	app.register_blueprint(users_bp)
	app.register_blueprint(files_bp)
	app.register_blueprint(create_tasks_blueprint())

	@app.route("/health")
	def health_check():
		"""Liveness probe used by Docker health checks and load balancers."""
		return jsonify({"status": "ok", "service": "ipfs-gateway-backend"}), 200


def register_error_handlers(app: Flask) -> None:
	"""Register global error handlers."""

	@app.errorhandler(APIException)
	def handle_api_exception(error: APIException):
		return jsonify(build_error_payload(error.status_code, error.message, code=error.code, details=error.details)), error.status_code

	@app.errorhandler(RequestEntityTooLarge)
	def handle_request_too_large(_error):
		return jsonify(_build_error_payload(413, "Request payload too large", "REQUEST_TOO_LARGE")), 413

	@app.errorhandler(404)
	def handle_not_found(_error):
		return jsonify(_build_error_payload(404, "Resource not found", "NOT_FOUND")), 404

	@app.errorhandler(429)
	def handle_rate_limit(_error):
		return jsonify(_build_error_payload(429, "Rate limit exceeded", "RATE_LIMIT_EXCEEDED")), 429

	@app.errorhandler(500)
	def handle_internal_error(error):
		app.logger.exception("Internal server error: %s", error)
		return jsonify(_build_error_payload(500, "Internal server error", "INTERNAL_ERROR")), 500


def get_engine():
	"""Return the SQLModel engine initialized by the app factory."""
	return db_engine
