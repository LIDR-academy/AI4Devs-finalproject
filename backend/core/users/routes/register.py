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
		"""Register a new user account.
		---
		tags:
		  - Users
		summary: Register new user
		description: Create a user account and return a generated API key.
		consumes:
		  - application/json
		produces:
		  - application/json
		parameters:
		  - in: body
		    name: body
		    required: true
		    schema:
		      $ref: '#/definitions/RegisterRequest'
		responses:
		  201:
		    description: Registration successful
		    schema:
		      allOf:
		        - $ref: '#/definitions/SuccessEnvelope'
		        - type: object
		          properties:
		            data:
		              type: object
		              properties:
		                email:
		                  type: string
		                  format: email
		                  example: user@example.com
		                api_key:
		                  type: string
		                  example: ipfs_gw_0123456789abcdef
		  422:
		    description: Validation error
		    schema:
		      $ref: '#/definitions/ErrorEnvelope'
		  429:
		    description: Rate limit exceeded
		    schema:
		      $ref: '#/definitions/ErrorEnvelope'
		security: []
		"""
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

