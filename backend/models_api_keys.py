# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Pydantic models for user API keys and usage tracking."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ApiKeyCreate(BaseModel):
    name: str


class ApiKeySummary(BaseModel):
    model_config = ConfigDict(extra="ignore")
    key_id: str
    name: str
    key_prefix: str
    is_active: bool
    last_used_at: Optional[str] = None
    created_at: str


class ApiKeyCreateResponse(BaseModel):
    key_id: str
    name: str
    key: str  # full plaintext — shown only once
    key_prefix: str
    created_at: str


class ApiUsageRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    key_id: str
    key_name: Optional[str] = None
    endpoint: str
    provider: str
    model: str
    request_body: Optional[dict] = None
    response_body: Optional[dict] = None
    tokens_in: int = 0
    tokens_out: int = 0
    cost_usd: float = 0.0
    latency_ms: int = 0
    status: str = "ok"
    error: Optional[str] = None
    created_at: str
