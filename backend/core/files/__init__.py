"""Files blueprint package."""

from flask import Blueprint

from core.files.models import File

files_bp = Blueprint("files", __name__, url_prefix="/api/v1/files")

from .routes.pinning import register_routes as register_pinning_routes
from .routes.retrieve import register_routes as register_retrieve_routes
from .routes.upload import register_routes as register_upload_routes

register_upload_routes(files_bp)
register_retrieve_routes(files_bp)
register_pinning_routes(files_bp)

__all__ = ["files_bp", "File"]

