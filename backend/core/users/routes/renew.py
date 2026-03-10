"""API key renewal endpoints with step-up verification."""

import arrow
from flask import Blueprint, jsonify, request
from sqlmodel import Session, select

from core import configured_limit, get_engine
from core.auth.decorators import get_current_user, require_api_key
from core.common.exceptions import AuthenticationError, ValidationError
from core.common.models import AuditLog
from core.common.validators import validate_verification_code
from core.users.models import User
from core.users.verification import generate_verification_code, verify_code


def register_routes(bp: Blueprint) -> None:
	"""Register API key renewal endpoints."""
	
	@bp.post("/renew/challenge")
	@configured_limit("RATE_LIMIT_RENEW")
	@require_api_key
	def renew_challenge():
		"""Initiate API key renewal with step-up verification challenge.
		
		Returns:
			202 response indicating verification code sent.
		"""
		user = get_current_user()
		
		# Generate and send verification code
		code = generate_verification_code(user.id)
		
		# TODO: Send code via email (future enhancement)
		# For now, log it for testing
		print(f"Verification code for {user.email}: {code}")
		
		return jsonify({
			"status": 202,
			"message": "Verification code sent"
		}), 202
	
	@bp.post("/renew")
	@configured_limit("RATE_LIMIT_RENEW")
	@require_api_key
	def renew():
		"""Renew API key with step-up verification.
		
		Request body must include:
			- verification_code: 6-digit code from challenge
		
		Returns:
			New API key on successful verification.
		"""
		user = get_current_user()
		data = request.get_json(silent=True)
		if not isinstance(data, dict):
			raise ValidationError("Invalid JSON payload")
		
		if "verification_code" not in data:
			raise ValidationError("Missing verification_code in request body")
		
		verification_code = validate_verification_code(str(data["verification_code"]))
		
		with Session(get_engine()) as session:
			# Verify step-up code
			if not verify_code(user.id, verification_code):
				# Log failed attempt
				audit = AuditLog(
					user_id=user.id,
					action="api_key_renew_failed",
					timestamp=arrow.utcnow().datetime,
					details='{"reason": "invalid_verification_code"}',
				)
				session.add(audit)
				session.commit()
				raise AuthenticationError("Invalid or expired verification code")
			
			# Get fresh user from database
			db_user = session.exec(
				select(User).where(User.id == user.id)
			).first()
			
			if not db_user:
				raise AuthenticationError("User not found")
			
			# Generate new API key
			new_api_key = db_user.renew_api_key()
			session.add(db_user)
			
			# Log successful renewal
			audit = AuditLog(
				user_id=db_user.id,
				action="api_key_renewed",
				timestamp=arrow.utcnow().datetime,
				details='{"status": "success"}',
			)
			session.add(audit)
			session.commit()
			
			return jsonify({
				"status": 200,
				"message": "New API key generated",
				"data": {
					"api_key": new_api_key
				}
			}), 200

