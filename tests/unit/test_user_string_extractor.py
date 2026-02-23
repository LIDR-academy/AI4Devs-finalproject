"""
Unit tests for UserStringExtractor service.

Tests the extraction of user strings from Rhino .3dm models
at document, layer, and object levels.
"""

import pytest
from unittest.mock import Mock, MagicMock

# Import service to test
try:
    from services.user_string_extractor import UserStringExtractor
except ModuleNotFoundError:
    from src.agent.services.user_string_extractor import UserStringExtractor

# Import models
try:
    from models import UserStringCollection
except ModuleNotFoundError:
    from src.agent.models import UserStringCollection


class TestUserStringExtractor:
    """Test suite for UserStringExtractor service."""

    @pytest.fixture
    def extractor(self):
        """Create UserStringExtractor instance."""
        return UserStringExtractor()

    # ========================================
    # HAPPY PATH TESTS
    # ========================================

    def test_extract_document_user_strings(self, extractor):
        """
        Test 1: Extract document user strings.
        
        Given: rhino3dm model with document.Strings containing key-value pairs
        When: extract() is called
        Then: collection.document contains all key-value pairs
        """
        # Arrange: Mock rhino3dm model with document strings
        mock_model = Mock()
        mock_strings = MagicMock()

        # Simulate NameValueDictionary with Keys property
        mock_strings.Keys = ["Project", "RevisionDate", "BIM_Manager"]
        mock_strings.__getitem__ = Mock(side_effect=lambda k: {
            "Project": "SF-Sagrada-Familia",
            "RevisionDate": "2026-01-15",
            "BIM_Manager": "Pedro Cortés"
        }[k])

        mock_model.Strings = mock_strings
        mock_model.Layers = []
        mock_model.Objects = []

        # Act
        result = extractor.extract(mock_model)

        # Assert
        assert isinstance(result, UserStringCollection)
        assert result.document == {
            "Project": "SF-Sagrada-Familia",
            "RevisionDate": "2026-01-15",
            "BIM_Manager": "Pedro Cortés"
        }
        assert result.layers == {}
        assert result.objects == {}

    def test_extract_layer_user_strings(self, extractor):
        """
        Test 2: Extract layer user strings.
        
        Given: Model with 2 layers, each having GetUserStrings() returning distinct pairs
        When: extract() is called
        Then: collection.layers contains dict keyed by layer name with correct strings
        """
        # Arrange: Mock model with layers
        mock_model = Mock()
        mock_model.Strings = Mock(Keys=[])
        mock_model.Objects = []

        # Create 2 layers with user strings
        layer1 = Mock()
        layer1.Name = "SF-C12-M-001"
        layer1_strings = MagicMock()
        layer1_strings.Keys = ["Workshop", "MaterialType"]
        layer1_strings.__getitem__ = Mock(side_effect=lambda k: {
            "Workshop": "Granollers",
            "MaterialType": "UHPC"
        }[k])
        layer1.GetUserStrings = Mock(return_value=layer1_strings)

        layer2 = Mock()
        layer2.Name = "SF-C12-M-002"
        layer2_strings = MagicMock()
        layer2_strings.Keys = ["Workshop", "MaterialType"]
        layer2_strings.__getitem__ = Mock(side_effect=lambda k: {
            "Workshop": "Barcelona",
            "MaterialType": "Concrete"
        }[k])
        layer2.GetUserStrings = Mock(return_value=layer2_strings)

        mock_model.Layers = [layer1, layer2]

        # Act
        result = extractor.extract(mock_model)

        # Assert
        assert isinstance(result, UserStringCollection)
        assert result.document == {}
        assert len(result.layers) == 2
        assert result.layers["SF-C12-M-001"] == {
            "Workshop": "Granollers",
            "MaterialType": "UHPC"
        }
        assert result.layers["SF-C12-M-002"] == {
            "Workshop": "Barcelona",
            "MaterialType": "Concrete"
        }
        assert result.objects == {}

    def test_extract_object_user_strings(self, extractor):
        """
        Test 3: Extract object user strings.
        
        Given: Model with 3 objects having user strings (ISO_Code, Mass, Notes)
        When: extract() is called
        Then: collection.objects contains dict keyed by object UUID with all strings
        """
        # Arrange: Mock model with objects
        mock_model = Mock()
        mock_model.Strings = Mock(Keys=[])
        mock_model.Layers = []

        # Create 3 objects with user strings
        obj1 = Mock()
        obj1_attrs = Mock()
        obj1_attrs.Id = "3f2504e0-4f89-11d3-9a0c-0305e82c3301"
        obj1_strings = MagicMock()
        obj1_strings.Keys = ["ISO_Code", "Mass", "ManufacturingNotes"]
        obj1_strings.__getitem__ = Mock(side_effect=lambda k: {
            "ISO_Code": "SF-C12-M-001",
            "Mass": "450kg",
            "ManufacturingNotes": "Pre-stress required"
        }[k])
        obj1_attrs.GetUserStrings = Mock(return_value=obj1_strings)
        obj1.Attributes = obj1_attrs

        obj2 = Mock()
        obj2_attrs = Mock()
        obj2_attrs.Id = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
        obj2_strings = MagicMock()
        obj2_strings.Keys = ["ISO_Code", "Mass"]
        obj2_strings.__getitem__ = Mock(side_effect=lambda k: {
            "ISO_Code": "SF-C12-M-002",
            "Mass": "380kg"
        }[k])
        obj2_attrs.GetUserStrings = Mock(return_value=obj2_strings)
        obj2.Attributes = obj2_attrs

        obj3 = Mock()
        obj3_attrs = Mock()
        obj3_attrs.Id = "6ba7b814-9dad-11d1-80b4-00c04fd430c8"
        obj3_strings = MagicMock()
        obj3_strings.Keys = ["ISO_Code"]
        obj3_strings.__getitem__ = Mock(side_effect=lambda k: {"ISO_Code": "SF-C12-M-003"}[k])
        obj3_attrs.GetUserStrings = Mock(return_value=obj3_strings)
        obj3.Attributes = obj3_attrs

        mock_model.Objects = [obj1, obj2, obj3]

        # Act
        result = extractor.extract(mock_model)

        # Assert
        assert isinstance(result, UserStringCollection)
        assert result.document == {}
        assert result.layers == {}
        assert len(result.objects) == 3
        assert result.objects["3f2504e0-4f89-11d3-9a0c-0305e82c3301"] == {
            "ISO_Code": "SF-C12-M-001",
            "Mass": "450kg",
            "ManufacturingNotes": "Pre-stress required"
        }
        assert result.objects["6ba7b810-9dad-11d1-80b4-00c04fd430c8"] == {
            "ISO_Code": "SF-C12-M-002",
            "Mass": "380kg"
        }
        assert result.objects["6ba7b814-9dad-11d1-80b4-00c04fd430c8"] == {
            "ISO_Code": "SF-C12-M-003"
        }

    # ========================================
    # EDGE CASES
    # ========================================

    def test_empty_document_user_strings(self, extractor):
        """
        Test 4: Empty user strings (document).
        
        Given: Document with NO user strings (Strings collection empty)
        When: extract() is called
        Then: collection.document is empty dict (not None, not error)
        """
        # Arrange
        mock_model = Mock()
        mock_model.Strings = Mock(Keys=[])
        mock_model.Layers = []
        mock_model.Objects = []

        # Act
        result = extractor.extract(mock_model)

        # Assert
        assert isinstance(result, UserStringCollection)
        assert result.document == {}
        assert result.layers == {}
        assert result.objects == {}

    def test_layer_without_user_strings(self, extractor):
        """
        Test 5: Layer without user strings.
        
        Given: Model with layers but NO layer.GetUserStrings() available
        When: extract() is called
        Then: collection.layers is empty dict (graceful handling)
        """
        # Arrange
        mock_model = Mock()
        mock_model.Strings = Mock(Keys=[])
        mock_model.Objects = []

        # Layer with GetUserStrings() returning None
        layer1 = Mock()
        layer1.Name = "Layer01"
        layer1.GetUserStrings = Mock(return_value=None)

        # Layer with GetUserStrings() returning empty
        layer2 = Mock()
        layer2.Name = "Layer02"
        layer2_strings = Mock(Keys=[])
        layer2.GetUserStrings = Mock(return_value=layer2_strings)

        mock_model.Layers = [layer1, layer2]

        # Act
        result = extractor.extract(mock_model)

        # Assert
        assert isinstance(result, UserStringCollection)
        assert result.layers == {}

    def test_mixed_objects_some_have_strings(self, extractor):
        """
        Test 6: Mixed scenario (some objects have strings, some don't).
        
        Given: 5 objects, only 2 have user strings
        When: extract() is called
        Then: collection.objects contains only those 2 UUIDs (sparse dict)
        """
        # Arrange
        mock_model = Mock()
        mock_model.Strings = Mock(Keys=[])
        mock_model.Layers = []

        # Object WITH user strings
        obj1 = Mock()
        obj1_attrs = Mock()
        obj1_attrs.Id = "uuid-with-strings-1"
        obj1_strings = Mock(Keys=["ISO_Code"])
        obj1_strings.__getitem__ = Mock(return_value="SF-001")
        obj1_attrs.GetUserStrings = Mock(return_value=obj1_strings)
        obj1.Attributes = obj1_attrs

        # Object WITHOUT user strings (returns None)
        obj2 = Mock()
        obj2_attrs = Mock()
        obj2_attrs.Id = "uuid-without-strings-1"
        obj2_attrs.GetUserStrings = Mock(return_value=None)
        obj2.Attributes = obj2_attrs

        # Object WITH user strings
        obj3 = Mock()
        obj3_attrs = Mock()
        obj3_attrs.Id = "uuid-with-strings-2"
        obj3_strings = Mock(Keys=["ISO_Code"])
        obj3_strings.__getitem__ = Mock(return_value="SF-002")
        obj3_attrs.GetUserStrings = Mock(return_value=obj3_strings)
        obj3.Attributes = obj3_attrs

        # Object WITHOUT user strings (empty Keys)
        obj4 = Mock()
        obj4_attrs = Mock()
        obj4_attrs.Id = "uuid-without-strings-2"
        obj4_strings = Mock(Keys=[])
        obj4_attrs.GetUserStrings = Mock(return_value=obj4_strings)
        obj4.Attributes = obj4_attrs

        # Object WITHOUT user strings (None)
        obj5 = Mock()
        obj5_attrs = Mock()
        obj5_attrs.Id = "uuid-without-strings-3"
        obj5_attrs.GetUserStrings = Mock(return_value=None)
        obj5.Attributes = obj5_attrs

        mock_model.Objects = [obj1, obj2, obj3, obj4, obj5]

        # Act
        result = extractor.extract(mock_model)

        # Assert
        assert isinstance(result, UserStringCollection)
        assert len(result.objects) == 2
        assert "uuid-with-strings-1" in result.objects
        assert "uuid-with-strings-2" in result.objects
        assert result.objects["uuid-with-strings-1"] == {"ISO_Code": "SF-001"}
        assert result.objects["uuid-with-strings-2"] == {"ISO_Code": "SF-002"}

    # ========================================
    # ERROR HANDLING
    # ========================================

    def test_invalid_model_none(self, extractor):
        """
        Test 7: Invalid model (None).
        
        Given: model = None
        When: extract() is called
        Then: Returns empty UserStringCollection (no exception raised)
        """
        # Act
        result = extractor.extract(None)

        # Assert
        assert isinstance(result, UserStringCollection)
        assert result.document == {}
        assert result.layers == {}
        assert result.objects == {}

    def test_api_exception_getuserstrings_fails(self, extractor):
        """
        Test 8: API exceptions (GetUserStrings fails).
        
        Given: layer.GetUserStrings() raises AttributeError
        When: extract() is called
        Then: Logs warning and continues with other layers (resilient)
        """
        # Arrange
        mock_model = Mock()
        mock_model.Strings = Mock(Keys=[])
        mock_model.Objects = []

        # Layer that raises exception
        bad_layer = Mock()
        bad_layer.Name = "BadLayer"
        bad_layer.GetUserStrings = Mock(side_effect=AttributeError("No GetUserStrings method"))

        # Good layer
        good_layer = Mock()
        good_layer.Name = "GoodLayer"
        good_strings = Mock(Keys=["Key1"])
        good_strings.__getitem__ = Mock(return_value="Value1")
        good_layer.GetUserStrings = Mock(return_value=good_strings)

        mock_model.Layers = [bad_layer, good_layer]

        # Act
        result = extractor.extract(mock_model)

        # Assert - should continue processing despite error
        assert isinstance(result, UserStringCollection)
        assert len(result.layers) == 1
        assert result.layers["GoodLayer"] == {"Key1": "Value1"}
