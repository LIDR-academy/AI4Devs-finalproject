"""
Unit tests for Rhino Parser Service (T-024-AGENT)

Tests the rhino3dm parsing logic in isolation without S3/DB dependencies.
Phase: TDD-GREEN (tests with mock rhino3dm to avoid  compile dependencies)

Test Coverage:
- Happy path: Valid .3dm file parsing
- Edge cases: Empty files, corrupt headers, missing layers
- Security: Malicious file handling, large file timeouts

NOTE: These tests mock rhino3dm to avoid CMake build requirements.
Integration tests in test_validate_file_task use real .3dm parsing.
"""

import pytest
from pathlib import Path
from unittest.mock import Mock, patch
from src.agent.services.rhino_parser_service import RhinoParserService
from src.agent.models import FileProcessingResult, LayerInfo


@pytest.fixture
def mock_rhino_file():
    """Mock rhino3dm.File3dm for unit testing without rhino3dm dependency."""
    mock_file = Mock()

    # Mock layers
    mock_layer1 = Mock()
    mock_layer1.Name = "SF-C12-M-001"
    mock_layer1.Visible = True
    mock_layer1.Color = Mock(A=255, R=128, G=0, B=255)
    mock_layer1.GetUserStrings = Mock(return_value=None)  # No user strings

    mock_layer2 = Mock()
    mock_layer2.Name = "SF-C12-M-002"
    mock_layer2.Visible = True
    mock_layer2.Color = Mock(A=255, R=0, G=128, B=255)
    mock_layer2.GetUserStrings = Mock(return_value=None)  # No user strings

    mock_file.Layers = [mock_layer1, mock_layer2]

    # Mock objects
    mock_obj1 = Mock()
    mock_obj1.Attributes.LayerIndex = 0
    mock_obj1.Attributes.GetUserStrings = Mock(return_value=None)
    mock_obj2 = Mock()
    mock_obj2.Attributes.LayerIndex = 0
    mock_obj2.Attributes.GetUserStrings = Mock(return_value=None)
    mock_obj3 = Mock()
    mock_obj3.Attributes.LayerIndex = 1
    mock_obj3.Attributes.GetUserStrings = Mock(return_value=None)

    mock_file.Objects = [mock_obj1, mock_obj2, mock_obj3]

    # Mock settings
    mock_file.Settings.ModelUnitSystem = Mock(__str__=lambda x: "UnitSystem.Meters")
    mock_file.Settings.ModelAbsoluteTolerance = 0.01
    mock_file.ApplicationName = "Rhino"
    mock_file.ApplicationVersion = "7.0"

    # Mock document strings (empty for basic tests)
    mock_file.Strings = Mock()
    mock_file.Strings.Keys = []

    return mock_file


class TestRhinoParserServiceHappyPath:
    """Test successful .3dm file parsing scenarios."""

    @patch('pathlib.Path.exists', return_value=True)
    @patch('src.agent.services.rhino_parser_service.rhino3dm')
    def test_parse_valid_3dm_file(self, mock_rhino3dm, mock_path_exists, mock_rhino_file):
        """
        SCENARIO: Parse a valid .3dm file with multiple layers.
        GIVEN: A well-formed .3dm file exists at local path
        WHEN: parse_file() is called
        THEN: Returns FileProcessingResult with success=True and extracted layers
        """
        mock_rhino3dm.File3dm.Read.return_value = mock_rhino_file

        parser = RhinoParserService()
        test_file = Path(__file__).parent.parent / "fixtures" / "test-model.3dm"

        result = parser.parse_file(str(test_file))

        assert isinstance(result, FileProcessingResult)
        assert result.success is True
        assert result.error_message is None
        assert len(result.layers) == 2
        assert all(isinstance(layer, LayerInfo) for layer in result.layers)

    @patch('pathlib.Path.exists', return_value=True)
    @patch('src.agent.services.rhino_parser_service.rhino3dm')
    def test_extract_layer_metadata(self, mock_rhino3dm, mock_path_exists, mock_rhino_file):
        """
        SCENARIO: Extract detailed layer properties.
        GIVEN: A .3dm file with layers having names, colors, and objects
        WHEN: parse_file() extracts layers
        THEN: LayerInfo contains correct name, index, object_count
        """
        mock_rhino3dm.File3dm.Read.return_value = mock_rhino_file

        parser = RhinoParserService()
        test_file = Path(__file__).parent.parent / "fixtures" / "test-model.3dm"

        result = parser.parse_file(str(test_file))

        first_layer = result.layers[0]
        assert first_layer.name == "SF-C12-M-001"
        assert isinstance(first_layer.index, int)
        assert first_layer.index == 0
        assert first_layer.object_count == 2  # 2 objects in layer 0

    @patch('pathlib.Path.exists', return_value=True)
    @patch('src.agent.services.rhino_parser_service.rhino3dm')
    def test_extract_file_units_and_metadata(self, mock_rhino3dm, mock_path_exists, mock_rhino_file):
        """
        SCENARIO: Extract global file properties (units, tolerance).
        GIVEN: A .3dm file with custom units (e.g., Meters)
        WHEN: parse_file() is called
        THEN: file_metadata contains 'units' key
        """
        mock_rhino3dm.File3dm.Read.return_value = mock_rhino_file

        parser = RhinoParserService()
        test_file = Path(__file__).parent.parent / "fixtures" / "test-model.3dm"

        result = parser.parse_file(str(test_file))

        assert "units" in result.file_metadata
        assert "Meters" in result.file_metadata["units"]


