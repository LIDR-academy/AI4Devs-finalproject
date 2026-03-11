"""
Tests for PDF analysis service.

Tests the core PDF processing functionality including AcroForm field extraction,
text proximity detection, field ordering, and error handling.
"""
import pytest
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
from typing import List, Dict, Any, Optional
import tempfile
import io

from app.services.pdf_analysis_service import (
    PDFAnalysisService,
    TemplateFieldData,
    PDFProcessingError,
    InvalidPDFError,
    NoFormFieldsError
)


class TestPDFAnalysisService:
    """Test cases for PDF analysis service functionality."""

    @pytest.fixture
    def pdf_service(self):
        """Create PDF analysis service instance."""
        return PDFAnalysisService()

    @pytest.fixture
    def sample_pdf_path(self):
        """Path to sample PDF for testing."""
        return Path(__file__).parent.parent.parent / "exampleTemplates" / "HorasComplementarias.pdf"

    @pytest.fixture
    def mock_pdf_fields(self):
        """Mock PDF form fields data."""
        return [
            {
                "field_name": "/A0101",
                "field_type": "/Tx",  # Text field
                "rect": [100, 700, 200, 720],  # x1, y1, x2, y2
                "page": 0
            },
            {
                "field_name": "/A0102", 
                "field_type": "/Tx",
                "rect": [100, 680, 200, 700],
                "page": 0
            },
            {
                "field_name": "/B0201",
                "field_type": "/Btn",  # Button field (radio/checkbox)
                "rect": [100, 660, 200, 680],
                "page": 0,
                "options": ["Sí", "No"]
            }
        ]

    @pytest.fixture
    def mock_text_elements(self):
        """Mock text elements from PDF."""
        return [
            {
                "text": "hasta un máximo de",
                "x0": 50, "y0": 705, "x1": 95, "y1": 715,
                "page": 0
            },
            {
                "text": "que suponen un", 
                "x0": 50, "y0": 685, "x1": 95, "y1": 695,
                "page": 0
            },
            {
                "text": "Seleccione una opción:",
                "x0": 50, "y0": 665, "x1": 95, "y1": 675, 
                "page": 0
            }
        ]

    def test_analyze_pdf_success(self, pdf_service, sample_pdf_path):
        """Test successful PDF analysis with real file."""
        # This test will work when the service is implemented
        if sample_pdf_path.exists():
            with patch.object(pdf_service, '_extract_form_fields') as mock_extract:
                with patch.object(pdf_service, '_extract_text_elements') as mock_text:
                    # Mock the extraction methods
                    mock_extract.return_value = [
                        {
                            "field_name": "A0101",
                            "field_type": "text",
                            "rect": [100, 700, 200, 720],
                            "page": 0
                        }
                    ]
                    mock_text.return_value = [
                        {
                            "text": "hasta un máximo de",
                            "x0": 50, "y0": 705, "x1": 95, "y1": 715,
                            "page": 0
                        }
                    ]
                    
                    # Act
                    result = pdf_service.analyze_pdf(sample_pdf_path)
                    
                    # Assert
                    assert isinstance(result, list)
                    assert len(result) > 0
                    assert all(isinstance(field, TemplateFieldData) for field in result)

    def test_extract_form_fields_with_pypdf2(self, pdf_service, mock_pdf_fields):
        """Test form field extraction using PyPDF2."""
        with patch('PyPDF2.PdfReader') as mock_reader:
            # Setup mock PDF reader
            mock_page = Mock()
            mock_page.get('/Annots', [])
            mock_reader.return_value.pages = [mock_page]
            
            # Mock form fields
            mock_form_fields = []
            for field_data in mock_pdf_fields:
                mock_field = Mock()
                mock_field.get.side_effect = lambda key, default=None: field_data.get(key.replace('/', ''), default)
                mock_form_fields.append(mock_field)
            
            mock_reader.return_value.get_form_text_fields.return_value = mock_form_fields
            
            # Act
            with tempfile.NamedTemporaryFile(suffix='.pdf') as temp_file:
                temp_path = Path(temp_file.name)
                fields = pdf_service._extract_form_fields(temp_path)
            
            # Assert
            assert len(fields) == len(mock_pdf_fields)
            assert all('field_name' in field for field in fields)
            assert all('field_type' in field for field in fields)

    def test_extract_text_elements_with_pdfplumber(self, pdf_service, mock_text_elements):
        """Test text extraction using pdfplumber."""
        with patch('pdfplumber.open') as mock_open:
            # Setup mock pdfplumber
            mock_page = Mock()
            mock_page.extract_words.return_value = [
                {
                    'text': elem['text'],
                    'x0': elem['x0'], 'y0': elem['y0'],
                    'x1': elem['x1'], 'y1': elem['y1']
                }
                for elem in mock_text_elements
            ]
            
            mock_pdf = Mock()
            mock_pdf.pages = [mock_page]
            mock_open.return_value.__enter__.return_value = mock_pdf
            
            # Act
            with tempfile.NamedTemporaryFile(suffix='.pdf') as temp_file:
                temp_path = Path(temp_file.name)
                text_elements = pdf_service._extract_text_elements(temp_path)
            
            # Assert
            assert len(text_elements) == len(mock_text_elements)
            assert all('text' in elem for elem in text_elements)
            assert all('x0' in elem for elem in text_elements)

    def test_find_nearest_text_left_side(self, pdf_service, mock_text_elements):
        """Test finding nearest text on the left side of a field."""
        # Arrange
        field_rect = [100, 700, 200, 720]  # Field position
        
        # Act
        nearest_text = pdf_service._find_nearest_text(field_rect, mock_text_elements, 0)
        
        # Assert
        assert nearest_text == "hasta un máximo de"  # Should find the closest left text

    def test_field_ordering_preservation(self, pdf_service, mock_pdf_fields):
        """Test that fields are ordered correctly by position."""
        # Arrange - fields with different positions
        unordered_fields = [
            {"rect": [100, 600, 200, 620], "page": 0, "field_name": "field3"},  # Bottom
            {"rect": [100, 700, 200, 720], "page": 0, "field_name": "field1"},  # Top
            {"rect": [100, 650, 200, 670], "page": 0, "field_name": "field2"},  # Middle
        ]
        
        # Act
        ordered_fields = pdf_service._sort_fields_by_position(unordered_fields)
        
        # Assert
        assert ordered_fields[0]["field_name"] == "field1"  # Top field first
        assert ordered_fields[1]["field_name"] == "field2"  # Middle field second
        assert ordered_fields[2]["field_name"] == "field3"  # Bottom field last

    def test_field_type_detection(self, pdf_service):
        """Test detection of different field types."""
        # Test text field
        text_field = {"field_type": "/Tx"}
        assert pdf_service._get_field_type(text_field) == "text"
        
        # Test button field (radio/checkbox)
        button_field = {"field_type": "/Btn", "options": ["Yes", "No"]}
        assert pdf_service._get_field_type(button_field) == "radiobutton"
        
        # Test choice field (listbox)
        choice_field = {"field_type": "/Ch", "options": ["Option1", "Option2", "Option3"]}
        assert pdf_service._get_field_type(choice_field) == "listbox"

    def test_field_id_extraction(self, pdf_service):
        """Test field ID extraction and generation."""
        # Test with existing field name
        field_with_name = {"field_name": "/A0101"}
        assert pdf_service._extract_field_id(field_with_name) == "A0101"
        
        # Test with field name needing cleanup
        field_with_prefix = {"field_name": "form1[0].#subform[0].A0102[0]"}
        assert pdf_service._extract_field_id(field_with_prefix) == "A0102"
        
        # Test with missing field name (should generate)
        field_without_name = {"rect": [100, 700, 200, 720], "page": 0}
        field_id = pdf_service._extract_field_id(field_without_name, index=5)
        assert field_id.startswith("field_")

    def test_option_values_extraction(self, pdf_service):
        """Test extraction of option values for selection fields."""
        # Test field with options
        field_with_options = {
            "field_type": "/Btn",
            "options": ["Sí", "No"],
            "export_values": ["1", "0"]
        }
        options = pdf_service._extract_option_values(field_with_options)
        assert options == ["Sí", "No"]
        
        # Test field without options
        text_field = {"field_type": "/Tx"}
        options = pdf_service._extract_option_values(text_field)
        assert options is None

    def test_invalid_pdf_error(self, pdf_service):
        """Test handling of invalid PDF files."""
        with tempfile.NamedTemporaryFile(suffix='.pdf', mode='w') as temp_file:
            temp_file.write("This is not a PDF file")
            temp_file.flush()
            temp_path = Path(temp_file.name)
            
            with pytest.raises(InvalidPDFError):
                pdf_service.analyze_pdf(temp_path)

    def test_file_not_found_error(self, pdf_service):
        """Test handling of non-existent files."""
        non_existent_path = Path("/non/existent/file.pdf")
        
        with pytest.raises(FileNotFoundError):
            pdf_service.analyze_pdf(non_existent_path)

    def test_no_form_fields_error(self, pdf_service):
        """Test handling of PDFs without form fields."""
        with patch('PyPDF2.PdfReader') as mock_reader:
            mock_reader.return_value.get_form_text_fields.return_value = {}
            
            with tempfile.NamedTemporaryFile(suffix='.pdf') as temp_file:
                temp_path = Path(temp_file.name)
                
                with pytest.raises(NoFormFieldsError):
                    pdf_service.analyze_pdf(temp_path)

    def test_memory_management_large_file(self, pdf_service):
        """Test memory management with large files."""
        # This test ensures proper cleanup of resources
        with patch('PyPDF2.PdfReader') as mock_reader:
            with patch('pdfplumber.open') as mock_plumber:
                mock_pdf_reader = Mock()
                mock_plumber_pdf = Mock()
                
                mock_reader.return_value = mock_pdf_reader
                mock_plumber.return_value.__enter__.return_value = mock_plumber_pdf
                
                # Setup minimal return values
                mock_pdf_reader.get_form_text_fields.return_value = {}
                mock_plumber_pdf.pages = []
                
                with tempfile.NamedTemporaryFile(suffix='.pdf') as temp_file:
                    temp_path = Path(temp_file.name)
                    
                    try:
                        pdf_service.analyze_pdf(temp_path)
                    except NoFormFieldsError:
                        pass  # Expected for empty form
                
                # Verify cleanup was called
                mock_plumber.return_value.__exit__.assert_called()

    def test_coordinate_distance_calculation(self, pdf_service):
        """Test coordinate distance calculation for text proximity."""
        field_center = (150, 710)  # Center of field rect [100, 700, 200, 720]
        text_center = (72.5, 710)  # Center of text rect [50, 705, 95, 715]
        
        distance = pdf_service._calculate_distance(field_center, text_center)
        
        # Distance should be approximately 77.5 (150 - 72.5)
        assert abs(distance - 77.5) < 1.0

    def test_multi_page_field_ordering(self, pdf_service):
        """Test field ordering across multiple pages."""
        fields = [
            {"rect": [100, 600, 200, 620], "page": 1, "field_name": "page2_field1"},
            {"rect": [100, 700, 200, 720], "page": 0, "field_name": "page1_field1"},
            {"rect": [100, 650, 200, 670], "page": 1, "field_name": "page2_field2"},
            {"rect": [100, 680, 200, 700], "page": 0, "field_name": "page1_field2"},
        ]
        
        ordered_fields = pdf_service._sort_fields_by_position(fields)
        
        # Should be ordered by page first, then by position
        assert ordered_fields[0]["field_name"] == "page1_field1"  # Page 0, top
        assert ordered_fields[1]["field_name"] == "page1_field2"  # Page 0, bottom
        assert ordered_fields[2]["field_name"] == "page2_field2"  # Page 1, top
        assert ordered_fields[3]["field_name"] == "page2_field1"  # Page 1, bottom


