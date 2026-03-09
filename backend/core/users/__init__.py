"""Users blueprint package."""

from flask import Blueprint

from core.users.models import User

users_bp = Blueprint("users", __name__, url_prefix="/api/v1/users")

from .routes.admin import register_routes as register_admin_routes
from .routes.register import register_routes as register_register_routes
from .routes.renew import register_routes as register_renew_routes
from .routes.status import register_routes as register_status_routes

register_register_routes(users_bp)
register_status_routes(users_bp)
register_renew_routes(users_bp)
register_admin_routes(users_bp)

__all__ = ["users_bp", "User"]