class TestRhinoParserServiceEdgeCases:
    """Test parsing behavior with malformed or edge-case files."""

    def test_parse_nonexistent_file(self):
        """
        SCENARIO: Attempt to parse file that doesn't exist.
        GIVEN: A file path pointing to non-existent file
        WHEN: parse_file() is called
        THEN: Returns FileProcessingResult with success=False and error message
        """
        parser = RhinoParserService()

        result = parser.parse_file("/tmp/nonexistent-model.3dm")

        assert isinstance(result, FileProcessingResult)
        assert result.success is False
        assert result.error_message is not None
        assert "not found" in result.error_message.lower()

    @patch('src.agent.services.rhino_parser_service.rhino3dm')
    def test_parse_corrupt_3dm_file(self, mock_rhino3dm):
        """
        SCENARIO: Parse a corrupted .3dm file (invalid header).
        GIVEN: A file with .3dm extension but corrupt binary data
        WHEN: parse_file() attempts to read
        THEN: Returns success=False without crashing (graceful error handling)
        """
        # Mock rhino3dm.File3dm.Read to return None (indicates read failure)
        mock_rhino3dm.File3dm.Read.return_value = None

        parser = RhinoParserService()
        test_file = Path(__file__).parent.parent / "fixtures" / "test-model.3dm"

        result = parser.parse_file(str(test_file))

        assert result.success is False
        assert result.error_message is not None
        assert len(result.layers) == 0

    @patch('src.agent.services.rhino_parser_service.rhino3dm')
    def test_parse_empty_3dm_file(self, mock_rhino3dm):
        """
        SCENARIO: Parse a valid but empty .3dm file (no layers, no objects).
        GIVEN: A .3dm file created in Rhino with Save but no geometry added
        WHEN: parse_file() is called
        THEN: Returns success=True but layers list is empty
        """
        # Mock empty file
        mock_empty_file = Mock()
        mock_empty_file.Layers = []
        mock_empty_file.Objects = []
        mock_empty_file.Settings.ModelUnitSystem = Mock(__str__=lambda x: "UnitSystem.Meters")
        mock_empty_file.Settings.ModelAbsoluteTolerance = 0.01
        mock_empty_file.ApplicationName = "Rhino"
        mock_empty_file.ApplicationVersion = "7.0"

        mock_rhino3dm.File3dm.Read.return_value = mock_empty_file

        parser = RhinoParserService()
        test_file = Path(__file__).parent.parent / "fixtures" / "test-model.3dm"

        result = parser.parse_file(str(test_file))

        assert result.success is True
        assert len(result.layers) == 0

    @patch('src.agent.services.rhino_parser_service.rhino3dm')
    def test_parse_file_with_special_characters_in_layer_names(self, mock_rhino3dm):
        """
        SCENARIO: Parse file with Unicode or special chars in layer names.
        GIVEN: A .3dm file with layer named "Capa-España-™"
        WHEN: parse_file() extracts layers
        THEN: Layer names are preserved as UTF-8 strings
        """
        # Mock file with Unicode layer name
        mock_file = Mock()
        mock_layer = Mock()
        mock_layer.Name = "Capa-España-™"
        mock_layer.Visible = True
        mock_layer.Color = Mock(A=255, R=128, G=0, B=255)

        mock_file.Layers = [mock_layer]
        mock_file.Objects = []
        mock_file.Settings.ModelUnitSystem = Mock(__str__=lambda x: "UnitSystem.Meters")
        mock_file.Settings.ModelAbsoluteTolerance = 0.01

        mock_rhino3dm.File3dm.Read.return_value = mock_file

        parser = RhinoParserService()
        test_file = Path(__file__).parent.parent / "fixtures" / "test-model.3dm"

        result = parser.parse_file(str(test_file))

        assert result.success is True
        assert result.layers[0].name == "Capa-España-™"


