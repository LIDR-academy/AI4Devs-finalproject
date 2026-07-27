# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Provider registry: single source of truth mapping provider key -> callable.

routers/ai.py registers its providers at import time, which keeps this module
free of import cycles. The registered callable must have the uniform
signature:

    async def call(system_msg: str, user_msg: str, *, max_tokens: int = 4096,
                   model: str | None = None) -> str

Providers whose underlying function does not accept `model` are wrapped in an
adapter at registration time and registered with accepts_model=False.
"""
from typing import Any, Awaitable, Callable, Optional

ProviderFn = Callable[..., Awaitable[str]]

_providers: dict[str, dict[str, Any]] = {}


def register_provider(
    key: str,
    call: ProviderFn,
    *,
    is_configured: Callable[[], bool],
    accepts_model: bool = False,
) -> None:
    """Register (or replace) a provider. `is_configured` is evaluated lazily
    on each routing decision so env changes/tests don't require re-registering."""
    _providers[key] = {
        "call": call,
        "is_configured": is_configured,
        "accepts_model": accepts_model,
    }


def get_provider(key: str) -> Optional[dict[str, Any]]:
    return _providers.get(key)


def configured_providers() -> list[str]:
    """Keys of providers whose credentials are present right now."""
    return [k for k, v in _providers.items() if v["is_configured"]()]


def _reset_for_tests() -> None:
    _providers.clear()
