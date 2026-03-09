"""User API key renewal routes."""

from flask import Blueprint, jsonify


def register_routes(bp: Blueprint) -> None:
	"""Register user renew endpoint."""

	@bp.post("/renew")
	def renew():
		return jsonify({"message": "API key renewal placeholder"}), 200

