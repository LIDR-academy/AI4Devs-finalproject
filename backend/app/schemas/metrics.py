"""
Pydantic schemas for metrics endpoints.

This module defines response models for dashboard metrics including
templates summary, comparisons count, and monthly activity.
"""

from pydantic import BaseModel, Field


class TemplatesSummaryResponse(BaseModel):
    """
    Summary of templates and versions in the system.
    
    Provides counts of unique templates and total versions across
    all templates for dashboard display.
    """
    
    total_templates: int = Field(
        ...,
        description="Number of unique templates in the system",
        ge=0
    )
    total_versions: int = Field(
        ...,
        description="Total number of versions across all templates",
        ge=0
    )
    
    class Config:
        """Pydantic model configuration."""
        json_schema_extra = {
            "example": {
                "total_templates": 15,
                "total_versions": 45
            }
        }


class ComparisonsCountResponse(BaseModel):
    """
    Count of saved comparisons in the system.
    
    Provides the total number of template comparisons that have
    been saved for dashboard display.
    """
    
    total_comparisons: int = Field(
        ...,
        description="Total number of saved comparisons in the system",
        ge=0
    )
    
    class Config:
        """Pydantic model configuration."""
        json_schema_extra = {
            "example": {
                "total_comparisons": 50
            }
        }


class MonthlyActivityResponse(BaseModel):
    """
    Activity count for the current calendar month.
    
    Provides the number of activities logged in the current month
    (excluding LOGIN events) along with the month identifier.
    """
    
    activities_this_month: int = Field(
        ...,
        description="Number of activities in current calendar month (excluding LOGIN)",
        ge=0
    )
    month: str = Field(
        ...,
        description="Current month in YYYY-MM format",
        pattern=r"^\d{4}-\d{2}$"
    )
    
    class Config:
        """Pydantic model configuration."""
        json_schema_extra = {
            "example": {
                "activities_this_month": 120,
                "month": "2025-11"
            }
        }

