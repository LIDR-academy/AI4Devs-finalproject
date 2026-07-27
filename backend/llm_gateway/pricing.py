# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Static price table (USD per 1M tokens) used to estimate call costs.

Values mirror the prices shown in the frontend model selectors
(ProjectDetailPage.jsx). Providers billed as flat subscriptions (opencode-go)
estimate to zero marginal cost. Unknown models fall back to their provider
default, then to a conservative generic price.
"""
from typing import Optional, Tuple

# (input_usd_per_1M, output_usd_per_1M)
MODEL_PRICING: dict[str, Tuple[float, float]] = {
    "deepseek-v4-pro": (0.27, 1.10),
    "MiniMax-M3": (0.30, 1.20),
    "mimo-v2-pro": (1.00, 3.00),
    "mimo-v2.5-pro": (1.00, 3.00),
    "claude-sonnet-4-20250514": (3.00, 15.00),
    "claude-haiku-4-20250514": (0.80, 4.00),
}

PROVIDER_DEFAULT_PRICING: dict[str, Tuple[float, float]] = {
    "deepseek": (0.27, 1.10),
    "minimax": (0.30, 1.20),
    "mimo": (1.00, 3.00),
    "opencode": (0.27, 1.10),   # gateway default models are deepseek-family
    "opencode-go": (0.0, 0.0),  # flat subscription: zero marginal cost
    "claude": (3.00, 15.00),
}

FALLBACK_PRICING: Tuple[float, float] = (0.30, 1.20)


def estimate_cost(model: str, tokens_in: int, tokens_out: int, provider: Optional[str] = None) -> float:
    """Estimate USD cost for one call. Returns 0.0 when nothing is known."""
    pricing = MODEL_PRICING.get(model)
    if pricing is None and provider:
        pricing = PROVIDER_DEFAULT_PRICING.get(provider)
    if pricing is None:
        pricing = FALLBACK_PRICING
    price_in, price_out = pricing
    return round((tokens_in * price_in + tokens_out * price_out) / 1_000_000, 6)
