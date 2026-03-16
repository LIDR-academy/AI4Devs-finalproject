"""Administrative user routes."""

import math
import arrow
from flask import Blueprint, jsonify, request
from sqlmodel import Session, select

from core import configured_limit, get_engine
from core.auth.decorators import get_current_user, require_admin
from core.common.exceptions import NotFoundError, ValidationError
from core.common.validators import validate_email
from core.services.audit_service import query_audit_logs, queue_audit_log
from core.users.models import User


def _parse_bool_arg(value: str | None) -> bool:
	"""Parse common truthy query-string values."""
	if value is None:
		return False
	return value.strip().lower() in {"1", "true", "yes", "on"}


def register_routes(bp: Blueprint) -> None:
	"""Register admin-only endpoints."""

	@bp.get("/admin")
	@configured_limit("RATE_LIMIT_ADMIN")
	@require_admin
	def admin_status():
		"""Admin API health/status endpoint.
		---
		tags:
		  - Admin
		summary: Admin status
		produces:
		  - application/json
		responses:
		  200:
		    description: Admin endpoint is reachable
		    schema:
		      type: object
		      properties:
		        message:
		          type: string
		          example: Admin endpoint placeholder
		  401:
		    description: Invalid API key
		    schema:
		      $ref: '#/definitions/ErrorEnvelope'
		  403:
		    description: Admin privileges required
		    schema:
		      $ref: '#/definitions/ErrorEnvelope'
		security:
		  - ApiKeyAuth: []
		"""
		return jsonify({"message": "Admin endpoint placeholder"}), 200

	@bp.get("/admin/audit-logs")
	@configured_limit("RATE_LIMIT_ADMIN")
	@require_admin
	def audit_logs():
		"""Return paginated audit logs for administrators.
		---
		tags:
		  - Admin
		summary: List audit logs
		description: Fetch paginated audit events with optional filters.
		produces:
		  - application/json
		parameters:
		  - in: query
		    name: page
		    type: integer
		    required: false
		    default: 1
		    example: 1
		  - in: query
		    name: per_page
		    type: integer
		    required: false
		    default: 50
		    example: 50
		  - in: query
		    name: user_id
		    type: integer
		    required: false
		    example: 7
		  - in: query
		    name: action
		    type: string
		    required: false
		    example: file_upload
		  - in: query
		    name: from
		    type: string
		    format: date-time
		    required: false
		    example: 2026-03-01T00:00:00Z
		  - in: query
		    name: to
		    type: string
		    format: date-time
		    required: false
		    example: 2026-03-31T23:59:59Z
		  - in: query
		    name: include_raw_ip
		    type: boolean
		    required: false
		    default: false
		responses:
		  200:
		    description: Audit logs retrieved
		    schema:
		      allOf:
		        - $ref: '#/definitions/SuccessEnvelope'
		        - type: object
		          properties:
		            data:
		              type: object
		              properties:
		                items:
		                  type: array
		                  items:
		                    type: object
		                pagination:
		                  type: object
		  401:
		    description: Invalid API key
		    schema:
		      $ref: '#/definitions/ErrorEnvelope'
		  403:
		    description: Admin privileges required
		    schema:
		      $ref: '#/definitions/ErrorEnvelope'
		  422:
		    description: Invalid query parameter
		    schema:
		      $ref: '#/definitions/ErrorEnvelope'
		security:
		  - ApiKeyAuth: []
		"""
		page = max(1, request.args.get("page", default=1, type=int) or 1)
		per_page = request.args.get("per_page", default=50, type=int) or 50
		per_page = max(1, min(per_page, 200))
		user_id = request.args.get("user_id", default=None, type=int)
		action = (request.args.get("action") or "").strip() or None
		from_date = request.args.get("from")
		to_date = request.args.get("to")
		include_raw_ip = _parse_bool_arg(request.args.get("include_raw_ip"))

		try:
			data = query_audit_logs(
				page=page,
				per_page=per_page,
				user_id=user_id,
				action=action,
				from_date=from_date,
				to_date=to_date,
				include_raw_ip=include_raw_ip,
			)
		except ValueError as exc:
			raise ValidationError(str(exc)) from exc

		return jsonify({"status": 200, "data": data}), 200

	@bp.post("/revoke")
	@configured_limit("RATE_LIMIT_ADMIN")
	@require_admin
	def revoke():
		"""Revoke API key for a user.
		---
		tags:
		  - Admin
		summary: Revoke user API key
		consumes:
		  - application/json
		produces:
		  - application/json
		parameters:
		  - in: body
		    name: body
		    required: true
		    schema:
		      $ref: '#/definitions/AdminEmailRequest'
		responses:
		  200:
		    description: API key revoked or already revoked
		    schema:
		      allOf:
		        - $ref: '#/definitions/SuccessEnvelope'
		  401:
		    description: Invalid API key
		    schema:
		      $ref: '#/definitions/ErrorEnvelope'
		  403:
		    description: Admin privileges required
		    schema:
		      $ref: '#/definitions/ErrorEnvelope'
		  404:
		    description: User not found
		    schema:
		      $ref: '#/definitions/ErrorEnvelope'
		  422:
		    description: Invalid email payload
		    schema:
		      $ref: '#/definitions/ErrorEnvelope'
		security:
		  - ApiKeyAuth: []
		"""
		data = request.get_json(silent=True)
		if not isinstance(data, dict) or "user_email" not in data:
			raise ValidationError("Missing user_email in request body")

		user_email = validate_email(data["user_email"])

		with Session(get_engine()) as session:
			user = session.exec(select(User).where(User.email == user_email)).first()
			if not user:
				raise NotFoundError(f"User with email {user_email} not found")

			if user.is_deleted:
				return jsonify({"status": 200, "message": "API key already revoked"}), 200

			user.is_deleted = True
			user.is_active = False
			user.updated_at = arrow.utcnow().datetime
			session.add(user)

			admin_user = get_current_user()
			session.commit()
			queue_audit_log(
				user_id=user.id,
				action="api_key_revoked_by_admin",
				details={"admin_email": admin_user.email},
			)

			return jsonify({"status": 200, "message": "API key revoked successfully"}), 200

	@bp.post("/reactivate")
	@configured_limit("RATE_LIMIT_ADMIN")
	@require_admin
	def reactivate():
		"""Reactivate API key for a revoked user.
		---
		tags:
		  - Admin
		summary: Reactivate user API key
		consumes:
		  - application/json
		produces:
		  - application/json
		parameters:
		  - in: body
		    name: body
		    required: true
		    schema:
		      $ref: '#/definitions/AdminEmailRequest'
		responses:
		  200:
		    description: API key reactivated or already active
		    schema:
		      allOf:
		        - $ref: '#/definitions/SuccessEnvelope'
		  401:
		    description: Invalid API key
		    schema:
		      $ref: '#/definitions/ErrorEnvelope'
		  403:
		    description: Admin privileges required
		    schema:
		      $ref: '#/definitions/ErrorEnvelope'
		  404:
		    description: User not found
		    schema:
		      $ref: '#/definitions/ErrorEnvelope'
		  422:
		    description: Invalid email payload
		    schema:
		      $ref: '#/definitions/ErrorEnvelope'
		security:
		  - ApiKeyAuth: []
		"""
		data = request.get_json(silent=True)
		if not isinstance(data, dict) or "user_email" not in data:
			raise ValidationError("Missing user_email in request body")

		user_email = validate_email(data["user_email"])

		with Session(get_engine()) as session:
			user = session.exec(select(User).where(User.email == user_email)).first()
			if not user:
				raise NotFoundError(f"User with email {user_email} not found")

			if not user.is_deleted:
				return jsonify({"status": 200, "message": "API key is already active"}), 200

			user.is_deleted = False
			user.is_active = True
			user.updated_at = arrow.utcnow().datetime
			session.add(user)

			admin_user = get_current_user()
			session.commit()
			queue_audit_log(
				user_id=user.id,
				action="api_key_reactivated_by_admin",
				details={"admin_email": admin_user.email},
			)

			return jsonify({"status": 200, "message": "API key reactivated successfully"}), 200

