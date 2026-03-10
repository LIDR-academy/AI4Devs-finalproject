"""Administrative user routes."""

from flask import Blueprint, jsonify

from core.auth.admin_guard import admin_required


def register_routes(bp: Blueprint) -> None:
	"""Register admin-only endpoint."""

	@bp.get("/admin")
	@admin_required
	def admin_status():
		return jsonify({"message": "Admin endpoint placeholder"}), 200

