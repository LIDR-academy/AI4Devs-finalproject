"""
Tests for TemplateService.

Tests the complete template ingestion workflow including file storage,
PDF analysis, metadata extraction, and transactional database persistence.
"""
import pytest
import tempfile
import os
import hashlib
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
from fastapi import UploadFile
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.services.template_service import TemplateService, TemplateIngestionError
from app.services.pdf_analysis_service import (
    TemplateFieldData,
    PDFProcessingError,
    InvalidPDFError,
    NoFormFieldsError
)
from app.models.template import PDFTemplate, TemplateVersion, TemplateField
from app.core.config import settings


class TestTemplateService:
    """Test cases for TemplateService."""

    @pytest.fixture
    def db_session(self):
        """Create mock database session."""
        session = Mock(spec=Session)
        session.add = Mock()
        session.flush = Mock()
        session.commit = Mock()
        session.rollback = Mock()
        session.refresh = Mock()
        session.bulk_save_objects = Mock()
        return session

    @pytest.fixture
    def template_service(self, db_session):
        """Create TemplateService instance."""
        return TemplateService(db_session)

    @pytest.fixture
    def sample_pdf_content(self):
        """Create sample PDF content for testing."""
        return b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n%%EOF"

    @pytest.fixture
    def mock_upload_file(self, sample_pdf_content):
        """Create mock UploadFile."""
        mock_file = Mock(spec=UploadFile)
        mock_file.filename = "test_template.pdf"
        mock_file.read = Mock(return_value=sample_pdf_content)
        mock_file.file = Mock()
        mock_file.file.read = Mock(return_value=sample_pdf_content)
        return mock_file

    @pytest.fixture
    def mock_analysis_results(self):
        """Mock PDF analysis results."""
        return [
            TemplateFieldData(
                field_id="A0101",
                type="text",
                near_text="hasta un máximo de",
                value_options=None
            ),
            TemplateFieldData(
                field_id="A0102",
                type="text",
                near_text="que suponen un",
                value_options=None
            ),
            TemplateFieldData(
                field_id="B0201",
                type="radiobutton",
                near_text="Seleccione una opción:",
                value_options=["Sí", "No"]
            )
        ]

    @pytest.fixture
    def mock_pdf_metadata(self):
        """Mock PDF document metadata."""
        return {
            "title": "Solicitud de Prestación",
            "author": "SEPE",
            "subject": "Prestaciones",
            "creation_date": datetime(2024, 1, 15, 10, 30, 0),
            "modification_date": datetime(2024, 1, 20, 14, 45, 0)
        }

    # Test: File Storage

    def test_save_file_success(self, template_service, mock_upload_file):
        """Test successful file save with checksum calculation."""
        with patch('app.services.template_service.settings') as mock_settings:
            mock_settings.UPLOAD_DIRECTORY = tempfile.gettempdir()
            
            # Execute
            file_path, file_size, checksum = template_service._save_file(mock_upload_file)
            
            # Assertions
            assert file_path is not None
            assert file_path.endswith('.pdf')
            assert file_size > 0
            assert len(checksum) == 64  # SHA256 produces 64-char hex string
            assert checksum == hashlib.sha256(mock_upload_file.read()).hexdigest()
            
            # Cleanup
            if os.path.exists(file_path):
                os.remove(file_path)

    def test_save_file_generates_unique_names(self, template_service, mock_upload_file):
        """Test that multiple saves generate unique filenames."""
        with patch('app.services.template_service.settings') as mock_settings:
            mock_settings.UPLOAD_DIRECTORY = tempfile.gettempdir()
            
            # Save twice
            path1, _, _ = template_service._save_file(mock_upload_file)
            path2, _, _ = template_service._save_file(mock_upload_file)
            
            # Should be different paths
            assert path1 != path2
            
            # Cleanup
            for path in [path1, path2]:
                if os.path.exists(path):
                    os.remove(path)

    def test_save_file_creates_upload_directory(self, template_service, mock_upload_file):
        """Test that upload directory is created if it doesn't exist."""
        with tempfile.TemporaryDirectory() as temp_dir:
            upload_dir = os.path.join(temp_dir, "uploads")
            
            with patch('app.services.template_service.settings') as mock_settings:
                mock_settings.UPLOAD_DIRECTORY = upload_dir
                
                # Directory shouldn't exist yet
                assert not os.path.exists(upload_dir)
                
                # Execute
                file_path, _, _ = template_service._save_file(mock_upload_file)
                
                # Directory should now exist
                assert os.path.exists(upload_dir)
                assert os.path.exists(file_path)
                
                # Cleanup
                os.remove(file_path)

    def test_save_file_handles_empty_file(self, template_service):
        """Test handling of empty file upload."""
        mock_file = Mock(spec=UploadFile)
        mock_file.filename = "empty.pdf"
        mock_file.file = Mock()
        mock_file.file.read = Mock(return_value=b"")
        
        with pytest.raises(ValueError, match="File is empty"):
            template_service._save_file(mock_file)

    def test_save_file_validates_pdf_extension(self, template_service):
        """Test file extension validation."""
        mock_file = Mock(spec=UploadFile)
        mock_file.filename = "test.txt"
        mock_file.file = Mock()
        mock_file.file.read = Mock(return_value=b"some content")
        
        with pytest.raises(ValueError, match="Only PDF files are allowed"):
            template_service._save_file(mock_file)

    # Test: PDF Metadata Extraction

    def test_extract_pdf_metadata_success(self, template_service, mock_pdf_metadata):
        """Test successful PDF metadata extraction."""
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
            # Write minimal PDF
            temp_file.write(b"%PDF-1.4\n")
            temp_file_path = Path(temp_file.name)
        
        try:
            with patch('app.services.template_service.PyPDF2.PdfReader') as mock_reader:
                # Setup mock PDF reader
                mock_pdf = Mock()
                mock_pdf.metadata = {
                    '/Title': 'Solicitud de Prestación',
                    '/Author': 'SEPE',
                    '/Subject': 'Prestaciones',
                    '/CreationDate': 'D:20240115103000',
                    '/ModDate': 'D:20240120144500'
                }
                mock_reader.return_value = mock_pdf
                
                # Execute
                metadata = template_service._extract_pdf_metadata(temp_file_path)
                
                # Assertions
                assert metadata['title'] == 'Solicitud de Prestación'
                assert metadata['author'] == 'SEPE'
                assert metadata['subject'] == 'Prestaciones'
                assert 'creation_date' in metadata
                assert 'modification_date' in metadata
        finally:
            os.remove(temp_file_path)

    def test_extract_pdf_metadata_handles_missing_fields(self, template_service):
        """Test handling of PDFs with missing metadata fields."""
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
            temp_file.write(b"%PDF-1.4\n")
            temp_file_path = Path(temp_file.name)
        
        try:
            with patch('app.services.template_service.PyPDF2.PdfReader') as mock_reader:
                # Setup mock with no metadata
                mock_pdf = Mock()
                mock_pdf.metadata = {}
                mock_reader.return_value = mock_pdf
                
                # Execute
                metadata = template_service._extract_pdf_metadata(temp_file_path)
                
                # Should return None for missing fields
                assert metadata['title'] is None
                assert metadata['author'] is None
                assert metadata['subject'] is None
        finally:
            os.remove(temp_file_path)

    def test_extract_pdf_metadata_handles_corrupted_pdf(self, template_service):
        """Test handling of corrupted PDF file."""
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
            temp_file.write(b"not a pdf")
            temp_file_path = Path(temp_file.name)
        
        try:
            with patch('app.services.template_service.PyPDF2.PdfReader') as mock_reader:
                mock_reader.side_effect = Exception("Invalid PDF")
                
                # Execute
                metadata = template_service._extract_pdf_metadata(temp_file_path)
                
                # Should return empty metadata dict on error
                assert isinstance(metadata, dict)
        finally:
            os.remove(temp_file_path)

    # Test: Database Record Creation

    def test_create_template_records_success(
        self, 
        template_service, 
        db_session, 
        mock_analysis_results,
        mock_pdf_metadata
    ):
        """Test successful creation of all database records."""
        # Setup mock template with ID after flush
        mock_template = Mock(spec=PDFTemplate)
        mock_template.id = 1
        mock_template.field_count = len(mock_analysis_results)
        
        mock_version = Mock(spec=TemplateVersion)
        mock_version.id = 1
        
        def flush_side_effect():
            """Simulate database flush assigning IDs."""
            if db_session.add.call_count == 1:
                # First add is template
                template_arg = db_session.add.call_args[0][0]
                template_arg.id = 1
            elif db_session.add.call_count == 2:
                # Second add is version
                version_arg = db_session.add.call_args[0][0]
                version_arg.id = 1
        
        db_session.flush.side_effect = flush_side_effect
        
        # Execute
        result = template_service._create_template_records(
            name="Test Template",
            version="1.0",
            file_path="/app/uploads/test.pdf",
            file_size=1024,
            checksum="abc123",
            sepe_url="https://www.sepe.es/test",
            user_id=1,
            fields=mock_analysis_results,
            metadata=mock_pdf_metadata,
            page_count=3
        )
        
        # Assertions
        assert db_session.add.call_count == 2  # Template and Version
        assert db_session.flush.call_count == 2  # After each add
        assert db_session.bulk_save_objects.call_count == 1  # Fields
        assert db_session.commit.call_count == 1
        
        # Verify template was created
        template_call = db_session.add.call_args_list[0][0][0]
        assert isinstance(template_call, PDFTemplate)
        assert template_call.name == "Test Template"
        assert template_call.version == "1.0"
        assert template_call.field_count == 3
        
        # Verify version was created
        version_call = db_session.add.call_args_list[1][0][0]
        assert isinstance(version_call, TemplateVersion)
        assert version_call.version_number == "1.0"
        assert version_call.is_current is True
        assert version_call.page_count == 3
        
        # Verify fields were created
        fields_call = db_session.bulk_save_objects.call_args[0][0]
        assert len(fields_call) == 3
        assert all(isinstance(f, TemplateField) for f in fields_call)

    def test_create_template_records_rollback_on_error(
        self, 
        template_service, 
        db_session,
        mock_analysis_results,
        mock_pdf_metadata
    ):
        """Test transaction rollback on database error."""
        # Simulate database error on commit
        db_session.commit.side_effect = SQLAlchemyError("Database error")
        
        # Execute and expect exception
        with pytest.raises(TemplateIngestionError, match="Failed to persist template data"):
            template_service._create_template_records(
                name="Test Template",
                version="1.0",
                file_path="/app/uploads/test.pdf",
                file_size=1024,
                checksum="abc123",
                sepe_url=None,
                user_id=1,
                fields=mock_analysis_results,
                metadata=mock_pdf_metadata,
                page_count=3
            )
        
        # Verify rollback was called
        assert db_session.rollback.call_count == 1

    # Test: Complete Ingestion Workflow

    @pytest.mark.asyncio
    async def test_ingest_template_success(
        self, 
        template_service, 
        db_session,
        mock_upload_file,
        mock_analysis_results,
        mock_pdf_metadata
    ):
        """Test complete successful ingestion workflow."""
        with patch.object(template_service, '_save_file') as mock_save:
            with patch.object(template_service, '_extract_pdf_metadata') as mock_extract_meta:
                with patch.object(template_service, '_create_template_records') as mock_create:
                    with patch.object(template_service.pdf_analysis_service, 'analyze_pdf') as mock_analyze:
                        with patch.object(template_service.pdf_analysis_service, 'get_page_count') as mock_page_count:
                            # Setup mocks
                            mock_save.return_value = ("/app/uploads/test.pdf", 1024, "abc123")
                            mock_extract_meta.return_value = mock_pdf_metadata
                            mock_analyze.return_value = mock_analysis_results
                            mock_page_count.return_value = 3
                            
                            mock_template = Mock(spec=PDFTemplate)
                            mock_template.id = 1
                            mock_template.name = "Test Template"
                            mock_create.return_value = mock_template
                            
                            # Execute
                            result = await template_service.ingest_template(
                                file=mock_upload_file,
                                name="Test Template",
                                version="1.0",
                                sepe_url="https://www.sepe.es/test",
                                user_id=1
                            )
                            
                            # Assertions
                            assert result == mock_template
                            mock_save.assert_called_once()
                            mock_extract_meta.assert_called_once()
                            mock_analyze.assert_called_once()
                            mock_page_count.assert_called_once()
                            mock_create.assert_called_once()

    @pytest.mark.asyncio
    async def test_ingest_template_invalid_pdf(
        self, 
        template_service,
        mock_upload_file
    ):
        """Test ingestion fails with invalid PDF."""
        with patch.object(template_service, '_save_file') as mock_save:
            with patch.object(template_service.pdf_analysis_service, 'analyze_pdf') as mock_analyze:
                # Setup mocks
                mock_save.return_value = ("/app/uploads/test.pdf", 1024, "abc123")
                mock_analyze.side_effect = InvalidPDFError("Invalid PDF file")
                
                # Execute and expect exception
                with pytest.raises(InvalidPDFError):
                    await template_service.ingest_template(
                        file=mock_upload_file,
                        name="Test Template",
                        version="1.0",
                        sepe_url=None,
                        user_id=1
                    )
                
                # Verify file cleanup
                # Note: In actual implementation, should verify os.remove was called

    @pytest.mark.asyncio
    async def test_ingest_template_no_form_fields(
        self, 
        template_service,
        mock_upload_file
    ):
        """Test ingestion fails when PDF has no form fields."""
        with patch.object(template_service, '_save_file') as mock_save:
            with patch.object(template_service.pdf_analysis_service, 'analyze_pdf') as mock_analyze:
                # Setup mocks
                mock_save.return_value = ("/app/uploads/test.pdf", 1024, "abc123")
                mock_analyze.side_effect = NoFormFieldsError("No form fields found")
                
                # Execute and expect exception
                with pytest.raises(NoFormFieldsError):
                    await template_service.ingest_template(
                        file=mock_upload_file,
                        name="Test Template",
                        version="1.0",
                        sepe_url=None,
                        user_id=1
                    )

    @pytest.mark.asyncio
    async def test_ingest_template_cleans_up_on_db_error(
        self, 
        template_service,
        db_session,
        mock_upload_file,
        mock_analysis_results,
        mock_pdf_metadata
    ):
        """Test file cleanup when database operation fails."""
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
            temp_file_path = temp_file.name
        
        try:
            with patch.object(template_service, '_save_file') as mock_save:
                with patch.object(template_service, '_extract_pdf_metadata') as mock_extract:
                    with patch.object(template_service, '_create_template_records') as mock_create:
                        with patch.object(template_service.pdf_analysis_service, 'analyze_pdf') as mock_analyze:
                            with patch.object(template_service.pdf_analysis_service, 'get_page_count') as mock_count:
                                with patch('app.services.template_service.os.path.exists') as mock_exists:
                                    with patch('app.services.template_service.os.remove') as mock_remove:
                                        # Setup mocks
                                        mock_save.return_value = (temp_file_path, 1024, "abc123")
                                        mock_extract.return_value = mock_pdf_metadata
                                        mock_analyze.return_value = mock_analysis_results
                                        mock_count.return_value = 3
                                        mock_create.side_effect = TemplateIngestionError("DB error")
                                        mock_exists.return_value = True
                                        
                                        # Execute and expect exception
                                        with pytest.raises(TemplateIngestionError):
                                            await template_service.ingest_template(
                                                file=mock_upload_file,
                                                name="Test Template",
                                                version="1.0",
                                                sepe_url=None,
                                                user_id=1
                                            )
                                        
                                        # Verify file cleanup was attempted
                                        mock_remove.assert_called_once_with(temp_file_path)
        finally:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)

    @pytest.mark.asyncio
    async def test_ingest_template_validates_required_fields(
        self,
        template_service,
        mock_upload_file
    ):
        """Test validation of required fields."""
        # Test missing name
        with pytest.raises(ValueError, match="name"):
            await template_service.ingest_template(
                file=mock_upload_file,
                name="",
                version="1.0",
                sepe_url=None,
                comment=None,
                user_id=1
            )
        
        # Test missing version
        with pytest.raises(ValueError, match="version"):
            await template_service.ingest_template(
                file=mock_upload_file,
                name="Test",
                version="",
                sepe_url=None,
                comment=None,
                user_id=1
            )


