"""File deletion routes."""

from __future__ import annotations

from typing import Any

import arrow
from flask import Blueprint, request
from sqlmodel import Session, select

from core import configured_limit, get_engine
from core.auth.decorators import get_current_user, require_api_key
from core.common.responses import error_response, success_response
from core.files.models import File
from core.files.validators import validate_cid
from core.services.audit_service import queue_audit_log


def _find_owned_file_by_cid(session: Session, user_id: int, cid: str) -> File | None:
    return session.exec(
        select(File).where(
            File.user_id == user_id,
            File.cid == cid,
            File.deleted_at == None,
        )
    ).first()


def register_routes(bp: Blueprint) -> None:
    """Register file delete endpoints."""

    @bp.delete("/<string:cid>")
    @configured_limit("RATE_LIMIT_TASKS")
    @require_api_key
    def delete_file(cid: str) -> tuple[Any, int]:
        """Soft-delete a single file by CID for the authenticated owner.
        ---
        tags:
          - Files
        summary: Delete file
        description: Soft-delete a file so it no longer appears in listing endpoints.
        produces:
          - application/json
        parameters:
          - in: path
            name: cid
            type: string
            required: true
        responses:
          200:
            description: File deleted
            schema:
              allOf:
                - $ref: '#/definitions/SuccessEnvelope'
          404:
            description: File not found
          401:
            description: Invalid API key
          429:
            description: Rate limit exceeded
        security:
          - ApiKeyAuth: []
        """
        user = get_current_user()
        normalized_cid = validate_cid(cid)

        with Session(get_engine()) as session:
            db_file = _find_owned_file_by_cid(session=session, user_id=user.id, cid=normalized_cid)
            if db_file is None:
                return error_response(404, "File not found", code="FILE_NOT_FOUND")

            db_file.deleted_at = arrow.utcnow().datetime
            session.add(db_file)
            session.commit()

            queue_audit_log(
                user_id=user.id,
                action="file_delete",
                resource_type="file",
                resource_id=db_file.id,
                details={"cid": normalized_cid, "mode": "single"},
            )

        return success_response(
            200,
            message="File deleted successfully",
            data={"cid": normalized_cid},
        )

    @bp.post("/delete/bulk")
    @configured_limit("RATE_LIMIT_TASKS")
    @require_api_key
    def bulk_delete_files() -> tuple[Any, int]:
        """Soft-delete multiple files for the authenticated owner.
        ---
        tags:
          - Files
        summary: Bulk delete files
        description: Soft-delete multiple files by CID.
        consumes:
          - application/json
        produces:
          - application/json
        parameters:
          - in: body
            name: body
            required: true
            schema:
              type: object
              properties:
                cids:
                  type: array
                  items:
                    type: string
        responses:
          200:
            description: Files deleted
          422:
            description: Invalid request payload
          401:
            description: Invalid API key
          429:
            description: Rate limit exceeded
        security:
          - ApiKeyAuth: []
        """
        user = get_current_user()
        payload = request.get_json(silent=True) or {}
        raw_cids = payload.get("cids")

        if not isinstance(raw_cids, list) or len(raw_cids) == 0:
            return error_response(422, "At least one CID is required", code="CIDS_REQUIRED")

        normalized_cids: list[str] = []
        for raw_cid in raw_cids:
            if not isinstance(raw_cid, str):
                return error_response(422, "CID list must contain strings", code="INVALID_CID_LIST")
            normalized_cids.append(validate_cid(raw_cid))

        unique_cids = list(dict.fromkeys(normalized_cids))
        deleted: list[str] = []
        not_found: list[str] = []

        with Session(get_engine()) as session:
            for cid in unique_cids:
                db_file = _find_owned_file_by_cid(session=session, user_id=user.id, cid=cid)
                if db_file is None:
                    not_found.append(cid)
                    continue

                db_file.deleted_at = arrow.utcnow().datetime
                session.add(db_file)
                deleted.append(cid)

            session.commit()

            queue_audit_log(
                user_id=user.id,
                action="file_delete_bulk",
                resource_type="file",
                resource_id=None,
                details={
                    "deleted_count": len(deleted),
                    "deleted_cids": deleted,
                    "not_found_cids": not_found,
                },
            )

        return success_response(
            200,
            message="Bulk delete completed",
            data={
                "deleted_count": len(deleted),
                "deleted_cids": deleted,
                "not_found_cids": not_found,
            },
        )
