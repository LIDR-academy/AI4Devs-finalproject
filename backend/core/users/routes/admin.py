"""Administrative user routes."""

import arrow
from flask import Blueprint, jsonify, request
from sqlmodel import Session, select

from core import get_engine
from core.auth.decorators import get_current_user, require_admin
from core.common.exceptions import NotFoundError, ValidationError
from core.common.models import AuditLog
from core.users.models import User


def register_routes(bp: Blueprint) -> None:
	"""Register admin-only endpoints."""

	@bp.get("/admin")
	@require_admin
	def admin_status():
		return jsonify({"message": "Admin endpoint placeholder"}), 200

	@bp.post("/revoke")
	@require_admin
	def revoke():
		"""Revoke API key for specified user (admin only)."""
		data = request.get_json(silent=True)
		if not data or "user_email" not in data:
			raise ValidationError("Missing user_email in request body")

		user_email = data["user_email"]

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
			audit = AuditLog(
				user_id=user.id,
				action="api_key_revoked_by_admin",
				timestamp=arrow.utcnow().datetime,
				details=f'{{"admin_email": "{admin_user.email}"}}',
			)
			session.add(audit)
			session.commit()

			return jsonify({"status": 200, "message": "API key revoked successfully"}), 200

	@bp.post("/reactivate")
	@require_admin
	def reactivate():
		"""Reactivate revoked API key for specified user (admin only)."""
		data = request.get_json(silent=True)
		if not data or "user_email" not in data:
			raise ValidationError("Missing user_email in request body")

		user_email = data["user_email"]

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
			audit = AuditLog(
				user_id=user.id,
				action="api_key_reactivated_by_admin",
				timestamp=arrow.utcnow().datetime,
				details=f'{{"admin_email": "{admin_user.email}"}}',
			)
			session.add(audit)
			session.commit()

			return jsonify({"status": 200, "message": "API key reactivated successfully"}), 200

