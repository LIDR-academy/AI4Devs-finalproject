"""File listing routes."""

from __future__ import annotations

from flask import request
from sqlalchemy import func, or_
from sqlmodel import Session, select

from core import configured_limit, get_engine
from core.auth.decorators import get_current_user, require_api_key
from core.common.responses import error_response, success_response
from core.files.models import File

MAX_PAGE_SIZE = 100
DEFAULT_PAGE_SIZE = 10

SORT_FIELDS = {
    "name": File.original_filename,
    "size": File.size,
    "uploaded": File.uploaded_at,
    "pinned": File.pinned,
}


def _parse_positive_int(raw_value: str | None, default: int) -> int:
    if raw_value is None:
        return default
    try:
        parsed = int(raw_value)
    except (TypeError, ValueError):
        return default
    return parsed if parsed > 0 else default


def register_routes(bp) -> None:
    """Register file listing endpoint to blueprint."""

    @bp.get("")
    @configured_limit("RATE_LIMIT_TASKS")
    @require_api_key
    def list_files() -> tuple:
        """List authenticated user's uploaded files with pagination.
        ---
        tags:
          - Files
        summary: List files
        description: Return paginated files for the authenticated user with sorting and filters.
        produces:
          - application/json
        parameters:
          - in: query
            name: page
            type: integer
            required: false
            default: 1
          - in: query
            name: page_size
            type: integer
            required: false
            default: 10
          - in: query
            name: search
            type: string
            required: false
          - in: query
            name: pinned
            type: string
            required: false
            enum: [all, true, false]
          - in: query
            name: sort_by
            type: string
            required: false
            enum: [name, size, uploaded, pinned]
          - in: query
            name: sort_order
            type: string
            required: false
            enum: [asc, desc]
        responses:
          200:
            description: Paginated file list
            schema:
              allOf:
                - $ref: '#/definitions/SuccessEnvelope'
          401:
            description: Invalid API key
            schema:
              $ref: '#/definitions/ErrorEnvelope'
          429:
            description: Rate limit exceeded
            schema:
              $ref: '#/definitions/ErrorEnvelope'
        security:
          - ApiKeyAuth: []
        """
        user = get_current_user()

        page = _parse_positive_int(raw_value=request.args.get("page"), default=1)
        page_size = _parse_positive_int(raw_value=request.args.get("page_size"), default=DEFAULT_PAGE_SIZE)
        page_size = min(page_size, MAX_PAGE_SIZE)

        search = (request.args.get("search") or "").strip()
        pinned = (request.args.get("pinned") or "all").strip().lower()
        sort_by = (request.args.get("sort_by") or "uploaded").strip().lower()
        sort_order = (request.args.get("sort_order") or "desc").strip().lower()

        sort_field = SORT_FIELDS.get(sort_by, File.uploaded_at)
        sort_expression = sort_field.asc() if sort_order == "asc" else sort_field.desc()

        if pinned not in {"all", "true", "false"}:
            return error_response(422, "Invalid pinned filter", code="INVALID_PINNED_FILTER")

        with Session(get_engine()) as session:
            statement = select(File).where(File.user_id == user.id, File.deleted_at == None)
            count_statement = select(func.count(File.id)).where(File.user_id == user.id, File.deleted_at == None)

            if search:
                pattern = f"%{search}%"
                search_condition = or_(File.original_filename.ilike(pattern), File.cid.ilike(pattern))
                statement = statement.where(search_condition)
                count_statement = count_statement.where(search_condition)

            if pinned == "true":
                statement = statement.where(File.pinned == True)
                count_statement = count_statement.where(File.pinned == True)
            elif pinned == "false":
                statement = statement.where(File.pinned == False)
                count_statement = count_statement.where(File.pinned == False)

            total = session.exec(count_statement).one() or 0
            offset = (page - 1) * page_size

            files = session.exec(statement.order_by(sort_expression).offset(offset).limit(page_size)).all()

        items = [
            {
                "id": file.id,
                "cid": file.cid,
                "original_filename": file.original_filename,
                "safe_filename": file.safe_filename,
                "size": file.size,
                "pinned": file.pinned,
                "uploaded_at": file.uploaded_at.isoformat() if file.uploaded_at else None,
                "content_type": file.mime_type,
            }
            for file in files
        ]

        return success_response(
            200,
            message="Files fetched successfully",
            data=items,
            meta={
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": max(1, (total + page_size - 1) // page_size),
                "sort_by": sort_by if sort_by in SORT_FIELDS else "uploaded",
                "sort_order": "asc" if sort_order == "asc" else "desc",
                "search": search,
                "pinned": pinned,
            },
        )
