"""
Activity schemas for SEPE Templates Comparator API.

This module defines Pydantic schemas for activity audit trail data,
including activity types, responses, and list responses.
"""

from datetime import datetime
from typing import Optional, List
from enum import Enum
from pydantic import BaseModel, Field


class ActivityType(str, Enum):
    """Enumeration of activity types tracked in the system."""
    
    LOGIN = "LOGIN"
    NEW_USER = "NEW_USER"
    TEMPLATE_ANALYSIS = "TEMPLATE_ANALYSIS"
    TEMPLATE_SAVED = "TEMPLATE_SAVED"
    VERSION_SAVED = "VERSION_SAVED"
    COMPARISON_ANALYSIS = "COMPARISON_ANALYSIS"
    COMPARISON_SAVED = "COMPARISON_SAVED"
    TEMPLATE_DELETED = "TEMPLATE_DELETED"
    VERSION_DELETED = "VERSION_DELETED"
    COMPARISON_DELETED = "COMPARISON_DELETED"


class ActivityResponse(BaseModel):
    """Schema for activity response with user attribution."""
    
    id: int = Field(..., description="Unique activity identifier", example=123)
    timestamp: datetime = Field(..., description="When the activity occurred (UTC)", example="2025-11-02T14:30:00Z")
    user_id: Optional[int] = Field(None, description="ID of the user who performed the action", example=5)
    user_email: Optional[str] = Field(None, description="Email of the user (joined from users table)", example="user@example.com")
    user_full_name: Optional[str] = Field(None, description="Full name of the user (joined from users table)", example="John Doe")
    activity_type: ActivityType = Field(..., description="Type of activity", example=ActivityType.TEMPLATE_SAVED)
    description: str = Field(..., description="Human-readable description of the activity", example="Template ingested: SEPE Form v2.0 by user@example.com")
    entity_id: Optional[int] = Field(None, description="Reference to related entity (template_version.id, comparison.id, etc.)", example=42)
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 123,
                "timestamp": "2025-11-02T14:30:00Z",
                "user_id": 5,
                "user_email": "user@example.com",
                "user_full_name": "John Doe",
                "activity_type": "TEMPLATE_SAVED",
                "description": "Template ingested: SEPE Form v2.0 by user@example.com",
                "entity_id": 42
            }
        }


class ActivityListResponse(BaseModel):
    """Schema for paginated list of activities."""
    
    items: List[ActivityResponse] = Field(..., description="Array of activity objects")
    total: int = Field(..., description="Total number of activities matching the filter (excluding LOGIN)", example=156)
    
    class Config:
        json_schema_extra = {
            "example": {
                "items": [
                    {
                        "id": 123,
                        "timestamp": "2025-11-02T14:30:00Z",
                        "user_id": 5,
                        "user_email": "user@example.com",
                        "user_full_name": "John Doe",
                        "activity_type": "TEMPLATE_SAVED",
                        "description": "Template ingested: SEPE Form v2.0",
                        "entity_id": 42
                    }
                ],
                "total": 156
            }
        }

