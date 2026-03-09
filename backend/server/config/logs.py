"""Logging helpers for Flask application startup."""

from __future__ import annotations

import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path

from flask import Flask


def configure_logging(app: Flask) -> None:
	"""Configure file and stream logging for the application."""
	log_file = Path(app.config.get("LOG_FILE", "logs/app.log"))
	if not log_file.is_absolute():
		log_file = Path(app.root_path).parent / log_file

	log_file.parent.mkdir(parents=True, exist_ok=True)

	level_name = str(app.config.get("LOG_LEVEL", "INFO")).upper()
	level = getattr(logging, level_name, logging.INFO)

	formatter = logging.Formatter(
		"%(asctime)s %(levelname)s [%(name)s] %(message)s",
		"%Y-%m-%d %H:%M:%S",
	)

	file_handler = RotatingFileHandler(log_file, maxBytes=2 * 1024 * 1024, backupCount=5)
	file_handler.setLevel(level)
	file_handler.setFormatter(formatter)

	stream_handler = logging.StreamHandler()
	stream_handler.setLevel(level)
	stream_handler.setFormatter(formatter)

	for handler in list(app.logger.handlers):
		handler.close()
		app.logger.removeHandler(handler)
	app.logger.setLevel(level)
	app.logger.addHandler(file_handler)
	app.logger.addHandler(stream_handler)
	app.logger.propagate = False

