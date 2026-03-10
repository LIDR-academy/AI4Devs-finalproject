"""Audit logging helpers and audit-log query utilities."""

from __future__ import annotations

import hashlib
import ipaddress
import json
import math
from datetime import datetime
from typing import Any

import arrow
from flask import current_app, g, has_app_context, has_request_context, request
from sqlalchemy import func
from sqlmodel import Session, select

from core import get_engine, get_request_id
from core.common.models import AuditLog
from core.users.models import User

_PENDING_AUDIT_EVENTS_KEY = "pending_audit_events"
_AUDIT_CONFIGURATION_ACTION = "audit_configuration_updated"


def _utcnow() -> datetime:
	"""Return a timezone-naive UTC timestamp compatible with SQLite storage."""
	return arrow.utcnow().naive


def _json_details(details: Any) -> str:
	"""Serialize audit details into a stable JSON string."""
	if details is None:
		payload: dict[str, Any] = {}
	elif isinstance(details, dict):
		payload = details
	elif isinstance(details, str):
		try:
			decoded = json.loads(details)
			payload = decoded if isinstance(decoded, dict) else {"value": decoded}
		except json.JSONDecodeError:
			payload = {"message": details}
	else:
		payload = {"value": details}
	return json.dumps(payload, sort_keys=True)


def parse_audit_details(details: str | None) -> dict[str, Any]:
	"""Parse persisted audit details into a dictionary."""
	if not details:
		return {}
	try:
		decoded = json.loads(details)
		if isinstance(decoded, dict):
			return decoded
		return {"value": decoded}
	except json.JSONDecodeError:
		return {"message": details}


def _request_metadata() -> dict[str, Any]:
	"""Collect request-scoped metadata when available."""
	if not has_request_context():
		return {}
	return {
		"ip_address": request.remote_addr,
		"user_agent": request.headers.get("User-Agent"),
		"request_id": get_request_id(),
	}


def _config_value(key: str, default: Any) -> Any:
	"""Read Flask config values safely even when no app context is active."""
	if not has_app_context():
		return default
	return current_app.config.get(key, default)


def build_audit_log(
	*,
	user_id: int,
	action: str,
	resource_type: str | None = None,
	resource_id: int | None = None,
	details: Any = None,
	ip_address: str | None = None,
	user_agent: str | None = None,
	request_id: str | None = None,
	timestamp: datetime | None = None,
) -> AuditLog:
	"""Build an `AuditLog` instance with normalized metadata."""
	request_metadata = _request_metadata()
	return AuditLog(
		user_id=user_id,
		action=action,
		resource_type=resource_type,
		resource_id=resource_id,
		timestamp=timestamp or _utcnow(),
		details=_json_details(details),
		ip_address=ip_address if ip_address is not None else request_metadata.get("ip_address"),
		user_agent=user_agent if user_agent is not None else request_metadata.get("user_agent"),
		request_id=request_id if request_id is not None else request_metadata.get("request_id"),
	)


def _current_audit_configuration() -> dict[str, Any]:
	"""Return the effective audit configuration snapshot."""
	return {
		"audit_log_deferred_write": bool(_config_value("AUDIT_LOG_DEFERRED_WRITE", True)),
		"audit_ip_retention_days": int(_config_value("AUDIT_IP_RETENTION_DAYS", 90)),
		"audit_ip_redaction_mode": _redaction_mode(),
		"audit_redaction_batch_size": int(_config_value("AUDIT_REDACTION_BATCH_SIZE", 200)),
	}


def _ensure_audit_configuration_logged(session: Session, actor_user_id: int, request_id: str | None) -> None:
	"""Append a configuration event when the effective audit settings change."""
	if session.info.get("audit_configuration_checked"):
		return
	session.info["audit_configuration_checked"] = True
	configuration = _current_audit_configuration()
	latest_config_event = session.exec(
		select(AuditLog)
		.where(AuditLog.action == _AUDIT_CONFIGURATION_ACTION)
		.order_by(AuditLog.timestamp.desc(), AuditLog.id.desc())
	).first()
	if latest_config_event and parse_audit_details(latest_config_event.details) == configuration:
		return
	config_event = build_audit_log(
		user_id=actor_user_id,
		action=_AUDIT_CONFIGURATION_ACTION,
		resource_type="audit_configuration",
		details=configuration,
		ip_address=None,
		user_agent=None,
		request_id=request_id,
	)
	session.add(config_event)


