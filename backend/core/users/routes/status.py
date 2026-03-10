"""User API key status routes."""

from flask import Blueprint, jsonify


def register_routes(bp: Blueprint) -> None:
	"""Register user status endpoint."""

	@bp.get("/status")
	def status():
		return jsonify({"status": "active"}), 200