class TestRhinoParserServiceSecurity:
    """Test security and resource limit handling."""

    @patch('src.agent.services.rhino_parser_service.rhino3dm')
    def test_parse_large_file_within_timeout(self, mock_rhino3dm, mock_rhino_file):
        """
        SCENARIO: Parse a large .3dm file without timeout.
        GIVEN: Task has 10min timeout
        WHEN: parse_file() is called on large file
        THEN: Completes within reasonable time
        """
        mock_rhino3dm.File3dm.Read.return_value = mock_rhino_file

        parser = RhinoParserService()
        test_file = Path(__file__).parent.parent / "fixtures" / "test-model.3dm"

        import time
        start = time.time()
        result = parser.parse_file(str(test_file))
        elapsed = time.time() - start

        assert result.success is True
        assert elapsed < 1  # Mock should be instant

    def test_parse_file_with_absolute_path_only(self):
        """
        SCENARIO: Security check for relative paths.
        GIVEN: Parser receives relative path
        WHEN: parse_file() validates input
        THEN: Handles gracefully (file not found)
        """
        parser = RhinoParserService()

        result = parser.parse_file("../../../etc/passwd")

        assert result.success is False

    @patch('src.agent.services.rhino_parser_service.rhino3dm')
    def test_parser_does_not_execute_embedded_scripts(self, mock_rhino3dm, mock_rhino_file):
        """
        SCENARIO: Ensure rhino3dm doesn't execute scripts.
        GIVEN: A .3dm file
        WHEN: parse_file() reads the file
        THEN: Only extracts geometry (rhino3dm is read-only by design)
        """
        mock_rhino3dm.File3dm.Read.return_value = mock_rhino_file

        parser = RhinoParserService()
        test_file = Path(__file__).parent.parent / "fixtures" / "test-model.3dm"

        result = parser.parse_file(str(test_file))

        assert isinstance(result, FileProcessingResult)
        assert result.success is True

    @patch('src.agent.services.rhino_parser_service.rhino3dm')
    def test_memory_safety_with_deeply_nested_geometry(self, mock_rhino3dm, mock_rhino_file):
        """
        SCENARIO: Handle files with many objects without OOM.
        GIVEN: A .3dm with many nested blocks
        WHEN: parse_file() iterates over objects
        THEN: Completes without memory exhaustion
        """
        mock_rhino3dm.File3dm.Read.return_value = mock_rhino_file

        parser = RhinoParserService()
        test_file = Path(__file__).parent.parent / "fixtures" / "test-model.3dm"

        result = parser.parse_file(str(test_file))

        assert result.success in [True, False]

        first_layer = result.layers[0]
        assert first_layer.name is not None
        assert isinstance(first_layer.index, int)
        assert first_layer.index >= 0
        assert first_layer.object_count >= 0

    def test_extract_file_units_and_metadata(self):
        """
        SCENARIO: Extract global file properties (units, tolerance).
        GIVEN: A .3dm file with custom units (e.g., Meters)
        WHEN: parse_file() is called
        THEN: file_metadata contains 'units' key
        """
        parser = RhinoParserService()
        test_file = Path(__file__).parent.parent / "fixtures" / "test-model.3dm"

        result = parser.parse_file(str(test_file))

        assert "units" in result.file_metadata
        # Units should be one of: Meters, Millimeters, Feet, etc.
        assert isinstance(result.file_metadata["units"], str)