def add_audit_log(session: Session, **payload: Any) -> AuditLog:
	"""Add a normalized audit log row to an existing session."""
	if payload.get("action") != _AUDIT_CONFIGURATION_ACTION:
		_ensure_audit_configuration_logged(session, int(payload["user_id"]), payload.get("request_id"))
	entry = build_audit_log(**payload)
	session.add(entry)
	return entry


def queue_audit_log(**payload: Any) -> None:
	"""Queue a request-scoped audit log for deferred persistence when configured."""
	if not has_request_context() or not bool(_config_value("AUDIT_LOG_DEFERRED_WRITE", True)):
		engine = get_engine()
		if engine is None:
			return
		with Session(engine) as session:
			add_audit_log(session, **payload)
			session.commit()
		return

	events = getattr(g, _PENDING_AUDIT_EVENTS_KEY, None)
	if events is None:
		events = []
		setattr(g, _PENDING_AUDIT_EVENTS_KEY, events)
	events.append(payload)


def flush_pending_audit_logs() -> None:
	"""Persist any queued request-scoped audit logs."""
	if not has_request_context():
		return
	events = getattr(g, _PENDING_AUDIT_EVENTS_KEY, None) or []
	if not events:
		return
	engine = get_engine()
	if engine is None:
		return
	with Session(engine) as session:
		for payload in events:
			add_audit_log(session, **payload)
		session.commit()
	setattr(g, _PENDING_AUDIT_EVENTS_KEY, [])


def _redaction_mode() -> str:
	"""Return the configured IP redaction mode with a safe fallback."""
	mode = str(_config_value("AUDIT_IP_REDACTION_MODE", "mask")).lower()
	return mode if mode in {"mask", "hash"} else "mask"


def _redact_ip_value(ip_address: str, mode: str) -> tuple[str, str]:
	"""Return a redacted IP value and the method used."""
	if mode == "hash":
		secret = str(_config_value("SECRET_KEY", ""))
		digest = hashlib.sha256(f"{secret}:{ip_address}".encode("utf-8")).hexdigest()
		return f"sha256:{digest[:16]}", "hash_sha256"

	try:
		parsed = ipaddress.ip_address(ip_address)
	except ValueError:
		return "masked", "mask_invalid_ip"

	if isinstance(parsed, ipaddress.IPv4Address):
		network = ipaddress.IPv4Network(f"{ip_address}/24", strict=False)
		return f"{network.network_address}/24", "mask_ipv4_last_octet"

	network = ipaddress.IPv6Network(f"{ip_address}/64", strict=False)
	return f"{network.network_address.compressed}/64", "mask_ipv6_prefix_64"


def _retention_cutoff(retention_days: int) -> datetime:
	"""Compute the oldest timestamp that may retain raw IP data."""
	return arrow.utcnow().shift(days=-retention_days).naive


def _apply_redaction(session: Session, log: AuditLog, retention_days: int) -> None:
	"""Redact an expired audit-log IP in-place and append a redaction event."""
	if not log.ip_address:
		return
	mode = _redaction_mode()
	redacted_ip, method = _redact_ip_value(log.ip_address, mode)
	log.ip_address = redacted_ip
	log.ip_redacted = True
	log.ip_redaction_method = method
	log.ip_redacted_at = _utcnow()
	session.add(log)
	add_audit_log(
		session,
		user_id=log.user_id,
		action="ip_redaction_applied",
		resource_type="audit_log",
		resource_id=log.id,
		details={
			"redacted_log_id": log.id,
			"original_action": log.action,
			"retention_days": retention_days,
			"redaction_mode": mode,
			"redaction_method": method,
		},
		request_id=log.request_id,
	)


