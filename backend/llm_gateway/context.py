# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Request-scoped LLM context (user id + endpoint path) via contextvars.

The HTTP middleware sets the endpoint path; the auth helpers set the user id
once the session is resolved. Background work launched via asyncio.create_task
or Starlette BackgroundTasks inherits the context active at creation time, so
codegen/speckit workers need no explicit wiring.
"""
from contextvars import ContextVar, Token
from typing import Optional

_llm_user_id: ContextVar[Optional[str]] = ContextVar("llm_user_id", default=None)
_llm_endpoint: ContextVar[Optional[str]] = ContextVar("llm_endpoint", default=None)


def set_llm_user(user_id: Optional[str]) -> Token:
    return _llm_user_id.set(user_id)


def set_llm_endpoint(endpoint: Optional[str]) -> Token:
    return _llm_endpoint.set(endpoint)


def reset_llm_endpoint(token: Token) -> None:
    _llm_endpoint.reset(token)


def get_llm_context() -> dict:
    return {"user_id": _llm_user_id.get(), "endpoint": _llm_endpoint.get()}
