"""
Integration test: User Strings extraction E2E flow

Verifies the complete workflow:
  .3dm file → RhinoParserService → UserStringExtractor → FileProcessingResult
  
This test validates that user strings are properly extracted and structured
in the FileProcessingResult model for both document, layer, and object levels.
"""

from unittest.mock import Mock, MagicMock, patch
from src.agent.services.rhino_parser_service import RhinoParserService


class TestUserStringsE2E:
    """Integration tests for user string extraction workflow."""

    def test_rhino_parser_extracts_user_strings_successfully(self):
        """
        GIVEN a .3dm file with embedded user strings
        WHEN RhinoParserService.parse_file() is called
        THEN FileProcessingResult should contain structured user_strings
        """
        # Mock rhino3dm model with user strings at all levels
        mock_model = MagicMock()

        # Document-level user strings
        mock_model.Strings = MagicMock()
        mock_model.Strings.Keys = ["ProjectID", "Architect", "Phase"]
        mock_model.Strings.__getitem__ = lambda self, key: {
            "ProjectID": "SF-2026",
            "Architect": "Antoni Gaudí",
            "Phase": "Construction"
        }[key]

        # Layer with user strings
        mock_layer = MagicMock()
        mock_layer.Name = "Columns"
        mock_layer.Visible = True
        mock_layer.Color = (255, 200, 100, 50)  # RGBA tuple

        layer_strings = MagicMock()
        layer_strings.Keys = ["Material", "LoadCapacity"]
        layer_strings.__getitem__ = lambda self, key: {
            "Material": "Reinforced Concrete",
            "LoadCapacity": "500kN"
        }[key]
        mock_layer.GetUserStrings = Mock(return_value=layer_strings)

        mock_model.Layers = [mock_layer]

        # Object with user strings
        mock_obj = MagicMock()
        mock_obj.Attributes.LayerIndex = 0
        mock_obj.Attributes.Id = "00000000-0000-0000-0000-000000000001"

        obj_strings = MagicMock()
        obj_strings.Keys = ["PartNumber", "Supplier"]
        obj_strings.__getitem__ = lambda self, key: {
            "PartNumber": "COL-001",
            "Supplier": "Concrete Works Ltd"
        }[key]
        mock_obj.Attributes.GetUserStrings = Mock(return_value=obj_strings)

        mock_model.Objects = [mock_obj]

        # Model settings
        mock_model.Settings.ModelUnitSystem = MagicMock(__str__=lambda x: "UnitSystem.Millimeters")
        mock_model.Settings.ModelAbsoluteTolerance = 0.01
        mock_model.ApplicationName = "Rhinoceros"
        mock_model.ApplicationVersion = "7.0"

        # Mock rhino3dm.File3dm.Read to return our mock_model
        # Also mock Path.exists to avoid file existence check
        with patch("rhino3dm.File3dm.Read", return_value=mock_model), \
             patch("pathlib.Path.exists", return_value=True):
            service = RhinoParserService()
            result = service.parse_file("/fake/path/test.3dm")

        # Assertions
        assert result.success is True
        assert result.error_message is None
        assert result.user_strings is not None

        # Document-level user strings
        assert result.user_strings["document"] == {
            "ProjectID": "SF-2026",
            "Architect": "Antoni Gaudí",
            "Phase": "Construction"
        }

        # Layer-level user strings
        assert "Columns" in result.user_strings["layers"]
        assert result.user_strings["layers"]["Columns"] == {
            "Material": "Reinforced Concrete",
            "LoadCapacity": "500kN"
        }

        # Object-level user strings
        assert "00000000-0000-0000-0000-000000000001" in result.user_strings["objects"]
        assert result.user_strings["objects"]["00000000-0000-0000-0000-000000000001"] == {
            "PartNumber": "COL-001",
            "Supplier": "Concrete Works Ltd"
        }

    def test_rhino_parser_handles_no_user_strings_gracefully(self):
        """
        GIVEN a .3dm file WITHOUT user strings
        WHEN RhinoParserService.parse_file() is called
        THEN FileProcessingResult should contain empty user_strings structure
        """
        # Mock rhino3dm model without user strings
        mock_model = MagicMock()

        # Empty document strings
        mock_model.Strings = MagicMock()
        mock_model.Strings.Keys = []

        # Layer without user strings
        mock_layer = MagicMock()
        mock_layer.Name = "Default"
        mock_layer.Visible = True
        mock_layer.Color = (255, 255, 255, 255)
        mock_layer.GetUserStrings = Mock(return_value=None)

        mock_model.Layers = [mock_layer]

        # Object without user strings
        mock_obj = MagicMock()
        mock_obj.Attributes.LayerIndex = 0
        mock_obj.Attributes.Id = "00000000-0000-0000-0000-000000000002"
        mock_obj.Attributes.GetUserStrings = Mock(return_value=None)

        mock_model.Objects = [mock_obj]

        mock_model.Settings.ModelUnitSystem = MagicMock(__str__=lambda x: "UnitSystem.Meters")
        mock_model.Settings.ModelAbsoluteTolerance = 0.001
        mock_model.ApplicationName = "Rhinoceros"
        mock_model.ApplicationVersion = "8.0"

        with patch("rhino3dm.File3dm.Read", return_value=mock_model), \
             patch("pathlib.Path.exists", return_value=True):
            service = RhinoParserService()
            result = service.parse_file("/fake/path/empty.3dm")

        # Assertions
        assert result.success is True
        assert result.user_strings is not None

        # All collections should be empty dicts
        assert result.user_strings["document"] == {}
        assert result.user_strings["layers"] == {}
        assert result.user_strings["objects"] == {}

    def test_rhino_parser_extracts_user_strings_sparse_objects(self):
        """
        GIVEN a .3dm file with objects where only SOME have user strings
        WHEN RhinoParserService.parse_file() is called
        THEN user_strings.objects should only contain objects that have strings (sparse dict)
        """
        mock_model = MagicMock()

        mock_model.Strings = MagicMock()
        mock_model.Strings.Keys = []

        mock_layer = MagicMock()
        mock_layer.Name = "Mixed"
        mock_layer.Visible = True
        mock_layer.Color = (255, 0, 0, 0)
        mock_layer.GetUserStrings = Mock(return_value=None)

        mock_model.Layers = [mock_layer]

        # Object 1: HAS user strings
        mock_obj1 = MagicMock()
        mock_obj1.Attributes.LayerIndex = 0
        mock_obj1.Attributes.Id = "11111111-1111-1111-1111-111111111111"

        obj1_strings = MagicMock()
        obj1_strings.Keys = ["Type"]
        obj1_strings.__getitem__ = lambda self, key: "Column"
        mock_obj1.Attributes.GetUserStrings = Mock(return_value=obj1_strings)

        # Object 2: NO user strings
        mock_obj2 = MagicMock()
        mock_obj2.Attributes.LayerIndex = 0
        mock_obj2.Attributes.Id = "22222222-2222-2222-2222-222222222222"
        mock_obj2.Attributes.GetUserStrings = Mock(return_value=None)

        # Object 3: HAS user strings
        mock_obj3 = MagicMock()
        mock_obj3.Attributes.LayerIndex = 0
        mock_obj3.Attributes.Id = "33333333-3333-3333-3333-333333333333"

        obj3_strings = MagicMock()
        obj3_strings.Keys = ["Status"]
        obj3_strings.__getitem__ = lambda self, key: "Approved"
        mock_obj3.Attributes.GetUserStrings = Mock(return_value=obj3_strings)

        mock_model.Objects = [mock_obj1, mock_obj2, mock_obj3]

        mock_model.Settings.ModelUnitSystem = MagicMock(__str__=lambda x: "UnitSystem.Meters")
        mock_model.Settings.ModelAbsoluteTolerance = 0.001
        mock_model.ApplicationName = "Rhinoceros"
        mock_model.ApplicationVersion = "8.0"

        with patch("rhino3dm.File3dm.Read", return_value=mock_model), \
             patch("pathlib.Path.exists", return_value=True):
            service = RhinoParserService()
            result = service.parse_file("/fake/path/sparse.3dm")

        # Assertions
        assert result.success is True
        assert result.user_strings is not None

        # Only 2 objects should be in the dict (sparse)
        assert len(result.user_strings["objects"]) == 2
        assert "11111111-1111-1111-1111-111111111111" in result.user_strings["objects"]
        assert "33333333-3333-3333-3333-333333333333" in result.user_strings["objects"]

        # Object 2 should NOT be in the dict
        assert "22222222-2222-2222-2222-222222222222" not in result.user_strings["objects"]

        assert result.user_strings["objects"]["11111111-1111-1111-1111-111111111111"]["Type"] == "Column"
        assert result.user_strings["objects"]["33333333-3333-3333-3333-333333333333"]["Status"] == "Approved"
