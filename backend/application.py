"""Application entry point for local execution and WSGI servers."""

from __future__ import annotations

import os

from core import create_app

settings_module = os.getenv("APP_SETTINGS_MODULE", "config.development.DevelopmentConfig")
app = create_app(settings_module)

if __name__ == "__main__":
	app.run(
		host=os.getenv("HOST", app.config.get("HOST", "0.0.0.0")),
		port=int(os.getenv("PORT", app.config.get("PORT", 5000))),
		debug=os.getenv("APP_DEBUG", str(app.config.get("DEBUG", False))).lower() == "true",
	)