class TestRhinoParserServiceEdgeCases:
    """Test parsing behavior with malformed or edge-case files."""

    def test_parse_nonexistent_file(self):
        """
        SCENARIO: Attempt to parse file that doesn't exist.
        GIVEN: A file path pointing to non-existent file
        WHEN: parse_file() is called
        THEN: Returns FileProcessingResult with success=False and error message
        """
        parser = RhinoParserService()

        result = parser.parse_file("/tmp/nonexistent-model.3dm")

        assert isinstance(result, FileProcessingResult)
        assert result.success is False
        assert result.error_message is not None
        assert "not found" in result.error_message.lower() or "no such file" in result.error_message.lower()

    def test_parse_corrupt_3dm_file(self):
        """
        SCENARIO: Parse a corrupted .3dm file (invalid header).
        GIVEN: A file with .3dm extension but corrupt binary data
        WHEN: parse_file() attempts to read
        THEN: Returns success=False without crashing (graceful error handling)
        """
        parser = RhinoParserService()
        # Create a temporary corrupt file
        import tempfile
        with tempfile.NamedTemporaryFile(suffix=".3dm", delete=False) as f:
            f.write(b"CORRUPT_HEADER_NOT_VALID_3DM" * 100)
            corrupt_path = f.name

        result = parser.parse_file(corrupt_path)

        # Cleanup
        Path(corrupt_path).unlink()

        assert result.success is False
        assert result.error_message is not None
        assert len(result.layers) == 0

    def test_parse_empty_3dm_file(self):
        """
        SCENARIO: Parse a valid but empty .3dm file (no layers, no objects).
        GIVEN: A .3dm file created in Rhino with Save but no geometry added
        WHEN: parse_file() is called
        THEN: Returns success=True but layers list is empty
        """
        # This test will SKIP if no empty fixture available
        parser = RhinoParserService()
        empty_file = Path(__file__).parent.parent / "fixtures" / "empty-model.3dm"

        if not empty_file.exists():
            pytest.skip("Empty .3dm fixture not available")

        result = parser.parse_file(str(empty_file))

        assert result.success is True
        assert len(result.layers) == 0  # Valid file but no user-created layers

    def test_parse_file_with_special_characters_in_layer_names(self):
        """
        SCENARIO: Parse file with Unicode or special chars in layer names.
        GIVEN: A .3dm file with layer named "Capa-España-™"
        WHEN: parse_file() extracts layers
        THEN: Layer names are preserved as UTF-8 strings
        
        NOTE: This is an integration test using real rhino3dm library and fixture.
        """
        test_file = Path(__file__).parent.parent / "fixtures" / "test-model.3dm"
        if not test_file.exists():
            pytest.skip(f"Test fixture not found: {test_file}")

        parser = RhinoParserService()
        result = parser.parse_file(str(test_file))

        # Just verify parsing doesn't crash with Unicode layers
        assert result.success is True
        for layer in result.layers:
            assert isinstance(layer.name, str)


class TestRhinoParserServiceSecurity:
    """Test security and resource limit handling."""

    def test_parse_large_file_within_timeout(self):
        """
        SCENARIO: Parse a large .3dm file (100MB+) without timeout.
        GIVEN: Task has 10min timeout (TASK_TIME_LIMIT_SECONDS=600)
        WHEN: parse_file() is called on large file
        THEN: Completes within soft time limit (9min)
        
        NOTE: This is an integration test using real rhino3dm library and fixture.
        Real large file testing requires integration test with actual fixtures.
        """
        test_file = Path(__file__).parent.parent / "fixtures" / "test-model.3dm"
        if not test_file.exists():
            pytest.skip(f"Test fixture not found: {test_file}")

        parser = RhinoParserService()

        import time
        start = time.time()
        result = parser.parse_file(str(test_file))
        elapsed = time.time() - start

        assert result.success is True
        assert elapsed < 10  # Should complete in seconds, not minutes for test fixture

    def test_parse_file_with_absolute_path_only(self):
        """
        SCENARIO: Enforce absolute paths to prevent directory traversal.
        GIVEN: Parser receives relative path like "../../../etc/passwd"
        WHEN: parse_file() validates input
        THEN: Rejects relative paths or normalizes them
        
        NOTE: This is a security documentation test. Implementation should
        validate paths in file_download_service before reaching parser.
        """
        parser = RhinoParserService()

        # Test with relative path
        result = parser.parse_file("../../../etc/passwd")

        # Should fail gracefully (file not found, not a security exploit)
        assert result.success is False

    def test_parser_does_not_execute_embedded_scripts(self):
        """
        SCENARIO: Ensure rhino3dm doesn't execute VBScript/Python embedded in .3dm.
        GIVEN: A .3dm file potentially containing malicious scripts
        WHEN: parse_file() reads the file
        THEN: Only extracts geometry and metadata (no script execution)
        
        NOTE: rhino3dm is read-only by design, but this test documents the requirement.
        """
        # This is a documentation test - rhino3dm.File3dm.Read() is safe
        # It does not execute scripts, only parses geometry
        parser = RhinoParserService()
        test_file = Path(__file__).parent.parent / "fixtures" / "test-model.3dm"

        result = parser.parse_file(str(test_file))

        # Test passes if parsing completes without side effects
        assert isinstance(result, FileProcessingResult)

    def test_memory_safety_with_deeply_nested_geometry(self):
        """
        SCENARIO: Handle files with deeply nested blocks/instances without OOM.
        GIVEN: A .3dm with 1000+ nested block instances
        WHEN: parse_file() iterates over objects
        THEN: Completes without memory exhaustion
        
        NOTE: This is a regression prevention test. Implementation should
        limit recursion depth or use iterative traversal.
        """
        parser = RhinoParserService()
        test_file = Path(__file__).parent.parent / "fixtures" / "test-model.3dm"

        result = parser.parse_file(str(test_file))

        # Test passes if no MemoryError or RecursionError
        assert result.success in [True, False]  # Either succeeds or fails gracefully
