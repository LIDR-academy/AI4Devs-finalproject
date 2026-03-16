"""API key status and health-check endpoints."""

from flask import Blueprint, jsonify, request
from sqlmodel import Session

from core import configured_limit, get_engine
from core.auth.decorators import find_user_by_api_key
from core.common.responses import error_response, success_response


def register_routes(bp: Blueprint) -> None:
	"""Register status endpoint."""

	@bp.get("/status")
	@configured_limit("RATE_LIMIT_STATUS")
	def status_health():
		"""Service health probe for users blueprint.
		---
		tags:
		  - Health
		summary: Users service health status
		description: Lightweight liveness endpoint used by internal checks.
		produces:
		  - application/json
		responses:
		  200:
		    description: Service is active
		    schema:
		      type: object
		      properties:
		        status:
		          type: string
		          example: active
		security: []
		"""
		# Compatibility route for health-style checks used by existing tests.
		return jsonify({"status": "active"}), 200

	@bp.post("/status")
	@configured_limit("RATE_LIMIT_STATUS")
	def status():
		"""Check API key status.
		---
		tags:
		  - Users
		summary: API key status
		description: Returns status details for the API key provided in X-API-Key.
		produces:
		  - application/json
		parameters:
		  - in: header
		    name: X-API-Key
		    required: true
		    type: string
		    example: ipfs_gw_0123456789abcdef
		responses:
		  200:
		    description: API key status retrieved
		    schema:
		      allOf:
		        - $ref: '#/definitions/SuccessEnvelope'
		        - type: object
		          properties:
		            data:
		              type: object
		              properties:
		                api_key_status:
		                  type: string
		                  enum: [active, inactive, revoked]
		                  example: active
		                created_at:
		                  type: string
		                  format: date-time
		                last_renewed_at:
		                  type: string
		                  format: date-time
		                  nullable: true
		                usage_count:
		                  type: integer
		                  example: 12
		  401:
		    description: Missing or invalid API key
		    schema:
		      $ref: '#/definitions/ErrorEnvelope'
		  429:
		    description: Rate limit exceeded
		    schema:
		      $ref: '#/definitions/ErrorEnvelope'
		security:
		  - ApiKeyAuth: []
		"""

		api_key = request.headers.get("X-API-Key", "").strip()
		if not api_key:
			return error_response(401, "Missing X-API-Key header", code="AUTHENTICATION_FAILED")
		
		with Session(get_engine()) as session:
			user = find_user_by_api_key(session, api_key)
			
			if not user:
				return error_response(401, "Invalid API key", code="AUTHENTICATION_FAILED")
			
			# Determine status based on user flags
			if user.is_deleted:
				status_value = "revoked"
			elif user.is_active:
				status_value = "active"
			else:
				status_value = "inactive"
			
			return success_response(
				200,
				message="API key status retrieved",
				data={
					"api_key_status": status_value,
					"created_at": user.created_at.isoformat(),
					"last_renewed_at": user.last_renewed_at.isoformat() if user.last_renewed_at else None,
					"usage_count": user.usage_count,
				},
			)