class TestTemplateVersionIngestion:
    """Test cases for version ingestion workflow."""
    
    @pytest.fixture
    def db_session(self):
        """Create mock database session."""
        session = Mock(spec=Session)
        session.add = Mock()
        session.flush = Mock()
        session.commit = Mock()
        session.rollback = Mock()
        session.refresh = Mock()
        session.bulk_save_objects = Mock()
        session.query = Mock()
        return session
    
    @pytest.fixture
    def template_service(self, db_session):
        """Create TemplateService instance."""
        return TemplateService(db_session)
    
    @pytest.fixture
    def existing_template(self):
        """Mock existing template."""
        template = Mock(spec=PDFTemplate)
        template.id = 10
        template.name = "Solicitud Prestación"
        template.current_version = "2024-Q1"
        return template
    
    @pytest.fixture
    def existing_version(self):
        """Mock existing version (currently is_current)."""
        version = Mock(spec=TemplateVersion)
        version.id = 5
        version.template_id = 10
        version.version_number = "2024-Q1"
        version.is_current = True
        return version
    
    @pytest.fixture
    def mock_upload_file(self):
        """Create mock UploadFile."""
        sample_content = b"%PDF-1.4\ntest content"
        mock_file = Mock(spec=UploadFile)
        mock_file.filename = "test_v2.pdf"
        mock_file.file = Mock()
        mock_file.file.read = Mock(return_value=sample_content)
        return mock_file
    
    @pytest.fixture
    def mock_analysis_results(self):
        """Mock PDF analysis results."""
        return [
            TemplateFieldData(
                field_id="A0101",
                type="text",
                near_text="Campo actualizado",
                value_options=None
            ),
            TemplateFieldData(
                field_id="A0102",
                type="text",
                near_text="Nuevo campo añadido",
                value_options=None
            )
        ]
    
    # Test: Template Validation
    
    @pytest.mark.asyncio
    async def test_ingest_version_template_not_found(
        self,
        template_service,
        db_session,
        mock_upload_file
    ):
        """Test version ingestion fails when template doesn't exist."""
        # Setup mock query to return None
        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = None
        db_session.query.return_value = mock_query
        
        # Execute and expect ValueError
        with pytest.raises(ValueError, match="Template with ID 999 not found"):
            await template_service.ingest_template_version(
                file=mock_upload_file,
                template_id=999,
                version="2024-Q2",
                change_summary="Updated fields",
                sepe_url=None,
                user_id=1
            )
    
    # Test: Version Flag Updates (Critical!)
    
    @pytest.mark.asyncio
    async def test_ingest_version_updates_is_current_flags(
        self,
        template_service,
        db_session,
        existing_template,
        existing_version,
        mock_upload_file,
        mock_analysis_results
    ):
        """Test that existing versions are marked as not current."""
        # Setup mocks
        mock_query_template = Mock()
        mock_query_template.filter.return_value.first.return_value = existing_template
        
        mock_query_versions = Mock()
        mock_query_versions.filter.return_value.all.return_value = [
            existing_version
        ]
        
        # Configure query mock to return different results
        def query_side_effect(model):
            if model == PDFTemplate:
                return mock_query_template
            elif model == TemplateVersion:
                return mock_query_versions
            return Mock()
        
        db_session.query.side_effect = query_side_effect
        
        with patch.object(template_service, '_save_file') as mock_save:
            with patch.object(template_service, '_extract_pdf_metadata') as mock_meta:
                with patch.object(
                    template_service.pdf_analysis_service,
                    'analyze_pdf'
                ) as mock_analyze:
                    with patch.object(
                        template_service.pdf_analysis_service,
                        'get_page_count'
                    ) as mock_count:
                        # Setup return values
                        mock_save.return_value = ("/app/test.pdf", 2048, "xyz789")
                        mock_meta.return_value = {}
                        mock_analyze.return_value = mock_analysis_results
                        mock_count.return_value = 2
                        
                        # Execute
                        result = await template_service.ingest_template_version(
                            file=mock_upload_file,
                            template_id=10,
                            version="2024-Q2",
                            change_summary="Updated fields",
                            sepe_url=None,
                            user_id=1
                        )
                        
                        # Verify existing version was marked as not current
                        assert existing_version.is_current is False
                        
                        # Verify new version was created
                        assert db_session.add.called
                        assert db_session.commit.called
    
    # Test: Complete Workflow
    
    @pytest.mark.asyncio
    async def test_ingest_version_complete_workflow(
        self,
        template_service,
        db_session,
        existing_template,
        mock_upload_file,
        mock_analysis_results
    ):
        """Test complete version ingestion workflow."""
        # Setup mocks
        mock_query_template = Mock()
        mock_query_template.filter.return_value.first.return_value = (
            existing_template
        )
        
        mock_query_versions = Mock()
        mock_query_versions.filter.return_value.all.return_value = []
        
        def query_side_effect(model):
            if model == PDFTemplate:
                return mock_query_template
            elif model == TemplateVersion:
                return mock_query_versions
            return Mock()
        
        db_session.query.side_effect = query_side_effect
        
        # Setup flush to assign IDs
        def flush_side_effect():
            if db_session.add.call_count > 0:
                version_arg = db_session.add.call_args[0][0]
                if isinstance(version_arg, TemplateVersion):
                    version_arg.id = 100
        
        db_session.flush.side_effect = flush_side_effect
        
        with patch.object(template_service, '_save_file') as mock_save:
            with patch.object(template_service, '_extract_pdf_metadata') as mock_meta:
                with patch.object(
                    template_service.pdf_analysis_service,
                    'analyze_pdf'
                ) as mock_analyze:
                    with patch.object(
                        template_service.pdf_analysis_service,
                        'get_page_count'
                    ) as mock_count:
                        # Setup return values
                        mock_save.return_value = ("/app/test.pdf", 2048, "xyz789")
                        mock_meta.return_value = {
                            "title": "Updated Form",
                            "author": "SEPE",
                            "subject": "V2",
                            "creation_date": None,
                            "modification_date": None
                        }
                        mock_analyze.return_value = mock_analysis_results
                        mock_count.return_value = 2
                        
                        # Execute
                        result = await template_service.ingest_template_version(
                            file=mock_upload_file,
                            template_id=10,
                            version="2024-Q2",
                            change_summary="Updated fields for new regulations",
                            sepe_url="https://www.sepe.es/v2",
                            user_id=1
                        )
                        
                        # Verify result
                        assert result.id == 100
                        assert result.version_number == "2024-Q2"
                        assert result.is_current is True
                        assert result.template_id == 10
                        
                        # Verify all steps were called
                        mock_save.assert_called_once()
                        mock_meta.assert_called_once()
                        mock_analyze.assert_called_once()
                        mock_count.assert_called_once()
                        
                        # Verify database operations
                        assert db_session.add.called
                        assert db_session.bulk_save_objects.called
                        assert db_session.commit.called
                        
                        # Verify template current_version was updated
                        assert existing_template.current_version == "2024-Q2"
    
    # Test: Error Handling
    
    @pytest.mark.asyncio
    async def test_ingest_version_rollback_on_db_error(
        self,
        template_service,
        db_session,
        existing_template,
        mock_upload_file
    ):
        """Test transaction rollback when database error occurs."""
        # Setup template query
        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = existing_template
        db_session.query.return_value = mock_query
        
        # Simulate database error on commit
        db_session.commit.side_effect = SQLAlchemyError("Connection lost")
        
        with patch.object(template_service, '_save_file') as mock_save:
            with patch.object(template_service, '_extract_pdf_metadata'):
                with patch.object(
                    template_service.pdf_analysis_service,
                    'analyze_pdf'
                ) as mock_analyze:
                    with patch.object(
                        template_service.pdf_analysis_service,
                        'get_page_count'
                    ):
                        with patch('app.services.template_service.os.path.exists') as mock_exists:
                            with patch('app.services.template_service.os.remove') as mock_remove:
                                # Setup
                                mock_save.return_value = ("/app/test.pdf", 1024, "abc")
                                mock_analyze.return_value = []
                                mock_exists.return_value = True
                                
                                # Execute and expect error
                                with pytest.raises(
                                    TemplateIngestionError,
                                    match="Failed to persist"
                                ):
                                    await template_service.ingest_template_version(
                                        file=mock_upload_file,
                                        template_id=10,
                                        version="2024-Q2",
                                        change_summary="Test",
                                        sepe_url=None,
                                        user_id=1
                                    )
                                
                                # Verify rollback and cleanup
                                db_session.rollback.assert_called_once()
                                mock_remove.assert_called()
    
    # Test: Field Cleanup on Failure
    
    @pytest.mark.asyncio
    async def test_ingest_version_cleans_file_on_analysis_error(
        self,
        template_service,
        db_session,
        existing_template,
        mock_upload_file
    ):
        """Test file is cleaned up when PDF analysis fails."""
        # Setup template query
        mock_query = Mock()
        mock_query.filter.return_value.first.return_value = existing_template
        db_session.query.return_value = mock_query
        
        with patch.object(template_service, '_save_file') as mock_save:
            with patch.object(
                template_service.pdf_analysis_service,
                'analyze_pdf'
            ) as mock_analyze:
                with patch('app.services.template_service.os.path.exists') as mock_exists:
                    with patch('app.services.template_service.os.remove') as mock_remove:
                        # Setup
                        temp_path = "/app/temp/test.pdf"
                        mock_save.return_value = (temp_path, 1024, "abc")
                        mock_analyze.side_effect = InvalidPDFError("Corrupted PDF")
                        mock_exists.return_value = True
                        
                        # Execute and expect error
                        with pytest.raises(InvalidPDFError):
                            await template_service.ingest_template_version(
                                file=mock_upload_file,
                                template_id=10,
                                version="2024-Q2",
                                change_summary=None,
                                sepe_url=None,
                                user_id=1
                            )
                        
                        # Verify file cleanup
                        mock_remove.assert_called_with(temp_path)

