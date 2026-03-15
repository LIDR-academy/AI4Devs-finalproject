"""User registration routes."""

from flask import Blueprint, jsonify


def register_routes(bp: Blueprint) -> None:
	"""Register user registration endpoint."""

	@bp.get("/register")
	def register_info():
		return jsonify({"message": "User registration endpoint placeholder"}), 200