def redact_expired_audit_logs() -> int:
	"""Redact expired raw IP values and append redaction events."""
	engine = get_engine()
	if engine is None:
		return 0
	retention_days = int(_config_value("AUDIT_IP_RETENTION_DAYS", 90))
	batch_size = int(_config_value("AUDIT_REDACTION_BATCH_SIZE", 200))
	cutoff = _retention_cutoff(retention_days)
	with Session(engine) as session:
		logs = session.exec(
			select(AuditLog)
			.where(
				AuditLog.ip_address != None,
				AuditLog.ip_redacted == False,
				AuditLog.timestamp < cutoff,
				AuditLog.action != "ip_redaction_applied",
			)
			.order_by(AuditLog.timestamp.asc())
			.limit(batch_size)
		).all()
		for log in logs:
			_apply_redaction(session, log, retention_days)
		session.commit()
		return len(logs)


def _present_ip_address(log: AuditLog, include_raw_ip: bool, retention_days: int) -> tuple[str | None, bool, str | None]:
	"""Return the IP value and redaction metadata suitable for API responses."""
	if not log.ip_address:
		return None, bool(log.ip_redacted), log.ip_redaction_method
	if log.ip_redacted:
		return log.ip_address, True, log.ip_redaction_method
	if log.timestamp < _retention_cutoff(retention_days):
		value, method = _redact_ip_value(log.ip_address, _redaction_mode())
		return value, True, method
	if include_raw_ip:
		return log.ip_address, False, None
	value, method = _redact_ip_value(log.ip_address, _redaction_mode())
	return value, True, method


def _parse_date(value: str | None, field_name: str) -> datetime | None:
	"""Parse ISO-like query dates into naive UTC datetimes."""
	if not value:
		return None
	try:
		return arrow.get(value).naive
	except Exception as exc:
		raise ValueError(f"Invalid {field_name} date value") from exc


def query_audit_logs(
	*,
	page: int,
	per_page: int,
	user_id: int | None = None,
	action: str | None = None,
	from_date: str | None = None,
	to_date: str | None = None,
	include_raw_ip: bool = False,
) -> dict[str, Any]:
	"""Query and paginate audit logs for the admin API."""
	redact_expired_audit_logs()
	engine = get_engine()
	if engine is None:
		return {"logs": [], "pagination": {"page": page, "per_page": per_page, "total": 0, "pages": 0}}
	retention_days = int(_config_value("AUDIT_IP_RETENTION_DAYS", 90))
	parsed_from = _parse_date(from_date, "from")
	parsed_to = _parse_date(to_date, "to")
	with Session(engine) as session:
		filters: list[Any] = []
		if user_id is not None:
			filters.append(AuditLog.user_id == user_id)
		if action:
			filters.append(AuditLog.action == action)
		if parsed_from is not None:
			filters.append(AuditLog.timestamp >= parsed_from)
		if parsed_to is not None:
			filters.append(AuditLog.timestamp <= parsed_to)

		total_stmt = select(func.count()).select_from(AuditLog)
		for clause in filters:
			total_stmt = total_stmt.where(clause)
		total = int(session.exec(total_stmt).one())

		stmt = (
			select(AuditLog, User.email)
			.join(User, User.id == AuditLog.user_id)
			.order_by(AuditLog.timestamp.desc(), AuditLog.id.desc())
			.offset((page - 1) * per_page)
			.limit(per_page)
		)
		for clause in filters:
			stmt = stmt.where(clause)

		rows = session.exec(stmt).all()
		logs: list[dict[str, Any]] = []
		for log, user_email in rows:
			details = parse_audit_details(log.details)
			ip_address, ip_redacted, ip_redaction_method = _present_ip_address(log, include_raw_ip, retention_days)
			if ip_address is not None:
				details["ip_address"] = ip_address
			details["ip_redacted"] = ip_redacted
			if ip_redaction_method:
				details["ip_redaction_method"] = ip_redaction_method
			details["ip_retention_days"] = retention_days
			if log.request_id:
				details.setdefault("request_id", log.request_id)
			logs.append(
				{
					"id": log.id,
					"user_id": log.user_id,
					"user_email": user_email,
					"action": log.action,
					"timestamp": log.timestamp.isoformat(),
					"request_id": log.request_id,
					"details": details,
				}
			)

		pages = math.ceil(total / per_page) if total else 0
		return {
			"logs": logs,
			"pagination": {
				"page": page,
				"per_page": per_page,
				"total": total,
				"pages": pages,
			},
		}

