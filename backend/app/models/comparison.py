"""
Comparison models for SEPE Templates Comparator.

This module defines the Comparison and ComparisonField SQLAlchemy models
for managing template comparisons and detailed field-level differences.

Updated to support persistence of complete comparison analysis results with
version-based foreign keys and global metrics storage.
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Text,
    Float,
    Boolean,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Comparison(Base):
    """
    Comparison model for storing template comparison metadata and results.

    Updated schema (migration 20251027_094913):
    - Changed FKs from pdf_templates to template_versions
    - Added global metrics columns for quick summary queries
    - Supports complete persistence of comparison analysis
    """

    __tablename__ = "comparisons"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign Keys (UPDATED: now reference template_versions)
    source_version_id = Column(
        Integer,
        ForeignKey("template_versions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    target_version_id = Column(
        Integer,
        ForeignKey("template_versions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Comparison Metadata
    comparison_type = Column(String(50), default="structure")
    status = Column(String(50), default="completed", index=True)
    # Deprecated, use fields_* instead
    differences_count = Column(Integer, default=0)

    # Global Metrics (NEW)
    modification_percentage = Column(
        Float, nullable=False, default=0.0, index=True
    )
    fields_added = Column(Integer, nullable=False, default=0)
    fields_removed = Column(Integer, nullable=False, default=0)
    fields_modified = Column(Integer, nullable=False, default=0)
    fields_unchanged = Column(Integer, nullable=False, default=0)

    # Ownership and Timestamps
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships (UPDATED: now reference TemplateVersion)
    source_version = relationship(
        "TemplateVersion",
        foreign_keys=[source_version_id],
        back_populates="source_comparisons"
    )
    target_version = relationship(
        "TemplateVersion",
        foreign_keys=[target_version_id],
        back_populates="target_comparisons"
    )
    creator = relationship("User", back_populates="created_comparisons")
    field_differences = relationship(
        "ComparisonField",
        back_populates="comparison",
        cascade="all, delete-orphan",
        order_by="ComparisonField.field_id"
    )

    def __repr__(self) -> str:
        return (
            f"<Comparison(id={self.id}, "
            f"source_version={self.source_version_id}, "
            f"target_version={self.target_version_id}, "
            f"status='{self.status}', "
            f"modified={self.modification_percentage}%)>"
        )


class ComparisonField(Base):
    """
    Comparison field model for storing detailed field-level differences.

    Updated schema (migration 20251027_094913):
    - Added field_id, status columns for proper field identification
    - Added page number tracking (source/target)
    - Added near_text comparison data
    - Added JSONB value_options for select/radio fields
    - Added JSONB position data for coordinate tracking
    - Deprecated: field_name, change_type, old_value, new_value,
      position_x, position_y
    """

    __tablename__ = "comparison_fields"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign Key
    comparison_id = Column(
        Integer,
        ForeignKey("comparisons.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Field Identification (NEW)
    field_id = Column(String(255), nullable=False, index=True)
    # ADDED, REMOVED, MODIFIED, UNCHANGED
    status = Column(String(20), nullable=False, index=True)
    field_type = Column(String(100), nullable=True)

    # Page Information (NEW)
    source_page_number = Column(Integer, nullable=True)
    target_page_number = Column(Integer, nullable=True)
    page_number_changed = Column(Boolean, nullable=False, default=False)

    # Near Text Comparison (NEW)
    # EQUAL, DIFFERENT, NOT_APPLICABLE
    near_text_diff = Column(String(20), nullable=True)
    source_near_text = Column(Text, nullable=True)
    target_near_text = Column(Text, nullable=True)

    # Value Options Comparison (NEW - JSONB for flexibility)
    # EQUAL, DIFFERENT, NOT_APPLICABLE
    value_options_diff = Column(String(20), nullable=True)
    source_value_options = Column(JSONB, nullable=True)
    target_value_options = Column(JSONB, nullable=True)

    # Position Comparison (NEW - JSONB for {x0, y0, x1, y1} structure)
    # EQUAL, DIFFERENT, NOT_APPLICABLE
    position_change = Column(String(20), nullable=True)
    source_position = Column(JSONB, nullable=True)
    target_position = Column(JSONB, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    comparison = relationship(
        "Comparison", back_populates="field_differences"
    )

    def __repr__(self) -> str:
        return (
            f"<ComparisonField(id={self.id}, "
            f"comparison_id={self.comparison_id}, "
            f"field_id='{self.field_id}', "
            f"status='{self.status}')>"
        )
