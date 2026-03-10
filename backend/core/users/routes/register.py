"""User registration routes."""

from flask import Blueprint, jsonify, request

from core import configured_limit
from core.common.exceptions import ValidationError
from core.users.services import register_user


def register_routes(bp: Blueprint) -> None:
	"""Register user registration endpoint."""

	@bp.post("/register")
	@configured_limit("RATE_LIMIT_REGISTRATION")
	def register():
		payload = request.get_json(silent=True)
		if not isinstance(payload, dict):
			raise ValidationError("Invalid JSON payload")

		email = payload.get("email")
		password = payload.get("password")
		if email is None or password is None:
			raise ValidationError("Both email and password are required")

		data = register_user(email=email, password=password)
		return (
			jsonify(
				{
					"status": 201,
					"message": "Registration successful",
					"data": data,
				}
			),
			201,
		)

