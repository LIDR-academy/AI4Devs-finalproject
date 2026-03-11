"""Flask application factory and extension wiring."""

from __future__ import annotations

from importlib import import_module
from types import ModuleType
from typing import Any

from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from config.validate_config import validate_env_config
from core.common.exceptions import APIException
from server.config.logs import configure_logging

limiter = Limiter(key_func=get_remote_address)
db_engine = None


def _resolve_settings(settings_module: str | type[Any] | ModuleType) -> Any:
	"""Resolve a config object from dotted path, class, or module."""
	if isinstance(settings_module, str):
		module_path, _, attr = settings_module.rpartition(".")
		if module_path and attr:
			module = import_module(module_path)
			return getattr(module, attr)
		return import_module(settings_module)
	return settings_module


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
	register_blueprints(app)
	register_error_handlers(app)

	app.logger.info("Application initialized successfully")
	return app


def init_extensions(app: Flask) -> None:
	"""Initialize app extensions and database engine."""
	global db_engine

	CORS(app, origins=app.config.get("ALLOWED_ORIGINS", "*"))
	limiter.init_app(app)

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


def register_blueprints(app: Flask) -> None:
	"""Register all API blueprints."""
	from core.files import files_bp
	from core.tasks.routes import create_tasks_blueprint
	from core.users import users_bp

	app.register_blueprint(users_bp)
	app.register_blueprint(files_bp)
	app.register_blueprint(create_tasks_blueprint())

	try:
		from flasgger import Swagger

		Swagger(app)
	except Exception:
		app.logger.warning("Flasgger not available; Swagger docs disabled")


def register_error_handlers(app: Flask) -> None:
	"""Register global error handlers."""

	@app.errorhandler(APIException)
	def handle_api_exception(error: APIException):
		return jsonify(error.to_dict()), error.status_code

	@app.errorhandler(404)
	def handle_not_found(_error):
		return jsonify({"status": 404, "message": "Resource not found"}), 404

	@app.errorhandler(429)
	def handle_rate_limit(_error):
		return jsonify({"status": 429, "message": "Rate limit exceeded"}), 429

	@app.errorhandler(500)
	def handle_internal_error(error):
		app.logger.exception("Internal server error: %s", error)
		return jsonify({"status": 500, "message": "Internal server error"}), 500


def get_engine():
	"""Return the SQLModel engine initialized by the app factory."""
	return db_engine