class TestTemplateFieldData:
    """Test cases for TemplateFieldData data class."""

    def test_template_field_data_creation(self):
        """Test creation of TemplateFieldData instance."""
        field_data = TemplateFieldData(
            field_id="A0101",
            type="text",
            near_text="hasta un máximo de",
            value_options=None
        )
        
        assert field_data.field_id == "A0101"
        assert field_data.type == "text"
        assert field_data.near_text == "hasta un máximo de"
        assert field_data.value_options is None

    def test_template_field_data_with_options(self):
        """Test TemplateFieldData with option values."""
        field_data = TemplateFieldData(
            field_id="B0201",
            type="radiobutton",
            near_text="Seleccione una opción:",
            value_options=["Sí", "No"]
        )
        
        assert field_data.value_options == ["Sí", "No"]
        assert len(field_data.value_options) == 2


class TestPDFProcessingErrors:
    """Test cases for PDF processing error handling."""

    def test_pdf_processing_error(self):
        """Test PDFProcessingError exception."""
        error = PDFProcessingError("Test error message")
        assert str(error) == "Test error message"

    def test_invalid_pdf_error(self):
        """Test InvalidPDFError exception."""
        error = InvalidPDFError("Invalid PDF format")
        assert str(error) == "Invalid PDF format"

    def test_no_form_fields_error(self):
        """Test NoFormFieldsError exception."""
        error = NoFormFieldsError("No form fields found")
        assert str(error) == "No form fields found"
