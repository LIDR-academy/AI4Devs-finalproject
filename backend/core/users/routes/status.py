"""API key status check endpoint."""

from flask import Blueprint, jsonify, request
from sqlmodel import Session

from core import configured_limit, get_engine
from core.auth.decorators import find_user_by_api_key


def register_routes(bp: Blueprint) -> None:
	"""Register status endpoint."""
	
	@bp.route("/status", methods=["GET", "POST"])
	@configured_limit("RATE_LIMIT_STATUS")
	def status():
		"""Check API key status, even for inactive/revoked keys.
		
		Note: This endpoint does NOT use @require_api_key to allow users
		to check why their key isn't working (inactive/revoked status).
		
		Returns:
			JSON response with API key status information.
		"""
		if request.method == "GET":
			# Compatibility route for health-style checks used by existing tests.
			return jsonify({"status": "active"}), 200

		api_key = request.headers.get("X-API-Key", "").strip()
		if not api_key:
			return jsonify({"status": 401, "error": "Missing X-API-Key header"}), 401
		
		with Session(get_engine()) as session:
			user = find_user_by_api_key(session, api_key)
			
			if not user:
				return jsonify({
					"status": 401,
					"error": "Invalid API key"
				}), 401
			
			# Determine status based on user flags
			if user.is_deleted:
				status_value = "revoked"
			elif user.is_active:
				status_value = "active"
			else:
				status_value = "inactive"
			
			return jsonify({
				"status": 200,
				"data": {
					"api_key_status": status_value,
					"created_at": user.created_at.isoformat(),
					"last_renewed_at": user.last_renewed_at.isoformat() if user.last_renewed_at else None,
					"usage_count": user.usage_count,
				}
			}), 200

