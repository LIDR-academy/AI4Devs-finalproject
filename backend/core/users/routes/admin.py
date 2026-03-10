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
		return jsonify({"message": "Admin endpoint placeholder"}), 200

	@bp.get("/admin/audit-logs")
	@configured_limit("RATE_LIMIT_ADMIN")
	@require_admin
	def audit_logs():
		"""Return paginated audit logs for administrators."""
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
		"""Revoke API key for specified user (admin only)."""
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
		"""Reactivate revoked API key for specified user (admin only)."""
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

