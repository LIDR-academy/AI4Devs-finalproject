"""
Template models for SEPE Templates Comparator.

This module defines the PDFTemplate, TemplateVersion, and TemplateField
SQLAlchemy models for managing PDF template storage, versioning, and
extracted AcroForm field data.
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Boolean,
    Text,
    JSON,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class PDFTemplate(Base):
    """
    PDF template model for template metadata.

    This model stores base template information. Version-specific data
    (file path, size, field count, etc.) is stored in TemplateVersion.
    """

    __tablename__ = "pdf_templates"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Template Information
    name = Column(String(255), nullable=False, index=True)
    current_version = Column(String(50), nullable=False, index=True)
    comment = Column(Text, nullable=True)

    # Ownership and Timestamps
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    uploader = relationship("User", back_populates="uploaded_templates")
    versions = relationship(
        "TemplateVersion",
        back_populates="template",
        cascade="all, delete-orphan"
    )
    # Note: Comparisons now reference template_versions, not pdf_templates
    # See TemplateVersion model for source_comparisons and target_comparisons

    def __repr__(self) -> str:
        return (
            f"<PDFTemplate(id={self.id}, name='{self.name}', "
            f"current_version='{self.current_version}')>"
        )

    @property
    def current_version_record(self):
        """
        Get the current version record.

        Returns:
            TemplateVersion: The version record marked as current, or None
        """
        for version in self.versions:
            if version.is_current:
                return version
        return None


class TemplateVersion(Base):
    """
    Template version model for tracking template change history.

    Each version stores complete metadata including file information,
    PDF metadata, and field count. This ensures version atomicity.
    """

    __tablename__ = "template_versions"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign Key
    template_id = Column(
        Integer,
        ForeignKey("pdf_templates.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Version Information
    version_number = Column(String(50), nullable=False)
    change_summary = Column(Text, nullable=True)
    is_current = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # File Information (version-specific)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    field_count = Column(Integer, nullable=False, default=0)
    sepe_url = Column(String(1000), nullable=True)

    # PDF Document Metadata
    title = Column(String(255), nullable=True)
    author = Column(String(255), nullable=True)
    subject = Column(String(255), nullable=True)
    creation_date = Column(DateTime(timezone=True), nullable=True)
    modification_date = Column(DateTime(timezone=True), nullable=True)
    page_count = Column(Integer, nullable=False, default=0)

    # Relationships
    template = relationship("PDFTemplate", back_populates="versions")
    fields = relationship(
        "TemplateField", back_populates="version", cascade="all, delete-orphan"
    )
    # Comparison relationships (added for persistence feature)
    # Using passive_deletes=True to let PostgreSQL CASCADE handle deletion
    source_comparisons = relationship(
        "Comparison",
        foreign_keys="Comparison.source_version_id",
        back_populates="source_version",
        passive_deletes=True  # Let DB handle CASCADE, don't UPDATE to NULL
    )
    target_comparisons = relationship(
        "Comparison",
        foreign_keys="Comparison.target_version_id",
        back_populates="target_version",
        passive_deletes=True  # Let DB handle CASCADE, don't UPDATE to NULL
    )

    def __repr__(self) -> str:
        return (
            f"<TemplateVersion(id={self.id}, "
            f"template_id={self.template_id}, "
            f"version_number='{self.version_number}', "
            f"is_current={self.is_current})>"
        )

    @property
    def file_size_mb(self) -> float:
        """
        Get file size in megabytes.

        Returns:
            float: File size in MB, rounded to 2 decimal places
        """
        return round(self.file_size_bytes / (1024 * 1024), 2)


class TemplateField(Base):
    """Template field model for storing extracted PDF AcroForm data."""

    __tablename__ = "template_fields"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign Key to template_versions
    version_id = Column(
        Integer,
        ForeignKey("template_versions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Field Identification
    field_id = Column(String(255), nullable=False)
    field_type = Column(String(50), nullable=False)
    raw_type = Column(String(50), nullable=True)

    # Page Information
    page_number = Column(Integer, nullable=False)
    field_page_order = Column(Integer, nullable=False)

    # Field Content
    near_text = Column(Text, nullable=True)

    # JSON Fields (using JSONB for PostgreSQL)
    value_options = Column(JSON, nullable=True)
    position_data = Column(JSON, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    version = relationship("TemplateVersion", back_populates="fields")

    def __repr__(self) -> str:
        return (
            f"<TemplateField(id={self.id}, version_id={self.version_id}, "
            f"field_id='{self.field_id}', type='{self.field_type}')>"
        )
