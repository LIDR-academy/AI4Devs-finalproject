"""
Template Service for SEPE Templates Comparator.

This service handles the complete template ingestion workflow including:
- File storage with UUID generation and checksum calculation
- PDF metadata extraction
- PDF analysis orchestration
- Transactional database persistence (template + version + fields)
- Error handling and file cleanup
"""
import logging
import os
import hashlib
import uuid
from pathlib import Path
from typing import Tuple, Dict, Any, List, Optional
from datetime import datetime

import PyPDF2
from fastapi import UploadFile
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.models.template import PDFTemplate, TemplateVersion, TemplateField
from app.services.pdf_analysis_service import (
    PDFAnalysisService,
    TemplateFieldData,
    InvalidPDFError,
    NoFormFieldsError
)


logger = logging.getLogger(__name__)


class TemplateIngestionError(Exception):
    """Base exception for template ingestion errors."""
    pass


class TemplateService:
    """Service for template ingestion and management."""

    def __init__(self, db: Session):
        """
        Initialize the template service.

        Args:
            db: SQLAlchemy database session
        """
        self.db = db
        self.pdf_analysis_service = PDFAnalysisService()
        self.logger = logging.getLogger(__name__)

    async def ingest_template(
        self,
        file: UploadFile,
        name: str,
        version: str,
        sepe_url: Optional[str],
        comment: Optional[str],
        user_id: int
    ) -> PDFTemplate:
        """
        Complete template ingestion workflow.

        This method orchestrates the entire ingestion process:
        1. Validates input parameters
        2. Saves file to persistent storage with checksum
        3. Extracts PDF metadata
        4. Analyzes PDF structure and fields
        5. Persists all data to database transactionally

        Args:
            file: Uploaded PDF file
            name: Template name (1-255 characters)
            version: Version identifier (1-50 characters)
            sepe_url: Optional SEPE source URL
            user_id: ID of user performing the ingestion

        Returns:
            PDFTemplate: Created template with ID and all relationships

        Raises:
            ValueError: Invalid input parameters
            InvalidPDFError: PDF file is corrupted or invalid
            NoFormFieldsError: PDF contains no form fields
            TemplateIngestionError: Database or file system error
        """
        # Validate required fields
        if not name or not name.strip():
            raise ValueError("Template name is required and cannot be empty")
        if not version or not version.strip():
            raise ValueError("Template version is required and cannot be empty")
        if len(name) > 255:
            raise ValueError("Template name must be 255 characters or less")
        if len(version) > 50:
            raise ValueError("Template version must be 50 characters or less")

        file_path = None

        try:
            self.logger.info(
                f"Template ingestion started: user={user_id}, "
                f"name={name}, version={version}"
            )

            # Step 1: Save file to persistent storage
            file_path, file_size, checksum = self._save_file(file)
            self.logger.info(
                f"File saved: path={file_path}, size={file_size}, "
                f"checksum={checksum}"
            )

            # Step 2: Extract PDF metadata
            pdf_path = Path(file_path)
            metadata = self._extract_pdf_metadata(pdf_path)
            self.logger.debug(f"PDF metadata extracted: {metadata}")

            # Step 3: Analyze PDF structure
            analyzed_fields = self.pdf_analysis_service.analyze_pdf(pdf_path)
            page_count = self.pdf_analysis_service.get_page_count(pdf_path)
            self.logger.info(
                f"PDF analysis complete: fields={len(analyzed_fields)}, "
                f"pages={page_count}"
            )

            # Step 4: Persist to database transactionally
            template = self._create_template_records(
                name=name.strip(),
                version=version.strip(),
                file_path=file_path,
                file_size=file_size,
                checksum=checksum,
                sepe_url=sepe_url,
                comment=comment,
                user_id=user_id,
                fields=analyzed_fields,
                metadata=metadata,
                page_count=page_count
            )

            self.logger.info(
                f"Template ingestion complete: template_id={template.id}"
            )
            return template

        except (InvalidPDFError, NoFormFieldsError, ValueError):
            # Clean up file on validation/processing errors
            if file_path and os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    self.logger.info(f"Cleaned up file after error: {file_path}")
                except Exception as cleanup_error:
                    self.logger.error(f"Failed to clean up file: {cleanup_error}")
            raise

        except TemplateIngestionError:
            # File cleanup already handled in _create_template_records
            raise

        except Exception as e:
            # Clean up file on unexpected errors
            if file_path and os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    self.logger.info(f"Cleaned up file after error: {file_path}")
                except Exception as cleanup_error:
                    self.logger.error(f"Failed to clean up file: {cleanup_error}")

            self.logger.error(
                f"Template ingestion failed: {str(e)}", exc_info=True
            )
            raise TemplateIngestionError(
                f"Failed to ingest template: {str(e)}"
            )

    def _save_file(self, file: UploadFile) -> Tuple[str, int, str]:
        """
        Save uploaded file to persistent storage with checksum.

        Generates a unique UUID-based filename and calculates SHA256 checksum
        for file integrity verification.

        Args:
            file: Uploaded file to save

        Returns:
            Tuple of (file_path, file_size_bytes, checksum_sha256)

        Raises:
            ValueError: Invalid file (empty, wrong extension, etc.)
            TemplateIngestionError: File system error
        """
        try:
            # Validate file has a name
            if not file.filename:
                raise ValueError("File must have a filename")

            # Validate PDF extension
            if not file.filename.lower().endswith('.pdf'):
                raise ValueError("Only PDF files are allowed")

            # Read file content
            file_content = file.file.read()
            file_size = len(file_content)

            # Validate file is not empty
            if file_size == 0:
                raise ValueError("File is empty")

            # Calculate SHA256 checksum
            checksum = hashlib.sha256(file_content).hexdigest()

            # Create upload directory if it doesn't exist
            upload_dir = settings.UPLOAD_DIRECTORY
            os.makedirs(upload_dir, exist_ok=True)

            # Generate unique filename with UUID
            file_id = str(uuid.uuid4())
            filename = f"{file_id}.pdf"
            file_path = os.path.join(upload_dir, filename)

            # Save file to disk
            with open(file_path, "wb") as f:
                f.write(file_content)

            self.logger.debug(f"File saved successfully: {file_path}")
            return file_path, file_size, checksum

        except ValueError:
            raise
        except Exception as e:
            self.logger.error(
                f"Failed to save file: {str(e)}", exc_info=True
            )
            raise TemplateIngestionError(
                f"Failed to save file: {str(e)}"
            )

    def _extract_pdf_metadata(self, file_path: Path) -> Dict[str, Any]:
        """
        Extract PDF document metadata using PyPDF2.

        Extracts title, author, subject, creation date, and modification date
        from PDF metadata dictionary.

        Args:
            file_path: Path to PDF file

        Returns:
            Dictionary with metadata fields (None for missing fields)
        """
        metadata = {
            "title": None,
            "author": None,
            "subject": None,
            "creation_date": None,
            "modification_date": None
        }

        try:
            with open(file_path, 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)

                if pdf_reader.metadata:
                    # Extract standard metadata fields
                    metadata["title"] = pdf_reader.metadata.get('/Title')
                    metadata["author"] = pdf_reader.metadata.get('/Author')
                    metadata["subject"] = pdf_reader.metadata.get('/Subject')

                    # Parse creation date
                    creation_date_str = pdf_reader.metadata.get(
                        '/CreationDate'
                    )
                    if creation_date_str:
                        metadata["creation_date"] = self._parse_pdf_date(
                            creation_date_str
                        )

                    # Parse modification date
                    mod_date_str = pdf_reader.metadata.get('/ModDate')
                    if mod_date_str:
                        metadata["modification_date"] = self._parse_pdf_date(
                            mod_date_str
                        )

            self.logger.debug(f"Extracted PDF metadata: {metadata}")
            return metadata

        except Exception as e:
            self.logger.warning(
                f"Failed to extract PDF metadata: {str(e)}. Returning empty metadata."
            )
            return metadata

    def _parse_pdf_date(self, date_str: str) -> Optional[datetime]:
        """
        Parse PDF date string to datetime object.

        PDF dates are in format: D:YYYYMMDDHHmmSSOHH'mm'
        Example: D:20240115103000+01'00'

        Args:
            date_str: PDF date string

        Returns:
            datetime object or None if parsing fails
        """
        try:
            # Remove 'D:' prefix if present
            if date_str.startswith('D:'):
                date_str = date_str[2:]

            # Extract date components (YYYYMMDDHHmmSS)
            if len(date_str) >= 14:
                year = int(date_str[0:4])
                month = int(date_str[4:6])
                day = int(date_str[6:8])
                hour = int(date_str[8:10])
                minute = int(date_str[10:12])
                second = int(date_str[12:14])

                return datetime(year, month, day, hour, minute, second)

        except (ValueError, IndexError) as e:
            self.logger.debug(f"Failed to parse PDF date '{date_str}': {e}")

        return None

    def _create_template_records(
        self,
        name: str,
        version: str,
        file_path: str,
        file_size: int,
        checksum: str,
        sepe_url: Optional[str],
        comment: Optional[str],
        user_id: int,
        fields: List[TemplateFieldData],
        metadata: Dict[str, Any],
        page_count: int
    ) -> PDFTemplate:
        """
        Create database records transactionally.

        Creates PDFTemplate, TemplateVersion, and TemplateField records
        in a single atomic transaction with rollback on failure.

        Args:
            name: Template name
            version: Version identifier
            file_path: Absolute path to saved PDF file
            file_size: File size in bytes
            checksum: SHA256 checksum
            sepe_url: Optional SEPE URL
            user_id: User ID
            fields: List of analyzed field data
            metadata: PDF document metadata
            page_count: Number of pages in PDF

        Returns:
            PDFTemplate: Created template with ID

        Raises:
            TemplateIngestionError: Database transaction failed
        """
        try:
            # Create PDFTemplate record (without version-specific fields)
            template = PDFTemplate(
                name=name,
                current_version=version,
                comment=comment,  # Optional comment from user
                uploaded_by=user_id
            )
            self.db.add(template)
            self.db.flush()  # Get template.id without committing
            self.logger.debug(
                f"Created PDFTemplate: id={template.id}, current_version={version}"
            )

            # Create TemplateVersion record (with version-specific fields)
            template_version = TemplateVersion(
                template_id=template.id,
                version_number=version,
                change_summary="Initial version",
                is_current=True,
                # File information (moved from PDFTemplate)
                file_path=file_path,
                file_size_bytes=file_size,
                field_count=len(fields),
                sepe_url=sepe_url,
                # PDF document metadata
                title=metadata.get("title"),
                author=metadata.get("author"),
                subject=metadata.get("subject"),
                creation_date=metadata.get("creation_date"),
                modification_date=metadata.get("modification_date"),
                page_count=page_count
            )
            self.db.add(template_version)
            self.db.flush()  # Get version.id without committing
            self.logger.debug(
                f"Created TemplateVersion: id={template_version.id}, "
                f"file_path={file_path}, file_size={file_size}, field_count={len(fields)}"
            )

            # Create TemplateField records (bulk insert)
            template_fields = []
            field_order_by_page = {}  # Track order within each page

            for field_data in fields:
                # Determine page number and order (placeholder logic)
                # In a real implementation, this should come from field_data
                page_number = 1  # Default to page 1
                if page_number not in field_order_by_page:
                    field_order_by_page[page_number] = 0
                field_page_order = field_order_by_page[page_number]
                field_order_by_page[page_number] += 1

                template_field = TemplateField(
                    version_id=template_version.id,
                    field_id=field_data.field_id,
                    field_type=field_data.type,
                    raw_type=None,  # Not provided by current analysis
                    page_number=page_number,
                    field_page_order=field_page_order,
                    near_text=field_data.near_text,
                    value_options=field_data.value_options,
                    position_data=None  # Not provided by current analysis
                )
                template_fields.append(template_field)

            # Bulk insert all fields
            self.db.bulk_save_objects(template_fields)
            self.logger.debug(
                f"Created {len(template_fields)} TemplateField records"
            )

            # Commit all changes atomically
            self.db.commit()
            self.db.refresh(template)

            self.logger.info(
                f"Database persist complete: template_id={template.id}, "
                f"version_id={template_version.id}, fields={len(template_fields)}"
            )

            return template

        except SQLAlchemyError as e:
            # Rollback transaction
            self.db.rollback()
            self.logger.error(
                f"Database transaction failed: {str(e)}", exc_info=True
            )

            # Clean up uploaded file
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    self.logger.info(
                        f"Cleaned up file after DB error: {file_path}"
                    )
                except Exception as cleanup_error:
                    self.logger.error(
                        f"Failed to clean up file after DB error: {cleanup_error}"
                    )

            raise TemplateIngestionError(
                f"Failed to persist template data to database: {str(e)}"
            )

        except Exception as e:
            # Rollback on unexpected errors
            self.db.rollback()
            self.logger.error(
                f"Unexpected error during database operations: {str(e)}",
                exc_info=True
            )

            # Clean up uploaded file
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    self.logger.info(f"Cleaned up file after error: {file_path}")
                except Exception as cleanup_error:
                    self.logger.error(
                        f"Failed to clean up file: {cleanup_error}"
                    )

            raise TemplateIngestionError(
                f"Failed to create template records: {str(e)}"
            )

    async def ingest_template_version(
        self,
        file: UploadFile,
        template_id: int,
        version: str,
        change_summary: Optional[str],
        sepe_url: Optional[str],
        user_id: int
    ) -> TemplateVersion:
        """
        Ingest a new version for an existing template.

        This method creates a new version of an existing template by:
        1. Validating the template exists
        2. Saving the PDF file with checksum
        3. Analyzing the PDF structure and fields
        4. Updating version flags (marking old versions as not current)
        5. Creating new version and field records transactionally
        6. Updating the parent template's current_version

        Args:
            file: Uploaded PDF file
            template_id: ID of existing template
            version: Version identifier (1-50 characters)
            change_summary: Optional description of changes
            sepe_url: Optional SEPE source URL
            user_id: ID of user performing the ingestion

        Returns:
            TemplateVersion: Created version with ID and all relationships

        Raises:
            ValueError: Template not found or invalid parameters
            InvalidPDFError: PDF file is corrupted or invalid
            NoFormFieldsError: PDF contains no form fields
            TemplateIngestionError: Database or file system error
        """
        # Validate required fields
        if not version or not version.strip():
            raise ValueError("Template version is required and cannot be empty")
        if len(version) > 50:
            raise ValueError("Template version must be 50 characters or less")

        file_path = None

        try:
            self.logger.info(
                f"Version ingestion started: user={user_id}, "
                f"template_id={template_id}, version={version}"
            )

            # Step 1: Validate template exists
            template = self._validate_template_exists(template_id)
            self.logger.debug(f"Template found: id={template.id}, name={template.name}")

            # Step 2: Save file to persistent storage (REUSE)
            file_path, file_size, checksum = self._save_file(file)
            self.logger.info(
                f"File saved: path={file_path}, size={file_size}, "
                f"checksum={checksum}"
            )

            # Step 3: Extract PDF metadata (REUSE)
            pdf_path = Path(file_path)
            metadata = self._extract_pdf_metadata(pdf_path)
            self.logger.debug(f"PDF metadata extracted: {metadata}")

            # Step 4: Analyze PDF structure (REUSE)
            analyzed_fields = self.pdf_analysis_service.analyze_pdf(pdf_path)
            page_count = self.pdf_analysis_service.get_page_count(pdf_path)
            self.logger.info(
                f"PDF analysis complete: fields={len(analyzed_fields)}, "
                f"pages={page_count}"
            )

            # Step 5: Create version records with atomic version flag updates
            version_record = self._create_version_records(
                template=template,
                version=version.strip(),
                file_path=file_path,
                file_size=file_size,
                checksum=checksum,
                sepe_url=sepe_url,
                change_summary=change_summary,
                fields=analyzed_fields,
                metadata=metadata,
                page_count=page_count
            )

            self.logger.info(
                f"Version ingestion complete: version_id={version_record.id}, "
                f"template_id={template_id}"
            )
            return version_record

        except (InvalidPDFError, NoFormFieldsError, ValueError):
            # Clean up file on validation/processing errors
            if file_path and os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    self.logger.info(f"Cleaned up file after error: {file_path}")
                except Exception as cleanup_error:
                    self.logger.error(f"Failed to clean up file: {cleanup_error}")
            raise

        except TemplateIngestionError:
            # File cleanup already handled in _create_version_records
            raise

        except Exception as e:
            # Clean up file on unexpected errors
            if file_path and os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    self.logger.info(f"Cleaned up file after error: {file_path}")
                except Exception as cleanup_error:
                    self.logger.error(f"Failed to clean up file: {cleanup_error}")

            self.logger.error(
                f"Version ingestion failed: {str(e)}", exc_info=True
            )
            raise TemplateIngestionError(
                f"Failed to ingest version: {str(e)}"
            )

    def _validate_template_exists(self, template_id: int) -> PDFTemplate:
        """
        Validate that a template exists.

        Args:
            template_id: Template ID to validate

        Returns:
            PDFTemplate: The template if found

        Raises:
            ValueError: If template not found
        """
        template = self.db.query(PDFTemplate).filter(
            PDFTemplate.id == template_id
        ).first()

        if not template:
            raise ValueError(f"Template with ID {template_id} not found")

        return template

    def _create_version_records(
        self,
        template: PDFTemplate,
        version: str,
        file_path: str,
        file_size: int,
        checksum: str,
        sepe_url: Optional[str],
        change_summary: Optional[str],
        fields: List[TemplateFieldData],
        metadata: Dict[str, Any],
        page_count: int
    ) -> TemplateVersion:
        """
        Create version and field records with atomic version flag updates.

        This method performs critical version management:
        1. Marks all existing versions as is_current=False
        2. Creates new version with is_current=True
        3. Updates parent template's current_version
        4. Creates all field records
        All in a single atomic transaction.

        Args:
            template: Parent template object
            version: Version identifier
            file_path: Absolute path to saved PDF file
            file_size: File size in bytes
            checksum: SHA256 checksum
            sepe_url: Optional SEPE URL
            change_summary: Optional change description
            fields: List of analyzed field data
            metadata: PDF document metadata
            page_count: Number of pages in PDF

        Returns:
            TemplateVersion: Created version with ID

        Raises:
            TemplateIngestionError: Database transaction failed
        """
        try:
            # CRITICAL: Mark all existing versions as not current
            existing_versions = self.db.query(TemplateVersion).filter(
                TemplateVersion.template_id == template.id
            ).all()

            for existing_version in existing_versions:
                existing_version.is_current = False

            self.logger.debug(
                f"Marked {len(existing_versions)} existing versions as not current"
            )

            # Create new TemplateVersion record (marked as current)
            new_version = TemplateVersion(
                template_id=template.id,
                version_number=version,
                change_summary=change_summary,
                is_current=True,  # New version is always current
                # File information
                file_path=file_path,
                file_size_bytes=file_size,
                field_count=len(fields),
                sepe_url=sepe_url,
                # PDF document metadata
                title=metadata.get("title"),
                author=metadata.get("author"),
                subject=metadata.get("subject"),
                creation_date=metadata.get("creation_date"),
                modification_date=metadata.get("modification_date"),
                page_count=page_count
            )
            self.db.add(new_version)
            self.db.flush()  # Get version.id without committing
            self.logger.debug(
                f"Created TemplateVersion: id={new_version.id}, "
                f"version_number={version}, is_current=True"
            )

            # Create TemplateField records (bulk insert)
            template_fields = []
            field_order_by_page = {}  # Track order within each page

            for field_data in fields:
                # Determine page number and order
                page_number = 1  # Default to page 1
                if page_number not in field_order_by_page:
                    field_order_by_page[page_number] = 0
                field_page_order = field_order_by_page[page_number]
                field_order_by_page[page_number] += 1

                template_field = TemplateField(
                    version_id=new_version.id,
                    field_id=field_data.field_id,
                    field_type=field_data.type,
                    raw_type=None,  # Not provided by current analysis
                    page_number=page_number,
                    field_page_order=field_page_order,
                    near_text=field_data.near_text,
                    value_options=field_data.value_options,
                    position_data=None  # Not provided by current analysis
                )
                template_fields.append(template_field)

            # Bulk insert all fields
            self.db.bulk_save_objects(template_fields)
            self.logger.debug(
                f"Created {len(template_fields)} TemplateField records"
            )

            # Update parent template's current_version
            template.current_version = version
            self.logger.debug(
                f"Updated template current_version to: {version}"
            )

            # Commit all changes atomically
            self.db.commit()
            self.db.refresh(new_version)

            self.logger.info(
                f"Version persist complete: version_id={new_version.id}, "
                f"fields={len(template_fields)}, is_current=True"
            )

            return new_version

        except SQLAlchemyError as e:
            # Rollback transaction
            self.db.rollback()
            self.logger.error(
                f"Database transaction failed: {str(e)}", exc_info=True
            )

            # Clean up uploaded file
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    self.logger.info(
                        f"Cleaned up file after DB error: {file_path}"
                    )
                except Exception as cleanup_error:
                    self.logger.error(
                        f"Failed to clean up file after DB error: {cleanup_error}"
                    )

            raise TemplateIngestionError(
                f"Failed to persist version data to database: {str(e)}"
            )

        except Exception as e:
            # Rollback on unexpected errors
            self.db.rollback()
            self.logger.error(
                f"Unexpected error during version creation: {str(e)}",
                exc_info=True
            )

            # Clean up uploaded file
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    self.logger.info(f"Cleaned up file after error: {file_path}")
                except Exception as cleanup_error:
                    self.logger.error(
                        f"Failed to clean up file: {cleanup_error}"
                    )

            raise TemplateIngestionError(
                f"Failed to create version records: {str(e)}"
            )

